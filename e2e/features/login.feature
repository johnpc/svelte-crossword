Feature: Login and view user-specific data

  The fake backend accepts the fixture account ada@example.com, so this runs
  everywhere — no real Cognito, no secrets.

  Scenario: User logs in and sees a personalized greeting
    Given the user navigates to the login page
    When the user types their email into the email field
    And the user types their password into the password field
    And the user submits the login form
    Then the user should see a personalized greeting on the home page

  Scenario: A wrong account is rejected with a message
    Given the user navigates to the login page
    When the user types "nobody@example.com" into the email field
    And the user types their password into the password field
    And the user submits the login form
    Then an alert containing "User does not exist" is shown
