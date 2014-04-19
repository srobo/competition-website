
var competitionFilters = angular.module('competitionFilters', []);

/// Replaces a plain TLA with an actual team name
competitionFilters.filter('teamName', function($log) {
    return function(tla, teams, name_only) {
        if (teams == null || !(tla in teams)) {
            $log.warn('No information for team: ' + tla);
            return tla;
        }
        name_only = name_only || false;
        var info = teams[tla];
        var name = info.team_name || info.college.name;
        if (name_only) {
            return name;
        }
        return tla + ": " + name;
    };
});

/// Find matches which the given team is in
competitionFilters.filter('containsTeam', function() {
    // implemented in competition-utils.js
    return matches_for_team;
});

/// Exclude matches which have already happened
competitionFilters.filter('unspentMatches', function() {
    // implemented in competition-utils.js
    return unspent_matches;
});
