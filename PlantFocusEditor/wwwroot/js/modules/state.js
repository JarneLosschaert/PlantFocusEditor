import { changeTr, changeHoverTr, changeSelectionRectangle, front, setFront, back, setBack, currentGroup, setCurrentGroup, tr } from "./constants.js";
import { handleTextEventListeners } from "./layers/textLayer.js";
import { sceneFunc } from "./layers/shapeLayer.js";
import { addHoverAnimation } from "./animations.js";
import { handleSelections } from "./selectionHandling.js";
import { createClipFunc, findHeightPassePartout, findWidthPassePartout, getScaledCommands } from "./passePartout.js";
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
    loadState(getStateLS());
}

function handleEventListeners() {
    document.addEventListener("click", saveState);
}

function loadState(json) {
    if (json) {
        json = JSON.parse(json);
        console.log(json);
        layer.destroyChildren();
        json.children.forEach(child => {
            const node = Konva.Node.create(child);
            layer.add(node);
            if (node.getClassName() === "Group") {
                setFront(node);
                setCurrentGroup(node);
                let pathData;
                node.children.forEach(childNode => {
                    if (childNode.getClassName() === "Path") {
                        pathData = childNode.attrs.data;
                    } else if (childNode.attrs.name === "barcode") {
                        const img = new Image();
                        img.src = childNode.attrs.src;
                        childNode.image(img);
                        addHoverAnimation(childNode);
                    } else if (childNode.getClassName() === "Image") {
                        const src = childNode.attrs.src;
                        const img = new Image();
                        img.src = src;
                        childNode.image(img);
                        addHoverAnimation(childNode);
                    } else if (childNode.getClassName() === "Text") {
                        handleTextEventListeners(childNode);
                        addHoverAnimation(childNode);
                    } else if (childNode.getClassName() === "Shape") {
                        childNode.sceneFunc(sceneFunc);
                        addHoverAnimation(childNode);
                    }
                });
                const clipFuncWithParam = createClipFunc(pathData);
                node.clipFunc(clipFuncWithParam);
            } else if (node.attrs.name === "tr") {
                changeTr(node);
            } else if (node.attrs.name === "hoverTr") {
                changeHoverTr(node);
            } else if (node.attrs.name === "selectionRectangle") {
                changeSelectionRectangle(node);
            }
        });
    }
}

function loadStateFromTemplate(json) {
    json = JSON.parse(json);

    layer.children.forEach(child => {
        if (child.getClassName() === "Group") {
            child.remove();
        }
    });

    const firstGroup = loadGroupFromJson(json[0]);
    setFront(firstGroup);
    setCurrentGroup(firstGroup);
    layer.add(front);
    front.moveToBottom();
    setBack(loadGroupFromJson(json[1]));
}

function loadGroupFromJson(json) {
    const node = Konva.Node.create(json.Group);
    node.attrs.name = "passepartout";

    let pathData;
    let offsetX;
    let scale;

    node.children.forEach(child => {
        if (child.getClassName() === "Path") {
            scale = stage.height() / findHeightPassePartout(child.data());
            const commands = getScaledCommands(child.data());
            pathData = convertToSVGPath(commands);
            child.data(pathData);
            
            offsetX = stage.width() / 2 - findWidthPassePartout(pathData) / 2;
        } else if (child.getClassName() === "Image") {
            const src = child.attrs.src;
            const img = new Image();
            img.src = src;
            child.image(img);           
            addHoverAnimation(child);
        } else if (child.getClassName() === "Text") {
            handleTextEventListeners(child);
            addHoverAnimation(child);
        } else if (child.getClassName() === "Shape") {
            child.sceneFunc(sceneFunc);
            addHoverAnimation(child);
        }
    });
    node.children.forEach(child => {
        if (child.getClassName() !== "Path") {
            child.scale({ x: scale, y: scale });
            child.x(child.x() * scale);
            child.y(child.y() * scale);
        }
    })
    node.x(offsetX);
    const clipFuncWithParam = createClipFunc(pathData);
    node.clipFunc(clipFuncWithParam);
    node.on("click tap", () => tr.nodes([]));
    console.log(node);
    return node;
}

function getStateLS() {
    if (localStorage.getItem("front")) {
        return JSON.parse(localStorage.getItem("front"));
    }
}

function getBacksideState() {
    if (localStorage.getItem("back")) {
        return JSON.parse(localStorage.getItem("back"));
    }
}

export { stage, layer, init, getBacksideState, loadState, getStateLS, loadStateFromTemplate };