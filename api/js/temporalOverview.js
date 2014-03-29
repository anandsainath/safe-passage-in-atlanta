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
            lockInteraction: false,
            boundingRect: undefined,
            dimension: {
                chartWidth: 400,
                chartHeight: 500,
                padding: {
                    left: 20,
                    right: 10,
                    top: 10,
                    bottom: 10,
                    breakupPadding: 54,
                    weekendPadding: 15
                },
                row: {
                    width: 400,
                    height: 46
                },
                crimeCircle: {
                    radius: 18
                },
                violentCircle: {
                    radius: 9
                },
                keyCircle: {
                    radius: 12
                }
            },
            opacity: {
                shown: 1,
                hidden: 0.05
            },
            crimeLevelColors: function() {

            },
            onEventOccured: function(eventType, isSelected, eventArgs) {
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
        },
        processEvent: function(event, isSelected, args) {
            switch (event) {
                case 'selected-row':
                    methods.processRowClicked(d3.select(d3.selectAll('.dayAggG')[0][args]), isSelected, args, false);
                    break;
                case 'selected-column':
                    methods.processColumnClicked(d3.select(d3.selectAll('.column-heading')[0][args]), isSelected, args, false);
                    break;
                case 'selected-item':
                    var itemCount = args.row_index * 4 + args.col_index;
                    methods.processItemClicked(d3.select(d3.selectAll('.circleG')[0][itemCount]), isSelected, args, false);
                    break;
            }
            console.log("processing Event");
        }
        /*** /GLOBAL Functions ***/
    });


    /** Helper functions in the scope of the plugin **/
    var methods = {
        updateStackArea: function(day, time) {
            console.log("Inside update area");
            var args = {};
            if (day) {
                args.day = day;
            }
            if (time) {
                args.time = time;
            }
            args.json_string = JSON.stringify($.googleDirections.getRoutes());
            
            console.log("Calling update-stack-area in overview..");
            $.post('http://dev.infovis.com/update-stack-area', args, function(data) {
                $.stackChart.updateChart($.parseJSON(data));
            });
        },
        removeAllSelected: function() {
            opts.boundingRect.selectAll('.selected-column').remove();
            opts.boundingRect.selectAll('.selected-row').remove();
            opts.boundingRect.selectAll('.selected-item').remove();
            opts.boundingRect.selectAll('.js-clicked').classed('js-clicked', false);
        },
        processColumnClicked: function(_this, isSelected, index, isSource) {
            var x = 165 + (index * 55);
            if (index > 0) {
                x -= 2;
            }
            if (isSelected) {
                if (!opts.lockInteraction) {
                    methods.removeAllSelected();
                    opts.boundingRect.append("rect")
                            .attr("class", "selected-column")
                            .attr("x", x)
                            .attr("y", 20)
                            .attr("width", 60)
                            .attr("height", 350)
                            .attr("style", "stroke: #2C7FB8; stroke-width: 2px; fill:none; opacity: 0.1")
                            .transition()
                            .ease('elastic')
                            .style("opacity", opts.opacity.shown);
                    _this.classed('js-clicked', true);
                    methods.updateStackArea(undefined, $('.js-clicked').text());
                    opts.lockInteraction = true;
                }
            } else {
                _this.classed('js-clicked', false);
                opts.lockInteraction = false;
                opts.boundingRect.select('.selected-column').remove();
                methods.updateStackArea(undefined, undefined);
            }

            if (isSource) {
                opts.onEventOccured('selected-column', isSelected, index);
            }
        },
        processRowClicked: function(_this, isSelected, datum, isSource) {
            var y = 22 + (datum * opts.dimension.row.height);
            if (datum > 4) {
                y += opts.dimension.padding.weekendPadding;
            }
            if (isSelected) {
                if (!opts.lockInteraction) {
                    methods.removeAllSelected();
                    opts.boundingRect.append("rect")
                            .attr("class", "selected-row")
                            .attr("x", -10)
                            .attr("y", y)
                            .attr("width", opts.dimension.chartWidth - 11)
                            .attr("height", opts.dimension.row.height + 8)
                            .attr("style", "stroke: #2C7FB8; stroke-width: 2px; fill:none; opacity: 0.1")
                            .transition()
                            .ease('elastic')
                            .style("opacity", opts.opacity.shown);
                    _this.classed('js-clicked', true);
                    methods.updateStackArea($('.js-clicked').text(), undefined);
                    opts.lockInteraction = true;
                }
            } else {
                _this.classed('js-clicked', false);
                opts.lockInteraction = false;
                opts.boundingRect.select('.selected-row').remove();
                methods.updateStackArea(undefined, undefined);
            }

            if (isSource) {
                opts.onEventOccured('selected-row', isSelected, datum);
            }
        },
        processItemClicked: function(_this, isSelected, datum, isSource) {
            var x = 175 + (datum.col_index * opts.dimension.padding.breakupPadding);
            var y = 30 + (datum.row_index * opts.dimension.row.height);
            if (isSelected) {
                if (!opts.lockInteraction) {
                    methods.removeAllSelected();
                    opts.boundingRect.append("rect")
                            .attr("class", "selected-item")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("width", 40)
                            .attr("height", 40)
                            .attr("style", "stroke: #2C7FB8; stroke-width: 2px; fill:none; opacity: 0.1")
                            .transition()
                            .ease('elastic')
                            .style("opacity", opts.opacity.shown);
                    _this.classed('js-clicked', true);
                    methods.updateStackArea(datum.day, datum.time);
                    opts.lockInteraction = true;
                }
            } else {
                _this.classed('js-clicked', false);
                opts.lockInteraction = false;
                opts.boundingRect.select('.selected-item').remove();
                methods.updateStackArea(undefined, undefined);
            }

            if (isSource) {
                opts.onEventOccured('selected-item', isSelected, datum);
            }
        },
        drawViz: function() {
            var svg = d3.select(opts.svgSelector)
                    .attr("width", opts.dimension.chartWidth)
                    .attr("height", opts.dimension.chartHeight);

            var boundingRect = svg.append('g')
                    .attr("class", "dayWiseSummary")
                    .attr("transform", "translate(" + opts.dimension.padding.left + "," + "40)");

            opts.boundingRect = boundingRect;
            boundingRect.selectAll('.dayOverview').data(opts.data).enter()
                    .append("g")
                    .attr("class", "dayOverview")
                    .attr("transform", function(datum, index) {
                        var y = (index * opts.dimension.row.height);
                        if (index > 4) {
                            y += opts.dimension.padding.weekendPadding;
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

                                    dayAggG.append("circle")
                                            .attr("class", "dayAggregate")
                                            .attr("cx", 105)
                                            .attr("cy", 30)
                                            .attr("r", opts.dimension.crimeCircle.radius)
                                            .attr("style", "fill:" + opts.crimeLevelColors(datum.overall) + "; vector-effect: non-scaling-stroke;");
                                })
                                .on("click", function(datum, index) {
                                    var _this = d3.select(this);
                                    var thisClass = _this.attr("class");
                                    var isSelected = (thisClass.indexOf("js-clicked") === -1) ? true : false;

                                    methods.processRowClicked.call(this, _this, isSelected, datum.index, true);
                                })
                                .on("mouseover", function(datum) {
                                    if (!opts.lockInteraction) {
                                        d3.selectAll('.circleG').style('stroke-opacity', function(o) {
                                            var thisOpacity = (datum.day === o.day) ? opts.opacity.shown : opts.opacity.hidden;
                                            d3.select(this).transition()
                                                    .style("fill-opacity", thisOpacity);
                                            return thisOpacity;
                                        });
                                        d3.selectAll('.yDivider').style('stroke-opacity', opts.opacity.hidden);
                                        d3.selectAll('.dayAggG').style('stroke-opacity', function(o) {
                                            var thisOpacity = (datum.day === o.day) ? opts.opacity.shown : opts.opacity.hidden;
                                            d3.select(this).transition()
                                                    .style("fill-opacity", thisOpacity);
                                            return thisOpacity;
                                        });
                                    }
                                })
                                .on("mouseout", function() {
                                    if (!opts.lockInteraction) {
                                        d3.selectAll('.circleG').style('stroke-opacity', function() {
                                            d3.select(this).transition()
                                                    .style("fill-opacity", opts.opacity.shown);
                                            return opts.opacity.shown;
                                        });
                                        d3.selectAll('.yDivider').style('stroke-opacity', opts.opacity.shown);
                                        d3.selectAll('.dayAggG').style('stroke-opacity', function(o) {
                                            var thisOpacity = opts.opacity.shown;
                                            d3.select(this).transition()
                                                    .style("fill-opacity", thisOpacity);
                                            return thisOpacity;
                                        });
                                    }
                                });
                    });

            boundingRect.append("line").attr("class", "yDivider")
                    .attr("x1", 150)
                    .attr("y1", 20)
                    .attr("x2", 150)
                    .attr("y2", (opts.dimension.row.height * 7) + 45)
                    .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");

            boundingRect.selectAll(".column-heading").data(["Morning", "Afternoon", "Evening", "Night"]).enter()
                    .append("text")
                    .attr("class", "column-heading")
                    .attr("x", function(datum, index) {
                        return 195 + (index * opts.dimension.padding.breakupPadding);
                    })
                    .text(function(datum, index) {
                        return datum;
                    })
                    .attr("y", 0)
                    .attr("style", "font-size: 8px; fill: #000000;")
                    .attr("text-anchor", "middle")
                    .on("mouseover", function(columnName) {
                        if (!opts.lockInteraction) {
                            d3.selectAll('.circleG').style("stroke-opacity", function(o) {
                                var thisOpacity = (o.time === columnName) ? opts.opacity.shown : opts.opacity.hidden;
                                d3.select(this).transition()
                                        .style('fill-opacity', thisOpacity);
                                return thisOpacity;
                            });
                            d3.selectAll('.yDivider').style('stroke-opacity', opts.opacity.hidden);
                        }
                    })
                    .on("mouseout", function() {
                        if (!opts.lockInteraction) {
                            d3.selectAll('.circleG').style("stroke-opacity", function() {
                                d3.select(this).transition()
                                        .style('fill-opacity', opts.opacity.shown);
                                return opts.opacity.shown;
                            });
                            d3.selectAll('.yDivider').style('stroke-opacity', opts.opacity.shown);
                        }
                    })
                    .on("click", function(columnName, index) {
                        var _this = d3.select(this);
                        var thisClass = _this.attr("class");
                        var isSelected = (thisClass.indexOf("js-clicked") === -1) ? true : false;
                        methods.processColumnClicked(_this, isSelected, index, true);
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
                                        y += opts.dimension.padding.weekendPadding;
                                    }
                                    return "translate(0," + y + ")";
                                })
                                .each(function(datum, index) {
                                    var dayBreakup = d3.select(this);
                                    dayBreakup.selectAll('.circleG').data(datum.summary).enter()
                                            .append("g")
                                            .attr("class", "circleG")
                                            .attr("transform", function(datum, index) {
                                                return "translate(" + (10 + (index * opts.dimension.padding.breakupPadding)) + ", 0)";
                                            })
                                            .on("click", function(datum, index) {
                                                var _this = d3.select(this);
                                                var thisClass = _this.attr("class");
                                                var isSelected = (thisClass.indexOf("js-clicked") === -1) ? true : false;
                                                methods.processItemClicked(_this, isSelected, datum, true);
                                            })
                                            .on("mouseover", function(datum) {
                                                if (!opts.lockInteraction) {
                                                    var day = datum.day,
                                                            time = datum.time;
                                                    d3.selectAll('.circleG').style('stroke-opacity', function(datum) {
                                                        var thisOpacity = (datum.day === day && datum.time === time) ? opts.opacity.shown : opts.opacity.hidden;
                                                        d3.select(this).transition().style('fill-opacity', thisOpacity);
                                                        return thisOpacity;
                                                    });
                                                    d3.selectAll('.dayAggregate').transition().style('fill-opacity', opts.opacity.hidden);
                                                    d3.selectAll('.row-heading').style('stroke-opacity', function(datum) {
                                                        var thisOpacity = (day === datum.day) ? opts.opacity.shown : opts.opacity.hidden;
                                                        d3.select(this).transition().style('fill-opacity', thisOpacity);
                                                        return thisOpacity;
                                                    });
                                                    d3.selectAll('.column-heading').style('stroke-opacity', function(time) {
                                                        var thisOpacity = (time === datum.time) ? opts.opacity.shown : opts.opacity.hidden;
                                                        d3.select(this).transition().style('fill-opacity', thisOpacity);
                                                        return thisOpacity;
                                                    });
                                                    d3.select('.yDivider').style('stroke-opacity', opts.opacity.hidden);
                                                }
                                            })
                                            .on("mouseout", function() {
                                                if (!opts.lockInteraction) {
                                                    d3.selectAll('.circleG').style('stroke-opacity', function() {
                                                        d3.select(this).transition().style('fill-opacity', opts.opacity.shown);
                                                        return opts.opacity.shown;
                                                    });
                                                    d3.selectAll('.dayAggregate').transition().style('fill-opacity', opts.opacity.shown);
                                                    d3.selectAll('.row-heading').style('stroke-opacity', function(datum) {
                                                        var thisOpacity = opts.opacity.shown;
                                                        d3.select(this).transition().style('fill-opacity', thisOpacity);
                                                        return thisOpacity;
                                                    });
                                                    d3.selectAll('.column-heading').style('stroke-opacity', function(time) {
                                                        var thisOpacity = opts.opacity.shown;
                                                        d3.select(this).transition().style('fill-opacity', thisOpacity);
                                                        return thisOpacity;
                                                    });
                                                    d3.select('.yDivider').style('stroke-opacity', opts.opacity.shown);
                                                }
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
                    .attr("y1", 380)
                    .attr("x2", opts.dimension.chartWidth)
                    .attr("y2", 380)
                    .attr("style", "stroke: #000000; stroke-width: 1px; vector-effect: non-scaling-stroke; fill: none; stroke-dasharray: 12px, 2px;");

            boundingRect.append("g").attr("class", "key")
                    .attr("transform", "translate(0,385)")
                    .each(function(datum, index) {
                        var key = d3.select(this);
                        key.selectAll('.keyCircle').data([1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 1]).enter()
                                .append("circle")
                                .attr("class", "keyCircle")
                                .attr("cx", function(datum, index) {
                                    return 140 + (index * (20 + 10));
                                })
                                .attr("cy", 20)
                                .attr("r", opts.dimension.keyCircle.radius)
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
                                .attr("x", 130)
                                .attr("y", 50)
                                .text("Fewer")
                                .attr("style", "font-size: 10px; fill: #000000;")
                                .attr("text-anchor", "start");

                        key.append("line").attr("class", "legendLine")
                                .attr("x1", 161)
                                .attr("y1", 48)
                                .attr("x2", 300)
                                .attr("y2", 48)
                                .attr("style", "stroke: #000000; stroke-width: 1px; vector-effect: non-scaling-stroke; fill: none; marker-end: url(#mkArrow20-16);");

                        key.append("text").attr("class", "legendText")
                                .attr("x", 310)
                                .attr("y", 50)
                                .text("More")
                                .attr("style", "font-size: 10px; fill: #000000;")
                                .attr("text-anchor", "start");


                        key.append("circle").attr("class", "keyCircle")
                                .attr("cx", 357)
                                .attr("cy", 20)
                                .attr("r", opts.dimension.keyCircle.radius)
                                .attr("style", "fill:" + opts.crimeLevelColors(1) + "; vector-effect: non-scaling-stroke;");

                        key.append("circle").attr("class", "keyCircle")
                                .attr("cx", 357)
                                .attr("cy", 20)
                                .attr("r", 5)
                                .attr("style", "fill:#EC0200; vector-effect: non-scaling-stroke;");

                        key.append("text").attr("class", "legendText")
                                .attr("x", 357)
                                .attr("y", 50)
                                .text("Violent")
                                .attr("style", "font-size: 10px; fill: #000000;")
                                .attr("text-anchor", "middle");
                    });

            var violentCircles = svg.selectAll('.violent-indicator');
            for (var radius = 2; radius < opts.dimension.violentCircle.radius; radius++) {
                violentCircles.transition().attr("r", radius).delay(500).ease('elastic');
            }
        }
    };
})(jQuery, undefined);
