import { tr, currentGroup } from "../constants.js";
import { addHoverAnimation } from "../animations.js";

function addBarcode(inputValue) {
    inputValue = inputValue.toString();
    const canvas = document.createElement("canvas");

    JsBarcode(canvas, value, {
        format: "CODE128"
    });

    const barcodeImg = new Konva.Image({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        name: "barcode",
        number: "",
        draggable: true,
        src: "",
        stroke: "#000000",
        strokeWidth: 0,
        shadowBlur: 10,
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0,
        locked: false
    });

    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    if (barcodeImg.attrs.src === "") {
        currentGroup.add(barcodeImg);
    }

    barcodeImg.attrs.src = img.src;
    barcodeImg.image(img);
    barcodeImg.attrs.number = value;

    currentGroup.add(barcodeImg);

    addHoverAnimation(barcodeImg);
    tr.forceUpdate();
}

function addQRCode(src) {
    const img = new Image();
    img.src = src;
    const kimg = new Konva.Image({
        name: "qrcode",
        image: img,
        src: src,
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
    addHoverAnimation(kimg);
    currentGroup.add(kimg);
    tr.forceUpdate();
}

export { addBarcode, addQRCode };