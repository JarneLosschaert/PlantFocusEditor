import { tr, currentGroup } from "./constants.js";
import { addHoverAnimation } from "./animations.js";
import { barcodeImg, qrcodeImg } from "./state.js";


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
    if (src === "") {
        removeQRCode();
        return;
    }
    const img = new Image();
    img.src = src;
    if (qrcodeImg.attrs.src === "") {
        currentGroup.add(qrcodeImg);
    }
    qrcodeImg.attrs.src = src;
    qrcodeImg.image(img);
    addHoverAnimation(qrcodeImg);
    tr.forceUpdate();
}

function removeBarcode() {
    barcodeImg.remove();
    barcodeImg.attrs.number = "";
    barcodeImg.attrs.src = "";
    tr.nodes([]);
    document.getElementById("barcodeInput").value = "";
}

function removeQRCode() {
    qrcodeImg.remove();
    qrcodeImg.attrs.src = "";
    tr.nodes([]);
    document.getElementById("qrcodeInput").value = "";
}

export { removeBarcode, createBarcode, addQRCode, removeQRCode };