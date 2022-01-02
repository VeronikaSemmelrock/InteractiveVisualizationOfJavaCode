let assocs;
let entities;

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
    await loadFiles();
    if(!mxClient.isBrowserSupported()){
        alert("Browser not supported!");
    }else{
        let graph = new mxGraph(container);//create variable holding mxGraph and add to container
        new mxRubberband(graph); //put rubberband around graph so graph can be moved around
        let parent = graph.getDefaultParent(); 
        graph.getModel().beginUpdate();
        let x = 0; 
        let y= 0; 
        const vertices = [];
        const parents =[]; //remembering parents for layouting
        let width; 
        let height;  

        try{
            var layout = new mxHierarchicalLayout(graph);
            
            layout.resizeParent = true;//resize parent so parent is able to hold all children 
            layout.moveParent = false; 
            
            layout.parentBorder = 10;//border size between children of parent and parent border 
            layout.intraCellSpacing = 20; 
            layout.interRankCellSpacing = 0; 
            layout.interHierarchySpacing = 20; //spacing between seperate hierarchies

            //layout.parallelEdgeSpacing = 0; //Edge bundling? -- or adding another layouting algorithm
            //layout.orientation = mxConstants.DIRECTION_WEST; 
            layout.fineTuning = true; 
            layout.tightenToSource = true; 
            //layout.disableEdgeStyle = false; //makes custom edge style possible

            layout.traverseAncestors = true;

            Object.keys(entities).forEach(function(key){
                //deciding on shape/style
                switch (entities[key].fType){
                    case "class": 
                       style = "rounded=1;fillColor=#D0DDFF;shape=rectangle";  // blue; style from mxConstants.js                       
                       break; 
                    case "package":
                        style = "shape=rectangle;rounded=1;fillColor=#FAFFB0"; // yellow
                        break; 
                    case "method": 
                        style = "fillColor=#FFC6D6;shape=rhombus"; // red
                        break; 
                    case "attribute": 
                        style = "fillColor=#C0FFB6;shape=ellipse"; // green
                        break; 
                    default: 
                        alert("Object "+key+" did not have a correclty set type for choosing shape");
                        style = null; 
                        break;
                }
                
                //getting correct parent for hierarchical structure
                if(entities[key].fParentAsString == "null"){
                    parent = graph.getDefaultParent();
                    height = 100; 
                    width = 100; 
                }else{
                    parent = vertices.find(function(vertex){
                        if(vertex.id == entities[key].fParentAsString){
                            parents.push(vertex); 
                            return vertex
                        }
                    })
                    height = 20; 
                    width = 20; 
                }
                //console.log(parent, entities[key].fUniqueName, entities[key].fUniqueName, x, y, width, height, style)
                //creating vertices
                vertices.push(graph.insertVertex(parent, entities[key].fUniqueName, entities[key].fUniqueName, x, y, height, width, style));
                     
            });

            //layout.execute(graph.getDefaultParent(), parents);
            layout.execute(graph.getDefaultParent(), graph.getDefaultParent().getChildren())
            /*layout.execute(graph.getDefaultParent()); 
            parents.forEach(function(parent){
                layout.execute(parent);
            })
            
            //??? different layout if both execute statements are executed?? - hm 
            //make use of findRoots()??

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