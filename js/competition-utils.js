
var league_sorter = function() {
    var sort_helper = function(a, b) {
        return b.points - a.points;
    }
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
    }
    return function(points, cutoff) {
        var rows = [];

        for (var tla in points) {
            var pts = points[tla];
            rows.push({'tla': tla, 'points': pts});
        }
        rows.sort(sort_helper);
        display_convert(rows, cutoff);
        return rows;
    };
}();

// node require() based exports.
if (typeof(exports) != 'undefined') {
    exports.league_sorter = league_sorter;
}
