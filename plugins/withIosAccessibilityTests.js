const { withXcodeProject } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

const testName = 'AccessibilityUITests';
const schemeName = 'AccessibilityAudit';
const unquote = (value) => value.replace(/^"|"$/g, '');

module.exports = function withIosAccessibilityTests(config) {
  return withXcodeProject(config, async (mod) => {
    const project = mod.modResults;
    const objects = project.hash.project.objects;
    const targets = project.pbxNativeTargetSection();
    const appEntry = Object.entries(targets).find(([, value]) =>
      value.productType && unquote(value.productType) === 'com.apple.product-type.application');
    if (!appEntry) throw new Error('Cannot find the iOS app target for accessibility testing.');
    const [appId, app] = appEntry;
    const appName = unquote(app.name);
    let testEntry = Object.entries(targets).find(([, value]) => value.name && unquote(value.name) === testName);

    if (!testEntry) {
      // node-xcode has no UI-test convenience type; start with its XCTest bundle.
      const originalDependencies = [...app.dependencies];
      const added = project.addTarget(testName, 'unit_test_bundle', testName,
        `${mod.ios.bundleIdentifier}.accessibilitytests`);
      app.dependencies = originalDependencies;
      added.pbxNativeTarget.productType = '"com.apple.product-type.bundle.ui-testing"';
      objects.PBXTargetDependency ||= {};
      objects.PBXContainerItemProxy ||= {};
      project.addTargetDependency(added.uuid, [appId]);
      project.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', added.uuid);
      project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', added.uuid);
      project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', added.uuid);
      const group = project.addPbxGroup([], testName, testName);
      const mainGroup = project.getFirstProject().firstProject.mainGroup;
      objects.PBXGroup[mainGroup].children.push({ value: group.uuid, comment: testName });
      project.addSourceFile('AccessibilityUITests.swift', { target: added.uuid }, group.uuid);
      testEntry = [added.uuid, added.pbxNativeTarget];
    }

    const [testId, testTarget] = testEntry;
    objects.PBXFileReference[testTarget.productReference].path = `${testName}.xctest`;
    const configurations = objects.XCConfigurationList[testTarget.buildConfigurationList].buildConfigurations;
    for (const reference of configurations) {
      const settings = objects.XCBuildConfiguration[reference.value].buildSettings;
      delete settings.INFOPLIST_FILE;
      Object.assign(settings, {
        GENERATE_INFOPLIST_FILE: 'YES',
        SWIFT_VERSION: '5.0',
        IPHONEOS_DEPLOYMENT_TARGET: '17.0',
        SDKROOT: 'iphoneos',
        TARGETED_DEVICE_FAMILY: '"1,2"',
        TEST_TARGET_NAME: `"${appName}"`,
        PRODUCT_BUNDLE_IDENTIFIER: `"${mod.ios.bundleIdentifier}.accessibilitytests"`,
        CODE_SIGN_STYLE: 'Automatic',
      });
    }
    project.addTargetAttribute('TestTargetID', appId, { uuid: testId });

    const iosRoot = mod.modRequest.platformProjectRoot;
    await fs.mkdir(path.join(iosRoot, testName), { recursive: true });
    await fs.copyFile(path.join(mod.modRequest.projectRoot, 'native-tests/ios/AccessibilityUITests.swift'),
      path.join(iosRoot, testName, 'AccessibilityUITests.swift'));

    const reference = (id, name, product) => `<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${id}" BuildableName="${product}" BlueprintName="${name}" ReferencedContainer="container:${appName}.xcodeproj"/>`;
    const appReference = reference(appId, appName, `${appName}.app`);
    const testReference = reference(testId, testName, `${testName}.xctest`);
    const scheme = `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="1600" version="1.3">
  <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES">
    <BuildActionEntries>
      <BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">${appReference}</BuildActionEntry>
      <BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">${testReference}</BuildActionEntry>
    </BuildActionEntries>
  </BuildAction>
  <TestAction buildConfiguration="Release" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.PosixSpawn" shouldUseLaunchSchemeArgsEnv="YES">
    <Testables><TestableReference skipped="NO" parallelizable="NO">${testReference}</TestableReference></Testables>
    <MacroExpansion>${appReference}</MacroExpansion>
  </TestAction>
  <LaunchAction buildConfiguration="Release" selectedDebuggerIdentifier="" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.PosixSpawn" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" allowLocationSimulation="YES">
    <BuildableProductRunnable runnableDebuggingMode="0">${appReference}</BuildableProductRunnable>
  </LaunchAction>
</Scheme>
`;
    const schemes = path.join(iosRoot, `${appName}.xcodeproj/xcshareddata/xcschemes`);
    await fs.mkdir(schemes, { recursive: true });
    await fs.writeFile(path.join(schemes, `${schemeName}.xcscheme`), scheme);
    return mod;
  });
};
