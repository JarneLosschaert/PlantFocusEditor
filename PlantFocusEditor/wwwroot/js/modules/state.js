import { changeTr, changeHoverTr, changeSelectionRectangle, front, setFront, back, setBack, currentGroup, setCurrentGroup } from "./constants.js";
import { handleTextEventListeners } from "./textLayers.js";
import { handleSelections } from "./selectionHandling.js";
import { sceneFunc } from "./shapeLayers.js";
import { addHoverAnimation } from "./animations.js";
import { createClipFunc, findWidthPassePartout } from "./passePartout.js";

const $konvaContainer = document.getElementById("konva-container");
const initialWidth = $konvaContainer.offsetWidth;
const initialHeight = $konvaContainer.offsetHeight;

const images = {};
const selectedImages = [];

const stage = new Konva.Stage({
    container: "konva-container",
    width: initialWidth,
    height: initialHeight,
});

const layer = new Konva.Layer();
let barcodeImg = new Konva.Image({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    name: "barcode",
    number: "",
    draggable: true,
    src: "",
    stroke: "#000000",
    strokeWidth: 0,
    shadowBlur: 10,
    shadowOffset: { x: 5, y: 5 },
    shadowOpacity: 0,
    locked: false
});

const history = [];
const historyBackside = [];
let historyIndex = 0;
let historyBacksideIndex = 0;

const $undoButton = document.getElementById("undo");
const $redoButton = document.getElementById("redo");

function handleState() {
    initKonva();
    handleEventListeners();
}
function initKonva() {
    stage.add(layer);
    stage.draw();
    loadState(getStateLS());
}

function handleEventListeners() {
    document.addEventListener("click", saveState);
    //window.addEventListener("beforeunload", saveState);
    //$undoButton.addEventListener("click", undo);
    //$redoButton.addEventListener("click", redo);
    //$switchButton.addEventListener("click", switchSides);
}

function switchSides() {
    if (currentGroup === front) {
        front.remove();
        layer.add(back);
        setCurrentGroup(false);
    } else {
        back.remove();
        layer.add(front);
        setCurrentGroup(true);
    }
    handleSelections();
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
                        barcodeImg = childNode;
                        addHoverAnimation(childNode);
                    } else if (childNode.getClassName() === "Image") {
                        const id = childNode.attrs.id;
                        const src = childNode.attrs.src;
                        const img = new Image();
                        img.src = src;
                        childNode.image(img);
                        images[id] = src;
                        selectedImages.push(id);
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
    setBack(loadGroupFromJson(json[1]));
}

function loadGroupFromJson(json) {
    const node = Konva.Node.create(json.Group);
    let pathData;
    let offsetX;

    node.children.forEach(childNode => {
        if (childNode.getClassName() === "Path") {
            pathData = childNode.attrs.data;
            offsetX = stage.width() / 2 - findWidthPassePartout(pathData) / 2;
        } else if (childNode.attrs.name === "barcode") {
            const img = new Image();
            img.src = childNode.attrs.src;
            childNode.image(img);
            barcodeImg = childNode;
            addHoverAnimation(childNode);
        } else if (childNode.getClassName() === "Image") {
            const id = childNode.attrs.id;
            const src = childNode.attrs.src;
            const img = new Image();
            img.src = src;
            childNode.image(img);
            images[id] = src;
            selectedImages.push(id);
            addHoverAnimation(childNode);
        } else if (childNode.getClassName() === "Text") {
            handleTextEventListeners(childNode);
            addHoverAnimation(childNode);
        } else if (childNode.getClassName() === "Shape") {
            childNode.sceneFunc(sceneFunc);
            addHoverAnimation(childNode);
        }
    });
    node.x(offsetX);
    const clipFuncWithParam = createClipFunc(pathData);
    node.clipFunc(clipFuncWithParam);
    return node;
}

function saveState() {
    if (history[historyIndex] !== layer.toJSON()) {
        historyIndex++;
        history[historyIndex] = layer.toJSON();
        history.length = historyIndex + 1;
    }
    if (historyBackside[historyBacksideIndex] !== back.toJSON()) {
        historyBacksideIndex++;
        historyBackside[historyBacksideIndex] = back.toJSON();
        historyBackside.length = historyBacksideIndex + 1;
    }
    //saveStateLS();
}

function undo() {
    if (currentGroup === front) {
        if (historyIndex > 0) {
            historyIndex--;
            loadState(layer, history[historyIndex]);
        }
    } else {
        if (historyBacksideIndex > 0) {
            historyBacksideIndex--;
            loadState(back, historyBackside[historyBacksideIndex]);
        }
    }
}

function redo() {
    if (currentGroup === front) {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            loadState(layer, history[historyIndex]);
        }
    } else {
        if (historyBacksideIndex < historyBackside.length - 1) {
            historyBacksideIndex++;
            loadState(back, historyBackside[historyBacksideIndex]);
        }
    }
}

function saveStateLS() {
    const state = history[historyIndex];
    const backsideState = historyBackside[historyBacksideIndex];
    localStorage.setItem("state", JSON.stringify(state));
    localStorage.setItem("backside", JSON.stringify(backsideState));
}

function getStateLS() {
    if (localStorage.getItem("state")) {
        return JSON.parse(localStorage.getItem("state"));
    }
}

function getBacksideState() {
    if (localStorage.getItem("backside")) {
        return JSON.parse(localStorage.getItem("backside"));
    }
}

function getBarcodeNumber() {
    return barcodeImg.attrs.number;
}

function getImages() {
    return images;
}

function getSelectedImages() {
    return selectedImages;
}

function setBarcodeImg(img) {
    barcodeImg = img;
}

export { stage, layer, handleState, saveState, barcodeImg, setBarcodeImg, switchSides, getBacksideState, getStateLS, getBarcodeNumber, getImages, getSelectedImages, loadStateFromTemplate };