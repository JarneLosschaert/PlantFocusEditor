import { tr, hoverTr, currentGroup } from "../constants.js";

function getLayers() {
    var layers = [];

    currentGroup.children.forEach(child => {
        if (child.attrs.name !== "passepartout") {
            let type = child.getClassName();
            const id = child._id;
            let value = "";
            if (type === "Text") {
                value = child.text();
            } else if (type === "Image") {
                value = child.attrs.src;
                if (child.attrs.name === "barcode") {
                    type = "Code";
                    value = "Barcode";
                } else if (child.attrs.name === "qrcode") {
                    type = "Code";
                    value = "QR code";
                }
            } else if (type === "Group") {
                value = "Properties";
            } else if (type === "Path") {
                value = "Shape";
            }
            const object = { id, type, value };
            layers.push(object);
        }
    });

    return JSON.stringify(layers);
}

function moveLayerUp(id) {
    const index = currentGroup.children.findIndex(child => child._id === id);
    if (index > 0) {
        currentGroup.children[index].moveUp();
    }
    tr.nodes([]);
}

function moveLayerDown(id) {
    const index = currentGroup.children.findIndex(child => child._id === id);
    if (index < currentGroup.children.length) {
        currentGroup.children[index].moveDown();
    }
    tr.nodes([]);
}

function hoverLayer(id) {
    const layer = currentGroup.children.find(child => child._id === id);
    const selected = tr.nodes().find(child => child._id === id);
    if (!selected) {
        hoverTr.nodes([layer]);
    }
}

function hoverOutLayer() {
    hoverTr.nodes([]);
}

function selectLayer(id) {
    const layer = currentGroup.children.find(child => child._id === id);
    hoverTr.nodes([]);
    tr.nodes([layer]);
}


export { getLayers, moveLayerUp, moveLayerDown, hoverLayer, selectLayer, hoverOutLayer }