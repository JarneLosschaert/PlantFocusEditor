import { tr } from "../constants.js";
function handleTransparencyChange(transparency) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        const value = parseFloat(transparency);
        node.opacity(value);
    });
}

function handleShadowChange(shadow) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        const value = parseFloat(shadow);
        node.shadowOpacity(value);
    });
}

function getValues() {
    const firstNode = tr.nodes()[0];
    return {
        shadow: firstNode.shadowOpacity(),
        opacity: firstNode.opacity()
    };
}

export { handleShadowChange, handleTransparencyChange, getValues }