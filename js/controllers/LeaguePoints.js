
var app = angular.module('app', ["ngResource"]);

app.controller("LeaguePoints", function($scope, $resource) {

    // TODO: inject this url somehow
    var root = "http://localhost/comp-api";
    var Points = $resource(root + "/scores/league");
    var KnockoutInfo = $resource(root + "/knockout/max_entrants");

    $scope.latest_match = 'TODO';

    $scope.knockout_max = null;
    var updateState = function() {
        Points.get(function(points) {
            $scope.league_points = league_sorter(points.league_points, $scope.knockout_max, points.game_points);
        });
    };

    KnockoutInfo.get(function(knockout) {
        $scope.knockout_max = knockout.max_entrants;
        updateState();
    });
});
