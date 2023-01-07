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
        obj.nodes = Node.nodes// .map(n => n)
        obj.groups = Node.groups// .map(g => g)
        obj.links = Link.links// .map(l => l)
        return obj
    }


    static resetInternalNodes() {
        // normalize all internalNodes because D3 messes with the array
        const oldInternalNodes = Node.internalNodes.slice(0) // create new array
        Node.internalNodes = []
        function getPotentialObjId(numberOrObj) {
            if (typeof numberOrObj === 'number') return numberOrObj
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
    static resetInternalData() {
        Node.resetInternalNodes()
        Link.resetInternalLinks()
        // console.log('internalNodes', Node.internalNodes)
        // console.log('internalLinks', Link.internalLinks)
    }



    static toggleChildrenVisibility(nodeId) {
        // console.log(Node.internalNodes[nodeId].groups)
        Node.resetInternalData()
        const targetNode = Node.internalNodes[nodeId]
        const groupNodeIds = targetNode.groups
        console.log('target node', Node.internalNodes)

        if (groupNodeIds.length !== 0) {
            const visibility = !Node.internalNodes[groupNodeIds[0]].visibility // inverse of what the visibility of the firstGroupNodeIds visibility is for toggle

            // set internalNodes(children) visibility
            for (const groupNodeId of groupNodeIds) {
                Node.setInternalDataVisibilityRecursive(groupNodeId, visibility)
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
    }


    // Recursive function for hiding children of a group
    static setInternalDataVisibilityRecursive(nodeId, visibility) {
        // console.log('internalNodes', Node.internalNodes, nodeId)
        const node = Node.internalNodes[nodeId]

        Node.internalNodes[nodeId].visibility = false // hide internal node
        Link.setInternalLinksVisibility(nodeId, visibility)

        // Do the same for all the groups recursively
        const nodeGroups = node.groups
        if (nodeGroups.length !== 0) {
            for (const groupNode of nodeGroups) {
                Node.setInternalDataVisibilityRecursive(groupNode, visibility)
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


        // Link.repathInternalLinks(targetNode.id, invisibleInternalNodes)
        const internalRepathLinkObjs = Link.getInternalRepathLinks(invisibleInternalNodes)
        const internalRepathedLinks = []

        const newVisibleInternalNodes = visibleInternalNodes.slice(0) // creates new array

        // console.log('invisibleInternalNodes - getVisible()', invisibleInternalNodes, visibleInternalNodes)
        // Remove invisible group array nodes of visible nodes because they do not exist in the visible arrays --> D3 will say that some group is undefined
        for (const visibleInternalNode of newVisibleInternalNodes) {
            const visibleInternalNodeGroupIds = visibleInternalNode.groups
            // console.log('unfiltered groups of', visibleInternalNode.id, visibleInternalNode.groups)
            // remove groups that dont exist in the array
            const filteredInternalNodeGroupIds = []
            visibleInternalNode.groups = visibleInternalNodeGroupIds.filter(groupId => {
                const found = invisibleInternalNodes.find(internalNode => internalNode.id === groupId)
                // console.log('invisibleInternalNodes', invisibleInternalNodes, groupId, found)
                if(found ? false : true) return true // is visible groupId
                else filteredInternalNodeGroupIds.push(groupId) // is invisible groupId and has to be filtered
            })


            const visibleInternalNodeId = visibleInternalNode.id
            if(filteredInternalNodeGroupIds.length !== 0) {
                for(const nodeId of filteredInternalNodeGroupIds){
                    for(const repathLinkObj of internalRepathLinkObjs){
                        const {link, key} = repathLinkObj
                        if(link[key] === nodeId){
                            link[key] = visibleInternalNodeId
                            internalRepathedLinks.push(link)
                        }
                    }
                }
            }
            // console.log('filtered groups of', visibleInternalNode.id, newVisibleInternalNodes[i].groups)
        }

        // Parse repathed links to D3Links and add them to the visibleD3Links
        Link.links = Link.links.map(l => {
            const isRepathedLink = internalRepathedLinks.find(_l => _l.id === l.id)
            if(isRepathedLink) return isRepathedLink
            else return l
        })



        // console.log('visibleD3Nodes', visibleD3Nodes)
        // console.log('newVisibleInternalNodes', newVisibleInternalNodes)
        // console.log('visibleD3Groups', newVisibleInternalNodes.map(internalNode => internalNode.getD3Group(visibleD3Nodes)),)

        return {
            visibleD3Nodes,
            visibleD3Groups: newVisibleInternalNodes.map(internalNode => internalNode.getD3Group(visibleD3Nodes)),
            visibleD3Links: Link.getVisibleD3Links(visibleD3Nodes)
        }
    }
}