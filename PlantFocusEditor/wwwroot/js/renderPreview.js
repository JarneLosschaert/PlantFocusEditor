function renderPreviewFromJson(jsonToRender) {
    const container = document.createElement("div");
    if (!isValidJson(jsonToRender)) return "";
    const json = JSON.parse(jsonToRender);

    if (json.Group === undefined) {
        return "";
    }
    let width;
    let height;
    
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

    const dataUrl = stage.toDataURL({ pixelRatio: 2 });
    container.remove();
    return dataUrl;
}

function isValidJson(json) {
    try {
        JSON.parse(json);
    } catch (e) {
        return false;
    }
    return true;
}

function sceneFunc(context, shape) {
    const width = shape.width();
    const height = shape.height();

    // Calculate the coordinates of the triangle points
    const x1 = 0;
    const y1 = height;
    const x2 = width / 2;
    const y2 = 0;
    const x3 = width;
    const y3 = height;
    shape.setAttrs({
        x1: x1,
        x2: x2,
        x3: x3,
        y1: y1,
        y2: y2,
        y3: y3
    });
    // Define the path for the triangle
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.closePath();

    // Fill the triangle
    context.fillStrokeShape(shape);
}

function findHeightPassePartout(pathData) {
    const commands = Konva.Path.parsePathData(pathData);
    let maxY = 0;
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        for (let j = 0; j < command.points.length; j += 2) {
            if (command.points[j + 1] > maxY) {
                maxY = command.points[j + 1];
            }
        }
    }
    return maxY;
}

function findWidthPassePartout(pathData) {
    const commands = Konva.Path.parsePathData(pathData);
    let maxX = 0;
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        for (let j = 0; j < command.points.length; j += 2) {
            if (command.points[j] > maxX) {
                maxX = command.points[j];
            }
        }
    }
    return maxX;
}

export { renderPreviewFromJson };