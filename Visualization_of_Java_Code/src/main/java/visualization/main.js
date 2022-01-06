const MYCOLOUR_BLUE = "#D0DDFF";
const MYCOLOUR_GREEN = "#C0FFB6";
const MYCOLOUR_RED = "#FFC6D6";
const MYCOLOUR_YELLOW = "#FAFFB0";
const STYLE_CLASS = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_BLUE;
const STYLE_PACKAGE = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_YELLOW;
const STYLE_METHOD = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_RED;
const STYLE_ATTRIBUTE = "autosize=1;shape=ellipse;fillColor="+MYCOLOUR_GREEN;

const HEIGHT_LOWESTLEVEL = 30; //determines height of elements that dont have children. Rest is autoresized
const STANDARD_WIDTH = 250; //determines width of elements of upper layer 
const GRAPH_BORDER = 20; //determines, how far away child is from parent border (how small child is inside of parent) - works together with standard width

const LAYOUT_PARENTBORDER = 10;//border size between children of parent and parent border
const LAYOUT_INTRACELLSPACING = 20; 
const LAYOUT_INTERRANKCELLSPACING = 0; 
const LAYOUT_INTERHIERARCHYSPACING = 13; //spacing between seperate hierarchies

let assocs;
let entities;
const vertices=[];
const parents=[];
let graph;

const body = document.getElementById('root');
const graphContainer = document.getElementById('graphContainer');
body.onload = main(graphContainer); //calls main when body is finished loading

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
        //layout = createHierarchicalLayout(graph);//must be seperately executed via executeLayout(layout); 
        graph.getModel().beginUpdate();
        try{
            insertVertices();
            //executeLayout(layout); //for additional / hierarchical layout - at least not for installmxStackLayout

            //inserting dummy vertices
            /*vertices.forEach(function(vertex, i){
                graph.insertEdge(graph.getDefaultParent, null, "tests", vertex, vertices[i+1]);
            })
            */

        } finally{
            graph.getModel().endUpdate();
        }
    }
};


function createGraph(container){
    let graph = new mxGraph(container);
    //options for folding (show/hide of groups)
    graph.setDropEnabled(true);
    graph.setAutoSizeCells(true);
    graph.setPanning(true);
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.cellsSelectable = false; //nothing can be moved around anymore!
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;
    graph.border = GRAPH_BORDER;
    graph.setResizeContainer(true);
    new mxRubberband(graph);
    return graph;
}
//installs auto layouting on all levels of hierarchies (folding)
function installmxStackLayout(){
    var layout = new mxStackLayout(graph, true);
    layout.border = graph.border;
    var layoutMgr = new mxLayoutManager(graph);
    layoutMgr.getLayout = function(cell)
    {
        if (!cell.collapsed)
        {
            if (cell.parent != graph.model.root)
            {
                layout.resizeParent = true;
                layout.horizontal = false;
                layout.spacing = 10;
            }
            else
            {
                layout.resizeParent = true;
                layout.horizontal = true;
                layout.spacing = 50;
            }
            return layout;
        }
        return null;
    }; 
}
function createHierarchicalLayout(graph){
    var layout = new mxHierarchicalLayout(graph);
    //layout.resizeParent = true;
    layout.moveParent = false; //move parent if resizing is called
    layout.parentBorder = PARENTBORDER;
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

function getStyle(fType, key){
    let style;
    //deciding on shape/style
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
            alert("Object "+key+" did not have a correclty set type for choosing shape");
            style = null;
            break;
    }
    return style;
}

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

function getWidth(parent){
    let width = STANDARD_WIDTH; 
    if(parent === graph.getDefaultParent()) return width;
    else if(parent.parent === graph.getDefaultParent())return width - GRAPH_BORDER*2; 
    else if (parent.parent.parent === graph.getDefaultParent()) return width -GRAPH_BORDER*4; 
    else if (parent.parent.parent.parent === graph.getDefaultParent()) return width - GRAPH_BORDER*6; 
    else if (parent.parent.parent.parent.parent === graph.getDefaultParent()) return width - GRAPH_BORDER*8; 
}

function insertVertices(){
    let v; 
    Object.keys(entities).forEach(function(key){//looping through each entity
        style = getStyle(entities[key].fType, key); //get style depending on what type of entity it is
        parent = getParent(entities[key].fParentAsString); //get parent for correct hierarchical structure
        width = getWidth(parent);
        height = HEIGHT_LOWESTLEVEL; //height is always autoresized, except lowest level (when element has no children)
        v = graph.insertVertex(parent, entities[key].fUniqueName, entities[key].fUniqueName, 0, 0, width, HEIGHT_LOWESTLEVEL, style); 
        v.collapsed = true; 
        vertices.push(v);
    });
}

function executeLayout(layout){
    parents.forEach(function(parent){
        layout.execute(parent, graph.getChildVertices(parent));
    })
}
