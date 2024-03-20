let scrollReference = null;

export function setScrollReference(reference) {
    scrollReference = reference;
}

export function scrollLeft(scrollAmount, id) {
    var element = document.getElementById(id);
    element.scrollBy({
        top: 0, left: -scrollAmount * Math.floor((element.offsetWidth / scrollAmount)), behavior: "smooth"
    });
};

export function scrollRight(scrollAmount, id) {
    var element = document.getElementById(id);
    element.scrollBy({
        top: 0, left: scrollAmount * Math.floor((element.offsetWidth / scrollAmount)), behavior: "smooth"
    });
};

export function handleScrollEventListener(id) {
    var element = document.getElementById(id);
    element.addEventListener('scroll', function () {
        var scrollState = "middle";
        var scrollLeft = Math.ceil(element.scrollLeft);
        var scrollWidth = element.scrollWidth;
        var clientWidth = element.clientWidth;

        if (scrollLeft == 0) {
            scrollState = "start";
        } else if (scrollLeft + clientWidth >= scrollWidth) {
            scrollState = "end";
        }
        if (id == "shapes-list") {
            scrollReference.invokeMethodAsync('UpdateScrollStateShapes', scrollState);
        } else {
            scrollReference.invokeMethodAsync('UpdateScrollStateIcons', scrollState);
        }
    });
};
