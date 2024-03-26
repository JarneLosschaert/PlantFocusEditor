import { tr } from "../constants.js";
import { layer } from "../state.js";

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

function getValues() {
    const firstNode = tr.nodes()[0];
    return {
        src: firstNode.attrs.src
    };
}

export { changeImage, getValues }
