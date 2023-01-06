export function parseAssociationsToLinks(associations, entities){
    let result = []; 
    const associationKeys = Object.keys(associations)
    const entityKeys = Object.keys(entities)

    for(let i = 0; i < associationKeys.length; i++){
        const association = associations[associationKeys[i]]
        result.push({
            "id" : i, 
            "source": entityKeys.findIndex(key => key === association.fFromEntity.fUniqueName),
            "target": entityKeys.findIndex(key => key === association.fToEntity.fUniqueName),
            "type" : association.fType, 
            "visibiity" : true}
        ); 
    }
    return result; 
}   

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
        const test = foundChildren; 
        //console.log(test)
        const temp = { 
            id: i,
            visibility: true,
            uniqueName: entity.fUniqueName,
            leaves: [i],
            groups: test 
        };
        //console.log(temp)
        resultNodes.push(temp)
        // console.log(resultNodes)
    }

    //all entities have been added to the list -> now uniqueNames in children can be replaced with index, then list can be returned
    return replaceUniqueNamesWithIndex(resultNodes); 

}

function getUniqueNames(list){
    //console.log(list)
    const result = [];  
    for(let i = 0; i<list.length; i++){
        result.push(list[i].fUniqueName)
    }
    return result; 
}

function replaceUniqueNamesWithIndex(list){
    console.log(list); 
    //console.log(nodes)
    for(let i = 0; i < list.length; i++){//go through all nodes
        const indexesChildren = [];  
        const children = list[i].groups; 
        for(let j = 0; j < children.length; j++){//go through each child of the group
            //add the index of the child to the list indexesChildren
            indexesChildren.push(list.findIndex(node => node.uniqueName === children[j]))
        }
        //replace the list with uniqueNames with the list of indexes
        list[i].groups = indexesChildren; 
    }
    return list; 
}

export default {parseAssociationsToLinks, parseEntitiesToNodes}