<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB" data-ng-app="app">

<head>
	<title>{getFromContent get="title"} | Student Robotics</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta name="keywords" content="{getFromContent get='keywords'}" />
	<meta name="description" content="{getFromContent get='description'}" />
	<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/select2/3.4.5/select2.min.css" />
	<link rel="stylesheet" type="text/css" href="{$root_uri}css/main.css" />
	<link rel="stylesheet" type="text/css" href="{$root_uri}css/comp.css" />
	<link rel="stylesheet" type="text/css" media="print" href="{$root_uri}css/print.css" />
	<link rel="stylesheet" type="text/css" href="{$root_uri}css/comp_extra.css" />
	<link rel="alternate" type="application/rss+xml" title="SR RSS" href="{$root_uri}feed.php" />
	<link rel="shortcut icon" href="{$root_uri}images/template/favicon.ico" />

	<script type="text/javascript">
		var API_ROOT = "/comp-api";
	</script>

	<script type="text/javascript" src="{$root_uri}js/polyfill.js"></script>
	<script type="text/javascript" src="{$root_uri}js/competition-utils.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/select2/3.4.5/select2.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.1/angular.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.1/angular-resource.min.js"></script>
	<script type="text/javascript" src="{$root_uri}js/lib/angular-storage/ngStorage.min.js"></script>
	<script type="text/javascript" src="{$root_uri}js/lib/angular-ui-select2/src/select2.js"></script>
	<script type="text/javascript" src="{$root_uri}js/competition-filters.js"></script>
	<script type="text/javascript" src="{$root_uri}js/competition-resources.js"></script>
	<script type="text/javascript" src="{$root_uri}js/controllers/{getFromContent get='angular_controller'}.js"></script>

	{include file="tracking.tpl"}
</head>

<body data-ng-controller="{getFromContent get='angular_controller'}">
{include file="tracking-image.tpl"}
<div id="pageWrapper">

	{include file=$header_file}


	<div id="{$page_id}" class="content">

		{getFromContent get="content"}
		<p></p>

	</div>

	<div id="original">
		Original: <a href="{$root_uri}content/{$original}">{$original}</a>
	</div>


	{include file=$footer_file}

</div>

</body>

</html>
