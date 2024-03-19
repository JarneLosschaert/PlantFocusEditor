let tr = new Konva.Transformer({
    name: 'tr',
});

let hoverTr = new Konva.Transformer({
    name: 'hoverTr',
    resizeEnabled: false,
    rotateEnabled: false,
});

let selectionRectangle = new Konva.Rect({
    name: "selectionRectangle",
    fill: "rgba(0,0,255,0.5)",
    visible: false,
});

let front = new Konva.Group();
let back = new Konva.Group();
let currentGroup = front;

function changeTr(newTr) {
    tr = newTr;
}

function changeHoverTr(newHoverTr) {
    hoverTr = newHoverTr;
}

function changeSelectionRectangle(newSelectionRectangle) {
    selectionRectangle = newSelectionRectangle;
}

function setFront(newGroup) {
    front = newGroup;
}

function setBack(newGroup) {
    back = newGroup;
}

function setCurrentGroup(isFront) {
    if (isFront) {
        currentGroup = front;
    } else {
        currentGroup = back;
    }
}

export { tr, changeTr, hoverTr, front, setFront, back, setBack, changeHoverTr, selectionRectangle, changeSelectionRectangle, currentGroup, setCurrentGroup };