
var app = angular.module('app', ["ngStorage", "competitionFilters", "competitionResources", "ui.select2"]);

app.controller("MatchSchedule", function($scope, $sessionStorage, Arenas, Corners, CurrentMatchFactory, MatchPeriods, State, Teams) {

    $scope.$storage = $sessionStorage.$default({hideOldMatches: true});

    var sessions_cache = {};
    $scope.$watch("$storage.hideOldMatches", function(value) {
        $scope.sessions = sessions_cache[value];
    });

    $scope.corners = [];
    Corners.load(function(cornerId, corner) {
        $scope.corners[cornerId] = corner;
    });

    Teams.follow(function(teams) {
        $scope.teams = teams;
    });

    // update our current match information all the time
    var updateState = function(CurrentMatch) {
        CurrentMatch.get(function(match) {
            $scope.current_match = match.number;
        });
    };

    // update the data only when the state changes
    State.change(function() {
        MatchPeriods.get(function(nodes) {
            var sessions = [];
            for (var i=0; i<nodes.periods.length; i++) {
                var period = nodes.periods[i];
                var matches = convert_matches(period.matches);
                sessions.push({
                    'description': period.description,
                    'arenas': $scope.arenas,
                    'matches': matches
                });
            }
            sessions_cache[false] = sessions;
            sessions_cache[true] = unspent_matches(sessions, true);
            $scope.sessions = sessions_cache[$sessionStorage.hideOldMatches];
        });
    });

    Arenas.get(function(nodes) {
        $scope.arenas = nodes.arenas;
        var CurrentMatch = CurrentMatchFactory(nodes.arenas[0]);
        var update = function() {
            updateState(CurrentMatch);
        };
        // refresh every 10s
        setInterval(update, 10000);
        update();
    });
});
