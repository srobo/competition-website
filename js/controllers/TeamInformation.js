
var app = angular.module('app', ["ngStorage", "competitionFilters", "competitionResources", "ui.select2"]);

app.controller("TeamInformation", function($scope, $interval, $localStorage, AllMatches, Arenas, Corners, Current, State, Teams) {

    $scope.$storage = $localStorage;
    $scope.corners = [];
    $scope.points = {};
    var all_matches = [];

    Corners.load(function(cornerId, corner) {
        $scope.corners[cornerId] = corner;
    });

    $scope.time_offset = 0;
    Current.follow(function(nodes) {
        $scope.time_offset = nodes.offset;
    });

    var describe_time_until = function(then) {
        if (then == null) {
            return null;
        }
        var now = Current.timeFromOffset($scope.time_offset);
        if (now > then) {
            return null;
        }
        var difference = then.getTime() - now.getTime();
        difference /= 1000;
        difference = Math.round(difference);
        var minutes = Math.floor(difference / 60);
        var seconds = difference % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        var output = minutes + ":" + seconds;
        return output;
    };

    $interval(function() {
        if ($scope.next_game != null) {
            $scope.time_to_next_game = describe_time_until($scope.next_game.time);
        }
    }, 100);

    var update_matches = function(team) {
        if (all_matches.length == 0) {
            return;
        }
        var scheduled_games = games_for_team(all_matches, team);
        var next_game = null;
        var now = Current.timeFromOffset($scope.time_offset);
        for (var i=0; i<scheduled_games.length; i++) {
            var game = scheduled_games[i];
            game.time = new Date(game.times.slot.start);

            if (now < game.time &&
                (next_game == null || game.time < next_game.time)) {
                next_game = game;
            }
        }

        $scope.games = scheduled_games;
        $scope.next_game = next_game;
    };

    $scope.$watch("$storage.chosenTeam", update_matches);

    // update the data only when the state changes
    State.change(function() {
        Arenas.get(function(nodes) {
            $scope.arenas = nodes.arenas;
        });

        Teams.get(function(nodes) {
            $scope.teams = nodes.teams;
        });

        AllMatches.get(function(nodes) {
            all_matches = nodes.matches;
            update_matches($scope.$storage.chosenTeam);
        });
    });
});

var games_time_filter = function() {
    return function(games, predicate) {
        if (games == null) {
            return games;
        }
        var output = [];
        for (var i=0; i<games.length; i++) {
            var game = games[i];
            if (predicate(game)) {
                output.push(game);
            }
        }
        return output;
    };
}();

app.filter("gamesAfterNow", function(Current) {
    return function(games, time_offset) {
        var now = Current.timeFromOffset(time_offset);
        return games_time_filter(games, function(game) {
            return game.time > now;
        });
    };
});

app.filter("gamesBeforeNow", function(Current) {
    return function(games, time_offset) {
        var now = Current.timeFromOffset(time_offset);
        return games_time_filter(games, function(game) {
            return game.time < now;
        });
    };
});

app.filter("otherTeams", function() {
    var empty_corner_symbol = EMPTY_CORNER_SYMBOL;
    return function(teams, team) {
        var output = [];
        for (var i=0; i<teams.length; i++) {
            var t = teams[i];
            if (t != null && t != team && t != empty_corner_symbol) {
                output.push(t);
            }
        }
        return output;
    };
});

app.filter("indexToCorner", function() {
    return function(teams, team, arenas) {
        var idx = teams.indexOf(team);
        var corner = idx % 4;
        return corner;
    };
});
