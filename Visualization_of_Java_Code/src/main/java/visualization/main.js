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
let LAYOUT = 'circle'

//calling of main function
const body = document.getElementById('root');
const graphContainer = document.getElementById('graphContainer');
body.onload = main(graphContainer); //calls main when body is finished loading



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
            executeLayoutoptions(getLayoutOption(), true);
            executeFilteroptions(true); 
            
        } finally{
            graph.getModel().endUpdate();
        }
    }
    fitToView()
};

//method that loads files (json-Strings) into global variables
async function loadFiles(){
    try{
        assocs = await (await fetch('/assocs.json')).json();
        entities = await (await fetch('/entities.json')).json();
    } catch(e){
        alert("Couldn´t load files!")
    }
}




















