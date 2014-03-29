
var app = angular.module('app', ["ngResource", "competitionFilters"]);

app.controller("CompMode", function($scope, $resource) {
    var Arenas = $resource(API_ROOT + "/arenas");
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
    var current_match = 0;
    var refresh = function() {
        $scope.matches = all_matches.slice(current_match, current_match+10);
    };

    var updateState = function(CurrentMatch) {
        CurrentMatch.get(function(match) {
            current_match = match.number;
            refresh();
        });

        Matches.get(function(nodes) {
            all_matches = convert_matches(nodes.matches);
            refresh();
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
