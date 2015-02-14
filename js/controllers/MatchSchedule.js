
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

    // update our current match information all the time
    var updateState = function(CurrentMatch) {
        CurrentMatch.get(function(match) {
            $scope.current_match = match.num;
        });
    };

    // update the data only when the state changes
    State.change(function() {
        Teams.get(function(nodes) {
            $scope.teams = nodes.teams;
        });

        MatchPeriods.getSessions(function(sessions) {
            for (var i=0; i<sessions.length; i++) {
                sessions[i].arenas = $scope.arenas;
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
