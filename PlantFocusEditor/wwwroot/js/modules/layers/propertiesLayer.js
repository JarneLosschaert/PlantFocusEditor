import { addHoverAnimation } from "../animations.js";
import { tr, currentGroup } from "../constants.js";
import { propertiesGroup } from "../constants.js";

const rowHeight = 75;
const rowWidth = 200;
const margin = 10;
const imageSize = 50;
let font = 'Arial';
let style = 'normal';
let decoration = 'none';
let fontSize = 15;
let fontColor = '#000000';
let align = 'left';
let borderThickness = 1;
let borderColor = '#000000';
let backgroundColor = 'rgba(0, 0, 0, 0)';

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
        borderThickness = firstRow.findOne(".propertyBorder").height();
        borderColor = firstRow.findOne(".propertyBorder").fill();
        backgroundColor = firstRow.findOne(".propertyImage").fill();
    }

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
                x: margin,
                y: rowHeight / 2 - (imageSize / 2),
                image: img,
                width: imageSize,
                height: imageSize,
            });
            rowGroup.add(image);
        };

        const middleBorder = new Konva.Rect({
            name: "propertyMiddleBorder",
            x: margin + imageSize + margin / 2,
            y: 0,
            width: borderThickness,
            height: rowHeight,
            fill: borderColor,
        });
        rowGroup.add(middleBorder);

        const spaceText = rowHeight / property.Translations.length;
        property.Translations.forEach((translation, index) => {
            const middle = spaceText * index + (spaceText / 2) - (fontSize / 2);
            const textNode = new Konva.Text({
                name: "propertyText",
                text: translation.Text,
                x: margin + imageSize + margin + borderThickness,
                y: middle,
                width: rowWidth - margin - imageSize - margin - borderThickness,
                fontFamily: font,
                fontStyle: style,
                textDecoration: decoration,
                fontSize: fontSize,
                fill: fontColor,
                align: align,
            });
            rowGroup.add(textNode);
        });

        const bottomBorder = new Konva.Rect({
            name: "propertyBorder",
            x: 0,
            y: 0 + rowHeight - borderThickness,
            width: rowWidth,
            height: borderThickness,
            fill: borderColor,
        });
        rowGroup.add(bottomBorder);

        if (index === 0) {
            const topBorder = new Konva.Rect({
                name: "propertyBorder",
                x: 0,
                y: 0,
                width: rowWidth,
                height: borderThickness,
                fill: borderColor,
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