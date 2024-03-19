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
    console.log(barcodeImg);
}

function removeBarcode() {
    barcodeImg.remove();
    barcodeImg.attrs.number = "";
    barcodeImg.attrs.src = "";
    tr.nodes([]);
    document.getElementById("barcodeInput").value = "";
}

export { removeBarcode, createBarcode };