
var app = angular.module('app', ["ngResource", "competitionFilters", "ui.select2"]);

app.controller("MatchSchedule", function($scope, $resource) {
    var Arenas = $resource(API_ROOT + "/arenas");
    var Matches = $resource(API_ROOT + "/matches/periods");
    var Teams = $resource(SRWEB_ROOT + "teams-data.php");

    $scope.corners = [];
    var load_corner = function (cornerId) {
        $resource(API_ROOT + "/corner/" + cornerId).get(function(corner) {
            $scope.corners[cornerId] = corner;
        });
    };
    for (var c=0; c<4; c++) {
        load_corner(c);
    }

    var updateTeams = function() {
        Teams.get(function(teams) {
            $scope.teams = teams;
        });
    };

    var updateState = function(CurrentMatch) {
        CurrentMatch.get(function(match) {
            $scope.current_match = match.number;
        });

        Matches.get(function(nodes) {
            var sessions = [];
            for (var i=0; i<nodes.periods.length; i++) {
                var period = nodes.periods[i];
                var matches = convert_matches(period.matches);
                sessions.push({
                    'description': period.description,
                    'arenas': $scope.arenas,
                    'matches': matches
                });
            }
            $scope.sessions = sessions;
        });
    };

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        var CurrentMatch = $resource(API_ROOT + "/matches/" + nodes.arenas[0] + "/current");
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
