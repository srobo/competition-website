
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

app.controller("MatchPointsCtrl", function($scope, $localStorage, AllMatches, Arenas, Corners, MatchesFactory, State, Teams) {

    $scope.$storage = $localStorage;

    $scope.corners = [];
    Corners.load(function(cornerId, corner) {
        $scope.corners[cornerId] = corner;
    });

    Teams.follow(function(teams) {
        $scope.teams = teams;
    });

    var fetchedMatches = $scope.fetchedMatches = {};

    var updateMatches = function(match_numbers) {
        var match_numbers = only_integers(match_numbers);

        var tidyFetched = function() {
            for (var key in fetchedMatches) {
                // match_numbers are all int
                var num = parseInt(key);
                // not contains
                if (match_numbers.indexOf(num) == -1) {
                    delete fetchedMatches[key];
                }
            }
        };
        tidyFetched();

        if (match_numbers.length == 0) {
            return;
        }

        var arenas = $scope.arenas || [];
        for (var i=0; i<arenas.length; i++) {
            var Matches = MatchesFactory(arenas[i], match_numbers);
            Matches.get(function(nodes) {
                var matches = nodes.matches;
                for (var j=0; j<matches.length; j++) {
                    var game = matches[j];
                    if (!(game.num in fetchedMatches)) {
                        fetchedMatches[game.num] = {
                            "num": game.num,
                            "games": {}
                        };
                    }
                    fetchedMatches[game.num].games[game.arena] = game;
                }
                tidyFetched();
            });
        }
    };

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        updateMatches($scope.chosenMatches);
    });

    State.change(function() {
        updateMatches($scope.chosenMatches);
    });

    $scope.$watch("chosenMatches", updateMatches);


    var all_matches = {};
    AllMatches.get(function(matches) {
        all_matches = matches.matches;
        updateChosen($scope.$storage.chosenTeam);
    });

    var updateChosen = function(team) {
        if (all_matches == null || team == null) {
            return;
        }

        var games = games_for_team(all_matches, team);
        var match_numbers = [];
        for (var i=0; i<games.length; i++) {
            match_numbers.push(games[i].num);
        }

        $scope.chosenMatches = match_numbers;
    };

    $scope.$watch("$storage.chosenTeam", updateChosen);
});

app.filter('matchSort', function() {
    var keys = function(dict) {
        var output = [];
        for (var key in dict) {
            output.push(key);
        }
        return output;
    };
    return function(matches_map) {
        var numbers = only_integers(keys(matches_map));
        // JavaScript is insane
        numbers.sort(function(a,b){return a - b});
        var output = [];
        for (var i=0; i<numbers.length; i++) {
            output.push(matches_map[numbers[i]]);
        }
        return output;
    };
});
