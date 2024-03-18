function convertJsonToKonva(stage, json) {
    const layer = new Konva.Layer();
    const group = Konva.Node.create(json.Group);

    group.children.forEach((child, i, arr) => {
        const node = Konva.Node.create(child);
        arr[i] = node;
        if (node.getClassName() === "Path") {
            width = findWidthPassePartout(node.data());
            height = findHeightPassePartout(node.data());
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
}