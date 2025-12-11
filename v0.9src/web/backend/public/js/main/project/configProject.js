const page = document.getElementById('pageName');
let pageList = {};
const pageListUI = document.getElementById('pageList');
const icon = '<i class="fi fi-rr-cross"></i>'

function removeElement(e) {
    // 텍스트에서 아이콘 HTML 등을 제외하고 키값 추출 (공백 제거 등 필요 시 조정)
    const key = e.innerText.trim(); 
    delete pageList[key];
    e.remove();
    console.log(pageList);
}

page.onkeyup = (e) => {
    if (page.value.length > 0) {
        // 이미 존재하는지 체크
        if(pageList[page.value] == undefined) {
            if (page.classList.contains("error")) page.classList.remove('error');
            
            if(e.key == "Enter") {
                // 페이지 제한 10개 체크 로직 추가 권장
                if(Object.keys(pageList).length >= 10) {
                    alert("최대 10개까지만 추가할 수 있습니다.");
                    return;
                }

                pageListUI.innerHTML += `<p class='pageElement' onclick='removeElement(this)'>${page.value}${icon}</p>`;
                pageList[page.value] = 0; // 값은 임의로 0 설정
                page.value = '';
            }
        } else if (!page.classList.contains("error")) {
            // 중복된 경우 에러 표시
            page.classList.add('error');
        }
    } else if (page.classList.contains("error")) {
        page.classList.remove('error');
    }
}

// Visibility 토글 로직
const swPublic = document.getElementById('switchVisibility');
const visibilityCheckbox = document.getElementById('visibilityCheckbox'); // HTML에 id 추가 필요
let isPublic = true;

swPublic.onclick = (e) => {
    // 이벤트 버블링으로 인한 체크박스 두 번 클릭 방지
    if (e.target.tagName === 'INPUT') return; 
    
    e.preventDefault();
    isPublic = !isPublic;
    
    // UI 클래스 토글
    swPublic.children[0].classList.toggle("active", isPublic); // Public Label
    swPublic.children[2].classList.toggle("active", !isPublic); // Private Label
    
    // 실제 체크박스 값 변경 (서버 전송용)
    if(visibilityCheckbox) {
        visibilityCheckbox.checked = isPublic;
    }
}

// 폼 제출 방지 (엔터키)
const form = document.getElementById('projectForm');
form.onkeydown = (e) => {
    // 텍스트 에어리어는 엔터 허용, 그 외(input)에서만 엔터 제출 방지
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
}

form.onsubmit = (e) => {
    const projectNameInput = document.getElementById('projectName');
    const pageListInput = document.getElementById('pageListJson');

    // 1. 프로젝트 이름(필수값) 체크
    if (!projectNameInput.value.trim()) {
        e.preventDefault(); // 서버 전송 막기 
        alert("Project name is required!");
        projectNameInput.focus(); // 입력창으로 포커스 이동
        projectNameInput.classList.add('error'); // CSS로 빨간 테두리 등을 주고 싶다면 추가
        return false;
    }

    if(pageListInput) {
        pageListInput.value = JSON.stringify(Object.keys(pageList)); 
    }
};