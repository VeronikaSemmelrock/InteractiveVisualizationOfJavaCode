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
        let xUpperLayer = 0; 
        let yUpperLayer =0; 
        const vertexes = [];
        let newtype; 
        let oldtype; 
        let width; 
        let height; 
    
        let pkgOffsetX = 300;
        let pkgOffsetY = 0;
        let pkgColumns

        try{
            Object.keys(entities).forEach(function(key){

                //deciding on shape/style and correct coordinates
                switch (entities[key].fType){
                    case "class": 
                       style = "SHAPE_RECTANGLE;rounded=1;fillColor=#D0DDFF";  // blue; style from mxConstants.js
                       newtype = "class";
                       width = 200; 
                       height = 50; 
                       break; 
                    case "package":
                        style = "SHAPE_RECTANGLE;rounded=1;fillColor=#FAFFB0"; // yellow
                        newtype = "package";
                        width = 300; 
                        height = 300; 
                        pkgColumns ++
                        break; 
                    case "method": 
                        style = "SHAPE_RHOMBUS;rounded=1;fillColor=#FFC6D6"; // red
                        newtype = "method";
                        width = 180; 
                        height = 30;
                        break; 
                    case "attribute": 
                        style = "SHAPE_ELLIPSE;rounded=1;fillColor=#C0FFB6"; // green
                        newtype = "attribute";
                        width = 180; 
                        height = 30;
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

                if(pkgColumns === 3) {
                    pkgColumns = 0;
                    pkgOffsetX = 0;
                    pkgOffsetY += 400;
                }
                //setting x and y coordinates relative to parent correctly - because hashmap is structured every time a new
                //type is encountered x and y must be set back to 0 because a new recursive layer is entered
                //this is not the case with the uppermost layer, these need to be structured seperately 
                if(!oldtype){
                    oldtype = newtype; 
                }else if(newtype !== oldtype){
                    //uppermost layer must be structured well too
                    if(parent == graph.getDefaultParent()){
                        x = xUpperLayer; 
                        y = yUpperLayer; 
                        xUpperLayer += pkgOffsetX; 
                        yUpperLayer += pkgOffsetY; 
                    }else{
                        x=0; 
                        y=0;  
                    }
                     
                    oldtype = newtype; 
                }else{
                    x+=20; 
                    y+=20; 
                }

                console.log(parent, entities[key].fUniqueName, entities[key].fUniqueName, x, y, width, height, style)
                //creating vertexes
                vertexes.push(graph.insertVertex(parent, entities[key].fUniqueName, entities[key].fUniqueName, x, y, width, height, style));
                     
            });
        } finally{
            graph.getModel().endUpdate();
        }
    }
};