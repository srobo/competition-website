
var app = angular.module('app', ["competitionFilters", "competitionResources"]);

app.controller("LeaguePoints", function($scope, LastScoredMatch, State, Teams) {
    // Follow changes to the state
    State.change(function() {
        // All the data we need is attached to each team's object
        Teams.getList(function(teams) {
            $scope.teams = teams;
        });

        LastScoredMatch.get(function(points) {
            $scope.latest_scored_match = points.last_scored;
        });
    });
});
