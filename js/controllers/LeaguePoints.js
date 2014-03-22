
var app = angular.module('app', ["ngResource", "competitionFilters"]);

app.controller("LeaguePoints", function($scope, $resource) {

    // TODO: inject this url somehow
    var root = "http://localhost/comp-api";
    var Points = $resource(root + "/scores/league");
    var Teams = $resource(SRWEB_ROOT + "teams-data.php");
    var KnockoutInfo = $resource(root + "/knockout/max_entrants");

    $scope.knockout_max = null;
    var updateState = function() {
        Points.get(function(points) {
            $scope.league_points = league_sorter(points.league_points, $scope.knockout_max, points.game_points);
            $scope.game_points = gamepoints_sorter(points.game_points);
            $scope.latest_match = points.last_scored;
        });
        Teams.get(function(teams) {
            $scope.teams = teams;
        });
    };

    KnockoutInfo.get(function(knockout) {
        $scope.knockout_max = knockout.max_entrants;
        // refresh every 10s
        setInterval(updateState, 10000);
        updateState();
    });
});
