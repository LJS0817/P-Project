setupVisibilityControls();
function setupVisibilityControls() {
    // 버튼 요소 선택
    // .half 클래스가 없는 요소를 '눈(Toggle)' 버튼으로 간주
    const toggleBtn = document.querySelector('.viewProject .uiGroup .visibleBtn:not(.half)');
    const halfBtn = document.querySelector('.viewProject .uiGroup .visibleBtn.half');

    // 1. 눈 아이콘 버튼 (Toggle Visibility)
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const heatmapImg = document.querySelector('.dropHere .img.after');
            const icon = toggleBtn.querySelector('i');

            if (!heatmapImg) return; // 이미지가 없으면 실행 안 함

            // 현재 투명도 확인 (Computed Style 사용이 안전함)
            const currentOpacity = window.getComputedStyle(heatmapImg).opacity;

            if (currentOpacity > 0) {
                // 현재 보이면 -> 숨기기 (0)
                toggleBtn.classList.remove('active');
                heatmapImg.style.opacity = '0';
                
                // 아이콘 변경: 눈 -> 눈 감기
                icon.classList.remove('fi-rr-eye');
                icon.classList.add('fi-rr-eye-crossed');
            } else {
                toggleBtn.classList.add('active');
                // 현재 숨겨져 있으면 -> 보이기 (1)
                heatmapImg.style.opacity = '1';
                
                // 아이콘 변경: 눈 감기 -> 눈
                icon.classList.remove('fi-rr-eye-crossed');
                icon.classList.add('fi-rr-eye');
            }
        });
    }

    // 2. 50% 버튼 (Half Visibility)
    if (halfBtn) {
        halfBtn.addEventListener('click', () => {
            const heatmapImg = document.querySelector('.dropHere .img.after');
            
            if (!heatmapImg) return;

            // 투명도 0.5 설정
            heatmapImg.style.opacity = '0.5';

            // 50%도 '보이는 상태'이므로, 눈 아이콘이 감겨있다면 다시 뜨게 변경
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (icon.classList.contains('fi-rr-eye-crossed')) {
                    icon.classList.remove('fi-rr-eye-crossed');
                    icon.classList.add('fi-rr-eye');
                }
            }
        });
    }
}

const addBtn = document.getElementById('addPageBtn');
const listContainer = document.querySelector('.viewProject .pageList .list');

const existingRows = listContainer.querySelectorAll('.pageElement');
existingRows.forEach(row => {
    bindEventsToRow(row);
    console.log(row)
    const nameCell = row.querySelector('.pageName');
    if (nameCell && !nameCell.querySelector('input')) {
        enableClickToEdit(nameCell);
    }
});

addPageBtn.addEventListener('click', () => {
    addNewPageRow();
});

function addNewPageRow() {
    const pageCount = listContainer.querySelectorAll('.pageElement').length + 1;
    const currentDateTime = getCurrentDateTimeString(); 

    const newRowHTML = `
        <div class="pageElement linked">
            <input class="area" type="checkbox" name="selectPage">
            <div class="pageName area">
                <input type="text" class="pageNameInput" placeholder="Page ${pageCount}" value="Page ${pageCount}">
            </div>
            <div class="area">
                <div class="status <%= analyzed ? 'done' : '' %>">
                <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24">
                    <path
                        d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px"
                    y="0px" viewBox="0 0 512.021 512.021" style="enable-background:new 0 0 512.021 512.021;" xml:space="preserve">
                    <path
                        d="M301.258,256.01L502.645,54.645c12.501-12.501,12.501-32.769,0-45.269c-12.501-12.501-32.769-12.501-45.269,0l0,0 L256.01,210.762L54.645,9.376c-12.501-12.501-32.769-12.501-45.269,0s-12.501,32.769,0,45.269L210.762,256.01L9.376,457.376 c-12.501,12.501-12.501,32.769,0,45.269s32.769,12.501,45.269,0L256.01,301.258l201.365,201.387 c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L301.258,256.01z" />
                </svg>
            </div>
            </div>
            <p class="area">${currentDateTime}</p>
            <div class="btnGroup area">
                <a href="#"><p>Download</p><i class="fi fi-rr-download"></i></a>
                <a href="#" class="resetBtn"><p>Reset</p><i class="fi fi-rr-rotate-reverse"></i></a>
                <a href="#" class="deleteBtn"><p>Delete</p><i class="fi fi-rr-trash"></i></a>
            </div>
        </div>
    `;

    listContainer.insertAdjacentHTML('beforeend', newRowHTML);

    const newRow = listContainer.lastElementChild;
    const nameInput = newRow.querySelector('.pageNameInput');

    bindEventsToRow(newRow);

    if (nameInput) nameInput.focus();
}

function bindEventsToRow(row) {
    const nameInput = row.querySelector('.pageNameInput');
    const deleteBtn = row.querySelector('.deleteBtn');
    const resetBtn = row.querySelector('.resetBtn');

    row.addEventListener('click', (e) => {
        // 1. input(이름 수정, 체크박스)이나 a태그(버튼)를 클릭했을 경우 실행하지 않음
        if (e.target.tagName === 'INPUT' || e.target.closest('a') || e.target.closest('.btnGroup')) {
            return;
        }
        
        // 2. 현재 활성화 표시 (선택사항)
        document.querySelectorAll('.pageElement').forEach(el => el.classList.remove('active'));
        row.classList.add('active');

        // 3. 뷰 페이지 실행
        viewPage(row);
    });

    if (nameInput) {
        nameInput.addEventListener('blur', () => convertToStaticText(nameInput));
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') convertToStaticText(nameInput);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentName = row.querySelector('.pageNameInput')?.value || row.querySelector('.pageName').textContent.trim();
            
            window.openPopup('Reset page "${currentName}" data', 'danger', `<p>${currentName} 페이지 데이터를 초기화하시겠습니까<i class="fi fi-rr-rotate-reverse danger"></i></p>`, () => {
                window.sendData(resetBtn.href, 'GET', 
                    (data) => {
                        const dateElement = row.querySelector('p.area');
                        if (dateElement) {
                            dateElement.textContent = getCurrentDateTimeString();
                        }
                        const statusElement = row.querySelector('.status.done');
                        if(statusElement) statusElement.classList.remove('done');
                    },
                )
            })
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentName = row.querySelector('.pageNameInput')?.value || row.querySelector('.pageName').textContent.trim();
            
            window.openPopup('Delete page "${currentName}"', 'danger', `<p>Are you sure you want to proceed<i class="fi fi-tr-folder-xmark-circle danger"></i>You can't undo this action</p>`, () => {
                window.sendData(deleteBtn.href, 'GET', 
                    (data) => {
                        row.remove();
                    },
                )
            })
            // window.openPopup('Delete page', 'danger', `<p>${currentName} 페이지를 삭제하시겠습니까</p>`, () => {
            //     fetch(deleteBtn.href, {
            //         method: 'GET'
            //     })
            //     .then(response => {
            //         if (response.ok) {
            //             row.remove();
            //             console.log('삭제 성공');
            //         } else {
            //             console.error('삭제 실패');
            //         }
            //     })
            //     .catch(error => console.error('에러 발생:', error));
            // })
        });
    }
}

function convertToStaticText(inputElement) {
    const cell = inputElement.closest('.pageName');
    const newName = inputElement.value.trim() || inputElement.placeholder;

    const pageId = cell.getAttribute('data-id');

    savePageNameToServer(pageId, newName);

    cell.innerHTML = ''; 
    cell.textContent = newName;

    enableClickToEdit(cell);
}

function enableClickToEdit(cellElement) {
    cellElement.addEventListener('click', () => {
        if (cellElement.querySelector('.pageNameInput')) return;

        const currentText = cellElement.textContent.trim();
        
        const tempInput = document.createElement('input');
        tempInput.type = 'text';
        tempInput.className = 'pageNameInput';
        tempInput.value = currentText;

        cellElement.innerHTML = '';
        cellElement.appendChild(tempInput);
        tempInput.focus();

        tempInput.addEventListener('blur', () => convertToStaticText(tempInput));
        tempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') convertToStaticText(tempInput);
        });
    }, { once: true });
}

async function savePageNameToServer(id, name) {
    // try {
    //     console.log(`[서버 전송] 페이지 이름: ${name}`);
        
    // } catch (error) {
    //     console.error("저장 실패:", error);
    //     alert("저장 실패");
    // }

    if (!id) return; // ID 없으면 중단

    try {
        const response = await fetch('/dashboard/project/page/rename', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageId: id,
                newName: name
            })
        });

        const data = await response.json()

        if (data.success) {
            console.log(`저장 완료 ${id}, ${name}`);
        } else {
            window.showErrorMsg(data.messag);
            // alert('이름 변경 실패' + data.message);
        }
    } catch (error) {
        console.error('저장 실패', error);
        window.showErrorMsg(error);
        // alert("서버 통신 오류");
    }
    

}

function getCurrentDateTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

const dropArea = document.querySelector('.viewProject .page .result .dropHere');
const fileInput = document.getElementById('fileData');

const addFileUi = document.querySelector('.viewProject .page .result .uiGroup .addFile');
const fileInputContainer = addFileUi.querySelector('.fileInput');

fileInputContainer.addEventListener('click', (e) => {
    e.stopPropagation(); 
    fileInput.click();
});

dropArea.addEventListener('click', () => {
    fileInput.click();
});

dropArea.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('is-dragover');
});

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('is-dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('is-dragover');

    const files = e.dataTransfer.files;

    if (files.length > 0) {
        const dataTransfer = new DataTransfer();
        
        for (let i = 0; i < files.length; i++) {
            dataTransfer.items.add(files[i]);
        }

        fileInput.files = dataTransfer.files;
        
        console.log(`${fileInput.files.length}개의 파일이 성공적으로 할당되었습니다.`);
        
        handleFiles(fileInput.files);
    }
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        // 원본 코드
        // console.log('선택/드롭된 파일 목록:');
        // for (let i = 0; i < files.length; i++) {
        //      console.log(`- ${files[i].name} (${(files[i].size / 1024 / 1024).toFixed(2)} MB)`);
        // }
        const file = files[0]; // 첫 번째 파일만 처리
        console.log('파일 업로드 중: ', file.name);

        // 프로젝트 ID 가져오기
        const projectId = document.getElementById('currentProjectId').value;

        // 데이터를 담을 폼 생성
        const formData = new FormData();
        formData.append('fileData', file); // 라우터의 upload.single('fileData')와 동일해야 함
        formData.append('projectId', projectId) // ID도 함께 전송

        // 서버로 전송
        document.body.style.cursor = 'wait'; // 커서 변경?

        fetch('/dashboard/project/analyze', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            document.body.style.cursor = 'default';

            if(data.success) {
                console.log('분석 성공: ', data);

                // 결과 이미지를 화면에 표시
                // viewProject.ejs에 이미지가 들어갈 공간

                const dropArea = document.querySelector('.dropHere');
                dropArea.innerHTML = `
                <div class='imageContainer'>
                    <img src="${data.original}" class='img before'>
                    <img src="${data.heatmap}" class='img after'>
                    </div>`;
            } else {
                alert('분석 실패' + (data.message || '알 수 없는 오류'));
            }
        })
        .catch(err => {
            document.body.style.cursor = 'default';
            console.error('업로드 에러', err);
            alert('서버가 아퍼' + err.message);
        });
    }
}

const defaultDropAreaHTML = document.querySelector('.viewProject .page .result .dropHere').innerHTML;
const pageTitleElement = document.querySelector('.viewProject .page h2');
async function viewPage(ele) {
    const nameCell = ele.querySelector('.pageName');
    const pageId = nameCell.getAttribute('data-id');
    const currentName = nameCell.textContent.trim();

    // 1. 페이지 제목 변경
    if (pageTitleElement) pageTitleElement.textContent = currentName;

    // 2. 현재 선택된 페이지 ID 업데이트 (파일 업로드 시 사용하기 위해)
    // viewProject.ejs에 <input type="hidden" id="currentPageId"> 가 있다고 가정하거나
    // 기존 currentProjectId와 별개로 현재 보고 있는 페이지의 ID를 저장해야 합니다.
    let pageIdInput = document.getElementById('currentPageId');
    if (!pageIdInput) {
        // 없으면 동적으로 생성 (currentProjectId 옆에)
        const projectInput = document.getElementById('currentProjectId');
        pageIdInput = document.createElement('input');
        pageIdInput.type = 'hidden';
        pageIdInput.id = 'currentPageId';
        projectInput.after(pageIdInput);
    }
    pageIdInput.value = pageId;

    try {
        // GET 요청으로 상세 정보 가져오기
        const response = await fetch(`/dashboard/project/page/detail/${pageId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('데이터 로드 실패');

        const data = await response.json();

        if (data.success && data.analyzed && data.original && data.heatmap) {
            // 분석된 데이터가 있는 경우: 이미지 표시
            dropArea.innerHTML = `
                <div class='imageContainer'>
                    <div class='img before' style='background: url("${data.original}") no-repeat center center / cover;'></div>
                    <div class='img after' style='background: url("${data.heatmap}") no-repeat center center / cover;'></div>
                </div>`;
        } else {
            dropArea.innerHTML = defaultDropAreaHTML;
        }

    } catch (error) {
        console.error('페이지 로드 에러:', error);
        alert('페이지 정보를 불러오는데 실패했습니다.');
    } finally {
    }
}