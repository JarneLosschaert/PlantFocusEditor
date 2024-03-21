import { findWidthPassePartout } from "./passePartout.js";

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
    const width = findWidthPassePartout(template);
    const height = findHeightPassePartout(template);
    return {
        x: template.x() + width / 2,
        y: template.y() + height / 2
    };
}

function convertToSVGPath(commands) {
    let pathData = '';
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command.command === 'M') {
            pathData += `M${command.points[0]},${command.points[1]}`;
        } else if (command.command === 'L') {
            pathData += `L${command.points[0]},${command.points[1]}`;
        } else if (command.command === 'C') {
            pathData += `C${command.points[0]},${command.points[1]},${command.points[2]},${command.points[3]},${command.points[4]},${command.points[5]}`;
        } else if (command.command === 'z' || command.command === 'Z') {
            pathData += 'Z';
        }
    }
    return pathData;
}

export { isValidJson, uuidv4, getCenterPassePartout, convertToSVGPath }