import { tr } from "../constants.js";

function handleBarcodeChange(value) {
    value = value.toString();

    const canvas = document.createElement("canvas");

    JsBarcode(canvas, value, {
        format: "CODE128"
    });

    const img = new Image();
    img.src = canvas.toDataURL("image/png");

    img.onload = function () {

        const selectedNodes = tr.nodes();
        selectedNodes.forEach((node) => {
            if (node.attrs.name === "barcode") {
                const width = node.width();
                const scale = width / img.width;

                img.width *= scale;
                img.height *= scale;

                node.image(img);
                node.setAttrs({
                    code: value,
                    src: img.src,
                    width: img.width,
                    height: img.height
                });
            }
        });
    }
}

function handleQrCodeChange(src, value) {
    value = value.toString();

    const img = new Image();
    img.src = src;

    img.onload = function () {
        const selectedNodes = tr.nodes();
        selectedNodes.forEach((node) => {
            if (node.attrs.name === "qrcode") {
                const width = node.width();
                const scale = width / img.width;

                img.width *= scale;
                img.height *= scale;

                node.image(img);
                node.setAttrs({
                    code: value,
                    src: src,
                    width: img.width,
                    height: img.height
                });
            }
        });
    }

}

function getValues() {
    const firstNode = tr.nodes()[0];
    return {
        code: firstNode.attrs.code,
    };
}

export { getValues, handleBarcodeChange, handleQrCodeChange }