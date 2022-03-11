//variables for styling
const MYCOLOUR_GREEN = "#9bf28e";
const MYCOLOUR_RED = "#ff7575";
const MYCOLOUR_LIGHTBLUE = "#D0DDFF";
const MYCOLOUR_DARKBLUE = "#5AADEB";
const MYCOLOUR_PINK = "#ff97b1";
const MYCOLOUR_YELLOW = "#FAFFB0";
const MYCOLOUR_DARKGREEN = "#A1CA45";
const STYLE_PACKAGE = "fillColor="+MYCOLOUR_YELLOW+";";
const STYLE_CLASS = "fillColor="+MYCOLOUR_RED+";";
const STYLE_METHOD = "fillColor="+MYCOLOUR_LIGHTBLUE+";";
const STYLE_CONSTRUCTOR = "fillColor="+MYCOLOUR_DARKBLUE+";";
const STYLE_ATTRIBUTE = "shape=ellipse;fillColor="+MYCOLOUR_PINK+";";
const STYLE_PARAMETER = "shape=ellipse;fillColor="+MYCOLOUR_DARKGREEN+";";
const STYLE_LOCALVARIABLE = "shape=ellipse;fillColor="+MYCOLOUR_GREEN+";";

//variables for layouting 
const HEIGHT_LOWESTLEVEL = 30; //determines height of elements that dont have children. Rest is autoresized
const STANDARD_WIDTH = 330; //determines width of elements of upper layer 
const GRAPH_BORDER = 20; //determines, how far away child is from parent border (how small child is inside of parent) - works together with standard width

const LAYOUT_PARENTBORDER = 100;//border size between children of parent and parent border
const LAYOUT_INTRACELLSPACING = 30; 
const LAYOUT_INTERRANKCELLSPACING = 0; 
const LAYOUT_INTERHIERARCHYSPACING = 13; //spacing between seperate hierarchies
const LAYOUT_XDISTANCE_PARENTS = 50; //distance of parents between each other (x)
const LAYOUT_YDISTANCE_CHILDREN = 10; //distance between children of one parent (y) in stack


//variables for name parsing
const DELIMITER_METHOD = '.';
const DELIMITER_LOCALVARIABLE = '^';
const DELIMITER_PARAMETER ='\'';
const DELIMITER_ATTRIBUTE = '#';

//global variables
let assocs;
let entities;
const vertices=[];
const edges = []; 
const parents=[];
let graph;
var circleLayout; 
var stackLayout;
var fastOrganicLayout;  
var layoutManager; 
var invisibleParent; 

let LAYOUT = 'stackVertical' //f

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
        setVertexStyle();
        setEdgeStyle();  
        graph.getModel().beginUpdate();
        try{
            insertVertices();
            insertEdges(); 
            executeFilteroptions(true); 
            executeLayoutoptions(getLayoutOption(), true);
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
        case "package":
            return STYLE_PACKAGE;
            break;
        case "class":
           return STYLE_CLASS;
           break;
        case "method":
            return STYLE_METHOD;
            break;
        case "constructor":
            return STYLE_CONSTRUCTOR; 
            break;
        case "attribute":
            return STYLE_ATTRIBUTE;
            break; 
        case "parameter": 
            return STYLE_PARAMETER; 
            break; 
        case "localVariable":
            return STYLE_LOCALVARIABLE; 
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
        v = graph.insertVertex(parent, entities[key].fUniqueName, getName(entities[key].fUniqueName, entities[key].fType, entities[key].fForeign), 0, 0, width, HEIGHT_LOWESTLEVEL, style); 
        v.collapsed = true;
        vertices.push(v);
    });
}

//returns name of elements, cuts away "path" from uniqueName
function getName(name, type, foreign){
    if(foreign){
        return name; 
    }
    let highestIndex = 0; 
    if(type == "method" || type == "constructor" || name.lastIndexOf("<") > -1){
        let maxIndex = name.lastIndexOf("(");
        if(maxIndex == -1){
            maxIndex = name.lastIndexOf("<"); 
        }  
        for (let i = 0; i < maxIndex; i++) {
            if (name.charAt(i) == ".") {
                highestIndex = i; 
            }    
        } 
    }else if(type == "package" || type == "class" ){
        highestIndex = name.lastIndexOf("$"); //nested classes
        if(highestIndex == -1){
            highestIndex = name.lastIndexOf("."); 
        }
    }else if(type == "attribute"){
        highestIndex = name.lastIndexOf(DELIMITER_ATTRIBUTE); 
    }else if(type == "parameter"){
        highestIndex = name.lastIndexOf(DELIMITER_PARAMETER);
    }else if(type == "localVariable"){
        highestIndex = name.lastIndexOf(DELIMITER_LOCALVARIABLE); 
    }

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
    style[mxConstants.STYLE_WHITE_SPACE] = 'wrap'; 
    style[mxConstants.STYLE_STROKECOLOR] ='#000000'; //black
    style[mxConstants.STYLE_FONTCOLOR] = '#000000'; 
    style[mxConstants.STYLE_AUTOSIZE] ='1'; 
    
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
    fastOrganicLayout = new mxFastOrganicLayout(graph); 
    stackLayout.border = graph.border; 
    circleLayout.border=graph.border;
    fastOrganicLayout.border = graph.border; 
}

//installs layoutManager - called everytime a change is made to graph - used to set different layouts for different cells
function installLayoutManager(layout){
    layoutManager = new mxLayoutManager(graph);
    //arrangeGroups method in mxGraphLayout? 

    layoutManager.getLayout = function(cell)
    {   
        //sets different layouts on different parent cells. 
        //attention -> layout is applied on children of parent cell, not parent itself
        if(cell.parent === graph.getDefaultParent()){//selects invisible parent - layout is applied on all children so first visible layer
            LAYOUT = layout //f
            zoom()//f
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
            }else if(layout =="fastOrganic"){
                //fastOrganicLayout.minDistanceLimit = 500;  
                //fastOrganicLayout.maxDistanceLimit = 500; 
                //fastOrganicLayout.initialTemp = 10;  
                //arrangeGroups()? 
                return fastOrganicLayout; 
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

function getLayoutOption(){
    return document.querySelector('input[name="layout"]:checked').value
}



//executes the specific layout that is given through UI radio buttons - TODO calling of getLayout does not work 
function executeLayoutoptions(layout, noReload){
    //layoutManager.getLayout(cell); //only gets layout i think.. does not actually execute..
    installLayoutManager(layout); 
    //undefined is false 
    if(!noReload) window.location.reload() //only reloads if method is called because of changing state of checkboxes
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
            graph.getModel().endUpdate();
        }
    //undefined is false 
    if(!noReload) window.location.reload() //only reloads if method is called because of changing state of checkboxes 
}

//sets correct visibility of edge/vertex depending on what filters are applied through checkboxes in UI 
function setVisibility(value, filters){
    let type; 
    foreign = false; 
    if(value.isVertex()){
        type = getTypeViaName(value.id);
        foreign = getForeignViaName(value.id); 
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
            case "constructor": 
                bool = filters[3]; 
                break; 
            case "attribute": 
                bool = filters[4]; 
                break; 
            case "parameter": 
                bool = filters[5]; 
                break;
            case "LocalVariable": 
                bool = filters[6]; 
                break;
            case "implements": 
                bool = filters[7]; 
                break; 
            case "extends": 
                bool = filters[8]; 
                break; 
            case "returnType": 
                bool = filters[9]; 
                break; 
            case "access": 
                bool = filters[10]; 
                break; 
            case "invocation": 
                bool = filters[11]; 
                break; 
            default: 
                bool = true;
                break;  
        }
        //for filtering of foreign objects
        let allowForeign = filters[12]; 
        if(!allowForeign && foreign){
            bool = false; 
        }
        value.visible = bool; 
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

//receives a uniquename of a vertex, checks whether the entity behind the vertex is foreign or not 
function getForeignViaName(uniqueName){
    let entity;
    let res
    Object.keys(entities).forEach(function(key){//looping through each association
        if(entities[key].fUniqueName == uniqueName){
            res = entities[key]
            return key; 
        }
    });
    if(res) {
        return res.fForeign
    }
}
