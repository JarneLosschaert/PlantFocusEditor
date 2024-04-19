import { currentGroup } from "../constants.js";
import { addHoverAnimation } from "../animations.js";
import { findWidthPath, findHeightPath } from "../passePartout.js";

function addElement(svg) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svg, "text/xml");
    const path = xmlDoc.getElementsByTagName("path")[0];
    const originalWidth = findWidthPath(path.getAttribute("d"));
    const originalHeight = findHeightPath(path.getAttribute("d"));

    const element = new Konva.Path({
        x: 50,
        y: 50,
        width: originalWidth,
        height: originalHeight,
        name: "element",
        data: path.getAttribute("d"),
        stroke: "#000000",
        strokeWidth: 0,
        draggable: true,
        shadowBlur: 10,
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0,
        shadowForStrokeEnabled: false,
        hitStrokeWidth: 0,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: originalWidth, y: 0 },
        fillLinearGradientColorStops: [0, "#45ac34", 0.5, "#45ac34", 1, "#c6d300"],
    });

    const pathBoundingBox = element.getClientRect();
    const pathWidth = pathBoundingBox.width;
    element.scaleX(150 / pathWidth);
    element.scaleY(150 / pathWidth);

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
