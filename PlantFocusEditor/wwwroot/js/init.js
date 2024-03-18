import { layer, handleState, stage } from "./modules/state.js";
import { handleSelections } from "./modules/selectionHandling.js";
import { handleShapeLayers } from "./modules/shapeLayers.js";
//import { handlePdf } from "./modules/saveToPdf.js";
import { handlePassePartout } from "./modules/passePartout.js";

function init() {
    handleState();
    handleShapeLayers();
    handleSelections();
    //handlePdf();
    /*const hasNoGroups = !layer.children.some(node => node.getClassName() === "Group");
    if (hasNoGroups) {
        console.log("No groups");
        handlePassePartout();
    }*/
    console.log(stage);
}

function updateHeightWidthStage() {
    const $konvaContainer = document.getElementById("konva-container");
    stage.width($konvaContainer.clientWidth);
    stage.height($konvaContainer.clientHeight);
}

export { init, updateHeightWidthStage }