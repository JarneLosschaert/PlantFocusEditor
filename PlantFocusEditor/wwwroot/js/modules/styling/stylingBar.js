import { tr } from "../constants.js";

function getSelectedItemType() {
    const selected = tr.nodes();
    const isSelected = selected.length > 0;
    if (isSelected && selected.every(el => el.getClassName() === "Text")) {
        return "Text";
    }
    if (isSelected && selected.every(el => el.attrs.name === "image")) {
        return "Image";
    }
    if (isSelected && selected.every(el => el.attrs.name === "element")) {
        return "Element";
    }
    if (isSelected && selected.every(el => el.attrs.name === "barcode" || el.attrs.name === "qrcode")) {
        return "Code";
    }
    if (isSelected) {
        return "Selecting";
    }
    return "";
}

export { getSelectedItemType }