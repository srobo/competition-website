
var app = angular.module('app', ["ngResource"]);

app.controller("MatchSchedule", function($scope, $resource) {

    // TODO: inject this url somehow
    var root = "http://localhost/comp-api";

    var Arenas = $resource(root + "/arenas");
    var Matches = $resource(root + "/matches/all");

    // TODO: work out if we actuall want colours here -- they're rather bright
    $scope.corners = [];
    var load_corner = function (cornerId) {
        $resource(root + "/corner/" + cornerId).get(function(corner) {
            $scope.corners[cornerId] = corner;
        });
    };
    for (var c=0; c<4; c++) {
        load_corner(c);
    }

    var updateState = function(CurrentMatch) {
        CurrentMatch.get(function(match){
            for (var arena in match) {
                $scope.current_match = match[arena].num;
                break;
            }
        });

        Matches.get(function(matches) {
            $scope.matches = convert_matches(matches);
        });
    };

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        var CurrentMatch = $resource(root + "/matches/" + nodes.arenas[0] + "/current");
        updateState(CurrentMatch);
    });
});
