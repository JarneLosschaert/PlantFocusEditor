import { tr } from "./constants.js";

let textStylingBarReference = null;
function setTextStylingBarReference(reference) {
    textStylingBarReference = reference;
}

function handleFontSelect(font) {
    console.log(font);
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.fontFamily(font);
        }
    });
}

function handleFontSizeChange(fontSize) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        if (node.getClassName() === "Text") {
            const value = parseFloat(fontSize);
            node.fontSize(value);
        }
    });
}

function handleFontColorChange(fontColor) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.fill(fontColor);
        }
    });
}

function handleBoldItalic(style) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.fontStyle(style);
        }
    });
}

function handleUnderline(style) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.textDecoration(style);
        }
    });
}

function handleAlignmentChange(alignment) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.align(alignment);
        }
    });
}

function displayTextStylingBar() {
    const selectedNodes = tr.nodes();
    const onlyText =
        selectedNodes.length > 0 &&
        selectedNodes.every((node) => {
            return node.getClassName() === "Text";
        });
    //textStylingBarReference.invokeMethodAsync('displayTextStylingBar', onlyText)
    //updateTextStylingBarValues();
}

function getValues() {
    const firstNode = tr.nodes()[0];
    console.log(firstNode.fontFamily());
    return {
        font: firstNode.fontFamily(),
        fontSize: firstNode.fontSize(),
        color: firstNode.fill(),
        fontStyle: firstNode.fontStyle(),
        textDecoration: firstNode.textDecoration(),
        align: firstNode.align()
    };
}

export { setTextStylingBarReference, displayTextStylingBar, handleFontSelect, handleFontSizeChange, handleFontColorChange, handleBoldItalic, handleUnderline, handleAlignmentChange, getValues };
