export function parseAssociationsToLinks(associations, entities){
    let result = []; 
    const associationKeys = Object.keys(associations)
    const entityKeys = Object.keys(entities)

    for(let i = 0; i < associationKeys.length; i++){
        const association = associations[associationKeys[i]]
        // console.log(i)
        // console.log(association.fFromEntity)
        result.push({
            "id" : i, 
            "source": entityKeys.findIndex(key => key === association.fFromEntity),
            "target": entityKeys.findIndex(key => key === association.fToEntitiy),
            "type" : association.fType}
        ); 
    }
    return result; 
}

export function parseEntitiesToNodes(entities){

}
