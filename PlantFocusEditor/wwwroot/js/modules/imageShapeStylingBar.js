import { tr } from "./constants.js";
import { layer } from "./state.js";

/*function addTransformEventListener() {
    tr.on('transformend', () => {
        const nodes = tr.nodes();
        nodes.forEach(node => {
            const className = node.getClassName();
            if (className === "Ellipse") {
                const newRadiusX = Math.round(node.radiusX() * node.scaleX());
                const newRadiusY = Math.round(node.radiusY() * node.scaleY());
                node.radiusX(newRadiusX);
                node.radiusY(newRadiusY);
                imageShapeStylingBarReference.invokeMethodAsync("updateWithHeight", newRadiusX, newRadiusY);
            } else if (className === "Shape" || className === "Image") {
                const newWidth = Math.round(node.width() * node.scaleX());
                const newHeight = Math.round(node.height() * node.scaleY());
                node.width(newWidth);
                node.height(newHeight);
                imageShapeStylingBarReference.invokeMethodAsync("updateWidthHeight", newWidth, newHeight);
            }
            node.scaleX(1);
            node.scaleY(1);
        })
    });
}*/

function updateDimensionsOnInput(value, isWidth) {
    if (value !== 0) {
        const selectedImages = tr.nodes();
        selectedImages.forEach(img => {
            if (isWidth) {
                img.width(value);
            } else {
                img.height(value);
            }
        });
    }
}

function changeImage(src) {
    const selectedImages = tr.nodes();
    selectedImages.forEach(img => {
        const newImg = new Image();
        newImg.src = src;
        img.image(newImg);
        img.attrs.src = src;
    });
    layer.batchDraw();
}

function handleShapeColorChange(color) {
    const selectedNodes = tr.nodes();
    selectedNodes.forEach((node) => {
        if (node.attrs.name === "shape") {
            node.fill(color);
        }
    });
}

function getFillColor() {
    const firstNode = tr.nodes()[0];
    return firstNode.fill();
}

function getSource() {
    const firstNode = tr.nodes()[0];
    return firstNode.attrs.src;
}

export { changeImage, updateDimensionsOnInput, handleShapeColorChange, getFillColor, getSource };
