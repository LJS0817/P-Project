const popup = document.getElementById('popup');

const contentWindow = popup.children[0];

const content = popup.querySelector('.contentContainer .content');
const popupTitle = popup.querySelector('.contentContainer .popupTitle');
const submitBtn = popup.querySelector('.popupBtnContainer .Btn');

const loader = content.innerHTML;

let submitEvent = undefined;
let closeEvent = undefined;
let curBtnType = '';
let submitState = 0;
let popTimerId = undefined;

popup.addEventListener('click', function(event) {
    if (event.target === event.currentTarget && submitState != 1) {
        closePopup();
    }
});

window.openPopup = function(title, btnType, html, submit=undefined, close=undefined) {
    if(curBtnType != '' && submitBtn.classList.contains(curBtnType)) submitBtn.classList.remove(curBtnType);
    curBtnType = btnType;
    if(btnType != '') submitBtn.classList.add(btnType);
    submitBtn.textContent = title;
    popupTitle.innerText = title;
    content.innerHTML = loader + html;

    popup.classList.add("active");
    content.children[0].classList.add('disable');

    submitState = 0;

    submitEvent = submit;
    closeEvent = close;
    // console.log(submitEvent);
};

window.showErrorMsg = (errMsg) => {
    window.openPopup('Error', '', `<p>서버로 전송을 실패하였습니다<br>잠시후 다시 시도해주세요.<br><i class="fi fi-tr-not-found"></i>${errMsg}<br></p>`)
    submitBtn.textContent = "Return";
    submitState = 2;
}

window.showClientErrorMsg = (errMsg) => {
    window.openPopup('Error', '', `<p>작업을 실패했습니다.<br><br><i class="fi fi-tr-not-found"></i>${errMsg}<br></p>`)
    submitBtn.textContent = "Return";
    submitState = 2;
}

window.showLoading = () => {
    if(submitState == 1) return;
    window.openPopup("Proccesing",'', '<div style="height: 7em;"></div>', submitEvent, closeEvent)
    content.children[0].classList.remove('disable');
    content.children[1].classList.add('disable');
    submitState = 1;
}

window.endLoad = (err='') => {
    if(curBtnType != '') submitBtn.classList.remove(curBtnType);
    submitBtn.textContent = err == '' ? "Return ( 3s )" : "Error";
    content.children[0].classList.add('disable');
    content.children[1].classList.remove('disable');
    content.innerHTML = err == '' ? '<p>All done!<i class="fi fi-tr-thumbs-up-trust"></i></p>' : '<p>Error!<i class="fi fi-tr-fail danger"></i></p>'

    submitState = 2;
    popTimerId = setTimeout(() => {
        closePopup()
    }, 3000)
}

function closePopup() {
    popup.classList.remove('active');
    submitEvent = undefined;
    submitState = 0;
    if(closeEvent) {
        closeEvent();
        closeEvent = undefined;
    }
    if(popTimerId) {
        clearTimeout(popTimerId);
        popTimerId = undefined;
    }
}

function submitPopup() {
    if(submitState == 0) { if(submitEvent) submitEvent(); }
    else if(submitState == 1) return;
    else closePopup();
}

window.sendData = async (uri, method, successCallback=undefined, failedCallback=undefined, option={}) => {
    window.showLoading();
    try {
        let fetchOptions = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };

        if (method === 'POST') {
            if(option instanceof FormData) { 
                fetchOptions.body = option;
                delete fetchOptions.headers;
             }
            else fetchOptions.body = JSON.stringify(option);
        }
        else {
            if (option && Object.keys(option).length > 0) {
                const queryParams = new URLSearchParams(option).toString();
                uri += (uri.includes('?') ? '&' : '?') + queryParams;
            }
        }
        
        let res = await fetch(uri, fetchOptions);
        let data = await res.json();
        if(data.success) {
            if(successCallback) successCallback(data);
            window.endLoad();
        } else {
            if(failedCallback) failedCallback(data);
            window.endLoad(data.message);
        }
    } catch (err) {
        console.error(err);
        window.showErrorMsg(err);
    }
}