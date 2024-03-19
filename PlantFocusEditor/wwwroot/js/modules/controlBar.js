import { tr, selectionRectangle, hoverTr, currentGroup } from "./constants.js";
import { removeBarcode } from "./barcodeLayer.js";

let controlBarReference = null;
let imageLayerReference = null;

function setControlBarReference(reference) {
    controlBarReference = reference;
}

function setImageLayerReference(ref) {
    imageLayerReference = ref;
}

function deleteNodes() {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => {
        if (node.attrs.name === "barcode") {
            removeBarcode();
        }
        if (node.attrs.name === "img") {
            imageLayerReference.invokeMethodAsync("RemoveImage", node.attrs.id);
        }
        node.destroy();
    });
    tr.nodes([]);
}

function changePosition(forward, full) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => {
        if (forward && full) {
            node.moveToTop();
        }
        if (!forward && full) {
            node.zIndex(1);
        }
        if (forward && !full) {
            node.moveUp();
        }
        if (!forward && !full) {
            if (node.zIndex() > 1) {
                node.moveDown();
            }
        }
    });
    hoverTr.moveToTop();
    tr.moveToTop();
    selectionRectangle.moveToTop();
}

function cloneNode() {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => {
        if (node.getClassName() === "Image") {
            const oldId = node.attrs.id;
            const newId = uuidv4();
            imageLayerReference.invokeMethodAsync("DuplicateImage", oldId, newId);
            const clone = node.clone({
                x: node.x() + 10,
                y: node.y() + 10,
                id: newId
            });
            currentGroup.add(clone);
        } else {
            const clone = node.clone({
                x: node.x() + 10,
                y: node.y() + 10
            });
            currentGroup.add(clone);
        }
    });
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function lockNode() {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => {
        node.locked = !node.locked;
        node.draggable(!node.draggable());
    });
    const locked = selectedNodes.every(node => node.locked);
    tr.rotateEnabled(!locked);
    tr.resizeEnabled(!locked);
}
function displayControlBar() {
    const selectedNodes = tr.nodes();
    if (selectedNodes.length > 0) {
        controlBarReference.invokeMethodAsync('displayControlBar', true, areDifferentNodes());
    } else {
        controlBarReference.invokeMethodAsync('displayControlBar', false, areDifferentNodes());
    }
    updateControlBarValues();
}

function areDifferentNodes() {
    const selectedNodes = tr.nodes();

    const hasOnlyText = selectedNodes.every(node =>
        node.attrs.name === "text"
    );

    const hasOnlyImagesShapes = selectedNodes.every(node =>
        node.attrs.name === "img" || node.attrs.name === "shape"
    );

    return !(hasOnlyText || hasOnlyImagesShapes);
}
function updateControlBarValues() {
    const selectedNodes = tr.nodes();
    if (selectedNodes.length > 0) {
        const firstNode = selectedNodes[0];
        controlBarReference.invokeMethodAsync('updateControlBarValues', firstNode.draggable())
    }
}

export { displayControlBar, setControlBarReference, deleteNodes, changePosition, cloneNode, lockNode, setImageLayerReference };