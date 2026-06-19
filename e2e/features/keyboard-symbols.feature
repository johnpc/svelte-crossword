Feature: Toggle between alphabet and symbols on the on-screen keyboard

  Scenario: User switches to symbols, types a symbol, switches back to letters, and types a letter
    Given the user navigates to the preview page
    When the user clicks the first cell of the puzzle
    And the user toggles the on-screen keyboard to symbols mode
    And the user taps the on-screen key "1"
    Then the focused cell should contain "1"
    When the user toggles the on-screen keyboard to alphabet mode
    And the user taps the on-screen key "T"
    Then the second cell of the puzzle should contain "T"
