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
    // console.log(percentage);
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
                <a href="#">Reset</a>
                <a href="#" class="deleteBtn">Delete</a>
            </div>
        </div>
    `;

    // HTML 삽입
    listContainer.insertAdjacentHTML('beforeend', newRowHTML);

    // 방금 추가된 요소 가져오기
    const newRow = listContainer.lastElementChild;
    const nameInput = newRow.querySelector('.pageNameInput');

    // 이벤트 연결
    bindEventsToRow(newRow);

    // 새 항목은 바로 포커스
    if (nameInput) nameInput.focus();
}

function bindEventsToRow(row) {
    const nameInput = row.querySelector('.pageNameInput');
    const deleteBtn = row.querySelector('.deleteBtn');

    if (nameInput) {
        nameInput.addEventListener('blur', () => convertToStaticText(nameInput));
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') convertToStaticText(nameInput);
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentName = row.querySelector('.pageNameInput')?.value || row.querySelector('.pageName').textContent.trim();
            
            if (confirm(`페이지 "${currentName}"를 삭제하시겠습니까?`)) {
                row.remove();
            }
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

        // 이벤트 재연결
        tempInput.addEventListener('blur', () => convertToStaticText(tempInput));
        tempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') convertToStaticText(tempInput);
        });
    }, { once: true }); // 클릭 이벤트는 input이 되면 사라져야 하므로 once: true 추천
}

// 6. 서버 전송 함수 (기존 유지)
async function savePageNameToServer(name) {
    try {
        console.log(`[서버 전송] 페이지 이름: ${name}`);
        // await fetch(...) 
        // 성공 시 로직
    } catch (error) {
        console.error("저장 실패:", error);
        alert("저장 실패");
    }
}

// 7. 날짜 포맷 헬퍼 함수 (YYYY.MM.DD HH:mm)
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
        console.log('선택/드롭된 파일 목록:');
        for (let i = 0; i < files.length; i++) {
             console.log(`- ${files[i].name} (${(files[i].size / 1024 / 1024).toFixed(2)} MB)`);
        }

    }
}