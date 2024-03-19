function generateQRCode(url) {
    const $canvas = document.createElement("canvas");
    new QRCode($div, url);
    return $canvas.toDataURL();
}

export { generateQRCode };