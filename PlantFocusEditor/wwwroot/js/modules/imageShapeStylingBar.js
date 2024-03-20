import { tr } from "./constants.js";
import { layer } from "./state.js";

let imageShapeStylingBarReference = null;
let imageLayerReference = null;

function setImageShapeStylingBarReference(reference) {
    imageShapeStylingBarReference = reference;
}

function setImageLayerReference(ref) {
    imageLayerReference = ref;
}

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
        //imageLayerReference.invokeMethodAsync("ChangeImage", img.attrs.id, src);
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

function displayImageShapeStylingBar() {
    const selectedNodes = tr.nodes();
    const onlyImages = selectedNodes.length > 0 && selectedNodes.every(node => node.getClassName() === "Image");
    const onlyShapes = selectedNodes.length > 0 && selectedNodes.every(node => node.attrs.name === "shape");
    //imageShapeStylingBarReference.invokeMethodAsync('displayImageShapeStylingBar', onlyImages, onlyShapes);
    //updateStylingBarValues();
}

/*function updateStylingBarValues() {
    const selectedNodes = tr.nodes();
    if (selectedNodes.length > 0) {
        const firstNode = selectedNodes[0];
        if (firstNode.getClassName() === "Image" || firstNode.attrs.name === "shape") {
            let fill = firstNode.fill();
            if (fill === undefined) fill = "#000000";
            imageShapeStylingBarReference.invokeMethodAsync('updateImageShapeStylingBarValues',
                fill, firstNode.stroke(), firstNode.strokeWidth(),
                firstNode.opacity(), firstNode.shadowOpacity(), Math.round(firstNode.width()), Math.round(firstNode.height())
            );
        }
    }
}*/

export { displayImageShapeStylingBar, setImageShapeStylingBarReference, changeImage, updateDimensionsOnInput, handleShapeColorChange, setImageLayerReference };
