setupVisibilityControls();
function setupVisibilityControls() {
    function bindControl(btnSelector, imgAltName, useHalfBtn) {
        // 1. 버튼 요소 선택
        const toggleBtn = document.querySelector(`.viewProject .uiGroup .visibleBtn${btnSelector}:not(.half)`);
        const halfBtn = useHalfBtn ? document.querySelector(`.viewProject .uiGroup .visibleBtn${btnSelector}.half`) : null;

        // [내부 함수] 슬래시 아이콘 상태 업데이트
        // isVisible이 true면(이미지가 보이면) -> slash를 숨김(opacity 0)
        // isVisible이 false면(이미지가 안 보이면) -> slash를 보임(opacity 1)
        const updateSlashIcon = (btn, isVisible) => {
            const slash = btn.querySelector('.fi-rr-slash');
            if (slash) {
                slash.style.opacity = isVisible ? '0' : '1';
            }
        };

        // --- [공통] 토글(On/Off) 버튼 로직 ---
        if (toggleBtn) {
            // 초기 상태: active가 있으면 이미지가 보이는 상태이므로 slash 숨김
            if (toggleBtn.classList.contains('active')) {
                updateSlashIcon(toggleBtn, true);
            }

            toggleBtn.addEventListener('click', () => {
                const targetImg = document.querySelector(`.dropHere .img.after[alt="${imgAltName}"]`);
                
                if (!targetImg) return; 

                const currentOpacity = window.getComputedStyle(targetImg).opacity;

                if (currentOpacity > 0) {
                    // [숨기기]
                    toggleBtn.classList.remove('active');
                    targetImg.style.opacity = '0';
                    
                    // 아이콘: 빗금(/) 보이기
                    updateSlashIcon(toggleBtn, false);
                } else {
                    // [보이기]
                    toggleBtn.classList.add('active');
                    targetImg.style.opacity = '1';
                    
                    // 아이콘: 빗금(/) 숨기기
                    updateSlashIcon(toggleBtn, true);
                }
            });
        }

        // --- [옵션] 50% 버튼 로직 (Heatmap 전용) ---
        if (useHalfBtn && halfBtn) {
            halfBtn.addEventListener('click', () => {
                const targetImg = document.querySelector(`.dropHere .img.after[alt="${imgAltName}"]`);
                
                console.log(targetImg);
                if (!targetImg) return;

                // 투명도 0.5 설정
                targetImg.style.opacity = '0.5';

                // 50%도 '보이는 상태'이므로 토글 버튼을 활성화 상태로 동기화
                if (toggleBtn) {
                    toggleBtn.classList.add('active');
                    // 빗금(/) 숨기기
                    updateSlashIcon(toggleBtn, true);
                }
            });
        }
    }

    // ========== 실행 설정 ==========

    // 1. Scan Path: Toggle 기능만 (버튼 아이콘: code-branch)
    bindControl('.target-path', 'path', false);

    // 2. Heatmap: Toggle + Half 기능 (버튼 아이콘: eye)
    bindControl('.target-heatmap', 'Heatmap', true);
}

const addBtn = document.getElementById('addPageBtn');
const listContainer = document.querySelector('.viewProject .pageList .list');

const existingRows = listContainer.querySelectorAll('.pageElement');
existingRows.forEach(row => {
    bindEventsToRow(row);
    // console.log(row)
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
            <div class="area"></div>
            <div class="pageName area" data-id="">
                <input type="text" class="pageNameInput" placeholder="${document.textData['historyFilterPage']} ${pageCount}" value="${document.textData['historyFilterPage']} ${pageCount}">
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
                <a href="#"><p>${document.textData['listPageOptionDownload']}</p><i class="fi fi-rr-download"></i></a>
                <a href="#" class="resetBtn"><p>${document.textData['listPageOptionReset']}</p><i class="fi fi-rr-rotate-reverse"></i></a>
                <a href="#" class="deleteBtn"><p>${document.textData['delete']}</p><i class="fi fi-rr-trash"></i></a>
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
    const downloadBtn = row.querySelector('.btnGroup a:nth-child(1)');

    row.addEventListener('click', (e) => {
        // 1. input(이름 수정, 체크박스)이나 a태그(버튼)를 클릭했을 경우 실행하지 않음
        if (
            e.target.tagName === 'INPUT' || 
            e.target.closest('a') || 
            e.target.closest('.btnGroup') || 
            e.target.closest('.pageName') 
        ) {
            return;
        }
        
        // 2. 현재 활성화 표시 (선택사항)
        document.querySelectorAll('.pageElement').forEach(el => el.classList.remove('active'));
        row.classList.add('active');

        // 3. 뷰 페이지 실행
        viewPage(row);
    });

    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault(); // 기본 이동 막기
            
            const currentName = row.querySelector('.pageNameInput')?.value || row.querySelector('.pageName').textContent.trim();
            const pageId = row.querySelector('.pageName').getAttribute('data-id');

            // 1. 현재 선택된(Active) 행인 경우 -> 화면에 있는 DOM 이미지 사용
            if (row.classList.contains('active')) {
                const canvas = createMergedCanvas();
                if (canvas) {
                    triggerCanvasDownload(canvas, currentName);
                } else {
                    // 이미지가 아직 로드되지 않았거나 없을 때 처리
                    alert("이미지가 로드되지 않았습니다.");
                }
            } 
            // 2. 선택되지 않은(Inactive) 행인 경우 -> 서버에서 데이터 받아와서 백그라운드 처리
            else {
                if(!pageId) return;
                downloadBackgroundPage(pageId, currentName);
            }
        });
    }

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
            
            window.openPopup(document.textData['listPageResetPopupMsg'], 'danger', `<p>${document.textData['listPageResetPopupDetail']}<p class='popupTargetContainer'>${document.textData['viewProjectPageTitle']}${document.textData['name']} : ${currentName}</p><i class="fi fi-rr-rotate-reverse danger"></i>${document.textData['noReturn']}</p>`, () => {
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
            // ID 가져오기
            const pageId = row.querySelector('.pageName').getAttribute('data-id');

            window.openPopup(document.textData['listPageDeletePopupMsg'], 'danger', `<p>${document.textData['listPageDeletePopupDetail']}<p class='popupTargetContainer'>${document.textData['viewProjectPageTitle']}${document.textData['name']} : ${currentName}</p><i class="fi fi-tr-circle-trash danger"></i>${document.textData['noReturn']}</p>`, () => {
                if (!pageId) {
                    row.remove();
                    return;
                }

                window.sendData(deleteBtn.href, 'GET',
                    (data) => {
                        row.remove();
                    },
                )
            })
        });
    }
}

// [신규] 캔버스를 이미지 파일로 다운로드 트리거하는 함수
function triggerCanvasDownload(canvas, fileName) {
    const link = document.createElement('a');
    link.download = `${fileName}_merged.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link); // 파이어폭스 등 호환성 위해 추가
    link.click();
    document.body.removeChild(link);
}

// [신규] 이미지 URL을 받아 로드된 Image 객체를 반환하는 Promise 함수
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // CORS 문제 방지
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null); // 에러나도 null 반환하여 진행 안 막음
        img.src = url;
    });
}

// [신규] 선택되지 않은 페이지의 데이터를 받아와서 합성 후 다운로드
function downloadBackgroundPage(pageId, fileName) {
    window.showLoading(); // 로딩 표시 시작

    // 1. 서버에 상세 정보 요청 (기존 API 활용)
    window.sendData(`/dashboard/project/page/detail/${pageId}`, 'GET', 
        (data) => {
            if (data.success && data.original) {
                // 3. 캔버스 생성 및 합성
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = data.original.naturalWidth;
                canvas.height = data.original.naturalHeight;

                // 순서대로 그리기
                ctx.drawImage(data.original, 0, 0);

                if (data.heatmap) ctx.drawImage(data.heatmap, 0, 0);
                if (data.path) ctx.drawImage(data.path, 0, 0);

                // 4. 다운로드 실행
                triggerCanvasDownload(canvas, fileName);
            } else {
                throw new Error(document.textData['viewProjectPageFailedDownload']);
            }
        }, 
    );
}

function convertToStaticText(inputElement) {
    const cell = inputElement.closest('.pageName');
    const newName = inputElement.value.trim() || inputElement.placeholder;
    const pageId = cell.getAttribute('data-id'); // 없을 경우 null 또는 빈 문자열
    
    savePageNameToServer(pageId, newName, cell);

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

async function savePageNameToServer(id, name, cellElement) {
    // 1. 생성(Create)인지 수정(Rename)인지 판별
    const isNew = !id || id === ""; 

    // URL 설정 (아까 추가한 라우터 경로에 맞춤)
    const url = isNew ? '/dashboard/project/page/create' : '/dashboard/project/page/rename';
    
    // 현재 URL에서 프로젝트 ID 추출 (예: /view/3 -> 3)
    // 혹은 EJS에서 전역변수로 심어놓은 projectId가 있다면 그것을 사용
    const pathSegments = window.location.pathname.split('/');
    const projectId = pathSegments[pathSegments.length - 1]; // URL 구조에 따라 조정 필요

    const payload = isNew 
        ? { projectId: projectId, newName: name } 
        : { imageId: id, newName: name };

    window.sendData(url, 'POST',
        (data) => {
            if (isNew && data.newId && cellElement) {
                // 1. data-id 업데이트
                cellElement.setAttribute('data-id', data.newId);

                // 2. 부모 Row 찾기
                const row = cellElement.closest('.pageElement');

                // 3. 버튼들의 href 링크 업데이트 함수 호출
                updateRowLinks(row, data.newId);
            }
        },
        (data) => { },
        payload
    )
}

function updateRowLinks(row, newId) {
    if (!row) return;

    const downloadBtn = row.querySelector('.btnGroup a:nth-child(1)');
    if (downloadBtn) {
        downloadBtn.href = `/dashboard/project/page/download/${newId}`;
    }

    // 2. Reset 버튼
    const resetBtn = row.querySelector('.resetBtn');
    if (resetBtn) {
        resetBtn.href = `/dashboard/project/page/reset/${newId}`;
    }

    // 3. Delete 버튼
    const deleteBtn = row.querySelector('.deleteBtn');
    if (deleteBtn) {
        deleteBtn.href = `/dashboard/project/page/delete/${newId}`;
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

function resetVisibilityButtons() {
    const toggleBtns = document.querySelectorAll('.viewProject .uiGroup .visibleBtn');
    toggleBtns.forEach(btn => {
        btn.classList.remove('active'); 
        
        const slash = btn.querySelector('.fi-rr-slash');
        if (slash) {
            slash.style.opacity = '1'; // 버튼 꺼짐 -> 빗금 보이기
        }
    });
}

const dropArea = document.querySelector('.viewProject .page .result .dropHere');
const fileInput = document.getElementById('fileData');

const addFileUi = document.querySelector('.viewProject .page .result .uiGroup .addFile');
const fileInputContainer = addFileUi.querySelector('.fileInput');

function isPageSelected() {
    const pageIdInput = document.getElementById('currentPageId');
    if (!pageIdInput || !pageIdInput.value) {
        window.showClientErrorMsg(document.textData['listPageNeedSelectMsg'])
        return false;
    }
    return true;
}

function createMergedCanvas() {
    const dropArea = document.querySelector('.viewProject .page .result .dropHere');
    const container = dropArea.querySelector('.imageContainer');
    
    if (!container) return null;

    const imgOriginal = container.querySelector('.img.before');
    const imgHeatmap = container.querySelector('.img.after[alt="Heatmap"]');
    const imgPath = container.querySelector('.img.after[alt="path"]');

    if (!imgOriginal) return null;

    // 1. 캔버스 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 2. 크기 설정
    canvas.width = imgOriginal.naturalWidth;
    canvas.height = imgOriginal.naturalHeight;

    // 3. 그리기 (원본 -> 히트맵 -> 경로 순서)
    ctx.drawImage(imgOriginal, 0, 0, canvas.width, canvas.height);

    // * 눈(Toggle) 버튼으로 숨겼더라도, 다운로드 시에는 포함할지 여부 결정
    // "클릭 시 표시되는 이미지와 같게"라고 하셨으므로, DOM에 존재하면 그립니다.
    if (imgHeatmap) {
        ctx.drawImage(imgHeatmap, 0, 0, canvas.width, canvas.height);
    }
    if (imgPath) {
        ctx.drawImage(imgPath, 0, 0, canvas.width, canvas.height);
    }

    return canvas;
}

dropArea.addEventListener('click', () => {
    if (!isPageSelected()) return;

    const canvas = createMergedCanvas();

    if (canvas) {
        const mergedDataURL = canvas.toDataURL('image/png');
        
        const newWindow = window.open('');
        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Merged Result</title>
                        <style>
                            body { margin: 0; background-color: #222; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                            img { max-width: 95%; max-height: 95%; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
                        </style>
                    </head>
                    <body>
                        <img src="${mergedDataURL}" />
                    </body>
                </html>
            `);
            newWindow.document.close();
        } else {
            alert("팝업 차단을 해제해주세요.");
        }
    } else {
        // [CASE B] 이미지가 없으면 파일 업로드 창 열기
        fileInput.click();
    }
});

fileInputContainer.addEventListener('click', (e) => {
    e.stopPropagation(); // 부모인 dropArea의 클릭 이벤트 전파 중단
    if (!isPageSelected()) return;
    
    // 여기는 이미지가 있든 없든 무조건 업로드 창을 엽니다.
    fileInput.click();
});

// 3. [드래그 진입] 시각적 피드백 제어 (선택사항)
dropArea.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPageSelected()) return; // 선택 안됐으면 스타일 변경 안 함
    dropArea.classList.add('is-dragover');
});

// 4. [드래그 오버] 커서 모양 제어
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isPageSelected()) {
        e.dataTransfer.dropEffect = 'none'; // 금지 커서 표시
        return;
    }
});

// 5. [드롭] 시 체크
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('is-dragover');

    if (!isPageSelected()) return; // ★ 여기서 막아줍니다

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

dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('is-dragover');
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

let selectedFile = null;

function handleFiles(files) {
    if (files.length > 0) {
        selectedFile = files[0]; // 1. 파일 변수에 저장
        console.log('새 파일 선택됨:', selectedFile.name);

        // 2. FileReader로 이미지 미리보기 생성
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const dropArea = document.querySelector('.dropHere');
            
            // 3. [핵심] 기존 DOM(히트맵, 경로 이미지 등)을 덮어쓰기
            // innerHTML에 새로운 문자열을 할당하면 기존 자식 요소들은 메모리에서 해제됩니다.
            dropArea.innerHTML = `
            <div class='imageContainer'>
                <img class='img before' src="${e.target.result}" alt="Original Preview">
            </div>`;

            updateScores(null, null);
            resetVisibilityButtons();
        };
        
        reader.readAsDataURL(selectedFile); // 파일을 Base64 URL로 읽기
    }
}

const defaultDropAreaHTML = document.querySelector('.viewProject .page .result .dropHere').innerHTML;
const pageTitleElement = document.querySelector('.viewProject .page .pageTitle h2');
async function viewPage(ele) {
    const nameCell = ele.querySelector('.pageName');
    const pageId = nameCell.getAttribute('data-id');
    const currentName = nameCell.textContent.trim();
    selectedFile = null;

    // 1. 페이지 제목 변경
    if (pageTitleElement) pageTitleElement.innerText = currentName;

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

    window.sendData(`/dashboard/project/page/detail/${pageId}`, 'GET', 
        (data) => {
            console.log(data);
            if (data.success && data.analyzed && data.original && data.heatmap && data.path) {
                // 분석된 데이터가 있는 경우: 이미지 표시
                dropArea.innerHTML = `
                    <div class='imageContainer'>
                        <img class='img before' src="${data.original}" alt="Original">
                        <img class='img after' src="${data.heatmap}" alt="Heatmap">
                        <img class='img after' src="${data.path}" alt="path">
                    </div>`;
                
                if (data.scores.balance !== undefined) {
                    updateScores(data.scores.balance, data.scores.focus);
                } else {
                    updateScores(null, null);
                }
            } else {
                dropArea.innerHTML = defaultDropAreaHTML;
                updateScores(null, null);
            }
        }
    )
}

const analyzeBtn = document.querySelector('.viewProject .uiGroup .sendDesign');

analyzeBtn.addEventListener('click', () => {
    if (!isPageSelected()) return; 
    
    const hasAnalyzedResult = document.querySelector('.dropHere .img.after');

    if (!selectedFile) {
        if (hasAnalyzedResult) {
            // Case A: 서버에서 불러온 이미지이거나, 방금 분석을 마친 상태
            window.showClientErrorMsg(document.textData['viewProjectAlreadyAnaylzedMsg']);
        } else {
            // Case B: 아예 이미지가 없는 상태
            window.showClientErrorMsg(document.textData['viewProjectPageNoImageMsg']);
        }
        return; // 여기서 함수 종료 (서버 전송 차단)
    }

    // --- 이하 로직은 기존과 동일 ---

    console.log('서버로 전송 시작:', selectedFile.name);

    // 3. DOM에서 ID값들 가져오기
    const projectId = document.getElementById('currentProjectId').value;
    // ... (이하 생략) ...
    const imageId = document.getElementById('currentPageId').value;
    const pageNameInput = document.querySelector('.pageElement.active .pageNameInput');
    const pageTitle = document.getElementById('pageTitle');
    const pageName = pageNameInput ? pageNameInput.value : (pageTitle ? pageTitle.innerText : '');

    // 4. FormData 생성
    const formData = new FormData();
    formData.append('fileData', selectedFile); 
    formData.append('projectId', projectId);
    formData.append('pageName', pageName);
    formData.append('imageId', imageId);

    // 5. 서버 전송
    window.sendData('/dashboard/project/analyze', 'POST',
        (data) => {
            const dropArea = document.querySelector('.dropHere');
            
            console.log(data);
            dropArea.innerHTML = `
            <div class='imageContainer'>
                <img class='img before' src="${data.original}" alt="Original">
                <img class='img after heatmap' src="${data.heatmap}" alt="Heatmap">
                <img class='img after scanpath' src="${data.path}" alt="path">
            </div>`;

            if (data.scores.balance !== undefined) {
                updateScores(data.scores.balance, data.scores.focus);
            } else {
                updateScores(null, null);
            }
            
            selectedFile = null; 
            
            updateCurrentRowStatus(); 
        },
        (err) => { 
            console.error('Upload Error', err);
        },
        formData
    );
});

// [헬퍼 함수] 분석 완료 후 리스트의 상태 아이콘 변경 (선택 사항)
function updateCurrentRowStatus() {
    const activeRow = document.querySelector('.pageElement.active');
    if (activeRow) {
        const statusIcon = activeRow.querySelector('.status');
        if (statusIcon) statusIcon.classList.add('done');
    }
}

function updateScores(balance, focus) {
    const balanceEl = document.querySelector('.score.balance p:nth-child(2)');
    const focusEl = document.querySelector('.score.focus p:nth-child(2)');
    
    // 점수가 있으면 표시, 없으면 '-' 처리
    if (balanceEl) balanceEl.textContent = (balance !== undefined && balance !== null) ? balance : '-';
    if (focusEl) focusEl.textContent = (focus !== undefined && focus !== null) ? focus : '-';
}