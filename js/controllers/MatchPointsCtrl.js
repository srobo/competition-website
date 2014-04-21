
var app = angular.module('app', ["ngStorage", "competitionFilters", "competitionResources", "ui.select2"]);

app.controller("MatchPointsCtrl", function($scope, $localStorage, Arenas, MatchesFactory, Teams) {

    $scope.$storage = $localStorage;

    Teams.follow(function(teams) {
        $scope.teams = teams;
    });

    var fetchedMatches = $scope.fetchedMatches = {};

    var only_integers = function(list) {
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

    var updateMatches = function(match_numbers) {
        var match_numbers = only_integers(match_numbers);
        if (match_numbers.length == 0) {
            return;
        }

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

        var arenas = $scope.arenas || [];
        for (var i=0; i<arenas.length; i++) {
            var Matches = MatchesFactory(arenas[i], match_numbers);
            Matches.get(function(nodes) {
                var matches = nodes.matches;
                for (var j=0; j<matches.length; j++) {
                    var game = matches[j];
                    if (!(game.number in fetchedMatches)) {
                        fetchedMatches[game.number] = {
                            "number": game.number,
                            "games": {}
                        };
                    }
                    fetchedMatches[game.number].games[game.arena] = game;
                }
                tidyFetched();
            });
        }
        tidyFetched();
    };

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        updateMatches($scope.chosenMatches);
    });

    $scope.$watch("chosenMatches", updateMatches);
});
