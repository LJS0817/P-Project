const sidebar = document.getElementById('sidebar')

let curIndex = 0;

function changeView(idx) {
    if(curIndex > -1) sidebar.children[curIndex].classList.remove("active")
    curIndex = idx;
    sidebar.children[curIndex].classList.add("active")
}

for (let i = 0; i < sidebar.children.length; i++) {
    sidebar.children[i].onclick = () => {
        changeView(i);
    }
}
changeView(0);
console.log('e');