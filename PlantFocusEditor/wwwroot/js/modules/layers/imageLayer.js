import { addHoverAnimation } from "../animations.js";
import { currentGroup } from "../constants.js";

function addImage(id, src) {
    const img = new Image();
    img.src = src;

    const scale = 200 / img.height;

    const kimg = new Konva.Image({
        name: "image",
        image: img,
        src: img.src,
        id: id,
        height: img.height,
        width: img.width,
        scaleX: scale,
        scaleY: scale,
        draggable: true,
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

export { addImage };
