
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
        CurrentMatch.get(function(match) {
            $scope.current_match = match.number;
        });

        Matches.get(function(nodes) {
            // TODO: proper sessions support
            matches = convert_matches(nodes.matches);
            $scope.sessions = [{
                'when': 'Someday, 0 Month 2014, morning',
                'arenas': $scope.arenas,
                'matches': matches
            }];
        });
    };

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        var CurrentMatch = $resource(root + "/matches/" + nodes.arenas[0] + "/current");
        var update = function() {
            updateState(CurrentMatch);
        };
        // refresh every 10s
        setInterval(update, 10000);
        update();
    });
});
