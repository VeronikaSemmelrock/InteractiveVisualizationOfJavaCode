//import * as d3 from "d3";
//import * as cola from "webcola";
//import graph from "./smallgrouped.json";

//import "./style-base.css";

//https://codesandbox.io/s/cola-js-layout-with-hierarchical-grouping-and-arrows-forked-z7pshj?file=/src/index.js:374-403
//https://github.com/tgdwyer/WebCola/wiki/Constraints
var graph = {
      "nodes": [
        {
          "name": "a",
          "width": 60,
          "height": 40
        },
        {
          "name": "b",
          "width": 60,
          "height": 40
        },
        {
          "name": "c",
          "width": 60,
          "height": 40
        },
        {
          "name": "d",
          "width": 60,
          "height": 40
        },
        {
          "name": "e",
          "width": 60,
          "height": 40
        },
        {
          "name": "f",
          "width": 60,
          "height": 40
        },
        {
          "name": "g",
          "width": 60,
          "height": 40
        },
        {
          "name": "b-to-c",
          "width": 60,
          "height": 10
        }
      ],
      "links": [
        {
          "source": 1,
          "target": 7
        },
        {
          "source": 7,
          "target": 2
        },
        {
          "source": 2,
          "target": 3
        },
        {
          "source": 3,
          "target": 4
        },
        {
          "source": 0,
          "target": 1
        },
        {
          "source": 2,
          "target": 0
        },
        {
          "source": 3,
          "target": 5
        },
        {
          "source": 0,
          "target": 5
        }
      ],
      "groups": [
        { "name": "myfirstgroup", "leaves": [0], "groups": [2] },
        { "name": "mysecondgroup", "leaves": [1, 7, 2] },
        { "name": "mythirdgroup", "leaves": [3, 4] },
        { "name": "myfourthgroup", "leaves": [5, 6] }
      ]
    }


var width = 500,
  height = 500;
var margin = 20,
  pad = 8;

var color = d3.scaleOrdinal(d3.schemeSet3);
var d3Cola = cola
  .d3adaptor(d3)
  .linkDistance(80)
  .avoidOverlaps(true)
  .handleDisconnected(false)
  .symmetricDiffLinkLengths(51)
  .size([width, height]);

var svg = d3
  .select("#diagram")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

svg
  .append("svg:defs")
  .append("svg:marker")
  .attr("id", "end-arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 8)
  .attr("markerWidth", 4)
  .attr("markerHeight", 4)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5L2,0")
  .attr("stroke-width", "0px")
  .attr("fill", "#000");

graph.nodes.forEach(function (v) {
  v.width = v.height = 95;
});
graph.groups.forEach(function (g) {
  g.padding = 5; //changed from 0.05
});

d3Cola
  .nodes(graph.nodes)
  .links(graph.links)
  .groups(graph.groups)
  .start(100, 0, 50, 50);

var group = svg
  .selectAll(".group")
  .data(graph.groups)
  .enter()
  .append("rect")
  .attr("rx", 8) //how much rounding
  .attr("ry", 8) //how much rounding
  .attr("class", "group")
  .style("fill", function (d, i) {
    return color(i);
  })
  .call(d3Cola.drag)
  .on("mouseup", function (d) {
    d.fixed = 0;
    d3Cola.alpha(1); // fire it off again to satify gridify
  });

var link = svg
  .selectAll(".link")
  .data(graph.links)
  .enter()
  .append("path") //arrows, line would make lines
  .attr("class", "link");

var pad = 20;
var node = svg
  .selectAll(".node")
  .data(graph.nodes)
  .enter()
  .append("rect")
  .attr("class", "node")
  .attr("width", function (d) {
    return d.width - 2 * pad;
  })
  .attr("height", function (d) {
    return d.height - 2 * pad;
  })
  .attr("rx", 5) //rounding
  .attr("ry", 5)
  .style("fill", function (d) {
    return color(graph.groups.length);
  })
  .call(d3Cola.drag)
  .on("mouseup", function (d) {
    d.fixed = 0;
    d3Cola.alpha(1); // fire it off again to satify gridify
  });

var label = svg
  .selectAll(".label")
  .data(graph.nodes)
  .enter()
  .append("text")
  .attr("class", "label")
  .text(function (d) {
    return d.name;
  })
  .call(d3Cola.drag);

//if mouse hovers - title
node.append("title").text(function (d) {
  return d.name;
});
group.append("title").text(function (d) {
  return d.name;
});
//my code
/*var labelOfGroups = svg
  .data(graph.groups)
  .enter()
  .append("text")
  .attr("class", "label")
  .text(function (d) {
    return d.name;
  })
  .call(d3Cola.drag);
*/
var lineFunction = d3
  .line()
  .x(function (d) {
    return d.x;
  })
  .y(function (d) {
    return d.y;
  })
  .curve(d3.curveLinear);

d3Cola.on("tick", function () {
  node
    .each(function (d) {
      d.innerBounds = d.bounds.inflate(-margin);
    })
    .attr("x", function (d) {
      return d.innerBounds.x;
    })
    .attr("y", function (d) {
      return d.innerBounds.y;
    })
    .attr("width", function (d) {
      return d.innerBounds.width();
    })
    .attr("height", function (d) {
      return d.innerBounds.height();
    });

  link
    .attr("d", function (d) {
      var route = cola.makeEdgeBetween(
        d.source.innerBounds,
        d.target.innerBounds,
        2
      );
      return lineFunction([route.sourceIntersection, route.arrowStart]);
    })
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    });

  node
    .attr("x", function (d) {
      return d.x - d.width / 2 + pad;
    })
    .attr("y", function (d) {
      return d.y - d.height / 2 + pad;
    });
  group
    .attr("x", function (d) {
      return d.bounds.x;
    })
    .attr("y", function (d) {
      return d.bounds.y;
    })
    .attr("width", function (d) {
      return d.bounds.width();
    })
    .attr("height", function (d) {
      return d.bounds.height();
    });

  label
    .attr("x", function (d) {
      return d.x;
    })
    .attr("y", function (d) {
      var h = this.getBBox().height;
      return d.y + h / 4;
    });
});
