Feature: Leaderboard

  Scenario: The leaderboard shows solvers and the total number of players
    Given the fixture account has completed "Word Square" in 42 seconds
    When the user navigates to the leaderboard page
    Then the leaderboard lists "ada (1)"
    And the leaderboard shows "Total users: 1"
