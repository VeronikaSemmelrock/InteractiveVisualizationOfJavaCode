import Base from "./Base.js"
import Link from "./Link.js"

// This class represents a group and its node in the context of webcola
// webcola nodes can have links but only groups can group nodes or other groups, thus a group always only contains one node for the link
export default class Node extends Base {
    static internalNodes = [] // class-based node array for changing groups and nodes arrays with class methods
    static nodes = [] // D3cola nodes array
    static groups = [] // D3cola groups array


    constructor(id, name, visibility, type, leaves, groups) {
        super(id, name, visibility)
        this.leaves = leaves
        this.groups = groups
        this.type = type

        Node.internalNodes.push(this) // data objs for instance methods
        Node.nodes.push(this.getD3Node()) // data objs for d3cola
        Node.groups.push(this.getD3Group()) // data objs for d3cola
    }
    getD3Node() {
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
    getD3Group(newVisibleD3Nodes) {
        const group = {
            id: this.id,
            name: this.name,
            visibility: this.visibility,
        }
        if (newVisibleD3Nodes) {
            group.leaves = this.leaves.map(leave => Node.getVisibleIndexById(newVisibleD3Nodes, leave)),
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

    // this function is necessary because D3Cola expects the indices in the link source and target to be the indices of the nodes instead of their ids
    static getVisibleIndexById(visibleD3Nodes, nodeId) {
        // console.log('gettingVisibleIndicesById', visibleD3Nodes, nodeId)
        return visibleD3Nodes.findIndex(n => n.id === nodeId)
    }
    static getD3Data() {
        const obj = Object.create(null)
        obj.nodes = Node.nodes.map(n => n)
        obj.groups = Node.groups.map(g => g)
        obj.links = Link.links.map(l => l)
        return obj
    }


    static resetInternalNodes() {
        // normalize all internalNodes because D3 fucks with the array
        const oldInternalNodes = Node.internalNodes.slice(0) // create new array
        Node.internalNodes = []
        function getPotentialObjId(numberOrObj){
            if(typeof numberOrObj === 'number') return numberOrObj
            else return numberOrObj.id
        }

        oldInternalNodes.forEach(n => new Node(
            n.id,
            n.name,
            n.visibility,
            n.type,
            n.leaves.map(getPotentialObjId),
            n.groups.map(getPotentialObjId)
        ))
    }
    static resetInternalData(){
        Node.resetInternalNodes()
        Link.resetInternalLinks()
        // console.log('internalNodes', Node.internalNodes)
        // console.log('internalLinks', Link.internalLinks)
    }


    showChildren(nodeId) {
        Node.resetInternalData()
    }




    static hideChildren(nodeId) {
        // console.log(Node.internalNodes[nodeId].groups)
        Node.resetInternalData()

        // hide internNodes(children)
        for (const groupNode of Node.internalNodes[nodeId].groups) {
            Node.hideInternalDataRecursive(groupNode)
        }
        // console.log('internalNodes', Node.internalNodes)
        // console.log('internalLinks', Link.internalLinks)

        // Parse new data into the D3 arrays
        const { visibleD3Nodes, visibleD3Groups, visibleD3Links } = Node.getVisibleD3Data()
        Node.nodes = visibleD3Nodes
        Node.groups = visibleD3Groups
        Link.links = visibleD3Links

        return Node.getD3Data()
    }
    // Recursive function for hiding children of a group
    static hideInternalDataRecursive(nodeId) {
        // console.log('internalNodes', Node.internalNodes, nodeId)
        const node = Node.internalNodes[nodeId]

        Node.internalNodes[nodeId].visibility = false // hide internal node
        Link.hideInternalLinks(nodeId)

        // Do the same for all the groups recursively
        const nodeGroups = node.groups
        if (nodeGroups.length !== 0) {
            for (const groupNode of nodeGroups) {
                Node.hideInternalDataRecursive(groupNode)
            }
        }
    }

    //returns a list of all data that should be drawn (nodes or links that have visibility set to true)
    static getVisibleD3Data() {
        const visibleD3Nodes = []
        const visibleInternalNodes = []
        const invisibleInternalNodes = []

        for (const node of Node.internalNodes) {
            if (node.visibility) {
                visibleD3Nodes.push(node.getD3Node())
                visibleInternalNodes.push(node) // save as internalNode because we need the getD3Group after we filtered the invisible groups from it
            }
            else invisibleInternalNodes.push(node)
        }

        // console.log('invisibleInternalNodes - getVisible()', invisibleInternalNodes, visibleInternalNodes)
        // remove group array content because otherwise we will get a index undefined error after removing the node
        for (let i = 0; i < visibleInternalNodes.length; i++) {
            const group = visibleInternalNodes[i]
            // console.log('unfiltered groups of', group.id, group.groups)
            // remove groups that dont exist in the array
            visibleInternalNodes[i].groups = group.groups.filter(groupId => {
                const found = invisibleInternalNodes.find(internalNode => internalNode.id === groupId)
                // console.log('invisibleInternalNodes', invisibleInternalNodes, groupId, found)
                return found ? false : true
            })
            // console.log('filtered groups of', group.id, visibleInternalNodes[i].groups)
        }

        // console.log('visibleD3Nodes', visibleD3Nodes)
        // console.log('visibleInternalNodes', visibleInternalNodes)
        // console.log('visibleD3Groups', visibleInternalNodes.map(internalNode => internalNode.getD3Group(visibleD3Nodes)),)

        return {
            visibleD3Nodes,
            visibleD3Groups: visibleInternalNodes.map(internalNode => internalNode.getD3Group(visibleD3Nodes)),
            visibleD3Links: Link.getVisibleD3Links(visibleD3Nodes)
        }
    }
}