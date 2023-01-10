import Base from "./Base.js"
import Node from "./Node.js"

export default class Link extends Base {
    static internalLinks = [] // class-based link array for changing links array with class methods
    static links = [] // D3cola link array

    constructor(id, name, source, target) {
        super(id, name)
        this.source = source
        this.target = target

        Link.internalLinks.push(this)
        Link.links.push(this.toD3Link())
    }


    toD3Link(newVisibleD3Nodes) {
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


    static resetInternalLinks() { // links do not have to be reset because they dont get reset by D3 for some reason
        // const oldInternalLinks = Link.internalLinks.slice(0) // create new array
        // Link.internalLinks = []
        // oldInternalLinks.forEach(l => new Link(
        //     l.id,
        //     l.name,
        //     l.visibility,
        //     l.source.id,
        //     l.target.id
        // ))
    }



    // This functions gets all links that need to be repathed alongside the key that needs to be repathed('source' or 'target') and repaths them using their lowestVisibleParent, it then pushes them to the visibleD3Links array
    // All other Links that have a source and path to a visible link just get added to the visibleD3Links array
    static repathLinksAndGetVisibleD3Links(visibleD3Nodes, invisibleInternalNodes) {
        const visibleD3Links = []

        for (const link of Link.internalLinks) {
            const sourceIsInvisibleInternalNode = invisibleInternalNodes.find(n => n.id === link.source)
            const targetIsInvisibleInternalNode = invisibleInternalNodes.find(n => n.id === link.target)
            if (!sourceIsInvisibleInternalNode && !targetIsInvisibleInternalNode) {
                visibleD3Links.push(link.toD3Link(visibleD3Nodes))
            }
            else if (!(sourceIsInvisibleInternalNode && targetIsInvisibleInternalNode)) { // if either link or source is not an invisibleInternalNode we gotta repath the link to the first parent node that is visible := getLowestVisibleParentRecusive
                // console.log('repath links', Link.internalLinks, link.id, sourceIsInvisibleInternalNode ? 'source' : 'target')
                const key = sourceIsInvisibleInternalNode ? 'source' : 'target'

                const invisibleNode = sourceIsInvisibleInternalNode || targetIsInvisibleInternalNode
                const parent = invisibleNode.getLowestVisibleParentRecusive()
                // console.log('parent of link', link, 'is', parent)
                if (parent) { // repath
                    const repathedD3Link = link.toD3Link(visibleD3Nodes)
                    repathedD3Link[key] = Node.getVisibleIndexById(visibleD3Nodes, parent.id)
                    visibleD3Links.push(repathedD3Link)
                }
            }
        }

        return visibleD3Links
    }


    // Link Styling
    static getStyle(linkType) {
        switch (linkType) {
            case 'extends':
                return {
                    color: 'green',
                }
            case 'implements':
                return {
                    color: 'blue',
                };
            case 'returnType':
                return {
                    color: 'red',
                };
            case 'invocation':
                return {
                    color: 'yellow',
                };
            case 'access':
                return {
                    color: 'violet',
                };
        }
    }
}
