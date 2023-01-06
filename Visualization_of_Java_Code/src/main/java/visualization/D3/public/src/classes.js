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


        const linkObj = {
            id,
            name,
            source,
            target
        }
        Link.links.push(linkObj)
    }

    static hideLinks(associatedNodeId){
        const internalLinks = Link.internalLinks

        for(let i = 0; i < internalLinks; i++){
            const link = internalLinks[i]
            if(link.source === associatedNodeId || link.target === associatedNodeId){
                Link.internalLinks[i].visibility = false // set invisible in link array
                Link.links.splice(i, 1) // remove link from D3 links
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
        Node.nodes.push(this.getNodeObj()) // data objs for d3cola
        Node.groups.push(this.getGroupObj()) // data objs for d3cola
    }
    getNodeObj() {
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
    getGroupObj() {
        const group = {
            id: this.id,
            name: this.name,
            visibility: this.visibility,
            leaves: this.leaves,
            groups: this.groups
        }
        // Additional props
        group.padding = 5

        return group
    }


    showChildren(nodeId){

    }
    hideChildren(nodeId){
        // Node.nodes[nodeId].groups = [] // hide all children
        

    }
    hideChildrenRecursive(nodeId){
        const node = Node.internalNodes[internalNodeId]

        Node.internalNodes[nodeId].visibility = false // hide internal node
        Node.nodes.splice(nodeId, 1) // remove node from D3 nodes
        Node.groups.splice(nodeId, 1) // remove group from D3 groups
        Link.internalLinks = Link.internalLinks.filter(link => link.source)

        const nodeGroups = node.groups
        if(nodeGroups.length !== 0 ){
            for(const groupNode of nodeGroups){
                this.hideChildrenRecursive(groupNode)
            }
        }
    }
    // sets node visibility of node in d3 to false 
    setVisible(nodeId) {
        const i = this.getIndexById(nodeId)
        if (i !== -1) {
            this.nodes[i].visibility = false
            this.groups[i].visibility = false
        }
        return this
    }
    // sets node visibility of node in d3 to true
    setInvisible(nodeId) {
        const i = this.getIndexById(nodeId)
        if (i !== -1) {
            this.nodes[i].visibility = true
            this.groups[i].visibility = true
        }
        return this
    }

    //returns a list of all data that should be drawn (nodes or links that have visibility set to true)
    static getVisible() {
        const nodes = this.nodes.filter(node => node.visibility)
        const groups = this.groups.filter(group => group.visibility)
        return { nodes, groups }
    }
}