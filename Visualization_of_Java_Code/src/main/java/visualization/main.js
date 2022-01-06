const MYCOLOUR_BLUE = "#D0DDFF";
const MYCOLOUR_GREEN = "#C0FFB6";
const MYCOLOUR_RED = "#FFC6D6";
const MYCOLOUR_YELLOW = "#FAFFB0";
const STYLE_CLASS = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_BLUE;
const STYLE_PACKAGE = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_YELLOW;
const STYLE_METHOD = "autosize=1;shape=rectangle;fillColor="+MYCOLOUR_RED;
const STYLE_ATTRIBUTE = "autosize=1;shape=ellipse;fillColor="+MYCOLOUR_GREEN;

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
        // Installs auto layout for all levels
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

        graph.getModel().beginUpdate();
        try{
            let layout = createHierarchicalLayout(graph);
            insertVertices();
            executeLayout(layout);

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
    /////////code for folding (show/hide of groups)
    graph.setDropEnabled(true);
    // Enables automatic sizing for vertices after editing and
    // panning by using the left mouse button.
    graph.setAutoSizeCells(true);
    graph.setPanning(true);
    //graph.panningHandler.useLeftButtonForPanning = true;
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.cellsSelectable = false; //nothing can be moved around anymore!
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;
    graph.border = 20;
    graph.setResizeContainer(true);
    new mxRubberband(graph);
    //graph.setResizeContainer(true);?
    return graph;
}

function createHierarchicalLayout(graph){
    var layout = new mxHierarchicalLayout(graph);
    // layout.resizeParent = true;//resize parent so parent is able to hold all children
    layout.moveParent = false; //move parent if resizing is called
    layout.parentBorder = 10;//border size between children of parent and parent border
    layout.intraCellSpacing = 20;
    layout.interRankCellSpacing = 0;
    layout.interHierarchySpacing = 13; //spacing between seperate hierarchies
    //layout.parallelEdgeSpacing = 0; //Edge bundling? -- or adding another layouting algorithm
    //layout.orientation = mxConstants.DIRECTION_WEST;
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

function getHeight(parent){//height of children of defaultParent are autoresized.
    //Rest must be sized depending on which hierarchy layer they are in - TODO
    let height = innerHeight - 500 //value doesnt matter bc of autoresize
    if(parent.parent.geometry) height = parent.parent.geometry.height // != null&&!=undefined
    if(parent === graph.getDefaultParent()){
        return height;
    }else{
        return 80; // only this matters but can be adjusted based on parent geometry
    }
}

function getWidth(parent){//TODO
    let width = 250 // hard coded <-- get the root containers (children of defaultParent) and divide the innerWidth by the number of containers <-- width gets smaller if there are more containers
    if(parent.parent.geometry) width = parent.parent.geometry.width
    if(parent === graph.getDefaultParent()) return width;
    else if((parent.style).includes(MYCOLOUR_BLUE)) return width - 75;
    else return width - 40;
}

function insertVertices(){
    Object.keys(entities).forEach(function(key){//looping through each entity
        style = getStyle(entities[key].fType, key); //get style depending on what type of entity it is
        parent = getParent(entities[key].fParentAsString); //get parent for correct hierarchical structure
        width = getWidth(parent);
        height = getHeight(parent);
        vertices.push(graph.insertVertex(parent, entities[key].fUniqueName, entities[key].fUniqueName, 0, 0, width, height, style));
    });
}

function executeLayout(layout){
    parents.forEach(function(parent){
        layout.execute(parent, graph.getChildVertices(parent));
    })
}
