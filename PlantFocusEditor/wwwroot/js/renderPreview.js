import { findWidthPath, findHeightPath } from "./modules/passePartout.js";
import { sceneFunc } from "./modules/layers/elementLayer.js";
import { isValidJson } from "./modules/helpers.js";

function renderPreviewFromJson(jsonToRender) {
    const container = document.createElement("div");
    if (!isValidJson(jsonToRender)) return "";
    const json = JSON.parse(jsonToRender);

    if (json.length !== 2) {
        return "";
    }
    let width;
    let height;

    const layer = new Konva.Layer();
    const group = Konva.Node.create(json[0].Group);

    group.children.forEach((child, i, arr) => {
        const node = Konva.Node.create(child);
        arr[i] = node;
        if (node.getClassName() === "Path") {
            width = findWidthPath(node.data());
            height = findHeightPath(node.data());
        } else if (node.getClassName() === "Image") {
            const src = node.attrs.src;
            const img = new Image();
            img.src = src;
            node.image(img);
        } else if (node.getClassName() === "Shape") {
            node.sceneFunc(sceneFunc);
        }
    });

    layer.add(group);
    const stage = new Konva.Stage({
        container: container,
        width: width, //(template.widthMillimeters * 72) / 25.4,
        height: height //(template.heightMillimeters * 72) / 25.4
    });
    stage.add(layer);

    const dataUrl = stage.toDataURL({ pixelRatio: 2 });
    container.remove();
    return dataUrl;
}



export { renderPreviewFromJson };