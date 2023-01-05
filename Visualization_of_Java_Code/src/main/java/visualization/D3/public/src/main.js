import data from "./smallgrouped.js"
const d3 = window.d3

//for window
var width = window.innerWidth, // set width to window width
    height = window.innerHeight; // set height to window height
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
    //working
    var nodesList = d3.selectAll(".node")
    var foundNode = nodesList.filter(function(x){
        return x.name === d.name; 
    })
    console.log('global_data', global_data)
}


// This is the initialize function of the graph
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
        .data(global_data.groups) // adding global_data.groups 
        .enter() // enter all groups
        .append("rect")// adding group elements as rects
        .attr("rx", 8) // set border rounding
        .attr("ry", 8) // set border rounding
        .attr("class", "group") // adding group style from style-diagram.css
        .style("fill", function (d, i) { // adding group file color
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

