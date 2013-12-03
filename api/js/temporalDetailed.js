/**
 jQuery plugin to handle all the data fetch related activities.
 **/
;
(function($, undefined) {
    "use strict";
    var opts = {},
            temporalDetailed = $.temporalDetailed = function() {
                //constructor function..
                temporalDetailed.init(arguments[0]);
            };

    $.extend(temporalDetailed, {
        /** Plugin default configuration values.. **/
        version: 1,
        defaults: {
            svgSelector: undefined,
            data: undefined,
            animationDelay: 50,
            dimension: {
                chartWidth: 630,
                chartHeight: 620,
                padding: {
                    left: 20,
                    right: 20,
                    top: 10,
                    bottom: 10
                },
                row: {
                    width: 400,
                    height: 60
                },
                crimeSquare: {
                    side: 40
                }
            },
            crimeLevelColors: function() {

            }
        },
        /*** GLOBAL Functions ***/
        /**
         * Initialization function..
         * @param {Object} options
         */
        init: function(options) {
            if (opts.debug) {
                console.log("Init called in temporalDetailed.js");
            }
            /** Extending the default options of the plugin.. **/
            opts = $.extend(true, {}, temporalDetailed.defaults, options);

            var crimeLevelSeedColorSwatch = ["#E6E6E6", "#C8C8C8", "#999999", "#858585", "#616161", "#2C2C2C", "#000000"];
            var crimeLevelColors = d3.scale.linear()
                    .domain(d3.range(0, 1, 1.0 / (crimeLevelSeedColorSwatch.length - 1)))
                    .range(crimeLevelSeedColorSwatch);
            opts.crimeLevelColors = crimeLevelColors;

            methods.drawViz();
        }
        /*** /GLOBAL Functions ***/
    });


    /** Helper functions in the scope of the plugin **/
    var methods = {
        drawViz: function() {
            var svg = d3.select(opts.svgSelector)
                    .attr("width", opts.dimension.chartWidth)
                    .attr("height", opts.dimension.chartHeight);

            var boundingRect = svg.append('g')
                    .attr("class", "dayWiseSummary")
                    .attr("transform", "translate(" + opts.dimension.padding.left + "," + "40)");

            boundingRect.selectAll('.dayOverview').data(opts.data).enter()
                    .append("g")
                    .attr("class", "dayOverview")
                    .attr("transform", function(datum, index) {
                        var y = (index * opts.dimension.row.height);
                        if (index > 4) {
                            y += 30;
                        }
                        return "translate(0," + y + ")";
                    })
                    .each(function(datum, index) {
                        var dayOverview = d3.select(this);

                        dayOverview.append("g").attr("class", "dayAggG")
                                .attr("transform", "translate(0,20)")
                                .each(function(datum, index) {
                                    var dayAggG = d3.select(this);

                                    dayAggG.append("text")
                                            .attr("class", "row-heading")
                                            .attr("x", 0)
                                            .attr("y", 35)
                                            .text(datum.day)
                                            .attr("style", "font-size: 14px; fill: #000000;")
                                            .attr("text-anchor", "begin");

                                    dayAggG.append("rect")
                                            .attr("class", "dayAggregate")
                                            .attr("x", 85)
                                            .attr("y", 10)
                                            .attr("width", opts.dimension.crimeSquare.side)
                                            .attr("height", opts.dimension.crimeSquare.side)
                                            .attr("style", "fill:" + opts.crimeLevelColors(datum.overall) + "; vector-effect: non-scaling-stroke;");
                                });
                    });

            boundingRect.selectAll(".columnHeader").data(["Early Morning", "Mid-Day", "Early Evening", "Late Evening"]).enter()
                    .append("text")
                    .attr("class", "columnHeader")
                    .attr("x", function(datum, index) {
                        return 200 + (index * 112);
                    })
                    .text(function(datum, index) {
                        return datum;
                    })
                    .attr("y", 0)
                    .attr("style", "font-size: 10px; fill: #000000;")
                    .attr("text-anchor", "middle");

            boundingRect.append("g").attr("class", "dayBreakupG")
                    .attr("transform", "translate(145, 20)")
                    .each(function(datum, index) {
                        var dayBreakupG = d3.select(this);
                        dayBreakupG.selectAll('.dayBreakup').data(opts.data).enter()
                                .append("g")
                                .attr("class", "dayBreakup")
                                .attr("transform", function(datum, index) {
                                    var y = (index * opts.dimension.row.height);
                                    if (index > 4) {
                                        y += 30;
                                    }
                                    return "translate(0," + y + ")";
                                })
                                .each(function(datum, index) {
                                    var dayBreakup = d3.select(this);
                                    dayBreakup.selectAll('.circleG').data(datum.detailed).enter()
                                            .append("g")
                                            .attr("class", "circleG")
                                            .attr("transform", function(datum, index) {
                                                return "translate(" + (10 + (index * 112)) + ", 0)";
                                            })
                                            .each(function(datum, index) {
                                                var circleG = d3.select(this);
                                                var violentCrimeScale = d3.scale.linear().domain([0, 5]).range([0, 20]);

                                                circleG.append("line")
                                                        .attr("x1", 0)
                                                        .attr("y1", ((opts.dimension.row.height / 2) - 1))
                                                        .attr("x2", 102)
                                                        .attr("y2", ((opts.dimension.row.height / 2) - 1))
                                                        .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");

                                                circleG.selectAll(".violent").data(datum.violent).enter()
                                                        .append("line")
                                                        .attr("x1", function(datum, index) {
                                                            return (2 * index) + (6 * (index + 1));
                                                        })
                                                        .attr("y1", ((opts.dimension.row.height / 2) - 1))
                                                        .attr("x2", function(datum, index) {
                                                            return (2 * index) + (6 * (index + 1));
                                                        })
                                                        .attr("y2", function(datum, index) {
                                                            return ((opts.dimension.row.height / 2) - 1) - violentCrimeScale(datum);
                                                        })
                                                        .transition()
                                                        .ease('elastic')
                                                        .delay(function(d, i) {
                                                            return i * opts.animationDelay;
                                                        })
                                                        .duration(opts.animationDelay)
                                                        .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");

                                                circleG.selectAll(".non-violent").data(datum.non_violent).enter()
                                                        .append("line")
                                                        .attr("x1", function(datum, index) {
                                                            return (2 * index) + (6 * (index + 1));
                                                        })
                                                        .attr("y1", ((opts.dimension.row.height / 2) - 1))
                                                        .attr("x2", function(datum, index) {
                                                            return (2 * index) + (6 * (index + 1));
                                                        })
                                                        .attr("y2", function(datum, index) {
                                                            return ((opts.dimension.row.height / 2) - 1) + violentCrimeScale(datum);
                                                        })
                                                        .transition()
                                                        .ease('elastic')
                                                        .delay(function(d, i) {
                                                            return i * opts.animationDelay;
                                                        })
                                                        .duration(opts.animationDelay)
                                                        .attr("style", "stroke: #EC0200; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");
                                            });
                                });
                    });

            boundingRect.append("line").attr("class", "xDivider")
                    .attr("x1", 0)
                    .attr("y1", 480)
                    .attr("x2", opts.dimension.chartWidth)
                    .attr("y2", 480)
                    .attr("style", "stroke: #000000; stroke-width: 1px; vector-effect: non-scaling-stroke; fill: none; stroke-dasharray: 12px, 2px;");

            boundingRect.append("g").attr("class", "key")
                    .attr("transform", "translate(0,485)")
                    .each(function(datum, index) {
                        var key = d3.select(this);
                        key.selectAll('.keyCircle').data([1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 1]).enter()
                                .append("rect")
                                .attr("class", "keyCircle")
                                .attr("x", function(datum, index) {
                                    return 140 + (index * (30 + 10)) - 12;
                                })
                                .attr("y", 8)
                                .attr("width", 24)
                                .attr("height", 24)
                                .attr("style", function(datum, index) {
                                    return "fill:" + opts.crimeLevelColors(datum) + "; vector-effect: non-scaling-stroke;";
                                });

                        key.append("text").attr("class", "legendText")
                                .attr("x", 0)
                                .attr("y", 20)
                                .text("Aggregated Crime")
                                .attr("style", "font-size: 14px; fill: #000000;")
                                .attr("text-anchor", "begin");

                        key.append("text").attr("class", "legendText")
                                .attr("x", 116)
                                .attr("y", 38)
                                .text("(Per Day)")
                                .attr("style", "font-size: 12px; fill: #000000;")
                                .attr("text-anchor", "end");

                        key.append("text").attr("class", "legendText")
                                .attr("x", 145)
                                .attr("y", 58)
                                .text("Fewer")
                                .attr("style", "font-size: 10px; fill: #000000;")
                                .attr("text-anchor", "start");

                        key.append("line").attr("class", "legendLine")
                                .attr("x1", 180)
                                .attr("y1", 55)
                                .attr("x2", 330)
                                .attr("y2", 55)
                                .attr("style", "stroke: #000000; stroke-width: 1px; vector-effect: non-scaling-stroke; fill: none; marker-end: url(#mkArrow20-16);");

                        key.append("text").attr("class", "legendText")
                                .attr("x", 340)
                                .attr("y", 58)
                                .text("More")
                                .attr("style", "font-size: 10px; fill: #000000;")
                                .attr("text-anchor", "start");

                        key.append("line")
                                .attr("x1", 405)
                                .attr("y1", 20)
                                .attr("x2", opts.dimension.chartWidth)
                                .attr("y2", 20)
                                .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");

                        key.append("text").attr("class", "legendText")
                                .attr("x", 480)
                                .attr("y", 14)
                                .text("Crime")
                                .attr("style", "font-size: 10px; fill: #000000;")
                                .attr("text-anchor", "end");

                        key.append("text").attr("class", "legendText")
                                .attr("x", 480)
                                .attr("y", 35)
                                .text("Violent Crime")
                                .attr("style", "font-size: 10px; fill: #000000;")
                                .attr("text-anchor", "end");

                        var legendScale = d3.scale.linear().domain([0, 5]).range([0, 12]);

                        key.selectAll(".legendViolent").data([2, 3, 4, 5, 1, 1, 3, 4, 2, 5, 3, 2]).enter()
                                .append("line")
                                .attr("class", "legendViolent")
                                .attr("x1", function(datum, index) {
                                    return 500 + (2 * index) + (6 * (index + 1));
                                })
                                .attr("y1", 20)
                                .attr("x2", function(datum, index) {
                                    return 500 + (2 * index) + (6 * (index + 1));
                                })
                                .attr("y2", function(datum, index) {
                                    return 20 - legendScale(datum);
                                })
                                .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");

                        key.selectAll(".legendNonViolent").data([1, 0, 0, 2, 0, 1, 1, 2, 2, 3, 1, 0]).enter()
                                .append("line")
                                .attr("class", "legendNonViolent")
                                .attr("x1", function(datum, index) {
                                    return 500 + (2 * index) + (6 * (index + 1));
                                })
                                .attr("y1", 20)
                                .attr("x2", function(datum, index) {
                                    return 500 + (2 * index) + (6 * (index + 1));
                                })
                                .attr("y2", function(datum, index) {
                                    return 20 + legendScale(datum);
                                })
                                .attr("style", "stroke: #EC0200; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");
                    });

        }
    };
})(jQuery, undefined);
