const zoomInput = document.getElementById("zoomInput")

const graphScrollContainer = document.getElementById('graphScrollContainer')


const centerY = 'positionCenterY'
const center = 'positionCenter'




function changeZoom(factor){//changes Zoom factor and sets it
    // change zoom level in input
    const currentValue = parseInt(zoomInput.value)
    const zoomLevel = currentValue + parseInt(factor)
    fitSanityCheck(zoomLevel)
}

function fitSanityCheck(zoomLevel) {
    if(zoomLevel < 1) zoomLevel = 1
    else if (zoomLevel > 100) zoomLevel = 100
    zoomInput.value = Math.round(zoomLevel)
    zoom()
}

function zoom() {//executes changed zoom factor
    const zoomLevel = parseInt(zoomInput.value) / 100
    // const zoomDifference = Math.round( ( Math.pow ((zoomLevel - 1), 2) * -1500 ) / 2 )
    // console.log(zoomDifference)
    graphContainer.style.transform = `scale(${zoomLevel}) translateX(-0px)`
    try {
        // console.log(LAYOUT)
        if (LAYOUT === 'stackHorizontal') {//stackHorizontal needs only centerY centering class
            if(graphScrollContainer.classList.contains(center)) graphScrollContainer.classList.replace(center, centerY)
        }
        // else if (LAYOUT === 'fastOrganic') { }
        else throw Error()
    } catch (error) {
        if(graphScrollContainer.classList.contains(centerY)) graphScrollContainer.classList.replace(centerY, center)
    }
}

function fitToView() {
    const graphScrollContainerWidth = (window.innerWidth)*0.75 // because of 75vw width -> width of visible view
    const graphContainerWidth = parseInt(graphContainer.style.width)// -> width of graph
    // fit width to view
    let zoomLevel = (( graphScrollContainerWidth / graphContainerWidth ) - 0.02) * 100// -> calculates zoomlevel to be set, so that graph is exactly visible inside view, 0.02 padding
    fitSanityCheck(zoomLevel)

    const oneVw = viewportConvert(0, 1, 0)
    const oneHundredVh = viewportConvert(0, 0, 100)
    const graphScrollContainerHeight = oneHundredVh - oneVw // because height is 100vh - 1vw
    const graphContainerHeight = parseInt(graphContainer.style.height)
    if (graphContainerHeight > graphScrollContainerHeight) {
        // lower zoom level further because height doesnt fit to view
        const newZoomLevel = ((graphScrollContainerHeight / graphContainerHeight) - 0.02) * 100
        if(newZoomLevel < zoomLevel) fitSanityCheck(newZoomLevel)
    }
    // console.log(graphContainerHeight, graphScrollContainerHeight)
    if (LAYOUT === 'stackHorizontal') {
        graphContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }

}

function viewportConvert(px = 0, vw = 0, vh = 0){ // from https://stackoverflow.com/questions/28295072/how-can-i-convert-px-to-vw-in-javascript
    if(px != 0){
        if(vw){
            return (100 * px / window.innerWidth);
        } else {
            return (100 * px / window.innerHeight);
        }
    } else if(vw != 0 && vh != 0){
        var w_h_arr = [];
        w_h_arr["width"] = Math.ceil((window.innerWidth * vw / 100));
        w_h_arr["height"] = Math.ceil((window.innerHeight * vh / 100));
        return w_h_arr;
    } else if(vw != 0){
        return Math.ceil((window.innerWidth * vw / 100));
    } else if(vh != 0){
        return Math.ceil((window.innerHeight * vh / 100));
    }
}

// document.body.onload = zoom()
// on expand I need to call fitToView