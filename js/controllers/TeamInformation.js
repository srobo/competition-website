
var app = angular.module('app', ["ngStorage", "competitionFilters", "competitionResources", "ui.select2"]);

app.controller("TeamInformation", function($scope, $interval, $localStorage, AllMatches, Arenas, Corners, CurrentMatchFactory, LeagueScores, MatchesFactory, State, Teams) {

    $scope.$storage = $localStorage;
    $scope.corners = [];
    $scope.points = {};
    var all_matches = [];

    Corners.load(function(cornerId, corner) {
        $scope.corners[cornerId] = corner;
    });

    Teams.follow(function(teams) {
        $scope.teams = teams;
    });

    // work out the team's position in the league
    var get_postition = function(points, team) {
        var position = null;
        for (var i=0; i<points.length; i++) {
            var row = points[i];
            if (row.pos) {
                position = row.pos;
            }
            if (row.tla == team) {
                break;
            }
        }
        return position;
    };

    var update_position = function(team) {
        league_points = league_sorter($scope.points.league_points, null, $scope.points.game_points);
        $scope.league_position = get_postition(league_points, team);
    }

    $scope.$watch("$storage.chosenTeam", update_position);

    var describe_time_until = function(then) {
        if (then == null) {
            return null;
        }
        var now = new Date();
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
        var numbers_map = {}
        var next_game = null;
        var now = new Date();
        for (var i=0; i<scheduled_games.length; i++) {
            var game = scheduled_games[i];
            var arena = game.arena;
            if (!(arena in numbers_map)) {
                numbers_map[arena] = [];
            }
            game.time = new Date(game.start_time);
            numbers_map[arena].push(game.num);

            if (now < game.time &&
                (next_game == null || game.time < next_game.time)) {
                next_game = game;
            }
        }

        $scope.scheduled_games = scheduled_games;
        $scope.detailed_games = {};
        $scope.next_game = next_game;

        var match_cmp = function(a, b) {
            return a.num - b.num;
        };
        var games_map = {};
        var per_arena = function(lookup_arena, map) {
            var Matches = MatchesFactory(lookup_arena, map[lookup_arena]);
            Matches.get(function(nodes) {
                games_map[lookup_arena] = nodes.matches;
                var games = [];
                for (var arena in games_map) {
                    games = games.concat(games_map[arena]);
                }
                games.sort(match_cmp);
                $scope.detailed_games = games;
            });
        };
        for (var arena in numbers_map) {
            per_arena(arena, numbers_map);
        }
    };

    $scope.$watch("$storage.chosenTeam", update_matches);

    // update the data only when the state changes
    State.change(function() {
        AllMatches.get(function(nodes) {
            all_matches = nodes.matches;
            update_matches($scope.$storage.chosenTeam);
        });

        LeagueScores.get(function(points) {
            $scope.points = points;
            update_position($scope.$storage.chosenTeam);
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

app.filter("gamesAfterNow", function() {
    return function(games) {
        var now = new Date();
        return games_time_filter(games, function(game) {
            return game.time > now;
        });
    };
});

app.filter("gamesBeforeNow", function() {
    return function(games) {
        var now = new Date();
        return games_time_filter(games, function(game) {
            return new Date(game.start_time) < now;
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

app.filter("indexToArena", function() {
    return function(teams, team, arenas) {
        var idx = teams.indexOf(team);
        var arenaId = Math.floor(idx / 4);
        return arenas[arenaId];
    };
});

app.filter("indexToCorner", function() {
    return function(teams, team, arenas) {
        var idx = teams.indexOf(team);
        var corner = idx % 4;
        return corner;
    };
});
