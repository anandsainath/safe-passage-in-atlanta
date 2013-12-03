/**
 jQuery plugin to handle all the data fetch related activities.
 **/
;
(function($, undefined) {
    "use strict";
    var opts = {},
            temporalOverview = $.temporalOverview = function() {
                //constructor function..
                temporalOverview.init(arguments[0]);
            };

    $.extend(temporalOverview, {
        /** Plugin default configuration values.. **/
        version: 1,
        defaults: {
            svgSelector: undefined,
            data: undefined,
            dimension: {
                chartWidth: 475,
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
                crimeCircle: {
                    radius: 20
                },
                violentCircle: {
                    radius: 10
                }
            },
            opacity: {
                shown: 1,
                hidden: 0.05
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
                console.log("Init called in temporalOverview.js");
            }
            /** Extending the default options of the plugin.. **/
            opts = $.extend(true, {}, temporalOverview.defaults, options);

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
                        //console.log(datum);
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

                                    dayAggG.append("circle")
                                            .attr("class", "dayAggregate")
                                            .attr("cx", 105)
                                            .attr("cy", 30)
                                            .attr("r", opts.dimension.crimeCircle.radius)
                                            .attr("style", "fill:" + opts.crimeLevelColors(datum.overall) + "; vector-effect: non-scaling-stroke;");
                                })
                                .on("mouseover", function(datum) {
                                    d3.selectAll('.circleG').style('stroke-opacity', function(o) {
                                        var thisOpacity = (datum.day === o.day) ? opts.opacity.shown : opts.opacity.hidden;
                                        d3.select(this).transition()
                                                .delay(40)
                                                .style("fill-opacity", thisOpacity);
                                        return thisOpacity;
                                    });
                                })
                                .on("mouseout", function() {
                                    d3.selectAll('.circleG').style('stroke-opacity', function() {
                                        d3.select(this).transition()
                                                .delay(2)
                                                .style("fill-opacity", opts.opacity.shown);
                                        return opts.opacity.shown;
                                    });
                                });
                    });

            boundingRect.append("line").attr("class", "yDivider")
                    .attr("x1", 150)
                    .attr("y1", 20)
                    .attr("x2", 150)
                    .attr("y2", (opts.dimension.row.height * 7) + 45)
                    .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");

            boundingRect.selectAll(".columnHeader").data(["Early Morning", "Mid-Day", "Early Evening", "Late Evening"]).enter()
                    .append("text")
                    .attr("class", "columnHeader")
                    .attr("x", function(datum, index) {
                        return 195 + (index * 74);
                    })
                    .text(function(datum, index) {
                        return datum;
                    })
                    .attr("y", 0)
                    .attr("style", "font-size: 10px; fill: #000000;")
                    .attr("text-anchor", "middle")
                    .on("mouseover", function(columnName) {
                        d3.selectAll('.circleG').style("stroke-opacity", function(o) {
                            var thisOpacity = (o.time === columnName) ? opts.opacity.shown : opts.opacity.hidden;
                            d3.select(this).transition()
                                    .delay(40)
                                    .style('fill-opacity', thisOpacity);
                            return thisOpacity;
                        });
                    })
                    .on("mouseout", function() {
                        d3.selectAll('.circleG').style("stroke-opacity", function() {
                            d3.select(this).transition()
                                    .delay(2)
                                    .style('fill-opacity', opts.opacity.shown);
                            return opts.opacity.shown;
                        });
                    });

            boundingRect.append("g").attr("class", "dayBreakupG")
                    .attr("transform", "translate(155, 20)")
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
                                    dayBreakup.selectAll('.circleG').data(datum.summary).enter()
                                            .append("g")
                                            .attr("class", "circleG")
                                            .attr("transform", function(datum, index) {
                                                return "translate(" + (10 + (index * 74)) + ", 0)";
                                            })
                                            .each(function(datum, index) {
                                                var circleG = d3.select(this);

                                                circleG.append("circle")
                                                        .attr("cx", 30)
                                                        .attr("cy", 30)
                                                        .attr("r", opts.dimension.crimeCircle.radius)
                                                        .attr("style", "fill:" + opts.crimeLevelColors(datum.agg) + "; vector-effect: non-scaling-stroke;");
                                                if (datum.violent === 1) {
                                                    circleG.append("circle")
                                                            .attr("class", "violent-indicator")
                                                            .attr("cx", 30)
                                                            .attr("cy", 30)
                                                            .attr("r", 1)
                                                            .attr("style", "fill: #EC0200; vector-effect: non-scaling-stroke;");
                                                }
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
                                .append("circle")
                                .attr("class", "keyCircle")
                                .attr("cx", function(datum, index) {
                                    return 140 + (index * (30 + 10));
                                })
                                .attr("cy", 20)
                                .attr("r", 15)
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


                        key.append("circle").attr("class", "keyCircle")
                                .attr("cx", 417)
                                .attr("cy", 20)
                                .attr("r", 15)
                                .attr("style", "fill:" + opts.crimeLevelColors(1) + "; vector-effect: non-scaling-stroke;");

                        key.append("circle").attr("class", "keyCircle")
                                .attr("cx", 417)
                                .attr("cy", 20)
                                .attr("r", 6)
                                .attr("style", "fill:#EC0200; vector-effect: non-scaling-stroke;");

                        key.append("text").attr("class", "legendText")
                                .attr("x", 417)
                                .attr("y", 58)
                                .text("Violent")
                                .attr("style", "font-size: 10px; fill: #000000;")
                                .attr("text-anchor", "middle");
                    });

            var violentCircles = svg.selectAll('.violent-indicator');
            for (var radius = 2; radius < opts.dimension.violentCircle.radius; radius++) {
                violentCircles.transition().attr("r", radius).delay(200).ease('elastic');
            }
        }
    };
})(jQuery, undefined);
