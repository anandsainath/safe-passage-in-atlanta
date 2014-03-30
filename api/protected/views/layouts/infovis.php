
<?php //the theme file for the entire site.                                                                                                                                          ?>
<!DOCTYPE html>
<html>
    <head>
        <title>Safe Passage in Atlanta</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- jQuery -->
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script src="lib/d3.min.js"></script>
        <!-- Bootstrap -->
        <link href="bootstrap/css/bootstrap.css" rel="stylesheet">
        <link type="text/css" href="css/custom.css" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="css/nodeLink.css">
        <link href="css/ui-lightness/jquery-ui-1.10.3.custom.css" rel="stylesheet">

        <script src="js/jquery-ui-1.10.3.custom.js"></script>
        <script src="bootstrap/js/bootstrap.js"></script>
        <script src="js/nodeLink.js"></script>

        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->

        <script type="text/javascript">
            var transitMode = "drive",
                    nodeLinkMode = 'actual',
                    thresholdValue = 0.001,
                    startString = undefined;
            var temporalOverview, temporalDetailed;

            $(function() {
                $.googleDirections({
                    onDataLoaded: function() {
                        if ($('#page1').is(":visible")) {
                            showNodeLink(nodeLinkMode);
                        }
                        $('.modal').hide();
                    },
                    onError: function(status) {
                        if ($('#page1').is(":visible")) {
                            showError(status);
                        }
                        $('.modal').hide();
                    }
                });

                $("#slider").slider({
                    animate: true,
                    range: "min",
                    value: 100,
                    min: 100,
                    max: 500,
                    step: 100,
                    create: function(event, ui) {
                        $("#threshold").html("Threshold : 100");
                    },
                    change: function(event, ui) {
                        $("#threshold").html("Threshold : " + ui.value);
                        thresholdValue = ((ui.value) / 100000);

                        var args = {};
                        if (startString) {
                            args.start_date = startString;
                        }
                        args.json_string = JSON.stringify($.googleDirections.getRoutes());
                        args.threshold = thresholdValue;

                        $('.modal').show();
                        $.post('http://dev.infovis.com/get-data', args, function(data) {
                            $('#nodeLink > svg').children().remove();
                            $.googleDirections.setData($.parseJSON(data));
                            showNodeLink(nodeLinkMode);
                            loadPage2($.stackChart.getSelectedRouteID())
                            $('.modal').hide();
                        });
                    }
                });

                $('.js-btn').click(function() {
                    nodeLinkMode = $(this).attr('id');
                    showNodeLink(nodeLinkMode);
                });

                $('#sliderBtnLeft').click(function() {
                    $('#map-menu').animate({
                        left: '-100%'
                    }, {
                        duration: "slow",
                        easing: 'swing',
                        queue: false,
                        complete: function() {
                            $("#open-tab").show("fast");
                        }
                    });
                });

                $('#sliderBtnRight').click(function() {
                    $("#open-tab").hide("fast");
                    $('#map-menu').animate({
                        left: '-0%'
                    }, {
                        duration: "slow",
                        easing: 'swing',
                        queue: false,
                        complete: function() {
                        }
                    });

                });

                $('#addDestination').click(function() {
                    var countOfInput = $('#wayPoints').children().length;
                    var charCode = 97 + countOfInput;
                    var image = "images/alpha-" + String.fromCharCode(charCode) + ".png";
                    var $image = $('<img src="' + image + '" />');
                    var $input = $('<input class="form-control js-input" type="text" id="input-' + (countOfInput + 1) + '"/>');
                    new google.maps.places.Autocomplete($input[0]);
                    var $closeDiv = $('<div class="close js-close"><img src="images/close.png"/></div>');
                    var $div = $('<div class="node form-group"></div>');
                    $div.append($image).append($input).append($closeDiv);
                    $('#wayPoints').append($div);
                });

                $(document).on('click', '.js-close', function() {
                    if ($('#wayPoints').children().length > 2) {
                        $(this).parent().remove();
                    } else {
                        var $input = $(this).siblings('input');
                        $input.val("");
                    }
                    $('#getDirections').trigger('click');
                });

                $(document).on("click", '#suggestedRoutesList > li', function() {
                    $('.modal').show();
                    var routeID = $(this).data('route');
                    $('#sliderBtnLeft').trigger('click');
                    $('#page1').fadeOut('slow', function() {
                        $(this).hide();
                        $('#right-bar').hide();
                        $('#page2').fadeIn('slow', function() {
                            loadPage2(routeID);
                        });
                    });
                });

                $('#getDirections').click(function() {
                    doSearch();
                });

                $('.js-mode-btn').click(function() {
                    transitMode = $(this).attr('id');
                    doSearch();
                });

                $('#tempSliderBtnRight').click(function() {
                    $('#page2').fadeOut('slow', function() {
                        $(this).hide();
                        $('#page1').fadeIn('slow', function() {
                            $('#right-bar').show();
                            $('#sliderBtnRight').trigger('click');
                        });
                    });
                });
            });

            function loadPage2(routeID) {
                $('#stackedAreaChart > svg').children().remove();
                $('#overview > svg').children().remove();
                $('#detailed > svg').children().remove();

                $.stackChart({
                    svgSelector: '#stackedAreaChart > svg',
                    directions: $.googleDirections.getRoutes(),
                    crimeStats: $.googleDirections.getStackAreaData()
                });
                $.stackChart.showStackedChart(routeID);

                $(document).on('click', '.div-modal', function() {
                    var routeID = $(this).parent().data().round;
                    $('.modal').show();
                    $('#stackedAreaChart > svg').empty();
                    for (var i = 0; i < $.googleDirections.getRoutes().routes.length; i++) {
                        if (i === routeID) {
                            console.log("Showing Route Number: " + routeID);
                            var modal = $('#temporalContainer').children().eq(i).css('opacity', 1).find('div.div-modal').hide();
                        } else {
                            $('#temporalContainer').children().eq(i).css('opacity', 0.20);
                            var modal = $('#temporalContainer').children().eq(i).find('div.div-modal');
                            modal.height(910);
                            modal.width(modal.parent().width());
                            modal.show();
                        }
                    }
                    $.stackChart.showStackedChart(routeID);
                    $('.modal').hide();
                });

                var no_of_columns = 12 / $.googleDirections.getRoutes().routes.length;

                var tpl = '<div class="col-xs-{{no_of_columns}}" data-round="{{round_number}}"><div class="div-modal"></div><div class="bottom-div"><h6>{{route_name}}</h6><ul class="nav nav-pills" style="margin-left: 20%"><li class="active"><a href="#{{overview_tab_id}}" data-toggle="tab">Temporal Overview</a></li><li><a href="#{{detailed_tab_id}}" data-toggle="tab">Temporal Detailed</a></li></ul><div class="tab-content"><div class="tab-pane fade in active" id="{{overview_tab_id}}"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><marker xmlns="http://www.w3.org/2000/svg" id="{{mkArrow_id}}" viewBox="-15 -5 20 20" refX="0" refY="0" markerUnits="strokeWidth" markerWidth="20" markerHeight="16" orient="auto"><path d="M -15 -5 L 0 0 L -15 5 z" fill="black"/></marker></defs></svg></div><div class="tab-pane fade" id="{{detailed_tab_id}}"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg></div></div></div></div>';
                $('#temporalContainer').empty();
                $.each($.googleDirections.getRoutes().routes, function(index, route) {
                    var div = tpl.replace('{{route_name}}', route.summary).replace('{{no_of_columns}}', no_of_columns).replace('{{round_number}}', index);
                    div = div.replace(/{{overview_tab_id}}/g, 'overview' + index).replace(/{{detailed_tab_id}}/g, 'detailed' + index).replace('{{mkArrow_id', 'mkArrow' + index);
                    $('#temporalContainer').append(div);
                });

                for (var i = 0; i < $.googleDirections.getRoutes().routes.length; i++) {
                    if (i !== routeID) {
                        $('#temporalContainer').children().eq(i).css('opacity', 0.20);

                        var modal = $('#temporalContainer').children().eq(i).find('div.div-modal');
                        modal.height(910);
                        modal.width(modal.parent().width());
                        modal.show();
                    }
                }

                if ($.googleDirections.getRoutes().routes.length === 2) {
                    $('#temporalContainer').children('div:first').find('div.bottom-div').css('margin-left', '250px');
                }

                if ($.googleDirections.getRoutes().routes.length >= 1) {
                    temporalOverview = $('#overview0').temporalOverview({
                        svgSelector: '#overview0 > svg',
                        data: $.googleDirections.getTemporalData(0),
                        onEventOccured: function(eventType, isSelected, eventArgs) {
                            temporalDetailed.processEvent(eventType, isSelected, eventArgs);
                        }
                    });

                    temporalDetailed = $('#detailed0').temporalDetailed({
                        svgSelector: '#detailed0 > svg',
                        data: $.googleDirections.getTemporalData(0),
                        onEventOccured: function(eventType, isSelected, eventArgs) {
                            temporalOverview.processEvent(eventType, isSelected, eventArgs);
                        }
                    });

                    temporalOverview.renderKey();
                }

                if ($.googleDirections.getRoutes().routes.length >= 2) {
                    var leftTemporalOverview, leftTemporalDetailed;
                    leftTemporalOverview = $('#overview1').temporalOverview({
                        svgSelector: '#overview1 > svg',
                        data: $.googleDirections.getTemporalData(1),
                        onEventOccured: function(eventType, isSelected, eventArgs) {
                            leftTemporalDetailed.processEvent(eventType, isSelected, eventArgs);
                        }
                    });

                    leftTemporalDetailed = $('#detailed1').temporalDetailed({
                        svgSelector: '#detailed1 > svg',
                        data: $.googleDirections.getTemporalData(1),
                        onEventOccured: function(eventType, isSelected, eventArgs) {
                            temporalOverview.processEvent(eventType, isSelected, eventArgs);
                        }
                    });
                }

                if ($.googleDirections.getRoutes().routes.length >= 3) {
                    var rightTemporalOverview, rightTemporalDetailed;
                    rightTemporalOverview = $('#overview2').temporalOverview({
                        svgSelector: '#overview2 > svg',
                        data: $.googleDirections.getTemporalData(2),
                        onEventOccured: function(eventType, isSelected, eventArgs) {
                            rightTemporalDetailed.processEvent(eventType, isSelected, eventArgs);
                        }
                    });

                    rightTemporalDetailed = $('#detailed2').temporalDetailed({
                        svgSelector: '#detailed2 > svg',
                        data: $.googleDirections.getTemporalData(2),
                        onEventOccured: function(eventType, isSelected, eventArgs) {
                            rightTemporalOverview.processEvent(eventType, isSelected, eventArgs);
                        }
                    });
                }

                $('.js-tab-btn').click(function() {
                    var targetID = $(this).data('href');
                    $('.js-active-tab').fadeOut('slow', function() {
                        $(this).removeClass('js-active-tab').hide();
                        $(targetID).fadeIn('slow', function() {
                            $(this).addClass('js-active-tab').show();
                        });
                    });
                });
                $('.modal').hide();

                $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
                    switch ($(e.target).attr('href')) {
                        case '#overview0':
                        case '#overview1':
                        case '#overview2':
                            $('#keyDiv > svg').empty();
                            temporalOverview.renderKey();
                            break;
                        case '#detailed0':
                        case '#detailed1':
                        case '#detailed2':
                            $('#keyDiv > svg').empty();
                            temporalDetailed.renderKey();
                            break;
                    }
                    console.log($(e.target).attr('href'), $(e.relatedTarget).attr('href'));
                });
            }

            function googleMapsInitialized() {
                drawMap('33.78302,-84.394401');
                //function called once the google maps has been initialized..
                $('.js-input').each(function(index, value) {
                    new google.maps.places.Autocomplete($(this)[0]);
                });
            }

            function dateToString(today) {
                var dd = today.getDate();
                var mm = today.getMonth() + 1;

                var yyyy = today.getFullYear();

                if (dd < 10) {
                    dd = '0' + dd
                }
                if (mm < 10) {
                    mm = '0' + mm
                }
                var result = mm + '/' + dd + '/' + yyyy;
                return result;
            }

            function getOption(sel) {
                if (sel.options[sel.selectedIndex].value == "Last year") {
                    var start = new Date();
                    var end = new Date();
                    start.setMonth(start.getMonth() - 12);
                    startString = dateToString(start);

                } else if (sel.options[sel.selectedIndex].value == "Last 2 years") {
                    var start = new Date();
                    var end = new Date();
                    start.setMonth(start.getMonth() - 24);
                    startString = dateToString(start);
                }

                var args = {};
                if (startString) {
                    args.start_date = startString;
                }
                args.json_string = JSON.stringify($.googleDirections.getRoutes());
                args.threshold = thresholdValue;

                $('.modal').show();
                $.post('http://dev.infovis.com/get-data', args, function(data) {
                    $('#nodeLink > svg').children().remove();
                    $.googleDirections.setData($.parseJSON(data));
                    showNodeLink(nodeLinkMode);
                    loadPage2($.stackChart.getSelectedRouteID())
                    $('.modal').hide();
                });
            }

            function doSearch() {
                $('.modal').show();
                if ($('.js-input').length === 2 && ($('.js-input:first').val() === "" || $('.js-input:last').val() === "")) {
                    return;
                }
                var wayPoints = [];
                $('.js-input').not(':first').not(':last').each(function(index, value) {
                    wayPoints.push({
                        location: $(this).val(),
                        stopover: false
                    });
                });
                drawMap('33.78302,-84.394401');
                requestDirections($('.js-input:first').val(), $('.js-input:last').val(), wayPoints, 0, true, transitMode);
                $.googleDirections.getDirections($('.js-input:first').val(), $('.js-input:last').val(), wayPoints, transitMode);
            }

            var directionDisplay;
            var directionsRenderer;
            var directionsService;
            var map;
            var directionsRenderer;

            function drawMap(midpoint) {
                directionsService = new google.maps.DirectionsService();
                var mid = midpoint.split(",");
                var start = new google.maps.LatLng(mid[0], mid[1]);
                var myOptions = {
                    zoom: 7,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: start,
                    mapTypeControl: false
                }
                map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
            }

            function getRendererOptions(main_route)
            {
                if (main_route)
                {
                    var _colour = '#00458E';
                    var _strokeWeight = 2;
                    var _strokeOpacity = 1.0;
                    var _suppressMarkers = false;
                }
                else
                {
                    var _colour = '#ED1C24';
                    var _strokeWeight = 2;
                    var _strokeOpacity = 1;
                    var _suppressMarkers = false;
                }

                var polylineOptions = {strokeColor: _colour, strokeWeight: _strokeWeight, strokeOpacity: _strokeOpacity};

                var rendererOptions = {draggable: false, suppressMarkers: _suppressMarkers, polylineOptions: polylineOptions};

                return rendererOptions;
            }

            function renderDirections(result, rendererOptions, routeToDisplay)
            {


                var _colour = colors(routeToDisplay);
                var _strokeWeight = 2;
                var _strokeOpacity = 1.0;
                var _suppressMarkers = false;

                // if (routeToDisplay == 0) _colour = "#FF0000";
                // create new renderer object
                directionsRenderer = new google.maps.DirectionsRenderer({
                    draggable: false,
                    suppressMarkers: _suppressMarkers,
                    polylineOptions: {
                        strokeColor: _colour,
                        strokeWeight: _strokeWeight,
                        strokeOpacity: _strokeOpacity
                    }
                });
                directionsRenderer.setMap(map);

                directionsRenderer.setDirections(result);
                directionsRenderer.setRouteIndex(routeToDisplay);
            }

            function requestDirections(start, end, wayPoints, routeToDisplay, main_route) {
                var travelMode = google.maps.TravelMode.DRIVING;
                switch (transitMode) {
                    case "private":
                        travelMode = google.maps.TravelMode.DRIVING;
                        break;
                    case "public":
                        travelMode = google.maps.TravelMode.TRANSIT;
                        break;
                    case "walk":
                        travelMode = google.maps.TravelMode.WALKING;
                        break;
                    case "cycle":
                        travelMode = google.maps.TravelMode.BICYCLING;
                        break;
                }
                var request = {
                    origin: start,
                    destination: end,
                    travelMode: travelMode,
                    provideRouteAlternatives: true,
                    waypoints: wayPoints
                };


                directionsService.route(request, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        if (main_route) {
                            var rendererOptions = getRendererOptions(true);
                            for (var i = 0; i < result.routes.length; i++) {
                                renderDirections(result, rendererOptions, i);
                            }
                        }
                        else {
                            var rendererOptions = getRendererOptions(false);
                            renderDirections(result, rendererOptions, routeToDisplay);
                        }
                    }
                });
            }
        </script>
    </head>
    <body>
        <div class="modal"></div>
        <div role="navigation" class="navbar navbar-inverse navbar-fixed-top">
            <div class="container">
                <div class="navbar-header">
                    <a href="#" class="navbar-brand" id="tempSliderBtnRight">Safe Passages in Atlanta</a>
                </div>

                <div id = "radiusSlider" class="nav pull-right">
                    <div id="slider"></div>
                </div>
                <p class="navbar-text navbar-right" id="threshold">Threshold: </p>
                <div id = "timeSelector" class="nav pull-right">
                    <select class="form-control" onchange="getOption(this)">
                        <option>All Time</option>
                        <option>Last year</option>
                        <option>Last 2 years</option>
                    </select>
                </div>
                <p class="navbar-text navbar-right">Time period: </p>

            </div>
        </div>

        <div class="jumbo">
            <?php echo $content; ?>
        </div>

        <nav id="map-menu">
            <div id="top-bar" class="row">
                <div class="btn-group" id="nav_modes">
                    <button type="button" id="drive" class="btn btn-default js-mode-btn"><img src="images/mode-drive.png"/>
                    </button>
                    <button type="button" id="walk" class="btn btn-default js-mode-btn"><img src="images/mode-walk.png"/>
                    </button>
                    <button type="button" id="cycle" class="btn btn-default js-mode-btn"><img src="images/mode-cycle.png"/>
                    </button>
                </div>
                <span class="arrow" id="sliderBtnLeft"> <img src="images/arrow-left.png"/> </span>
            </div>

            <div id="places" class="row">
                <div id="wayPoints">
                    <div class="node form-group">
                        <img src="images/alpha-a.png"/>
                        <input class="form-control js-input" type="text" id="input-1"/>
                        <div class="close js-close">
                            <img src="images/close.png"/>
                        </div>
                    </div>
                    <div class="node form-group">
                        <img src="images/alpha-b.png"/>
                        <input class="form-control js-input" type="text" id="input-2"/>
                        <div class="close js-close">
                            <img src="images/close.png"/>
                        </div>
                    </div>
                </div>
                <div id="button">
                    <span class="link" id="addDestination">Add Destination</span>
                    <button id="getDirections" class="btn btn-primary">
                        Get Directions
                    </button>
                </div>
            </div>

            <div id="routes" class="row hidden">
                <div class="header">
                    <span> <img src="images/arrow-left.png"/> </span>
                    <h5>Suggested Routes</h5>
                </div>

                <ul class="list-unstyled" id='suggestedRoutesList'></ul>
            </div>
            <div id="map_canvas"  style="width: 300px; height: 300px"></div>
            <div id="direction" class="row hidden">
                <div class="header">
                    <h5> Driving Direction to Atlanta Airport </h5>
                </div>
                <div class="point row">
                    <img src="images/start.png"/>
                    <div class="pull-left">
                        <span class="location">I-75/I-85 S </span>
                        <span class="pin">Atlanta, GA, 30363 </span>
                    </div>
                </div>
                <ol>
                    <li class="row">
                        <span>1. <span class="bold">16th St NW</span> turns slightly right and becomes Techwood Dr NW</span>
                    </li>
                    <li class="row">
                        <span>1. <span class="bold">16th St NW</span> turns slightly right and becomes Techwood Dr NW</span>
                    </li>
                    <li class="row">
                        <span>1. <span class="bold">16th St NW</span> turns slightly right and becomes Techwood Dr NW</span>
                    </li>
                    <li class="row">
                        <span>1. <span class="bold">16th St NW</span> turns slightly right and becomes Techwood Dr NW</span>
                    </li>
                </ol>
                <div class="point row">
                    <img src="images/start.png"/>
                    <div class="pull-left">
                        <span class="location">Hartsfield Jackson Atlanta Airport</span>
                        <span class="pin">6000 N Terminal Pkwy, Atlanta, GA 30320 </span>
                    </div>
                </div>
            </div>
        </nav>

        <nav id="open-tab">

            <div class="arrow" id="sliderBtnRight">
                <span class="glyphicon glyphicon-th-large"></span>
            </div>
        </nav>
    </body>

</html>