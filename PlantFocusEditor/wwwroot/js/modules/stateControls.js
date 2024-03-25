import { layer, loadState } from "./state.js";
import { currentGroup, front, back, setCurrentGroup } from "./constants.js";
import { findHeightPassePartout } from "./passePartout.js";
import { handleSelections } from "./selectionHandling.js";

const historyFront = [];
const historyBack = [];
let historyFrontIndex = 0;
let historyBackIndex = 0;

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

function flip() {
    const height = findHeightPassePartout(currentGroup.children[0].data());
    if (currentGroup.offsetY() === 0) {
        currentGroup.offsetY(height);
    } else {
        currentGroup.offsetY(0);
    }
    currentGroup.scaleY(-currentGroup.scaleY());
}

function undo() {
    if (currentGroup === front) {
        if (historyFrontIndex > 0) {
            historyFrontIndex--;
            loadState(historyFront[historyFrontIndex]);
        }
    } else {
        if (historyBackIndex > 0) {
            historyBackIndex--;
            loadState(historyBack[historyBackIndex]);
        }
    }
}

function redo() {
    if (currentGroup === front) {
        if (historyFrontIndex < historyFront.length - 1) {
            historyFrontIndex++;
            loadState(historyFront[historyFrontIndex]);
        }
    } else {
        if (historyBackIndex < historyBack.length - 1) {
            historyBackIndex++;
            loadState(historyBack[historyBackIndex]);
        }
    }
}

function saveState() {
    if (historyFront[historyFrontIndex] !== layer.toJSON()) {
        historyFrontIndex++;
        historyFront[historyFrontIndex] = layer.toJSON();
        historyFront.length = historyFrontIndex + 1;
    }
    if (historyBack[historyBackIndex] !== back.toJSON()) {
        historyBackIndex++;
        historyBack[historyBackIndex] = back.toJSON();
        historyBack.length = historyBackIndex + 1;
    }
    //saveStateLS();
}

function saveStateLS() {
    const state = historyFront[historyFrontIndex];
    const backsideState = historyBack[historyBackIndex];
    localStorage.setItem("front", JSON.stringify(state));
    localStorage.setItem("back", JSON.stringify(backsideState));
}

export { switchSides, flip, undo, redo, saveState };