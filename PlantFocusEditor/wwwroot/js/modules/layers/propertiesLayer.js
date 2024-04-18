import { addHoverAnimation } from "../animations.js";
import { tr, currentGroup } from "../constants.js";
import { propertiesGroup } from "../constants.js";

const rowHeight = 75;
const rowWidth = 200;
const borderThickness = 1;
const margin = 10;
const imageSize = 50;
const fontSize = 15;
const borderColor = '#000000';
const backgroundColor = 'rgba(0, 0, 0, 0)';

function addProperty(src, texts) {
    let numRows = propertiesGroup.children.length;

    if (numRows === 0) {
        currentGroup.add(propertiesGroup);
        addHoverAnimation(propertiesGroup);
    }

    const rowGroup = new Konva.Group({
        y: numRows * rowHeight + borderThickness,
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
    img.src = src;
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

    const spaceText = rowHeight / texts.length;
    texts.forEach((text, index) => {
        const middle = spaceText * index + (spaceText / 2) - (fontSize / 2);
        const textNode = new Konva.Text({
            name: "propertyText",
            text: text,
            x: margin + imageSize + margin + borderThickness,
            y: middle,
            width: rowWidth - margin - imageSize - margin - borderThickness,
            fontSize: fontSize,
            fontFamily: 'Arial',
            fill: borderColor,
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

    if (numRows === 0) {
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
    tr.nodes([]);
}

export { addProperty };