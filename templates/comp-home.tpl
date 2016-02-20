{*
Competition specific functionality for the home page.
This page assumes that it will only be included in the home page,
and that its dependencies (CSS and JS) will be included there suitably.
*}

<!-- TODO:
* Add an outline of and link to the rules?
-->

	<header>
		<a href="{$root_uri}"><img src="{$root_uri}images/template/website_logo.png" alt="Student Robotics Logo" /></a>
		<div id="navwrapper">
		<ul>
			<li><a href="{$root_uri}about">About Us</a></li>
			<li><a href="{$root_uri}ide">IDE</a></li>
			<li><a href="{$root_uri}docs/">Docs</a></li>
		</ul>
		</div>
	</header>

	<div class="content">
		<div id="competition">
			<span class="top-links" id="more-link">
				<a href="{$root_uri}events/sr2016/2016-04-30-competition">Tell me more...</a>
			</span>
			<h1 style="text-align: center;">SR2016 Live!</h1>
			<div id="live-stream-wrapper">
				<div id="live-stream-controls">
					<a id="live-stream-a-link" class="selected" href="#">Arena A</a> |
					<a id="live-stream-b-link" href="#">Arena B</a> |
					<a id="live-stream-hide-link" href="#">No stream</a>
				</div>
				<div id="live-stream-a"></div>
				<div id="live-stream-b"></div>
			</div>
			<div id="match-info">
{literal}
<div class="scored match" style="position:relative;margin-top:10px;">
	<span style="position:absolute;margin-left:50px;left:0">
		<a href="{/literal}{$root_uri}{literal}comp/points">more scores...</a>
	</span>
	<h4>
		Latest Scores<span data-ng-if="previous_match">: {{previous_match.display_name}}</span>
	</h4>
	<span data-ng-if="!previous_match">No scores yet recorded.</span>
	<div class="game headings"
	     data-ng-repeat-start="(arena, game) in previous_match.games"
	     data-ng-class="{single: $first}"
	     data-ng-show="!$first || $last">
		<h4>&nbsp;</h4>
		<table class="scores"
		       data-ng-if="game.scores">
			<thead>
				<tr>
					<th>&nbsp;</th>
				</tr>
			</thead>
			<tr data-ng-repeat="(type, scores) in game.scores">
				<th>{{type|titleCase}}</th>
			</tr>
		</table>
	</div>
	<div class="game" data-ng-repeat-end>
		<h4 style="color: {{arenas[arena].colour}};">Arena {{arenas[arena].display_name}}</h4>
		<table class="scores"
		       data-ng-if="game.scores">
			<thead>
				<tr>
					<th data-ng-repeat="tla in game.teams track by $index"
					    title="{{team|teamInfo:teams|teamName}}">
						{{tla}}
						<span data-ng-if="!tla">-</span>
					</th>
				</tr>
			</thead>
			<tr data-ng-repeat="(type, scores) in game.scores">
				<td data-ng-repeat="tla in game.teams track by $index">
					<span data-ng-if="type != 'ranking'">
						{{scores[tla]}}
					</span>
					<span data-ng-if="type == 'ranking'">
						{{scores[tla]|ordinal}}
					</span>
				</td>
			</tr>
		</table>
		<p data-ng-if="!game.scores">No scores yet recorded for this game.</p>
	</div>
</div>
<script type="text/ng-template" id="match-info">
	<h4>{{data.description}}: {{data.match.display_name}}</h4>
	<div class="game headings"
	     data-ng-repeat-start="(arena, game) in data.match.games"
	     data-ng-class="{single: $first}"
	     data-ng-show="!$first || $last">
		<table>
			<thead>
				<tr>
					<th>Corner</th>
				</tr>
			</thead>
			<tr>
				<th>Team</th>
			</tr>
		</table>
	</div>
	<div class="game" data-ng-repeat-end>
		<table>
			<thead>
				<tr>
					<th data-ng-repeat="tla in game.teams track by $index">
						{{$index}}
					</th>
				</tr>
			</thead>
			<tr>
				<td data-ng-repeat="tla in game.teams track by $index" title="{{tla|teamInfo:teams|teamName}}">
					{{tla}}
					<span data-ng-if="!tla">-</span>
				</td>
			</tr>
		</table>
	</div>
</script>

<div class="current match"
     data-ng-if="current_match.exists"
     data-ng-init="data={description:'Current',match:current_match}"
     data-ng-include="'match-info'">
</div>
<div class="match"
     data-ng-if="next_match.exists"
     data-ng-init="data={description:'Next',match:next_match}"
     data-ng-include="'match-info'">
</div>
<div class="match"
     data-ng-if="upcoming_match.exists"
     data-ng-init="data={description:'Upcoming',match:upcoming_match}"
     data-ng-include="'match-info'">
</div>

{/literal}
			</div>

			<div id="leaderboard-container" class="info-box">
				<!-- TODO: maybe move to left so that you read this first
				   this tells you that the TLAs are teams -->
				<span class="more-link">
					<a href="{$root_uri}comp/league">more...</a>
				</span>
				<h2><a href="{$root_uri}comp/league">Leaderboard</a></h2>
				<div id="leaderboard">
{literal}
<table>
	<thead>
		<tr>
			<th>Position</th>
			<th>Points</th>
			<th>Team</th>
		</tr>
	</thead>
	<tr data-ng-repeat="team in teams|leaderboard:10" id="{{team.tla}}">
		<td>{{team.league_pos}}</td>
		<td>{{team.scores.league}}</td>
		<td title="{{team|teamName}}">
			<a href="{/literal}{$root_uri}{literal}teams/{{item.tla}}">{{team.tla}}</a>
		</td>
	</tr>
</table>
{/literal}
				</div>
			</div>

			<br style="clear: left;" />

			<div style="width: 600px" class="info-box">
				<span class="more-link">
					<a href="{$root_uri}comp/schedule">more...</a>
				</span>
				<h2><a href="{$root_uri}comp/schedule">Match Schedule</a></h2>
				<div id="match_sched">
{literal}
<table class="schedule">
	<thead>
		<tr>
			<th>Time</th>
			<th>Match</th>
			<th data-ng-repeat="arena in arenas" colspan="4" style="color: {{arena.colour}};">Arena {{arena.display_name}}</th>
		</tr>
	</thead>
	<tbody>
		<tr data-ng-repeat="match in matches|matchesEndingAfterNow:time_offset|limitTo:10"
			data-ng-class="{current: match.num==current_match.num}"
			id="match-{{match.num}}">
			<td title="Begins at {{match.time|date:'HH:mm:ss on EEEE, d MMMM'}}.">{{match.time|date:'HH:mm'}}</td>
			<td title="{{match.display_name}}">{{match.num}}</td>
			<td data-ng-repeat="team in match.teams track by $index"
				data-ng-class="{no_match: !team}"
				title="{{team|teamInfo:teams|teamName}}">
				<!--- TODO: non-literal filtering, possibly based on the existence of the page -->
				<a data-ng-if="team && team != '-'"
				   href="{/literal}{$root_uri}{literal}teams/{{team}}">{{team}}</a>
				<span data-ng-if="team == '-'">{{team}}</span>
			</td>
		</tr>
	</tbody>
</table>
{/literal}
				</div>
			</div>
		</div>

		<div id="boxWrapper">
			<div class="box">
				<h3><a href="{$root_uri}about">Who are we?</a></h3>
				<p>
					<!-- TODO: or something better -->
					Student Robotics run an annual robotics <a href="{$root_uri}schools/game">competition</a>
					for sixth-form schools and colleges.
					All of the <a href="{$root_uri}schools/kit">kit</a> the schools &amp; colleges use is designed, built, tested and distributed by us.
					Student Robotics is run, in its entirety, by a <a href="{$root_uri}about/committee">team</a> of university students and recent graduates
					&mdash; mainly from the Universities of <a href="http://www.soton.ac.uk">Southampton</a> and <a href="http://bristol.ac.uk">Bristol</a>.
				</p>
			</div>
			<div class="box">
				<h3><a href="https://twitter.com/StudentRobotics">Tweets from @StudentRobotics</a></h3>
				<p>
					<a width="450" height="300"
					   class="twitter-timeline"
					   data-dnt="true"
					   data-chrome="noheader nofooter"
					   data-widget-id="321728443496660993"
					   href="https://twitter.com/StudentRobotics"
					   >
						Tweets from @StudentRobotics
					</a>
					<script id="twitter-wjs" src="https://platform.twitter.com/widgets.js"></script>
				</p>
			</div>
		</div>
	</div>
