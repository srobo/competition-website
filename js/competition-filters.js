
var competitionFilters = angular.module('competitionFilters', []);

/// Replaces a plain TLA with an actual team name
competitionFilters.filter('teamName', function($log) {
    return function(tla, teams) {
        if (teams == null || !(tla in teams)) {
            $log.warn('No information for team: ' + tla);
            return tla;
        }
        var info = teams[tla];
        var name = info.team_name || info.college.name;
        return tla + ": " + name;
    };
});
