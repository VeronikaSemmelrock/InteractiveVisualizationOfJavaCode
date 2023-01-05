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

}

export default {parseAssociationsToLinks, parseEntitiesToNodes}