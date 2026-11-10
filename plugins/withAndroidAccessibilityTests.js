const { withAppBuildGradle, withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = function withAndroidAccessibilityTests(config) {
  config = withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') {
      throw new Error('Android accessibility tests require a Groovy app/build.gradle.');
    }
    let contents = mod.modResults.contents;
    if (!contents.includes('testInstrumentationRunner')) {
      if (!/defaultConfig\s*\{/.test(contents)) {
        throw new Error('Cannot find Android defaultConfig to configure the test runner.');
      }
      contents = contents.replace(/defaultConfig\s*\{/, '$&\n        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"');
    }
    const dependencies = [
      'androidx.test.espresso:espresso-accessibility:3.7.0',
      'androidx.test.espresso:espresso-core:3.7.0',
      'androidx.test.ext:junit:1.3.0',
    ];
    for (const dependency of dependencies) {
      if (!contents.includes(dependency)) {
        contents += `\ndependencies { androidTestImplementation '${dependency}' }\n`;
      }
    }
    mod.modResults.contents = contents;
    return mod;
  });

  return withDangerousMod(config, ['android', async (mod) => {
    const packageName = mod.android?.package;
    if (!packageName) throw new Error('Set expo.android.package before generating accessibility tests.');
    const source = path.join(mod.modRequest.projectRoot, 'native-tests/android/AccessibilityTest.kt');
    const destination = path.join(mod.modRequest.platformProjectRoot, 'app/src/androidTest/java', ...packageName.split('.'));
    await fs.mkdir(destination, { recursive: true });
    const test = (await fs.readFile(source, 'utf8')).replace(/^package .+$/m, `package ${packageName}`);
    await fs.writeFile(path.join(destination, 'AccessibilityTest.kt'), test);
    return mod;
  }]);
};
