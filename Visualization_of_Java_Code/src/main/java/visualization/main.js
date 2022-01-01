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
        let x = 1; 
        let y= 1;
        const vertexes = [];
    

        try{
            Object.keys(entities).forEach(function(key){

                //deciding on shape/style
                switch (entities[key].fType){
                    case "class": 
                       style = "SHAPE_RECTANGLE;ROUNDED;fillColor=#D0DDFF";  //style from mxConstants.js
                       break; 
                    case "package":
                        style = "SHAPE_RECTANGLE;fillColor=#FAFFB0"; 
                        break; 
                    case "method": 
                        style = "SHAPE_RHOMBUS;fillColor=#FFC6D6"; 
                        break; 
                    case "attribute": 
                        style = "SHAPE_ELLIPSE;fillColor=#FAFFB0"; 
                        break; 
                    default: 
                        alert("Object "+key+" did not have a correclty set type for choosing shape");
                        style = null; 
                        break;
                }
                //getting correct parent of hierarchial structure
                if(entities[key].fParentAsString == "null"){
                    parent = graph.getDefaultParent();
                }else{
                    parent = vertexes.find(function(vertex){
                        if(vertex.id == entities[key].fParentAsString){
                            return vertex
                        }
                    })
                }
                console.log(parent, entities[key].fUniqueName, entities[key].fUniqueName, x, y, 70, 30, style)
                //creating vertexes
                vertexes.push(graph.insertVertex(parent, entities[key].fUniqueName, entities[key].fUniqueName, x, y, 70, 30, style));
                x+=50; 
                y+=50; 

                
            });
        } finally{
            graph.getModel().endUpdate();
        }
    }
};