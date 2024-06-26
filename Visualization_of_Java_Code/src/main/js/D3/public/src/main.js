import Link from "./classes/Link.js"
import Node, { nodeHeight, nodePadding, nodeWidth } from "./classes/Node.js"
import importJsonToD3 from "./parse.js"

//loads data from \data directory
await importJsonToD3()

// Option - Load data manually 
// data.groups.forEach(group => new Node(group.id, group.name, group.groups.length !== 0 ? 'class' : 'method', group.leaves, group.groups, group.parentUniqueName))
// data.links.forEach(link => new Link(link.id, link.name, link.source, link.target))
// console.log('all data', {
//     internalNodes: Node.internalNodes,
//     nodes: Node.nodes,
//     groups: Node.groups,
//     internalLinks: Link.internalLinks,
//     links: Link.links
// })


//toggles children Visibility of given nodeId and calls redraw if data changed 
function onToggleChildrenVisibility(nodeId) {
    const D3Data = Node.setChildrenVisibility(nodeId, undefined)
    if (D3Data) redraw(D3Data) // if no D3Data is returned a redraw is not necessary
}

//sets type or option visibility of given type (of node or link) or option and calls redraw
function onCheckboxChange(option, visibility) {
    if (option === "links") {
        //turn showing of links on or off
        showLinks = visibility
    } else if (option === "styling") {
        //turn styling on or off 
        styleEntities = visibility
    } else if (option === "linkLabels") {
        //turn linkLabels on or off 
        showLinkLabels = visibility
    } else if (option === "entityLabels") {
        //turn entityLabels on or off 
        showEntityLabels = visibility
    } else if (option === "constrain") {
        //turn constraining of graph on or off 
        constrainGraph = visibility
    } else if (option === "fixed") {
        //turn fixed position of nodes on or off 
        Node.fixed = visibility
    } else { //set node type visibility
        Node.setTypeVisibility(option, visibility)
    }
    //call redraw with new data
    redraw(Node.getD3Data())
}

const d3 = window.d3
//vars for filtering that only happens in frontend including default values 
var styleEntities = true
var showLinkLabels = true
var showEntityLabels = true
var showLinks = false 

//vars for tools and configurations
var constrainGraph = false

//vars for defaultStyling 
const defaultColour = "#b3e6b5" //light green

//check all checkboxes on page reload and add event listeners that call method that set corresponding visibility
const $checkboxes = document.querySelectorAll("input");
for (const checkbox of $checkboxes) {
    checkbox.checked = true;
    checkbox.addEventListener("change", (e) => {
        onCheckboxChange(e.target.name, e.target.checked)
    })
}
//uncheck specific checkboxes whose default value is false
document.getElementById("filterLinks").checked = false
document.getElementById("constrain").checked = false

//slider for weight
const $slider = document.getElementById("weight")
const $weightOutput = document.getElementById("weightOutput")
$weightOutput.innerText = $slider.value

//output-Field of weight should be changed whenever slider value changes 
$slider.onchange = function () {
    $weightOutput.innerText = this.value  //show current weight
}
//whenever value of slider really changes (not just dragging of slider) value should be set in Node class and redraw is called
$slider.onmouseup = function () {
    $weightOutput.innerText = this.value  //show current weight
    Node.weight = this.value
    redraw(Node.getD3Data()) //redraw with new weight 
}

// Graph max sizes
const graphContainer = document.getElementById('main').getBoundingClientRect()
const width = graphContainer.width, // set width to window width - FIX
    height = graphContainer.height; // set height to window height
const centerX = width / 2,
    centerY = height / 2

// Graph Boundaries
const graphBoundaries = { x: 0, y: 0, width: graphContainer.width, height: graphContainer.height }
const fixedNode = { fixed: true, fixedWeight: 1e6 } // weight when reaching the boundary --> lower means it ll be movable past the boundary
const topLeftFixedNode = { ...fixedNode, x: graphBoundaries.x, y: graphBoundaries.y }
const bottomRightFixedNode = { ...fixedNode, x: graphBoundaries.x + graphBoundaries.width, y: graphBoundaries.y + graphBoundaries.height }
const constraintBase = { type: 'separation', gap: 40 } // distance to boundary

//configuring webcola
const d3Cola = cola
    .d3adaptor(d3)
    .flowLayout('y', Math.floor(nodeHeight))
    .jaccardLinkLengths(nodeWidth)
    .linkDistance(nodeWidth * 2)
    .avoidOverlaps(true) // !!!!!!!
    .handleDisconnected(false) // !!!!!!!
    .symmetricDiffLinkLengths(nodeWidth)//directly changes link length
    //.flowLayout("x", 150)  //the call to flowLayout causes all edges not involved in a cycle to have a separation constraint generated between their source and sink
    // with a minimum spacing set to 150. Specifying the 'x' axis achieves a left-to-right flow layout. The default is top-to-bottom flow layout
    .size([width, height]);

//appending svg to container "main"
const svg = d3
    .select("#main")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])

// Add Grid to graph
const addGrid = () => {
    console.log('addingGrid')
    // const svg = d3
    //     .select('#main')
    //     .append('svg')
    //     .attr("viewBox", [0, 0, width, height])

    const defs = svg.append('defs')
    const firstPattern = defs
        .append('pattern')
        .attr('id', 'smallGrid')
        .attr('width', '8')
        .attr('height', '8')
        .attr('patternUnits', 'userSpaceOnUse')
    const path = firstPattern
        .append('path')
        .attr('d', 'M 8 0 L 0 0 0 8')
        .attr('fill', 'none')
        .attr('stroke', 'gray')
        .attr('stroke-width', '0.35')
    const secondPattern = defs
        .append('pattern')
        .attr('id', 'grid')
        .attr('width', '80')
        .attr('height', '80')
        .attr('patternUnits', 'userSpaceOnUse')
    secondPattern
        .append('rect')
        .attr('width', '80')
        .attr('height', '80')
        .attr('fill', 'url(#smallGrid)')
    secondPattern
        .append('path')
        .attr('d', 'M 80 0 L 0 0 0 80')
        .attr('fill', 'none')
        .attr('stroke', 'gray')
        .attr('stroke-width', '0.8')
    const rect = svg
        .append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'url(#grid)')
    //     < defs >
    //     <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
    //       <path d="M 8 0 L 0 0 0 8" fill="none" stroke="gray" stroke-width="0.5"/>
    //     </pattern>
    //     <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
    //       <rect width="80" height="80" fill="url(#smallGrid)"/>
    //       <path d="M 80 0 L 0 0 0 80" fill="none" stroke="gray" stroke-width="1"/>
    //     </pattern>
    //   </defs >

    //     <rect width="100%" height="100%" fill="url(#grid)" />
}
//add Grid to frontend - has to be before appedning g so it is in the background
addGrid()

// Construct graph and its bounds
const g = svg
    .append('g')
    .attr('id', 'graph')


//// zooming
// Configure zoom
const zoom = d3.zoom()
function setGraphZoom(enable) {
    if (!enable) svg.call(zoom.on('zoom', function () { }))
    else {
        svg.call(zoom
            .extent([[0, 0], [width, height]])
            .scaleExtent([0, 80])
            // .translateExtent([[0, 0], [width, height]])
            .on("zoom", function () {
                const transform = d3.zoomTransform(this)
                // console.log('zooming', transform, transform.x - width / 2, transform.y - height / 2)
                //// resize graph content and drag graph content along its axisis
                g.attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
            }))
            .on("dblclick.zoom", null)
    }
}

function zoomOnClick(x, y) {
    // e.stopPropagation();
    svg
        .transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(centerX, centerY)
                .scale(2.5)
                .translate(-x, -y)//,
            // d3.pointer(e)
        );
}

function getGraphScale(graph) {
    try {
        // console.log(graph.getAttribute('transform'))
        return parseFloat(graph.getAttribute('transform').split('scale(')[1].split(')')[0])
    } catch (error) {
        return 1
    }
}

//fit Graph into view
const fitGraphToViewTime = 750
function fitGraphToView(isInternal) {
    const graph = document.getElementById('graph') // := g
    const initialScale = getGraphScale(graph)
    const graphPosition = graph.getBoundingClientRect()
    // const graphPosition = svg.getBBox()
    //graphPosition.x = graphPosition.x - graphContainer.x
    //graphPosition.y = graphPosition.y - graphContainer.y
    // const graphCenterX = graphPosition.x + graphPosition.width / 2
    // const graphCenterY = graphPosition.y + graphPosition.height / 2
    // console.log('graph', graphPosition, graphCenterX)
    // console.log('graphContainer', graphContainer)
    // console.log('center is', centerX, centerY)
    // console.log('maxWidth and maxHeight', width, height)

    // Scale
    const widthRelation = graphPosition.width / width
    const heightRelation = graphPosition.height / height
    const graphTooSmall = widthRelation < 0.5 && heightRelation < 0.5
    const graphTooWide = widthRelation > 1
    const graphTooHigh = heightRelation > 1
    const graphTooBig = graphTooHigh || graphTooWide

    // const factor = Math.max(graphPosition.width / width, graphPosition.height / height)
    let scale = 1 // Math.exp(factor) / factor
    let translateX = 0
    let translateY = 0
    let relation = widthRelation
    // console.log('scaling', scale, Math.max(graphPosition.width / width, graphPosition.height / height))

    if (graphTooSmall) {
        if (widthRelation < heightRelation) relation = heightRelation
        scale = 1 / relation * initialScale * 0.85
        translateX = -centerX * (scale - 1)
        translateY = -centerY * (scale - 1)
        console.log('graph too small, adjusting: widthRelation, heightRelation, adjustment', widthRelation, heightRelation, 1 / relation, initialScale, scale)
    }
    else if (graphTooBig) {
        if (graphTooHigh && graphTooWide) relation = graphTooHigh > graphTooWide ? heightRelation : widthRelation
        else if (graphTooHigh) relation = heightRelation

        scale = 1 / relation * initialScale * 0.85
        translateX = -centerX * (scale - 1)
        translateY = -centerY * (scale - 1)

        console.log('graph too big, adjusting: widthRelation, heightRelation, adjustment', widthRelation, heightRelation, 1 / relation, initialScale, scale)
    }

    svg
        .transition()
        .duration(!isInternal && graphTooBig ? fitGraphToViewTime / 2 : fitGraphToViewTime)
        .call(
            zoom.transform,
            d3.zoomIdentity
        )
        .call(
            zoom.transform,
            d3.zoomIdentity
                // .translate(0, 0)
                .translate(translateX, translateY)
                .scale(scale)
        )
    // console.log(graphTooBig, isInternal)
    if (graphTooBig && graphTooHigh && graphTooWide && !isInternal) setTimeout(() => fitGraphToView(true), fitGraphToViewTime / 2)
}
//add eventListener to button
document.getElementById('fitToView').addEventListener('click', () => fitGraphToView())

//configuration for arrow heads of links
g
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "end-arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)//changes where arrow head lies on line
    .attr("markerWidth", 4)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .attr("opacity", "0.95")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5L2,0")
    .attr("stroke-width", "0px")
    .attr("fill", "#000");

// Initialize graph with config
async function initialize() {
    try {
        const response = await fetch('config')
        const config = await response.json()
        console.log('loaded config', config)
        const { disable, collapse } = config
        // const config = { collapseOnInit: false, disableAllOnInit: true }

        if (collapse) { 
            for (const node of Node.getD3Data().nodes) {
                Node.setChildrenVisibility(node.id, false) 
            }
            redraw(Node.getD3Data())
        }

        $checkboxes.forEach(element => {
            if ((disable === true || (typeof disable === 'string' && disable.split(',').find(str => str === 'classes'))) && element.name === 'class') element.click()
            else if ((disable === true || (typeof disable === 'string' && disable.split(',').find(str => str === 'methods'))) && element.name === 'method') element.click()
            else if ((disable === true || (typeof disable === 'string' && disable.split(',').find(str => str === 'constructors'))) && element.name === 'constructor') element.click()
            else if ((disable === true || (typeof disable === 'string' && disable.split(',').find(str => str === 'parameters'))) && element.name === 'parameter') element.click()
            else if ((disable === true || (typeof disable === 'string' && disable.split(',').find(str => str === 'attributes'))) && element.name === 'attribute') element.click()
            else if ((disable === true || (typeof disable === 'string' && disable.split(',').find(str => str === 'localVariables'))) && element.name === 'localVariable') element.click()
        })

        if (!(collapse || disable)) {
            redraw(Node.getD3Data())
        }
    } catch (error) {
        console.error('Failed to load config', error)
    }
}


// Redraw Data
let graphNodes
let graphLinks
let graphGroups
let graphLabels
let graphLinkLabels
let graphVisibilityButtons

//(re)drawing of graph 
function redraw(D3Data) {
    const { nodes, links, groups } = D3Data
    setGraphZoom(!constrainGraph)

    // Cleanup Graph and remember x and y positions
    const pastGroups = g.selectAll('.group')
    // const groupPositions = pastGroups._groups[0]
    // console.log('groups', groupPositions)

    // if(groupPositions.length !== 0) console.log(groupPositions[0].outerHTML.split('x="'))
    // const groups = rawGroups.map(g => )


    //removes old graph-elements
    g.selectAll(".node").remove()
    pastGroups.remove()
    g.selectAll(".link").remove()
    g.selectAll(".label").remove()
    g.selectAll(".grouplabel").remove()
    g.selectAll(".linklabel").remove()
    g.selectAll('.visibilityButton').remove()

    //// constraints - for layouting
    const constrainedNodes = nodes.slice()
    const constraints = []
    if (constrainGraph) {
        // Max Graph-width and height constraint
        // --> Use 2 non-visible-fixed-nodes to create a boundary
        const topLeftFixedNodeIndex = constrainedNodes.push(topLeftFixedNode) - 1
        const bottomRightFixedNodeIndex = constrainedNodes.push(bottomRightFixedNode) - 1
        for (let i = 0; i < nodes.length; i++) {
            constraints.push({ ...constraintBase, axis: 'x', left: topLeftFixedNodeIndex, right: i })
            constraints.push({ ...constraintBase, axis: 'y', left: topLeftFixedNodeIndex, right: i })
            constraints.push({ ...constraintBase, axis: 'x', left: i, right: bottomRightFixedNodeIndex })
            constraints.push({ ...constraintBase, axis: 'y', left: i, right: bottomRightFixedNodeIndex })
        }
    }

    // Main Node to Groups Distance
    // const nodesWithGroups = groups.filter(n => n.groups.length !== 0)
    // const firstChildNodes = nodesWithGroups.map(n => groups.find(_n => _n.id === n.groups[0]))
    // // align along y axis
    groups.forEach((n, i) => {
        const mainNodeIndex = Node.getPotentialObjId(n.leaves[0])
        // const mainNodeIndex = groups.findIndex(_n => Node.getPotentialObjId(_n) === mainNodeId)
        // console.log('mainNodeIndex', mainNodeIndex)

        if (mainNodeIndex > -1 && mainNodeIndex < groups.length) {
            const constraintY = {
                type: 'separation',
                gap: Math.floor(nodeHeight * 2),
                axis: "y",
                left: mainNodeIndex,
            }
            // const constraintX1 = {
            //     ...constraintY,
            //     axis: 'x',
            //     left: mainNodeIndex,
            //     gap: Math.floor(nodeWidth / 2)
            // }
            // const constraintX2 = {
            //     ...constraintY,
            //     axis: 'x',
            //     right: mainNodeIndex,
            //     gap: Math.floor(nodeWidth / 2)
            // }
            const inequalityConstraint = { axis: 'x', left: mainNodeIndex }

            // console.log('groups', n.groups)
            // console.log('MainNode constraints', constraint)
            n.groups.forEach(g => {
                const gid = Node.getPotentialObjId(g)

                if (gid > -1 && gid < groups.length) {
                    // console.log('g', g, { ...constraintY, right: groupIndex }, { ...inequalityConstraint, right: groupIndex })
                    // console.log('g constraint', groupIndex, groups.find(_g => Node.getPotentialObjId(_g) === groupIndex) ? true : false, n.leaves)

                    constraints.push({ ...constraintY, right: gid })
                    // constraints.push({ ...inequalityConstraint, right: gid })
                    // const cx1 = { ...constraintX1, right: groupIndex }
                    // const cx2 = {...constraintX2, left: groupIndex}
                    // constraints.push(cx1)
                    // constraints.push(cx2)
                }
            })
        }
    })


    // // Distance main groups from each other
    // const rootNodes = groups.filter(g => !g._parent)
    // for (let i = 0; i < rootNodes.length; i++) {

    //     if (i < rootNodes.length - 1) {
    //         const inequalityConstraint = { axis: 'y', left: Node.getPotentialObjId(rootNodes[i]), right: Node.getPotentialObjId(rootNodes[i + 1]), gap: 300 }
    //         constraints.push(inequalityConstraint)
    //     }

    //     // if (i + 2 >= rootNodes.length) {
    //     //     const extra = { axis: 'x', left: Node.getPotentialObjId(rootNodes[i + 1]), right: Node.getPotentialObjId(rootNodes[i + 2]) }
    //     //     constraints.push(extra)
    //     // }
    // }

    // Setting global data in d3Cola
    // console.log('result', constrainedNodes, links, groups, constraints)
    d3Cola
        .nodes(constrainedNodes)
        .links(links)
        .groups(groups)
        .constraints(constraints)
        // .handleDisconnected(false)
        .start(10, 15, 20); // try with 10, 10, 10, 10
    // The start() method now includes up to three integer arguments. In the example above, start will initially apply 10 iterations of layout with no constraints, 15 iterations with only structural (user-specified) constraints and 20 iterations of layout with all constraints including anti-overlap constraints.
    // Specifying such a schedule is useful to allow the graph to untangle before making it relatively "rigid" with constraints.

    // // Load in data
    // const existingGroupElements = graphGroups?._groups[0]
    // const newGroups = []
    // const existingGroups = []
    // groups.forEach(g => {
    //     if (existingGroupElements) {
    //         const exists = existingGroupElements.find(element => element.__data.id === g.id)
    //         if (exists) return existingGroups.push(g)
    //     }
    //     newGroups.push(g)
    // })
    // console.log('graphGroups', newGroups, existingGroups)

    //// To be able to leave groups everything at its position when rerendering new data, we need to enter() new data, exit() removed data and leave staying data

    //inserting groups into g 
    graphGroups = g
        .selectAll(".group")
        .data(groups) // adding Node.groups 
        .enter() // enter all groups
        .append("rect")// adding group elements as rects
        .attr("class", "group") // adding group style from style-graph.css        
        .attr("width", function (d) {
            return d.width
        })
        .attr("height", function (d) {
            return d.height
        })
        .attr('id', function (d) {
            return d.id
        })
        .style("fill", function (d) {
            if (styleEntities) return d.style.color
            else return defaultColour
        })
        .style("stoke-color", function (d) {
            if (styleEntities) return d.style.color
            else return defaultColour
        })
        .on("click", function (d) {
            const { bounds } = d
            console.log('zoom button clicked on group', d)
            zoomOnClick(bounds.x + bounds.width() / 2, bounds.y + bounds.height() / 2)
        })
        .call(d3Cola.drag) //adding ability to drag

    //inserting nodes-data into g 
    var nodeElements = g
        .selectAll(".node")
        .data(nodes)

    //inserting nodes into g as elements
    graphNodes = nodeElements.enter()
        .append("rect")
        .attr("class", "node")
        .attr("width", function (d) {
            // console.log('enteredNodeElements', d)
            return d.width
        })
        .attr("height", function (d) {
            return d.height //- 2 * padding;
        })
        .attr('id', function (d) {
            return d.id
        })
        .style("fill", function (d) {
            if (styleEntities) return d.style.color
            else return defaultColour
        })
        .style("stoke-color", function (d) {
            if (styleEntities) return d.style.color
            else return defaultColour
        })
        .call(d3Cola.drag)
        .on("click", function (d) {
            const { x, y } = d
            console.log('zoom button clicked on node', d)
            zoomOnClick(x, y)
        })

    //inserting links - only if checkbox is checked
    if (showLinks) {
        graphLinks = g
            .selectAll(".link")
            .data(links)
            .enter()
            .append("path") //arrows, "line" would make lines
            .attr("class", "link")
            .attr('marker-end', (d) => "url(#end-arrow)")//attach the arrow from defs to the end of the path

        //appending title to links so when mouse hovers over link title is displayed
        graphLinks
            .append("title")
            .text(function (d) {
                return d.type;
            });
    }

    //inserting labels for nodes - only if checkbox is checked 
    if (showEntityLabels) {
        graphLabels = g
            .selectAll(".label")
            .data(nodes)
            .enter()
            .append('text')
            .attr("class", "label")
            .text(function (d) {
                return d.shortName;//show shortName as Label
            })
            .call(d3Cola.drag); // text also triggers drag event
    }

    //appending title to nodes and groups so when mouse hovers over either one, title is displayed
    graphNodes
        .append("title")
        .text(function (d) {
            return d.type.charAt(0).toUpperCase() + d.type.slice(1) + " " + d.name;//capitalize Type and add shortname
        })
    graphGroups
        .append("title")
        .text(function (d) {
            return d.type.charAt(0).toUpperCase() + d.type.slice(1) + " " + d.name;//capitalize Type and add shortname
        })

    //inserting labels for links - only if checkbox is checked and links are defined
    if (graphLinks && showLinkLabels && showLinks) {
        graphLinkLabels = g
            .selectAll(".linklabel")
            .data(links)
            .enter()
            .append("text")
            .attr("class", "linklabel")
            .text(function (d) {
                console.log('linklabel text', d)
                return d.type;
            })
            .call(d3Cola.drag); // text also triggers drag event
    }

    // Toggle buttons for child visibility
    graphVisibilityButtons = g
        .selectAll('.visibilityButton')
        .data(nodes.filter(n => n._groups.length > 0))
        .enter()
        .append('text')
        .attr('class', 'visibilityButton')
        .on('click', function (d) {
            console.log('visibilityButton clicked', d)
            onToggleChildrenVisibility(d.id)
        })
}



//layouting of webcola
d3Cola.on("tick", function () {
    //layouting of nodes
    if (graphNodes) {
        graphNodes
            .each(function (d) {
                d.parentBounds = d.parent.bounds; //make node have the same size as parent (directly surrounding group)
            })
            .attr("x", function (d) {
                return d.parent.bounds.x
            })
            .attr("y", function (d) {
                if (!d._parent) return d.parent.bounds.y
                return d.parent.bounds.y
            })
            .attr('width', function (d) { // dunno if this breaks anything
                return d.parent.bounds.width()
            })
    }

    //layouting of groups
    if (graphGroups) {
        graphGroups
            .attr("x", function (d) {
                return d.bounds.x;
            })
            .attr("y", function (d) {
                if (d.parent) {
                    return d.bounds.y
                }
                return d.bounds.y
            })
            .attr("width", function (d) {
                return d.bounds.width();
            })
            .attr("height", function (d) {
                if (d.groups.length === 0) return nodeHeight // if group has no children --> groups.height === node.height
                else if (d.parent) return d.bounds.height() // if group has parent --> group can align itself according to parent - 50 / d.parent.groups.length

                return d.bounds.height() // + nodeHeight //(d.height - 25) / 75 + 25
            });
    }



    //layouting of links - only if links were created
    if (graphLinks) {
        graphLinks
            .attr("d", function (d) {
                var route = cola.makeEdgeBetween(
                    d.source.parentBounds,
                    d.target.parentBounds,
                    5
                );

                //creating lines
                const lineFunction = d3
                    .line()
                    .x(function (d) {
                        return d.x;
                    })
                    .y(function (d) {
                        return d.y;
                    })
                    .curve(d3.curveLinear);
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
    }

    
    //layouting of node labels - only if checkbox is checked 
    if (showEntityLabels && graphLabels) { // - graphLabels
        graphLabels
            .attr("x", function (d) {
                return d.parent.bounds.x + d.parent.bounds.width() / 2;
            })
            .attr("y", function (d) {
                const y = d.parent.bounds.y + nodePadding * 2
                if (!d._parent) return y // if it doesnt have a parent forget the offsets
                else if (d._groups.length !== 0) return y// + nodeHeight * 1.1 // node has children --> make space for visibilityButton
                else return y// + nodeHeight // centered placement because node doesnt have children
            })
    }


    //layouting of linklabels - only if checkbox is checked and links were created
    if (graphLinks && showLinkLabels && showLinks) { // -linkLabels
        graphLinkLabels
            .attr("x", function (d) {
                var route = cola.makeEdgeBetween(
                    d.source.parentBounds,
                    d.target.parentBounds,
                    5
                );
                const source = route.sourceIntersection
                const target = route.arrowStart
                if (source.x >= target.x) {
                    return target.x + (source.x - target.x) / 2
                } else {
                    return source.x + (target.x - source.x) / 2
                }
            })
            .attr("y", function (d) {
                var route = cola.makeEdgeBetween(
                    d.source.parentBounds,
                    d.target.parentBounds,
                    5
                );
                const source = route.sourceIntersection
                const target = route.arrowStart

                if (source.y >= target.y) {
                    return target.y + (source.y - target.y) / 2
                } else {
                    return source.y + (target.y - source.y) / 2
                }
            });
    }

    if (graphVisibilityButtons) {
        graphVisibilityButtons
            .attr("x", function (d) {
                return d.parent.bounds.x + nodePadding / 2
            })
            .attr("y", function (d) {
                const y = d.parent.bounds.y + nodePadding * 2
                if (!d._parent) {
                    return y
                }
                return y
            })
            .text(function (d) {
                return d.childrenVisibility ? '-' : '+'
            })
    }
});


await initialize()