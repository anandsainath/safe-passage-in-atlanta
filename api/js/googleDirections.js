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
            onDataLoaded: function(data) {
                console.log(data);
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
        getDirections: function(from, to) {
            from = from || "470 16th St, Atlanta, GA";
            to = to || "48 5th St NW, Atlanta, GA";
            var directionsService = new google.maps.DirectionsService();
            var routeOptions = {
                origin: from,
                destination: to,
                provideRouteAlternatives: true,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL
            };

            directionsService.route(routeOptions, function(result, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    opts.mapDirections = result;
                    opts.onDataLoaded.call(this, result);
                    if (opts.debug) {
                        console.log(result);
                    }
                }
            });
        }
        /*** /GLOBAL Functions ***/
    });


    /** Helper functions in the scope of the plugin **/
    var methods = {
    };
})(jQuery, undefined);