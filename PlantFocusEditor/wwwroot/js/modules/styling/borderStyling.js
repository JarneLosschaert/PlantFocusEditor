import { tr } from "../constants.js";

function handleBorderColorChange(color) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => node.stroke(color));
}

function handleBorderWidthChange(width) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        const value = parseFloat(width);
        node.strokeWidth(value);
    });
}

function getValues() {
    const firstNode = tr.nodes()[0];
    return {
        borderWidth: firstNode.strokeWidth(),
        borderColor: firstNode.stroke()
    };
}

export { handleBorderColorChange, handleBorderWidthChange, getValues };