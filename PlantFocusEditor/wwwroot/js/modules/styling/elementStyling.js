import { tr } from "../constants.js";

function handleColorChange(colors) {
    console.log(colors)
    const nodes = tr.nodes();
    const colorStops = [];

    colors.forEach((color, index) => {
        colorStops.push(index / (colors.length - 1));
        colorStops.push(color);
    });

    nodes.forEach((node) => {
        node.fillLinearGradientColorStops(colorStops);
    });

    tr.getLayer().batchDraw();
}

function handleEndPointChange(endPoint) {
    const nodes = tr.nodes();
    nodes.forEach((node) => {
        node.fillLinearGradientEndPoint({ x: endPoint, y: 0 });
    });
    tr.getLayer().batchDraw();
}

function getValues() {
    const firstNode = tr.nodes()[0];
    const colorStops = firstNode.fillLinearGradientColorStops();
    return {
        fillColor1: colorStops[1],
        fillColor2: colorStops[colorStops.length - 1],
    };
}

export { getValues, handleColorChange, handleEndPointChange };