Feature: Crossword Puzzle

  Scenario: User can view the crossword page
    Given the user navigates to the home page
    Then the page should load successfully

  Scenario: User can navigate to the about page
    Given the user navigates to the about page
    Then the about page should display content

  Scenario: User can view the preview puzzle
    Given the user navigates to the preview page
    Then the crossword grid should be visible
