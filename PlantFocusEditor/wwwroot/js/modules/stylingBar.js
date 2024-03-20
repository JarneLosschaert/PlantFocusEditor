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
    console.log(selectedClasses);
    const isSelected = selectedClasses.length > 0;
    if (isSelected && selectedClasses.every(el => el === "Text")) {
        return "Text";
    }
    if (isSelected && selectedClasses.every(el => el === "Image")) {
        return "Image";
    }
    if (isSelected && selectedClasses.every(el => el === "Shape")) {
        return "Shape";
    }
    if (isSelected) {
        return "Selecting";
    }
    return "";

}
export { handleShadowChange, handleTransparencyChange, getSelectedItemType };