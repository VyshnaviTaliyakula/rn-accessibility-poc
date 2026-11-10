The tracked source for the Espresso tests is `AccessibilityTest.kt` in this directory.
The Expo config plugin copies it into the generated Android project and adds the
instrumentation runner and test dependencies during prebuild.

After editing the tests, run from the repository root:

```sh
npx expo prebuild --platform android --no-install
npm run test:android
```

Connect an Android device or start an emulator first. The test command starts Metro
if needed, configures ADB port forwarding, and runs only the app's instrumentation
tests. CI uses an Ubuntu x86_64 emulator. Test reports are uploaded even on failure.
Do not edit the generated copy under `android/`, since prebuild overwrites it.

The build SDK and emulator API are separate: Expo 58 / React Native 0.88 default
to compile SDK 37 with build tools 37.0.0, while CI runs the tests on an API 36
emulator. Install the compile platform using its exact SDK repository identifier,
`platforms;android-37.0`. `platforms;android-37` does not exist. Installing API 36
alone does not change the generated project's compile SDK.
