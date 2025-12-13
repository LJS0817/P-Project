const pins = document.querySelectorAll('.pin');
const tables = document.getElementById('tableContent');
let curIndex = 0;

// 탭 전환 로직
pins.forEach((pin, index) => {
    pin.addEventListener('click', () => {
        pins.forEach(p => p.classList.remove('active'));
        pin.classList.add('active');
        tables.children[curIndex].classList.add('disable');
        curIndex = index;
        tables.children[curIndex].classList.remove('disable');

        if (tables.children[curIndex].dataset.loaded !== 'true') {
            const triggerBtn = tables.children[curIndex].querySelector('.selectBtn');
            if (triggerBtn) retrieveData(triggerBtn);
        }
    });
});

function retrieveData(element) {
    const tableName = element.dataset.table;
    window.sendData(`/admin/table/getData?table=${tableName}`, 'GET',
        (data) => updateTableList(element, data.data, data.validKeys),
        (err) => console.error(err)
    );
}

// 초기 로딩
if(tables && tables.children.length > 0) {
    const firstBtn = tables.children[0].querySelector('.selectBtn');
    if(firstBtn) retrieveData(firstBtn);
}


// 테이블 리스트 렌더링 함수 (권한 버튼 추가됨)
function updateTableList(buttonElement, newData, validKeys) {
    const listParent = buttonElement.querySelector('.listParent') || buttonElement.parentElement.parentElement.querySelector('.listParent');
    const listContainer = listParent.querySelector('.list');
    const categoriesContainer = listParent.querySelector('.categories');

    const tableWrapper = buttonElement.closest('.tableDetails');
    if (tableWrapper) tableWrapper.dataset.loaded = 'true';

    // 1. 헤더 생성
    if (categoriesContainer.children.length <= 1) {
        const colNum = (validKeys ? validKeys.length : 0);
        listParent.style.setProperty('--col-num', colNum);
        categoriesContainer.innerHTML = '';

        if (validKeys && validKeys.length > 0) {
            validKeys.forEach(key => {
                const p = document.createElement('p');
                p.innerHTML = key.toUpperCase() + '<span class="arrow">▼</span>'; 
                p.classList.add('sortable');
                p.classList.add('area');
                p.onclick = () => { handleMultiSort(p) }
                categoriesContainer.appendChild(p);
            });
        }
        const optionP = document.createElement('p');
        optionP.textContent = document.textData['listMsg_option'];
        categoriesContainer.appendChild(optionP);
    }

    // 2. 리스트 초기화
    listContainer.innerHTML = '';
    if (!newData || newData.length === 0) {
        listContainer.innerHTML = `<div class="no-data" style="padding:20px; text-align:center;">${document.textData['adminDatabaseEmptyMsg']}</div>`;
        return;
    }
    
    // 3. 행 생성
    newData.forEach(d => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'linked';

        // PK(ID) 찾기
        let pkField = validKeys[0];
        const idColumn = validKeys.find(k => ['id', 'login_id', 'uid'].includes(k.toLowerCase()));
        if (idColumn) pkField = idColumn;
        const pkValue = d[pkField];

        validKeys.forEach(key => {
            const p = document.createElement('p');
            
            // [관리자 권한 변경 버튼 생성]

            if (key.toUpperCase() === 'IS_ADMIN') {
                const isAdmin = (d[key] === 1);
                const btn = document.createElement('a');
                btn.classList.add('user');
                btn.textContent = `${document.textData['adminDatabaseGrantMsg']}`;

                if(isAdmin) {
                    btn.classList.add('admin');
                    btn.textContent  = document.textData['adminDatabaseRevokeMsg'];
                }

                // 클릭 이벤트 연결
                btn.onclick = function(e) {
                    e.stopPropagation(); // 행 클릭 방지
                    toggleAdminRole(btn, pkValue, !isAdmin); // 반대 상태로 변경 요청
                };
                p.appendChild(btn);
            } else {
                // 일반 데이터
                p.textContent = (d[key] !== undefined && d[key] !== null) ? d[key] : '';
            }
            rowDiv.appendChild(p);
        });

        // Delete 버튼
        const deleteP = document.createElement('p');
        deleteP.textContent = document.textData['delete'];
        // deleteP.style.cursor = 'pointer';
        // deleteP.style.color = '#e74c3c';
        // deleteP.style.fontWeight = 'bold';
        deleteP.onclick = function() { deleteRow(this); };
        
        deleteP.dataset.table = buttonElement.dataset.table;
        deleteP.dataset.pkField = pkField; 
        deleteP.dataset.pkValue = pkValue;

        rowDiv.appendChild(deleteP);
        listContainer.appendChild(rowDiv);
    });
}

// [함수] 관리자 권한 변경 요청 (POST)
function toggleAdminRole(ele, userId, makeAdmin) {
    // if(!confirm(`이 사용자에게 ${action}하시겠습니까?`)) return;

    window.openPopup(document.textData[makeAdmin ? 'adminDatabaseGrantMsg' : 'adminDatabaseRevokeMsg'], '', `<p>${document.textData[makeAdmin ? 'adminDatabaseGrantPopupMsg' : 'adminDatabaseRevokePopupMsg']}<i class="fi fi-tr-user-permissions"></i></p>`,
        () => {
            window.sendData('/admin/user/toggleAdmin', 'POST',
                (data) => {
                    if(makeAdmin) ele.classList.add('admin');
                    else ele.classList.remove('admin');

                    ele.innerText = document.textData[makeAdmin ? 'adminDatabaseRevokeMsg' : 'adminDatabaseGrantMsg']
                },
                (data) => { },
                { userId: userId, setAdmin: makeAdmin }
            )
        }
    )
    // try {
    //     const response = await fetch('/admin/user/toggleAdmin', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify()
    //     });
        
    //     const result = await response.json();
        
    //     if(result.success) {
    //         alert("변경되었습니다.");
    //         location.reload(); // 변경 사항 반영을 위해 새로고침
    //     } else {
    //         alert("실패: " + result.message);
    //     }
    // } catch(err) {
    //     console.error(err);
    //     alert("서버 통신 오류");
    // }
}

// [함수] 데이터 삭제
function deleteRow(element) {
    const tableName = element.dataset.table;
    const pkField = element.dataset.pkField;
    const pkValue = element.dataset.pkValue;

    if (!tableName || !pkField || !pkValue) {
        alert("삭제 정보 부족");
        return;
    }

    const popupHtml = `<p>${document.textData['adminDatabaseDeletePopupDesc']}<i class="fi fi-tr-circle-trash danger"></i><p class="danger">${document.textData['noReturn']}</p></p>`;
    window.openPopup(document.textData['adminDatabaseDeletePopupTitle'], 'danger', popupHtml, 
        () => {
            window.sendData('/admin/table/deleteData', 'POST',
                (data) => {
                    element.closest('.linked')?.remove();
                },
                (data) => {},
                {
                    table: tableName,
                    field: pkField,
                    value: encodeURIComponent(pkValue)
                }
            )
        // try {
        //     const url = `/admin/table/deleteData?table=${tableName}&field=${pkField}&value=${encodeURIComponent(pkValue)}`;
        //     const response = await fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'} });
            
        //     if (response.ok) {
        //         const data = await response.json();
        //         if(data.success) {
        //             element.closest('.linked')?.remove();
        //             if(typeof window.closePopup === 'function') window.closePopup();
        //             else document.querySelector('.popup_background')?.remove();
        //         } else alert("삭제 실패: " + data.message);
        //     } else {
        //         alert("서버 오류");
        //     }
        // } catch(err) { alert("통신 오류"); }
    });
}