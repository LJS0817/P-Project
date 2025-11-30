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
const tableBody = document.querySelector('.viewProject .pageList table tbody');
addPageBtn.addEventListener('click', () => {
    addNewPageRow();
});

function addNewPageRow() {
    const pageCount = tableBody.children.length + 1;

    const newRowHTML = `
            <tr>
                <td><input type="checkbox" name="selectPage"></td>
                <td class="pageName">
                    <input type="text" class="pageNameInput" placeholder="Page ${pageCount}" value="Page ${pageCount}">
                </td>
                <td>
                    <div class="status">
                        <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24"><path d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512.021 512.021" style="enable-background:new 0 0 512.021 512.021;" xml:space="preserve"><path d="M301.258,256.01L502.645,54.645c12.501-12.501,12.501-32.769,0-45.269c-12.501-12.501-32.769-12.501-45.269,0l0,0 L256.01,210.762L54.645,9.376c-12.501-12.501-32.769-12.501-45.269,0s-12.501,32.769,0,45.269L210.762,256.01L9.376,457.376 c-12.501,12.501-12.501,32.769,0,45.269s32.769,12.501,45.269,0L256.01,301.258l201.365,201.387 c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L301.258,256.01z" /></svg>
                    </div>
                </td>
                <td>2024.11.11 20:40</td>
                <td>
                    <div class="btnGroup">
                        <a href="#">Download</a>
                        <a href="#">Reset</a>
                        <a href="#" class="deleteBtn">Delete</a>
                    </div>
                </td>
            </tr>
        `;

    tableBody.insertAdjacentHTML('beforeend', newRowHTML);

    const newRow = tableBody.lastElementChild;
    const nameInput = newRow.querySelector('.pageNameInput');

    nameInput.focus();

    nameInput.addEventListener('blur', () => {
        convertToStaticText(nameInput);
    });

    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            convertToStaticText(nameInput);
        }
    });

    const deleteBtn = newRow.querySelector('.deleteBtn');
    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm(`페이지 "${nameInput.value}"를 삭제하시겠습니까?`)) {
            newRow.remove();
        }
    });
}

function convertToStaticText(inputElement) {
    const cell = inputElement.closest('.pageName');
    const newName = inputElement.value.trim() || inputElement.placeholder;

    cell.innerHTML = '';
    cell.textContent = newName;

    cell.addEventListener('click', () => {
        if (cell.querySelector('.pageNameInput')) return;

        const tempInput = document.createElement('input');
        tempInput.type = 'text';
        tempInput.className = 'pageNameInput';
        tempInput.value = cell.textContent;

        cell.innerHTML = '';
        cell.appendChild(tempInput);
        tempInput.focus();

        tempInput.addEventListener('blur', () => {
            convertToStaticText(tempInput);
        });
        tempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                convertToStaticText(tempInput);
            }
        });
    }, { once: true });
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