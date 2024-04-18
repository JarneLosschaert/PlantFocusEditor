import { tr } from "../constants.js";

function handleFontSelect(font) {
    const group = tr.nodes()[0];
    const texts = group.find(".propertyText");
    texts.forEach((node) => {
        if (node.getClassName() === "Text") {
            node.fontFamily(font);
        }
    });
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
        borderWidth: Math.round(firstBorder.width() * properties.scaleX()),
        borderColor: firstBorder.fill()
    };
}

export { handleFontSelect, getValues };