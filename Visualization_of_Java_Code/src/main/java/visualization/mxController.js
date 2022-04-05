//creates graph with specific design options
function createGraph(container){
    mxConstants.ENTITY_SEGMENT = 20; // Enables crisp rendering of rectangles in SVG
    let graph = new mxGraph(container);
    //options for folding (show/hide of groups)
    graph.setDropEnabled(true);
    graph.setAutoSizeCells(true);
    graph.setPanning(true);
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.cellsSelectable = false; //nothing can be selected anymore!!
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;
    graph.border = GRAPH_BORDER;
    graph.setResizeContainer(true);
    new mxRubberband(graph);

    //adds mouse listener for more automatic zooming
    graph.addMouseListener({
        mouseDown: function (sender, event) {
            const zoomLevel = zoomInput.value
            setTimeout(() => {
                centerScrollPosition(zoomLevel)
            }, 100)
        },
        mouseUp: function(sender, event) {
            // console.log('mouse event') // disabled
        },
        mouseMove: function (sender, event) {
            // console.log('mouse event') // disabled
        }
    })

    return graph;
}



//returns correct parent for hierarchy (folding)
function getParent(parentString){
    if(parentString == "null"){
        parent = invisibleParent;//for layouting of first layer 
    }else{
        parent = vertices.find(function(vertex){
            if(vertex.id == parentString){
                parents.push(vertex);
                return vertex;
            }
        })
    }
    return parent;
}
//returns the vertex in graph that has unique name set as id
function getVertex(uniqueName){ 
    let found; 
    found = vertices.find(function(vertex){
        if(vertex.id == uniqueName){ 
            return vertex;
        }
    })
    return found; 
}

//inserts all vertices, one vertice per element in entities.json
function insertVertices(){
    let v; 
    invisibleParent = graph.insertVertex(graph.getDefaultParent(), null, '', 0, 0, 120, 0, 'invisible');
    Object.keys(entities).forEach(function(key){//looping through each entity
        style = getStyle(entities[key].fType, key); //get style depending on what type of entity it is
        parent = getParent(entities[key].fParentAsString); //get parent for correct hierarchical structure
        width = getWidth(parent); //get width depending on how deep in hierarchy the element is 
        height = HEIGHT_LOWESTLEVEL; //height is always autoresized, except lowest level (when element has no children)
        v = graph.insertVertex(parent, entities[key].fUniqueName, getName(entities[key].fUniqueName, entities[key].fType, entities[key].fForeign), 0, 0, width, HEIGHT_LOWESTLEVEL, style); 
        v.collapsed = true;
        vertices.push(v);
    });
}

//inserts all edges, one edge per element in assocs.json
function insertEdges(){
    let from; 
    Object.keys(assocs).forEach(function(key){//looping through each association
        from = getVertex(assocs[key].fFromEntity.fUniqueName);
        to = getVertex(assocs[key].fToEntity.fUniqueName);
        //parent, id (just index), value (type) - what is written, from, to (style - set already in stylesheet)
        e = graph.insertEdge(from, key, assocs[key].fType, from, to);//changed parent of edge!! it was defaultParent()!!
        edges.push(e);
    });
}

/////////FILTERING AND LAYOUTING

//creates and sets global layouts
function createLayouts(){
    stackLayout = new mxStackLayout(graph, true);
    circleLayout = new mxCircleLayout(graph, 5);
    fastOrganicLayout = new mxFastOrganicLayout(graph); 
    stackLayout.border = graph.border; 
    circleLayout.border=graph.border;
    fastOrganicLayout.border = graph.border; 
}
//installs layoutManager - called everytime a change is made to graph - used to set different layouts for different cells
function installLayoutManager(layout){
    layoutManager = new mxLayoutManager(graph);

    layoutManager.getLayout = function(cell){
        LAYOUT = layout
        zoom()
        //sets different layouts on different parent cells. 
        //attention -> layout is applied on children of parent cell, not parent itself
        if(cell.parent === graph.getDefaultParent()){//selects invisible parent - layout is applied on all children so first visible layer
            if(layout == "circle"){
                circleLayout.moveCircle = true;
                return circleLayout;                         
            }else if(layout == "stackVertical"){
                stackLayout.horizontal = false;
                return stackLayout; 
            }else if(layout =="stackHorizontal"){
                stackLayout.horizontal = true;
                return stackLayout; 
            }
        }else{//all cells except invisible parent
            if(cell.collapsed){//if cell is collapsed children are not visible so no layout is necessary
                return null;
            }else{//cells where children are visible - apply specific stackLayout
                if (cell.parent !== graph.getDefaultParent()){
                    stackLayout.resizeParent = true;
                    stackLayout.horizontal = false;
                    stackLayout.spacing = 10; 
                }
            }
            return stackLayout; 
            }
    };

}

//executes the specific layout that is given through UI radio buttons
function executeLayoutoptions(layout, noReload){
    installLayoutManager(layout);
    graph.refresh(); 
    layoutManager.executeLayout(invisibleParent, true)
}

//executes filtering depending on status of checkboxes in UI
function executeFilteroptions(noReload){
    let filters=[];
    filters.push(document.getElementById("filterPackages").checked);
    filters.push(document.getElementById("filterClasses").checked);
    filters.push(document.getElementById("filterMethods").checked);
    filters.push(document.getElementById("filterConstructors").checked);
    filters.push(document.getElementById("filterAttributes").checked);
    filters.push(document.getElementById("filterParameters").checked);
    filters.push(document.getElementById("filterLocalVariables").checked);
    filters.push(document.getElementById("filterImplements").checked);
    filters.push(document.getElementById("filterExtends").checked);
    filters.push(document.getElementById("filterReturnTypes").checked);
    filters.push(document.getElementById("filterAccesses").checked);
    filters.push(document.getElementById("filterInvocations").checked);
    filters.push(document.getElementById("filterForeign").checked);//!!
    graph.getModel().beginUpdate();
    try{
        vertices.forEach((value)=>setVisibility(value, filters));
        edges.forEach((value)=>setVisibility(value, filters));
    } finally{
        //layoutManager.executeLayout(invisibleParent, true)
        graph.getModel().endUpdate();
    }
    graph.refresh()
    //undefined is false
    //if(!noReload) window.location.reload() //only reloads if method is called because of changing state of checkboxes
    layoutManager.executeLayout(invisibleParent, true)
}