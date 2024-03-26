import { currentGroup } from "../constants.js";
import { addHoverAnimation } from "../animations.js";
import { findHeightPassePartout } from "../passePartout.js";
function addElement(svg) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svg, "text/xml");
    const path = xmlDoc.getElementsByTagName("path")[0];
    const fillColor = path.getAttribute("fill");

    const element = new Konva.Path({
        name: "element",
        data: path.getAttribute("d"),
        fill: fillColor,
        stroke: "#000000",
        strokeWidth: 0,
        draggable: true,
        scaleX: 3,
        scaleY: 3,
        shadowBlur: 10,
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0,
        shadowForStrokeEnabled: false,
        hitStrokeWidth: 0,
        locked: false,
    });

    currentGroup.add(element);
    addHoverAnimation(element);
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

export { addElement, sceneFunc };
