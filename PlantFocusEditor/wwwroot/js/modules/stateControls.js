import { layer, getGroupJson, loadGroup } from "./state.js";
import { currentGroup, front, back, setCurrentGroup } from "./constants.js";
import { findHeightPath } from "./passePartout.js";
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
    const height = findHeightPath(currentGroup.children[0].data());
    if (currentGroup.offsetY() === 0) {
        currentGroup.offsetY(height);
    } else {
        currentGroup.offsetY(0);
    }
    currentGroup.scaleY(-currentGroup.scaleY());
}

function undo() {
    let group;
    if (currentGroup === front) {
        if (historyFrontIndex > 0) {
            historyFrontIndex--;
            const json = JSON.parse(historyFront[historyFrontIndex]);
            group = getGroupJson(json);
            loadGroup(group);
        }
    } else {
        if (historyBackIndex > 0) {
            historyBackIndex--;
            const json = JSON.parse(historyBack[historyBackIndex]);
            group = getGroupJson(json);
            loadGroup(group, false);
        }
    }
}

function redo() {
    let group;
    if (currentGroup === front) {
        if (historyFrontIndex < historyFront.length - 1) {
            historyFrontIndex++;
            const json = JSON.parse(historyFront[historyFrontIndex]);
            group = getGroupJson(json);
            loadGroup(group);
        }
    } else {
        if (historyBackIndex < historyBack.length - 1) {
            historyBackIndex++;
            const json = JSON.parse(historyBack[historyBackIndex]);
            group = getGroupJson(json);
            loadGroup(group, false);
        }
    }
}

function saveState(e) {
    if (e) {
        const target = e.target;
        if (target.closest(".undo-redo")) {
            return;
        }
    }
    
    if (historyFront[historyFrontIndex] !== front.toJSON()) {
        if (historyFront[historyFrontIndex] !== undefined) {
            historyFrontIndex++;
        }
        historyFront[historyFrontIndex] = front.toJSON();
        historyFront.length = historyFrontIndex + 1;
    }

    if (historyBack[historyBackIndex] !== back.toJSON()) {
if (historyBack[historyBackIndex] !== undefined) {
            historyBackIndex++;
        }
        historyBack[historyBackIndex] = back.toJSON();
        historyBack.length = historyBackIndex + 1;
    }
    //saveStateLS();
}

function saveStateLS() {
    const frontState = historyFront[historyFrontIndex];
    const backState = historyBack[historyBackIndex];
    localStorage.setItem("front", JSON.stringify(frontState));
    localStorage.setItem("back", JSON.stringify(backState));
}

function getValues() {
    return {
        undoPossible: getUndoPossible(),
        redoPossible: getRedoPossible()
    };
}

function getUndoPossible() {
    if (currentGroup === front) {
        return historyFrontIndex > 0;
    } else {
        return historyBackIndex > 0;
    }
    return true;
}

function getRedoPossible() {
    if (currentGroup === front) {
        return historyFrontIndex < historyFront.length - 1;
    } else {
        return historyBackIndex < historyBack.length - 1;
    }
}

export { switchSides, flip, undo, redo, saveState, getValues };