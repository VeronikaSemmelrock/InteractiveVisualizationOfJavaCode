import Link from "./Link.js"



//variables for name parsing
const DELIMITER_PATH = '.';
const DELIMITER_LOCALVARIABLE = '^';
const DELIMITER_PARAMETER ='\'';
const DELIMITER_ATTRIBUTE = '#';
const DELIMITER_INNERCLASS = '$';

// This class represents a group and its node in the context of webcola
// webcola nodes can have links but only groups can group nodes or other groups, thus a group always only contains one node for the link
export default class Node {
    static internalNodes = [] // class-based node array for changing groups and nodes arrays with class methods
    static nodes = [] // D3cola nodes array
    static groups = [] // D3cola groups array

    constructor(id, name, type, leaves, groups, parentUniqueName, foreign) {
        this.id = id
        this.name = name
        this.leaves = leaves
        this.groups = groups
        this.type = type
        this.parentUniqueName = parentUniqueName
        this.visibility = true
        this.childrenVisibility = true
        this.style = Node.getStyle(type, foreign)//set style object
        this.shortName = Node.cropName(name, type, foreign)
        this.foreign = foreign
       

        Node.internalNodes.push(this) // data objs for instance methods
        Node.nodes.push(this.toD3Node()) // data objs for d3cola
        Node.groups.push(this.toD3Group()) // data objs for d3cola
    }


    toD3Node() {
        const node = {
            id: this.id,
            name: this.name,
            visibility: this.visibility,
            type: this.type,
            style: this.style, 
            shortName: this.shortName,
            foreign: this.foreign
        }

        // additional props
        node.width = 50 // set status width and height
        node.height = 25
        //node.fill = TODO - get from type
        //node.rx = TODO - get from type
        //node.ry = TODO - get from type

        return node
    }
    toD3Group(newVisibleD3Nodes) {
        const group = {
            id: this.id,
            name: this.name,
            type: this.type,
            style: this.style,
            shortName: this.shortName,
            foreign: this.foreign
        }
        if (newVisibleD3Nodes) {
            group.leaves = this.leaves.map(leave => Node.getVisibleIndexById(newVisibleD3Nodes, leave))
            group.groups = this.groups.map(group => Node.getVisibleIndexById(newVisibleD3Nodes, group))
        }
        else {
            group.leaves = this.leaves
            group.groups = this.groups
        }

        // Additional props
        group.padding = 5


        return group
    }
    toDebugNode() {
        const _debug = this.toD3Node()
        _debug.childrenVisibility = this.childrenVisibility
        delete _debug.width
        delete _debug.height
        if (_debug.groups && _debug.groups.length !== 0 && typeof _debug.groups[0] !== 'number') _debug.groups = _debug.groups.map(g => g.id)
        if (_debug.leaves && _debug.leaves.length !== 0 && typeof _debug.leaves[0] !== 'number') _debug.leaves = _debug.leaves.map(l => l.id)
        return _debug
    }
    getLowestVisibleParentRecusive() {
        if (this.visibility) return this
        else {
            const node = Node.internalNodes.find(n => n.name === this.parentUniqueName)
            if (node) return node.getLowestVisibleParentRecusive() // if we dont find the parent it doesnt have a parent
        }
    }

    

    // this function is necessary because D3Cola expects the indices in the link source and target to be the indices of the nodes instead of their ids
    static getVisibleIndexById(visibleD3Nodes, nodeId) {
        // console.log('gettingVisibleIndicesById', visibleD3Nodes, nodeId)
        return visibleD3Nodes.findIndex(n => n.id === nodeId)
    }
    static getD3Data() {
        const obj = Object.create(null)
        obj.nodes = Node.nodes// .map(n => n)
        obj.groups = Node.groups// .map(g => g)
        obj.links = Link.links// .map(l => l)
        return obj
    }


    static resetInternalNodes() {
        // normalize all internalNodes because D3 messes with the array
        function getPotentialObjId(numberOrObj) {
            if (typeof numberOrObj === 'number') return numberOrObj
            else return numberOrObj.id
        }

        for(const node of Node.internalNodes){
            node.leaves = node.leaves.map(getPotentialObjId)
            node.groups = node.groups.map(getPotentialObjId)
        }
    }
    static resetInternalData() {
        Node.resetInternalNodes()
        Link.resetInternalLinks()
        // console.log('internalNodes', Node.internalNodes)
        // console.log('internalLinks', Link.internalLinks)
    }

    /////// Public API methods - START
    static invisibleTypes = []
    static toggleTypeVisibility(type, visibility) {
        console.log("inside toggle ", type, visibility)
        Node.resetInternalData()

        //if visibility of foreign entities should be toggled 
        if(type === "foreign"){
            console.log('setting visibility of type', type, 'to', visibility)
            for (const node of Node.internalNodes) {
                if (node.foreign === true) Node.setInternalDataVisibilityRecursive(node.id, visibility)
            }
        }else{
            const existingIndex = Node.invisibleTypes.findIndex(_type => _type === type)
            if (visibility) Node.invisibleTypes.splice(existingIndex, 1)
            else Node.invisibleTypes.push(type)

            console.log('setting visibility of type', type, 'to', visibility)

            for (const node of Node.internalNodes) {
                if (node.type === type) Node.setInternalDataVisibilityRecursive(node.id, visibility)
            }
        }
        // Node.internalNodes.forEach(n => {
        //     if (n.type === type) console.log('toggling internalNode visibility', n.toDebugNode(), visibility)
        // })

        const D3Data = Node.populateVisibleD3Data()
        // console.log('after', D3Data.groups, D3Data.links)
        // console.log('after', Node.internalNodes)
        return D3Data
    }

    static toggleChildrenVisibility(nodeId) {
        // console.log(Node.internalNodes[nodeId].groups)
        Node.resetInternalData()
        const targetNode = Node.internalNodes[nodeId]
        const groupNodeIds = targetNode.groups

        if (groupNodeIds.length !== 0) {
            const visibility = !targetNode.childrenVisibility
            console.log('setting visibility of children', targetNode.toDebugNode(), 'to', visibility)
            // console.log('before', JSON.parse(JSON.stringify(Node.internalNodes)))
            targetNode.childrenVisibility = visibility

            // set internalNodes(children) visibility
            for (const groupNodeId of targetNode.groups) {
                Node.setInternalDataVisibilityRecursive(groupNodeId, visibility)
            }

            // console.log('after', JSON.parse(JSON.stringify(Node.internalNodes)))
            // console.log('internalNodes', Node.internalNodes)
            // console.log('internalLinks', Link.internalLinks)
            return Node.populateVisibleD3Data() // Parse new data into the D3 arrays
        }
    }
    /////// Public API methods - END



    /////// Set internal Children visibility recursive - START
    // Recursive function for hiding children of a group
    static setInternalDataVisibilityRecursive(nodeId, visibility, debug) { // with debug true this method can be executed on non-reset internal data
        const node = Node.internalNodes[nodeId]
        // console.log('setInternalDataVisibilityRecursive', node)

        node.visibility = visibility // hide internal node
        node.childrenVisibility = visibility // set children visibility to visibility as well because this is a recursive function

        // Do the same for all the groups recursively
        const nodeGroups = node.groups
        if (nodeGroups.length !== 0) {
            for (const groupNodeId of nodeGroups) {
                Node.setInternalDataVisibilityRecursive(debug ? groupNodeId.id : groupNodeId, visibility, debug)
            }
        }
    }
    /////// Set internal Children visibility - END


    // Remove invisible group array nodes of visible nodes because they do not exist in the visible arrays --> D3 will say that some group is undefined
    static getVisibleD3Groups(visibleD3Nodes, visibleInternalNodes, invisibleInternalNodes){
        const visibleD3Groups = visibleInternalNodes.map(n => n.toD3Group(visibleD3Nodes))
        for (let i = 0; i < visibleInternalNodes.length; i++) {
            const visibleInternalNode = visibleInternalNodes[i]
            const visibleInternalNodeGroupIds = visibleInternalNode.groups
            // console.log('unfiltered groups of', visibleInternalNode.id, visibleInternalNode.groups)
            // remove groups that dont exist in the array
            const filteredInternalNodeGroupIds = []
            const newVisibleInternalNodeGroupIds = []
            for (const groupId of visibleInternalNodeGroupIds) {
                const found = invisibleInternalNodes.find(internalNode => internalNode.id === groupId)
                // console.log('invisibleInternalNodes', invisibleInternalNodes, groupId, found)
                if (found ? false : true) newVisibleInternalNodeGroupIds.push(Node.getVisibleIndexById(visibleD3Nodes, groupId)) // is visible groupId but this is relative to the new visibleD3Nodes
                else filteredInternalNodeGroupIds.push(groupId) // is invisible groupId and has to be filtered
            }
            visibleD3Groups[i].groups = newVisibleInternalNodeGroupIds
            // console.log('filtered groups of', visibleInternalNode.id, newVisibleInternalNodes[i].groups)
        }

        return visibleD3Groups
    }


    // Repopulates all data that should be drawn (nodes or links that have visibility set to true)
    static populateVisibleD3Data() {
        const visibleD3Nodes = []
        const visibleInternalNodes = []
        const invisibleInternalNodes = []

        for (const node of Node.internalNodes) {
            if (node.visibility) {
                visibleD3Nodes.push(node.toD3Node())
                visibleInternalNodes.push(node) // save as internalNode because we need the toD3Group after we filtered the invisible groups from it
            }
            else invisibleInternalNodes.push(node)
        }

        const visibleD3Links = Link.repathLinksAndGetVisibleD3Links(visibleD3Nodes, invisibleInternalNodes) // visible D3 links without repathed links
        const visibleD3Groups = Node.getVisibleD3Groups(visibleD3Nodes, visibleInternalNodes, invisibleInternalNodes)

        // Set new D3Data
        Node.nodes = visibleD3Nodes
        Node.groups = visibleD3Groups
        Link.links = visibleD3Links

        return Node.getD3Data()
    }


    // Node Styling
    static getStyle(nodeType, foreign) {

        var color = d3.schemeSet3;//other options schemeSet1-3
        //console.log(color(4))
        if(foreign){
            return {
                color: color[8],
                rx: 6,
                ry: 6
            }
        }
        switch (nodeType) {
            case 'package':
                return {
                    color: color[0],
                    rx: 8,
                    ry: 8
                }
            case 'class':
                return {
                    color: color[1],
                    rx: 10,
                    ry: 10
                };
            case 'method':
                return {
                    color: color[2],
                    rx: 15,
                    ry: 15
                };
            case 'constructor':
                return {
                    color: color[3],
                    rx: 20,
                    ry: 20
                };
            case 'attribute':
                return {
                    color: color[4],
                    rx: 30,
                    ry: 8
                };
            case 'parameter':
                return {
                    color: color[5],
                    rx: 8,
                    ry: 30
                };
            case 'localVariable':
                return {
                    color: color[6],
                    rx: 2,
                    ry: 2
                };
        }
    }

    //returns short name - not unique
    static cropName(name, type, foreign){
        if(foreign){
            return name; 
        }
        switch(type){
            case "method": //fall through in switch-case code of constructor is executed for method (no break statement)
            case "constructor": 
                const maxIndex = name.lastIndexOf("("); 
                for (let i = maxIndex; i >= 0; i--) {
                    if (name.charAt(i) === "." || name.charAt(i) === DELIMITER_INNERCLASS) {
                        return name.substring(i+1)
                    }  
                } 
                break; 
            case "package": 
            case "class":
                if(name.lastIndexOf(DELIMITER_INNERCLASS) > -1){//nested classes
                    return name.substring(name.lastIndexOf(DELIMITER_INNERCLASS)+1)
                } else if(name.lastIndexOf(DELIMITER_PATH) > -1) {
                    return name.substring(name.lastIndexOf(DELIMITER_PATH)+1); 
                }
                break; 
            default:
                let highestIndex = 0; 
                //find possible delimiter
                if(type == "attribute"){
                    highestIndex = name.lastIndexOf(DELIMITER_ATTRIBUTE); 
                }else if(type == "parameter"){
                    highestIndex = name.lastIndexOf(DELIMITER_PARAMETER);
                }else if(type == "localVariable"){
                    highestIndex = name.lastIndexOf(DELIMITER_LOCALVARIABLE); 
                }
                if(highestIndex > 0){
                    return name.substring(highestIndex+1)
                }
        }
        return name; //no delimiters were found -> return full name 
    }
}