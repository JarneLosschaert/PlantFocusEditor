import { tr, hoverTr, selectionRectangle, currentGroup } from "./constants.js";
import { stage, layer } from "./state.js";
import { deleteNodes } from "./controlBar.js";

let x1, y1, x2, y2;
let selecting = false;

function handleSelections() {
    tr.nodes([]);
    tr.remove();
    selectionRectangle.remove();
    layer.add(selectionRectangle);
    addSelectionRectangle();
    layer.add(tr);
    layer.add(hoverTr);
    handleEventListeners();
}

function handleEventListeners() {
    document.addEventListener("keydown", removeLayer);
    stage.on("mousedown touchstart", handleSelectionStart);
    stage.on("mousemove touchmove", handleSelectionMove);
    stage.on("mouseup touchend", handleSelectionEnd);
    stage.on("click tap", handleSelection);
}

function removeLayer(event) {
    if (event.keyCode === 46) {
        deleteNodes();
    }
}

function addSelectionRectangle() {
    layer.add(selectionRectangle);
}

function handleSelectionStart(e) {
    if (e.target == stage || e.target.attrs.name === "passepartout") {
        e.evt.preventDefault();
        x1 = stage.getPointerPosition().x;
        y1 = stage.getPointerPosition().y;
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;
        selectionRectangle.width(0);
        selectionRectangle.height(0);
        selecting = true;
    }
}

function handleSelectionMove(e) {
    if (!selecting) {
        return;
    }
    e.evt.preventDefault();
    x2 = stage.getPointerPosition().x;
    y2 = stage.getPointerPosition().y;
    selectionRectangle.setAttrs({
        visible: true,
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
    });
}

function handleSelectionEnd(e) {
    selecting = false;
    if (!selectionRectangle.visible()) {
        return;
    }
    e.evt.preventDefault();
    selectionRectangle.visible(false);
    const shapes = stage.find(
        (node) => node.attrs.name === "text" || node.attrs.name === "img" || node.attrs.name === "barcode" || node.attrs.name === "shape"
    );
    const box = selectionRectangle.getClientRect();
    const selected = shapes.filter((shape) =>
        Konva.Util.haveIntersection(box, shape.getClientRect())
    );
    tr.nodes(selected);
    toggleLock();
    hoverTr.nodes([]);
}

function handleSelection(e) {
    tr.moveToTop();
    selectionRectangle.moveToTop();
    hoverTr.moveToTop();
    if (selectionRectangle.visible()) {
        return;
    }
    if (e.target === stage) {
        tr.nodes([]);
        return;
    }
    if (
        !e.target.hasName("text") &&
        !e.target.hasName("img") &&
        !e.target.hasName("barcode") &&
        !e.target.hasName("shape") &&
        !e.target.hasName("qrcode")
    ) {
        return;
    }
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr.nodes().indexOf(e.target) >= 0;
    if (!metaPressed && !isSelected) {
        tr.nodes([e.target]);
        toggleLock();
    } else if (metaPressed && isSelected) {
        const nodes = tr.nodes().slice();
        nodes.splice(nodes.indexOf(e.target), 1);
        tr.nodes(nodes);
        toggleLock();
    } else if (metaPressed && !isSelected) {
        const nodes = tr.nodes().concat([e.target]);
        tr.nodes(nodes);
        toggleLock();
    }
    hoverTr.nodes([]);
}

function toggleLock() {
    const nodes = tr.nodes();
    const locked = nodes.every(node => node.attrs.locked);
    tr.resizeEnabled(!locked);
    tr.rotateEnabled(!locked);
}

export { handleSelections, addSelectionRectangle };
