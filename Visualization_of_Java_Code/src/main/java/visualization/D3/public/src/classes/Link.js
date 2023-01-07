import Base from "./Base.js"
import Node from "./Node.js"

export default class Link extends Base {
    static internalLinks = [] // class-based link array for changing links array with class methods
    static links = [] // D3cola link array

    constructor(id, name, visibility, source, target) {
        super(id, name, visibility)
        this.source = source
        this.target = target

        Link.internalLinks.push(this)
        Link.links.push(this.getD3Link())
    }

    getD3Link(newVisibleD3Nodes) {
        const linkObj = {
            id: this.id,
            name: this.name,
        }
        if (newVisibleD3Nodes) {
            linkObj.source = Node.getVisibleIndexById(newVisibleD3Nodes, this.source)
            linkObj.target = Node.getVisibleIndexById(newVisibleD3Nodes, this.target)
        }
        else {
            linkObj.source = this.source
            linkObj.target = this.target
        }

        return linkObj
    }

    static resetInternalLinks() {
        return // links do not have to be reset because they dont get reset by D3 for some reason
        const oldInternalLinks = Link.internalLinks.slice(0) // create new array
        Link.internalLinks = []
        oldInternalLinks.forEach(l => new Link(
            l.id,
            l.name,
            l.visibility,
            l.source.id,
            l.target.id
        ))
    }
    static getVisibleD3Links(visibleD3Nodes) {
        const d3links = []
        for (const link of Link.internalLinks) {
            if (link.visibility) {
                // console.log('link is visible', link)
                d3links.push(link.getD3Link(visibleD3Nodes))
            }
        }
        return d3links
    }

    // When setting visiblity to hidden this function filters all links
    // Not taking into account links that have connections to outside --> they have to be repathed with the below functions
    static setInternalLinksVisibility(associatedNodeId, visibility) {
        const internalLinks = Link.internalLinks
        // console.log('removing links associated with', associatedNodeId)

        for (let i = 0; i < internalLinks.length; i++) {
            const link = internalLinks[i]
            // console.log(link, link.source, link.target, associatedNodeId)

            if (link.source === associatedNodeId || link.target === associatedNodeId) {
                // console.log('associated link', link)
                Link.internalLinks[i].visibility = visibility // set invisible in link array
            }
        }
    }

    // This functions gets all links that need to be repathed alongside the key that needs to be repathed('source' or 'target')
    static getInternalRepathLinks(invisibleInternalNodes){
        const internalRepathLinkObjs = []

        const linksForPotentialRepath = Link.internalLinks.filter(l => !l.visibility) // invisible links
        for(const link of linksForPotentialRepath){
            const sourceIsInvisibleInternalNode = invisibleInternalNodes.find(n => n.id === link.source)
            const targetIsInvisibleInternalNode = invisibleInternalNodes.find(n => n.id === link.target)
            if(!(sourceIsInvisibleInternalNode && targetIsInvisibleInternalNode)){ // if either link or source is not an invisibleInternalNode we gotta repath the link to the first parent node that is visible
                Link.internalLinks[link.id].visibility = true
                if(sourceIsInvisibleInternalNode) internalRepathLinkObjs.push({link, key: 'source'}) // repath link source to parent
                else internalRepathLinkObjs.push({link, key: 'target'}) // repath link target to parent
            }
        }

        return internalRepathLinkObjs
    }
}
