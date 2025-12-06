const page = document.getElementById('pageName');
let pageList = {};
const pageListUI = document.getElementById('pageList');
const icon = '<i class="fi fi-rr-cross"></i>'

function removeElement(e) {
    delete pageList[e.innerText]
    e.remove();
    console.log(pageList);
}

page.onkeyup = (e) => {
    if (page.value.length > 0) {
        if(pageList[page.value] == undefined) {
            if (page.classList.contains("error")) page.classList.remove('error');
            if(e.key == "Enter") {
                pageListUI.innerHTML += `<p class='pageElement' onclick='removeElement(this)'>${page.value}${icon}</p>`;
                pageList[page.value] = 0;
                page.value = '';
            }
        }  else if (!page.classList.contains("error")) {
            page.classList.add('error');
        }
    } else if (page.classList.contains("error")) {
        page.classList.remove('error');
    }
}

const swPublic = document.getElementById('switchVisibility');
let isPublic = true;
swPublic.onclick = (e) => {
    e.preventDefault()
    isPublic = !isPublic;
    swPublic.children[isPublic ? 2 : 0].classList.remove("active");
    swPublic.children[isPublic ? 0 : 2].classList.add("active");
    swPublic.children[1].children[0].checked = !isPublic;
}

const form = document.getElementById('projectForm');
form.onkeydown = (e) => {
    if (e.key === 'Enter') e.preventDefault();
}