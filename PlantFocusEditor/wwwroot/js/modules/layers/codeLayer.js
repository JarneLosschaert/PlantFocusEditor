import { tr, currentGroup } from "../constants.js";
import { addHoverAnimation } from "../animations.js";

function addBarcode(value) {
    value = value.toString();
    const canvas = document.createElement("canvas");

    JsBarcode(canvas, value, {
        format: "CODE128"
    });

    const img = new Image(
        canvas.width,
        canvas.height
    );
    img.src = canvas.toDataURL("image/png");
    img.onload = function () {
        const barcodeImg = new Konva.Image({
            x: 0,
            y: 0,
            height: img.height,
            width: img.width,
            image: img,
            src: img.src,
            height: 100, //img.height,
            width: 100, //img.width,
            code: value,
            name: "barcode",
            draggable: true,
            stroke: "#000000",
            strokeWidth: 0,
            shadowBlur: 10,
            shadowOffset: { x: 5, y: 5 },
            shadowOpacity: 0,
        });

        addHoverAnimation(barcodeImg);
        currentGroup.add(barcodeImg);
    }
}

function addQRCode(src, value) {
    value = value.toString();

    const img = new Image();
    img.src = src;
    img.onload = function () {
        const kimg = new Konva.Image({
            name: "qrcode",
            image: img,
            src: src,
            height: img.height,
            width: img.width,
            code: value,
            width: 100,
            height: 100,
            draggable: true,
            margin: 30,
            stroke: "#000000",
            strokeWidth: 0,
            shadowBlur: 10,
            shadowOffset: { x: 5, y: 5 },
            shadowOpacity: 0,
        });

        addHoverAnimation(kimg);
        currentGroup.add(kimg);
    }
}

export { addBarcode, addQRCode };