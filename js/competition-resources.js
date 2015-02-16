
var app = angular.module('competitionResources', ["ngResource"]);

app.factory("Teams", function($interval, $resource) {
    return $resource(API_ROOT + "/teams", {}, {
        getList: { method: 'GET', interceptor: {
            response: function(response) {
                var teams = response.data.teams;
                var teams_list = [];
                for (var tla in teams) {
                    teams_list.push(teams[tla]);
                }
                return teams_list;
            }
        }}
    });
});

app.factory("State", function($interval, $resource) {
    var resource = $resource(API_ROOT + "/state");
    var follower = create_follower($interval, resource, 30*1000);
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
    return { load: function(cb) {
        $resource(API_ROOT + "/corners/").get(function(nodes) {
            for (var cornerId in nodes.corners) {
                cb(cornerId, nodes.corners[cornerId]);
            }
        });
    }};
});

app.factory("LeagueScores", function($resource) {
    return $resource(API_ROOT + "/scores/league");
});

app.factory("LastScoredMatch", function($resource) {
    return $resource(API_ROOT + "/matches/last_scored");
});

app.factory("AllMatches", function($resource) {
    return $resource(API_ROOT + "/matches");
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
    return $resource(API_ROOT + "/periods", {}, {
        getSessions: {method: "GET", interceptor: {
            response: function(response) {
                return build_sessions(response.data);
            }
        }}
    });
});

app.factory("KnockoutMatches", function($resource) {
    return $resource(API_ROOT + "/knockout");
});

app.factory("Current", function($interval, $resource) {
    var resource = $resource(API_ROOT + "/current", {}, {
        'get': { method: 'GET', interceptor: {
            response: function(response) {
                var data = response.data;
                var time = data.time = new Date(data.time);
                data.offset = compute_offset(time);
                return data;
            }
        }},
        'getMatch': { method: 'GET', interceptor: {
            response: function(response) {
                return response.data.matches;
            }
        }},
        'getTime': { method: 'GET', interceptor: {
            response: function(response) {
                return new Date(response.data.time);
            }
        }}
    });
    // helper which applies the offset value generated above
    resource.timeFromOffset = apply_offset;
    // 10 seconds follower
    return create_follower($interval, resource, 10*1000);
});

app.factory("CurrentMatchFactory", function($resource) {
    return function(arena) {
        var args = {arenaId: arena};
        return $resource(API_ROOT + "/matches/:arenaId/current", args);
    }
});

app.factory("MatchesFactory", function($resource) {
    return function(arena, numbers) {
        if (Object.prototype.toString.call(numbers) === '[object Array]' ) {
            numbers = numbers.join(',');
        }
        var encoded_numbers = encodeURIComponent(numbers);
        return $resource(API_ROOT + "/matches/" + arena + "?numbers=" + encoded_numbers);
    }
});
