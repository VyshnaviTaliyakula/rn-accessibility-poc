# React Native accessibility testing

This Expo SDK 58 app uses Continuous Native Generation (CNG). Native projects are
generated from `app.json` and the config plugins, rather than maintained in Git.
The local `ios/` and `android/` folders remain available for Xcode, Android tools,
and debugging, but are ignored by Git.

## Test source files

| Platform | Edit this tracked source | Native audit |
| --- | --- | --- |
| Android | `native-tests/android/AccessibilityTest.kt` | Espresso AccessibilityChecks |
| iOS | `native-tests/ios/AccessibilityUITests.swift` | XCTest performAccessibilityAudit |

The plugins copy these sources into the generated native projects and configure
the required test targets, dependencies, and schemes. Do not maintain separate
test copies inside the native projects: regeneration replaces them.

## Local checks

```sh
npm ci
npm run lint:a11y
npx tsc --noEmit
npm test -- --runInBand
```

For Android, generate the project, start an emulator, and run:

```sh
npx expo prebuild --platform android --clean --no-install
npm run test:android
```

The Android test script starts Metro if needed and configures ADB port forwarding.
For iOS, generate the project and install pods:

```sh
npx expo prebuild --platform ios --clean --no-install
cd ios
pod install
```

Open the generated workspace in Xcode and select the shared `AccessibilityAudit`
scheme, or use the command in `native-tests/ios/README.md`. That scheme tests the
`AccessibilityUITests` target in Release configuration, using bundled JavaScript.

Clean prebuild replaces native projects. Put permanent native changes in app
configuration or config plugins before regenerating.

## GitHub Actions

Pushes and pull requests to `main` run three jobs:

1. ESLint, TypeScript, and Jest component tests.
2. Android native accessibility audits on an Ubuntu emulator.
3. iOS native accessibility audits on a macOS simulator.

Both native jobs regenerate projects from the tracked configuration, then execute
the native audits. They upload test results even when tests fail. Accessibility
findings fail the jobs; the audits do not suppress findings.

Automated audits complement manual TalkBack and VoiceOver checks, including focus
order, announcements, and completing the sign-in flow.
