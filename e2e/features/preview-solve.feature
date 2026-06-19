Feature: Solve the preview puzzle

  Scenario: User solves the preview crossword with the keyboard
    Given the user navigates to the preview page
    When the user clicks the first cell of the puzzle
    And the user types "TISBOWIESWIMSPAPASEXO"
    Then the puzzle should show the completion message
