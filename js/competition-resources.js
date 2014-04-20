
var app = angular.module('competitionResources', ["ngResource"]);

app.factory("Teams", function($interval, $resource) {
    // SRWEB_ROOT ends with a /, unlike API_ROOT.
    var resource = $resource(SRWEB_ROOT + "teams-data.php");
    return create_follower($interval, resource, 60*1000);
});

app.factory("Arenas", function($resource) {
    return $resource(API_ROOT + "/arenas");
});

app.factory("Corners", function($resource) {
    var load_corner = function(cb, cornerId) {
        $resource(API_ROOT + "/corner/" + cornerId).get(function(corner) {
            cb(cornerId, corner);
        });
    };
    return { load: function(cb) {
        for (var c=0; c<4; c++) {
            load_corner(cb, c);
        }
    }};
});

app.factory("LeagueScores", function($resource) {
    return $resource(API_ROOT + "/scores/league");
});

app.factory("AllMatches", function($resource) {
    return $resource(API_ROOT + "/matches/all");
});

app.factory("MatchPeriods", function($resource) {
    return $resource(API_ROOT + "/matches/periods");
});

app.factory("KnockoutMatches", function($resource) {
    return $resource(API_ROOT + "/matches/knockouts");
});

app.factory("CurrentMatchFactory", function($resource) {
    return function(arena) {
        var args = {arenaId: arena};
        return $resource(API_ROOT + "/matches/:arenaId/current", args);
    }
});

app.factory("MatchesFactory", function($resource) {
    return function(arena, numbers) {
        var args = {arenaId: arena, numbers: numbers};
        return $resource(API_ROOT + "/matches/:arenaId?numbers=:numbers", args);
    }
});
