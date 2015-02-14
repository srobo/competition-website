
var app = angular.module('app', ["competitionFilters", "competitionResources"]);

app.controller("LeaguePoints", function($scope, State, Teams) {
    // Follow changes to the state
    State.change(function() {
        // All the data we need is attached to each team's object
        Teams.get(function(teams) {
            var teams_list = [];
            for (var tla in teams.teams) {
                teams_list.push(teams.teams[tla]);
            }
            $scope.teams = teams_list;
        });
    });
});
