import { currentGroup } from "../constants.js";
import { addHoverAnimation } from "../animations.js";

function addRectangle() {
    const rectangle = new Konva.Rect({
        name: "shape",
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 4,
        draggable: true,
        shadowBlur: 10,
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0,
        shadowForStrokeEnabled: false,
        hitStrokeWidth: 0,
        locked: false
    });
    currentGroup.add(rectangle);
    addHoverAnimation(rectangle);
}

function addCircle() {
    const circle = new Konva.Ellipse({
        name: "shape",
        x: 60,
        y: 60,
        radiusX: 50,
        radiusY: 50,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 4,
        draggable: true,
        shadowBlur: 10,
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0,
        shadowForStrokeEnabled: false,
        hitStrokeWidth: 0,
        locked: false
    });
    currentGroup.add(circle);
    addHoverAnimation(circle);
}

function addTriangle() {
    const triangle = new Konva.Shape({
        name: "shape",
        x: 10,
        y: 10,
        sides: 3,
        width: 100,
        height: 100,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 4,
        draggable: true,
        shadowBlur: 10,
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0,
        shadowForStrokeEnabled: false,
        hitStrokeWidth: 0,
        sceneFunc: sceneFunc,
        locked: false
    });
    currentGroup.add(triangle);
    addHoverAnimation(triangle);
}

function sceneFunc(context, shape) {
    var width = shape.width();
    var height = shape.height();

    // Calculate the coordinates of the triangle points
    var x1 = 0;
    var y1 = height;
    var x2 = width / 2;
    var y2 = 0;
    var x3 = width;
    var y3 = height;

    // Define the path for the triangle
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.closePath();

    // Fill the triangle
    context.fillStrokeShape(shape);
}

export { addRectangle, addCircle, addTriangle, sceneFunc };
