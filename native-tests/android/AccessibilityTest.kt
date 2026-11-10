package com.ekshitha.rnaccessibilitypoc

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.ext.junit.rules.ActivityScenarioRule
import android.os.SystemClock
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.NoMatchingViewException
import androidx.test.espresso.accessibility.AccessibilityChecks
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.isRoot
import androidx.test.espresso.matcher.ViewMatchers.withContentDescription
import org.junit.BeforeClass
import org.junit.Test
import org.junit.Rule
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class AccessibilityTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    companion object {
        @JvmStatic
        @BeforeClass
        fun enableAccessibilityChecks() {
            AccessibilityChecks.enable().setRunChecksFromRootView(true)
        }
    }

    @Test
    fun testAccessibility() {
        waitForLoginScreen()
        onView(isRoot()).check(AccessibilityChecks.accessibilityAssertion())
    }

    @Test
    fun testLoginScreenAccessibility() {
        waitForLoginScreen()
        // This is the Pressable's accessible name; its child text is not the click target.
        // Espresso runs the enabled accessibility checks before performing the click.
        onView(withContentDescription("Sign in"))
            .check(matches(isDisplayed()))
            .perform(click())
    }

    private fun waitForLoginScreen() {
        // The activity rule launches native UI before JavaScript finishes rendering.
        val deadline = SystemClock.uptimeMillis() + 60_000
        while (true) {
            try {
                onView(withContentDescription("Sign in")).check(matches(isDisplayed()))
                break
            } catch (error: NoMatchingViewException) {
                if (SystemClock.uptimeMillis() >= deadline) throw error
                SystemClock.sleep(250)
            }
        }
    }
}
