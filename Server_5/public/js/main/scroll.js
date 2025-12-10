const PADDING_Y = 10;

// 각 listParent마다 독립적인 스크롤 기능을 초기화하는 함수
function initCustomScroll(listParent) {
    const list = listParent.querySelector('.list');
    const scrollBar = listParent.parentElement.querySelector('.scrollBar');

    // 요소가 없으면 건너뜀
    if (!list || !scrollBar) return;

    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;

    // 1. 스크롤바 위치 업데이트 (리스트 스크롤 -> 스크롤바 이동)
    function updateScrollPosition() {
        // 숨겨진 상태면 계산하지 않음
        if (listParent.classList.contains('disable') || list.clientHeight === 0) return;

        const contentHeight = list.scrollHeight;
        const clientHeight = list.clientHeight;
        const scrollTop = list.scrollTop;

        const trackHeight = clientHeight - (PADDING_Y * 2);
        const availableScrollTrack = trackHeight - scrollBar.offsetHeight;

        // 0으로 나누기 방지
        if (contentHeight <= clientHeight) return;

        const scrollRatio = scrollTop / (contentHeight - clientHeight);
        const newTop = PADDING_Y + (scrollRatio * availableScrollTrack);

        scrollBar.style.transform = `translateY(${newTop}px)`;
    }

    // 2. 스크롤바 크기 및 표시 여부 업데이트
    function updateScrollbarSize() {
        // 숨겨진 상태면 계산하지 않음
        if (listParent.classList.contains('disable') || list.clientHeight === 0) {
            scrollBar.style.display = 'none';
            return;
        }

        const contentHeight = list.scrollHeight;
        const clientHeight = list.parentElement.clientHeight;
        const trackHeight = clientHeight - (PADDING_Y * 2);

        console.log(contentHeight);
        console.log(clientHeight);
        // 내용이 짧아서 스크롤이 필요 없는 경우
        if (contentHeight <= clientHeight) {
            scrollBar.style.display = 'none';
        } else {
            scrollBar.style.display = 'block';
            // 약간의 딜레이 후 opacity 적용 (CSS transition 자연스럽게)
            requestAnimationFrame(() => {
                scrollBar.style.opacity = '1';
            });
        }

        let scrollBarHeight = (clientHeight / contentHeight) * trackHeight;
        scrollBarHeight = Math.max(scrollBarHeight, 30); // 최소 높이 30px
        scrollBarHeight = Math.min(scrollBarHeight, trackHeight);

        scrollBar.style.height = `${scrollBarHeight}px`;
        updateScrollPosition();
    }

    // 3. 이벤트 리스너: 리스트 스크롤 시
    list.addEventListener('scroll', updateScrollPosition);

    // 4. 드래그 기능 구현
    const onMouseMove = (e) => {
        if (!isDragging) return;

        const deltaY = e.clientY - startY;
        const contentHeight = list.scrollHeight;
        const clientHeight = list.clientHeight;

        const trackHeight = clientHeight - (PADDING_Y * 2);
        const availableScrollTrack = trackHeight - scrollBar.offsetHeight;

        if (availableScrollTrack <= 0) return;

        const scrollRatio = deltaY / availableScrollTrack;
        
        // 스크롤바 이동 -> 리스트 스크롤 위치 변경
        list.scrollTop = startScrollTop + (scrollRatio * (contentHeight - clientHeight));
    };

    const onMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            scrollBar.classList.remove('active');
            document.body.style.userSelect = '';
            
            // 전역 이벤트 제거 (성능 최적화)
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    };

    scrollBar.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        startY = e.clientY;
        startScrollTop = list.scrollTop;
        
        scrollBar.classList.add('active');
        document.body.style.userSelect = 'none';

        // 드래그 중에만 전역 이벤트 연결
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // 5. Observer 설정

    // (A) 내용물 변경 감지 (데이터 로딩 등)
    const listObserver = new MutationObserver(() => updateScrollbarSize());
    listObserver.observe(list, { childList: true, subtree: true, characterData: true });

    // (B) 크기 변경 및 표시 상태 변경 감지 (ResizeObserver)
    // 탭을 눌러서 disable이 풀리고 display: block이 될 때 자동으로 감지하여 실행됨
    const resizeObserver = new ResizeObserver(() => {
        updateScrollbarSize();
    });
    resizeObserver.observe(listParent); // 부모 크기 변화 감지
    
    // 초기 실행
    updateScrollbarSize();
}

// === 실행 ===
document.addEventListener('DOMContentLoaded', () => {
    const listParents = document.querySelectorAll('.listParent');
    listParents.forEach(parent => {
        initCustomScroll(parent);
    });
});