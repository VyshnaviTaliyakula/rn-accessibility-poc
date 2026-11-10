//
//  AccessibilityUITests.swift
//  AccessibilityUITests
//
//  Created by Ekshitha Vyshnavi on 10/11/2026.
//


import XCTest

final class AccessibilityUITests: XCTestCase {

    func testLoginScreenAccessibility() throws {
        let app = XCUIApplication()
        app.launch()

        // Wait for React Native screen to load
        let signInButton = app.buttons["Sign in"]

        XCTAssertTrue(
            signInButton.waitForExistence(timeout: 30),
            "Login screen did not load"
        )

        // Apple's native accessibility audit
        try app.performAccessibilityAudit()
    }
}
