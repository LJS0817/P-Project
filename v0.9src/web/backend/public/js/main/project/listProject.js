const menuText = document.querySelector('.projectMenu');
const pros = menuText.children[0];
const prages = menuText.children[1];

const ls = document.querySelector('.projects tbody');

const contents = document.querySelector('body .contentContainer .content');

function checkIsEmpty() {
    if(ls.childElementCount == 0) {
        contents.children[4].classList.add('disable');
        contents.children[6].classList.remove('disable');
        contents.children[0].children[1].innerText = document.textData['projectEmptySubtitle']

        return true;
    } else {
        contents.children[4].classList.remove('disable');
        contents.children[6].classList.add('disable');
        contents.children[0].children[1].innerText = document.textData['projectSubtitle']
    }
    return false;
}
checkIsEmpty();

function updateInfo() {
    if(checkIsEmpty()) return;
    pros.innerText = `${document.textData['listProjectCountTitle']} : ${ls.childElementCount} / 6`;
    let cnt = 0;
    for(let i = 0; i < ls.childElementCount; i++) {
        cnt += parseInt(ls.children[i].children[3].innerText)
    }
    prages.innerText = `${document.textData['listPageCountTitle']} : ${cnt} / 60`;
}

function confirmDelete(rUrl, name, ele) {
    window.openPopup(
        `${document.textData['listProjectDeletePopupMsg']}`, 
        'danger', 
        `<p>${document.textData['listProjectDeletePopupDetail']}<p class='popupTargetContainer'>${document.textData['projectTitle']}${document.textData['name']} : \"${name}\"</p><i class="fi fi-tr-folder-xmark-circle danger"></i>${document.textData['noReturn']}</p>`,
        () => {
            window.sendData(rUrl, 'GET', 
                (data) => {
                    ele.closest('tr').remove();
                    updateInfo();
                }
            )
        });
}
