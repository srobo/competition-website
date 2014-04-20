
var app = angular.module('competitionResources', ["ngResource"]);

app.factory("Teams", function($interval, $resource) {
    // SRWEB_ROOT ends with a /, unlike API_ROOT.
    var resource = $resource(SRWEB_ROOT + "teams-data.php");
    return create_follower($interval, resource, 60*1000);
});

app.factory("State", function($interval, $resource) {
    var resource = $resource(API_ROOT + "/state");
    var follower = create_follower($interval, resource, 10*1000);
    return { change: function(cb) {
        var state = null;
        follower.follow(function(nodes) {
            if (state != nodes.state) {
                state = nodes.state;
                cb(nodes);
            }
        });
    }};
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
    var build_sessions = function(nodes) {
        var sessions = [];
        for (var i=0; i<nodes.periods.length; i++) {
            var period = nodes.periods[i];
            var matches = convert_matches(period.matches);
            sessions.push({
                'description': period.description,
                'matches': matches
            });
        }
        return sessions;
    };
    return $resource(API_ROOT + "/matches/periods", {}, {
        getSessions: {method: "GET", interceptor: {
            response: function(response) {
                return build_sessions(response.data);
            }
        }}
    });
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
