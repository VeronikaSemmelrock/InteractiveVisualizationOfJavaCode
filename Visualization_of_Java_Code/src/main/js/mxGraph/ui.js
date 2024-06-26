//returns specific style for vertex as string
function getStyle(fType, key){
    switch (fType){
        case "package":
            return STYLE_PACKAGE;
            break;
        case "class":
           return STYLE_CLASS;
           break;
        case "method":
            return STYLE_METHOD;
            break;
        case "constructor":
            return STYLE_CONSTRUCTOR; 
            break;
        case "attribute":
            return STYLE_ATTRIBUTE;
            break; 
        case "parameter": 
            return STYLE_PARAMETER; 
            break; 
        case "localVariable":
            return STYLE_LOCALVARIABLE; 
            break; 
        default:
            alert("Object "+key+" did not have a correclty set type for choosing style");
            return "";
            break;
    }
}

//returns correct width - smaller, if deeper in hierarchy
function getWidth(parent){
    let width = STANDARD_WIDTH; 
    let sub = GRAPH_BORDER; 
    if(parent === graph.getDefaultParent()) return width; 
    else{
        while(parent !== graph.getDefaultParent()){//each layer we go deeper, more must be subtracted (times 2 because once on each side)
            parent = parent.parent;//go one layer higher, trying to find defaultParent to determine on which layer this element is 
            sub += GRAPH_BORDER*2;//for each step subtract more from width
        }
        if(width - sub <=0){
            return 6; 
        }else{
           return width - sub; 
        }
    }
}

//returns name of elements, cuts away "path" from uniqueName
function getName(name, type, foreign){
    if(foreign){
        return name; 
    }
    switch(type){
        case "method": //fall through in switch-case code of constructor is executed for method (no break statement)
        case "constructor": 
            const maxIndex = name.lastIndexOf("("); 
            for (let i = maxIndex; i >= 0; i--) {
                if (name.charAt(i) === "." || name.charAt(i) === DELIMITER_INNERCLASS) {
                    return name.substring(i+1)
                }  
            } 
            break; 
        case "package": 
        case "class":
            if(name.lastIndexOf(DELIMITER_INNERCLASS) > -1){//nested classes
                return name.substring(name.lastIndexOf(DELIMITER_INNERCLASS)+1)
            } else if(name.lastIndexOf(DELIMITER_PATH) > -1) {
                return name.substring(name.lastIndexOf(DELIMITER_PATH)+1); 
            }
            break; 
        default:
            let highestIndex = 0; 
            //find possible delimiter
            if(type == "attribute"){
                highestIndex = name.lastIndexOf(DELIMITER_ATTRIBUTE); 
            }else if(type == "parameter"){
                highestIndex = name.lastIndexOf(DELIMITER_PARAMETER);
            }else if(type == "localVariable"){
                highestIndex = name.lastIndexOf(DELIMITER_LOCALVARIABLE); 
            }
            if(highestIndex > 0){
                return name.substring(highestIndex+1)
            }
    }
    return name; //no delimiters were found -> return full name 
}


//receives a uniquename of a vertex, checks what type this vertex has (class, method, package) from corresponding element in entities.json
function getTypeViaName(uniqueName){
    let entity;
    let res
    Object.keys(entities).forEach(function(key){//looping through each association
        if(entities[key].fUniqueName == uniqueName){
            res = entities[key]
            return key; 
        }
    });
    if(res) {
        return res.fType
    }
}

//receives a uniquename of a vertex, checks whether the entity behind the vertex is foreign or not 
function getForeignViaName(uniqueName){
    let entity;
    let res
    Object.keys(entities).forEach(function(key){//looping through each association
        if(entities[key].fUniqueName == uniqueName){
            res = entities[key]
            return key; 
        }
    });
    if(res) {
        return res.fForeign
    }
}


//sets correct visibility of edge/vertex depending on what filters are applied through checkboxes in UI 
function setVisibility(value, filters){
    let type; 
    foreign = false; 
    if(value.isVertex()){
        type = getTypeViaName(value.id);
        foreign = getForeignViaName(value.id); 
    }else{
        type = value.value; //in edges type is set in value
    }
    
    if(type !== null) {    
        let bool; 
        switch (type){
            case "package": 
                bool = filters[0]; //set as always true -> filtering of packages is disabled
                break;
            case "class": 
                bool = filters[1]; 
                break; 
            case "method": 
                bool = filters[2]; 
                break; 
            case "constructor": 
                bool = filters[3]; 
                break; 
            case "attribute": 
                bool = filters[4]; 
                break; 
            case "parameter": 
                bool = filters[5]; 
                break;
            case "LocalVariable": 
                bool = filters[6]; 
                break;
            case "implements": 
                bool = filters[7]; 
                break; 
            case "extends": 
                bool = filters[8]; 
                break; 
            case "returnType": 
                bool = filters[9]; 
                break; 
            case "access": 
                bool = filters[10]; 
                break; 
            case "invocation": 
                bool = filters[11]; 
                break; 
            default: 
                bool = true;
                break;  
        }
        //for filtering of foreign objects
        let allowForeign = filters[12]; 
        if(!allowForeign && foreign){
            bool = false; 
        }
        if(value.isEdge()){//if it is an edge, and from or to are not visible -> set invisible!
            if(value.source.visible === false || value.target.visible === false){
                bool = false; 
            }
        }
        value.visible = bool;
        // graph.getModel().setValue(value.visible, bool)
        // graph.getModel().visibleStateForCellChanged(value, bool); //??
    }
}
//sets global edge style once
function setEdgeStyle(){
    var edgeStyle = graph.stylesheet.getDefaultEdgeStyle(); 
    edgeStyle[mxConstants.STYLE_STROKEWIDTH]=1; 
    edgeStyle[mxConstants.STYLE_STROKECOLOR]="black";
    edgeStyle[mxConstants.STYLE_FONTCOLOR] = "black"; 
    edgeStyle[mxConstants.STYLE_ROUNDED]=true; //depends on taste
    edgeStyle[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
}

//sets default vertex style and registers own "invisible" style for parent 
function setVertexStyle(){
    let style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = 'swimlane';
    style[mxConstants.STYLE_STARTSIZE] = 30;
    style[mxConstants.STYLE_WHITE_SPACE] = 'wrap'; 
    style[mxConstants.STYLE_STROKECOLOR] ='#000000'; //black
    style[mxConstants.STYLE_FONTCOLOR] = '#000000'; 
    style[mxConstants.STYLE_AUTOSIZE] ='1'; 
    
    //invisible parent
    style = [];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_STROKECOLOR] = 'none';
    style[mxConstants.STYLE_FILLCOLOR] = 'none';
    style[mxConstants.STYLE_FOLDABLE] = false;
    graph.getStylesheet().putCellStyle('invisible', style);
}

function getLayoutOption(){
    return document.querySelector('input[name="layout"]:checked').value
}
