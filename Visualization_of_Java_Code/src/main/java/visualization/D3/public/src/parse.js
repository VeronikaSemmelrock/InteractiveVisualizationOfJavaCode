function parseAssociationsToLinks(associations, entities){
    let result = []; 
    for(let i = 0; i < associations.length; i++){
        result.push({
            "id" : i, 
            "source": Object.keys(entities).findIndex(key => key === associations[i].fFromEntity),
            "target": Object.keys(entities).findIndex(key => key === associations[i].fToEntitiy),
            "type" : associations[i].fType}
        ); 
    }
    return result; 
}

function parseEntitiesToNodes(entities){
    let groups = []; 
    let count = 0; 
    for(let i = 0; i< entities.length; i++){
        //switch(entities[i].fType)
    }
}

export default {parseAssociationsToLinks, parseEntitiesToNodes}