const popup = document.getElementById('popup');
const content = popup.querySelector('.contentContainer .content');
let submitEvent = undefined;

popup.addEventListener('click', function(event) {
    if (event.target === event.currentTarget) {
        popup.classList.remove('active');
    }
});

window.openPopup = function(html, callback) {
    if(!popup.classList.contains("active")) {
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
    closePopup()
}