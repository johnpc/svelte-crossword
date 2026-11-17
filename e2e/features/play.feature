Feature: Play puzzles while signed in

  Background:
    Given the user is signed in as the fixture account
    And the user navigates to the home page

  Scenario: The newest unplayed puzzle is served with its title and the timer running
    Then the puzzle "Preview Mini" by "Fixture Author" is shown
    And the greeting shows "ada"
    And the timer advances past zero

  Scenario: Solving records exactly one completion and Continue serves the next puzzle
    When the user clicks the first cell of the puzzle
    And the user types the solution of "Preview Mini"
    Then the puzzle should show the completion message
    And the toolbar offers Continue instead of History
    And the backend has recorded 1 completion for the fixture account
    When the user dismisses the completion message
    And the user clicks Continue
    Then the puzzle "Word Square" by "Fixture Author" is shown
    And the backend has recorded 1 completion for the fixture account

  Scenario: Check marks a wrong letter and clears when the grid is cleared
    When the user clicks the first cell of the puzzle
    And the user types "Z"
    And the user clicks the "Check" toolbar button
    Then the first cell is marked incorrect
    And the "Check" toolbar button is highlighted as used
    When the user clicks the "Clear" toolbar button
    Then the first cell is not marked incorrect

  Scenario: Reveal fills the grid and shows the completion message afterwards
    When the user clicks the "Reveal" toolbar button
    Then every cell shows a letter
    And the puzzle should show the completion message
    And the backend has recorded 1 completion for the fixture account with reveal used

  Scenario: Running out of puzzles shows the all-done notice
    When the user clicks the first cell of the puzzle
    And the user types the solution of "Preview Mini"
    And the user dismisses the completion message
    And the user clicks Continue
    And the user clicks the first cell of the puzzle
    And the user types the solution of "Word Square"
    And the user dismisses the completion message
    And the user clicks Continue
    Then the all-done notice is shown
    And the backend has recorded 2 completions for the fixture account

  Scenario: History lists completed puzzles
    Given the fixture account has completed "Word Square" in 42 seconds
    When the user clicks the "History" toolbar button
    Then the history page lists 1 completed puzzle
