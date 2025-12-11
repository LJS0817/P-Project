// 커스텀 셀렉트 박스 기능
const selectWrappers = document.querySelectorAll('.customSelect');

// 모든 셀렉트 박스를 담는 함수
selectWrappers.forEach(wrapper => {
    const trigger = wrapper.querySelector('.selectTrigger'); // 클릭해서 메뉴를 여는 버튼
    const options = wrapper.querySelectorAll('.optionItem'); // 선택 가능한 목록
    const hiddenInput = wrapper.querySelector('input[type="hidden"]'); // 폼 전송 시 실제 값을 담을 hidden input
    const initialSelected = wrapper.querySelector('.optionItem.selected'); // 초기 선택된 항목

    if (initialSelected) {
        // 선택된 항목이 있다면 버튼 텍스트와 hidden input 값을 업데이트합니다.
        trigger.textContent = initialSelected.textContent;
        hiddenInput.value = initialSelected.getAttribute('data-value');
    } else {
        // (선택 사항) 만약 selected가 하나도 없다면 첫 번째 옵션을 기본값으로 설정
        if (options.length > 0) {
            options[0].classList.add('selected');
            trigger.textContent = options[0].textContent;
            hiddenInput.value = options[0].getAttribute('data-value');
        }
    }

    // 트리거 클릭 시 드롭다운 토글
    trigger.addEventListener('click', (e) => {
        closeAllSelects(wrapper); // 현재 셀렉트를 제외한 모든 셀렉트 닫기
        wrapper.classList.toggle('open'); // 메뉴를 토글
        e.stopPropagation();  // 클릭 이벤트가 문서 전체로 전파되는 것을 방지 -> 안하면 바로 닫힐듯?
    });

    // 각 옵션마다 클릭 이벤트 추가
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            if(!wrapper.classList.contains('open')) { // 드롭다운이 닫혀있다면 아무 일도 없었다
                return;
            }
            const value = option.getAttribute('data-value'); // 선택된 옵션의 값
            const text = option.textContent; // 선택된 옵션의 텍스트

            trigger.textContent = text; // 트리거 텍스트를 선택한 옵션의 텍스트로 업데이트

            hiddenInput.value = value; // hidden input 값을 업데이트

            options.forEach(opt => opt.classList.remove('selected')); // 기존 옵션들의 하이라이트 제거
            option.classList.add('selected'); // 선택된 놈에게만 selected 클래스 부여

            wrapper.classList.remove('open'); // 선택 끝나면 드롭다운 닫기
        });
    });
});

// 외부 클릭하면 다 닫아버리기
document.addEventListener('click', () => {
    closeAllSelects(null); // 모든 셀렉트 닫기
});

// exceptWrapper를 제외한 모든 셀렉트 다 닫기
function closeAllSelects(exceptWrapper) {
    selectWrappers.forEach(wrapper => {
        if (wrapper !== exceptWrapper) {
            wrapper.classList.remove('open');
        }
    });
}

// 테마 토글 기능 : 체크 상태에 따라 왼쪽, 오른쪽 글씨 색 바꾸는 코드?
// HTML 로드 시 토글과 좌우 텍스트 요소 가져옴
const themeToggle = document.getElementById('themeToggle');
const textLeft = document.getElementById('textLeft');
const textRight = document.getElementById('textRight');

// 토글이 켜져있다면 오른쪽 텍스트에 activate 부여, 왼쪽은 제거
// 꺼져있다면 왼쪽 텍스트에 activate 부여, 오른쪽은 제거
function updateToggleColors() {
    if (themeToggle.checked) {
        textRight.classList.add('active');
        textLeft.classList.remove('active');
    } else {
        textLeft.classList.add('active');
        textRight.classList.remove('active');
    }
}

// 토글 상태가 바뀔때 마다 색상 업데이트
themeToggle.addEventListener('change', updateToggleColors);
updateToggleColors();

// 테마 선택 기능
const themeDots = document.querySelectorAll('.themeDots .dot');

const getTheme = [
    'default',
    'juice',
    'sand',
    'lavender',
    'jungle'
];

// 이전에 선택된 테마 인덱스 저장
let prevThemeIndex = 0;

// 각 점을 클릭했을 때, 
themeDots.forEach((dot, index) => {
    dot.addEventListener('click', () => { 
        if(prevThemeIndex == index) return; // 이미 선택된 테마를 또 누르면 함수 종료
        themeDots.forEach(d => d.classList.remove('active')); // 모든 점의 활성화 표시 제거

        dot.classList.add('active'); // 지금 누른 점만 활성화 표시
        document.body.classList.remove(getTheme[prevThemeIndex]); // body 태그에서 이전 테마 클래스 제거
        document.body.classList.add(getTheme[index]); // body 태그에 새로운 테마 클래스 추가
        prevThemeIndex = index; // 현재 선택한 번호를 이전 번호로 업데이트
        currentTheme = getTheme[index];
        updateThemeInput();
        // console.log(`Theme Dot ${index + 1} selected`);
    });
});

// 라이트/다크 모드 변경 기능
const themeModes = document.querySelectorAll('.themeModes .mode');

themeModes.forEach((mode, index) => {
    mode.addEventListener('click', () => {
        themeModes.forEach(m => m.classList.remove('active'));

        if(index == 1 && !document.body.classList.contains('dark')) document.body.classList.add('dark') // index == 1 (dark) body에 dark 클래스가 없다면 추가
        else if(document.body.classList.contains('dark')) document.body.classList.remove('dark') // 이미 dark 클래스가 있다면 dark 제거
        else if (index == 2 && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { // 시스템 설정이 다크모드라면 dark 클래스 추가
            document.body.classList.add('dark');
        }
        mode.classList.add('active'); // 클릭한 버튼에 활성화 표시

        updateThemeInput();

        console.log(`Mode ${index + 1} selected`);
    });
});

const themeInput = document.getElementById('themeInput');

let currentTheme = 'default';

// 현재 색상 + 다크모드 여부를 합쳐서 input에 저장
function updateThemeInput() {
    if (!themeInput) return;

    let finalValue = currentTheme;
    if (document.body.classList.contains('dark')) {
        finalValue += ' dark';
    }
    themeInput.value = finalValue;
    // console.log('Theme Updated: ', finalValue);
}

// 초기화 함수 ( 페이지 로드 시 DB값을 읽고 UI 업데이트 )
function initThemeState() {
    const bodyClasses = document.body.classList;

    // 색상 점 activate
    let colorFound = false;
    themeDots.forEach((dot, index) => {
        dot.classList.remove('active');
        const color = getTheme[index];

        // body 클래스에 해당 색상 클래스가 있거나, 기본값인 경우
        if (bodyClasses.contains(color) || (color === 'default' && !colorFound)) {
            // 기본값일땐 다른 색상 클래스가 없는 지 확인
            let hasOther = false;
            for(let i=1; i<getTheme.length; i++) {
                if (bodyClasses.contains(getTheme[i])) hasOther = true;
            }
    

        if (color !== 'default' || !hasOther) {
            dot.classList.add('active')
            currentTheme = color;
            prevThemeIndex = index;
            colorFound = true;
        }
    }
    });

    // 못 찾았으면 기본값 활성화
    if(!colorFound) {
        themeDots[0].classList.add('active');
        currentTheme = 'default'
    }

    // 모드 버튼 활성화
    themeModes.forEach(m => m.classList.remove('active'));
    if (bodyClasses.contains('dark')) {
        if(themeModes[1]) themeModes[1].classList.add('active'); // 다크모드
    } else {
        if(themeModes[0]) themeModes[0].classList.add('active') // 다크아닌모드
    }

    updateThemeInput(); // 초기값 input에 반영
}

initThemeState();

// 저장 버튼
const saveBtn = document.getElementById('saveSettingsBtn');

if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        window.showLoading();
        const dateFormatEl = document.getElementById('dateFormatInput');
        const themeEl = document.getElementById('themeInput');

        if (!dateFormatEl || !themeEl) {
            console.log('요소 없음');
            return;
        }

        const dateFormatValue = dateFormatEl.value;
        const themeValue = themeEl.value;
        

        window.openPopup(document.textData['setting_preferSavePopupTitle'], '', `<p>${document.textData['setting_preferSavePopupMsg']}<i class="fi fi-tr-it"></i></p>`, () => {
            window.sendData('/dashboard/settings/update', 'POST', 
                (data) => { },
                (data) => { },
                {
                    dateFormat: dateFormatValue,
                    theme: themeValue
                }
            )
        })
        // fetch('/dashboard/settings/update', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         dateFormat: dateFormatValue,
        //         theme: themeValue
        //     })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (data.success) {
        //         window.endLoad();
        //         // alert('저장');
        //         // location.reload()
        //     } else {
        //         window.showErrorMsg(data.message)
        //         // alert('실패 : ' + data.message);
        //     }
        // })
        // .catch(err => {
        //     window.showErrorMsg(err)
        //     // console.error(' 저장 에러 ', err);
        //     // alert('통신 이상해용');
        // });
    });
}