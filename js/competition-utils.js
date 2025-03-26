
var EMPTY_CORNER_SYMBOL = '-';

// age of match (by start time) to be hidden when the user wants
// to hide 'old' matches
var MAX_MATCH_AGE = 15 * 60; // 15 minutes in seconds

var should_show_arena_title = function() {
    // Whether or not we should show the arena title
    return function(arenas) {
        var keys = Object.keys(arenas);
        if (keys.length > 1) {
            // More than one arena
            return true;
        }
        if (arenas[keys[0]].display_name) {
            // Or the arena has a display name
            return true;
        }
        return false;
    }
}();

var compute_offset = function() {
    return function(then, now) {
        now = now || new Date();
        return now - then;
    };
}();

var apply_offset = function() {
    return function(offset, now) {
        now = now || new Date();
        return new Date(now.valueOf() - offset);
    };
}();

var create_follower = function() {
    return function($interval, resource, delay) {
        resource.follow = function(cb, delay_override) {
            var fetch = function() {
                resource.get(cb);
            };
            $interval(fetch, delay_override || delay);
            fetch();
        };
        return resource;
    };
}();

var hex_to_rgba = function() {
    var get_parts = function(hex) {
        if (hex[0] == "#") {
            hex = hex.substring(1);
        }
        var colours = [];
        for (var i=0; i<6; i += 2) {
            var part = hex.substring(i, i+2);
            var int = parseInt(part, 16);
            colours.push(int);
        }
        return colours;
    };
    return function(hex, alpha) {
        var colours = get_parts(hex);
        colours.push(alpha);
        var rgba = "rgba(" + colours.join(", ") + ")";
        return rgba;
    };
}();

var convert_matches = function() {
    return function(num_corners, matches, arenas, options) {
        var output = [];
        for (var i=0; i<matches.length; i++) {
            output.push(match_converter(num_corners, matches[i], arenas, options));
        }
        return output;
    };
}();

var ensure_whole_arena = function() {
    var empty_corner_symbol = EMPTY_CORNER_SYMBOL;
    return function(num_corners, teams) {
        var output = teams.concat([]);
        for (var i=0; i<output.length; i++) {
            if (!output[i]) {
                output[i] = empty_corner_symbol;
            }
        }
        var missing = num_corners - output.length;
        for (; missing > 0; missing--) {
            output = output.concat([empty_corner_symbol]);
        }
        return output;
    };
}();

var match_timings = function() {
    var get_mode = function(options) {
        // Allow an explicit value to be passed in, mostly for tests, use the
        // global default if no value is given.
        if (options && options.match_timing_mode !== undefined) {
            return options.match_timing_mode;
        }
        // Not really happy with having to do this detection, but it seems
        // better to do this than require every call-site to remember to pass
        // the value in as that seems likely to lead to inconsistencies.
        if (typeof window !== 'undefined') {
            // Browser, template should set this
            return MATCH_TIMING_MODE;
        }
        // Node JS for tests, this isn't set
        return '';
    }
    return function(game, options) {
        var times = get_mode(options) === 'game' ? game.times.game : game.times.slot;
        return {
            'start': new Date(times.start),
            'end': new Date(times.end),
        };
    };
}();

var match_converter = function() {
    return function(num_corners, match, arenas, options) {
        var output = { 'teams': [] };
        // Get initial data from the first game in the match
        for (var arena in match) {
            var detail = match[arena];
            output.num = detail.num;
            output.display_name = detail.display_name;
            var times = match_timings(detail, options);
            output.time = times.start;
            output.end_time = times.end;
            break;
        }
        // Get teams data by iterating over the arenas, thus ensuring
        // that all the arenas are properly represented.
        for (var arena in arenas) {
            var detail = match[arena];
            var arena_teams;
            if (detail) {
                arena_teams = ensure_whole_arena(num_corners, detail.teams);
            } else {
                // array of given size containing 'undefined' elements
                arena_teams = new Array(num_corners);
            }
            output.teams = output.teams.concat(arena_teams);
        }
        return output;
    };
}();

var group_matches = function() {
    return function(all_games) {
        var matches = [];
        if (all_games.length == 0) {
            return matches;
        }
        var last_num = all_games[0].num;
        var match = {};
        for (var i=0; i<all_games.length; i++) {
            var game = all_games[i];
            if (last_num != game.num) {
                matches.push(match);
                match = {};
                last_num = game.num;
            }
            match[game.arena] = game;
        }
        matches.push(match);
        return matches;
    };
}();

var build_sessions = function() {
    return function(data, cb) {
        if (data.arenas == null || data.corners == null || data.matches == null || data.periods == null) {
            // can't do anything, but don't worry -- we'll get called
            // again once we have the data
            return;
        }

        var all_matches = group_matches(data.matches);
        var show_arena_title = should_show_arena_title(data.arenas);

        var num_corners = Object.values(data.corners).length;
        var all_corners = [];
        for (var _ in data.arenas) {
            all_corners = all_corners.concat(Object.values(data.corners));
        }

        var sessions = [];
        for (var i=0; i<data.periods.length; i++) {
            var period = data.periods[i];
            var matches = [];
            if (period.matches) {
                matches = all_matches.slice(period.matches.first_num,
                                            period.matches.last_num + 1);
                matches = convert_matches(num_corners, matches, data.arenas);
            }
            sessions.push({
                'show_arena_title': show_arena_title,
                'arenas': data.arenas,
                'all_corners': all_corners,
                'description': period.description,
                'start_time': new Date(period.start_time),
                'end_time': new Date(period.end_time),
                'max_end_time': new Date(period.max_end_time),
                'matches': matches
            });
        }
        cb(sessions);
    };
}();

var matches_for_team = function() {
    return function(input, team) {
        if (input == null || team == null || team.length == 0) {
            return input;
        }
        var output = input.filter(function(game) {
            // contains
            return game.teams.indexOf(team) != -1;
        });
        return output;
    };
}();

var unspent_matches = function() {
    var max_age = MAX_MATCH_AGE;
    var filter_matches = function(matches, when) {
        // todo: binary search?

        if (matches.length == 0) {
            // nothing to do
            return matches;
        }

        if (matches[0].time > when) {
            // all in future
            return matches;
        }

        if (matches[matches.length-1].time < when) {
            // all in past
            return [];
        }

        var output = matches.filter(function(match) {
            return match.time > when;
        });
        return output;
    };
    return function(sessions, hideOldMatches) {
        if (sessions == null || !hideOldMatches) {
            return sessions;
        }
        var output = [];
        var then = new Date();
        then.setTime(then.getTime() - 1000*max_age);
        for (var i=0; i<sessions.length; i++) {
            var session = sessions[i];
            var matches = filter_matches(session.matches, then);
            if (matches.length != 0) {
                var new_session = {
                    'show_arena_title': session.show_arena_title,
                    'description': session.description,
                    'all_corners': session.all_corners,
                    'arenas': session.arenas,
                    'matches': matches
                };
                output.push(new_session);
            }
        }
        return output;
    };
}();

var process_knockout_round = function() {
    var build_game = function(num_corners, info) {
        var ranking = {};
        if (info.scores) {
            ranking = info.scores.ranking;
        }
        return {
            "arena": info.arena,
            "ranking": ranking,
            "teams": ensure_whole_arena(num_corners, info.teams)
        };
    };
    var group_games = function(games) {
        // group the given games by number, assuming they're in order.
        var game_groups = [];
        var last_group = null;
        var last_num = null;

        for (var i=0; i<games.length; i++) {
            var game = games[i];
            if (last_num == game.num) {
                last_group.push(game);
            } else {
                last_group = [game];
                last_num   = game.num;
                game_groups.push(last_group);
            }
        }

        return game_groups;
    };
    return function(num_corners, round, options) {

        var game_groups = group_games(round);

        var matches = [];
        for (var i=0; i<game_groups.length; i++) {
            var match_games = game_groups[i];
            var number, description, time;
            var game_details = [];
            for (var j=0; j<match_games.length; j++) {
                var game = match_games[j];
                if (j == 0) {
                    number = game.num;
                    description = game.display_name;
                    time = match_timings(game, options).start;
                }
                game_details.push(build_game(num_corners, game));
            }

            matches.push({
                'num': number,
                'description': description,
                'time': time,
                'games': game_details
            });
        }
        return matches;
    };
}();

var process_knockouts = function() {
    return function(num_corners, rounds, tiebreaker, options) {
        var output = [];
        for (var i=0; i<rounds.length; i++) {
            output.push(process_knockout_round(num_corners, rounds[i], options));
        }

        if (tiebreaker) {
            output.push(process_knockout_round(num_corners, [tiebreaker], options));
        }

        return output;
    };
}();

// node require() based exports.
if (typeof(exports) != 'undefined') {
    exports.should_show_arena_title = should_show_arena_title;
    exports.compute_offset = compute_offset;
    exports.apply_offset = apply_offset;
    exports.match_timings = match_timings;
    exports.match_converter = match_converter;
    exports.convert_matches = convert_matches;
    exports.matches_for_team = matches_for_team;
    exports.unspent_matches = unspent_matches;
    exports.process_knockouts = process_knockouts;
    exports.process_knockout_round = process_knockout_round;
}
