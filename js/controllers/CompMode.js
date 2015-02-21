
var app = angular.module('app', ["competitionFilters", "competitionResources"]);

app.controller("CompMode", function($scope, $interval, $log, Arenas, AllMatches, Current, State, Teams) {

    $scope.matches = [];
    $scope.upcoming_match = null;
    $scope.next_match = null;
    $scope.current_match = null;
    $scope.previous_match = null;

    var grouped_matches = [];

    var first_value = function(map) {
        for (var k in map) {
            return map[k];
        }
    };

    var build_match_info = function(games) {
        var game = first_value(games);
        return {
            'num': game.num,
            'games': games
        };
    }

    $scope.time_offset = 0;
    Current.follow(function(nodes) {
        $scope.time_offset = nodes.offset;
        var grouped = group_matches(nodes.matches);
        if (grouped.length > 0) {
            $scope.current_match = build_match_info(grouped[0]);
        } else {
            $scope.current_match = null;
        }
    });

    $interval(function() {
        var now = Current.timeFromOffset($scope.time_offset);

        var previous_matches = array_filter(grouped_matches, function(game_map) {
            var game = first_value(game_map);
            return new Date(game.times.slot.end) < now;
        });
        if (previous_matches.length > 0) {
            // last one
            var previous_match = previous_matches[previous_matches.length - 1];
            $scope.previous_match = build_match_info(previous_match);
        } else {
            $scope.previous_match = null;
        }

        var upcoming_matches = array_filter(grouped_matches, function(game_map) {
            var game = first_value(game_map);
            return new Date(game.times.slot.start) > now;
        });

        if (upcoming_matches.length > 0) {
            $scope.next_match = build_match_info(upcoming_matches[0]);
            if (upcoming_matches.length > 1) {
                $scope.upcoming_match = build_match_info(upcoming_matches[1]);
            } else {
                $scope.upcoming_match = null;
            }
        } else {
            $scope.next_match = null;
        }
    }, 100);

    // update the data only when the state changes
    State.change(function() {
        Arenas.get(function(nodes) {
            $scope.arenas = nodes.arenas;
        });

        Teams.get(function(nodes) {
            $scope.teams = nodes.teams;
        });

        // TODO: consider getting only the matches of interest,
        // once there's an easy way to do this for all arenas at once.
        AllMatches.get(function(nodes) {
            all_matches = nodes.matches;
            grouped_matches = group_matches(all_matches)
            $scope.matches = convert_matches(grouped_matches);
        });
    });
});

app.filter("matchesEndingAfterNow", function(Current) {
    return function(matches, time_offset) {
        var now = Current.timeFromOffset(time_offset);
        return array_filter(matches, function(match) {
            return match.end_time > now;
        });
    };
});

app.filter("leaderboard", function() {
    return function(teams, limit) {
        var output = [];
        for (var tla in teams) {
            output.push(teams[tla]);
        }
        output.sort(function(a, b) {
            return a.league_pos - b.league_pos;
        });
        if (limit) {
            output = output.slice(0, limit);
        }
        return output;
    };
});
