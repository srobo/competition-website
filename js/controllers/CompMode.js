
var app = angular.module('app', ["ngResource", "competitionFilters"]);

app.controller("CompMode", function($scope, $resource) {
    var Arenas = $resource(API_ROOT + "/arenas");
    var Points = $resource(API_ROOT + "/scores/league");
    var Teams = $resource(SRWEB_ROOT + "teams-data.php");
    // TODO: consider getting only the matches of interest,
    // once there's an easy way to do this for all arenas at once.
    var Matches = $resource(API_ROOT + "/matches/all");

    var updateTeams = function() {
        Teams.get(function(teams) {
            $scope.teams = teams;
        });
    };

    // because this changes as a result of two things, do our own updating.
    // Idealy this would be a filter in the template, but that didn't want
    // to work easily.
    var all_matches = [];
    var next_match = 0;
    var refresh = function() {
        var low = Math.max(0, next_match-2);
        $scope.matches = all_matches.slice(low, low+10);
    };

    var updateState = function(MatchState) {
        MatchState.get(function(matches) {
            matches = matches.matches;
            for (var i=0; i<matches.length; i++) {
                var match = matches[i];
                if (match.query == "next") {
                    next_match = match.number;
                } else if (match.query == "current") {
                    $scope.current_match = match.number;
                }
            }
            refresh();
        });

        Matches.get(function(nodes) {
            all_matches = convert_matches(nodes.matches);
            refresh();
        });

        Points.get(function(points) {
            var league_points = league_sorter(points.league_points, null, points.game_points);
            $scope.league_points = league_points.slice(0, 10);
        });
    };

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        var MatchState = $resource(API_ROOT + "/matches/" + nodes.arenas[0] + "?numbers=current,next");
        var update = function() {
            updateState(MatchState);
        };
        // refresh every 10s
        setInterval(update, 10000);
        update();
    });

    updateTeams();
    // refresh teams every minute
    setInterval(updateTeams, 60000);
});
