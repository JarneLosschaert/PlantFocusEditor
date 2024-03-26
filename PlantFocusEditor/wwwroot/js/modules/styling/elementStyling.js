import { tr } from "../constants.js";

function handleColorChange(color) {
    console.log("handleColorChange");
    console.log(tr.nodes());
    console.log(tr.nodes().length);
    tr.nodes().forEach(node => {
        node.fill(color);
    });
    tr.getLayer().batchDraw();
}

function getValues() {
    const firstNode = tr.nodes()[0];
    return {
        fill: firstNode.fill()
    };
}

export { getValues, handleColorChange };