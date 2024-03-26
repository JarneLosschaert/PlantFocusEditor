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

function calcLinearGradient(shapeInfo) {
    const shapeGradientStartPoint = shapeInfo.fillLinearGradientStartPoint();
    const shapeGradientEndPoint = shapeInfo.fillLinearGradientEndPoint();
    const shapeGradientColorStops = shapeInfo.fillLinearGradientColorStops();

    const startColorRgbString = shapeGradientColorStops[1];
    const endColorRgbString = shapeGradientColorStops[3];
    const startColor = startColorRgbString.match(/\d+/g);
    const endColor = endColorRgbString.match(/\d+/g);

    startColor.forEach((el, i, arr) => arr[i] = parseInt(el));
    endColor.forEach((el, i, arr) => arr[i] = parseInt(el));
    const angleRadians = calcGradientAngle(shapeGradientStartPoint, shapeGradientEndPoint);
    const length = calcGradientLength(shapeGradientStartPoint, shapeGradientEndPoint);

    // Calculate gradient vector components
    var dx = Math.cos(angleRadians);
    var dy = Math.sin(angleRadians);

    // Calculate color step components
    var dr = (endColor[0] - startColor[0]) / length;
    var dg = (endColor[1] - startColor[1]) / length;
    var db = (endColor[2] - startColor[2]) / length;

    // Initialize gradient array
    var gradient = [];    

    // Iterate over each point along the gradient line
    for (var i = 0; i < length; i++) {
        // Calculate position along the gradient line
        var x = i * dx;
        var y = i * dy;

        // Calculate color components at this point
        var r = startColor[0] + i * dr;
        var g = startColor[1] + i * dg;
        var b = startColor[2] + i * db;

        // Add color and shape info to gradient array
        gradient.push({
            color: [r, g, b],
            shape: {
                x: shapeInfo.x() + x,
                y: shapeInfo.y() + y,
                /*gradientStart: {
                    x: shapeGradientStartPointX + x,
                    y: shapeGradientStartPointY + y
                },
                gradientEnd: {
                    x: shapeGradientEndPointX + x,
                    y: shapeGradientEndPointY + y
                }*/
            }
        });
    }

    return gradient;
}

function calcGradientAngle(startPoint, endPoint) {
    // Calculate the differences in x and y coordinates
    var dx = endPoint.x - startPoint.x;
    var dy = endPoint.y - startPoint.y;

    // Calculate the angle in radians
     return Math.atan2(dy, dx);
}

function calcGradientLength(startPoint, endPoint) {
    // Calculate the differences in x and y coordinates
    var dx = endPoint.x - startPoint.x;
    var dy = endPoint.y - startPoint.y;

    // Calculate the length using the Pythagorean theorem
    var length = Math.sqrt(dx * dx + dy * dy);

    return length;
}


export { isValidJson, uuidv4, convertToSVGPath, calcLinearGradient }