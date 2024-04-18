import { addHoverAnimation } from "../animations.js";
import { tr, currentGroup } from "../constants.js";

const propertiesGroup = new Konva.Group({
    name: "propertiesGroup",
    draggable: true,
});

let numRows = 0;
const rowHeight = 75;
const rowWidth = 200;
const borderThickness = 1;
const margin = 10;
const imageSize = 50;
const fontSize = 15;
const borderColor = '#000000';
const backgroundColor = 'rgba(0, 0, 0, 0)';

function addProperty(src, texts) {
    tr.nodes([]);
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
            x: margin,
            y: rowHeight / 2 - (imageSize / 2),
            image: img,
            width: imageSize,
            height: imageSize,
        });
        rowGroup.add(image);
    };

    const middleBorder = new Konva.Rect({
        name: "propertyBorder",
        x: margin + imageSize + margin / 2,
        y: 0,
        width: borderThickness,
        height: rowHeight,
        fill: borderColor,
    });
    rowGroup.add(middleBorder);

    const spaceBetweenTexts = (rowHeight - margin) / texts.length;
    texts.forEach((text, index) => {
        const textNode = new Konva.Text({
            name: "propertyText",
            text: text,
            x: margin + imageSize + margin + borderThickness,
            y: spaceBetweenTexts * index + margin / 2,
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

    // other place
    currentGroup.add(propertiesGroup);
    addHoverAnimation(propertiesGroup);

    numRows++;
}

export { addProperty };