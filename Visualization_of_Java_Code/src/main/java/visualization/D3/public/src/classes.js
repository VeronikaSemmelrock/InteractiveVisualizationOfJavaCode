class Base {
    constructor(id, name, visibility) {
        this.id = id
        this.name = name
        this.visibility = visibility
    }
}
export class Link extends Base {
    static internalLinks = [] // class-based link array for changing links array with class methods
    static links = [] // D3cola link array

    constructor(id, name, visibility, source, target) {
        super(id, name, visibility)
        this.source = source
        this.target = target

        Link.internalLinks.push(this)
        Link.links.push(this.getD3Link())
    }

    getD3Link() {
        const visibleD3Nodes = Node.getVisible().visibleNodes
        const linkObj = {
            id: this.id,
            name: this.name,
            source: Node.getVisibleIndexById(visibleD3Nodes, this.source),
            target: Node.getVisibleIndexById(visibleD3Nodes, this.target)
        }

        return linkObj
    }

    static getVisible() {
        const d3links = []
        for (const link of Link.internalLinks) {
            if (link.visibility) {
                d3links.push(link.getD3Link())
            }
        }

        return d3links
    }

    static hideInternalLinks(associatedNodeId) {
        const internalLinks = Link.internalLinks
        // console.log('removing links associated with', associatedNodeId)

        for (let i = 0; i < internalLinks.length; i++) {
            const link = internalLinks[i]
            // console.log(link, link.source, link.target, associatedNodeId)

            if (link.source === associatedNodeId || link.target === associatedNodeId) {
                // console.log('associated link', link)
                Link.internalLinks[i].visibility = false // set invisible in link array
            }
        }
    }
}

// This class represents a group and its node in the context of webcola
// webcola nodes can have links but only groups can group nodes or other groups, thus a group always only contains one node for the link
export class Node extends Base {
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
    getD3Group() {
        const visibleD3Nodes = Node.getVisible().visibleNodes
        const group = {
            id: this.id,
            name: this.name,
            visibility: this.visibility,
            leaves: this.leaves.map(leave => Node.getVisibleIndexById(visibleD3Nodes, leave)),
            groups: this.groups.map(group => Node.getVisibleIndexById(visibleD3Nodes, group))
        }
        // Additional props
        group.padding = 5

        return group
    }

    // this function is necessary because D3Cola expects the indices in the link source and target to be the indices of the nodes instead of their ids
    static getVisibleIndexById(visibleD3Nodes, nodeId){
        return visibleD3Nodes.findIndex(n => n.id === nodeId)
    }
    static getD3Data() {
        const obj = Object.create(null)
        const { visibleNodes, visibleGroups } = Node.getVisible()
        obj.nodes = visibleNodes.map(n => n.getD3Node())
        obj.groups = visibleGroups.map(g => g.getD3Group())
        obj.links = Link.getVisible()
        return obj
    }

    showChildren(nodeId) {

    }
    static hideChildren(nodeId) {
        // console.log(Node.internalNodes[nodeId].groups)
        // hide internNodes(children)
        for (const groupNode of Node.internalNodes[nodeId].groups) {
            Node.hideInternalNodesRecursive(groupNode)
        }

        return Node.getD3Data()
    }
    // Recursive function for hiding children of a group
    static hideInternalNodesRecursive(nodeId) {
        // console.log('internalNodes', Node.internalNodes, nodeId)
        const node = Node.internalNodes[nodeId]

        Node.internalNodes[nodeId].visibility = false // hide internal node
        Link.hideInternalLinks(nodeId)

        // Do the same for all the groups recursively
        const nodeGroups = node.groups
        if (nodeGroups.length !== 0) {
            for (const groupNode of nodeGroups) {
                Node.hideInternalNodesRecursive(groupNode)
            }
        }
    }

    //returns a list of all data that should be drawn (nodes or links that have visibility set to true)
    static getVisible() {
        const visibleNodes = []
        const visibleGroups = []
        const invisibleInternalNodes = []
        const internalNodes = Node.internalNodes 

        for (const node of internalNodes) {
            if (node.visibility) {
                visibleNodes.push(node)
                visibleGroups.push(node)
            }
            else invisibleInternalNodes.push(node)
        }

        // console.log('invisibleInternalNodes', invisibleInternalNodes, visibleGroups)
        // remove group array content because otherwise we will get a index undefined error after removing the node
        for(let i = 0; i < visibleGroups.length; i++){
            const group = visibleGroups[i]
            // console.log('unfiltered groups of', group.id, group.groups)
            // remove groups that dont exist in the array
            visibleGroups[i].groups = group.groups.filter(group => {
                const found = invisibleInternalNodes.find(internalNode => group.id === internalNode.id) ? false : true
                // console.log(group, found)
                return found
            })
            // console.log('filtered groups of', group.id, visibleGroups[i].groups)
        }

        return { visibleNodes, visibleGroups }
    }
}