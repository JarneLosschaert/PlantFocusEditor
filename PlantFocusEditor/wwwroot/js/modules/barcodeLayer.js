import { tr, currentGroup } from "./constants.js";
import { addHoverAnimation } from "./animations.js";
import { barcodeImg } from "./state.js";


function createBarcode(inputValue) {
    if (inputValue === "") {
        removeBarcode();
    } else {
        inputValue = inputValue.toString();
        generateBarcode(inputValue);
    }
}

function generateBarcode(value) {
    const canvas = document.createElement("canvas");

    JsBarcode(canvas, value, {
        format: "CODE128"
    });

    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    if (barcodeImg.attrs.src === "") {
        currentGroup.add(barcodeImg);
    }

    barcodeImg.attrs.src = img.src;
    barcodeImg.image(img);
    barcodeImg.attrs.number = value
    addHoverAnimation(barcodeImg);
    tr.forceUpdate();
}

function addQRCode(src) {
    currentGroup.children.forEach(child => {
        if (child.attrs.name === "qrcode") {
            child.destroy();
        }
    });
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
    currentGroup.add(kimg);
    tr.forceUpdate();
}

function removeBarcode() {
    barcodeImg.remove();
    barcodeImg.attrs.number = "";
    barcodeImg.attrs.src = "";
    tr.nodes([]);
    document.getElementById("barcodeInput").value = "";
}

export { removeBarcode, createBarcode, addQRCode };