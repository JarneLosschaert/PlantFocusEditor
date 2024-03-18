window.scrollFunction = function (scrollAmount, className) {
    var content = document.querySelector(`.${className}`);
    var currentScrollAmount = parseFloat(content.style.getPropertyValue('--scroll-amount'));
    content.style.setProperty('--scroll-amount', `${currentScrollAmount + scrollAmount}px`);
    content.style.animation = 'scroll 0.5s linear';
    setTimeout(() => {
        content.style.animation = 'none';
    }, 500);
}
