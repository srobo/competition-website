
var app = angular.module('app', ["competitionFilters", "competitionResources"]);

app.controller("LeaguePoints", function($scope, LeagueScores, Teams) {

    $scope.knockout_max = null;
    var updateState = function() {
        LeagueScores.get(function(points) {
            $scope.league_points = league_sorter(points.league_points, null, points.game_points);
            $scope.game_points = gamepoints_sorter(points.game_points);
            $scope.latest_match = points.last_scored;
        });
        Teams.get(function(teams) {
            $scope.teams = teams;
        });
    };

    // refresh every 10s
    setInterval(updateState, 10000);
    updateState();
});
