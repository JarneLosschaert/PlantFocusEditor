import { convertJsonToKonva, isValidJson } from "./modules/helpers.js";
import { stage, layer } from "./modules/state.js";

function loadStageFromJson(json) {
    layer.destroyChildren();
    if (isValidJson(json)) {
        const group = JSON.parse(json);
        convertJsonToKonva(stage, layer, group);
    } else {
        console.log("json is invalid");
    }
}

export { loadStageFromJson };