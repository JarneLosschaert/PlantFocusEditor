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
    const selected = tr.nodes();
    const isSelected = selected.length > 0;
    if (isSelected && selected.every(el => el.getClassName() === "Text")) {
        return "Text";
    }
    if (isSelected && selected.every(el => el.getClassName() === "Image") && !selected.every(el => el.attrs.name === "qrcode") && !selected.every(el => el.attrs.name === "barcode")) {
        return "Image";
    }
    if (isSelected && selected.every(el => el.getClassName() === "Shape")) {
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