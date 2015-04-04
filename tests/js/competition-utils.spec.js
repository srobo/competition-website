
var utils = require('../../js/competition-utils.js');

describe("The time offsetter", function() {
	it("should be defined", function() {
		expect(utils.compute_offset).toBeDefined();
		expect(utils.apply_offset).toBeDefined();
	});
	it("should round trip a time", function() {
		var then = new Date("2015-01-01");
		var now = new Date("2015-01-02");
		var offset = utils.compute_offset(then, now);
		var result = utils.apply_offset(offset, now);
		expect(result).toEqual(then);
	});

});

describe("The match schedule converter sorter helpers", function() {
	it("should be defined", function() {
		expect(utils.match_converter).toBeDefined();
		expect(utils.convert_matches).toBeDefined();
	});
	var input, expected;
	beforeEach(function() {
		arenas = { 'A': null, 'B': null };
		input = {
			'A': {
				'arena': 'A',
				'times': {
					'slot': {
						'end': 'Sat, 15 Mar 2014 00:05:00 GMT',
						'start': 'Sat, 15 Mar 2014 00:00:00 GMT'
					}
				},
				'num': 0,
				'teams': [ 'CLY', 'TTN', 'SCC', 'DSF' ]
			},
			'B': {
				'arena': 'B',
				'times': {
					'slot': {
						'end': 'Sat, 15 Mar 2014 00:05:00 GMT',
						'start': 'Sat, 15 Mar 2014 00:00:00 GMT'
					}
				},
				'num': 0,
				'teams': [ 'GRS', 'QMC', 'GRD', 'BRK' ]
			}
		};
		expected = {
			'num': 0,
			'time': new Date('2014-03-15 00:00:00'),
			'end_time': new Date('2014-03-15 00:05:00'),
			'teams': [ 'CLY', 'TTN', 'SCC', 'DSF', 'GRS', 'QMC', 'GRD', 'BRK' ]
		};
	});
	it("should flatten and simplify match descriptions", function() {
		var match = utils.match_converter(input, arenas);
		expect(match).toEqual(expected);
	});
	it("should flatten and simplify the collection of matches", function() {
		var matches = utils.convert_matches([input], arenas);
		expect(matches).toEqual([expected]);
	});
	it("should have correct teams alignment even when there are not the maximum number", function() {
		input.A.teams = input.A.teams.slice(0, 2);
		input.B.teams = input.B.teams.slice(0, 3);
		expected.teams = input.A.teams.concat(['-', '-'], input.B.teams, ['-']);
		var matches = utils.convert_matches([input], arenas);
		expect(matches).toEqual([expected]);
	});
	it("should handle the case where a match is only in one arena", function() {
		input = { 'B': input.B };
		expected.teams = new Array(4).concat(input.B.teams);
		var matches = utils.convert_matches([input], arenas);
		expect(matches).toEqual([expected]);
	});
	it("should put a suitable character in empty corners", function() {
		input.A.teams[0] = null;
		input.A.teams[3] = null;
		input.B.teams[1] = null;
		var expected_a = input.A.teams.concat([]);
		expected_a[0] = '-';
		expected_a[3] = '-';
		var expected_b = input.B.teams.concat([]);
		expected_b[1] = '-';
		expected.teams = expected_a.concat(expected_b);
		var matches = utils.convert_matches([input], arenas);
		expect(matches).toEqual([expected]);
	});
});

describe("The match team filterer", function() {
	it("should be defined", function() {
		expect(utils.matches_for_team).toBeDefined();
	});
	var match_0 = {
		'num': 0,
		'time': '00:00:00',
		'teams': [ 'MAI', 'TTN', 'SCC', 'DSF', 'GRS', 'QMC', 'GRD', 'BRK' ]
	};
	var match_1 = {
		'num': 1,
		'time': '00:05:00',
		'teams': [ 'MAI2', 'QMS', 'LSS', 'EMM', 'GRS', 'BDF', 'NHS', 'MEA' ]
	};
	var input = [match_0, match_1];
	it("should return a suitable value when no input is given", function() {
		var matches = utils.matches_for_team();
		expect(matches).toEqual(null);
	});
	it("should return all when null team is given", function() {
		var matches = utils.matches_for_team(input, null);
		expect(matches).toBe(input);
	});
	it("should return all when no team is given", function() {
		var matches = utils.matches_for_team(input);
		expect(matches).toBe(input);
	});
	it("should return all when empty team is given", function() {
		var matches = utils.matches_for_team(input, '');
		expect(matches).toBe(input);
	});
	it("should return all matches containing the given team", function() {
		var matches = utils.matches_for_team(input, 'GRS');
		expect(matches).toEqual(input);
	});
	it("should return only matches containing the given team", function() {
		var matches = utils.matches_for_team(input, 'EMM');
		expect(matches).toEqual([match_1]);
	});
	it("should return only matches containing the exact team", function() {
		var matches = utils.matches_for_team(input, 'MAI');
		expect(matches).toEqual([match_0]);
	});
	it("should return nothing when no results", function() {
		var matches = utils.matches_for_team(input, 'ABC');
		expect(matches).toEqual([]);
	});
});

describe("The unspent match filterer", function() {
	it("should be defined", function() {
		expect(utils.unspent_matches).toBeDefined();
	});
	var arenas, matches, sessions;
	beforeEach(function() {
		arenas = ['A', 'B'];
		matches = [{
				'num': 0,
				'time': new Date(), // now
				'teams': [ 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX' ]
			}, {
				'num': 1,
				'time': new Date(),
				'teams': [ 'CLY', 'TTN', 'SCC', 'DSF', 'GRS', 'QMC', 'GRD', 'BRK' ]
			}, {
				'num': 2,
				'time': new Date(),
				'teams': [ 'CLY2', 'TTN2', 'SCC2', 'DSF2', 'GRS2', 'QMC2', 'GRD2', 'BRK2' ]
		}];
		sessions = [{
			'arenas': arenas,
			'matches': matches
		}];
	});
	var adjust = function(date, howMuch) {
		date.setTime(date.getTime() + 1000*howMuch);
	};
	it("should return all when no filtering is requested", function() {
		var output = utils.unspent_matches(sessions, false);
		expect(output).toBe(sessions);
	});
	it("should return all when filtering is not requested", function() {
		var output = utils.unspent_matches(sessions);
		expect(output).toBe(sessions);
	});
	it("should return only matches in the future", function() {
		var sessions_clone = sessions.concat([]);
		adjust(matches[0].time, -3600);
		adjust(matches[1].time, +3600);
		adjust(matches[2].time, +3600);
		var output = utils.unspent_matches(sessions, true);
		var expected = [{
			'arenas': arenas,
			'matches': [matches[1], matches[2]]
		}];
		expect(output).toEqual(expected);

		// ensure we've not modified the original
		expect(sessions).toEqual(sessions_clone);
		expect(output).toNotBe(sessions);
	});
	it("should exclude sessions entirely in the past", function() {
		adjust(matches[0].time, -3600);
		adjust(matches[1].time, +3600);
		adjust(matches[2].time, +3600);
		var input = [{
			'arenas': arenas,
			'matches': [matches[0]]
		}, {
			'arenas': arenas,
			'matches': [matches[1], matches[2]]
		}];
		var output = utils.unspent_matches(input, true);
		var expected = [{
			'arenas': arenas,
			'matches': [matches[1], matches[2]]
		}];
		expect(output).toEqual(expected);
	});
	it("should not error about an already empty session", function() {
		sessions.push({
			'arenas': arenas,
			'matches': []
		});
		var output = utils.unspent_matches(sessions, true);
		var expected = [sessions[0]];
		expect(output).toEqual(expected);
	});
});

describe("The knockout round processor match filterer", function() {
	it("should be defined", function() {
		expect(utils.process_knockouts).toBeDefined();
		expect(utils.process_knockout_round).toBeDefined();
	});
	var round, expected;
	beforeEach(function() {
		// a round is a collection of games
		var teams_a = [ 'CLY', 'TTN', 'SCC', 'DSF' ];
		var teams_b = [ 'GRS', 'QMC', 'GRD', 'BRK' ];
		round = [{
			'arena': 'A',
			'num': 0,
			'display_name': 'Final (#0)',
			'times': {
				'slot': {
					'end': 'Sat, 15 Mar 2014 00:05:00 GMT',
					'start': 'Sat, 15 Mar 2014 00:00:00 GMT'
				}
			},
			'teams': teams_a
		},{
			'arena': 'B',
			'num': 0,
			'display_name': 'Final (#0)',
			'times': {
				'slot': {
					'end': 'Sat, 15 Mar 2014 00:05:00 GMT',
					'start': 'Sat, 15 Mar 2014 00:00:00 GMT'
				}
			},
			'teams': teams_b
		}];
		// it gets converted to a collection of match describing objects
		expected = [{
			'num': 0,
			'description': "Final (#0)",
			'time': new Date('2014-03-15 00:00:00'),
			'games': [{
					'arena': 'A',
					'teams': teams_a
				}, {
					'arena': 'B',
					'teams': teams_b
				}]
		}];
	});
	it("should suitably convert the data", function() {
		var output = utils.process_knockout_round(round, 0);
		expect(output).toEqual(expected);
	});
});
