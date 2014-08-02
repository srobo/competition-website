
var app = angular.module('app', ["competitionFilters", "competitionResources"]);

app.controller("KnockoutTree", function($scope, Arenas, KnockoutMatches, LeagueScores, MatchesFactory, State, Teams) {

    $scope.unknowable = UNKNOWABLE_TEAM;
    var KNOCKOUT_TYPE = "knockout";

    Teams.follow(function(teams) {
        $scope.teams = teams;
    });

    // update our current/next information all the time
    // it will change as time passes, even if the state revision doesn't
    var updateState = function(MatchState) {
        MatchState.get(function(matches) {
            matches = matches.matches;
            var current, next;
            for (var i=0; i<matches.length; i++) {
                var match = matches[i];
                if (match.query == "next") {
                    next = match;
                } else if (match.query == "current") {
                    current = match;
                }
            }
            $scope.current_match = current.num;
            // either in a knockout match, or
            // no current match and the next one is a knockout
            $scope.knockout_started = current.type == KNOCKOUT_TYPE ||
                            (current.error && next.type == KNOCKOUT_TYPE);
        });
    };

    // update the data only when the state changes
    State.change(function() {
        LeagueScores.get(function(points) {
            $scope.latest_scored_match = points.last_scored;
        });

        KnockoutMatches.get(function(nodes) {
            $scope.rounds = process_knockouts(nodes.rounds);
        });
    });

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        var MatchState = MatchesFactory(nodes.arenas[0], "current,next");
        var update = function() {
            updateState(MatchState);
        };
        // refresh every 10s
        setInterval(update, 10000);
        update();
    });
});
