import Node from "./classes/Node.js";
import Link from "./classes/Link.js";


//parses associations.json from IVC to links for D3
function parseAssociationsToLinks(associations, entities){
    let result = []; 
    const associationKeys = Object.keys(associations)
    const entityKeys = Object.keys(entities)

    for(let i = 0; i < associationKeys.length; i++){
        const association = associations[associationKeys[i]]
        result.push({
            "id" : i, 
            "source": entityKeys.findIndex(key => key === association.fFromEntity.fUniqueName),
            "target": entityKeys.findIndex(key => key === association.fToEntity.fUniqueName),
            "type" : association.fType}
        ); 
    }
    return result; 
}   

//parses entities.json from IVC to nodes/groups for D3
function parseEntitiesToNodes(entities){
    //add all entities to nodes-list with uniqueNames of children set as groups and its own index as leaves-index 
    //later uniqueNames in groups will be replaced by right index after all entities have been added to list
    const resultNodes = []; 
    const entityKeys = Object.keys(entities)
    for(let i = 0; i< entityKeys.length; i++){
        let foundChildren = []; 
        const entity = entities[entityKeys[i]]
        switch(entity.fType){

            case "package": //a package has children in .fClasses
                foundChildren = foundChildren.concat(getUniqueNames(entity.fClasses))
                break; 
            case "class": //a class has children in .fInnerClasses, .fMethods, .fAttributes
                foundChildren = foundChildren.concat(getUniqueNames(entity.fInnerClasses))
                foundChildren = foundChildren.concat(getUniqueNames(entity.fMethods))
                foundChildren = foundChildren.concat(getUniqueNames(entity.fAttributes))
                break; 
            case "method": //a method has children in .fAnonymClasses, .fParameters, .fLocalVariables
                foundChildren = foundChildren.concat(getUniqueNames(entity.fAnonymClasses))
                foundChildren = foundChildren.concat(getUniqueNames(entity.fParameters))
                foundChildren = foundChildren.concat(getUniqueNames(entity.fLocalVariables))
                break; 
            case "constructor": //a constructor has children in .fAnonymClasses, .fParameters, .fLocalVariables
                foundChildren = foundChildren.concat(getUniqueNames(entity.fAnonymClasses))
                foundChildren = foundChildren.concat(getUniqueNames(entity.fParameters))
                foundChildren = foundChildren.concat(getUniqueNames(entity.fLocalVariables))
                break; 
        }

        const internalNodeObj = { 
            id: i,
            name: entity.fUniqueName,
            leaves: [i],
            groups: foundChildren,
            type: entity.fType,
            parentUniqueName: entity.fParentAsString, //can be "null" as string
            foreign: entity.fForeign
        };
        resultNodes.push(internalNodeObj)
    }
    //all entities have been added to the list -> now uniqueNames in children can be replaced with index (as D3 needs indexes)
    return replaceChildUniqueNamesWithIndex(resultNodes); 
}

//return a list of unique names corresponding to a list of data
function getUniqueNames(list){
    //console.log(list)
    const result = [];  
    for(let i = 0; i<list.length; i++){
        result.push(list[i].fUniqueName)
    }
    return result; 
}

//replaces the uniqueNames of the children (in "group") with the index of the entity in the list - necessary for D3
function replaceChildUniqueNamesWithIndex(list){
    for(let i = 0; i < list.length; i++){//go through all nodes
        const indexesChildren = [];  
        const children = list[i].groups; 
        for(let j = 0; j < children.length; j++){//go through each child of the group
            //add the index of the child to the list indexesChildren
            indexesChildren.push(list.findIndex(node => node.name === children[j]))
        }
        //replace the list with uniqueNames with the list of indexes
        list[i].groups = indexesChildren; 
    }
    return list; 
}

//imports json-files (association.json and entities.json in \data) and parses them to nodes in class Node and links in class Link
async function importJsonToD3(){
    try {
        const data = await fetch("data")
        const {associations: associationsJSON, entities: entitiesJSON} = await data.json()
        const associations = JSON.parse(associationsJSON)
        
        const entities = JSON.parse(entitiesJSON)
        console.log("Data downloaded, importing", associations, entities)
        const links = parseAssociationsToLinks(associations, entities)
        const nodes = parseEntitiesToNodes(entities)

        nodes.forEach(node => new Node(node.id, node.name, node.type, node.leaves, node.groups, node.parentUniqueName, node.foreign))
        links.forEach(link => new Link(link.id, link.source, link.target, link.type))

        console.log('successfully imported JSON data', {
            nodes: Node.nodes,
            groups: Node.groups,
            links: Link.links
        })
    } catch (error) {
        console.error("Error during import of project", error)
    }
}

export default importJsonToD3