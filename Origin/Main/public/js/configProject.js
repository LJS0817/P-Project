const page = document.getElementById('pageName');
let pageList = {};
const pageListUI = document.getElementById('pageList');
const icon = '<svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24"><path d="M18,6h0a1,1,0,0,0-1.414,0L12,10.586,7.414,6A1,1,0,0,0,6,6H6A1,1,0,0,0,6,7.414L10.586,12,6,16.586A1,1,0,0,0,6,18H6a1,1,0,0,0,1.414,0L12,13.414,16.586,18A1,1,0,0,0,18,18h0a1,1,0,0,0,0-1.414L13.414,12,18,7.414A1,1,0,0,0,18,6Z"/></svg>'

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