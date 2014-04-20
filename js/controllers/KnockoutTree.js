
var app = angular.module('app', ["competitionFilters", "competitionResources"]);

app.controller("KnockoutTree", function($scope, Arenas, CurrentMatchFactory, KnockoutMatches, LeagueScores, Teams) {

    $scope.unknowable = UNKNOWABLE_TEAM;

    var updateTeams = function() {
        Teams.get(function(teams) {
            $scope.teams = teams;
        });
    };

    var updateState = function(CurrentMatch) {
        CurrentMatch.get(function(match) {
            $scope.current_match = match.number;
        });

        LeagueScores.get(function(points) {
            $scope.latest_scored_match = points.last_scored;
        });

        KnockoutMatches.get(function(nodes) {
            $scope.rounds = process_knockouts(nodes.rounds);
            $scope.knockout_started = nodes.started;
        });
    };

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        var CurrentMatch = CurrentMatchFactory(nodes.arenas[0]);
        var update = function() {
            updateState(CurrentMatch);
        };
        // refresh every 10s
        setInterval(update, 10000);
        update();
    });

    updateTeams();
    // refresh teams every minute
    setInterval(updateTeams, 60000);
});
