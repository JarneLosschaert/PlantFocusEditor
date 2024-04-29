import { setFront, setBack, currentGroup, setCurrentGroup, setPropertiesGroup, tr } from "./constants.js";
import { handleTextEventListeners } from "./layers/textLayer.js";
import { sceneFunc } from "./layers/elementLayer.js";
import { addHoverAnimation } from "./animations.js";
import { handleSelections } from "./selectionHandling.js";
import { createClipFunc, findHeightPath, findWidthPath, getScaledCommands } from "./passePartout.js";
import { convertToSVGPath } from "./helpers.js";
import { saveState } from "./stateControls.js";

const $konvaContainer = document.getElementById("konva-container");
const initialWidth = $konvaContainer.offsetWidth;
const initialHeight = $konvaContainer.offsetHeight;

const stage = new Konva.Stage({
    container: "konva-container",
    width: initialWidth,
    height: initialHeight,
});

const layer = new Konva.Layer();

const PLANT = {
    Name: "Fragaria ananassa",
    LatinName: "Charlotte",
    image: "https://plantfocus.blob.core.windows.net/plants/5ed049f3-f5d0-4c5d-8581-0c9dae879d88.jpg"
}

function init() {
    initKonva();
    handleSelections();
    handleEventListeners();
}
function initKonva() {
    stage.add(layer);
    stage.draw();
}

function handleEventListeners() {
    document.addEventListener("click", saveState);
}

function loadTemplate(json) {
    json = JSON.parse(json);
    const front = getGroupJson(json[0]);
    const back = getGroupJson(json[1]);
    loadGroup(back, false);
    loadGroup(front);
    saveState();
}

function loadGroup(group, isFront = true) {
    layer.children.forEach(child => {
        if (child.getClassName() === "Group") {
            child.remove();
        }
    });

    if (isFront) {
        setFront(group);
    } else {
        setBack(group);
    }
    setCurrentGroup(isFront);
    layer.add(currentGroup);
    currentGroup.moveToBottom();
    tr.nodes([]);
}

function getGroupJson(json) {
    const group = new Konva.Group();
    let scale;
    let offsetX;
    let offsetY;
    let commands;

    if (!json.Group) {
        json = JSON.parse(json);
    } else {
        json = JSON.parse(json.Group);
    }

    json.children.forEach(child => {
        child = Konva.Node.create(child);

        if (child.attrs.name === "passepartout") {
            const marginY = 10;
            const originalHeight = findHeightPath(child.attrs.data);
            const height = stage.height() - marginY * 2;
            const originalWidth = findWidthPath(child.attrs.data);
            const width = stage.width();
            scale = height / originalHeight;
            offsetX = (width - originalWidth * scale) / 2;
            offsetY = marginY;

            commands = getScaledCommands(child.attrs.data, scale);
            const pathData = convertToSVGPath(commands);
            child.data(pathData);
        } else {
            if (child.attrs.name === "text") {
                handleTextEventListeners(child);
                if (child.text().startsWith("$")) {
                    const value = PLANT[child.text().slice(1)];
                    if (value) {
                        child.text(value);
                    }
                }
            } else if (child.attrs.name === "image") {
                const img = new Image();
                const src = child.attrs.src;
                img.src = src;
                child.image(img);
            } else if (child.attrs.name === "defaultImage") {
                const img = new Image();
                img.src = PLANT.image;
                console.log(child);
                const kimg = new Konva.Image({
                    x: child.x(),
                    y: child.y(),
                    name: "image",
                    image: img,
                    src: img.src,
                    width: child.width(),
                    height: child.height(),
                    scaleX: child.scaleX(),
                    scaleY: child.scaleY(),
                    draggable: true,
                    stroke: "#000000",
                    strokeWidth: 0,
                    shadowBlur: 10,
                    shadowOffset: { x: 5, y: 5 },
                    shadowOpacity: 0,
                });
                img.onload = function () {
                    const width = child.width() * child.scaleX();
                    const height = child.height() * child.scaleY();
                    const crop = getCrop(img, width, height);
                    kimg.setAttrs(crop);
                }
                group.add(kimg);
                addHoverAnimation(kimg);
            } else if (child.attrs.name === "element") {
                // not sure if this is needed
                // child.sceneFunc(sceneFunc);
            } else if (child.attrs.name === "qrcode" || child.attrs.name == "barcode") {
                const img = new Image();
                const src = child.attrs.src;
                img.src = src;
                child.image(img);
            } else if (child.attrs.name === "propertiesGroup") {
                child.children.forEach(row => {
                    row.children.forEach(rowChild => {
                        if (rowChild.attrs.name === "propertyImage") {
                            const img = new Image();
                            img.src = rowChild.attrs.src;
                            rowChild.image(img);
                        }
                    });
                });
                setPropertiesGroup(child);
            }
            addHoverAnimation(child);
        }
        if (child.attrs.name !== "defaultImage") {
            group.add(child);
        }
    });

    group.children.forEach(child => {
        if (child.attrs.name !== "passepartout") {
            if (child.attrs.name === "text") {
                const newFontSize = Math.round(child.fontSize() * scale);
                child.fontSize(newFontSize);
            } else if (child.attrs.name !== "image") {
                const oldScaleX = child.scaleX();
                const oldScaleY = child.scaleY();
                child.scaleX(oldScaleX * scale);
                child.scaleY(oldScaleY * scale);
            }

            const oldX = child.x();
            const oldY = child.y();
            const oldOffsetX = child.offsetX();
            const oldOffsetY = child.offsetY();
            const oldWidth = child.width();
            const oldHeight = child.height();
            child.x(oldX * scale);
            child.y(oldY * scale);
            child.offsetX(oldOffsetX * scale);
            child.offsetY(oldOffsetY * scale);
            child.width(oldWidth * scale);
            child.height(oldHeight * scale);
        }
    });

    const clipFunction = createClipFunc(commands);
    group.clipFunc(clipFunction);
    group.x(offsetX);
    group.y(offsetY);

    console.log(group);

    return group;
}

function getCrop(image, width, height) {
    const aspectRatio = width / height;
    const imageRatio = image.width / image.height;
    let newWidth;
    let newHeight;

    if (aspectRatio >= imageRatio) {
        newWidth = image.width;
        newHeight = image.width / aspectRatio;
    } else {
        newWidth = image.height * aspectRatio;
        newHeight = image.height;
    }

    const x = (image.width - newWidth) / 2;
    const y = (image.height - newHeight) / 2;

    return {
        cropX: x,
        cropY: y,
        cropWidth: newWidth,
        cropHeight: newHeight,
    };
}

export { stage, layer, init, loadTemplate, getGroupJson, loadGroup };