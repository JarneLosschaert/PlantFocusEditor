import { stage, layer } from './state.js';
import { front, back } from './constants.js';

const MARGIN_HEIGHT = 20;

function handlePassePartout() {
    loadSVG('../../passepartouts/S098.svg', function (svgContent) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, "text/xml");
        const pathData = svgDoc.querySelector('path').getAttribute('d');

        const passePartout = new Konva.Path({
            data: pathData,
            fill: 'white',
        });
        const passePartoutClone = new Konva.Path({
            data: pathData,
            fill: 'white',
        });

        front.x(stage.width() / 2 - findWidthPassePartout(pathData) / 2);
        front.y(MARGIN_HEIGHT / 2);
        const clipFunc = createClipFunc(pathData);
        front.clipFunc(clipFunc);
        front.add(passePartout);

        back.x(stage.width() / 2 - findWidthPassePartout(pathData) / 2);
        back.y(MARGIN_HEIGHT / 2);
        back.clipFunc(clipFunc);
        back.add(passePartoutClone);
        layer.add(front);
    });
}

function clipFunc(ctx, pathData) {
    ctx.beginPath();
    const commands = getScaledCommands(pathData);
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        switch (command.command) {
            case 'M':
                ctx.moveTo(command.points[0], command.points[1]);
                break;
            case 'L':
                ctx.lineTo(command.points[0], command.points[1]);
                break;
            case 'C':
                ctx.bezierCurveTo(
                    command.points[0],
                    command.points[1],
                    command.points[2],
                    command.points[3],
                    command.points[4],
                    command.points[5]
                );
                break;
            case 'Z':
                ctx.closePath();
                break;
        }
    }
    ctx.closePath();
}

function createClipFunc(additionalParameter) {
    return function (ctx) {
        clipFunc(ctx, additionalParameter);
    }
}

function loadSVG(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(xhr.responseText);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function getScaledCommands(pathData) {
    const height = stage.height() - MARGIN_HEIGHT;
    const heightPath = findHeightPassePartout(pathData);
    const scale = height / heightPath;
    const commands = Konva.Path.parsePathData(pathData);
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        for (let j = 0; j < command.points.length; j += 2) {
            command.points[j] *= scale;
            command.points[j + 1] *= scale;
        }
    }
    return commands
}

function findHeightPassePartout(pathData) {
    const commands = Konva.Path.parsePathData(pathData);
    let maxY = 0;
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        for (let j = 0; j < command.points.length; j += 2) {
            if (command.points[j + 1] > maxY) {
                maxY = command.points[j + 1];
            }
        }
    }
    return maxY;
}

function findWidthPassePartout(pathData) {
    const commands = Konva.Path.parsePathData(pathData);
    let maxX = 0;
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        for (let j = 0; j < command.points.length; j += 2) {
            if (command.points[j] > maxX) {
                maxX = command.points[j];
            }
        }
    }
    return maxX;
}

export { handlePassePartout, findWidthPassePartout, findHeightPassePartout, createClipFunc, getScaledCommands };