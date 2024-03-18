import { findWidthPassePartout, findHeightPassePartout } from "./passePartout.js";

function convertJsonToKonva(stage, layer, json) {
    const group = Konva.Node.create(json.Group);
    group.children.forEach((child, i, arr) => {
        const node = Konva.Node.create(child);
        arr[i] = node;
        if (node.getClassName() === "Path") {
            resizePath(stage, node);
            group.x(stage.width() / 2 - findWidthPassePartout(node.data()) / 2);
            group.y(10);
        } else if (node.getClassName() === "Image") {
            const src = node.attrs.src;
            const img = new Image();
            img.src = src;
            node.image(img);
        } else if (node.getClassName() === "Shape") {
            node.sceneFunc(sceneFunc);
        }
    });

    layer.add(group);
    stage.add(layer);
}

function resizePath(stage, path) {
    const newWidth = stage.width() / 3;
    const r = findWidthPassePartout(path.data()) / findHeightPassePartout(path.data());
    const newHeight = newWidth / r;
    path.width(newWidth);
    path.height(newHeight);
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