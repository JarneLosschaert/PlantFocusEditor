import { stage } from "./state.js";
import { addHoverAnimation } from "./animations.js";
import { tr, currentGroup } from "./constants.js";

const removedImages = [];

function addImage(id, src) {
    const images = currentGroup.children.filter(child => child.getClassName() === "Image");
    const imageToRemove = images.find(image => image.attrs.id === id);
    if (imageToRemove) {
        removedImages.push(imageToRemove);
        imageToRemove.remove();
        return;
    }
    const image = removedImages.find(image => image.attrs.id === id);
    if (image) {
        currentGroup.add(image);
        return;
    }
    const img = new Image();
    img.src = src;
    const kimg = new Konva.Image({
        name: "img",
        image: img,
        src: img.src,
        id: id,
        width: 100,
        height: 100,
        draggable: true,
        margin: 30,
        stroke: "#000000",
        strokeWidth: 0,
        shadowBlur: 10,
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0,
        locked: false
    });
    currentGroup.add(kimg);
    addHoverAnimation(kimg);
}

function removeImage(id) {
    const imageNodes = stage.find((node) => node.attrs.id === id);
    imageNodes.forEach(node => {
        node.destroy();
    });
    tr.nodes([]);
}

export { addImage, removeImage, removedImages };
