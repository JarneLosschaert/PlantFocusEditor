import { tr, currentGroup } from "./constants.js";
import { stage } from "./state.js";
import { selectAnimation, addHoverAnimation } from "./animations.js";
import { findWidthPassePartout, findHeightPassePartout } from "./passePartout.js";

export function createTextLayer(size = 16) {
    const path = currentGroup.children.find(node => node.getClassName() === "Path");
    const pathData = path.data();
    const text = new Konva.Text({
        name: "text",
        text: "New text",
        fontSize: size,
        draggable: true,
        width: 250,
        height: "auto",
        padding: 10,
        align: "center",
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0,
        locked: false
    });
    text.x(findWidthPassePartout(pathData) / 2 - text.width() / 2);
    text.y(findHeightPassePartout(pathData) / 2 - text.height() / 2);
    currentGroup.add(text);
    addHoverAnimation(text);
    handleTextEventListeners(text);
}

function handleTextEventListeners(text) {
    text.on("transform", onTransfromText);
    text.on("dblclick dbltap", function () {
        onEditText(this);
    });
}

function onTransfromText() {
    const minWidth = this.fontSize() * 2;
    const minHeight = this.fontSize() * 1.5;
    this.setAttrs({
        width: Math.max(this.width() * this.scaleX(), minWidth),
        height: Math.max(this.height() * this.scaleY(), minHeight),
        scaleX: 1,
        scaleY: 1,
    });
}

function onEditText(text) {
    const flickerAnimation = selectAnimation(tr);
    text.hide();

    const textPosition = text.absolutePosition();
    const areaPosition = {
        x: stage.container().offsetLeft + textPosition.x,
        y: stage.container().offsetTop + textPosition.y,
    };
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    textarea.value = text.text();
    textarea.style.position = "absolute";
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.width = `${text.width() - text.padding() * 2}px`;
    textarea.style.height = `${text.height() - text.padding() * 2 + 5}px`;
    textarea.style.fontSize = `${text.fontSize()}px`;
    textarea.style.border = "none";
    textarea.style.padding = `${text.padding()}px`;
    textarea.style.margin = "0px";
    textarea.style.overflow = "hidden";
    textarea.style.background = "none";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.lineHeight = text.lineHeight();
    textarea.style.fontFamily = text.fontFamily();
    textarea.style.transformOrigin = "left top";
    textarea.style.textAlign = text.align();
    textarea.style.color = text.fill();
    textarea.style.opacity = text.opacity();
    let rotation = text.rotation();
    if (text.fontStyle() === "italic" || text.fontStyle() === "bold italic") {
        textarea.style.fontStyle = "italic";
    }
    if (text.fontStyle() === "bold" || text.fontStyle() === "bold italic") {
        textarea.style.fontWeight = "bold";
    }
    let transform = "";
    if (rotation) {
        transform += "rotateZ(" + rotation + "deg)";
    }

    let px = 0;
    const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    if (isFirefox) {
        px += 2 + Math.round(text.fontSize() / 20);
    }
    transform += "translateY(-" + px + "px)";

    textarea.style.transform = transform;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + 3 + "px";
    textarea.focus();

    function removeTextarea() {
        textarea.parentNode.removeChild(textarea);
        window.removeEventListener("click", handleOutsideClick);
        text.show();
        tr.show();
        tr.forceUpdate();
        flickerAnimation.stop();
    }

    textarea.addEventListener("keydown", function (e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            text.text(textarea.value);
            removeTextarea();
        }
        if (e.keyCode === 27) {
            removeTextarea();
        }
    });

    function handleOutsideClick(e) {
        if (e.target !== textarea) {
            text.text(textarea.value);
            removeTextarea();
        }
    }
    setTimeout(() => {
        window.addEventListener("click", handleOutsideClick);
    });
}

export { handleTextEventListeners };
