const MYCOLOUR_BLUE = "#D0DDFF";
const MYCOLOUR_GREEN = "#C0FFB6";
const MYCOLOUR_RED = "#FFC6D6";
const MYCOLOUR_YELLOW = "#FAFFB0"; 
const STYLE_CLASS = "rounded=1;shape=rectangle;fillColor="+MYCOLOUR_BLUE;
const STYLE_PACKAGE = "shape=rectangle;rounded=1;fillColor="+MYCOLOUR_YELLOW;
const STYLE_METHOD = "shape=rhombus;fillColor="+MYCOLOUR_RED;
const STYLE_ATTRIBUTE = "shape=ellipse;fillColor="+MYCOLOUR_GREEN;

let assocs;
let entities;
const vertices=[]; 
const parents=[];
let graph; 

const body = document.getElementById('root');
const graphContainer = document.getElementById('graphContainer');
body.onload = main(graphContainer); //calls main when body is finished loading
 
//loads files, interprets json string in file and saves parsed hashmap into variables
//async means asynchronous -> other code is / can be executed while these methods work
//fetch() and json() are asynchronous methods, to call those methods await must be used
//to be able to use await the method loadFiles() itself must be asynchronous
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
    new mxRubberband(graph); 
    return graph;
}

function createHierarchicalLayout(graph){
    var layout = new mxHierarchicalLayout(graph);   
    layout.resizeParent = true;//resize parent so parent is able to hold all children 
    layout.moveParent = false; //move parent if resizing is called
    layout.parentBorder = 10;//border size between children of parent and parent border 
    layout.intraCellSpacing = 20; 
    layout.interRankCellSpacing = 0; 
    layout.interHierarchySpacing = 20; //spacing between seperate hierarchies
    //layout.parallelEdgeSpacing = 0; //Edge bundling? -- or adding another layouting algorithm
    //layout.orientation = mxConstants.DIRECTION_WEST; 
    layout.fineTuning = true; 
    layout.tightenToSource = true; 
    //layout.disableEdgeStyle = false; //makes custom edge style possible
    //layout.traverseAncestors = true;
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

function getHeight(parent){
    if(parent === graph.getDefaultParent()){
        return 100; 
    }else{
        return 20;
    } 
}

function getWidth(parent){
    if(parent === graph.getDefaultParent()){
        return 100; 
    }else{
        return 20;
    }
}

function insertVertices(){
    Object.keys(entities).forEach(function(key){//looping through each entity
        style = getStyle(entities[key].fType, key); //get style depending on what type of entity it is 
        parent = getParent(entities[key].fParentAsString); //get parent for correct hierarchical structure
        width = getWidth(parent); 
        height = getHeight(parent); 
        vertices.push(graph.insertVertex(parent, entities[key].fUniqueName, entities[key].fUniqueName, 0, 0, height, width, style));   
    });
}

function executeLayout(layout){
    //executing layout - ?? slighty different statements perform totally different layout
    layout.execute(graph.getDefaultParent(), graph.getChildVertices(graph.getDefaultParent()));
    parents.forEach(function(parent){
        layout.execute(parent, graph.getChildVertices(parent));
    })
}