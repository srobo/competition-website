
var app = angular.module('app', ["ngCookies", "competitionFilters", "competitionResources", "ui.select2"]);

app.controller("MatchSchedule", function($scope, $cookieStore, Arenas, Corners, CurrentMatchFactory, MatchPeriods, Teams) {

    var sessions_cache = {};
    $scope.onHideOldMatches = function(value) {
        $cookieStore.put("hideOldMatches", value);
        $scope.sessions = sessions_cache[value];
    };
    // treat undefined (the default) as true
    $scope.hideOldMatches = !($cookieStore.get("hideOldMatches") === false);

    $scope.corners = [];
    Corners.load(function(cornerId, corner) {
        $scope.corners[cornerId] = corner;
    });

    var updateTeams = function() {
        Teams.get(function(teams) {
            $scope.teams = teams;
        });
    };

    var updateState = function(CurrentMatch) {
        CurrentMatch.get(function(match) {
            $scope.current_match = match.number;
        });

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
            $scope.sessions = sessions_cache[$scope.hideOldMatches];
        });
    };

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

    updateTeams();
    // refresh teams every minute
    setInterval(updateTeams, 60000);
});
