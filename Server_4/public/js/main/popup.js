const popup = document.getElementById('popup');
const content = popup.querySelector('.contentContainer .content');
const popupTitle = popup.querySelector('.contentContainer .popupTitle');
const submitBtn = popup.querySelector('.popupBtnContainer .Btn');
let submitEvent = undefined;
let curBtnType = '';

popup.addEventListener('click', function(event) {
    if (event.target === event.currentTarget) {
        closePopup();
    }
});

window.openPopup = function(title, btnType, html, callback) {
    console.log("TESAD");
    if(!popup.classList.contains("active")) {
        if(curBtnType != '' && submitBtn.classList.contains(curBtnType)) submitBtn.classList.remove(curBtnType);
        curBtnType = btnType;
        submitBtn.classList.add(btnType);
        submitBtn.textContent = title;
        popupTitle.innerText = title;
        popup.classList.add("active");
        content.innerHTML = html;
        submitEvent = callback;
    }
};

function closePopup() {
    popup.classList.remove('active');
    submitEvent = undefined;
}

function submitPopup() {
    if(submitEvent) submitEvent();
    closePopup();
}