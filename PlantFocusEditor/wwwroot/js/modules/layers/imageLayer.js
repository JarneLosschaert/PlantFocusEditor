import { addHoverAnimation } from "../animations.js";
import { currentGroup } from "../constants.js";

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

export { addImage };
