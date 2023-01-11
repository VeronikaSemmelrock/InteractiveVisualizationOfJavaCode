import Link from "./classes/Link.js"
import Node from "./classes/Node.js"
import importJsonToD3 from "./parse.js"
import associations from "./data/associations.js"
import entities from "./data/entities.js"

//toggles children Visibility of given nodeId and calls redraw if data changed 
function onToggleChildrenVisibility(nodeId){
    const D3Data = Node.toggleChildrenVisibility(nodeId)
        if (D3Data) redraw(D3Data) // if no D3Data is returned a redraw is not necessary
}

//sets type visibility of given type (of node or link) and calls redraw if data changed 
function onSetTypeVisibility(type, visibility){
    let D3Data; 
    if (type === "implements" || type === "extends" || type === "returnType" || type === "access" || type === "invocation") {
        //const D3Data =  Link.toggleTypeVisibility(linkType, visibility) //TODO implement
    }else{ 
        D3Data = Node.setTypeVisibility(type, visibility)
    }
    if(D3Data) redraw(D3Data)
}


const $checkboxes = document.querySelectorAll("input"); 
//check all checkboxes on page reload and add event listeners that call toggling of corresponding type visibility 
for(const checkbox of $checkboxes){
    checkbox.checked = true; 
    checkbox.addEventListener("change", (e) => {        
        onSetTypeVisibility(e.target.name, e.target.checked)
    } )
}


const d3 = window.d3
//for window
const width = window.innerWidth*0.75, // set width to 0.75*window-width to keep space for optionsContainer
    height = window.innerHeight;


importJsonToD3(JSON.stringify({ associations, entities }))

//configuring webcola
const d3Cola = cola
    .d3adaptor(d3)
    .linkDistance(100)
    .avoidOverlaps(true)
    .handleDisconnected(true)
    .symmetricDiffLinkLengths(20)//directly changes link length
    //.flowLayout("x", 150)  //the call to flowLayout causes all edges not involved in a cycle to have a separation constraint generated between their source and sink
    // with a minimum spacing set to 150. Specifying the 'x' axis achieves a left-to-right flow layout. The default is top-to-bottom flow layout
    .size([width, height]);


//appending svg to container "diagram"
const svg = d3
    .select("#diagram")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])

//appending g (will hold graph) to svg
const g = svg.append('g');


// Configure zoom
const zoom = d3.zoom()

//configuring zooming
svg.call(zoom
    .extent([[0, 0], [width, height]])
    .scaleExtent([1, 8])
    // .translateExtent([[0, 0], [width, height]])
    .on("zoom", function () {
        const transform = d3.zoomTransform(this)
        //console.log('zooming', transform, transform.x - width / 2, transform.y - height / 2)
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
    .attr("opacity","0.95" )
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5L2,0")
    .attr("stroke-width", "0px")
    .attr("fill", "#000");


const delimiters = ['.', '^', '\'', '#', '$']
const delimiterRegex = /[\.\^\'\#\$]/g

//starts drawing of graph for the first time
redraw(Node.getD3Data())

//(re)drawing of graph 
function redraw(D3Data) {
    const { nodes, links, groups } = D3Data

    //removes old graph-elements
    g.selectAll(".node").remove()
    g.selectAll(".group").remove()
    g.selectAll(".link").remove()
    g.selectAll(".label").remove()
    g.selectAll(".grouplabel").remove()
    g.selectAll(".linklabel").remove()


    //constraints
    const constraints = [
        { "type": "alignment", "axis": "x", "offsets": [/* { "node": "0", "offset": "0" } */] },
        { "type": "alignment", "axis": "y", "offsets": [/* { "node": "0", "offset": "0" } */] }
    ]
    let xOffsets = 0
    let yOffsets = 0
    //constraint configuration - TODO 
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const level = node.name.split(delimiterRegex).length
        //console.log('node', node, level)
        if (level === 1) {
            constraints[0].offsets.push({node: i, offset: 0})
        }
        else {
            constraints[1].offsets.push({node: i, offset: 0})
        }
    }

    //setting of data in d3Cola and starting layouting process
    d3Cola 
        .nodes(nodes)
        .links(links)
        .groups(groups)
        .start(10, 10, 10, 10);
        //initialUnconstrainedIterations, initialUserConstraintIterations, initialAllConstraintsIterations, gridSnapIterations


    //inserting groups into g 
    var group = g
        .selectAll(".group")
        .data(groups) // adding Node.groups 
        .enter() // enter all groups
        .append("rect")// adding group elements as rects
        .attr("class", "group") // adding group style from style-diagram.css
        .style("stroke", "transparent")
        .style("fill", "transparent")
        .call(d3Cola.drag) //adding ability to drag
        /*.on("mouseup", function (d) {
            d.fixed = 0;
            d3Cola.alpha(1); // fire it off again to satify gridify
        })
        .on('click', function (g) {
            // console.log('group clicked', g.id)
            const D3Data = Node.toggleChildrenVisibility(g.id)
            if (D3Data) redraw(D3Data) // if no D3Data is returned a redraw is not necessary
        })*/


    //inserting nodes-data into g 
    var nodeElements = g
        .selectAll(".node")
        .data(nodes, function (d) { return d.name })


    let waitForDoubleClick = null
    var pad = 20;
    //inserting nodes into g 
    var enteredNodeElements = nodeElements.enter()
        .append("rect")
        .attr("class", "node")
        .attr("width", function (d) {
            return d.width - 2 * pad;
        })
        .attr("height", function (d) {
            return d.height - 2 * pad;
        })
        .attr("rx", function(d){
            return d.style.rx; 
        })
        .attr("ry", function(d){
            return d.style.ry; 
        }) 
        .style("fill", function (d) {
            // return color(d.id);
            return d.style.color;
        })
        .call(d3Cola.drag)
        .on("click", function (node) {
            //on doubleclick toggle group/children visibility 
            if (waitForDoubleClick != null) {
                clearTimeout(waitForDoubleClick)
                waitForDoubleClick = null
                onToggleChildrenVisibility(node.id)
            } else { //on single click zoom in on clicked spot 
                waitForDoubleClick = setTimeout(() => {
                    const { x, y } = node
                    zoomOnClick(x, y)
                    waitForDoubleClick = null
                }, 250)//waiting for 250 to detect double click 
            }
        })
        /*.on("mouseup", function (d) {
           d.fixed = 0;
         d3Cola.alpha(1); // fire it off again to satify gridify
        })*/
    // .on("click", function (d) {
    //     console.log("WORKS!!!")
    //     testFunc(d);
    //     //handleNodeClick(d.id);
    // });

    //inserting links 
    var link = g
        .selectAll(".link")
        .data(links)
        .enter()
        .append("path") //arrows, "line" would make lines
        .attr("class", "link")
        .attr('marker-end', (d) => "url(#end-arrow)")//attach the arrow from defs to the end of the path

    //inserting labels for nodes
    var label = g
        .selectAll(".label")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(function (d) {
            return d.shortName;//show shortName as Label
        })
        .call(d3Cola.drag); // text also triggers drag event


    //appending title to node so when mouse hovers over node title is displayed
    enteredNodeElements
        .append("title")
        .text(function (d) {
            return d.type.charAt(0).toUpperCase() + d.type.slice(1) + " " +d.name;//capitalize Type and add shortname
        });

    //inserting labels for links
    var linkLabel = g 
        .selectAll(".linklabel")
        .data(links)
        .enter()
        .append("text")
        .attr("class", "linklabel")
        .text(function (d) {
            console.log(d.type)
            return d.type;
        })
        .call(d3Cola.drag); // text also triggers drag event


    //appending title to links so when mouse hovers over link title is displayed
    link 
        .append("title")
        .text(function (d) {
            return d.type;
        });
    console.log(link)

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


    //layouting of webcola (tick-function is called internally)
    d3Cola.on("tick", function () {
        const padding = 30;
        //layouting of nodes
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

        //layouting of links
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

        //layouting of groups 
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
        
        //layouting of node labels 
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


        /*groupLabel
            .attr("x", function (d) {
                return d.bounds.x + d.bounds.width() / 2; // calculate x offset by dividing through group width
            })
            .attr("y", function (d) {
                return d.bounds.y + 18; // calculate y offset by adding the height of the groupLabel
            });*/

        //layouting of linklabels
        linkLabel
            .attr("x", function (d) {
                //console.log(d.target.x + (d.source.x - d.target.x) / 2)
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

