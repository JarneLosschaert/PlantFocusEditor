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

    if (!json.children) {
        const jsonGroup = Konva.Node.create(json.Group);
        const jsonString = jsonGroup.toJSON();
        json = JSON.parse(jsonString);
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

            } else if (child.attrs.name === "image") {
                const img = new Image();
                const src = child.attrs.src;
                img.src = src;
                child.image(img);
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
        group.add(child);
    });

    group.children.forEach(child => {
        if (child.attrs.name !== "passepartout") {
            if (child.attrs.name === "text") {
                const newFontSize = Math.round(child.fontSize() * scale);
                child.fontSize(newFontSize);
            } else {
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
            child.offsetY(oldOffsetY * scale); $
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

function getFrontState() {
    if (localStorage.getItem("front")) {
        return JSON.parse(localStorage.getItem("front"));
    }
}

function getBackState() {
    if (localStorage.getItem("back")) {
        return JSON.parse(localStorage.getItem("back"));
    }
}

export { stage, layer, init, loadTemplate, getGroupJson, loadGroup };