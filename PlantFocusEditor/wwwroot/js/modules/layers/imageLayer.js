import { addHoverAnimation } from "../animations.js";
import { currentGroup } from "../constants.js";

function addImage(src) {
    const img = new Image();
    img.src = src;

    img.onload = function () {

        const kimg = new Konva.Image({
            x: 10,
            y: 10,
            name: "image",
            image: img,
            src: img.src,
            height: 100,
            width: 100,
            scaleX: 1,
            scaleY: 1,
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
    };
}

export { addImage };
