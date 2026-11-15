# React Native accessibility testing

## Shared mobile and web screen

Use Node.js 22.19 or newer. Web tool configuration lives in
`jest.web.config.ts`, `playwright.config.ts`, and `lighthouserc.ts`.
Jest uses Node's native TypeScript support and Playwright loads TypeScript
directly. Lighthouse runs through `scripts/run-lighthouse.ts`, which writes
a temporary JSON config for LHCI and removes it after the command exits.
Use `npm run test:web:lighthouse` so this configuration is always loaded.

`App.tsx` renders the same React Native components on iOS, Android, and web.
React Native Web supplies the browser DOM. `useWindowDimensions()` selects a
centred 440px web form at window widths of 768px and above; narrower windows
and native screens use the available width with 24px padding on each side.
The web form supports keyboard submission, announced validation errors with focus recovery,
and a live demo status; native platforms retain the sign-in alert.
`hooks/useWebAccessibility.ts` manages the browser title, document language,
and focus outlines. Its effect checks the platform and document availability
before accessing browser APIs, so it safely skips setup on iOS and Android.
There is a single hook file and no separate native fallback.

Run the web checks locally:

```sh
npm run lint:a11y
npm run typecheck
npm run test:web -- --runInBand --watchman=false
npm run build:web
npm run test:web:e2e
npm run test:web:lighthouse
```

Playwright serves the production export on port 8082, separately from the
development server on 8081. The web GitHub Actions workflow runs these checks
and uploads reports. Browser scans include contrast; JSDOM scans exclude
contrast because JSDOM cannot evaluate it. Manual screen-reader, zoom, and
text-resizing checks are still required. Sign-in is a demo, not authentication.

This Expo SDK 58 repository currently tracks the `ios/` and `android/` native
projects. Native build outputs and caches are ignored by Git. App configuration
and config plugins can regenerate these projects; CI regenerates them before
running the native audits. Keep changes needed after regeneration in app
configuration, plugins, or the tracked `native-tests/` sources as appropriate.

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

Clean prebuild replaces native projects, including tracked native source files.
Review and preserve any native customizations in configuration or config plugins
before running it, and review the resulting Git diff afterward.

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
