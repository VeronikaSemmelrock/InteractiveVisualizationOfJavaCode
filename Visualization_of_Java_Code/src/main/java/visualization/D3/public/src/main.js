import Link from "./classes/Link.js"
import Node from "./classes/Node.js"
import data from "./smallgrouped.js"
import importJsonToD3 from "./parse.js"
import associations from "./data/associations.js"
import entities from "./data/entities.js"

importJsonToD3(JSON.stringify({ associations, entities }))
// Load data
// data.groups.forEach(group => new Node(group.id, group.name, group.groups.length !== 0 ? 'class' : 'method', group.leaves, group.groups, group.parentUniqueName))
// data.links.forEach(link => new Link(link.id, link.name, link.source, link.target))
// console.log('all data', {
//     internalNodes: Node.internalNodes,
//     nodes: Node.nodes,
//     groups: Node.groups,
//     internalLinks: Link.internalLinks,
//     links: Link.links
// })



const d3 = window.d3

//for window
const width = window.innerWidth, // set width to window width
    height = window.innerHeight; // set height to window height




//setting colour scheme
const color = d3.scaleOrdinal(d3.schemeSet3);

//configuring webcola
const d3Cola = cola
    .d3adaptor(d3)
    .linkDistance(100)
    .avoidOverlaps(true)
    .handleDisconnected(false)
    .symmetricDiffLinkLengths(80)//directly changes link length
    //.flowLayout("x", 150)  //the call to flowLayout causes all edges not involved in a cycle to have a separation constraint generated between their source and sink
    // with a minimum spacing set to 150. Specifying the 'x' axis achieves a left-to-right flow layout. The default is top-to-bottom flow layout
    .size([width, height]);


//appending svg to container "diagram"
const svg = d3
    .select("#diagram")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
// .attr("width", width)
// .attr("height", height)
const g = svg.append('g');


// Configure zoom
const zoom = d3.zoom()

svg.call(zoom
    .extent([[0, 0], [width, height]])
    .scaleExtent([1, 8])
    // .translateExtent([[0, 0], [width, height]])
    .on("zoom", function () {
        const transform = d3.zoomTransform(this)
        console.log('zooming', transform, transform.x - width / 2, transform.y - height / 2)
        g.attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
    }))
    .on("dblclick.zoom", null)

function zoomOnClick(x, y) {
    // e.stopPropagation();
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(3).translate(-x, -y)//,
        // d3.pointer(e)
    );
}



//configuration for arrow heads
g
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "end-arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)//changes where arrow head lies on line
    .attr("markerWidth", 4)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5L2,0")
    .attr("stroke-width", "0px")
    .attr("fill", "#000");




const delimiters = ['.', '^', '\'', '#', '$']
const delimiterRegex = /[\.\^\'\#\$]/g
// setTimeout(() => {
//     const D3Data = Node.toggleTypeVisibility('method')
//     if(D3Data) redraw(D3Data)
// }, 5000)

// setTimeout(() => {
//     const D3Data = Node.toggleTypeVisibility('method')
//     if(D3Data) redraw(D3Data)
// }, 45000)



redraw(Node.getD3Data())







//(re)drawing of graph 
function redraw(D3Data) {
    console.log("D3 redraw data --> ", D3Data)
    const { nodes, links, groups } = D3Data

    g.selectAll(".node").remove()
    g.selectAll(".group").remove()
    g.selectAll(".link").remove()
    g.selectAll(".label").remove()
    g.selectAll(".grouplabel").remove()



    const constraints = [
        { "type": "alignment", "axis": "x", "offsets": [/* { "node": "0", "offset": "0" } */] },
        { "type": "alignment", "axis": "y", "offsets": [/* { "node": "0", "offset": "0" } */] }
    ]
    let xOffsets = 0
    let yOffsets = 0

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const level = node.name.split(delimiterRegex).length
        console.log('node', node, level)
        if (level === 1) {
            constraints[0].offsets.push({node: i, offset: 0})
        }
        else {
            constraints[1].offsets.push({node: i, offset: 0})
        }
    }


    // console.log("Nodes in redraw --> ", nodes)
    d3Cola //setting global data in  d3Cola
        .nodes(nodes)
        .links(links)
        .groups(groups)
        // .constraints(constraints)
        .start(50, 0, 50);


    //adding links first so they are in background 
    //inserting links into g
    var link = g
        .selectAll(".link")
        .data(links)
        .enter()
        .append("path") //arrows, line would make lines
        .attr("class", "link")
        .style("stroke", "#000")
        .attr('marker-end', (d) => "url(#end-arrow)")//attach the arrow from defs to the END of the path
        .style("stroke-width", 4);//stroke width of link


    //inserting groups into g 
    var group = g
        .selectAll(".group")
        .data(groups) // adding Node.groups 
        .enter() // enter all groups
        .append("rect")// adding group elements as rects
        .attr("rx", 8) // set border rounding
        .attr("ry", 8) // set border rounding
        .attr("class", "group") // adding group style from style-diagram.css
        .style("fill", function (d, i) { // adding group file color
            return color(i);
        })
        .call(d3Cola.drag)
    // .on("mouseup", function (d) {
    //     d.fixed = 0;
    //     d3Cola.alpha(1); // fire it off again to satify gridify
    // })
    // .on('click', function (g) {
    //     // console.log('group clicked', g.id)
    //     const D3Data = Node.toggleChildrenVisibility(g.id)
    //     if (D3Data) redraw(D3Data) // if no D3Data is returned a redraw is not necessary
    // })




    var pad = 20;


    // WORKING, but exit does not remove proper node, just last node instead of removed node 
    //inserting nodes into g 
    var nodeElements = g
        .selectAll(".node")
        .data(nodes, function (d) { return d.name })


    let waitForDoubleClick = null
    var enteredNodeElements = nodeElements.enter()
        .append("rect")
        .attr("class", "node")
        .attr("width", function (d) {
            return d.width - 2 * pad;
        })
        .attr("height", function (d) {
            return d.height - 2 * pad;
        })
        .attr("rx", 10) //rounding
        .attr("ry", 10)
        .style("fill", function (d) {
            // return color(d.id);
            return "transparent";
        })
        .call(d3Cola.drag)
        .on("click", function (node) {
            if (waitForDoubleClick != null) {
                clearTimeout(waitForDoubleClick)
                waitForDoubleClick = null

                // console.log('node clicked', node.id)
                const D3Data = Node.toggleChildrenVisibility(node.id)
                if (D3Data) redraw(D3Data) // if no D3Data is returned a redraw is not necessary
            } else {
                waitForDoubleClick = setTimeout(() => {
                    const { x, y } = node
                    zoomOnClick(x, y)
                    waitForDoubleClick = null
                }, 100)
            }
        })



    //inserting labels for nodes into g
    var label = g
        .selectAll(".label")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(function (d) {
            return d.name;
        })
        .call(d3Cola.drag); // text also triggers drag event


    //appending title to node so when mouse hovers over node title is displayed
    enteredNodeElements
        .append("title")
        .text(function (d) {
            return d.name;
        });

    //inserting labels for groups into g
    var groupLabel = g
        .selectAll(".grouplabel")
        .data(groups)
        .enter()
        .append("text")
        .attr("class", "grouplabel")
        .text(function (d) {
            return d.name;
        })
        .call(d3Cola.drag); // text also triggers drag event

    var linkLabel = g
        .selectAll(".linklabel")
        .data(links)
        .enter()
        .append("text")
        .attr("class", "linklabel")
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d.name;
        })
        .call(d3Cola.drag); // text also triggers drag event


    //appending title to group so when mouse hovers over node title is displayed
    group
        .append("title")
        .text(function (d) {
            return d.name;
        });

    //appending title to links so when mouse hovers over link title is displayed
    link
        .append("title")
        .text(function (d) {
            return d.name;
        });

    //creating lines
    var lineFunction = d3
        .line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .curve(d3.curveLinear);


    //layouting of webcola
    d3Cola.on("tick", function () {
        const padding = 30;
        enteredNodeElements
            .each(function (d) {
                //d.innerBounds = d.bounds.inflate(-margin);// - original
                d.innerBounds = d.parent.bounds; //make node have the same size as parent (directly surrounding group)
            })
            .attr("x", function (d) {
                return d.parent.bounds.x; //make the node start at the same x position as the parent -> if others access x, this is returned
                //return d.innerBounds.x; //original
                //return d.parent.bounds.x; // -> make the node start at the same x position as the parent
                //return d.bounds.x
            })
            .attr("y", function (d) {
                return d.parent.bounds.y; //works, but others do not respect bounding
                //return d.innerBounds.y; //original
                //return d.bounds.y//maybe this is what the others access when drawing ? 
            })
            .attr("width", function (d) {
                //return d.innerBounds.width(); //- original
                return d.parent.bounds.width(); // -> make the node the same width as the parent (group)
                //return 0; //-> makes the node invisible
            })
            .attr("height", function (d) {
                return d.parent.bounds.height();// make the node have the same height as the parent
                //return d.innerBounds.height();//- original
                //return 0; //-> makes the node invisible
            });


        link
            .attr("d", function (d) {
                var route = cola.makeEdgeBetween(
                    d.source.innerBounds,//original
                    d.target.innerBounds,//original
                    //d.source.bounds, 
                    //d.target.bounds,
                    //pad+8//distance from target - was 4 before, perfect for arrow head -> was before, when innerBounds of node was still set differently
                    5
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
            })
            .attr("text", function (d) {
                return d.name;
            });

        /*enteredNodeElements //was originally not commented but seems to not do anything?? 
            .attr("x", function (d) {
                return d.x - d.width / 2 + pad;//original
                //return d.parent.bounds.x; // -> make the node start at the same x position as the parent
                //return d.bounds.x; 
            })
            .attr("y", function (d) {
                return d.y - d.height / 2 + pad;//original
                //return d.parent.bounds.y;
                //return d.parent.bounds.y; // -> makes the node be at the top of the parent-group, but the arrows still point to old position :(
            });*/

        group
            .each(function (d) {//new function added
                d.innerBounds = d.bounds.inflate(-padding);
            })
            .attr("x", function (d) {
                return d.bounds.x;
            })
            .attr("y", function (d) {
                /*if(d.parent){
                    return d.parent.bounds.y;
                }*/
                return d.bounds.y;// - original

            })
            .attr("width", function (d) {
                if (d.parent) {
                    return d.bounds.width();
                }
                return d.bounds.width();
            })
            .attr("height", function (d) {
                return d.bounds.height();
            });
        label
            .attr("x", function (d) {
                //console.log("d ->", d, "d.parent -> ", d.parent)
                return d.parent.bounds.x + d.parent.bounds.width() / 2;
                //return d.x; //orginial
                //return d.bounds.x + d.bounds.width()/2;
            })
            .attr("y", function (d) {

                return d.parent.bounds.y + 18;
                /*var h = this.getBBox().height;
                return d.y + h /4;*/ //original
                //return d.bounds.y + h / 4;
            });


        groupLabel
            .attr("x", function (d) {
                return d.bounds.x + d.bounds.width() / 2; // calculate x offset by dividing through group width
            })
            .attr("y", function (d) {
                return d.bounds.y + 18; // calculate y offset by adding the height of the groupLabel
            });

        linkLabel
            .attr("x", function (d) {
                if (d.source.x >= d.target.x) {
                    return d.target.x + (d.source.x - d.target.x) / 2
                } else {
                    return d.source.x + (d.target.x - d.source.x) / 2
                }
            })
            .attr("y", function (d) {
                if (d.source.y >= d.target.y) {
                    return d.target.y + (d.source.y - d.target.y) / 2
                } else {
                    return d.source.y + (d.target.y - d.source.y) / 2
                }
            });
    });

}

