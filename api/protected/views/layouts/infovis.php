
<?php //the theme file for the entire site.                                                                  ?>
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
                            console.log("Transition is complete!");

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
                    console.log("Clicked!");
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

                $.temporalOverview({
                    svgSelector: '#overview > svg',
                    data: $.googleDirections.getTemporalData(),
                    onEventOccured: function(eventType, isSelected, eventArgs) {
                        console.log(eventType, isSelected, eventArgs);
                        $.temporalDetailed.processEvent(eventType, isSelected, eventArgs);
                    }
                });

                $.temporalDetailed({
                    svgSelector: '#detailed > svg',
                    data: $.googleDirections.getTemporalData(),
                    onEventOccured: function(eventType, isSelected, eventArgs) {
                        $.temporalOverview.processEvent(eventType, isSelected, eventArgs);
                    }
                });

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
                console.log('inside request directions ' + start);
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