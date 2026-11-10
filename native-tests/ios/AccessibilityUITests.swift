import XCTest

final class AccessibilityUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testLoginScreenAccessibility() throws {
        let app = XCUIApplication()
        app.launch()
        let signInButton = app.buttons["Sign in"]
        XCTAssertTrue(signInButton.waitForExistence(timeout: 60), "Login screen did not load")
        XCTAssertTrue(signInButton.isHittable, "Sign in button is not accessible for interaction")
        try app.performAccessibilityAudit()
    }
}
