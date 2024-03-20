import { stage } from "./state.js";
import { addHoverAnimation } from "./animations.js";
import { tr, currentGroup, front, back } from "./constants.js";

function addImage(id, src) {
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

function getAllImages() {
    const images = {}
    getImages(front, images);
    getImages(back, images);
    return images;
}

function getImages(group, images) {
    group.children.forEach(child => {
        if (child.getClassName() === "Image" && child.attrs.name !== "qrcode" && child.attrs.name !== "barcode") {
            images[child.attrs.id] = child.attrs.src;
        }
    });
}

export { addImage, removeImage, getAllImages };
