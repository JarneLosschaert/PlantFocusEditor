import { tr, hoverTr, selectionRectangle, currentGroup } from "./constants.js";
import { stage, layer } from "./state.js";
import { deleteNodes } from "./styling/control.js";

let x1, y1, x2, y2;
let selecting = false;
let hasSelected = false;

function handleSelections() {
    tr.nodes([]);
    tr.remove();
    layer.add(selectionRectangle);
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

    const box = selectionRectangle.getClientRect();
    const shapes = currentGroup.find(
        (node) => node.attrs.name === "text" ||
            node.attrs.name === "image" ||
            node.attrs.name === "barcode" ||
            node.attrs.name === "qrcode" ||
            node.attrs.name === "element" ||
            node.attrs.name === "propertiesGroup"
    );

    const selected = shapes.filter((shape) =>
        haveIntersection(shape.getClientRect(), box)
    );
    tr.nodes(selected);
    hasSelected = true;
    ToggleTr();
}

function haveIntersection(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function handleSelection(e) {
    console.log(e.target);
    tr.moveToTop();
    selectionRectangle.moveToTop();
    hoverTr.moveToTop();
    if (selectionRectangle.visible()) {
        return;
    }
    if (e.target === stage || e.target.attrs.name === "passepartout") {
        if (hasSelected) {
            hasSelected = false;
        } else {
            tr.nodes([]);
        }
    }
    console.log(e.target.getParent());

    if (e.target.getParent().attrs.name === "rowGroup") {
        tr.nodes([e.target.getParent().getParent()]);
        ToggleTr();
        return;
    }

    if (
        !e.target.hasName("text") &&
        !e.target.hasName("image") &&
        !e.target.hasName("barcode") &&
        !e.target.hasName("element") &&
        !e.target.hasName("qrcode")
    ) {
        return;
    }
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr.nodes().indexOf(e.target) >= 0;
    if (!metaPressed && !isSelected) {
        tr.nodes([e.target]);
    } else if (metaPressed && isSelected) {
        const nodes = tr.nodes().slice();
        nodes.splice(nodes.indexOf(e.target), 1);
        tr.nodes(nodes);
    } else if (metaPressed && !isSelected) {
        const nodes = tr.nodes().concat([e.target]);
        tr.nodes(nodes);
    }
    ToggleTr();
}

function ToggleTr() {
    toggleResize();
    toggleLock();
    hoverTr.nodes([]);
}

function toggleResize() {
    const selectedNodes = tr.nodes();
    const locked = selectedNodes.some(node => node.attrs.name === "image" || node.attrs.name === "qrcode" || node.attrs.name === "barcode");
    if (locked) {
        const enabledAnchers = ["top-left", "top-right", "bottom-left", "bottom-right"];
        tr.enabledAnchors(enabledAnchers);
    } else {
        const enabledAnchers = ["top-left", "top-right", "bottom-left", "bottom-right", "top-center", "bottom-center", "middle-left", "middle-right"];
        tr.enabledAnchors(enabledAnchers);
    }
}

function toggleLock() {
    const selectedNodes = tr.nodes();
    const locked = selectedNodes.some(node => !node.draggable());
    tr.rotateEnabled(!locked);
    tr.resizeEnabled(!locked);
}

export { handleSelections, toggleLock };
