let imageIndex = 0;
const dots = document.querySelectorAll('.imageCount .dot');
const arrows = document.querySelectorAll('.prevImage .arrow');

window.onload = () => {
    for(let i = 0; i < dots.length; i++) {
        dots[i].onclick = () => {
            dotClicked(i);
        }
    }
    arrows[0].onclick = () => arrowClicked(-1);
    arrows[1].onclick = () => arrowClicked(1);
    dotClicked(0);
}

function dotClicked(i) {
    dots[imageIndex].classList.remove('active')
    imageIndex = i;
    dots[imageIndex].classList.add('active')
}

function arrowClicked(i) {
    i = imageIndex + i;
    if(i < 0) i = dots.length - 1;
    else if(i >= dots.length) i = 0;
    dotClicked(i);
}