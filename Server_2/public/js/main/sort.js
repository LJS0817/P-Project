

document.addEventListener('DOMContentLoaded', () => {
    const headers = document.querySelectorAll('.categories .sortable');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            handleMultiSort(header);
        });
    });
});
function handleMultiSort(clickedHeader) {
    const listParent = clickedHeader.closest('.listParent');
    const list = listParent.querySelector('.list');
    const headerRow = clickedHeader.parentElement;

    const colIndex = Array.from(headerRow.children).indexOf(clickedHeader);

    let currentOrder = null;
    if (clickedHeader.classList.contains('desc')) currentOrder = 'desc';
    else if (clickedHeader.classList.contains('asc')) currentOrder = 'asc';

    let newOrder = null;
    if (currentOrder === null) {
        newOrder = 'desc';
    } else if (currentOrder === 'desc') {
        newOrder = 'asc';
    } else {
        newOrder = null;
    }

    if (!listParent.sortHistory) {
        listParent.sortHistory = [];
    }

    listParent.sortHistory = listParent.sortHistory.filter(h => h.colIndex !== colIndex);

    if (newOrder) {
        listParent.sortHistory.unshift({ colIndex: colIndex, order: newOrder });
    }

    if (listParent.sortHistory.length > 3) {
        listParent.sortHistory.pop();
    }

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
        // [선택 사항] 모든 정렬이 해제되었을 때의 동작
        
    }

    list.innerHTML = '';
    rows.forEach(row => list.appendChild(row));
}

function compareValues(a, b, order) {
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