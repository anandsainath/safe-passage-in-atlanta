var GOOGLE_MAPS_API_KEY = "AIzaSyDLz-Ezg7bEnBnE8vGxF5kC-oIJGMP8PJM";
var minX = 100, maxX = -100, minY = 100, maxY = -100;
var INVALID_INDEX = -1;

var ACTUAL_REPRESENTATION = "actual";
var SIMPLIFIED_REPRESENTATION = "simplified";

var chartWidth = 400;
var chartHeight = 400;
var widthPadding = 40;
var heightPadding = 40;
var colors = d3.scale.category10();
var mapDirections;
var showActualRepresentation = true;

var link, node;
var linkedByIndex;
var directionsService = undefined;

$(function() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://maps.googleapis.com/maps/api/js?key=" + GOOGLE_MAPS_API_KEY + "&sensor=false&callback=initialize&libraries=places";
    document.body.appendChild(script);
});

function initialize() {
    //console.log("initialize called");
    directionsService = new google.maps.DirectionsService();
    beginSearch('470 16th Street, Atlanta, GA, United States', '801 Atlantic Drive Atlanta, GA 30332', []);
    $('.js-input').each(function(index, value) {
        new google.maps.places.Autocomplete($(this)[0]);
    });
}

function beginSearch(origin, destination, wayPoints) {
    if (directionsService) {
        $('#nodeLink svg').children().remove();
        var routeOptions = {
            origin: origin,
            destination: destination,
            waypoints: wayPoints,
            provideRouteAlternatives: true,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
        };

        directionsService.route(routeOptions, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                mapDirections = result;
                showRouteSummary();
                showNodeLink(ACTUAL_REPRESENTATION);
            }
        });
    }

}

function showRouteSummary() {
    var $ol = $('#suggestedRoutesList');
    $.each(mapDirections.routes, function(index, data) {
        var $nameDiv = $('<div></div>');
        $nameDiv.text(data.summary);

        var $infoDiv = $('<div></div>');
        $infoDiv.text(data.legs[0].distance.text + ", " + data.legs[0].duration.text);

        var $childDiv = $('<div></div>');
        $childDiv.append($nameDiv);
        $childDiv.append($infoDiv);
        $childDiv.data('index', index);

        $childDiv.hover(function() {
            highLightRoute($(this).data('index'));
        }, function() {
            unHighlightRoutes();
        });

        var $li = $('<li></li>');
        $li.append($childDiv);
        $ol.append($li);
    });
}

function showNodeLink(representation) {
    switch (representation) {
        case ACTUAL_REPRESENTATION:
            showActualRepresentation = true;
            break;
        case SIMPLIFIED_REPRESENTATION:
            showActualRepresentation = false;
            break;
    }
    $('#nodeLink svg').children().remove();
    var json = getNodeRepresentation(mapDirections);
    drawForceDirectedNodeLink(json);
}

function getMinMax(x, y) {
    if (minX > x) {
        minX = x;
    }
    if (maxX < x) {
        maxX = x;
    }

    if (minY > y) {
        minY = y;
    }
    if (maxY < y) {
        maxY = y;
    }
}

function getIndex(pointHaystack, point) {
    var index = 0;
    for (pointIndex in pointHaystack) {
        if (pointHaystack[pointIndex]["x"] === point["x"] && pointHaystack[pointIndex]["y"] === point["y"]) {
            return index;
        }
        index++;
    }
    return INVALID_INDEX;
}

function highLightRoute(routeNum) {
    link.style("stroke-opacity", function(o) {
        var route = $.parseJSON(o.route);
        return (route.indexOf(routeNum) === -1) ? 0.1 : 1;
    });

    node.style("stroke-opacity", function(o) {
        var thisOpacity = (o.route.indexOf(routeNum) === -1) ? 0.1 : 1;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
    });

    d3.selectAll('.outline').style("stroke-opacity", function(o) {
        var thisOpacity = (o.route === undefined) ? 0 : ((o.route.indexOf(routeNum) === -1) ? 0 : 1);
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
    });
}

function unHighlightRoutes() {
    link.style("stroke-opacity", 1);
    node.style("stroke-opacity", function(o) {
        this.setAttribute('fill-opacity', 1);
        return 1;
    });
    d3.selectAll('.outline').style('stroke-opacity', function(o) {
        this.setAttribute("fill-opacity", 1);
        return 1;
    });
    d3.selectAll('.false').style('stroke-opacity', function(o) {
        this.setAttribute("fill-opacity", 0);
        return 0;
    });
}

function drawForceDirectedNodeLink(graph) {
    var width = chartWidth + (2 * widthPadding);
    var height = chartHeight + (2 * heightPadding);

    console.log(graph.links);
    var q = d3.geom.quadtree(graph.nodes),
            i = 0,
            n = graph.nodes.length;

    while (++i < n) {
        q.visit(collide(graph.nodes[i]));
    }

    var force = d3.layout.force()
            .size([width, height])
            .charge(-300)
            .gravity(0.05)
            .on("tick", function(parameter) {
                //console.log(parameter);
                $('.outline').remove();
                link.attr("x1", function(d) {
                    return d.source.x;
                }).attr("y1", function(d) {
                    return d.source.y;
                }).attr("x2", function(d) {
                    return d.target.x;
                }).attr("y2", function(d) {
                    return d.target.y;
                }).attr("style", function(d) {
                    return "stroke: " + d.color + ";"
                });

                node.attr("cx", function(d) {
                    return d.x;
                }).attr("cy", function(d) {
                    return d.y;
                }).attr("r", function(d) {
                    return d.radius;
                }).attr("route", function(d) {
                    return JSON.stringify(d.route);
                });

                $.each(node[0], function(index, datum) {
                    var _this = d3.select(datum);
                    var routes = $.parseJSON(_this.attr('route'));
                    switch (routes.length) {
                        case 1:
                            $('.circle' + index + '-1').remove();
                            svg.selectAll('.circle' + index + '-1').data([{
                                    "cx": parseFloat(_this.attr('cx')),
                                    "cy": parseFloat(_this.attr('cy')),
                                    "radius": parseInt(_this.attr('r')),
                                    "route": routes
                                }]).enter()
                                    .append('path')
                                    .attr('class', 'outline circle' + index + '-1')
                                    .attr('d', function(datum, index) {
                                        var point1 = getPointAt(datum, datum.radius, 0);
                                        /**
                                         Drawing a circle is a special case of drawing an arc.
                                         Since the start and end point of the arc are the same in case of a circle, it will never be drawn on the screen. Thus 2 arcs are drawn one after the other.
                                         **/
                                        //M cx cy m -r, 0 a r,r 0 1,0 (r * 2),0 a r,r 0 1,0 -(r * 2),0
                                        return "M " + (point1.x - datum.radius) + " " + point1.y + " m -" + datum.radius + ",0 a " + datum.radius + "," + datum.radius + " 0 1,0 " + (datum.radius * 2) + ",0 a " + datum.radius + "," + datum.radius + " 0 1,0 " + (-(datum.radius * 2)) + ",0";
                                    })
                                    .attr('fill', 'none')
                                    .attr('stroke', function(datum, index) {
                                        return colors(datum.route[0]);
                                    })
                                    .attr("route", JSON.stringify(routes));
                            break;
                        case 2:
                            $('.circle' + index + '-21').remove();
                            $('.circle' + index + '-22').remove();
                            var _datum = {
                                "x": parseFloat(_this.attr('cx')),
                                "y": parseFloat(_this.attr('cy')),
                                "radius": parseInt(_this.attr('r'))
                            };
                            drawCircle(svg, index, $.extend({}, _datum, {"route": [routes[0]]}), routes[0], true);
                            drawCircle(svg, index, $.extend({}, _datum, {"route": [routes[1]]}), routes[1], true);

                            drawArc(svg, [_datum], 'circle' + index + '-21', 0, 180, colors(routes[0]), [routes[0]]);
                            drawArc(svg, [_datum], 'circle' + index + '-22', 180, 0, colors(routes[1]), [routes[1]]);
                            break;
                        case 3:
                            $('.circle' + index + '-31').remove();
                            $('.circle' + index + '-32').remove();
                            $('.circle' + index + '-33').remove();
                            var _datum = {
                                "x": parseFloat(_this.attr('cx')),
                                "y": parseFloat(_this.attr('cy')),
                                "radius": parseInt(_this.attr('r'))
                            };
                            drawCircle(svg, index, $.extend({}, _datum, {"route": [routes[0]]}), routes[0], true);
                            drawCircle(svg, index, $.extend({}, _datum, {"route": [routes[1]]}), routes[1], true);
                            drawCircle(svg, index, $.extend({}, _datum, {"route": [routes[2]]}), routes[2], true);

                            drawArc(svg, [_datum], 'circle' + index + '-31', 0, 120, colors(routes[0]), [routes[0]]);
                            drawArc(svg, [_datum], 'circle' + index + '-32', 120, 240, colors(routes[1]), [routes[1]]);
                            drawArc(svg, [_datum], 'circle' + index + '-33', 240, 360, colors(routes[2]), [routes[2]]);
                            break;
                    }
                });
                unHighlightRoutes();
            });

    var svg = d3.select("#nodeLink svg")
            .attr("width", width)
            .attr("height", height);

    link = svg.selectAll(".link"),
            node = svg.selectAll(".node");

    force.nodes(graph.nodes).links(graph.links).start();

    link = link.data(graph.links)
            .enter().append("line")
            .attr("class", "link");

    node = node.data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node js-node")
            .attr('route', function(datum, index) {
                return JSON.stringify(datum.route);
            });

    /*$('.js-node').tipsy({
     gravity: 'w',
     html: true,
     title: function() {
     return 'What location is this?';
     }
     });*/


    $.each(graph.nodes, function(index, datum) {
        switch (datum.route.length) {
            case 1:
                drawCircle(svg, index, datum, datum.route);
                break;
            case 2:
                drawCircle(svg, index, $.extend({}, datum, {"route": [datum.route[0]]}), datum.route[0], true);
                drawCircle(svg, index, $.extend({}, datum, {"route": [datum.route[1]]}), datum.route[1], true);
                drawArc(svg, [datum], 'circle' + index + '-21', 0, 180, colors(datum.route[0]), [datum.route[0]]);
                drawArc(svg, [datum], 'circle' + index + '-22', 180, 0, colors(datum.route[1]), [datum.route[1]]);
                break;
            case 3:
                drawCircle(svg, index, $.extend({}, datum, {"route": [datum.route[0]]}), datum.route[0], true);
                drawCircle(svg, index, $.extend({}, datum, {"route": [datum.route[1]]}), datum.route[1], true);
                drawCircle(svg, index, $.extend({}, datum, {"route": [datum.route[2]]}), datum.route[2], true);
                drawArc(svg, [datum], 'circle' + index + '-31', 0, 120, colors(datum.route[0]), [datum.route[0]]);
                drawArc(svg, [datum], 'circle' + index + '-32', 120, 240, colors(datum.route[1]), [datum.route[1]]);
                drawArc(svg, [datum], 'circle' + index + '-33', 240, 360, colors(datum.route[2]), [datum.route[2]]);
                break;
        }
    });
}

function drawCircle(svg, index, datum, route, falseCircle) {
    var _class = 'outline circle' + index + '-1';
    var _selectClass = '.circle' + index + '-1';
    if (falseCircle) {
        _class += route + " false";
        _selectClass += route;
    }
    svg.selectAll(_selectClass).data([datum]).enter()
            .append('path')
            .attr('class', _class)
            .attr('d', function(datum, index) {
                var point1 = getPointAt({"cx": datum.x, "cy": datum.y}, datum.radius, 0);
                /**
                 Drawing a circle is a special case of drawing an arc.
                 Since the start and end point of the arc are the same in case of a circle, it will never be drawn on the screen. Thus 2 arcs are drawn one after the other.
                 **/
                //M cx cy m -r, 0 a r,r 0 1,0 (r * 2),0 a r,r 0 1,0 -(r * 2),0
                return "M " + (point1.x - datum.radius) + " " + point1.y + " m -" + datum.radius + ",0 a " + datum.radius + "," + datum.radius + " 0 1,0 " + (datum.radius * 2) + ",0 a " + datum.radius + "," + datum.radius + " 0 1,0 " + (-(datum.radius * 2)) + ",0";
            })
            .attr('fill', 'none')
            .attr('stroke', colors(route))
            .attr("route", JSON.stringify([route]));
}

function getNodeRepresentation(result) {
    var nodes = [];
    var links = [];

    var index = 0;
    var prevPos;
    var colorIndex = 0;
    var routeStepSize;
    //console.log("result", result);
    $.each(result.routes, function(routeCount, route) {
        routeStepSize = route.legs[0].steps.length;
        $.each(route.legs[0].steps, function(step_num, step) {
            var spoint, spos, epoint, epos;
            if (step_num == 0) {
                //adding the starting location here..
                getMinMax(step.start_point.pb, step.start_point.ob);
                spoint = {"x": step.start_point.pb, "y": step.start_point.ob, "fixed": true, "route": [routeCount]};
                spos = getIndex(nodes, spoint);
                if (spos == INVALID_INDEX) {
                    spos = nodes.length;
                    nodes.push(spoint);
                } else {
                    nodes[spos]["route"].push(routeCount);
                }
            }
            getMinMax(step.end_point.pb, step.end_point.ob);
            epoint = {"x": step.end_point.pb, "y": step.end_point.ob, "count": 1, "route": [routeCount]};
            if ((routeStepSize - 1) == step_num) {
                epoint["fixed"] = true;
            } else {
                epoint["fixed"] = false;
            }

            epos = getIndex(nodes, epoint);
            if (epos == INVALID_INDEX) {
                epos = nodes.length;
                nodes.push(epoint);
            } else {
                nodes[epos]["route"].push(routeCount);
            }

            if (step_num == 0) {
                prevPos = epos;
                links.push({"source": spos, "target": epos, "color": colors(colorIndex), "route": JSON.stringify([colorIndex])});
            } else {
                links.push({"source": prevPos, "target": epos, "color": colors(colorIndex), "route": JSON.stringify([colorIndex])});
                prevPos = epos;
            }

            //console.log("Step " + step_num + ": " + step.instructions);
            //console.log("Step Distance: " + step.distance.text);
            //console.log("Step Duration: " + step.duration.text);
            //console.log("End point on map (" + step.end_point.ob + "," + step.end_point.pb + ")");
        });
        colorIndex++;
        //return false;
    });
    //console.log(minX, maxX, minY, maxY);
    return normalizeNodes(nodes, links, minX, maxX, minY, maxY);
}

function normalizeNodes(nodes, links, minX, maxX, minY, maxY) {
    //console.log(chartWidth, chartHeight);
    //console.log(maxX - minX);
    //console.log(maxY - minY);

    var xMultiplier = chartWidth / (maxX - minX);
    var yMultiplier = chartHeight / (maxY - minY);
    var scalingFactor = 1;
    //console.log(xMultiplier, yMultiplier);
    //console.log(nodes);

    var newNodes = [];
    var x, y;
    var newNodeIndex;
    for (index in nodes) {
        x = parseInt((nodes[index]["x"] - minX) * (xMultiplier / scalingFactor)) + widthPadding;
        y = parseInt((maxY - nodes[index]["y"]) * (yMultiplier / scalingFactor)) + heightPadding;
        newNodeIndex = links.length;
        if (showActualRepresentation) {
            newNodes.push({"x": x, "y": y, "radius": Math.floor((Math.random() * 10) + 10), "fixed": true, "route": nodes[index]["route"]});
        } else {
            newNodes.push({"x": x, "y": y, "radius": Math.floor((Math.random() * 10) + 5), "fixed": nodes[index]["fixed"], "route": nodes[index]["route"]});
        }
    }
    return {
        "nodes": newNodes,
        "links": links
    };
}

function collide(node) {
    var r = node.radius + 16,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2
                || x2 < nx1
                || y1 > ny2
                || y2 < ny1;
    };
}

function drawArc(svg, data, _class, startAngle, endAngle, strokeColor, route) {
    svg.selectAll('.' + _class).data(data).enter()
            .append('path')
            .attr('class', _class + " outline")
            .attr('d', function(datum, index) {
                var point1 = getPointAt({"cx": datum.x, "cy": datum.y}, datum.radius, startAngle),
                        point2 = getPointAt({"cx": datum.x, "cy": datum.y}, datum.radius, endAngle);
                //Mstartx,startyAr,r,0,0,0,endx,endy
                return "M" + point1.x + "," + point1.y + "A" + datum.radius + "," + datum.radius + ",0,0,0," + point2.x + "," + point2.y;
            })
            .attr('fill', 'none')
            .attr('stroke', function(datum, index) {
                return strokeColor;
            });
}

function getPointAt(centerPoint, radius, angle_in_degrees) {
    var _x = Math.floor(radius * Math.cos(angle_in_degrees * (Math.PI / 180))) + centerPoint.cx;
    var _y = centerPoint.cy - Math.floor(radius * Math.sin(angle_in_degrees * (Math.PI / 180)));
    return {"x": _x, "y": _y};
}