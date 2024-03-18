import { findWidthPassePartout, findHeightPassePartout } from "./passePartout.js";

function convertJsonToKonva(stage, layer, json) {
    const group = Konva.Node.create(json.Group);
    let offsetX;
    group.children.forEach((child, i, arr) => {
        const node = Konva.Node.create(child);
        if (node.getClassName() === "Path") {
            resizePath(stage, node);
            offsetX = stage.width() / 2 - node.width() / 2;
            group.y(10);
        } else if (node.getClassName() === "Image") {
            const src = node.attrs.src;
            const img = new Image();
            img.src = src;
            node.image(img);
        } else if (node.getClassName() === "Shape") {
            node.sceneFunc(sceneFunc);
        }
        arr[i] = node;
    });
    group.x(offsetX);
    group.children.forEach(child => child.x(child.x() + offsetX));
    layer.add(group);
}

function resizePath(stage, path) {
    let newHeight = stage.height() + 1;
    let newWidth;
    while (newHeight > stage.height()) {
        const r = findWidthPassePartout(path.data()) / findHeightPassePartout(path.data());
        newWidth = findWidthPassePartout(path.data()) - 2;
        newHeight = newWidth / r;
        path.width(newWidth);
        path.height(newHeight);
    }
}

function isValidJson(json) {
    try {
        JSON.parse(json);
    } catch (e) {
        return false;
    }
    return true;
}

export { convertJsonToKonva, isValidJson }