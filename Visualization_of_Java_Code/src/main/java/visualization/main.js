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
    console.log(assocs["1"]);
    //first idea for going through hashmap
    Object.keys(assocs).forEach(function(key){
        console.log(assocs[key].fFromEntity.type);
    })

    if(!mxClient.isBrowserSupported()){
        alert("Browser not supported!");
    }else{
        let graph = new mxGraph(container);//create variable holding mxGraph and add to container
        new mxRubberband(graph); //put rubberband around graph so graph can be moved around
        let parent = graph.getDefaultParent();
        graph.getModel().beginUpdate();
        try{
            let v1 = graph.insertVertex(parent, null, "Hello", 20, 20, 80, 30);
            //create first Node, parent, id (null -> ids managed by mxgraph, tag, x-coordinates, y-coordinates, width, height, default style
            let v2 = graph.insertVertex(parent, null, "World!", 200, 150, 80,30);
            let e1 = graph.insertEdge(parent, null, "first Edge", v1,v2);
        }
        finally{
        graph.getModel().endUpdate();
        }
    }
};