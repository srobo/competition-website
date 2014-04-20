
var app = angular.module('competitionResources', ["ngResource"]);

app.factory("Teams", function($resource) {
    return $resource(SRWEB_ROOT + "/teams-data.php");
});

app.factory("Arenas", function($resource) {
    return $resource(API_ROOT + "/arenas");
});

app.factory("LeagueScores", function($resource) {
    return $resource(API_ROOT + "/scores/league");
});

app.factory("AllMatches", function($resource) {
    return $resource(API_ROOT + "/matches/all");
});

app.factory("MatchesFactory", function($resource) {
    return function(arena, numbers) {
        var args = {arenaId: arena, numbers: numbers};
        return $resource(API_ROOT + "/matches/:arenaId?numbers=:numbers", args);
    }
});
