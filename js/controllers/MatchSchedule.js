
var app = angular.module('app', ["ngStorage", "competitionFilters", "competitionResources", "ui.select2"]);

app.controller("MatchSchedule", function($scope, $sessionStorage, Corners, Current, MatchPeriods, State, Teams) {

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
    Current.follow(function(nodes) {
        if (nodes.matches.length > 0) {
            $scope.current_match = nodes.matches[0].num;
        } else {
            $scope.current_match = null;
        }
    });

    // update the data only when the state changes
    State.change(function() {
        Teams.get(function(nodes) {
            $scope.teams = nodes.teams;
        });

        MatchPeriods.getSessions(function(sessions) {
            sessions_cache[false] = sessions;
            sessions_cache[true] = unspent_matches(sessions, true);
            $scope.sessions = sessions_cache[$sessionStorage.hideOldMatches];
        });
    });
});
