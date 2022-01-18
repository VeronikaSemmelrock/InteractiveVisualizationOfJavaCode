const MYCOLOUR_BLUE = "#D0DDFF";
const MYCOLOUR_GREEN = "#C0FFB6";
const MYCOLOUR_RED = "#FFC6D6";
const MYCOLOUR_YELLOW = "#FAFFB0";
const LABELSTYLE = "";//verticalAlign=top - only needed if style is not swimlane
const STYLE_CLASS = "autosize=1;fillColor="+MYCOLOUR_BLUE+";"+LABELSTYLE;
const STYLE_PACKAGE = "autosize=1;fillColor="+MYCOLOUR_YELLOW+";"+LABELSTYLE;
const STYLE_METHOD = "autosize=1;fillColor="+MYCOLOUR_RED+";"+LABELSTYLE;
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

const DEFAULT_LAYOUT = "circle"//stackVertical

//global variables
let assocs;
let entities;
const vertices=[];
const edges = []; 
const parents=[];
let graph;
var circleLayout; 
var stackLayout; 
var layoutManager; 
var invisibleParent; 
var globalLayout = DEFAULT_LAYOUT; 

//calling of main function
const body = document.getElementById('root');
const graphContainer = document.getElementById('graphContainer');
body.onload = main(graphContainer); //calls main when body is finished loading

//method that loads files (json-Strings) into global variables
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
    await loadFiles();
    if(!mxClient.isBrowserSupported()){
        alert("Browser not supported!");
    }else{
        graph = createGraph(container);
        createLayouts();
        installLayoutManager(); 
        setVertexStyle();
        setEdgeStyle();  
        graph.getModel().beginUpdate();
        try{
            insertVertices();
            insertEdges(); 
            executeFilteroptions(true); 
            //executeLayoutoptions(); 
        } finally{
            graph.getModel().endUpdate();
        }
    }
};

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
    return graph;
}

//returns specific style for vertex as string
function getStyle(fType, key){
    switch (fType){
        case "class":
           return STYLE_CLASS;
           break;
        case "package":
            return STYLE_PACKAGE;
            break;
        case "method":
            return STYLE_METHOD;
            break;
        case "attribute":
            return STYLE_ATTRIBUTE;
            break; 
        default:
            alert("Object "+key+" did not have a correclty set type for choosing style");
            return "";
            break;
    }
}

//returns correct parent for hierarchy (folding)
function getParent(parentString){
    //getting correct parent for hierarchical structure
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
    invisibleParent = graph.insertVertex(graph.getDefaultParent(), null, '', 0, 0, 120, 0, 'invisible');
    Object.keys(entities).forEach(function(key){//looping through each entity
        style = getStyle(entities[key].fType, key); //get style depending on what type of entity it is
        parent = getParent(entities[key].fParentAsString); //get parent for correct hierarchical structure
        width = getWidth(parent); //get width depending on how deep in hierarchy the element is 
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
        e = graph.insertEdge(from, key, assocs[key].fType, from, getVertex(assocs[key].fToEntity.fUniqueName));//changed parent of edge!! it was defaultParent()!!
        edges.push(e);
    });
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

//sets global edge style once
function setEdgeStyle(){
    var edgeStyle = graph.stylesheet.getDefaultEdgeStyle(); 
    edgeStyle[mxConstants.STYLE_STROKEWIDTH]=1; 
    edgeStyle[mxConstants.STYLE_STROKECOLOR]="black";
    edgeStyle[mxConstants.STYLE_FONTCOLOR] = "black"; 
    edgeStyle[mxConstants.STYLE_ROUNDED]=true; //depends on taste
    edgeStyle[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
    //other options
    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_ENTITY_RELATION; //good
    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_SIDETOSIDE;//good 
    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_ORTHOGONAL; 
    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_SEGMENT; 
    //edgeStyle[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_TOPTOBOTTOM; 
    //edgeStyle[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector; 

}

//sets default vertex style and registers own "invisible" style for parent 
function setVertexStyle(){
    let style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = 'swimlane';
    style[mxConstants.STYLE_STARTSIZE] = 30;
    
    //invisible parent
    style = [];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_STROKECOLOR] = 'none';
    style[mxConstants.STYLE_FILLCOLOR] = 'none';
    style[mxConstants.STYLE_FOLDABLE] = false;
    graph.getStylesheet().putCellStyle('invisible', style);
}

//creates and sets global layouts
function createLayouts(){
    stackLayout = new mxStackLayout(graph, true);
    circleLayout = new mxCircleLayout(graph, 5);
    stackLayout.border = graph.border; 
    circleLayout.border=graph.border;
}

//installs layoutManager - called everytime a change is made to graph - used to set different layouts for different cells
function installLayoutManager(){
    layoutManager = new mxLayoutManager(graph);

    layoutManager.getLayout = function(cell)
    {   
        layout = globalLayout;  
        //sets different layouts on different parent cells. 
        //attention -> layout is applied on children of parent cell, not parent itself
        if(cell.parent === graph.getDefaultParent()){//selects invisible parent - layout is applied on all children so first visible layer
            if(layout == "circle"){
                //TODO - maybe small adjustmenst - radius is big
                //TODO - edges do not filter properly!
                circleLayout.moveCircle = true;
                return circleLayout;                         
            }else if(layout == "stackVertical"){
                //TODO - edges do not filter properly
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
//executes the specific layout that is given through UI radio buttons - TODO calling of getLayout does not work 
function executeLayoutoptions(layout){
    console.log("executing Layout with value "+layout)
    globalLayout = layout; 
    //layoutManager.getLayout(cell); //only gets layout i think.. does not actually execute..
    installLayoutManager(); 
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
