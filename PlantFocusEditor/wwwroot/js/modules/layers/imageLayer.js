import { addHoverAnimation } from "../animations.js";
import { currentGroup } from "../constants.js";

function addImage(src) {
    const img = new Image();
    img.src = src;

    img.onload = function () {

        const width = 200;
        const scale = width / img.width;

        const kimg = new Konva.Image({
            name: "image",
            image: img,
            src: img.src,
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
        });
        currentGroup.add(kimg);
        addHoverAnimation(kimg);
    };
}

export { addImage };
