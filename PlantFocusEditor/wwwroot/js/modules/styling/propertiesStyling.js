import { tr } from "../constants.js";
import { layer } from "../state.js";

function handleFontSelect(font) {
    const group = tr.nodes()[0];
    const texts = group.find(".propertyText");
    texts.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.fontFamily(font);
        }
    });
}

function handleFontSizeChange(fontSize) {
    const group = tr.nodes()[0];
    const texts = group.find(".propertyText");
    texts.forEach((node) => {
        if (node.getClassName() === "Text") {
            const value = parseFloat(fontSize);
            node.fontSize(value);
            const bbox = node.getClientRect({ skipTransform: false });
            console.log(`bbox height: ${bbox.height}`);
            node.height(bbox.height);
        }
    });
}

function handleFontColorChange(fontColor) {
    const group = tr.nodes()[0];
    const texts = group.find(".propertyText");
    texts.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.fill(fontColor);
        }
    });
}

function handleBoldItalic(style) {
    const group = tr.nodes()[0];
    const texts = group.find(".propertyText");
    texts.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.fontStyle(style);
        }
    });
}

function handleUnderline(style) {
    const group = tr.nodes()[0];
    const texts = group.find(".propertyText");
    texts.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.textDecoration(style);
        }
    });
}

function handleAlignmentChange(alignment) {
    const group = tr.nodes()[0];
    const texts = group.find(".propertyText");
    texts.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.align(alignment);
        }
    });
}

function handleBorderColorChange(color) {
    const group = tr.nodes()[0];
    const borders = group.find(".propertyBorder, .propertyMiddleBorder");
    borders.forEach((node) => {
        node.stroke(color);
    });
}

function handleBorderWidthChange(width) {
    const group = tr.nodes()[0];
    const borders = group.find(".propertyBorder, .propertyMiddleBorder");
    borders.forEach((node) => {
        const value = parseFloat(width);
        node.strokeWidth(value);
    });
    layer.batchDraw();
}

function getValues() {
    const properties = tr.nodes()[0];
    const firstText = properties.findOne(".propertyText");
    const firstBorder = properties.findOne(".propertyBorder");
    return {
        font: firstText.fontFamily(),
        fontSize: Math.round(firstText.fontSize() * properties.scaleX()),
        color: firstText.fill(),
        fontStyle: firstText.fontStyle(),
        textDecoration: firstText.textDecoration(),
        align: firstText.align(),
        borderColor: firstBorder.stroke(),
        borderWidth: Math.round(firstBorder.strokeWidth() * properties.scaleX()),
    };
}

export { handleFontSelect, handleFontSizeChange, handleFontColorChange, handleBoldItalic, handleUnderline, handleAlignmentChange, handleBorderColorChange, handleBorderWidthChange, getValues };