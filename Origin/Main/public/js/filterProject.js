function filtering(ele, all=false) {
    const filterGroup = ele.closest('.details');
    const allFilter = filterGroup.querySelector('.filter[onclick="filtering(this, true)"]');
    const otherFilters = filterGroup.querySelectorAll('.filter:not([onclick="filtering(this, true)"])');

    if(ele.classList.contains("active")) {
        ele.classList.remove("active");
    } else {
        ele.classList.add("active");
    }

    if(all) {
        const isAllActive = ele.classList.contains("active");

        otherFilters.forEach(filter => {
            if (isAllActive) {
                filter.classList.add("active");
            } else {
                filter.classList.remove("active");
            }
        });

    } 
    else {
        const activeCount = Array.from(otherFilters).filter(filter => filter.classList.contains('active')).length;
        
        const totalCount = otherFilters.length;

        if (activeCount === totalCount) {
            if (allFilter) allFilter.classList.add('active');
        } 
        else {
            if (allFilter) allFilter.classList.remove('active');
        }
    }
}

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