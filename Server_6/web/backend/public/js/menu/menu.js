const navLinks = document.querySelectorAll('.nav-center a');
const sections = document.querySelectorAll('section[id]');

// 1. 클릭 이벤트 리스너 설정 (클릭 시 중앙 스크롤 및 active 즉시 적용)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        e.preventDefault();
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // 클릭 시 바로 active 클래스를 적용하여 시각적 피드백 제공
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
        }
    });
});


// 2. Intersection Observer 설정 (스크롤 시 active 클래스 동기화)
const observerOptions = {
    root: null,
    // 뷰포트 중앙 60% 영역을 기준으로 감지 (-20% ~ -80%까지)
    rootMargin: "-20% 0px -20% 0px",
    threshold: 0.4 
};

const observer = new IntersectionObserver((entries) => {
    // 현재 화면에 진입한 모든 섹션 중, 뷰포트 중앙에 가장 가까운 섹션을 찾습니다.
    let activeId = null;
    let closestCenter = Infinity;

    entries.forEach(entry => {
        const targetRect = entry.target.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;

        // 섹션의 중앙 위치
        const sectionCenter = targetRect.top + targetRect.height / 2;

        // 섹션 중앙과 뷰포트 중앙 간의 거리
        const distanceFromCenter = Math.abs(viewportCenter - sectionCenter);

        if (entry.isIntersecting && distanceFromCenter < closestCenter) {
            closestCenter = distanceFromCenter;
            activeId = `#${entry.target.id}`;
        }
    });

    // 가장 가까운 섹션에 active 클래스 적용
    if (activeId) {
        navLinks.forEach(link => link.classList.remove('active'));
        const correspondingLink = document.querySelector(`.nav-center a[href="${activeId}"]`);
        if (correspondingLink) {
            correspondingLink.classList.add('active');
        }
    }

    // 스크롤이 최상단일 때 Home 강제 active 처리
    if (window.scrollY === 0) {
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector('.nav-center a[href="#first"]').classList.add('active');
    }

}, observerOptions);

// 모든 섹션에 대해 감시자 등록
sections.forEach(section => {
    observer.observe(section);
});

const container = document.querySelector('.first .thumb');
const beforeImg = container.querySelector('.imgBefore');
const handle = container.querySelector('.handle');
const controller = container.querySelector('.handleController');

let isDragging = false;

// 드래그 시작
const startDrag = (e) => {
    isDragging = true;
    container.classList.add('active'); // 필요시 스타일링 활용
};

// 드래그 종료
const stopDrag = () => {
    isDragging = false;
    container.classList.remove('active');
};

// 움직임 처리 (핵심 로직)
const move = (e) => {
    if (!isDragging) return;

    // 마우스 또는 터치 이벤트의 X 좌표 가져오기
    let clientX = e.clientX || e.touches[0].clientX;

    // 컨테이너의 위치 정보 가져오기
    const rect = container.getBoundingClientRect();

    // 컨테이너 내부에서의 X 좌표 계산
    let x = clientX - rect.left;

    // 핸들이 컨테이너 밖으로 나가지 않도록 제한 (0 ~ 컨테이너 너비)
    if (x < 0) x = 0;
    if (x > rect.width - 10) x = rect.width - 10;

    // 백분율 계산
    const percent = (x / rect.width) * 100;

    // 1. 핸들과 컨트롤러 위치 이동
    handle.style.left = `${percent}%`;
    controller.style.left = `${percent}%`;

    // 2. Before 이미지 클리핑 (왼쪽 0%부터 현재 %지점까지만 보여줌)
    // polygon(좌상, 우상, 우하, 좌하)
    beforeImg.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
};

// 이벤트 리스너 등록
// 마우스 이벤트
controller.addEventListener('mousedown', startDrag);
window.addEventListener('mouseup', stopDrag);
window.addEventListener('mousemove', move);

// 터치 이벤트 (모바일 지원)
controller.addEventListener('touchstart', startDrag);
window.addEventListener('touchend', stopDrag);
window.addEventListener('touchmove', move);