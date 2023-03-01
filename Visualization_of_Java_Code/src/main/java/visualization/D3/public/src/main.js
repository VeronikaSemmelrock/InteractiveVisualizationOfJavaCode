import Link from "./classes/Link.js"
import Node, { nodeHeight, nodePadding, nodeWidth } from "./classes/Node.js"
import importJsonToD3 from "./parse.js"

await importJsonToD3()
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
//vars for filtering that only happens in frontend 
var styleEntities;
var showLinkLabels;
var showEntityLabels;
var showLinks;

//vars for defaultStyling 
const defaultRounding = 6
const defaultColour = "#b3e6b5" //light green

//toggles children Visibility of given nodeId and calls redraw if data changed 
function onToggleChildrenVisibility(nodeId) {
    const D3Data = Node.toggleChildrenVisibility(nodeId)
    if (D3Data) redraw(D3Data) // if no D3Data is returned a redraw is not necessary
}

//sets type visibility of given type (of node or link) and calls redraw if data changed 
function onSetTypeVisibility(type, visibility) {
    let D3Data;
    //if (type === "implements" || type === "extends" || type === "returnType" || type === "access" || type === "invocation") {
    if (type === "links") {
        showLinks = visibility
    } else if (type === "styling") {
        //turn styling on or off 
        styleEntities = visibility
    } else if (type === "linkLabels") {
        //turn linkLabels on or off 
        showLinkLabels = visibility
    } else if (type === "entityLabels") {
        //turn entityLabels on or off 
        showEntityLabels = visibility
    } else { //node visibility
        D3Data = Node.setTypeVisibility(type, visibility)
    }
    redraw(Node.getD3Data())
}
const $checkboxes = document.querySelectorAll("input");
//uncheck all checkboxes on page reload and add event listeners that call toggling of corresponding type visibility - TODO
for (const checkbox of $checkboxes) {
    checkbox.checked = true;//should be false 
    checkbox.addEventListener("change", (e) => {
        onSetTypeVisibility(e.target.name, e.target.checked)
    })
}
//set checkbox of packages to checked, so packages are visible at page reload - TODO
//document.getElementById("filterPackages").checked = true
//set corresponding initial values for vars that are for filtering in frontend 
styleEntities = true;
showEntityLabels = true;
showLinkLabels = true;
showLinks = false;
document.getElementById("filterLinks").checked = false

/*console.log("Nodes before ", Node.getD3Data().nodes)
//initially close all nodes 
for(const node of Node.getD3Data().nodes){
    Node.setChildrenVisibility(node.id, false)
}
console.log("After setting showChildren to false -> ",  Node.getD3Data(), Node.internalNodes)
//set data to inital values as well 
//Node.setTypeVisibility("package", true)
Node.setTypeVisibility("class", false)
Node.setTypeVisibility("method", false)
Node.setTypeVisibility("constructor", false)
Node.setTypeVisibility("parameter", false)
Node.setTypeVisibility("attribute", false)
Node.setTypeVisibility("localVariable", false)*/






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


// Node Padding
const padding = 30


//setting colour scheme
const color = d3.scaleOrdinal(d3.schemeSet3);

//configuring webcola
const d3Cola = cola
    .d3adaptor(d3)
    .flowLayout('x', Math.floor(nodeHeight * 2))
    .jaccardLinkLengths(nodeWidth)
    .linkDistance(nodeWidth * 2)
    .avoidOverlaps(true) // !!!!!!!
    .handleDisconnected(false) // !!!!!!!
    .symmetricDiffLinkLengths(nodeWidth * 2)//directly changes link length
    //.flowLayout("x", 150)  //the call to flowLayout causes all edges not involved in a cycle to have a separation constraint generated between their source and sink
    // with a minimum spacing set to 150. Specifying the 'x' axis achieves a left-to-right flow layout. The default is top-to-bottom flow layout
    .size([width, height]);

// console.log('cola', d3Cola.groupCompactness)

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
addGrid()

// setTimeout(addGrid, 5000)
// .attr("width", width)
// .attr("height", height)
// Construct graph and its bounds
const g = svg
    .append('g')
    .attr('id', 'graph')



// add toggleButton for constrain graph
// add slider for Node.weight
// add toggleButton for Node.fixed



//// zooming
let constrainGraph = false
// Configure zoom
const zoom = d3.zoom()

function setGraphZoom(enable) {
    if (!enable) svg.call(zoom.on('zoom', function () { }))
    else {
        svg.call(zoom
            .extent([[0, 0], [width, height]])
            .scaleExtent([0, 8])
            // .translateExtent([[0, 0], [width, height]])
            .on("zoom", function () {
                const transform = d3.zoomTransform(this)
                // console.log('zooming', transform, transform.x - width / 2, transform.y - height / 2)
                // redraw(Node.getD3Data(), true)
                // enteredNodeElements.attr('x', transform.x)
                // enteredNodeElements.attr('y', transform.y)

                // enteredNodeElements.attr('width', enteredNodeElements.size())

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

function fitGraphToView() {
    svg
        .transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity
        )

    // console.log('svg', Object.keys(svg))

    // console.log('x', svg.attr('X'))
    const graph = document.getElementById('graph') // := g
    graph.getAttribute('')
    console.log('graph', graph)

    const graphPosition = graph.getBoundingClientRect()
    // const graphPosition = svg.getBBox()
    //graphPosition.x = graphPosition.x - graphContainer.x
    //graphPosition.y = graphPosition.y - graphContainer.y
    const graphCenterX = graphPosition.x + graphPosition.width / 2
    const graphCenterY = graphPosition.y + graphPosition.height / 2
    // console.log('graph', graphPosition, graphCenterX)
    // console.log('graphContainer', graphContainer)
    // console.log('center is', centerX, centerY)
    // console.log('maxWidth and maxHeight', width, height)


    // Scale
    const widthRelation = graphPosition.width / width
    const heightRelation = graphPosition.height / height
    const graphTooSmall = widthRelation < 0.65 && heightRelation < 0.65
    const graphTooWide = widthRelation > 1
    const graphTooHigh = heightRelation > 1

    const factor = Math.max(graphPosition.width / width, graphPosition.height / height)
    let scale = 1 // Math.exp(factor) / factor
    let translateX = 0
    let translateY = 0
    let relation = widthRelation
    // console.log('scaling', scale, Math.max(graphPosition.width / width, graphPosition.height / height))

    if (graphTooSmall) {
        if (widthRelation > heightRelation) relation = heightRelation
        scale = 1 / Math.sqrt(relation) * 0.8
        translateX = relation * (centerX - graphCenterX)
        translateY = relation * (centerY - graphCenterY)

        console.log('graph too small, adjusting: widthRelation, heightRelation, adjustment', widthRelation, heightRelation, scale)
    }


    // else if (graphTooHigh || graphTooWide) { // graph too big
    //     let relation = heightRelation // use heightRelationTo adjust graph scale
    //     if (graphTooHigh && graphTooWide) relation = graphTooHigh < graphTooWide ? heightRelation : widthRelation
    //     else if (widthRelation > heightRelation) relation = widthRelation // use widthRelation to adjust graph scale

    //     scale = 1 / relation
    //     console.log('graph too big, adjusting: widthRelation, heightRelation, adjustment', widthRelation, heightRelation, scale)
    // }


    // // const widthRelation = width / graphPosition.width
    // // const heightRelation = height / graphPosition.height
    // // let scale = 1
    // // if (widthRelation > 1 && heightRelation > 1) scale = widthRelation < heightRelation ? widthRelation : heightRelation // graph too small
    // // console.log('graph small big, adjusting: widthRelation, heightRelation, adjustment', widthRelation, heightRelation, scale)


    setTimeout(() => {
        svg.call(zoom.transform, d3.zoomIdentity
            .translate(-graphCenterX, -graphCenterY)
            .scale(2)
        )
    }, 750)

    // g
    //     .transition()
    //     .duration(500)
    //     .call(
    //         zoom.transform,
    //         d3.zoomIdentity
    //             .translate(0, 0)
    //             .scale(1)
    //     )
    // setTimeout(() => {
    // setTimeout(() => {
    //     svg.call(
    //         zoom.transform,
    //         d3.zoomIdentity
    //             .translate(centerX - graphCenterX, centerY - graphCenterY)
    //             .scale(scale)
    //         // .translate(-graphCenterX, -graphCenterY)
    //     )
    // }, 1000)
    // g
    //     .transition()
    //     .duration(750)
    //     .call(
    //         zoom.transform,
    //         d3.zoomIdentity
    //             .translate(centerX - scale * graphCenterX, centerY - scale * graphCenterY)
    //             .scale(scale)
    //         // .translate(-graphCenterX, -graphCenterY)
    //     )
    // }, 1000)
}

document.getElementById('fitToView').addEventListener('click', fitGraphToView)





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
    .attr("opacity", "0.95")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5L2,0")
    .attr("stroke-width", "0px")
    .attr("fill", "#000");


const delimiters = ['.', '^', '\'', '#', '$']
const delimiterRegex = /[\.\^\'\#\$]/g



// Init config
async function loadConfig() { // has to happen 1 line before redraw
    try {
        // const response = await fetch('config')
        // const config = await response.json()
        // console.log('loaded config', config)
        const config = { collapseOnInit: true, disableAllOnInit: false, disablePackagesOnInit: false }

        const { collapseOnInit, disableAllOnInit, disablePackagesOnInit, disableClassesOnInit, disableMethodsOnInit, disableConstructorsOnInit, disableParametersOnInit, disableAttributesOnInit, disableLocalVariablesOnInit } = config

        if (collapseOnInit) {
            for (const node of Node.getD3Data().nodes) {
                Node.toggleChildrenVisibility(node.id) // TODO: when expanding nodes, all their children get expanded as well, should this stay?
            }
        }
        $checkboxes.forEach(element => {
            if (disablePackagesOnInit && element.name === 'package') {
                console.log('disablePackages', disablePackagesOnInit)
                element.click()
            }
            else if (disableAllOnInit || disableClassesOnInit && element.name === 'class') element.click()
            else if (disableAllOnInit || disableMethodsOnInit && element.name === 'method') element.click()
            else if (disableAllOnInit || disableConstructorsOnInit && element.name === 'constructor') element.click()
            else if (disableAllOnInit || disableParametersOnInit && element.name === 'parameter') element.click()
            else if (disableAllOnInit || disableAttributesOnInit && element.name === 'attribute') element.click()
            else if (disableAllOnInit || disableLocalVariablesOnInit && element.name === 'localVariable') element.click()
        })
    } catch (error) {
        console.error('Failed to load config', error)
    }
}
// loadConfig()

// await loadConfig()
redraw(Node.getD3Data())






//(re)drawing of graph 
function redraw(D3Data) {
    setGraphZoom(!constrainGraph)

    // console.log("D3 redraw data --> ", D3Data)
    const { nodes, links, groups } = D3Data

    //removes old graph-elements
    g.selectAll(".node").remove()
    g.selectAll(".group").remove()
    g.selectAll(".link").remove()
    g.selectAll(".label").remove()
    g.selectAll(".grouplabel").remove()
    g.selectAll(".linklabel").remove()
    g.selectAll('.visibilityButton').remove()

    console.log('graphContainer', nodes, links, groups)

    //// constraints
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
        const constraintY = {
            type: 'separation',
            gap: Math.floor(nodeHeight * 2),
            axis: "y",
            left: Node.getPotentialObjId(n.leaves[0]),
        }
        // const constraintX1 = {
        //     ...constraintY,
        //     axis: 'x',
        //     left: Node.getPotentialObjId(n.leaves[0]),
        //     gap: Math.floor(nodeWidth / 2)
        // }
        // const constraintX2 = {
        //     ...constraintY,
        //     axis: 'x',
        //     right: Node.getPotentialObjId(n.leaves[0]),
        //     gap: Math.floor(nodeWidth / 2)
        // }


        // console.log('MainNode constraints', constraint)
        n.groups.forEach(g => {
            const cy = { ...constraintY, right: Node.getPotentialObjId(g) }
            constraints.push(cy)

            constraints.push({ axis: 'x', left: Node.getPotentialObjId(n.leaves[0]), right: Node.getPotentialObjId(g) })
            // const cx1 = { ...constraintX1, right: Node.getPotentialObjId(g) }
            // const cx2 = {...constraintX2, left: Node.getPotentialObjId(g)}
            // constraints.push(cx1)
            // constraints.push(cx2)
        })




    })

    // // Root Node Distance
    // nodes.forEach(n => {
    //     const constraint = {
    //         type: 'separation',
    //         gap: Math.floor(nodeHeight / 3),
    //         axis: 'y',
    //         left: n.id
    //     }

    //     nodes.forEach(_n => {
    //         constraints.push({
    //             ...constraint,
    //             right: _n.id
    //         })
    //         constraints.push({
    //             ...constraint,
    //             axis: 'x',
    //             right: _n.id
    //         })
    //     })
    // })
    // const rootNodes = nodes.filter(n => !n._parent)
    // rootNodes.forEach(n => {
    //     const constraint = 
    // })



    // firstChildNodes.forEach((n, i) => nodes[i].width = n.width * 2)
    // constraints.push({
    //     type: 'separation',
    //     gap: 100,
    //     axis: "x",
    //     // offsets: firstChildNodes.map(n => ({ node: n.id, offset: 200 }))
    // })
    // constraints.push({type:'separation', axis: "y", offsets: nodes.map(n => ({node: n.id, offset: 0}))}) // align along x axis
    // constraints.push({type:'alignment', axis: "y", offsets: rootNodes.map(n => ({node: n.id, offset: 1000}))}) // align along x axis

    // // const constraints = [
    // //     { "type": "alignment", "axis": "x", "offsets": [/* { "node": "0", "offset": "0" } */] },
    // //     { "type": "alignment", "axis": "y", "offsets": [/* { "node": "0", "offset": "0" } */] }
    // // ]
    // // let xOffsets = 0
    // // let yOffsets = 0

    // // for (let i = 0; i < constrainedNodes.length; i++) {
    // //     const node = constrainedNodes[i]
    // //     const level = node.name.split(delimiterRegex).length
    // //     // console.log('node', node, level)
    // //     if (level === 1) {
    // //         constraints[0].offsets.push({ node: i, offset: 0 })
    // //     }
    // //     else {
    // //         constraints[1].offsets.push({ node: i, offset: 0 })
    // //     }
    // // }



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




    //inserting groups into g 
    var group = g
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
        .attr('weight', function (d) {
            return 1e6
        })
        // .attr("rx", function (d) {
        //     //style depending on checkbox value 
        //     if (styleEntities) return d.style.rx
        //     else return defaultRounding;
        // })
        // .attr("ry", function (d) {
        //     if (styleEntities) return d.style.ry
        //     else return defaultRounding;
        // })
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

            // function (node) {
            //     //on doubleclick toggle group/children visibility 
            //     if (waitForDoubleClick != null) {
            //         clearTimeout(waitForDoubleClick)
            //         waitForDoubleClick = null
            //         onToggleChildrenVisibility(node.id)
            //     } else { //on single click zoom in on clicked spot 
            //         waitForDoubleClick = setTimeout(() => {
            //             const { x, y } = node
            //             zoomOnClick(x, y)
            //             waitForDoubleClick = null
            //         }, 250)//waiting for 250 to detect double click 
            //     }
            // }
        })
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
        .data(nodes)


    let waitForDoubleClick = null
    //inserting nodes into g 
    var enteredNodeElements = nodeElements.enter()
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

            // function (node) {
            //     //on doubleclick toggle group/children visibility 
            //     if (waitForDoubleClick != null) {
            //         clearTimeout(waitForDoubleClick)
            //         waitForDoubleClick = null
            //         onToggleChildrenVisibility(node.id)
            //     } else { //on single click zoom in on clicked spot 
            //         waitForDoubleClick = setTimeout(() => {
            //             const { x, y } = node
            //             zoomOnClick(x, y)
            //             waitForDoubleClick = null
            //         }, 250)//waiting for 250 to detect double click 
            //     }
            // }
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

    //inserting links - only if checkbox is checked
    if (showLinks) {
        var link = g
            .selectAll(".link")
            .data(links)
            .enter()
            .append("path") //arrows, "line" would make lines
            .attr("class", "link")
            .attr('marker-end', (d) => "url(#end-arrow)")//attach the arrow from defs to the end of the path

        //appending title to links so when mouse hovers over link title is displayed
        link
            .append("title")
            .text(function (d) {
                return d.type;
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
    }


    //inserting labels for nodes - only if checkbox is checked 
    if (showEntityLabels) {
        var label = g
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


    //appending title to node so when mouse hovers over node title is displayed
    enteredNodeElements
        .append("title")
        .text(function (d) {
            return d.type.charAt(0).toUpperCase() + d.type.slice(1) + " " + d.name;//capitalize Type and add shortname
        })




    // //inserting labels for groups into g
    // var groupLabel = g
    //     .selectAll(".grouplabel")
    //     .data(groups)
    //     .enter()
    //     .append("text")
    //     .attr("class", "grouplabel")
    //     .text(function (d) {
    //         return d.name;
    //     })
    //     .call(d3Cola.drag); // text also triggers drag event


    //inserting labels for links - only if checkbox is checked and links are defined
    if (link && showLinkLabels) {
        var linkLabel = g
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
    const visibilityButton = g
        .selectAll('.visibilityButton')
        .data(nodes.filter(n => n._groups.length > 0))
        .enter()
        .append('text')
        .attr('class', 'visibilityButton')
        // .attr('width', function (d) {
        //     return 1000
        // })
        // .attr('height', function (d) {
        //     return 1000
        // })
        .on('click', function (d) {
            console.log('visibilityButton clicked', d)
            onToggleChildrenVisibility(d.id)
            // visibilityButton.text(function (d) {
            //     return d.childrenVisibility ? '+' : '-'
            // })
        })



    //layouting of webcola
    d3Cola.on("tick", function () {
        //layouting of nodes
        enteredNodeElements
            .each(function (d) {
                //d.parentBounds = d.bounds.inflate(-margin);// - original
                d.parentBounds = d.parent.bounds; //make node have the same size as parent (directly surrounding group)
            })
            .attr("x", function (d) {
                return d.parent.bounds.x// + padding; //make the node start at the same x position as the parent -> if others access x, this is returned
                //return d.parentBounds.x; //original
                //return d.parent.bounds.x; // -> make the node start at the same x position as the parent
                //return d.bounds.x
            })
            .attr("y", function (d) {
                // console.log('enteredNode', Object.keys(d.parent))
                // const parentHeight = d.parent.bounds.height()
                // const numberOfChildren = d.parent.groups.length

                // const divisor = numberOfChildren !== 0 ? numberOfChildren : 1

                // console.log('enteredNodes', d.parent)
                // if(d.parent.layers !== 1) d.parent.bounds.y + 25
                if (!d._parent) return d.parent.bounds.y
                return d.parent.bounds.y// + parentHeight * divisor// + padding; //works, but others do not respect bounding
                //return d.parentBounds.y; //original
                //return d.bounds.y//maybe this is what the others access when drawing ? 
            })
            .attr('width', function (d) { // dunno if this breaks anything
                return d.parent.bounds.width()
            })
        // .attr("width", function (d) {
        //     // const parentWidth = d.parent.bounds.width()
        //     // const numberOfChildren = d.parent.groups.length

        //     // const divisor = numberOfChildren !== 0 ? numberOfChildren : 1

        //     // console.log('enteredNodes', parentWidth, Math.floor((parentWidth) / divisor), divisor)
        //     // return Math.floor((parentWidth) / divisor);// make the node have the same height as the parent
        //     // console.log('enteredNodeElements parent', d.parent)

        //     return d.parent.width // // computed width after D3-scaling
        //     // return d.parent.bounds.width() - 2 * padding; // -> make the node the same width as the parent (group)
        //     //return 0; //-> makes the node invisible
        // })
        // .attr('height', function (d) {
        //     return d.height
        // })
        //layouting of groups 
        group
            .attr("x", function (d) {
                return d.bounds.x;
            })
            .attr("y", function (d) {
                // if(d._parent) return d.id * 350
                // if(d.parent) return d.parent.bounds.y
                /*if(d.parent){
                    return d.parent.bounds.y;
                }*/
                // if (d.parent) return d.parent.bounds.y + d.height * d.parent.groups.findIndex(g => g.id === d.id);// - original
                if (d.parent) {
                    return d.bounds.y// + nodeHeight
                }
                return d.bounds.y
            })
            .attr("width", function (d) {
                // if (d.parent) {
                //     // return d.bounds.width();
                //     return d.parent.width
                // }
                // if (d.parent) return d.parent.bounds.width()
                return d.bounds.width();
            })
            .attr("height", function (d) {
                // if (d.parent) {
                //     return d.parent.bounds.height() / d.parent.groups.length + 1
                // }
                // console.log('d', d.groups)
                // console.log('d', d.height)



                if (d.groups.length === 0) return nodeHeight // if group has no children --> groups.height === node.height
                else if (d.parent) return d.bounds.height() // if group has parent --> group can align itself according to parent - 50 / d.parent.groups.length

                return d.bounds.height() // + nodeHeight //(d.height - 25) / 75 + 25
                // return d.bounds.height() < d.height ? d.bounds.height() : d.height
                // if (d.groups.length > 0) {
                //     return 75 * (d.groups.length + 1)
                // }
                // return 75
            });
        //layouting of links - only if links were created
        if (link) {
            link
                .attr("d", function (d) {
                    var route = cola.makeEdgeBetween(
                        d.source.parentBounds,//original
                        d.target.parentBounds,//original
                        //d.source.bounds, 
                        //d.target.bounds,
                        //pad+8//distance from target - was 4 before, perfect for arrow head -> was before, when parentBounds of node was still set differently
                        5
                    );

                    console.log('lineFunction', lineFunction)
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





        //layouting of node labels - only if checkbox is checked 
        if (showEntityLabels) {
            label
                .attr("x", function (d) {
                    //console.log("d ->", d, "d.parent -> ", d.parent)
                    return d.parent.bounds.x + d.parent.bounds.width() / 2;
                    //return d.x; //orginial
                    //return d.bounds.x + d.bounds.width()/2;
                })
                .attr("y", function (d) {
                    const y = d.parent.bounds.y + nodePadding * 2
                    if (!d._parent) return y // if it doesnt have a parent forget the offsets
                    else if (d._groups.length !== 0) return y// + nodeHeight * 1.1 // node has children --> make space for visibilityButton
                    else return y// + nodeHeight // centered placement because node doesnt have children
                    /*var h = this.getBBox().height;
                    return d.y + h /4;*/ //original
                    //return d.bounds.y + h / 4;
                })
            // .attr('width', function (d) {
            //     return 100 //d.parent.width
            // })
            // .attr('height', function (d) {
            //     return 100 //d.parent.height
            // })
        }


        // /*groupLabel
        //     .attr("x", function (d) {
        //         return d.bounds.x + d.bounds.width() / 2; // calculate x offset by dividing through group width
        //     })
        //     .attr("y", function (d) {
        //         return d.bounds.y + 18; // calculate y offset by adding the height of the groupLabel
        //     });*/

        //layouting of linklabels - only if checkbox is checked and links were created
        if (link && showLinkLabels) {
            linkLabel
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





        visibilityButton
            .attr("x", function (d) {
                //console.log("d ->", d, "d.parent -> ", d.parent)
                return d.parent.bounds.x + nodePadding / 2
                //return d.x; //orginial
                //return d.bounds.x + d.bounds.width()/2;
            })
            .attr("y", function (d) {
                const y = d.parent.bounds.y + nodePadding * 2
                if (!d._parent) {
                    return y
                }
                return y// + nodeHeight * 3 / 4
                /*var h = this.getBBox().height;
                return d.y + h /4;*/ //original
                //return d.bounds.y + h / 4;
            })
            .text(function (d) {
                // console.log('visibilityButton', d)
                return d.childrenVisibility ? '-' : '+'
            })
    });

}

