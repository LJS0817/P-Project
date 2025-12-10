const pins = document.querySelectorAll('.pin');

// const h3s = document.querySelectorAll('.tableContent > h3');
// const listParent = document.querySelectorAll('.verticalScrollableList');

const tables = document.getElementById('tableContent');

let curIndex = 0;

pins.forEach((pin, index) => {
    pin.addEventListener('click', () => {
        pins.forEach(p => p.classList.remove('active'));
        pin.classList.add('active');

        tables.children[curIndex].classList.add('disable');
        curIndex = index;
        tables.children[curIndex].classList.remove('disable');

        if (tables.children[curIndex].dataset.loaded !== 'true') {
            
            const triggerBtn = tables.children[curIndex].querySelector('.selectBtn');
            
            if (triggerBtn) {
                retrieveData(triggerBtn);
            }
        }
    });
});

function retrieveData(element) {
    const tableName = element.dataset.table;
    // const tableName = 'users';
    
     window.sendData('/admin/table/getData', 'GET',
        (data) => {
            console.log(data);
            updateTableList(element, data.data, data.validKeys);
        },
        (data) => { },
        {
            table: tableName
        }
    )
    // try {
    //     // 2. 서버로 데이터 요청 (Fetch API 사용)
       
    //     const response = await fetch(`/admin/table/getData?table=${tableName}`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     });

    //     if (!response.ok) throw new Error('Network response was not ok');

    //     // 3. 응답 데이터(JSON) 파싱
    //     const result = await response.json(); // { data: [...], schema: [...] } 형태라고 가정
        
    //     // 4. 화면 갱신 (DOM 조작)

    // } catch (error) {
    //     console.error('Error retrieving data:', error);

    //     // alert('데이터를 불러오는 중 오류가 발생했습니다.');
    // }
}

retrieveData(tables.children[0]);

// 화면의 리스트를 갱신하는 헬퍼 함수
function updateTableList(buttonElement, newData, validKeys) {
    // 버튼의 부모 컨테이너(.listParent) 찾기
    const listParent = buttonElement.querySelector('.listParent') || buttonElement.parentElement.parentElement.querySelector('.listParent');
    const listContainer = listParent.querySelector('.list');
    const categoriesContainer = listParent.querySelector('.categories');

    const tableWrapper = buttonElement.closest('.tableDetails');
    if (tableWrapper) {
        tableWrapper.dataset.loaded = 'true';
    }

    if (categoriesContainer.children.length <= 1) {

        const colNum = (validKeys ? validKeys.length : 0);
        listParent.style.setProperty('--col-num', colNum);

        categoriesContainer.innerHTML = '';

        // 1. 유효한 키(컬럼명) 생성
        if (validKeys && validKeys.length > 0) {
            validKeys.forEach(key => {
                const p = document.createElement('p');
                p.innerHTML = key.toUpperCase() + '<span class="arrow">▼</span>'; 
                p.classList.add('sortable');
                categoriesContainer.appendChild(p);
            });
        }

        // 2. 'Option' 컬럼 다시 추가 (맨 뒤에)
        const optionP = document.createElement('p');
        optionP.textContent = 'Option';
        categoriesContainer.appendChild(optionP);
    }

    // 기존 리스트 초기화
    listContainer.innerHTML = '';

    // 데이터가 없을 경우 처리
    if (!newData || newData.length === 0) {
        listContainer.innerHTML = '<div class="no-data">데이터가 없습니다.</div>';
        return;
    }
    
    // 새 데이터로 행(row) 생성
    newData.forEach(d => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'linked';

        // 유효한 키(컬럼) 순서대로 데이터 삽입
        validKeys.forEach(key => {
            const p = document.createElement('p');
            p.textContent = d[key] !== undefined ? d[key] : ''; // 데이터가 null일 경우 빈 문자열
            rowDiv.appendChild(p);
        });

        // 삭제 버튼 추가
        const deleteP = document.createElement('p');
        deleteP.textContent = 'Delete';
        deleteP.onclick = function() { deleteRow(this); }; // 기존 deleteRow 함수 재사용
        deleteP.dataset.table = buttonElement.dataset.table;
        deleteP.dataset.id = d.id;
        rowDiv.appendChild(deleteP);

        // 리스트에 추가
        listContainer.appendChild(rowDiv);
    });
}

function deleteRow(element) {
    // 1. 데이터 가져오기 (DOM 탐색 없이 dataset에서 바로 획득)
    const id = element.dataset.id;
    const tableName = element.dataset.table;

    // 예외 처리 (혹시 모를 오류 방지)
    if (!id || !tableName) {
        window.showErrorMsg("삭제할 대상의 정보가 올바르지 않습니다.");
        return;
    }

    // 2. 팝업 내용 구성
    // const popupTitle = "데이터 삭제";
    // const btnType = "danger"; // 버튼 스타일 (빨간색 등)
    
    // 팝업 내부 HTML
    const popupHtml = `
        <div style="text-align: center;">
            <p style="font-size: 1.1em; font-weight: bold; margin-bottom: 15px;">
                정말로 삭제하시겠습니까?
            </p>
            <div style="background: #f1f1f1; padding: 10px; border-radius: 4px; display: inline-block; text-align: left;">
                <p>Target Table: <span style="color: #333; font-weight: bold;">${tableName}</span></p>
                <p>Target ID: <span style="color: #333; font-weight: bold;">${id}</span></p>
            </div>
            <p style="color: #e74c3c; font-size: 0.9em; margin-top: 15px;">
                ⚠ 삭제 후에는 복구할 수 없습니다.
            </p>
        </div>
    `;

    window.openPopup('데이터 삭제', 'danger', popupHtml, () => {
        window.sendData(`/admin/table/delete/${tableName}/${id}`, 'GET',
            (data) => {
                const row = element.closest('.linked');
                if (row) {
                    row.remove();
                }
            }
        )
    })

    // 3. 팝업 호출 (openPopup 함수 사용)
    // openPopup(popupTitle, btnType, popupHtml, function() {
        // === [Callback: 확인 버튼 클릭 시 실행] ===
        
        // 실제 삭제 API 호출
        // URL 예시: /admin/api/deleteUser?table=users&id=5 또는 RESTful 방식
        // fetch(`/api/data/${tableName}/${id}`, {
        //     method: 'DELETE',
        //     headers: { 'Content-Type': 'application/json' }
        // })
        // .then(res => {
        //     if (res.ok) {
        //         // 성공 시 UI에서 해당 행 삭제
        //         const row = element.closest('.linked');
        //         if (row) {
        //             row.remove();
        //         }
        //         // (선택사항) 토스트 메시지 등으로 성공 알림
        //         console.log(`[Success] Deleted ${id} from ${tableName}`);
        //     } else {
        //         return res.text().then(text => { throw new Error(text) });
        //     }
        // })
        // .catch(err => {
        //     console.error(err);
        //     alert("삭제 중 오류가 발생했습니다.");
        // });
    // });
}