import { hoverTr, tr } from "./constants.js";
import { stage } from "./state.js";

function selectAnimation(node) {
    const flickering = new Konva.Tween({
        node: node,
        opacity: 0.2,
        duration: 0.7,
        yoyo: true,
    });
    flickering.play();

    if (node.className === 'Transformer') {
        node.resizeEnabled(false);
        node.rotateEnabled(false);
    }
    return {
        stop: function () {
            flickering.destroy();
            node.opacity(1);

            if (node.className === 'Transformer') {
                node.resizeEnabled(true);
                node.rotateEnabled(true);
            }
        }
    };
}

function addIncomingAnimation(node) {
    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;
    const centerOffsetX = centerX - node.width() / 2;
    const centerOffsetY = centerY - node.height() / 2;
    node.x(centerOffsetX);
    const tween = new Konva.Tween({
        node: node,
        y: centerOffsetY,
        duration: 0.5,
        easing: Konva.Easings.ElasticEaseOut,
        onFinish: function () {
            tween.destroy()
        }
    });
    tween.play();
}

function addHoverAnimation(node) {
    node.on("mouseover", function () {
        node.getStage().container().style.cursor = "pointer";
        const selectedNodes = tr.nodes();
        const selected = selectedNodes.find(n => n === node);
        if (!selected) {
            hoverTr.nodes([node]);
        }
        node.on("mouseout", function () {
            node.getStage().container().style.cursor = "default";
            hoverTr.nodes([]);
        });
    });
}

export { selectAnimation, addHoverAnimation, addIncomingAnimation };  