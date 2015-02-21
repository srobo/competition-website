
var app = angular.module('app', ["ngStorage", "competitionFilters", "competitionResources", "ui.select2"]);

var only_integers = function() {
    return function(list) {
        var list = list || [];
        var output = [];
        for (var i=0; i<list.length; i++) {
            var maybeInt = parseInt(list[i]);
            if (!isNaN(maybeInt)) {
                output.push(maybeInt);
            }
        }
        return output;
    };
}();

var games_list_to_matches_map = function() {
    return function(games_list) {
        var matches_map = {};
        for (var i=0; i<games_list.length; i++) {
            var game = games_list[i];
            if (!(game.num in matches_map)) {
                matches_map[game.num] = {
                    "num": game.num,
                    "games": {}
                };
            }
            matches_map[game.num].games[game.arena] = game;
        }
        return matches_map;
    };
}();

app.controller("MatchPointsCtrl", function($scope, $localStorage, AllMatches, Arenas, Corners, State, Teams) {

    $scope.empty_corner = EMPTY_CORNER_SYMBOL;
    $scope.$storage = $localStorage;

    $scope.corners = [];
    Corners.load(function(cornerId, corner) {
        $scope.corners[cornerId] = corner;
    });

    var games_list = [];
    var updateChosen = function(team) {
        if (games_list.length == 0 || team == null) {
            return;
        }

        var games = games_for_team(games_list, team);
        var match_numbers = [];
        for (var i=0; i<games.length; i++) {
            match_numbers.push(games[i].num);
        }

        $scope.chosenMatches = match_numbers;
    };

    $scope.$watch("$storage.chosenTeam", updateChosen);

    State.change(function() {
        Arenas.get(function(nodes) {
            $scope.arenas = nodes.arenas;
        });

        Teams.get(function(nodes) {
            $scope.teams = nodes.teams;
        });

        AllMatches.get(function(matches) {
            games_list = matches.matches;
            $scope.matches = games_list_to_matches_map(games_list)
            updateChosen($scope.$storage.chosenTeam);
        });
    });
});

app.filter('pickMatches', function() {
    return function(matches_map, chosen_match_nums) {
        var numbers = only_integers(chosen_match_nums);
        // JavaScript is insane
        numbers.sort(function(a,b){return a - b});
        var output = [];
        for (var i=0; i<numbers.length; i++) {
            output.push(matches_map[numbers[i]]);
        }
        return output;
    };
});
