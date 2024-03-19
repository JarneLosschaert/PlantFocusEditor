import { tr } from "./constants.js";

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

function getSelectedItemType() {
    const selectedClasses = tr.nodes().map(el => el.getClassName());
    if (selectedClasses.every(el => el === "Text")) {
        return "onlyText";
    }
    if (selectedClasses.every(el => el === "Image")) {
        return "onlyImages";
    }
    if (selectedClasses.every(el => el === "Shape")) {
        return "onlyShapes";
    }

}
export { handleShadowChange, handleTransparencyChange, getSelectedItemType };