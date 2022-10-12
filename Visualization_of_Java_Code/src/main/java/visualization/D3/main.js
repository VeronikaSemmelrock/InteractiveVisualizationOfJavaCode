//calling of main function
const body = document.getElementById('root');
const graphContainer = document.getElementById('graphContainer');
body.onload = main(graphContainer); //calls main when body is finished loading

//because loadFiles() (async method) is called, main() must be async (to be able to call await)
async function main(container){ 
   

/*The following code chains a bunch of methods. Method chaining is what makes d3 very simple and concise.
d3.select("section").append("svg").selectAll().data(data) 
    .enter().append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return d.x; }) //coordinates "cx" (circles' x coordinates)
    .attr("cy", function(d) { return d.y; }) //coordinates "cy" (circles' y coordinates)
    .style("fill", "darkblue");
*/
    //creating network
    /*let firstNetwork = Network();
    //loading json
    let data = await (await fetch('/testfile.json')).json();
    firstNetwork("#graphContainer", assocs) //calling "constructor", passing where it will be displayed and what data to display
    */



    //second try
    /*var width = 640
        height = 480
    
    var links = [
        {source: "node1", target:"node2"},
        {source: "node1", target:"node3"},
        {source: "node3", target:"node2"}
    ]

    var nodes = [
        {"name": "node1"}, 
        {"name": "node2"}, 
        {"name": "node3"} 
    ]; 


    //add svg to body 
    var svg = d3.select('section').append("svg")
        .attr("width", width)
        .attr("height", height); 
    
    var force = d3.layout.force()
        .size([width. height])
        .nodes(nodes)
        .links(links)
        .on("tick", tick)
        .linkDistance(300)
        .start(); 

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        
    
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5); 

    function tick(e) {
        node.attr("cx", function(d) {return d.x; })
            .attr("cy", function(d) {return d.y; })
            .call(force.drag); 

        link.attr("x1", function(d){return d.source.x})
            .attr("y2", function(d){return d.source.y})
            .attr("x2", function(d){return d.target.x})
            .attr("x2", function(d){return d.target.y})
    }
    */

    //third try --- worked
/*
    let width = 1000
    let height = 1000
    var svg = d3.select("section")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    var exampleData = [{ "name": "A" }, { "name": "B" }, { "name": "C" }, { "name": "D" }];
    var node = svg.append("g")
    .selectAll("nodes")
    .data(exampleData)
    .enter();


    var circles = node.append("circle")
      .attr("cx", () => {return Math.random() * width})
      .attr("cy", () => {return Math.random() * height})
      .attr("r", 40)
      */


      //fourth try -- works!!
      var margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 1500 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select("section")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_network.json", function( data) {

        // Initialize the links
        var link = svg
          .selectAll("line")
          .data(data.links)
          .enter()
          .append("line")
          .style("stroke", "#aaa")

        // Initialize the nodes
        var node = svg
          .selectAll("circle")
          .data(data.nodes)
          .enter()
          .append("circle")
          .attr("r", 20)
          .style("fill", "#69b3a2")

        // Let's list the force we wanna apply on the network
        var simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink()                               // This force provides links between nodes
                  .id(function(d) { return d.id; })                     // This provide  the id of a node
                  .links(data.links)                                    // and this the list of links
            )
            .force("charge", d3.forceManyBody().strength(-500))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
            .on("end", ticked);

        // This function is run at each iteration of the force algorithm, updating the nodes position.
        function ticked() {
          link
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node
               .attr("cx", function (d) { return d.x+6; })
               .attr("cy", function(d) { return d.y-6; });
        }

      });


    //in links, elements must be called spurce and target -- will not recognise my data 




    
    //await loadFiles();
    //fitToView()
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




//Network as "class" -> remember Javascript functions are objects!!
function Network(){
    width = 900
    height = 900


    //will hold all 
    nodesG = null
    edgesG = null
    //to be able to select a single node/edge
    node = null
    edge = null

    //default
    layout="force"
    filter="all"
    console.log(d3)
    force = d3.layout.force() //returns force-Layout
    //nodeColours = d3.scale.category20()
    //tooltip = Tooltip("vis-tooltip", 230)

    
    this.network = function(selection, data){ //network is later returned as object
        //main implementation - creating network
        var vis;
        allData = setupData(data);
        vis = d3.select(selection).append("svg").attr("width", width).attr("height", height);
        linksG = vis.append("g").attr("id", "links");
        //Reihenfolge wichtig, sodass nodes on top of links liegen
        nodesG = vis.append("g").attr("id", "nodes");
        force.size([width, height]);
        setLayout("force");
        setFilter("all");
        return update();
    }


    setupData = function(data) {
        var circleRadius, countExtent, nodesMap;
        countExtent = d3.extent(data.nodes, function(d) {
          return 5;
        });
        circleRadius = d3.scale.sqrt().range([3, 12]).domain(countExtent);
        data.nodes.forEach(function(n) {
          var randomnumber;
          n.x = randomnumber = Math.floor(Math.random() * width);
          n.y = randomnumber = Math.floor(Math.random() * height);
          return n.radius = circleRadius(5);
        });
        nodesMap = mapNodes(data.nodes);
        data.links.forEach(function(l) {
          l.source = nodesMap.get(l.source);
          l.target = nodesMap.get(l.target);
          return linkedByIndex[l.source.id + "," + l.target.id] = 1;
        });
        return data;
    };
    

    update = function() {//private function, as it is not accessible via network - only inside Network when called by other funcions inside Network
        var artists;
        curNodesData = filterNodes(allData.nodes);
        curLinksData = filterLinks(allData.links, curNodesData);
        if (layout === "radial") {
          artists = sortedArtists(curNodesData, curLinksData);
          updateCenters(artists);
        }
        force.nodes(curNodesData);
        updateNodes();
        if (layout === "force") {
          force.links(curLinksData);
          updateLinks();
        } else {
          force.links([]);
          if (link) {
            link.data([]).exit().remove();
            link = null;
          }
        }
        return force.start();
      };


      updateNodes = function() {
        node = nodesG.selectAll("circle.node").data(curNodesData, function(d) {
          return d.id;
        });
        node.enter().append("circle").attr("class", "node").attr("cx", function(d) {
          return d.x;
        }).attr("cy", function(d) {
          return d.y;
        }).attr("r", function(d) {
          return d.radius;
        }).style("fill", function(d) {
          return nodeColors(d.artist);
        }).style("stroke", function(d) {
          return strokeFor(d);
        }).style("stroke-width", 1.0);
        node.on("mouseover", showDetails).on("mouseout", hideDetails);
        return node.exit().remove();
      };
      updateLinks = function() {
        link = linksG.selectAll("line.link").data(curLinksData, function(d) {
          return d.source.id + "_" + d.target.id;
        });
        link.enter().append("line").attr("class", "link").attr("stroke", "#ddd").attr("stroke-opacity", 0.8).attr("x1", function(d) {
          return d.source.x;
        }).attr("y1", function(d) {
          return d.source.y;
        }).attr("x2", function(d) {
          return d.target.x;
        }).attr("y2", function(d) {
          return d.target.y;
        });
        return link.exit().remove();
      };
    this.network.toggleLayout = function(newLayout){ //public function, as network is returned to outside Network-"class"

    }
    return this.network
}





















