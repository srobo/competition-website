
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

// node require() based exports.
if (typeof(exports) != 'undefined') {
    exports.league_sorter = league_sorter;
    exports.gamepoints_sorter = gamepoints_sorter;
}
