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
                chartHeight: 520,
                lockInteraction: false,
                boundingRect: undefined,
                padding: {
                    left: 10,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    weekendPadding: 15,
                    breakupPadding: 112
                },
                row: {
                    width: 400,
                    height: 50
                },
                crimeSquare: {
                    side: 40
                }
            },
            opacity: {
                shown: 1,
                hidden: 0.05
            },
            crimeLevelColors: function() {

            },
            onEventOccured: function(eventType, isSelected, eventArgs) {
            },
            processEvent: function(event, isSelected, args) {
                console.log("Inside temporalDetailed.js");
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
        },
        processEvent: function(event, isSelected, args) {
            console.log("Inside temporalOverview.js");
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
        }
        /*** /GLOBAL Functions ***/
    });


    /** Helper functions in the scope of the plugin **/
    var methods = {
        processColumnClicked: function(_this, isSelected, index, isSource) {
            var x = 155 + (index * opts.dimension.padding.breakupPadding);
            if (isSelected) {
                if (!opts.lockInteraction) {
                    methods.removeAllSelected();
                    opts.boundingRect.append("rect")
                            .attr("class", "selected-column")
                            .attr("x", x)
                            .attr("y", 10)
                            .attr("width", 102)
                            .attr("height", 390)
                            .attr("style", "stroke: #2C7FB8; stroke-width: 2px; fill:none; opacity: 0.1")
                            .transition()
                            .ease('elastic')
                            .style("opacity", opts.opacity.shown);
                    _this.classed('js-clicked', true);
                    opts.lockInteraction = true;
                }
            } else {
                _this.classed('js-clicked', false);
                opts.lockInteraction = false;
                opts.boundingRect.select('.selected-column').remove();
            }

            if (isSource) {
                opts.onEventOccured.call(this, 'selected-column', isSelected, index);
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
                            .attr("x", -9)
                            .attr("y", y)
                            .attr("width", opts.dimension.chartWidth - 11)
                            .attr("height", opts.dimension.row.height + 8)
                            .attr("style", "stroke: #2C7FB8; stroke-width: 2px; fill:none; opacity: 0.1")
                            .transition()
                            .ease('elastic')
                            .style("opacity", opts.opacity.shown);
                    _this.classed('js-clicked', true);
                    opts.lockInteraction = true;
                }
            } else {
                _this.classed('js-clicked', false);
                opts.lockInteraction = false;
                opts.boundingRect.select('.selected-row').remove();
            }

            if (isSource) {
                opts.onEventOccured.call(this, 'selected-row', isSelected, datum);
            }
        },
        processItemClicked: function(_this, isSelected, datum, isSource) {
            var x = 155 + (datum.col_index * opts.dimension.padding.breakupPadding);
            var y = 30 + (datum.row_index * opts.dimension.row.height);

            if (isSelected) {
                if (!opts.lockInteraction) {
                    methods.removeAllSelected();
                    opts.boundingRect.append("rect")
                            .attr("class", "selected-item")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("width", 102)
                            .attr("height", 40)
                            .attr("style", "stroke: #2C7FB8; stroke-width: 2px; fill:none; opacity: 0.1")
                            .transition()
                            .ease('elastic')
                            .style("opacity", opts.opacity.shown);
                    _this.classed('js-clicked', true);
                    opts.lockInteraction = true;
                }
            } else {
                _this.classed('js-clicked', false);
                opts.lockInteraction = false;
                opts.boundingRect.select('.selected-item').remove();
            }

            if (isSource) {
                opts.onEventOccured.call(this, 'selected-item', isSelected, {row_index: datum.row_index, col_index: datum.col_index});
            }
        },
        removeAllSelected: function() {
            opts.boundingRect.selectAll('.selected-column').remove();
            opts.boundingRect.selectAll('.selected-row').remove();
            opts.boundingRect.selectAll('.selected-item').remove();
            opts.boundingRect.selectAll('.js-clicked').classed('js-clicked', false);
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

                                    dayAggG.append("rect")
                                            .attr("class", "dayAggregate")
                                            .attr("x", 85)
                                            .attr("y", 10)
                                            .attr("width", opts.dimension.crimeSquare.side)
                                            .attr("height", opts.dimension.crimeSquare.side)
                                            .attr("style", "fill:" + opts.crimeLevelColors(datum.overall) + "; vector-effect: non-scaling-stroke;");
                                })
                                .on("click", function(datum, index) {
                                    var _this = d3.select(this);
                                    var thisClass = _this.attr("class");
                                    var isSelected = (thisClass.indexOf("js-clicked") === -1) ? true : false;
                                    methods.processRowClicked(_this, isSelected, datum.index, true);
                                })
                                .on("mouseover", function(datum) {
                                    if (!opts.lockInteraction) {
                                        d3.selectAll('.circleG').style('stroke-opacity', function(o) {
                                            var thisOpacity = (datum.day === o.day) ? opts.opacity.shown : opts.opacity.hidden;
                                            d3.select(this).transition()
                                                    .style("fill-opacity", thisOpacity);
                                            return thisOpacity;
                                        });
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
                                        d3.selectAll('.dayAggG').style('stroke-opacity', function(o) {
                                            var thisOpacity = opts.opacity.shown;
                                            d3.select(this).transition()
                                                    .style("fill-opacity", thisOpacity);
                                            return thisOpacity;
                                        });
                                    }
                                });
                    });

            boundingRect.selectAll(".column-heading").data(["Morning", "Afternoon", "Evening", "Night"]).enter()
                    .append("text")
                    .attr("class", "column-heading")
                    .attr("x", function(datum, index) {
                        return 200 + (index * opts.dimension.padding.breakupPadding);
                    })
                    .text(function(datum, index) {
                        return datum;
                    })
                    .attr("y", 0)
                    .attr("style", "font-size: 10px; fill: #000000;")
                    .attr("text-anchor", "middle")
                    .on("mouseover", function(columnName) {
                        if (!opts.lockInteraction) {
                            d3.selectAll('.circleG').style("stroke-opacity", function(o) {
                                var thisOpacity = (o.time === columnName) ? opts.opacity.shown : opts.opacity.hidden;
                                d3.select(this).transition()
                                        //.delay(40)
                                        .style('fill-opacity', thisOpacity);
                                return thisOpacity;
                            });
                        }
                    })
                    .on("mouseout", function() {
                        if (!opts.lockInteraction) {
                            d3.selectAll('.circleG').style("stroke-opacity", function() {
                                d3.select(this).transition()
                                        //.delay(2)
                                        .style('fill-opacity', opts.opacity.shown);
                                return opts.opacity.shown;
                            });
                        }
                    })
                    .on("click", function(columnName, index) {
                        var _this = d3.select(this);
                        var thisClass = _this.attr("class");
                        var isSelected = (thisClass.indexOf("js-clicked") === -1) ? true : false;
                        methods.processColumnClicked(_this, isSelected, index, true);
                    });

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
                                        y += opts.dimension.padding.weekendPadding;
                                    }
                                    return "translate(0," + y + ")";
                                })
                                .each(function(datum, index) {
                                    var dayBreakup = d3.select(this);
                                    dayBreakup.selectAll('.circleG').data(datum.detailed).enter()
                                            .append("g")
                                            .attr("class", "circleG")
                                            .attr("transform", function(datum, index) {
                                                return "translate(" + (10 + (index * opts.dimension.padding.breakupPadding)) + ", 0)";
                                            })
                                            .on("click", function(datum, index) {
                                                //console.log(datum);
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
                                                }
                                            })
                                            .each(function(datum, index) {
                                                var circleG = d3.select(this);
                                                var violentCrimeScale = d3.scale.linear().domain([0, 5]).range([0, 20]);

                                                circleG.append("line")
                                                        .attr("x1", 0)
                                                        .attr("y1", ((opts.dimension.crimeSquare.side / 2) - 1) + 10)
                                                        .attr("x2", 102)
                                                        .attr("y2", ((opts.dimension.crimeSquare.side / 2) - 1) + 10)
                                                        .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");


                                                circleG.selectAll(".violent").data(datum.total).enter()
                                                        .append("line")
                                                        .attr("x1", function(datum, index) {
                                                            return (2 * index) + (6 * (index + 1));
                                                        })
                                                        .attr("y1", ((opts.dimension.crimeSquare.side / 2) - 1) + 10)
                                                        .attr("x2", function(datum, index) {
                                                            return (2 * index) + (6 * (index + 1));
                                                        })
                                                        .attr("y2", function(datum, index) {
                                                            return ((opts.dimension.crimeSquare.side / 2) - 1) - violentCrimeScale(datum) + 10;
                                                        })
                                                        .transition()
                                                        .ease('elastic')
                                                        .delay(function(d, i) {
                                                            return i * opts.animationDelay;
                                                        })
                                                        .duration(opts.animationDelay)
                                                        .attr("style", "stroke: #000000; stroke-width: 2px; vector-effect: non-scaling-stroke; fill: none;");

                                                circleG.selectAll(".non-violent").data(datum.violent).enter()
                                                        .append("line")
                                                        .attr("x1", function(datum, index) {
                                                            return (2 * index) + (6 * (index + 1));
                                                        })
                                                        .attr("y1", ((opts.dimension.crimeSquare.side / 2) - 1) + 10)
                                                        .attr("x2", function(datum, index) {
                                                            return (2 * index) + (6 * (index + 1));
                                                        })
                                                        .attr("y2", function(datum, index) {
                                                            return ((opts.dimension.crimeSquare.side / 2) - 1) + violentCrimeScale(datum) + 10;
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
                    .attr("y1", 405)
                    .attr("x2", opts.dimension.chartWidth)
                    .attr("y2", 405)
                    .attr("style", "stroke: #000000; stroke-width: 1px; vector-effect: non-scaling-stroke; fill: none; stroke-dasharray: 12px, 2px;");

            boundingRect.append("g").attr("class", "key")
                    .attr("transform", "translate(0,415)")
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

                        key.selectAll(".legendNonViolent").data([2, 1, 1, 3, 0, 2, 1, 3, 2, 4, 1, 0]).enter()
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
