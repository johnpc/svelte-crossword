Feature: Solve the preview puzzle

  Scenario: User solves the preview crossword with the keyboard
    Given the user navigates to the preview page
    When the user clicks the first cell of the puzzle
    And the user types "TISBOWIESWIMSPAPASEXO"
    Then the puzzle should show the completion message
    And the toolbar offers Continue instead of History

  Scenario: A solved preview stays solved when the visitor comes back
    Given the user navigates to the preview page
    When the user clicks the first cell of the puzzle
    And the user types "TISBOWIESWIMSPAPASEXO"
    And the user dismisses the completion message
    And the user follows the "Leaderboard" header link
    Then the leaderboard shows "Total users: 1"
    When the user follows the "Home" header link
    Then the preview page is shown
    And every cell shows a letter
    And the toolbar offers Continue instead of History
