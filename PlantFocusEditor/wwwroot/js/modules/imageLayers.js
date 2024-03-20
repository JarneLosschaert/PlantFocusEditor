import { stage } from "./state.js";
import { addHoverAnimation } from "./animations.js";
import { tr, currentGroup } from "./constants.js";

function addImage(src) {
    const img = new Image();
    img.src = src;
    const kimg = new Konva.Image({
        name: "img",
        image: img,
        src: img.src,
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

export { addImage, removeImage };
