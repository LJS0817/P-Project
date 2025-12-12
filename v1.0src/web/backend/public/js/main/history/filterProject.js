function filtering(ele, isAllBtn = false) {
    const filterGroup = ele.closest('.details');
    // 'onclick' 속성에 'true'가 포함된 요소를 All 버튼으로 간주
    const allFilter = filterGroup.querySelector('.filter[onclick*="true"]'); 
    // All 버튼을 제외한 나머지 버튼들
    const otherFilters = filterGroup.querySelectorAll('.filter:not([onclick*="true"])');

    // 1. [All 버튼]을 클릭했을 때
    if (isAllBtn) {
        // 이미 켜져있지 않을 때만 동작 (All을 눌러서 끌 수는 없음)
        if (!ele.classList.contains('active')) {
            ele.classList.add('active');
            // 나머지 버튼들은 모두 끔
            otherFilters.forEach(f => f.classList.remove('active'));
        }
    } 
    // 2. [개별 버튼]을 클릭했을 때
    else {
        // 클릭한 버튼의 active 상태 토글 (켜져있으면 끄고, 꺼져있으면 킴)
        ele.classList.toggle('active');

        // 현재 켜져있는 개별 버튼들의 개수 확인
        const activeCount = Array.from(otherFilters).filter(f => f.classList.contains('active')).length;

        if (activeCount === 0) {
            // ★ 핵심: 선택된 게 하나도 없으면 'All'을 킴
            if (allFilter) allFilter.classList.add('active');
        } else {
            // 하나라도 선택된 게 있으면 'All'을 끔
            if (allFilter) allFilter.classList.remove('active');
        }
    }

    // 3. 필터링 로직 실행 (화면 갱신)
    applyFilters();
}

function applyFilters() {
    // 1. 현재 활성화된 모든 필터 조건 수집
    // 결과 예시: { project: ['Test'], page: null(All), user: ['Mike', 'Jane'] }
    const activeCriteria = {};
    
    // data-filter-key를 가진 모든 그룹을 찾아서 루프
    document.querySelectorAll('.filter-group[data-filter-key]').forEach(group => {
        const key = group.dataset.filterKey; // 'project', 'page' 등
        const selectedValues = getSelectedValuesInGroup(group);
        activeCriteria[key] = selectedValues;
    });

    // 2. 날짜 값 가져오기 (범위 검색은 특수하므로 별도 처리)
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // 3. 리스트 필터링
    // [수정] history.ejs에서 추가한 .history 클래스를 가진 요소를 찾습니다.
    const items = document.querySelectorAll('.historyList .history');

    items.forEach(item => {
        let isVisible = true;

        // (A) 동적 필터 검사 (Project, Page, User 등 자동 처리)
        // criteria에 있는 키(key)들만 검사합니다.
        for (const [key, allowedValues] of Object.entries(activeCriteria)) {
            // allowedValues가 null이면 'All'이므로 통과
            if (!allowedValues) continue;

            // 리스트 아이템의 데이터 가져오기 (예: data-project="...")
            const itemValue = item.dataset[key];

            // 데이터가 없거나, 선택된 필터 목록에 없으면 숨김
            if (!itemValue || !allowedValues.includes(itemValue)) {
                isVisible = false;
                break; // 하나라도 안 맞으면 즉시 중단
            }
        }

        // (B) 날짜 검사 (별도 로직)
        if (isVisible) {
            const itemDate = item.dataset.date;
            if (!checkDateRange(startDate, endDate, itemDate)) {
                isVisible = false;
            }
        }

        // (C) 결과 적용
        // 보여질 때는 기존 레이아웃(flex)을 유지하기 위해 '' 또는 'flex'를 사용
        item.style.display = isVisible ? '' : 'none';
    });
}

// [보조] 특정 그룹 내에서 선택된 텍스트들 배열로 반환
function getSelectedValuesInGroup(groupElement) {
    const allBtn = groupElement.querySelector('.filter[onclick*="true"]');
    
    // All 버튼이 활성화되어 있으면 null 반환 (필터링 안 함)
    if (allBtn && allBtn.classList.contains('active')) {
        return null;
    }

    // 활성화된 버튼들의 텍스트 수집
    const activeFilters = groupElement.querySelectorAll('.filter.active:not([onclick*="true"])');
    
    // [수정 2] 선택된 것이 0개라면 -> [] 대신 null을 반환하여 전체 보여주기로 처리
    if (activeFilters.length === 0) return null; 
    
    return Array.from(activeFilters).map(el => el.textContent.trim());
}

// [보조] 날짜 범위 확인 (이전과 동일)
function checkDateRange(start, end, targetDate) {
    if (!targetDate) return false; // 날짜 데이터가 없으면 숨김(선택사항)
    if (!start && !end) return true; // 날짜 필터가 없으면 통과

    const target = new Date(targetDate).setHours(0,0,0,0);
    const from = start ? new Date(start).setHours(0,0,0,0) : null;
    const to = end ? new Date(end).setHours(0,0,0,0) : null;

    if (from && target < from) return false;
    if (to && target > to) return false;
    
    return true;
}

// 날짜 변경 이벤트 리스너 연결
document.getElementById('startDate').addEventListener('change', applyFilters);
document.getElementById('endDate').addEventListener('change', applyFilters);

const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');


startDateInput.addEventListener('click', function (e) {
    if (e.target === startDateInput) {
        if (startDateInput.showPicker) {
            startDateInput.showPicker();
        }
    }
});

endDateInput.addEventListener('click', function (e) {
    if (e.target === endDateInput) {
        if (endDateInput.showPicker) {
            endDateInput.showPicker();
        }
    }
});

const scrollContainers = document.querySelectorAll('.histories .filterContainer .filters .details');

scrollContainers.forEach((container) => {
    container.addEventListener('wheel', (evt) => {
        // 1. 휠 이벤트가 발생했을 때 상위 페이지 스크롤 방지
        evt.preventDefault(); 
        
        // 2. 휠을 굴린 만큼(deltaY) 가로(scrollLeft)로 이동
        // deltaY가 양수면 오른쪽, 음수면 왼쪽으로 스크롤됨
        container.scrollLeft += evt.deltaY;
    });
});