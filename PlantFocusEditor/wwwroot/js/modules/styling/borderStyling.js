import { tr } from "../constants.js";

function handleBorderColorChange(color) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => node.stroke(color));
}

function handleBorderWidthChange(width) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        const value = parseFloat(width);
        const scale = node.scaleX();
        node.strokeWidth(value / scale);
    });
}

function getValues() {
    const firstNode = tr.nodes()[0];
    return {
        borderColor: firstNode.stroke(),
        borderWidth: Math.round(firstNode.strokeWidth() * firstNode.scaleX()),
    };
}

export { handleBorderColorChange, handleBorderWidthChange, getValues };