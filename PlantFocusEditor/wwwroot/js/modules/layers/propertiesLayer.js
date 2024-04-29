import { addHoverAnimation } from "../animations.js";
import { tr, currentGroup } from "../constants.js";
import { propertiesGroup } from "../constants.js";

const rowHeight = 85;
let rowWidth = 200;
const margin = 10;
const imageSize = 60;
let font = 'Arial';
let style = 'normal';
let decoration = 'none';
let fontSize = 14;
let fontColor = '#000000';
let align = 'left';
let borderThickness = 1;
let borderColor = '#000000';
let backgroundColor = '#00000000';

function addProperties(json) {
    const properties = JSON.parse(json);

    if (propertiesGroup.children.length > 0) {
        const firstRow = propertiesGroup.findOne(".rowGroup");
        font = firstRow.findOne(".propertyText").fontFamily();
        style = firstRow.findOne(".propertyText").fontStyle();
        decoration = firstRow.findOne(".propertyText").textDecoration();
        fontSize = firstRow.findOne(".propertyText").fontSize();
        fontColor = firstRow.findOne(".propertyText").fill();
        align = firstRow.findOne(".propertyText").align();
        borderThickness = firstRow.findOne(".propertyMiddleBorder").strokeWidth();
        borderColor = firstRow.findOne(".propertyBorder").stroke();
        backgroundColor = firstRow.findOne(".propertyImage").fill();
    }

    properties.forEach(property => {
        property.Translations.forEach(translation => {
            const textWidth = translation.Text.length * (fontSize / 1.25);
            if (textWidth > rowWidth) {
                rowWidth = textWidth;
            }
        });
    });

    propertiesGroup.removeChildren();

    properties.forEach((property, index) => {
        const rowGroup = new Konva.Group({
            y: index * rowHeight + borderThickness,
            name: "rowGroup",
        });

        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: rowWidth,
            height: rowHeight,
            fill: backgroundColor,
        });
        rowGroup.add(background);

        const img = new Image();
        img.src = property.Icon;
        img.onload = function () {
            const image = new Konva.Image({
                name: "propertyImage",
                src: img.src,
                x: margin,
                y: rowHeight / 2 - (imageSize / 2),
                image: img,
                width: imageSize,
                height: imageSize,
            });
            rowGroup.add(image);
        };

        const middleBorder = new Konva.Line({
            name: "propertyMiddleBorder",
            points: [margin + imageSize, 0, margin + imageSize, rowHeight],
            stroke: borderColor,
            strokeWidth: borderThickness,
        });

        rowGroup.add(middleBorder);

        const spaceText = (rowHeight - (margin / 2)) / property.Translations.length;
        property.Translations.forEach((translation, index) => {
            const middle = spaceText * index + (spaceText / 2) - (fontSize / 2) + (margin / 2);
            const textNode = new Konva.Text({
                name: "propertyText",
                text: translation.Text,
                x: margin + imageSize + margin + borderThickness,
                y: middle,
                width: rowWidth - margin - imageSize - margin - borderThickness,
                height: spaceText,
                fontFamily: font,
                fontStyle: style,
                textDecoration: decoration,
                fontSize: fontSize,
                fill: fontColor,
                align: align,
            });
            rowGroup.add(textNode);
        });

        const bottomBorder = new Konva.Line({
            name: "propertyBorder",
            points: [0, rowHeight, rowWidth, rowHeight],
            stroke: borderColor,
            strokeWidth: borderThickness,
        });
        rowGroup.add(bottomBorder);

        if (index === 0) {
            const topBorder = new Konva.Line({
                name: "propertyBorder",
                points: [0, 0, rowWidth, 0],
                stroke: borderColor,
                strokeWidth: borderThickness,
            });
            rowGroup.add(topBorder);
        }

        propertiesGroup.add(rowGroup);
    });

    if (propertiesGroup.parent === null) {
        currentGroup.add(propertiesGroup);
        addHoverAnimation(propertiesGroup);
    }

    tr.nodes([]);
}

export { addProperties };