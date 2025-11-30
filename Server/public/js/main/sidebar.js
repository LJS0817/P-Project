const sidebar = document.getElementById('sidebar')

let curIndex = 0;

function changeView(idx) {
    if(curIndex > -1) sidebar.children[curIndex].classList.remove("active")
    curIndex = idx;
    sidebar.children[curIndex].classList.add("active")
}

const curUrl = window.location.pathname.split('/');
// const prevUrl = document.referrer.replace('http://ceprj2.gachon.ac.kr:65024', '').split('/');
const prevUrl = document.referrer.replace('http://localhost:3000', '').split('/');

const getUrl = (index) => {
    if(index == 0) return '/dashboard/'
    else if(index == 1) return '/dashboard/project'
    else if(index == 2) return '/dashboard/history'
    else return '/dashboard/settings'
}

const checkUrl = (url) => {
    if(url.length == 2) {
        changeView(0);
    } else if(url[2] == 'project') {
        changeView(1);
    } else if(url[2] == 'history') {
        changeView(2);
    } else if(url[2] == 'settings') {
        changeView(3);
    } else {
        changeView(0);
    }
}

checkUrl(prevUrl);
setTimeout(() => {
    checkUrl(curUrl);
}, 10);

// console.log(curUrl);

for (let i = 0; i < sidebar.children.length; i++) {
    sidebar.children[i].onclick = () => {
        changeView(i);
        location.href = getUrl(i);
    }
}