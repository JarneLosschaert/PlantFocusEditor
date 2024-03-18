import { stage } from "./state.js";
import { getScaledCommands } from "./passePartout.js";
import { front } from "./constants.js";
import {arialRegular} from '../fonts/arial-normal.js';
import { arialBold } from "../fonts/arial-bold.js";
import { arialItalic } from "../fonts/arial-italic.js";
import { arialBoldItalic } from "../fonts/arial-bold-italic.js";
import { courierNewRegular } from "../fonts/courier-normal.js";
import { courierNewBold } from "../fonts/courier-new-bold.js";
import { courierNewItalic } from "../fonts/courier-new-italic.js";
import { courierNewBoldItalic } from "../fonts/courier-new-bold-italic.js";
import { verdanaRegular } from "../fonts/Verdana-normal.js";
import { verdanaBold } from "../fonts/verdana-bold.js";
import { verdanaItalic } from "../fonts/verdana-italic.js";
import { verdanaBoldItalic } from "../fonts/verdana-bold-italic.js";
import { timesNewRomanRegular } from "../fonts/times-new-roman-normal.js";
import { timesNewRomanBold } from "../fonts/times-new-roman-bold.js";
import { timesNewRomanItalic } from "../fonts/times-new-roman-italic.js";
import { timesNewRomanBoldItalic } from "../fonts/times-new-roman-bolditalic.js";
import { comicSansMsRegular } from "../fonts/comic-sans-ms-normal.js";
import { comicSansMsBold } from "../fonts/comic-sans-ms-bold.js";
import { comicSansMsItalic } from "../fonts/comic-sans-ms-italic.js";
import { comicSansMsBoldItalic } from "../fonts/comic-sans-ms-bold-italic.js";

//const minWidth = 1200;
//const minHeight = 900;

/*function saveToPdf() {
    const clone = cloneStage();
    const clonedLayer = cloneLayer(layer);
    const clonedBackside = cloneLayer(backside);
    const doc = new window.jspdf.jsPDF({
        orientation: 'l',
        unit: 'px',
        format: [clone.width(), clone.height()],
        hotfixes: ['px_scaling']
    });
    saveLayer(doc, clone, clonedLayer);
    doc.addPage([clone.width(), clone.height()], 'landscape');
    saveLayer(doc, clone, clonedBackside, clonedLayer);
    doc.save('document.pdf');
    clone.destroy();
}*/

async function saveToPdfFromJson() {
    const doc = new window.jspdf.jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [stage.width(), stage.height()],
        hotfixes: ['px_scaling']
    });
    addFonts(doc);
    convertLayerToPdf(doc);
    //doc.addPage([stage.width(), stage.height()], 'p');
    //convertLayerToPdf(doc);
    doc.save('doc.pdf');
}

function convertLayerToPdf(doc) {
    console.log(front);
    for (let child of front.children) {
        const groupX = front.x();
        const groupY = front.y();
        if (child.getClassName() === "Path") {
            const lines = [];
            const pathData = child.data();
            const commands = getScaledCommands(pathData);
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                switch (command.command) {
                    case 'M':
                        lines.push({ op: "m", c: command.points });
                        break;
                    case "L":
                        lines.push({ op: "l", c: command.points });
                        break;
                    case "C":
                        lines.push({ op: "c", c: command.points });
                        break;
                    case "z":
                        lines.push({ op: "h", c: [] });
                        break;
                    default:
                        break;
                }
            };
            console.log(lines);
            lines.forEach((segment, i, arr) => {
                const newCoords = segment.c.map((coord, i) => {
                    if (i % 2 === 0) {
                        return coord + groupX;
                    } else {
                        return coord + groupY;
                    }
                });
                arr[i] = { op: segment.op, c: newCoords };
            });
            console.log(lines);
            doc.path(lines);
            doc.setDrawColor('#000000');
            doc.stroke();
        }
        const x = child.x() + groupX;
        const y = child.y() + groupY;
        const stroke = child.stroke();
        const strokeWidth = child.strokeWidth();
        const shadowOpacity = child.shadowOpacity();
        const rotation = child.rotation();

        if (child.getClassName() === 'Image') {
            const src = child.attrs.src;
            const width = child.width() * child.scaleX();
            const height = child.height() * child.scaleY();
            console.log(width);
            console.log(height);
            let attrs = [src, 'PNG', x, y, width, height];
            /*if (rotation) {
                const [newX, newY] = calcCoordinates(child);
                attrs = [src, 'PNG', newX, newY, width, height, null, null, -rotation];
            }*/
            if (shadowOpacity !== 0) {
                blurShadow(doc, child);
            }
            if (strokeWidth !== 0) {
                doc.setDrawColor(stroke);
                doc.setLineWidth(strokeWidth);
                doc.rect(x, y, width, height, 'S');
            }
            if (child.attrs.opacity) {
                doc.saveGraphicsState();
                doc.setGState(new doc.GState({opacity: child.attrs.opacity}));
                doc.addImage(...attrs);
                doc.restoreGraphicsState();
            } else {
                doc.addImage(...attrs);
            }
        } else if (child.getClassName() === 'Text') {
            const width = child.attrs.width;
            const padding = child.attrs.padding;
            const fontFamily = child.attrs.fontFamily;
            const fontSize = child.attrs.fontSize;
            const fontStyle = child.attrs.fontStyle;
            const align = child.attrs.align;
            const fontSizePoints = fontSize * 0.75;
            const txt = child.attrs.text;
            let txtWidth;
            doc.setLineWidth(2);
            if (fontStyle && fontFamily) {
                doc.setFont(fontFamily, fontStyle);
                txtWidth = getTextDimensions(txt, fontStyle, fontSize, fontFamily);
            } else if (fontFamily) {
                doc.setFont(fontFamily, 'normal');
                txtWidth = getTextDimensions(txt, '', fontSize, fontFamily);
            } else if (fontStyle) {
                doc.setFont('Arial', fontStyle);
                txtWidth = getTextDimensions(txt, fontStyle, fontSize, 'Arial');
            } else {
                doc.setFont('Arial', 'normal');
                txtWidth = getTextDimensions(txt, '', fontSize, 'Arial');
            }
            doc.setFontSize(fontSizePoints);
            let textX;
            const textY = y + fontSizePoints + padding;
            const textLineY = y + fontSize + padding;
            if (align === "center") {
                textX = x + (width / 2) - (txtWidth / 2);
            } else if (align === "right") {
                textX = x + width - txtWidth - padding;
            } else {
                textX = x + padding;
            }
            addText(doc, child, textX, textY, textLineY, txt, txtWidth, shadowOpacity);
            doc.restoreGraphicsState();
        } else if (child.getClassName() === 'Ellipse') {
            const radiusX = child.radiusX();
            const radiusY = child.radiusY();
            if (shadowOpacity !== 0) {
                blurShadow(doc, child);
            }
            doc.setLineWidth(strokeWidth);
            doc.setDrawColor(stroke);
            setFillColor(doc, child);
            doc.ellipse(x, y, radiusX, radiusY, 'FD');
            doc.restoreGraphicsState();
        } else if (child.className === 'Rect') {
            const width = child.attrs.width;
            const height = child.attrs.height;
            if (shadowOpacity !== 0) {
                blurShadow(doc, child);
            }
            doc.setLineWidth(strokeWidth);
            doc.setDrawColor(stroke);
            setFillColor(doc, child);
            doc.rect(x, y, width, height, 'FD');
            doc.restoreGraphicsState();
        } else if (child.getClassName() === 'Shape') {
            const x1 = child.attrs.x1;
            const x2 = child.attrs.x2;
            const x3 = child.attrs.x3;
            const y1 = child.attrs.y1;
            const y2 = child.attrs.y2;
            const y3 = child.attrs.y3;

            const absX1 = x + x1;
            const absY1 = y + y1;
            const absX2 = x + x2;
            const absY2 = y + y2;
            const absX3 = x + x3;
            const absY3 = y + y3;

            if (shadowOpacity !== 0) {
                blurShadow(doc, child);
            }
            doc.setLineWidth(strokeWidth);
            doc.setDrawColor(stroke);
            setFillColor(doc, child);
            doc.triangle(absX1, absY1, absX2, absY2, absX3, absY3, 'FD');
            doc.restoreGraphicsState();
        }
    }
}

function addText(doc, child, x, y, textLineY, txt, txtWidth, shadowOpacity) {
    if (shadowOpacity !== 0) {
        blurShadow(doc, child, x, y);
    }
    setFillColor(doc, child);
    if (child.attrs.textDecoration === "underline") {
        doc.line(x, textLineY, x + txtWidth, textLineY);
    }
    doc.text(txt, x, y);
}

function getTextDimensions(text, fontStyle, fontSizePx, font) {
    let canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    context.font = fontStyle + ' ' + fontSizePx + 'px ' + font;
    const textMetrics = context.measureText(text);

    const width = textMetrics.width;
    canvas = null;
    return width;
}

function blurShadow(doc, shape, textX, textY) {
    const stepX = shape.shadowOffsetX() / shape.shadowBlur();
    const stepY = shape.shadowOffsetY() / shape.shadowBlur();
    // Draw multiple shapes with varying opacity and offset to simulate blur
    for (let i = 0; i < shape.shadowBlur(); i++) {
        const opacity = (shape.shadowOpacity() / shape.shadowBlur()) + (i / shape.shadowBlur()); // Increase opacity for each step
        const offsetX = stepX * (shape.shadowBlur() - i); // Starts at the outer shadow layer, move inward
        const offsetY = stepY * (shape.shadowBlur() - i);
        
        const x = shape.x() + front.x() + offsetX;
        const y = shape.y() + front.y() + offsetY;
        doc.setFillColor(0, 0, 0, opacity);
        switch (shape.className) {
            case 'Rect':
                doc.rect(x, y, shape.width() * shape.scaleX(), shape.height() * shape.scaleY(), 'F');
                break;
            case 'Ellipse':
                doc.ellipse(x, y, shape.radiusX() * shape.scaleX(), shape.radiusY() * shape.scaleY(), 'F');
                break;
            case 'Shape':
                const x1 = shape.attrs.x1 + front.x();
                const x2 = shape.attrs.x2 + front.x();
                const x3 = shape.attrs.x3 + front.x();
                const y1 = shape.attrs.y1 + front.y();
                const y2 = shape.attrs.y2 + front.y();
                const y3 = shape.attrs.y3 + front.y();

                const absX1 = x + x1;
                const absY1 = y + y1;
                const absX2 = x + x2;
                const absY2 = y + y2;
                const absX3 = x + x3;
                const absY3 = y + y3;
                doc.triangle(absX1, absY1, absX2, absY2, absX3, absY3, 'F');
                break;
            case 'Text':
                doc.setTextColor(0, 0, 0, opacity);
                doc.text(shape.text(), textX + offsetX, textY + offsetY);
                break;
            default:
                doc.rect(x, y, shape.width() * shape.scaleX(), shape.height() * shape.scaleY(), 'F');
                break;
        }
    }
}

function addFonts(doc) {
    doc.addFileToVFS('arial.ttf', arialRegular);
    doc.addFont('arial.ttf', 'Arial', 'normal');
    doc.addFileToVFS('arial-bold.ttf', arialBold);
    doc.addFont('arial-bold.ttf', 'Arial', 'bold');
    doc.addFileToVFS('arial-italic.ttf', arialItalic);
    doc.addFont('arial-italic.ttf', 'Arial', 'italic');
    doc.addFileToVFS('arial-bold-italic.ttf', arialBoldItalic);
    doc.addFont('arial-bold-italic.ttf', 'Arial', 'bold italic');
    doc.addFileToVFS('courier-new.ttf', courierNewRegular);
    doc.addFont('courier-new.ttf', 'Courier New', 'normal');
    doc.addFileToVFS('courier-new-bold.ttf', courierNewBold);
    doc.addFont('courier-new-bold.ttf', 'Courier New', 'bold');
    doc.addFileToVFS('courier-new-italic.ttf', courierNewItalic);
    doc.addFont('courier-new-italic.ttf', 'Courier New', 'italic');
    doc.addFileToVFS('courier-new-bold-italic.ttf', courierNewBoldItalic);
    doc.addFont('courier-new-bold-italic.ttf', 'Courier New', 'bold italic');
    doc.addFileToVFS('verdana.ttf', verdanaRegular);
    doc.addFont('verdana.ttf', 'Verdana', 'normal');
    doc.addFileToVFS('verdana-bold.ttf', verdanaBold);
    doc.addFont('verdana-bold.ttf', 'Verdana', 'bold');
    doc.addFileToVFS('verdana-italic.ttf', verdanaItalic);
    doc.addFont('verdana-italic.ttf', 'Verdana', 'italic');
    doc.addFileToVFS('verdana-bold-italic.ttf', verdanaBoldItalic);
    doc.addFont('verdana-bold-italic.ttf', 'Verdana', 'bold italic');
    doc.addFileToVFS('times-new-roman.ttf', timesNewRomanRegular);
    doc.addFont('times-new-roman.ttf', 'Times New Roman', 'normal');
    doc.addFileToVFS('times-new-roman-bold.ttf', timesNewRomanBold);
    doc.addFont('times-new-roman-bold.ttf', 'Times New Roman', 'bold');
    doc.addFileToVFS('times-new-roman-italic.ttf', timesNewRomanItalic);
    doc.addFont('times-new-roman-italic.ttf', 'Times New Roman', 'italic');
    doc.addFileToVFS('times-new-roman-bold-italic.ttf', timesNewRomanBoldItalic);
    doc.addFont('times-new-roman-bold-italic.ttf', 'Times New Roman', 'bold italic');
    doc.addFileToVFS('comic-sans-ms.ttf', comicSansMsRegular);
    doc.addFont('comic-sans-ms.ttf', 'Comic Sans MS', 'normal');
    doc.addFileToVFS('comic-sans-ms-bold.ttf', comicSansMsBold);
    doc.addFont('comic-sans-ms-bold.ttf', 'Comic Sans MS', 'bold');
    doc.addFileToVFS('comic-sans-ms-italic.ttf', comicSansMsItalic);
    doc.addFont('comic-sans-ms-italic.ttf', 'Comic Sans MS', 'italic');
    doc.addFileToVFS('comic-sans-ms-bold-italic.ttf', comicSansMsBoldItalic);
    doc.addFont('comic-sans-ms-bold-italic.ttf', 'Comic Sans MS', 'bold italic');
}

/*function saveLayer(doc, clone, layerToAdd, layerToRemove) {
    if (layerToRemove) {
        layerToRemove.remove();
    }
    clone.add(layerToAdd);

    clone.draw();
    const canvas = clone.toCanvas();
    const dataUrl = canvas.toDataURL("image/png");

    doc.addImage(dataUrl, 'PNG', 0, 0, clone.width(), clone.height());
}

function cloneStage() {
    const clone = new Konva.Stage({
        container: "temp",
        width: Math.max(stage.width(), minWidth),
        height: Math.max(stage.height(), minHeight)
    });
    return clone;
}

function cloneLayer(layerToClone) {
    const clone = new Konva.Layer();

    layerToClone.children.forEach(child => {
        const node = child.clone();
        clone.add(node);
    });

    return clone;
}*/

function setFillColor(doc, node) {
    doc.saveGraphicsState();
    const isText = node.className === "Text";
    if (node.attrs.opacity) {
        doc.setGState(new doc.GState({opacity: node.attrs.opacity}));
        isText ? doc.setTextColor(node.attrs.fill) : doc.setFillColor(node.attrs.fill);
    } else {
        isText ? doc.setTextColor(node.attrs.fill) : doc.setFillColor(node.attrs.fill);
    }
}

function calcCoordinates(node) {
    const topLeftX = node.attrs.x;
    const topLeftY = node.attrs.y;
    const width = node.attrs.width;
    const height = node.attrs.height;

    const centerX = topLeftX + width / 2;
    const centerY = topLeftY + height / 2;
    const radians = node.attrs.rotation * (Math.PI / 180);

    const X = (topLeftX - centerX) * Math.cos(-radians) - (topLeftY - centerY) * Math.sin(-radians) + centerX;
    const Y = (topLeftX - centerX) * Math.sin(-radians) + (topLeftY - centerY) * Math.cos(-radians) + centerY;
    console.log(X, Y);
    return [X, Y];
}

export { saveToPdfFromJson };