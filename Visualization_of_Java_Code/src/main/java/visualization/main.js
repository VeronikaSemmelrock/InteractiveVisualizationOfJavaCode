const MYCOLOUR_BLUE = "#D0DDFF";
const MYCOLOUR_GREEN = "#C0FFB6";
const MYCOLOUR_RED = "#FFC6D6";
const MYCOLOUR_YELLOW = "#FAFFB0";
const LABELSTYLE = "verticalAlign=top";
const STYLE_CLASS = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_BLUE+";"+LABELSTYLE;
const STYLE_PACKAGE = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_YELLOW+";"+LABELSTYLE;
const STYLE_METHOD = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_RED+";"+LABELSTYLE;
const STYLE_ATTRIBUTE = "autosize=1;shape=ellipse;fillColor="+MYCOLOUR_GREEN+";"+LABELSTYLE;

//variables for layouting 
const HEIGHT_LOWESTLEVEL = 30; //determines height of elements that dont have children. Rest is autoresized
const STANDARD_WIDTH = 250; //determines width of elements of upper layer 
const GRAPH_BORDER = 20; //determines, how far away child is from parent border (how small child is inside of parent) - works together with standard width

const LAYOUT_PARENTBORDER = 10;//border size between children of parent and parent border
const LAYOUT_INTRACELLSPACING = 20; 
const LAYOUT_INTERRANKCELLSPACING = 0; 
const LAYOUT_INTERHIERARCHYSPACING = 13; //spacing between seperate hierarchies
const LAYOUT_XDISTANCE_PARENTS = 50; //distance of parents between each other (x)
const LAYOUT_YDISTANCE_CHILDREN = 10; //distance between children of one parent (y) in stack

//global variables
let assocs;
let entities;
const vertices=[];
const edges = []; 
const parents=[];
let graph;
var layout; 

//calling of main function
const body = document.getElementById('root');
const graphContainer = document.getElementById('graphContainer');
body.onload = main(graphContainer); //calls main when body is finished loading

//method that loads files (json-STrings) into global variables
async function loadFiles(){
    try{
        assocs = await (await fetch('/assocs.json')).json();
        entities = await (await fetch('/entities.json')).json();
    } catch(e){
        alert("Couldn´t load files!")
    }
}

//because loadFiles() (async method) is called, main() must be async (to be able to call await)
async function main(container){
    let parent;
    let width;
    let height;
    let style;
    await loadFiles();
    if(!mxClient.isBrowserSupported()){
        alert("Browser not supported!");
    }else{
        graph = createGraph(container);
        layout = installmxStackLayout();
        //layout = installmxCircleLayout(); //does not work as intended - styling not perfect
        //layout = installmxCompositeLayout(); //does not work at all yet
        //layout = createHierarchicalLayout(graph);//must be seperately executed via executeLayout(layout); 
        graph.getModel().beginUpdate();
        try{
            insertVertices();
            setEdgeStyle(); 
            insertEdges(); 
            executeFilteroptions(true); 
            executeLayoutoptions(); 
            //executeLayout(layout); //for additional / hierarchical layout - at least not for installmxStackLayout
        } finally{
            graph.getModel().endUpdate();
        }
    }
};

//creates graph with specific design options
function createGraph(container){
    let graph = new mxGraph(container);
    //options for folding (show/hide of groups)
    graph.setDropEnabled(true);
    graph.setAutoSizeCells(true);
    graph.setPanning(true);
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.cellsSelectable = false; //nothing can be moved around anymore!!
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;
    graph.border = GRAPH_BORDER;
    graph.setResizeContainer(true);
    new mxRubberband(graph);
    return graph;
}

//returns specific style for vertex as string
function getStyle(fType, key){
    let style;
    //deciding on shape/style for entities and assocs
    switch (fType){
        case "class":
           style = STYLE_CLASS;
           break;
        case "package":
            style = STYLE_PACKAGE;
            break;
        case "method":
            style = STYLE_METHOD;
            break;
        case "attribute":
            style = STYLE_ATTRIBUTE;
            break; 
        default:
            alert("Object "+key+" did not have a correclty set type for choosing style");
            style = "";
            break;
    }
    return style;
}

//returns correct parent for hierarchy (folding etc)
function getParent(parentString){
    //getting correct parent for hierarchical structure
    if(parentString == "null"){
        parent = graph.getDefaultParent();
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

//returns correct width - smaller, if deeper in hierarchy
function getWidth(parent){
    let width = STANDARD_WIDTH; 
    let sub = GRAPH_BORDER; 
    if(parent === graph.getDefaultParent()) return width; 
    else{
        while(parent !== graph.getDefaultParent()){//each layer we go deeper, more must be subtracted (times 2 because once on each side)
            parent = parent.parent;//go one layer higher, trying to find defaultParent to determine on which layer this element is 
            sub += GRAPH_BORDER*2;//for each step subtract more from width
        }
        return width - sub; 
    }
}

//inserts all vertices, one vertice per element in entities.json
function insertVertices(){
    let v; 
    Object.keys(entities).forEach(function(key){//looping through each entity
        style = getStyle(entities[key].fType, key); //get style depending on what type of entity it is
        parent = getParent(entities[key].fParentAsString); //get parent for correct hierarchical structure
        width = getWidth(parent);
        height = HEIGHT_LOWESTLEVEL; //height is always autoresized, except lowest level (when element has no children)
        v = graph.insertVertex(parent, entities[key].fUniqueName, getName(entities[key].fUniqueName), 0, 0, width, HEIGHT_LOWESTLEVEL, style); 
        v.collapsed = true; 
        vertices.push(v);
    });
}

//returns name of elements, cuts away "path" from uniqueName
function getName(name){
    highestIndex = 0; 
    let deliminters = [".", "-", "#", "$"]; 
    deliminters.forEach(function(del){
        tempIndex = name.lastIndexOf(del); //find last occurrence of this index in name
        if(tempIndex > highestIndex){
            highestIndex = tempIndex; 
        }
    })
    if(highestIndex == 0){
        return name.substring(highestIndex); //no delimiter, full name is returned
    }else{
        return name.substring(highestIndex+1); //returns rest of name, excluding last occurrence of a delimiter
    }
}

//inserts all edges, one edge per element in assocs.json
function insertEdges(){
    let from; 
    Object.keys(assocs).forEach(function(key){//looping through each association
        from = getVertex(assocs[key].fFromEntity.fUniqueName);
        //parent, id (just index), value (type) - what is written, from, to (style - set already in stylesheet)
        e = graph.insertEdge(graph.getDefaultParent(), key, assocs[key].fType, from, getVertex(assocs[key].fToEntity.fUniqueName));
        edges.push(e);
    });
}

//returns the vertex in graph that has given unique name set as id
function getVertex(uniqueName){ 
    let found; 
    found = vertices.find(function(vertex){
        if(vertex.id == uniqueName){ 
            return vertex;
        }
    })
    return found; 
}

//sets global edge style once - TODO fix edge layouting? Here or in general layout? 
function setEdgeStyle(){
    var edgeStyle = graph.stylesheet.getDefaultEdgeStyle(); 
    edgeStyle[mxConstants.STYLE_STROKEWIDTH]=1; 
    edgeStyle[mxConstants.STYLE_STROKECOLOR]="black";
    edgeStyle[mxConstants.STYLE_FONTCOLOR] = "black"; 
    edgeStyle[mxConstants.STYLE_ROUNDED]=true; //depends on taste

    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_ENTITY_RELATION; //good
    edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_SIDETOSIDE;//good 
 
    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_ORTHOGONAL; 
    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_SEGMENT; 
    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_TOPTOBOTTOM; 
    //edgeStyle[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector; 

}

//installs auto layouting on all levels of hierarchies (folding)
//Layouting can be changed in here too - TODO
function installmxStackLayout(){
    layout = new mxStackLayout(graph, true);
    layout.border = graph.border;
    createmxStackLayoutManager(layout); 
    return layout;      
}
//creates layout manager for used layout - manager is called when +/- button of hierarchy is pressed/so when graph changes
function createmxStackLayoutManager(layout){
    var layoutMgr = new mxLayoutManager(graph);
    layoutMgr.getLayout = function(cell)
    {
        if (!cell.collapsed)
        {
            if (cell.parent != graph.model.root)
            {
                layout.resizeParent = true;
                layout.horizontal = false;
                layout.spacing = LAYOUT_YDISTANCE_CHILDREN;
            }
            else
            {
                layout.resizeParent = true;
                layout.horizontal = true;
                layout.spacing = LAYOUT_XDISTANCE_PARENTS; 
            }
            return layout;
        }
        return null;
    };
}

/*
//layout manager is run after changes are made to graph - so collapsing ! - so with this code different layouts can be implemented on different levels of hierarchy
function createmxCircleLayoutManager(layout){
    let innerLayout = new mxStackLayout(graph, true); 
    var layoutMgr = new mxLayoutManager(graph);
    layoutMgr.getLayout = function(cell)
    {
        if (!cell.collapsed)
        {
            if (cell.parent != graph.model.root)
            {
                innerLayout.resizeParent = true;
                innerLayout.horizontal = false;
                innerLayout.spacing = LAYOUT_YDISTANCE_CHILDREN;
            }
            else
            {
                innerLayout.resizeParent = true;
                innerLayout.horizontal = true;
                innerLayout.spacing = LAYOUT_XDISTANCE_PARENTS; 
            }
            return innerLayout;
        }
        return null;
    };
}

function createmxCompositeLayoutManager(layout){
    let innerLayout = new mxStackLayout(graph, true); 
    var layoutMgr = new mxLayoutManager(graph);
    layoutMgr.getLayout = function(cell)
    {
        if (!cell.collapsed)
        {
            if (cell.parent != graph.model.root)
            {
                innerLayout.resizeParent = true;
                innerLayout.horizontal = false;
                innerLayout.spacing = LAYOUT_YDISTANCE_CHILDREN;
            }
            else
            {
                innerLayout.resizeParent = true;
                innerLayout.horizontal = true;
                innerLayout.spacing = LAYOUT_XDISTANCE_PARENTS; 
            }
            return innerLayout;
        }
        return null;
    };
}
*/

/*
function executeLayout(layout){
    parents.forEach(function(parent){
        layout.execute(parent, graph.getChildVertices(parent));
    })
}
*/
/*function installmxCircleLayout(){
    layout = new mxCircleLayout(graph, 50);//50 stands for radius, default is 100
    layout.border = graph.border;
    createmxCircleLayoutManager(layout); 
    return layout; 
}
function installmxCompositeLayout(){
    var first = new mxCircleLayout(graph); 
    var second = new mxStackLayout(graph, true); 
    layout = new mxCompositeLayout(graph, [first,second], first); 
    layout.border = graph.border; 
    //createmxCompositeLayoutManager(layout); 
    return layout; 
}

function createHierarchicalLayout(graph){
    var layout = new mxHierarchicalLayout(graph);
    //layout.resizeParent = true;
    layout.moveParent = false; //move parent if resizing is called
    layout.parentBorder = LAYOUT_PARENTBORDER;
    layout.intraCellSpacing = LAYOUT_INTRACELLSPACING; 
    layout.interRankCellSpacing = LAYOUT_INTERRANKCELLSPACING;
    layout.interHierarchySpacing = LAYOUT_INTERHIERARCHYSPACING;
    //layout.parallelEdgeSpacing = 0; //Edge bundling? -- or adding another layouting algorithm
    layout.orientation = mxConstants.DIRECTION_WEST;
    layout.fineTuning = true;
    layout.tightenToSource = true;
    layout.border = graph.border;
    //layout.disableEdgeStyle = false; //makes custom edge style possible
    //layout.traverseAncestors = true;
    //layout.useBoundingBox=false;
    return layout;
}
*/
//executes the specific layout that is given through UI radio buttons - TODO
function executeLayoutoptions(){
    console.log("Executing Layout!"); 
}

//executes filtering depending on status of checkboxes in UI
function executeFilteroptions(noReload){
    let filters=[]; 
    filters.push(document.getElementById("filterPackages").checked); 
    filters.push(document.getElementById("filterClasses").checked);
    filters.push(document.getElementById("filterMethods").checked);
    filters.push(document.getElementById("filterAttributes").checked);
    filters.push(document.getElementById("filterImplements").checked);
    filters.push(document.getElementById("filterExtends").checked); 
 
    graph.getModel().beginUpdate();
        try{
            vertices.forEach((value)=>setVisibility(value, filters)); 
            edges.forEach((value)=>setVisibility(value, filters));
        } finally{
            graph.getModel().endUpdate();
        }
    //undefined is false 
    if(!noReload) window.location.reload() //only reloads if method is called because of changing state of checkboxes 
}

//sets correct visibility of edge/vertex depending on what filters are applied through checkboxes in UI 
function setVisibility(value, filters){
    let type; 
    if(value.isVertex()){
        type = getTypeViaName(value.id);
    }else{
        type = value.value; //in edges type is set in value
    }
    
    if(type !== null) {    
        let bool; 
        switch (type){
            case "package": 
                bool = filters[0]; 
                break;
            case "class": 
                bool = filters[1]; 
                break; 
            case "method": 
                bool = filters[2]; 
                break; 
            case "attribute": 
                bool = filters[3]; 
                break; 
            case "implements": 
                bool = filters[4]; 
                break; 
            case "extends": 
                bool = filters[5]; 
                break; 
            default: 
                bool = true; 
        }
        if(bool){
            value.visible = true; 
        }else{ 
            value.visible = false;  
        }
    }
}

//receives a uniquename of a vertex, checks what type this vertex has (class, method, package) from corresponding element in entities.json
function getTypeViaName(uniqueName){
    let entity;
    let res
    Object.keys(entities).forEach(function(key){//looping through each association
        if(entities[key].fUniqueName == uniqueName){
            res = entities[key]
            return key; 
        }
    });
    if(res) {
        return res.fType
    }
}
