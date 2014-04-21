
var app = angular.module('app', ["ngStorage", "competitionFilters", "competitionResources", "ui.select2"]);

app.controller("TeamInformation", function($scope, $localStorage, Arenas, Corners, CurrentMatchFactory, LeagueScores, MatchPeriods, State, Teams) {

    $scope.$storage = $localStorage;
    $scope.corners = [];
    $scope.sessions = [];
    $scope.points = {};

    Corners.load(function(cornerId, corner) {
        $scope.corners[cornerId] = corner;
    });

    Teams.follow(function(teams) {
        $scope.teams = teams;
    });

    var updateSession = function() {
        $scope.current_session = get_current_session($scope.sessions, $scope.current_match);
    };

    // update our current match information all the time
    var updateMatch = function(CurrentMatch) {
        CurrentMatch.get(function(match) {
            $scope.current_match = match.number;
            updateSession();
        });
    };

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

    // update the data only when the state changes
    State.change(function() {
        MatchPeriods.getSessions(function(sessions){
            for (var i=0; i<sessions.length; i++) {
                sessions[i].arenas = $scope.arenas;
            }
            $scope.sessions = sessions;
            updateSession();
        });

        LeagueScores.get(function(points) {
            $scope.points = points;
            update_position($scope.$storage.chosenTeam);
        });
    });

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        var CurrentMatch = CurrentMatchFactory(nodes.arenas[0]);
        var update = function() {
            updateMatch(CurrentMatch);
        };
        // refresh every 10s
        setInterval(update, 10000);
        update();
    });
});

app.filter("matchesAfter", function() {
    return function(matches, current) {
        if (matches == null || current == null) {
            return matches;
        }
        var first = matches[0].number;
        var difference = current - first;
        return matches.slice(difference);
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
