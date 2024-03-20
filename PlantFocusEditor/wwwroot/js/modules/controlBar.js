import { tr, selectionRectangle, hoverTr, currentGroup } from "./constants.js";
import { removeBarcode } from "./barcodeLayer.js";
import { addHoverAnimation } from "./animations.js";

let dotnetRefence = null;

function setReference(ref) {
    dotnetRefence = ref;
}

function deleteNodes() {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => {
        if (node.attrs.name === "barcode") {
            removeBarcode();
            return;
        }
        if (node.getClassName() === "Image") {
            dotnetRefence.invokeMethodAsync("RemoveImage", node.attrs.id);
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
            const newId = uuidv4();
            const clone = node.clone({
                x: node.x() + 10,
                y: node.y() + 10,
                id: newId,
                locked: node.attrs.locked
            });
            currentGroup.add(clone);
            clone.off("mouseover");
            clone.off("mouseout");
            addHoverAnimation(clone);
            console.log(node.attrs.src);
            dotnetRefence.invokeMethodAsync("AddImage", newId, node.attrs.src);
        } else {
            const clone = node.clone({
                x: node.x() + 10,
                y: node.y() + 10,
                locked: node.attrs.locked
            });
            currentGroup.add(clone);
            clone.off("mouseover");
            clone.off("mouseout");
            addHoverAnimation(clone);
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
        node.attrs.locked = !node.attrs.locked;
        node.draggable(!node.draggable());
    });
    const locked = selectedNodes.every(node => node.attrs.locked);
    tr.rotateEnabled(!locked);
    tr.resizeEnabled(!locked);
}

function getIsLocked() {
    const selectedNodes = tr.nodes();
    return selectedNodes.every(node => node.attrs.locked);
}

export { deleteNodes, changePosition, cloneNode, lockNode, getIsLocked, setReference };