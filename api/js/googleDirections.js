/**
 jQuery plugin to handle all the data fetch related activities.
 **/
;
(function($, undefined) {
    "use strict";
    var opts = {},
            googleDirections = $.googleDirections = function() {
                //constructor function..
                googleDirections.init(arguments[0]);
            };

    $.extend(googleDirections, {
        /** Plugin default configuration values.. **/
        version: 1,
        defaults: {
            debug: true,
            mapDirections: undefined,
            GOOGLE_MAPS_API_KEY: "AIzaSyCYqCxPtH-HeBNSp6yHUfHAuVaMLbccqv4",
            onDataLoaded: function() {

            },
            onError: function(status) {

            }
        },
        /*** GLOBAL Functions ***/
        /**
         * Initialization function..
         * @param {Object} options
         */
        init: function(options) {
            if (opts.debug) {
                console.log("Init called in googleDirections.js");
            }
            /** Extending the default options of the plugin.. **/
            opts = $.extend(true, {}, googleDirections.defaults, options);

            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://maps.googleapis.com/maps/api/js?key=" + opts.GOOGLE_MAPS_API_KEY + "&sensor=false&callback=googleMapsInitialized&libraries=places";
            document.body.appendChild(script);
        },
        getDirections: function(from, to, wayPoints, mode) {
            from = from || "470 16th St, Atlanta, GA";
            to = to || "Atlanta International Airport";
            mode = mode || 'drive';

            var travelMode;
            switch (mode) {
                case 'drive':
                    travelMode = google.maps.TravelMode.DRIVING;
                    break;
                case 'cycle':
                    travelMode = google.maps.TravelMode.BICYCLING;
                    break;
                case 'walk':
                    travelMode = google.maps.TravelMode.WALKING;
                    break;
            }

            var directionsService = new google.maps.DirectionsService();
            var routeOptions = {
                origin: from,
                destination: to,
                provideRouteAlternatives: true,
                travelMode: travelMode,
                unitSystem: google.maps.UnitSystem.IMPERIAL
            };

            if (wayPoints && wayPoints.length > 0) {
                routeOptions.waypoints = wayPoints;
            }

            directionsService.route(routeOptions, function(result, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    var wayPoints = [];
                    var routes = [];
                    var routeID = 0;

                    $.each(result.routes, function(index, route) {
                        var routePoints = [];
                        var routeEntityPoints = [];

                        $.each(route.legs, function(index, leg) {
                            var majorWayPoint = {
                                'latitude': leg.steps[0].start_location.lat(),
                                'longitude': leg.steps[0].start_location.lng(),
                                'major': "true"
                            };
                            routePoints.push(majorWayPoint);
                            routeEntityPoints.push(majorWayPoint);

                            $.each(leg.steps, function(index, step) {

                                $.each(step.path, function(index, pathEntity) {
                                    routePoints.push({
                                        'latitude': pathEntity.lat(),
                                        'longitude': pathEntity.lng(),
                                        'major': "false"
                                    });
                                });

                                var majorWayPoint = {
                                    'latitude': step.end_location.lat(),
                                    'longitude': step.end_location.lng(),
                                    'major': "true"
                                };

                                routePoints.push(majorWayPoint);
                                routeEntityPoints.push(majorWayPoint);
                            });
                        });

                        wayPoints.push({
                            'points': routePoints
                        });
                        routes.push({
                            'route': routeID,
                            'points': routeEntityPoints
                        });
                        routeID++;
                    });

                    var parsedResult = {
                        'wayPoints': wayPoints,
                        'majorWayPoints': routes,
                        'routes': result.routes
                    };

                    opts.mapDirections = parsedResult;
                    $.post('http://dev.infovis.com/get-data', {"json_string": JSON.stringify(parsedResult)}, function(data) {
                        opts.jsonData = $.parseJSON(data);
                        opts.onDataLoaded.call(this);
                        console.log(opts.jsonData);
                    });

                    if (opts.debug) {
                        console.log(result);
                    }
                } else {
                    opts.onError.call(this, status);
                }
            });
        },
        getRoutes: function() {
            return opts.mapDirections;
        },
        getNodeLinkData: function() {
            return opts.jsonData.nodelink;
        },
        getTemporalData: function(routeID) {
            return opts.jsonData.temporal[routeID];
        },
        getStackAreaData: function() {
            return opts.jsonData.area;
        },
        getMaxCount: function() {
            return opts.jsonData.temporal.max_count;
        },
        setData: function(data) {
            opts.jsonData = data;
        }
        /*** /GLOBAL Functions ***/
    });


    /** Helper functions in the scope of the plugin **/
    var methods = {
    };
})(jQuery, undefined);