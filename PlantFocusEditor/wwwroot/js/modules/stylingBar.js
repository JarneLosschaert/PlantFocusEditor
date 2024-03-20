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

function getSelectedItemType() {
    const selectedClasses = tr.nodes().map(el => el.getClassName());
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

function getValues() {
    const firstNode = tr.nodes()[0];
    return {
        borderWidth: firstNode.strokeWidth(),
        borderColor: firstNode.stroke(),
        shadowOpacity: firstNode.shadowOpacity(),
        opacity: firstNode.opacity()
    };
};

export { handleShadowChange, handleTransparencyChange, getSelectedItemType, handleBorderColorChange, handleBorderWidthChange, getValues };