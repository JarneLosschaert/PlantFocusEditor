import { getScaledWidthAndHeight } from "./passePartout.js";

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

function degToRad(deg) {
    return deg / 180 * Math.PI;
}

function getCenterPassePartout(template) {
    const [width, height] = getScaledWidthAndHeight(template);
    return {
        x: template.x() + width / 2,
        y: template.y() + height / 2
    };
}

export { isValidJson, uuidv4, getCenterPassePartout }