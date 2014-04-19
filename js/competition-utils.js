
var TEAMS_PER_ARENA = 4;
var EMPTY_CORNER_SYMBOL = '-';

// age of match (by start time) to be hidden when the user wants
// to hide 'old' matches
var MAX_MATCH_AGE = 15 * 60; // 15 minutes in seconds

var league_sorter = function() {
    var _game_points = null;

    var sort_helper = function(a, b) {
        var val = b.points - a.points;
        if (val == 0) {
            a_game = _game_points[a.tla];
            b_game = _game_points[b.tla];
            return b_game - a_game;
        }
        return val;
    };

    var display_convert = function(rows, cutoff) {
        var last_score = 0;
        var last_pos = 1;
        for (var i=0; i<rows.length; i++) {
            var row = rows[i];
            if (row.points == last_score) {
                row.pos = '';
            } else {
                last_score = row.points;
                last_pos = row.pos = i+1;
            }
        }
        if (cutoff != null && rows.length > cutoff) {
            rows.splice(cutoff, 0, {'tla': '-', 'points': '-', 'pos': '-'});
        }
    };

    return function(league_points, cutoff, game_points) {
        var rows = [];
        _game_points = game_points;

        for (var tla in league_points) {
            var pts = league_points[tla];
            rows.push({'tla': tla, 'points': pts});
        }
        rows.sort(sort_helper);
        display_convert(rows, cutoff);
        return rows;
    };
}();

var gamepoints_sorter = function() {
    var sort_helper = function(a, b) {
        return a.tla.localeCompare(b.tla);
    };

    return function(points) {
        var rows = [];

        for (var tla in points) {
            var pts = points[tla];
            rows.push({'tla': tla, 'points': pts});
        }
        rows.sort(sort_helper);
        return rows;
    };
}();

var convert_matches = function() {
    return function(matches) {
        var output = [];
        for (var i=0; i<matches.length; i++) {
            output.push(match_converter(matches[i]));
        }
        return output;
    };
}();

var ensure_whole_arena = function() {
    var teams_per_arena = TEAMS_PER_ARENA;
    var empty_corner_symbol = EMPTY_CORNER_SYMBOL;
    return function(teams) {
        var output = teams.concat([]);
        for (var i=0; i<output.length; i++) {
            if (!output[i]) {
                output[i] = empty_corner_symbol;
            }
        }
        var missing = teams_per_arena - output.length;
        for (; missing > 0; missing--) {
            output = output.concat([empty_corner_symbol]);
        }
        return output;
    };
}();

var match_converter = function() {
    var convert_time = function(time_str) {
        var date = new Date(time_str);
        return date;
    };
    return function(match) {
        var output = { 'teams': [] };
        for (var arena in match) {
            var detail = match[arena];
            output.number = detail.num;
            output.time = convert_time(detail.start_time);
            var arena_teams = ensure_whole_arena(detail.teams);
            output.teams = output.teams.concat(arena_teams);
        }
        return output;
    };
}();

var matches_for_team = function() {
    return function(input, team) {
        if (team == null || team.length == 0) {
            return input;
        }
        var output = [];
        for (var i=0; i<input.length; i++) {
            var match = input[i];
            // contains
            if (match.teams.indexOf(team) >= 0) {
                output.push(match);
            }
        }
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

        var output = [];
        for (var i=0; i<matches.length; i++) {
            var match = matches[i];
            if (match.time > when) {
                output.push(match);
            }
        }
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
                    'description': session.description,
                    'arenas': session.arenas,
                    'matches': matches
                };
                output.push(new_session);
            }
        }
        return output;
    };
}();

// node require() based exports.
if (typeof(exports) != 'undefined') {
    exports.league_sorter = league_sorter;
    exports.gamepoints_sorter = gamepoints_sorter;
    exports.match_converter = match_converter;
    exports.convert_matches = convert_matches;
    exports.matches_for_team = matches_for_team;
    exports.unspent_matches = unspent_matches;
}
