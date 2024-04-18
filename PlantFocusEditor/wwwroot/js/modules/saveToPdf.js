import { stage, layer } from "./state.js";
import { getScaledCommands } from "./passePartout.js";
import { front, back } from "./constants.js";
import { calcLinearGradient, hexToRgb } from "./helpers.js";
import { arialRegular } from '../fonts/arial-normal.js';
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
import { georgia } from "../fonts/georgia-normal.js";
import { georgiaBold } from "../fonts/georgia-bold.js";
import { georgiaItalic } from "../fonts/georgia-italic.js";
import { georgiaBoldItalic } from "../fonts/georgia-bold-italic.js";

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

function getJsonToRender() {
    console.log(front);
    return JSON.stringify(front);
}

window.getFont = async (fontName) => {
    const res = await fetch(`/fonts/${fontName}`);
    const fontArrayBuffer = await res.arrayBuffer();
    const fontBytes = new Uint8Array(fontArrayBuffer);
    return fontBytes;
}

function getDimensions() {
    return [stage.width(), stage.height()];
}

window.downloadFile = (fileBytes, fileName, fileType) => {
    // Create a Blob from the byte array
    const blob = new Blob([fileBytes], { type: fileType });
    // Create a link element
    const link = document.createElement('a');
    // Set the href attribute to the Blob object
    link.href = URL.createObjectURL(blob);
    // Set the download attribute to the file name
    link.download = fileName;
    // Append the link to the document body
    document.body.appendChild(link);
    // Click the link to initiate the download
    link.click();
    // Remove the link from the document body
    document.body.removeChild(link);
}

function getFontsDirectory() {
    return "fonts";
}

async function saveToPdfFromJson() {
    console.log("save to pdf from json");
    const doc = new window.jspdf.jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [layer.width(), layer.height()],
        hotfixes: ['px_scaling']
    });
    addFonts(doc);
    convertLayerToPdf(doc, front);
    console.log("layer converted");
    doc.addPage([stage.width(), stage.height()], 'p');
    convertLayerToPdf(doc, back);
    doc.save('doc.pdf');
}

function convertLayerToPdf(doc, group) {
    console.log(group);
    const groupX = group.x();
    const groupY = group.y();
    for (let child of group.children) {
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
            doc.path(lines);
            if (child.fillLinearGradientColorStops()) {
                fillPathWithGradient(doc, child, lines);
            }
            console.log(lines);
            if (child.attrs.name === "passepartout") {
                doc.clip(lines);
            }
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
                doc.setGState(new doc.GState({ opacity: child.attrs.opacity }));
                doc.addImage(...attrs);
                doc.restoreGraphicsState();
            } else {
                doc.addImage(...attrs);
            }
        } else if (child.getClassName() === 'Text') {
            const width = child.width() * (child.scaleX() ?? 1);
            const padding = child.attrs.padding * (child.scaleX() ?? 1);
            const fontFamily = child.attrs.fontFamily;
            const fontSize = child.attrs.fontSize * (child.scaleX() ?? 1);
            const fontStyle = child.attrs.fontStyle;
            const align = child.attrs.align;
            const fontSizePoints = fontSize * 0.75;
            const text = splitText(child);
            doc.setFontSize(fontSizePoints);
            doc.setLineWidth(2);
            doc.setFont(fontFamily ?? 'Arial', fontStyle ?? 'normal');
            const stepY = fontSizePoints + padding;
            text.forEach((txt, i) => {
                const txtWidth = getTextDimensions(txt, fontStyle ?? '', fontSize, fontFamily ?? 'Arial').width;
                const currentStep = i + 1;

                let maxDescent = 0;
                for (let j = 0; j < txt.length; j++) {
                    const char = txt[j];
                    const descent = getTextDimensions(char, fontStyle ?? '', fontSize, fontFamily ?? 'Arial').descent;
                    maxDescent = Math.min(maxDescent, descent);
                }

                const textY = y + (currentStep * stepY);
                const textLineY = textY + padding / 2 + maxDescent;

                let textX;
                if (align === "center") {
                    textX = x + (width / 2) - (txtWidth / 2);
                } else if (align === "right") {
                    textX = x + width - txtWidth - padding;
                } else {
                    textX = x + padding;
                }
                console.log("adding text");
                addText(doc, child, textX, textY, textLineY, txt, txtWidth, shadowOpacity);
                console.log("text added");
            });
            doc.restoreGraphicsState();
        } else if (child.getClassName() === 'Ellipse') {
            const radiusX = child.radiusX() * (child.scaleX() ?? 1);
            const radiusY = child.radiusY() * (child.scaleX() ?? 1);
            if (shadowOpacity !== 0) {
                blurShadow(doc, child);
            }
            doc.setLineWidth(strokeWidth);
            doc.setDrawColor(stroke);
            setFillColor(doc, child);
            if (strokeWidth === 0) {
                doc.ellipse(x, y, radiusX, radiusY, 'F');
            } else {
                doc.ellipse(x, y, radiusX, radiusY, 'FD');
            }
            doc.restoreGraphicsState();
        } else if (child.className === 'Rect') {
            const width = child.attrs.width * (child.scaleX() ?? 1);
            const height = child.attrs.height * (child.scaleY() ?? 1);
            if (shadowOpacity !== 0) {
                blurShadow(doc, child);
            }
            
            console.log(child.fillLinearGradientStartPoint());
            if (child.fillLinearGradientStartPoint() && child.fillLinearGradientEndPoint() && child.fillLinearGradientColorStops() && !child.fill()) {
                setGradientFillLinesRect(doc, child, groupX, groupY, width, height);
                if (strokeWidth !== 0) {
                    doc.setDrawColor(stroke);
                    doc.setLineWidth(strokeWidth);
                    doc.rect(x, y, width, height, 'S');
                }                
            } else {
                setFillColor(doc, child);
                if (strokeWidth !== 0) {
                    doc.setDrawColor(stroke);
                    doc.setLineWidth(strokeWidth);
                    doc.rect(x, y, width, height, 'FD');
                } else {
                    doc.rect(x, y, width, height, 'S');
                }
            }
            //doc.restoreGraphicsState();
            console.log("rect end");
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
            if (strokeWidth === 0) {
                doc.triangle(absX1, absY1, absX2, absY2, absX3, absY3, 'F')
            } else {
                doc.triangle(absX1, absY1, absX2, absY2, absX3, absY3, 'FD');
            }
            doc.restoreGraphicsState();
        }
    }
}

function fillPathWithGradient(doc, child, lines) {
    const colorOne = hexToRgb(child.fillLinearGradientColorStops()[1]);
    const colorTwo = hexToRgb(child.fillLinearGradientColorStops()[3]);
    const points = [];
    for (let i = 0; i < lines.length - 1; i++) {
        const startPoint = lines[i].c;
        const endPoint = lines[i + 1].c;
        const command = lines[i].op;

    }
}

function setGradientFillLinesRect(doc, child, x, y, width, height) {
    const gradient = calcLinearGradient(child);
    const numLines = gradient.length; 
    const stepX = (width / numLines) * 2;
    const stepY = (height / numLines) * 2;
    doc.setLineWidth(Math.sqrt(stepX * stepX + stepY * stepY));
    for (let i = 0; i < numLines; i++) {
        const { color, shape } = gradient[i];

        // Calculate the end coordinates of the line based on the gradient position
        if (i < numLines / 2) {
            const lineX1 = x + child.x() + stepX * i;
            const lineY1 = y + child.y();
            const lineX2 = x + child.x();
            const lineY2 = lineY1 + stepY * i;
            doc.setDrawColor(color[0], color[1], color[2]);
            doc.line(lineX1, lineY1, lineX2, lineY2);
        } else {
            const lineX1 = x + child.x() + width;
            const lineY1 = y + child.y() + stepY * i - height;
            const lineX2 = x + child.x() + stepX * i - width;
            const lineY2 = y + child.y() + height;
            doc.setDrawColor(color[0], color[1], color[2]);
            doc.line(lineX1, lineY1, lineX2, lineY2);
        }
    }
}

function addText(doc, child, x, y, textLineY, txt, txtWidth, shadowOpacity) {
    if (shadowOpacity !== 0) {
        blurShadow(doc, child, x, y);
    }
    setFillColor(doc, child);
    if (child.attrs.textDecoration === "underline") {
        doc.setDrawColor(child.attrs.fill);
        doc.line(x, textLineY, x + txtWidth, textLineY);
        doc.setDrawColor("#000");
    }
    doc.text(txt, x, y);
}

function splitText(text, txtWidth) {
    if (txtWidth < text.width()) {
        return [text.text()];
    }
    const words = text.text().split(' ');
    const font = text.fontFamily() === undefined ? 'Arial' : text.fontFamily();
    const fontStyle = text.fontStyle() === undefined ? 'normal' : text.fontStyle();
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const tempLine = currentLine ? currentLine + ' ' + word : word;
        const tempWidth = getTextDimensions(tempLine, fontStyle, text.fontSize(), font ?? 'Arial').width + text.attrs.padding * 2;
        if (tempWidth <= text.width()) {
            currentLine = tempLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
}

function getTextDimensions(text, fontStyle, fontSizePx, font) {
    let canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    context.font = fontStyle + ' ' + fontSizePx + 'px ' + font;
    const metrics = context.measureText(text);
    const descent = metrics.actualBoundingBoxDescent;

    const width = metrics.width;
    canvas = null;
    return { width: width, descent: descent }
        ;
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
    doc.addFileToVFS('georgia.ttf', georgia);
    doc.addFont('georgia.ttf', 'Georgia', 'normal');
    doc.addFileToVFS('georgia-bold.ttf', georgiaBold);
    doc.addFont('georgia-bold.ttf', 'Georgia', 'bold');
    doc.addFileToVFS('georgia-italic.ttf', georgiaItalic);
    doc.addFont('georgia-italic.ttf', 'Georgia', 'italic');
    doc.addFileToVFS('georgia-bold-italic.ttf', georgiaBoldItalic);
    doc.addFont('georgia-bold-italic.ttf', 'Georgia', 'bold italic');
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
        doc.setGState(new doc.GState({ opacity: node.attrs.opacity }));
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

export { saveToPdfFromJson, getJsonToRender, getDimensions, getFontsDirectory }