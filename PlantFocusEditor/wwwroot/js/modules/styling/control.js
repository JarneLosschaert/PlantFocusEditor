import { tr, selectionRectangle, hoverTr, currentGroup } from "../constants.js";
import { addHoverAnimation } from "../animations.js";
import { toggleLock } from "../selectionHandling.js";

function deleteNodes() {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => {
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
        const clone = node.clone({
            x: node.x() + 10,
            y: node.y() + 10,
            locked: node.attrs.locked
        });
        currentGroup.add(clone);
        clone.off("mouseover");
        clone.off("mouseout");
        addHoverAnimation(clone);
    });
}

function lockNode() {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach(node => {
        const locked = node.draggable();
        node.draggable(!locked);
    });
    toggleLock();
}

function getValues() {
    const selectedNodes = tr.nodes();
    return {
        locked: selectedNodes.some(node => !node.draggable()),
    };

}

export { deleteNodes, changePosition, cloneNode, lockNode, getValues };