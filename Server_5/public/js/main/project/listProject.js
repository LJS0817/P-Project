const menuText = document.querySelector('.projectMenu');
const pros = menuText.children[0];
const prages = menuText.children[1];

const ls = document.querySelector('.projects tbody');

const contents = document.querySelector('body .contentContainer .content');

function checkIsEmpty() {
    if(ls.childElementCount == 0) {
        contents.children[3].classList.add('disable');
        contents.children[5].classList.remove('disable');
        contents.children[0].children[1].innerText = "It's empty"

        return true;
    } else {
        contents.children[3].classList.remove('disable');
        contents.children[5].classList.add('disable');
        contents.children[0].children[1].innerText = "Project manage"
    }
    return false;
}
checkIsEmpty();

function updateInfo() {
    if(checkIsEmpty()) return;
    pros.innerText = `Total projects : ${ls.childElementCount} / 6`;
    let cnt = 0;
    for(let i = 0; i < ls.childElementCount; i++) {
        cnt += parseInt(ls.children[i].children[3].innerText)
    }
    prages.innerText = `Total pages : ${cnt} / 60`;
}

function confirmDelete(rUrl, name, ele) {
    window.openPopup(
        `Delete project \"${name}\"`, 
        'danger', 
        `<p>Are you sure you want to proceed<i class="fi fi-tr-folder-xmark-circle danger"></i>You can't undo this action</p>`,
        () => {
            window.sendData(rUrl, 'GET', 
                (data) => {
                    ele.closest('tr').remove();
                    updateInfo();
                }
            )
        });
}
