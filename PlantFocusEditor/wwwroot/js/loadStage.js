function loadStageFromJson(json) {
    const $container = document.getElementById("konva-container");
    const stage = new Konva.Stage({
        container: $container,
        width: $container.parentElement.clientWidth,
        height: $container.parentElement.clientHeight
    });

    const layer = Konva.Layer();

}