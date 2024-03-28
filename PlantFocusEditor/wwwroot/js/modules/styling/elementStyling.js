import { tr } from "../constants.js";

function handleColorChange(colors) {
    const nodes = tr.nodes();
    const color1 = colors[0];
    const color2 = colors[1];

    nodes.forEach((node) => {
        const colorStops = node.fillLinearGradientColorStops();
        colorStops[1] = color1;
        colorStops[3] = color1;
        colorStops[5] = color2;
        node.fillLinearGradientColorStops(colorStops);
    });

    tr.getLayer().batchDraw();
}

function handleColorStop(colorStopPercentage) {
    const nodes = tr.nodes();
    nodes.forEach((node) => {
        const colorStops = node.fillLinearGradientColorStops();
        colorStops[2] = colorStopPercentage / 100;
        node.fillLinearGradientColorStops(colorStops);
    });
    tr.getLayer().batchDraw();
}

function getValues() {
    const firstNode = tr.nodes()[0];
    const colorStops = firstNode.fillLinearGradientColorStops();
    return {
        fillColor1: colorStops[1],
        fillColor2: colorStops[colorStops.length - 1],
        colorStop: colorStops[2] * 100,
    };
}

export { getValues, handleColorChange, handleColorStop };