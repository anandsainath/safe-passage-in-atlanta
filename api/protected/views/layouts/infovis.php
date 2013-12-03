<?php //the theme file for the entire site.     ?>
<!DOCTYPE html>
<html>
    <head>
        <title>Safe Passage in Atlanta</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- jQuery -->
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script src="lib/d3.min.js"></script>
        <!-- Bootstrap -->
        <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link type="text/css" href="css/custom.css" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="css/nodeLink.css">


        <script src="js/nodeLink.js"></script>

        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
          <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
          <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->

        <script type="text/javascript">
            var transitMode = "private";
            $(function() {
                $('.js-btn').click(function() {
                    showNodeLink($(this).attr('id'));
                });

                $('#sliderBtnLeft').click(function() {
                    $('#map-menu').animate({left: '-100%'}, {
                        duration: "slow",
                        easing: 'swing',
                        queue: false,
                        complete: function() {
                            console.log("Transition is complete!");
                        }
                    });
                });

                $('#tempSliderBtnRight').click(function() {
                    $('#map-menu').animate({left: "0%"}, {
                        duration: "slow",
                        easing: "swing",
                        queue: false,
                        complete: function() {
                            console.log("Transition is complete");
                            }
                        });
                        return false;
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

                    $('#getDirections').click(function() {
                        doSearch();
                    });

                    $('.js-mode-btn').click(function() {
                        transitMode = $(this).attr('id');
                        doSearch();
                    });
                });

                function doSearch() {
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
                    beginSearch($('.js-input:first').val(), $('.js-input:last').val(), wayPoints, transitMode);
                }
        </script>
    </head>
    <body>
        <div role="navigation" class="navbar navbar-inverse navbar-fixed-top">
            <div class="container">
                <div class="navbar-header">
                    <a href="#" class="navbar-brand" id="tempSliderBtnRight">Safe Passages in Atlanta</a>
                </div>
            </div>
        </div>

        <div class="jumbo">
            <?php echo $content; ?>
        </div>

        <nav id="map-menu">
            <div id="top-bar" class="row">
                <div class="btn-group">
                    <button type="button" id="private" class="btn btn-default js-mode-btn"><img src="images/mode-drive.png"/></button>
                    <button type="button" id="public" class="btn btn-default js-mode-btn"><img src="images/mode-public.png"/></button>
                    <button type="button" id="walk" class="btn btn-default js-mode-btn"><img src="images/mode-walk.png"/></button>
                    <button type="button" id="cycle" class="btn btn-default js-mode-btn"><img src="images/mode-cycle.png"/></button>
                </div>
                <span class="arrow" id="sliderBtnLeft">
                    <img src="images/arrow-left.png"/>
                </span>
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
                    <button id="getDirections" class="btn btn-primary">Get Directions</button> 
                </div>
            </div>

            <div id="routes" class="row hidden">
                <div class="header">
                    <span>
                        <img src="images/arrow-left.png"/>
                    </span>
                    <h5>Suggested Routes</h5>
                </div>

                <ul class="list-unstyled" id='suggestedRoutesList'></ul>
            </div>

            <div id="direction" class="row hidden">
                <div class="header">
                    <h5>
                        Driving Direction to Atlanta Airport
                    </h5>
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
                    </li><li class="row"> 
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
    </body>
</html>