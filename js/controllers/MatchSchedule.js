
var app = angular.module('app', ["ngResource", "competitionFilters"]);

app.controller("MatchSchedule", function($scope, $resource) {

    // TODO: inject this url somehow
    var root = "http://localhost/comp-api";

    var Arenas = $resource(root + "/arenas");
    var Matches = $resource(root + "/matches/all");
    var Teams = $resource(SRWEB_ROOT + "teams-data.php");

    $scope.corners = [];
    var load_corner = function (cornerId) {
        $resource(root + "/corner/" + cornerId).get(function(corner) {
            $scope.corners[cornerId] = corner;
        });
    };
    for (var c=0; c<4; c++) {
        load_corner(c);
    }

    var updateTeams = function() {
        //$('#schedule-filter select').chosen();
        Teams.get(function(teams) {
            $scope.teams = teams;
          //  $('#schedule-filter select').trigger("chosen:updated");
        });
    };

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

    updateTeams();
    // refresh teams every minute
    setInterval(updateTeams, 60000);
});
