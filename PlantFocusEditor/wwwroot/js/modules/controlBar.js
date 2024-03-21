import { tr, selectionRectangle, hoverTr, currentGroup } from "./constants.js";
import { removeBarcode } from "./barcodeLayer.js";
import { addHoverAnimation } from "./animations.js";
import { uuidv4 } from "./helpers.js";
import { removedImages } from "./imageLayers.js";

let imagesReference = null;

const setReference = (ref) => imagesReference = ref;

function deleteNodes() {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => {
        if (node.attrs.name === "barcode") {
            removeBarcode();
        } else if (node.getClassName() === "Image") {
            removedImages.push(node);
            node.remove();
        } else {
            node.destroy();
        }
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
            imagesReference.invokeMethodAsync("CloneImage", newId, node.attrs.src);
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