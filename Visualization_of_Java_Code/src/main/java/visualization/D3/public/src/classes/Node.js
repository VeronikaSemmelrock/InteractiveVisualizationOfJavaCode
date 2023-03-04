import Link from "./Link.js"



//variables for name parsing
const DELIMITER_PATH = '.';
const DELIMITER_LOCALVARIABLE = '^';
const DELIMITER_PARAMETER = '\'';
const DELIMITER_ATTRIBUTE = '#';
const DELIMITER_INNERCLASS = '$';


// styling
export const nodeWidth = 200
export const nodeHeight = 35
export const nodePadding = 10

// This class represents a group and its node in the context of webcola
// webcola nodes can have links but only groups can group other nodes or other groups, thus the group representation of the node always only contains one node for the link (itself as a node)
export default class Node {
    static internalNodes = [] // class-based node array for changing groups and nodes arrays with class methods
    static nodes = [] // D3cola nodes array
    static groups = [] // D3cola groups array


    // Weight config
    static weight = 1000
    static fixed = true

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

    //creates a D3Node out of a Node (this)
    toD3Node() {
        const node = {
            id: this.id,
            name: this.name,
            visibility: this.visibility,
            childrenVisibility: this.childrenVisibility,
            _groups: this.groups,
            type: this.type,
            style: this.style,
            shortName: this.shortName,
            foreign: this.foreign,

        }

        return node
    }

    //creates a D3Group out of a node (with proper indexes reset if visibility of a node is altered) 
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
    //gets the lowest visible Parent of this
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


    //returns all D3Data set in Node 
    static getD3Data() {
        // // Calculate group layers
        // const toParse = []
        // const newGroups = []
        // Node.groups.forEach((g, i) => {
        //     // console.log('toParse', toParse.length)
        //     if (g.groups.length === 0) {
        //         g.layers = 1
        //         newGroups.push(g)
        //     }
        //     else {
        //         toParse.push(g)
        //     }
        //     // console.log('toParse', toParse.length)
        // })

        // // console.log('last toParse', toParse, toParse.find(g => g.groups.length === 0))
        // while (toParse.length !== 0) {
        //     toParse.forEach((g, i) => {
        //         // console.log('g', g, g.groups.every(_g => newGroups.find(__g => this.getPotentialObjId(__g) === this.getPotentialObjId(_g))))
        //         const foundGroups = []
        //         const condition = g.groups.every(_g => {
        //             const found = newGroups.find(__g => this.getPotentialObjId(__g) === this.getPotentialObjId(_g))
        //             if (found) {
        //                 foundGroups.push(found)
        //                 return true
        //             }
        //         })
        //         if (condition) {
        //             // console.log('g groups', foundGroups)
        //             g.layers = g.groups.length * foundGroups[0].layers// + 25
        //             newGroups.push(g)
        //             toParse.splice(i, 1)
        //         }
        //     })
        // }

        // console.log('newGroups with layers', newGroups, newGroups.map(g => g.layers))
        // obj.groups = newGroups.sort((a, b) => a.id - b.id)// .map(g => g)

        // Add parent to groups and nodes
        const nodes = Node.nodes.map((g, i) => {
            const parent = Node.groups.find(_g => {
                // console.log('find group', i, _g.groups, _g.groups)// _g.groups.find(__g => __g === g.id))
                return _g.groups.find(__g => __g === g.id)
            })
            // console.log('parents', parent)


            // Update volatile D3 UI data
            g.width = Node.groups[i].width = nodeWidth // set status width and height
            g.height = Node.groups[i].height = nodeHeight
            g.fixed = Node.groups[i].fixed = Node.fixed
            g.weight = Node.groups[i].weight = Node.weight
            g.fixedWeight = Node.groups[i].fixedWeight = Node.weight


            if (parent) {
                g._parent = parent.id
                Node.groups[i]._parent = parent.id
                return g
            }
            else return g
        })



        const obj = Object.create(null)
        obj.nodes = nodes
        obj.groups = Node.groups
        obj.links = Link.links// .map(l => l)
        return obj
    }

    // normalize all internalNodes because D3 messes with the array
    static getPotentialObjId(numberOrObj) {
        if (typeof numberOrObj === 'number') return numberOrObj
        else return numberOrObj.id
    }
    //resets internal node data 
    static resetInternalNodes() {


        for (const node of Node.internalNodes) {
            node.leaves = node.leaves.map(this.getPotentialObjId)
            node.groups = node.groups.map(this.getPotentialObjId)
        }
    }

    //resets internal data 
    static resetInternalData() {
        Node.resetInternalNodes()
        Link.resetInternalLinks()
        // console.log('internalNodes', Node.internalNodes)
        // console.log('internalLinks', Link.internalLinks)
    }

    /////// Public API methods - START
    static invisibleTypes = []
    //sets visibility of given type in internal and D3Data
    static setTypeVisibility(type, visibility) {
        console.log("inside toggle ", type, visibility)
        Node.resetInternalData()

        //if visibility of foreign entities should be set 
        if (type === "foreign") {
            console.log('setting visibility of type', type, 'to', visibility)
            for (const node of Node.internalNodes) {
                if (node.foreign === true) Node.setInternalDataVisibilityRecursive(node.id, visibility)
            }
        } else {
            // Update internal list
            const existingIndex = Node.invisibleTypes.findIndex(_type => _type === type)
            if (visibility) Node.invisibleTypes.splice(existingIndex, 1)
            else if (existingIndex === -1) Node.invisibleTypes.push(type)

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
    static isInvisibleType(type) {
        return Node.invisibleTypes.find(t => t === type) ? true : false
    }

    //toggles Visibility of children of a nodeId
    static nodesWithInvisibleChildren = []
    static setChildrenVisibility(nodeId, visibility) {
        // console.log(Node.internalNodes[nodeId].groups)
        Node.resetInternalData()
        const targetNode = Node.internalNodes[nodeId]
        const _visibility = visibility === undefined ? !targetNode.childrenVisibility : visibility
        const groupNodeIds = targetNode.groups

        // Update internal list
        const existingIndex = Node.nodesWithInvisibleChildren.findIndex(_nodeId => _nodeId === nodeId)
        if (_visibility) Node.nodesWithInvisibleChildren.splice(existingIndex, 1)
        else if (existingIndex === -1) Node.nodesWithInvisibleChildren.push(nodeId)

        // Set childrenVisibility
        targetNode.childrenVisibility = _visibility

        if (groupNodeIds.length !== 0) {
            console.log('setting visibility of children', targetNode.toDebugNode(), 'to', _visibility)
            // console.log('before', JSON.parse(JSON.stringify(Node.internalNodes)))

            // set internalNodes(children) visibility
            for (const groupNodeId of targetNode.groups) {
                Node.setInternalDataVisibilityRecursive(groupNodeId, _visibility)
            }

            // console.log('after', JSON.parse(JSON.stringify(Node.internalNodes)))
            console.log('internalNodes', Node.internalNodes)
            // console.log('internalLinks', Link.internalLinks)
            return Node.populateVisibleD3Data() // Parse new data into the D3 arrays
        }
    }
    static isNodeWithInvisibleChildren(nodeId) {
        return Node.nodesWithInvisibleChildren.find(id => id === nodeId) ? true : false
    }
    /////// Public API methods - END



    /////// Set internal Children visibility recursive - START
    // Recursive function for hiding children of a group
    static setInternalDataVisibilityRecursive(nodeId, visibility, debug) { // with debug true this method can be executed on non-reset internal data
        const node = Node.internalNodes[nodeId]
        const parent = node.getLowestVisibleParentRecusive()
        const parentChildrenAreVisible = parent ? parent.childrenVisibility : true

        // console.log('node with invisible children', Node.nodesWithInvisibleChildren, node, parent, parentChildrenAreVisible, parent ? Node.isNodeWithInvisibleChildren(parent.id) : undefined)



        if (visibility ? !Node.isInvisibleType(node.type) && parentChildrenAreVisible : true) { // if type is filtered or node has been manually filtered, ignore node
            // console.log('setInternalDataVisibilityRecursive', node)
            node.visibility = visibility // hide internal node

            // Only set children to visible if the node is not a node with invisible children
            if (visibility ? !Node.isNodeWithInvisibleChildren(nodeId) : true) {
                node.childrenVisibility = visibility // set children visibility to visibility as well because this is a recursive function

                // Do the same for all the groups recursively
                const nodeGroups = node.groups
                if (nodeGroups.length !== 0) {
                    for (const groupNodeId of nodeGroups) {
                        Node.setInternalDataVisibilityRecursive(debug ? groupNodeId.id : groupNodeId, visibility, debug)
                    }
                }
            }
        }
    }
    /////// Set internal Children visibility - END


    // Remove invisible group array nodes of visible nodes because they do not exist in the visible arrays --> D3 will say that some group is undefined
    static getVisibleD3Groups(visibleD3Nodes, visibleInternalNodes, invisibleInternalNodes) {
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


    //returns styling of a node
    static getStyle(nodeType, foreign) {

        var color = d3.schemeSet3;//other options schemeSet1-3
        //console.log(color(4))
        if (foreign) {
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

    //returns short name of node (removing path)
    static cropName(name, type, foreign) {
        if (foreign) {
            return name;
        }
        switch (type) {
            case "method": //fall through in switch-case code of constructor is executed for method (no break statement)
            case "constructor":
                const maxIndex = name.lastIndexOf("(");
                for (let i = maxIndex; i >= 0; i--) {
                    if (name.charAt(i) === "." || name.charAt(i) === DELIMITER_INNERCLASS) {
                        return name.substring(i + 1)
                    }
                }
                break;
            case "package":
            case "class":
                if (name.lastIndexOf(DELIMITER_INNERCLASS) > -1) {//nested classes
                    return name.substring(name.lastIndexOf(DELIMITER_INNERCLASS) + 1)
                } else if (name.lastIndexOf(DELIMITER_PATH) > -1) {
                    return name.substring(name.lastIndexOf(DELIMITER_PATH) + 1);
                }
                break;
            default:
                let highestIndex = 0;
                //find possible delimiter
                if (type == "attribute") {
                    highestIndex = name.lastIndexOf(DELIMITER_ATTRIBUTE);
                } else if (type == "parameter") {
                    highestIndex = name.lastIndexOf(DELIMITER_PARAMETER);
                } else if (type == "localVariable") {
                    highestIndex = name.lastIndexOf(DELIMITER_LOCALVARIABLE);
                }
                if (highestIndex > 0) {
                    return name.substring(highestIndex + 1)
                }
        }
        return name; //no delimiters were found -> return full name 
    }
}