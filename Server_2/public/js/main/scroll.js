const list = document.querySelector('.list');
const scrollBar = document.querySelector('.scrollBar');

const PADDING_Y = 10;

function updateScrollPosition() {
    const contentHeight = list.scrollHeight;
    const clientHeight = list.clientHeight;
    const scrollTop = list.scrollTop;

    const trackHeight = clientHeight - (PADDING_Y * 2);
    const availableScrollTrack = trackHeight - scrollBar.offsetHeight;
    
    const scrollRatio = scrollTop / (contentHeight - clientHeight);

    const newTop = PADDING_Y + (scrollRatio * availableScrollTrack);
    
    scrollBar.style.transform = `translateY(${newTop}px)`;
}

function updateScrollbarSize() {
    const contentHeight = list.scrollHeight;
    const clientHeight = list.clientHeight;

    console.log(clientHeight)
    console.log(contentHeight)

    const trackHeight = clientHeight - (PADDING_Y * 2);

    if (contentHeight <= clientHeight) {
        console.log("NOTHING")
        scrollBar.style.display = 'none';
        return;
    } else {
        console.log("DO IT")
        scrollBar.style.display = 'block';
        scrollBar.style.opacity = '1';
    }

    let scrollBarHeight = (clientHeight / contentHeight) * trackHeight;

    scrollBarHeight = Math.max(scrollBarHeight, 30);
    scrollBarHeight = Math.min(scrollBarHeight, trackHeight); 

    scrollBar.style.height = `${scrollBarHeight}px`;
    updateScrollPosition();
}

list.addEventListener('scroll', updateScrollPosition);

let _isDragging = false;
let startY = 0;
let startScrollTop = 0;

scrollBar.addEventListener('mousedown', (e) => {
    e.preventDefault(); 
    _isDragging = true;
    startY = e.clientY;
    startScrollTop = list.scrollTop;
    scrollBar.classList.add('active');
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!_isDragging) return;

    const deltaY = e.clientY - startY;
    const contentHeight = list.scrollHeight;
    const clientHeight = list.clientHeight;

    const trackHeight = clientHeight - (PADDING_Y * 2);
    const availableScrollTrack = trackHeight - scrollBar.offsetHeight;

    if (availableScrollTrack <= 0) return;

    const scrollRatio = deltaY / availableScrollTrack;

    list.scrollTop = startScrollTop + (scrollRatio * (contentHeight - clientHeight));
});

document.addEventListener('mouseup', () => {
    if (_isDragging) {
        _isDragging = false;
        scrollBar.classList.remove('active');
        document.body.style.userSelect = '';
    }
});

updateScrollbarSize();
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateScrollbarSize, 350);
});

const listObserver = new MutationObserver(() => updateScrollbarSize());
listObserver.observe(list, { childList: true, subtree: true, characterData: true });