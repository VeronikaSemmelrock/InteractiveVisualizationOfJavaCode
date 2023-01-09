import Base from "./Base.js"
import Link from "./Link.js"

// This class represents a group and its node in the context of webcola
// webcola nodes can have links but only groups can group nodes or other groups, thus a group always only contains one node for the link
export default class Node extends Base {
    static internalNodes = [] // class-based node array for changing groups and nodes arrays with class methods
    static nodes = [] // D3cola nodes array
    static groups = [] // D3cola groups array

    constructor(id, name, type, leaves, groups, parentUniqueName) {
        super(id, name)
        this.leaves = leaves
        this.groups = groups
        this.type = type
        this.parentUniqueName = parentUniqueName
        this.visibility = true
        this.childrenVisibility = true

        Node.internalNodes.push(this) // data objs for instance methods
        Node.nodes.push(this.toD3Node()) // data objs for d3cola
        Node.groups.push(this.toD3Group()) // data objs for d3cola
    }


    toD3Node() {
        const node = {
            id: this.id,
            name: this.name,
            visibility: this.visibility,
            type: this.type
        }

        // additional props
        node.width = 200 // set status width and height
        node.height = 100
        //node.fill = TODO - get from type
        //node.rx = TODO - get from type
        //node.ry = TODO - get from type

        return node
    }
    toD3Group(newVisibleD3Nodes) {
        const group = {
            id: this.id,
            name: this.name,
            type: this.type
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
    static toggleTypeVisibility(type) {
        Node.resetInternalData()

        const existingIndex = Node.invisibleTypes.findIndex(_type => _type === type)
        const visibility = existingIndex !== -1
        if (visibility) Node.invisibleTypes.splice(existingIndex, 1)
        else Node.invisibleTypes.push(type)

        console.log('setting visibility of type', type, 'to', visibility)

        for (const node of Node.internalNodes) {
            if (node.type === type) Node.setInternalDataVisibilityRecursive(node.id, visibility)
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
    static getStyle(nodeType) {
        switch (nodeType) {
            case 'package':
                return {
                    color: 'green',
                    rx: 8,
                    ry: 8,
                    width: 100,
                    height: 50
                }
            case 'class':
                return {
                    color: 'blue',
                    rx: 10,
                    ry: 10,
                    width: 100,
                    height: 50
                };
            case 'method':
                return {
                    color: 'red',
                    rx: 15,
                    ry: 15,
                    width: 100,
                    height: 50
                };
            case 'constructor':
                return {
                    color: 'yellow',
                    rx: 20,
                    ry: 20,
                    width: 100,
                    height: 50
                };
            case 'attribute':
                return {
                    color: 'violet',
                    rx: 30,
                    ry: 8,
                    width: 100,
                    height: 50
                };
            case 'parameter':
                return {
                    color: 'orange',
                    rx: 8,
                    ry: 30,
                    width: 100,
                    height: 50
                };
            case 'localVar':
                return {
                    color: 'turquoise',
                    rx: 0,
                    ry: 0,
                    width: 100,
                    height: 50
                };
        }
    }
}