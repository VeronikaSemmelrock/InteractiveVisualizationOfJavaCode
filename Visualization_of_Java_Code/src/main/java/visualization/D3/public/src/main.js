import data from "./smallgrouped.js"
const d3 = window.d3

//for window
var width = 700,
    height = 700;
var margin = 20,
    pad = 8;

var global_data = data

//setting colour scheme
var color = d3.scaleOrdinal(d3.schemeSet3);

//configuring webcola
var d3Cola = cola
    .d3adaptor(d3)
    .linkDistance(80)
    .avoidOverlaps(true)
    .handleDisconnected(false)
    .symmetricDiffLinkLengths(51)
    //.flowLayout("x", 150)  //the call to flowLayout causes all edges not involved in a cycle to have a separation constraint generated between their source and sink
    // with a minimum spacing set to 150. Specifying the 'x' axis achieves a left-to-right flow layout. The default is top-to-bottom flow layout
    .size([width, height]);

/*
//for zoom and panning later 
var container = d3
    .select("#diagram")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all");

container.append('rect')
    .attr('class', 'background')
    .attr('width', "100%")
    .attr('height', "100%")
    .call(d3.behavior.zoom().on("zoom", redraw));    

var svg = container.append("g"); 

//for zooming panning
var nodeMouseDown = false;

function redraw() {
    if (nodeMouseDown) return;
    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}
*/

//appending svg to container "diagram"
var svg = d3
    .select("#diagram")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g');


//configuring appended svg  
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

//setting width and height of each node in 
global_data.nodes.forEach(function (v) {
    v.width = v.height = 95;
});
global_data.groups.forEach(function (g) {
    g.padding = 5; //changed from 0.05
});


redraw(false); 


//returns a list of all global_data that should be drawn (nodes or links that have visibility set to true)
function updateData(datalist){
    return datalist.filter(global_data => global_data.visibility)
}

//sets node visibility of node in global_data-list to false 
function setNodeVisibility(nodeId){
    global_data.nodes.forEach(node => {
        if(node.id === nodeId){
            node.visibility = false; 
        }    
    });
    //let node = graph.nodes.filter(node => node.id ===nodeId)
}

//handles click by setting visibility of node to false and redrawing 
function handleNodeClick(nodeId){
    console.log(global_data.nodes);

    setNodeVisibility(nodeId)//sets node visibility of node in global_data-list to false 
    global_data.nodes = updateData(global_data.nodes);//updates node list that is used for drawing because global_data list of nodes changed 
    console.log(global_data.nodes);
    // redraw(true); 
}


function testFunc(d){
    var nodesList = d3.selectAll(".node")
    var foundNode = nodesList.filter(function(x){
        return x.name === d.name; 
    })
    foundNode.remove()
    console.log("Removed!!!")
    var enteringNode = d3.select("#diagram").data([{"id": 10, 
    "visibility": true,
    "name": "test",
    "width": 6,
    "height": 4}]).append("rect").style("fill", function (d) {
        console.log("Working!!!")
        //return color(d.id);
        return "00000"; 
    })
}

//(re)drawing of graph 
function redraw(redraw){
    

    console.log("Nodes in redraw --> ", global_data.nodes)   
    d3Cola //setting global_data into d3Cola
        .nodes(global_data.nodes)
        .links(global_data.links)
        .groups(global_data.groups)
        .start(50, 0, 50);

    
    //inserting groups into svg 
    var group = svg
        .selectAll(".group")
        .data(global_data.groups)//binding global_data 
        .enter()
        .append("rect")//adding elements 
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
        
    
    //inserting links into svg
    var link = svg
        .selectAll(".link")
        .data(global_data.links)
        .enter()
        .append("path") //arrows, line would make lines
        .attr("class", "link"); 

    var pad = 20;
        

    // WORKING, but exit does not remove proper node, just last node instead of removed node 
    //inserting nodes into svg 
    
    var nodeElements = svg.selectAll(".node")
    .data(global_data.nodes, function(d) { return d.name })

    var enterSelection = nodeElements.enter()
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
            return color(d.id);
            //return "00000"; 
        })
        .call(d3Cola.drag)
        .on("mouseup", function (d) {
            d.fixed = 0;
            d3Cola.alpha(1); // fire it off again to satify gridify
        })
        .on("click", function(d){
            console.log("WORKS!!!")
            testFunc(d);
            //handleNodeClick(d.id);
        });
    
    //const exitNode = svg.selectAll(".node").data(global_data.nodes).exit().remove()
    //console.log("exit -- ", svg.selectAll(".node").global_data(nodes).exit())
    //console.log("remove -- ", svg.selectAll(".node").global_data(nodes).remove())


    /*node.transition()
        .duration(0)
        .style("fill", function(d,i){return d.color;})
        .attr("width",function (d) {return d.y; })//d.y;})
        .attr("height",19);
    */

    /*
    //TRIAL
    var node = svg.selectAll(".node").global_data(global_data.nodes).enter()//changed to default global_data.nodes from nodes
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
            return color(d.id);
            //return "00000"; 
        })
        .call(d3Cola.drag)
        .on("mouseup", function (d) {
            d.fixed = 0;
            d3Cola.alpha(1); // fire it off again to satify gridify
        })
        .on("click", function(d){
            console.log("Works!")
            handleNodeClick(d.id);  
    });  
    
    if(redraw){
        console.log("Redrawing!!")
        console.log("Full dataset - ", global_data.nodes)
        console.log("Dataset for drawing -- ", nodes)
        node = node.global_data(nodes)//updated new dataset
        node.enter().append("rect")
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
            //return color(d.id);
            return "00000"; 
        })
        .call(d3Cola.drag)
        .on("mouseup", function (d) {
            d.fixed = 0;
            d3Cola.alpha(1); // fire it off again to satify gridify
        })
        .on("click", function(d){
            console.log("Works!")
            handleNodeClick(d.id);  
        });
        
        node.exit().remove()

    }*/
    

    //inserting labels for nodes into svg
    var label = svg
        .selectAll(".label")
        .data(global_data.nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(function (d) {
            return d.name;
        })
        .call(d3Cola.drag);
    
    //appending title to node so when mouse hovers over node title is displayed
    enterSelection.append("title").text(function (d) {
        return d.name;
    });

    //inserting labels for groups into svg
    var groupLabel = svg
        .selectAll(".grouplabel")
        .data(global_data.groups)
        .enter()
        .append("text")
        .attr("class", "grouplabel")
        .text(function (d) {
            return d.name;
        })
        .call(d3Cola.drag);

    //appending title to group so when mouse hovers over node title is displayed
    group.append("title").text(function (d) {
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
        
        enterSelection
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
            });

        enterSelection
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
        groupLabel
            .attr("x", function (d) {
                return d.bounds.x + d.bounds.width() / 2; // calculate x offset by dividing through group width
            })
            .attr("y", function (d) {
                return d.bounds.y + 18; // calculate y offset by adding the height of the groupLabel
            });
    });

}

