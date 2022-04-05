const zoomInput = document.getElementById("zoomInput")

const graphScrollContainer = document.getElementById('graphScrollContainer')

const centerY = 'positionCenterY'
const center = 'positionCenter'

const graphScrollContainerWidth = (window.innerWidth)*0.75 // because of 75vw width -> width of visible view
const oneVw = viewportConvert(0, 1, 0)
const oneHundredVh = viewportConvert(0, 0, 100)
const graphScrollContainerHeight = oneHundredVh - oneVw // because height is 100vh - 1vw

//changes Zoom factor and sets it
function changeZoom(factor){
    const currentValue = parseInt(zoomInput.value)
    const zoomLevel = currentValue + parseInt(factor)
    fitSanityCheck(zoomLevel)
    centerScrollPosition(zoomLevel)
}

function fitSanityCheck(zoomLevel) {
    if(zoomLevel < 1) zoomLevel = 1
    else if (zoomLevel > 100) zoomLevel = 100
    zoomInput.value = Math.round(zoomLevel)
    zoom()
}

//executes changed zoom factor
function zoom() {
    const zoomLevel = parseInt(zoomInput.value) / 100
    const offsetX = calculateOffset(zoomLevel, 'x')
    const offsetY = calculateOffset(zoomLevel, 'y')

    if(LAYOUT === "circle") graphContainer.style.transform = `scale(${zoomLevel}) translateX(${offsetX}px) translateY(${offsetY}px)` // scaling doesnt move graph to center, so if size is adjusted, translate moves graph by its size difference
    else graphContainer.style.transform = `scale(${zoomLevel}) translateY(${graphContainer.clientHeight * zoomLevel / 100}px`
}

// fit width to view
function fitToView() {
    const graphContainerWidth = parseInt(graphContainer.style.width)// -> width of graph
    let zoomLevel = (( graphScrollContainerWidth / graphContainerWidth ) - 0.02) * 100// -> calculates zoomlevel to be set, so that graph is exactly visible inside view, 0.02 padding
    fitSanityCheck(zoomLevel)

    const graphContainerHeight = parseInt(graphContainer.style.height)
    if (graphContainerHeight > graphScrollContainerHeight) {
        // lower zoom level further because height doesnt fit to view
        const newZoomLevel = ((graphScrollContainerHeight / graphContainerHeight) - 0.02) * 100
        if(newZoomLevel < zoomLevel) {
            zoomLevel = newZoomLevel
            fitSanityCheck(zoomLevel)
        }
    }
    centerScrollPosition(zoomLevel)
}
function centerScrollPosition(zoomLevel) {
    if (LAYOUT === "circle") graphScrollContainer.scrollTo(0,0)
    else graphContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
    });
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



function calculateOffset(zoomLevel, axis) {
    if (axis === 'x') return Math.round(graphContainer.clientWidth * zoomLevel / 100 / 2)
    else return Math.round(graphContainer.clientHeight * zoomLevel / 100 / 2)
}