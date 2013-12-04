/**
 jQuery plugin to handle all the data fetch related activities.
 **/
;
(function($, undefined) {
    "use strict";
    var opts = {},
            stackChart = $.stackChart = function() {
                //constructor function..
                stackChart.init(arguments[0]);
            };
    $.extend(stackChart, {
        /** Plugin default configuration values.. **/
        version: 1,
        defaults: {
            debug: true,
            directions: undefined,
            svgSelector: undefined,
            dimension: {
                chartWidth: 1200,
                chartHeight: 225,
                xPadding: 20,
                stackedChart: {
                    height: 175
                },
                xAxis: {
                    height: 20
                },
                wayPoint: {
                    width: 5,
                    height: 24
                },
                marker: {
                    yPadding: 20,
                    textHeight: 12
                }
            },
            heatMapColors: undefined
        },
        /*** GLOBAL Functions ***/
        /**
         * Initialization function..
         * @param {Object} options
         */
        init: function(options) {
            /** Extending the default options of the plugin.. **/
            opts = $.extend(true, {}, stackChart.defaults, options);

            var heatMapSeedColorSwatch = ["#FFF5F0", "#FEE0D2", "#FCBBA1", "#FC9272", "#FB6A4A", "#EF3B2C", "#CB181D", "#A50F15", "#67000D"];
            var heatMapColors = d3.scale.linear()
                    .domain(d3.range(0, 1, 1.0 / (heatMapSeedColorSwatch.length - 1)))
                    .range(heatMapSeedColorSwatch);
            opts.heatMapColors = heatMapColors;

            if (opts.debug) {
                console.log("Init called in stackChart.js");
            }
        },
        showStackedChart: function(routeNum) {
            var routeLeg = opts.directions.routes[routeNum].legs[0];
            var totalDistance = routeLeg.distance.value;
            var xScale = d3.scale.linear().domain([0, totalDistance]).range([opts.dimension.xPadding, opts.dimension.chartWidth - opts.dimension.xPadding]);

            var crimeData = methods.computeOverviewCoordinates(routeNum, totalDistance);
            var svg = d3.select(opts.svgSelector)
                    .attr("width", opts.dimension.chartWidth)
                    .attr("height", opts.dimension.chartHeight);

            svg.append("svg")
                    .attr("class", "stack-chart")
                    .attr("x", opts.dimension.xPadding)
                    .attr("y", opts.dimension.chartHeight - (opts.dimension.stackedChart.height + opts.dimension.xAxis.height + opts.dimension.marker.yPadding))
                    .attr("width", opts.dimension.chartWidth - (opts.dimension.xPadding))
                    .attr("height", opts.dimension.stackedChart.height);
            //.attr("height", opts.dimension.chartHeight - opts.dimension.xAxis.height - opts.dimension.marker.yPadding);

            nv.addGraph(function() {
                var chart = nv.models.stackedAreaChart()
                        .useInteractiveGuideline(true)
                        .x(function(d) {
                            return xScale(d[0]);
                        })
                        .y(function(d) {
                            return d[1];
                        });

                chart.yAxis
                        .tickFormat(d3.format('f'));
                d3.select('svg.stack-chart').datum(crimeData.summary)
                        .transition().duration(500).call(chart);
                nv.utils.windowResize(chart.update);
                return chart;
            });

            svg.append("rect")
                    .attr("x", opts.dimension.xPadding)
                    .attr("y", opts.dimension.chartHeight - opts.dimension.xAxis.height - opts.dimension.marker.yPadding - 2)
                    .attr("width", opts.dimension.chartWidth - 2 * (opts.dimension.xPadding))
                    .attr("height", opts.dimension.xAxis.height)
                    .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: #FFFFFF;");

            svg.selectAll(".heatMapElement").data(crimeData.total).enter()
                    .append("rect")
                    .attr("class", "heatMapElement")
                    .attr("x", function(datum) {
//                        console.log("XPos", xScale(datum[0]));
                        return xScale(datum[0]);
                    })
                    .attr("y", opts.dimension.chartHeight - opts.dimension.xAxis.height - opts.dimension.marker.yPadding - 2)
                    .attr("style", function(datum) {
                        return "vector-effect: non-scaling-stroke; fill: " + opts.heatMapColors(datum[1]) + ";";
                    })
                    .attr("height", opts.dimension.xAxis.height)
                    .attr("width", function(datum) {
//                        console.log("Width", opts.dimension.chartWidth - xScale(datum[0]) - opts.dimension.xPadding);
                        return opts.dimension.chartWidth - xScale(datum[0]) - opts.dimension.xPadding;
                    });

            var distanceVal = 0;
            var distanceMarkers = [];
            svg.selectAll(".wayPoints").data(routeLeg.steps).enter()
                    .append("rect")
                    .attr("class", "wayPoints")
                    .attr("x", function(datum, index) {
                        if ((totalDistance / datum.distance.value) < 37) {
                            distanceMarkers.push({
                                x: xScale(distanceVal + (datum.distance.value / 2)),
                                y: opts.dimension.chartHeight - (opts.dimension.marker.yPadding / 2),
                                text: datum.distance.text
                            });
                        }
                        distanceVal += datum.distance.value;
                        distanceVal -= opts.dimension.wayPoint.width;
                        return xScale(distanceVal);
                    })
                    .attr("y", opts.dimension.chartHeight - opts.dimension.xAxis.height - opts.dimension.marker.yPadding - 4)
                    .attr("width", opts.dimension.wayPoint.width)
                    .attr("height", opts.dimension.wayPoint.height)
                    .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: #FFFFFF;");

            svg.selectAll(".distanceMarkers").data(distanceMarkers).enter()
                    .append("text")
                    .attr("class", "distanceMarkers")
                    .text(function(datum, index) {
                        return datum.text;
                    })
                    .attr("text-anchor", "middle")
                    .attr("x", function(datum, index) {
                        return datum.x;
                    })
                    .attr("y", function(datum, index) {
                        return datum.y;
                    })
                    .attr("style", "fill: #000000; font-size: 8px;");
        }
        /*** /GLOBAL Functions ***/
    });
    /** Helper functions in the scope of the plugin **/
    var methods = {
        computeOverviewCoordinates: function(routeNum, totalDistance) {
            var overview_path = opts.directions.routes[routeNum].overview_path;
            var pathDistance = 0, temp, multiplier;
            var wayPoints = [];
            for (var index = 0; index < overview_path.length - 1; index++) {
                temp = Math.sqrt(Math.pow((overview_path[index + 1].pb - overview_path[index].pb), 2) + Math.pow((overview_path[index + 1].ob - overview_path[index].ob), 2));
                pathDistance += temp;
                wayPoints.push(pathDistance);
            }
            multiplier = (totalDistance / pathDistance);

            var crimeSummary = [];
            var theft = [], kidnapping = [], carJacking = [];
            var totalCrime = [];
            var xCoordinate, tdatum, kdatum, cdatum, totDatum, maxCrimePoint = 0;
            for (var index = 0; index < wayPoints.length; index++) {
                xCoordinate = wayPoints[index] * multiplier;
                tdatum = Math.floor((Math.random() * 400) + 1) + 20;
                kdatum = Math.floor((Math.random() * 200) + 1) + 30;
                cdatum = Math.floor((Math.random() * 300) + 1) + 30;
                theft.push([xCoordinate, tdatum]);
                kidnapping.push([xCoordinate, kdatum]);
                carJacking.push([xCoordinate, cdatum]);
                totDatum = cdatum + kdatum + tdatum;
                maxCrimePoint = Math.max(totDatum, maxCrimePoint);
                totalCrime.push([xCoordinate, totDatum]);
            }
            opts.maxCrimePoint = maxCrimePoint;

            for (var index = 0; index < totalCrime.length; index++) {
                totalCrime[index][1] = totalCrime[index][1] / maxCrimePoint;
            }

            crimeSummary.push({
                "key": "Theft",
                "values": theft
            });
            crimeSummary.push({
                "key": "Kidnapping",
                "values": kidnapping
            });
            crimeSummary.push({
                "key": "Car Jacking",
                "values": carJacking
            });

            return {
                "summary": crimeSummary,
                "total": totalCrime
            };
        }
    };
})(jQuery, undefined);