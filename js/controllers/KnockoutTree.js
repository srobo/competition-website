
var app = angular.module('app', ["ngResource", "competitionFilters"]);

app.controller("KnockoutTree", function($scope, $resource) {
    var Arenas = $resource(API_ROOT + "/arenas");
    var Matches = $resource(API_ROOT + "/matches/knockouts");
    var Points = $resource(API_ROOT + "/scores/league");
    var Teams = $resource(SRWEB_ROOT + "teams-data.php");

    $scope.unknowable = UNKNOWABLE_TEAM;

    var updateTeams = function() {
        Teams.get(function(teams) {
            $scope.teams = teams;
        });
    };

    var updateState = function(CurrentMatch) {
        CurrentMatch.get(function(match) {
            $scope.current_match = match.number;
        });

        Points.get(function(points) {
            $scope.latest_scored_match = points.last_scored;
        });

        Matches.get(function(nodes) {
            $scope.rounds = process_knockouts(nodes.rounds);
            $scope.knockout_started = nodes.started;
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
