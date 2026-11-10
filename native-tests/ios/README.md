Edit `AccessibilityUITests.swift` here, rather than the generated `ios/` copy.
The `withIosAccessibilityTests` Expo plugin adds the UI-test target, copies this
source, and creates the shared `AccessibilityAudit` scheme during prebuild.

CI runs this scheme in Release configuration, so JavaScript is bundled into the
app and the test does not require Metro. The audit waits for the sign-in button
and calls Apple's `performAccessibilityAudit()` without suppressing findings.

To run locally after prebuild and CocoaPods installation:

```sh
xcodebuild test \
  -workspace ios/rnaccessibilitypoc.xcworkspace \
  -scheme AccessibilityAudit \
  -configuration Release \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5' \
  -parallel-testing-enabled NO \
  -only-testing:AccessibilityUITests \
  CODE_SIGNING_ALLOWED=NO
```

Choose an available iOS 17 or newer simulator from `xcrun simctl list devices available`.
