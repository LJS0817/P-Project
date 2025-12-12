let imageIndex = 0;
let dots = []; // 동적으로 생성되므로 let으로 선언

window.onload = () => {
    initSlider();
}

function initSlider() {
    const dotContainer = document.querySelector('.imageCount');
    const projectImage = document.getElementById('projectImage');
    const arrows = document.querySelectorAll('.prevImage .arrow');

    // 1. 데이터가 없으면 예외 처리 (빈 화면 or 기본 이미지)
    if (!recentImagesData || recentImagesData.length === 0) {
        projectImage.innerHTML = `<p>${document.textData['adminDatabaseEmptyMsg']}</p>`;
        return;
    }

    // 2. 데이터 개수만큼 Dot 생성
    dotContainer.innerHTML = ''; // 초기화
    recentImagesData.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.onclick = () => dotClicked(i);
        dotContainer.appendChild(dot);
    });

    // 3. 생성된 Dot들을 다시 선택
    dots = document.querySelectorAll('.imageCount .dot');

    // 4. 화살표 이벤트 연결
    if (arrows.length >= 2) {
        arrows[0].onclick = () => arrowClicked(-1); // Prev
        arrows[1].onclick = () => arrowClicked(1);  // Next
    }

    // 5. 첫 번째 이미지 로드
    dotClicked(0);
}

function dotClicked(i) {
    if (dots.length === 0) return;

    // 기존 활성 Dot 해제
    dots[imageIndex].classList.remove('active');
    
    // 인덱스 업데이트
    imageIndex = i;
    
    // 새 Dot 활성화
    dots[imageIndex].classList.add('active');

    // ★ 이미지 변경 로직
    updateImageDisplay();
}

function arrowClicked(direction) {
    if (dots.length === 0) return;

    let newIndex = imageIndex + direction;
    
    // 순환 로직
    if (newIndex < 0) newIndex = dots.length - 1;
    else if (newIndex >= dots.length) newIndex = 0;
    
    dotClicked(newIndex);
}

function updateImageDisplay() {
    const projectImage = document.getElementById('projectImage');
    const currentData = recentImagesData[imageIndex];
    if (currentData && currentData.image) {
        // 배경 이미지로 설정하는 방식 (CSS cover 속성 활용 용이)
        // projectImage.style.backgroundImage = `url('${currentData.image}')`;
        // projectImage.style.backgroundSize = 'cover';
        // projectImage.style.backgroundPosition = 'center';
        
        // 또는 img 태그를 넣는 방식이라면:
        projectImage.style.backgroundColor = "transparent";
        projectImage.innerHTML = `<img src="${currentData.image}" alt="${currentData.name}" style="width:100%; height:100%; object-fit:contain;">`;
    }
}