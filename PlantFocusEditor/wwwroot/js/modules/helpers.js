import { findWidthPassePartout, findHeightPassePartout } from "./passePartout.js";

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
    const diffWidth = findWidthPassePartout(path.data()) - path.width();
    const diffHeight = findHeightPassePartout(path.data()) - path.height();
    return [diffWidth, diffHeight];
}

function isValidJson(json) {
    try {
        JSON.parse(json);
    } catch (e) {
        return false;
    }
    return true;
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export { isValidJson, uuidv4 }