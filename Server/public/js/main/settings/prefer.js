const selectWrappers = document.querySelectorAll('.customSelect');

selectWrappers.forEach(wrapper => {
    const trigger = wrapper.querySelector('.selectTrigger');
    const options = wrapper.querySelectorAll('.optionItem');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');

    const initialSelected = wrapper.querySelector('.optionItem.selected');

    if (initialSelected) {
        // 선택된 항목이 있다면 버튼 텍스트와 hidden input 값을 업데이트합니다.
        trigger.textContent = initialSelected.textContent;
        hiddenInput.value = initialSelected.getAttribute('data-value');
    } else {
        // (선택 사항) 만약 selected가 하나도 없다면 첫 번째 옵션을 기본값으로 설정
        if (options.length > 0) {
            options[0].classList.add('selected');
            trigger.textContent = options[0].textContent;
            hiddenInput.value = options[0].getAttribute('data-value');
        }
    }

    trigger.addEventListener('click', (e) => {
        closeAllSelects(wrapper);
        wrapper.classList.toggle('open');
        e.stopPropagation(); 
    });

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            if(!wrapper.classList.contains('open')) {
                return;
            }
            const value = option.getAttribute('data-value');
            const text = option.textContent;

            trigger.textContent = text;

            hiddenInput.value = value;

            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            wrapper.classList.remove('open');
        });
    });
});

document.addEventListener('click', () => {
    closeAllSelects(null);
});

function closeAllSelects(exceptWrapper) {
    selectWrappers.forEach(wrapper => {
        if (wrapper !== exceptWrapper) {
            wrapper.classList.remove('open');
        }
    });
}

const themeToggle = document.getElementById('themeToggle');
const textLeft = document.getElementById('textLeft');
const textRight = document.getElementById('textRight');

function updateToggleColors() {
    if (themeToggle.checked) {
        textRight.classList.add('active');
        textLeft.classList.remove('active');
    } else {
        textLeft.classList.add('active');
        textRight.classList.remove('active');
    }
}

themeToggle.addEventListener('change', updateToggleColors);
updateToggleColors();

const themeDots = document.querySelectorAll('.themeDots .dot');

const getTheme = [
    'default',
    'juice',
    'sand',
    'lavender',
    'jungle'
];

let prevThemeIndex = 0;

themeDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        if(prevThemeIndex == index) return;
        themeDots.forEach(d => d.classList.remove('active'));

        dot.classList.add('active');

        document.body.classList.remove(getTheme[prevThemeIndex]);
        document.body.classList.add(getTheme[index]);
        prevThemeIndex = index;
        console.log(`Theme Dot ${index + 1} selected`);
    });
});


const themeModes = document.querySelectorAll('.themeModes .mode');

themeModes.forEach((mode, index) => {
    mode.addEventListener('click', () => {
        themeModes.forEach(m => m.classList.remove('active'));

        if(index == 1 && !document.body.classList.contains('dark')) document.body.classList.add('dark')
        else if(document.body.classList.contains('dark')) document.body.classList.remove('dark')
        else if (index == 2 && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark');
        }
        mode.classList.add('active');

        console.log(`Mode ${index + 1} selected`);
    });
});