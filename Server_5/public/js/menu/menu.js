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