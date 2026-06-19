Feature: Login and view user-specific data

  @requires-credentials
  Scenario: User logs in and sees a personalized greeting
    Given the user navigates to the login page
    When the user types their email into the email field
    And the user types their password into the password field
    And the user submits the login form
    Then the user should see a personalized greeting on the home page
