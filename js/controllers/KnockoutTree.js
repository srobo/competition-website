
var app = angular.module('app', ["competitionFilters", "competitionResources"]);

app.controller("KnockoutTree", function($scope, Current, KnockoutMatches, LastScoredMatch, MatchPeriods, State, Teams) {

    $scope.unknowable = UNKNOWABLE_TEAM;
    var KNOCKOUT_TYPE = "knockout";

    var knockout_period = {};

    var update_knockout_started = function(now) {
        if ($scope.knockout_start == null) {
            // can't do anything if we don't know when they start
            return;
        }
        if (now == null && $scope.offset != null) {
            now = Current.timeFromOffset($scope.offset);
        }
        if (now == null) {
            // can't do anything if we don't know what time it is.
            // TODO: should we log an error here?
            return;
        }
        $scope.knockout_started = $scope.knockout_start < now;
    }

    // update our current/next information all the time
    // it will change as time passes, even if the state revision doesn't
    Current.follow(function(nodes) {
        if (nodes.matches.length > 0) {
            var match = nodes.matches[0]
            $scope.current_match = match.num;
        } else {
            $scope.current_match = null;
        }

        $scope.offset = nodes.offset;
        update_knockout_started(nodes.time);
    });

    // update the data only when the state changes
    State.change(function() {
        Teams.get(function(nodes) {
            $scope.teams = nodes.teams;
        });

        MatchPeriods.get(function(nodes) {
            var len = nodes.periods.length;
            if (len > 0) {
                var knockout_period = nodes.periods[len - 1];
                $scope.knockout_start = new Date(knockout_period.start_time);

                update_knockout_started();
            }
        });

        LastScoredMatch.get(function(points) {
            $scope.latest_scored_match = points.last_scored;
        });

        KnockoutMatches.get(function(nodes) {
            $scope.rounds = process_knockouts(nodes.rounds);
        });
    });
});
