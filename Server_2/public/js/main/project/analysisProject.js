const thumb = document.getElementById('slider');
const track = document.getElementById('track');
let isDragging = false;

const trackHeight = track.offsetHeight;
const trackRect = track.getBoundingClientRect();
const thumbHeight = thumb.offsetHeight;

thumb.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    thumb.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const mouseY = e.clientY;

    let newBottom = trackRect.bottom - mouseY - (thumbHeight / 2);

    newBottom = Math.max(0, Math.min(newBottom, trackHeight - thumbHeight));

    thumb.style.bottom = newBottom + 'px';

    const percentage = Math.round((newBottom / (trackHeight - thumbHeight)) * 100) * 0.01;
    thumb.children[2].style.opacity = 1 - percentage;
    thumb.children[0].style.opacity = 1 - percentage;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    thumb.style.cursor = 'grab';
});

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
                <div class="status"> <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24">
                        <path d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.021 512.021" style="enable-background:new 0 0 512.021 512.021;">
                        <path d="M301.258,256.01L502.645,54.645c12.501-12.501,12.501-32.769,0-45.269c-12.501-12.501-32.769-12.501-45.269,0l0,0 L256.01,210.762L54.645,9.376c-12.501-12.501-32.769-12.501-45.269,0s-12.501,32.769,0,45.269L210.762,256.01L9.376,457.376 c-12.501,12.501-12.501,32.769,0,45.269s32.769,12.501,45.269,0L256.01,301.258l201.365,201.387 c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L301.258,256.01z" />
                    </svg>
                </div>
            </div>
            <p class="area">${currentDateTime}</p>
            <div class="btnGroup area">
                <a href="#">Download</a>
                <a href="#" class="resetBtn">Reset</a>
                <a href="#" class="deleteBtn">Delete</a>
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
            
            window.openPopup('Reset page data', 'danger', `<p>${currentName} 페이지 데이터를 초기화하시겠습니까</p>`, () => {
                // row.remove();
                fetch(resetBtn.href, {
                    method: 'GET'
                })
                .then(response => {
                    if (response.ok) {
                        const dateElement = row.querySelector('p.area');
                        if (dateElement) {
                            dateElement.textContent = getCurrentDateTimeString();
                        }
                        const statusElement = row.querySelector('.status.done');
                        if(statusElement) statusElement.classList.remove('done');
                    } else {
                        console.error('삭제 실패');
                    }
                })
                .catch(error => console.error('에러 발생:', error));
            })
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentName = row.querySelector('.pageNameInput')?.value || row.querySelector('.pageName').textContent.trim();
            
            window.openPopup('Delete page', 'danger', `<p>${currentName} 페이지를 삭제하시겠습니까</p>`, () => {
                fetch(deleteBtn.href, {
                    method: 'GET'
                })
                .then(response => {
                    if (response.ok) {
                        row.remove();
                        console.log('삭제 성공');
                    } else {
                        console.error('삭제 실패');
                    }
                })
                .catch(error => console.error('에러 발생:', error));
            })
        });
    }
}

function convertToStaticText(inputElement) {
    const cell = inputElement.closest('.pageName');
    const newName = inputElement.value.trim() || inputElement.placeholder;

    savePageNameToServer(newName);

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

async function savePageNameToServer(name) {
    try {
        console.log(`[서버 전송] 페이지 이름: ${name}`);
        
    } catch (error) {
        console.error("저장 실패:", error);
        alert("저장 실패");
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
            document.body.cursor = 'default';

            if(data.success) {
                console.log('분석 성공: ', data);

                // 결과 이미지를 화면에 표시
                // viewProject.ejs에 이미지가 들어갈 공간

                const dropArea = document.querySelector('.dropHere');
                dropArea.innerHTML = `
                <h3>analyze</h3>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <img src="${data.original}" style="max-width: 45%; border-radius: 10px;">
                    <img src="${data.heatmap}" style="max-width: 45%; border-radius: 10px;">
                    </div>`;
            } else {
                alert('분석 실패' + (data.message || '알 수 없는 오류'));
            }
        })
        .catch(err => {
            document.body.style.cursor = 'default';
            console.error('업로드 에러', err);
            alert('서버가 아퍼');
        });
    }
}