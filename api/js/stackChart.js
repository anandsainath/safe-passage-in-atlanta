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
            crimeStats: undefined,
            svgSelector: undefined,
            routeNum: 0,
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
        getSelectedRouteID: function() {
            if(opts.routeNum === undefined){
                opts.routeNum = 0;
            }
            console.log(opts.routeNum, "route num");
            return opts.routeNum;
        },
        updateChart: function(crimeStatsData) {
            opts.crimeStats = crimeStatsData;
            $('.stack-chart').children().remove();
            var routeLeg = opts.directions.routes[opts.routeNum].legs[0];
            var totalDistance = routeLeg.distance.value;
            var xScale = d3.scale.linear().domain([0, totalDistance]).range([opts.dimension.xPadding, opts.dimension.chartWidth - opts.dimension.xPadding]);

            var crimeStats = [];
            $.each(crimeStatsData[opts.routeNum], function(index, crimeData) {
                var obj = {"key": crimeData.key};
                var value = [];
                var xCoordinate;
                $.each(crimeData.value, function(index, amtOfCrime) {
                    xCoordinate = opts.points[index] * opts.multiplier;
                    if (!isNaN(xCoordinate)) {
                        value.push([xCoordinate, amtOfCrime]);
                    }
                });
                obj.values = value;
                crimeStats.push(obj);
            });

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
                d3.select('svg.stack-chart').datum(crimeStats)
                        .transition().duration(500).call(chart);
                nv.utils.windowResize(chart.update);
                return chart;
            });
        },
        showStackedChart: function(routeNum) {
            opts.routeNum = routeNum;
            console.log(opts.directions.routes, routeNum);
            var routeLeg = opts.directions.routes[routeNum].legs[0];
            var totalDistance = routeLeg.distance.value;
            var xScale = d3.scale.linear().domain([0, totalDistance]).range([opts.dimension.xPadding, opts.dimension.chartWidth - opts.dimension.xPadding]);

            var crimeData = methods.computeOverviewCoordinates(routeNum, totalDistance);
            var svg = d3.select(opts.svgSelector)
                    .attr("width", opts.dimension.chartWidth)
                    .attr("height", opts.dimension.chartHeight);

            opts.tip = d3.tip().attr('class', 'd3-tip').html(function() {
                return opts.tipData;
            });

            svg.call(opts.tip);

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
                    .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: #FFFFFF;")
                    .on("mouseover", function(datum, index) {
                        opts.tipData = datum.instructions;
                        opts.tip.show.call(this);
                    })
                    .on("mouseout", opts.tip.hide);

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
            var wayPoints = [], points = [];

            wayPoints.push({"x": opts.directions.routes[routeNum].legs[0].start_location.qb, "y": opts.directions.routes[routeNum].legs[0].start_location.pb});
            $.each(opts.directions.routes[routeNum].legs[0].steps, function(index, steps) {
                $.each(steps.path, function(index, point) {
                    wayPoints.push({"x": point.qb, "y": point.pb});
                });
                wayPoints.push({"x": steps.end_location.qb, "y": steps.end_location.pb});
            });

            var pathDistance = 0, temp, multiplier;
            for (var index = 0; index < wayPoints.length - 1; index++) {
                temp = Math.sqrt(Math.pow((wayPoints[index + 1].x - wayPoints[index].x), 2) + Math.pow((wayPoints[index + 1].y - wayPoints[index].y), 2));
                pathDistance += temp;
                points.push(pathDistance);
            }
            opts.points = points;

            multiplier = (totalDistance / pathDistance);
            opts.multiplier = multiplier;

            var crimeStats = [];
            var totalCrimeData = [];
            $.each(opts.crimeStats[routeNum], function(index, crimeData) {
                var obj = {"key": crimeData.key};
                var value = [];
                var xCoordinate;
                $.each(crimeData.value, function(index, amtOfCrime) {
                    xCoordinate = points[index] * multiplier;
                    if (!isNaN(xCoordinate)) {
                        value.push([xCoordinate, amtOfCrime]);
                    }
                });
                obj.values = value;
                crimeStats.push(obj);
            });

            var maxCrimePoint = 0;
            for (var index = 0; index < crimeStats[0].values.length; index++) {
                var totalValue = 0;
                for (var y = 0; y < crimeStats.length; y++) {
                    totalValue += crimeStats[y].values[index][1];
                }
                maxCrimePoint = Math.max(totalValue, maxCrimePoint);
                totalCrimeData.push([crimeStats[0].values[index][0], totalValue]);
            }
            //totalCrimeData.pop();

            for (var index = 0; index < totalCrimeData.length; index++) {
                totalCrimeData[index][1] = totalCrimeData[index][1] / maxCrimePoint;
            }

            return {
                "summary": crimeStats,
                "total": totalCrimeData
            };
        }
    };
})(jQuery, undefined);