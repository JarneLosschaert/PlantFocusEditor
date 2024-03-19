import { findWidthPassePartout, findHeightPassePartout, createClipFunc } from "./passePartout.js";
import { setFront, setCurrentGroup } from "./constants.js";

function convertJsonToKonva(stage, layer, json) {
    const group = Konva.Node.create(json.Group);
    let offsetX;
    let clipFunc;
    group.children.forEach((child, i, arr) => {
        const node = Konva.Node.create(child);
        if (node.getClassName() === "Path") {
            clipFunc = createClipFunc(node.data());
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
    group.clipFunc(clipFunc);
    layer.add(group);
    setFront(group);
    setCurrentGroup(true);
}

function resizePath(stage, path) {
    let newHeight = stage.height() + 1;
    let newWidth;
    let i = 0;
    const r = findWidthPassePartout(path.data()) / findHeightPassePartout(path.data());
    while (newHeight > stage.height()) {
        newWidth = findWidthPassePartout(path.data()) - i;
        newHeight = newWidth / r;
        path.width(newWidth);
        path.height(newHeight);
        i++
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