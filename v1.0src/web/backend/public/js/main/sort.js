const lists = document.querySelectorAll('.list');
lists.forEach(list => {
    Array.from(list.children).forEach((row, index) => {
        // 나중에 정렬을 초기화할 때 사용하기 위해 속성 부여
        row.setAttribute('data-original-index', index);
    });
});

const headers = document.querySelectorAll('.categories .sortable');
headers.forEach(header => {
    header.addEventListener('click', () => {
        handleMultiSort(header);
    });
});

function handleMultiSort(clickedHeader) {
    const listParent = clickedHeader.closest('.listParent');
    const list = listParent.querySelector('.list');
    const headerRow = clickedHeader.parentElement;
    const colIndex = Array.from(headerRow.children).indexOf(clickedHeader);

    // ... (기존 정렬 상태 토글 로직 유지) ...
    let currentOrder = null;
    if (clickedHeader.classList.contains('desc')) currentOrder = 'desc';
    else if (clickedHeader.classList.contains('asc')) currentOrder = 'asc';

    let newOrder = null;
    if (currentOrder === null) newOrder = 'desc';
    else if (currentOrder === 'desc') newOrder = 'asc';
    else newOrder = null;

    if (!listParent.sortHistory) listParent.sortHistory = [];
    listParent.sortHistory = listParent.sortHistory.filter(h => h.colIndex !== colIndex);
    if (newOrder) listParent.sortHistory.unshift({ colIndex: colIndex, order: newOrder });
    if (listParent.sortHistory.length > 3) listParent.sortHistory.pop();

    headerRow.querySelectorAll('.sortable').forEach(h => {
        h.classList.remove('asc', 'desc');
        h.removeAttribute('data-order');
    });

    listParent.sortHistory.forEach((historyItem) => {
        const targetHeader = headerRow.children[historyItem.colIndex];
        targetHeader.classList.add(historyItem.order);
        targetHeader.setAttribute('data-order', historyItem.order);
    });

    const rows = Array.from(list.children);

    if (listParent.sortHistory.length > 0) {
        // 정렬 규칙이 있을 때
        rows.sort((rowA, rowB) => {
            for (let rule of listParent.sortHistory) {
                const cellA = rowA.children[rule.colIndex].innerText.trim();
                const cellB = rowB.children[rule.colIndex].innerText.trim();
                if (cellA !== cellB) {
                    return compareValues(cellA, cellB, rule.order);
                }
            }
            return 0;
        });
    } else {
        // [수정됨] 정렬 규칙이 모두 사라지면 'data-original-index' 기준으로 복구
        rows.sort((rowA, rowB) => {
            const indexA = parseInt(rowA.getAttribute('data-original-index'));
            const indexB = parseInt(rowB.getAttribute('data-original-index'));
            return indexA - indexB;
        });
    }

    list.innerHTML = '';
    rows.forEach(row => list.appendChild(row));
}

// compareValues 함수는 기존 그대로 유지
function compareValues(a, b, order) {
    // ... 기존 코드 ...
    const cleanA = a.replace(/[^0-9.-]+/g, "");
    const cleanB = b.replace(/[^0-9.-]+/g, "");
    const numA = parseFloat(cleanA);
    const numB = parseFloat(cleanB);

    let result = 0;
    if (!isNaN(numA) && !isNaN(numB) && /\d/.test(a) && /\d/.test(b)) {
        result = numA - numB;
    } else {
        result = a.localeCompare(b);
    }
    return order === 'asc' ? result : -result;
}