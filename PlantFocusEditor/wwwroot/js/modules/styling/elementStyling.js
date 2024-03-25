import { tr } from "../constants.js";

function getFillColor() {
    const firstNode = tr.nodes()[0];
    return firstNode.fill();
}

function getValues() {
    const firstNode = tr.nodes()[0];
    return {
        fillColor: firstNode.fill()
    };
}

export { getFillColor, getValues };