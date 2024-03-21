import { handleState, stage } from "./modules/state.js";
import { handleSelections } from "./modules/selectionHandling.js";

function init() {
    handleState();
    handleSelections();
    console.log(stage);
}

function updateHeightWidthStage() {
    const $konvaContainer = document.getElementById("konva-container");
    stage.width($konvaContainer.clientWidth);
    stage.height($konvaContainer.clientHeight);
}

export { init, updateHeightWidthStage }