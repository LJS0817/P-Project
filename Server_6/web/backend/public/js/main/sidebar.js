const sidebar = document.getElementById("sidebar");

// let curIndex = 0; // 현재 인덱스 정보 저장

// // 기존에 켜져 있던 메뉴의 active를 지우고, 새로 선택된 메뉴에 active를 부여하는 UI 변경 함수
// function changeView(idx) {
//     if(curIndex > -1) sidebar.children[curIndex].classList.remove("active")
//     curIndex = idx;
//     sidebar.children[curIndex].classList.add("active")
// }

// // 현재 주소창의 경로를 / 기준으로 자른 배열
// const curUrl = window.location.pathname.split('/');
// // const prevUrl = document.referrer.replace('http://ceprj2.gachon.ac.kr:65024', '').split('/');
// // 이전 페이지 주소
// const prevUrl = document.referrer.replace('http://localhost:3000', '').split('/');

// const getUrl = (index) => {
//     if(index == 0) return '/dashboard/'
//     else if(index == 1) return '/dashboard/project'
//     else if(index == 2) return '/dashboard/history'
//     else return '/dashboard/settings'
// }

// const checkUrl = (url) => {
//     if(url.length == 2) {
//         changeView(0);
//     } else if(url[2] == 'project') {
//         changeView(1);
//     } else if(url[2] == 'history') {
//         changeView(2);
//     } else if(url[2] == 'settings') {
//         changeView(3);
//     } else {
//         changeView(0);
//     }
// }

// checkUrl(prevUrl);

// setTimeout(() => {
//     checkUrl(curUrl);
// }, 10);

// // console.log(curUrl);

// for (let i = 0; i < sidebar.children.length; i++) {
//     sidebar.children[i].onclick = () => {
//         changeView(i);
//         location.href = getUrl(i);
//     }
// }

// let curIndex = -1; // 초기값 -1로 설정해서 overview 넘어가는것 방지

// function changeView(idx) {
//     if (curIndex > -1 && sidebar.children[curIndex]) {
//         sidebar.children[curIndex].classList.remove("active");
//     }
//     curIndex = idx;
//     if (sidebar.children[curIndex]) {
//         sidebar.children[curIndex].classList.add("active");
//     }
// }

// const curUrl = window.location.pathname.split('/');

// const CheckUrl = (url) => {
//     if (!url || url.length < 2) return;

//     if (url.length == 2 || (url.length === 3 && url[2] === '')) {
//         changeView(0); // Overview
//     } else if (url[2] == 'project') {
//         changeView(1); // Project
//     } else if (url[2] == 'history') {
//         changeView(2); // History
//     } else if (url[2] == 'settings') {
//         changeView(3); // settings
//     } else {
//         changeView(0);
//     }
// }
const currentPath = window.location.pathname;
let targetItem = null;
let maxMatchLength = 0;
for (let i = 0; i < sidebar.children.length; i++) {
  const link = sidebar.children[i].dataset.link;
  sidebar.children[i].classList.remove("active");
  sidebar.children[i].onclick = () => {
    // changeView(i);
    location.href = link;
  };
  if (currentPath.startsWith(link)) {
    if (link.length > maxMatchLength) {
      maxMatchLength = link.length;
      targetItem = sidebar.children[i];
    }
  }
}
if (targetItem) {
  // [수정] setTimeout으로 약간의 지연(50ms)을 줍니다.
  // 브라우저가 "active가 없는 상태"를 먼저 인식하게 만듭니다.
  setTimeout(() => {
    targetItem.classList.add("active");
  }, 50);
} else {
  // (선택사항) 만약 정확히 일치하는게 없다면?
  // 예: /dashboard/unknown-page 로 들어왔을 때
  // 기본값으로 '/dashboard/'를 켜고 싶다면 여기서 처리 가능
  // const defaultItem = document.querySelector('li[data-link="/dashboard/"]');
  // if(defaultItem) defaultItem.classList.add('active');
}

// 실시간 날짜 표시 로직 추가
function updateTime() {
  const clockElement = document.getElementById("realtime");
  if (!clockElement) return;

  // 사용자의 날짜 포맷 가져오기 (없으면 기본값)
  const format = clockElement.dataset.format || "YYYY. MM. DD HH:mm";

  const now = new Date();

  const year = now.getFullYear();
  const yearShort = String(year).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours24 = now.getHours();
  const hours12 = hours24 % 12 || 12;

  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const ampm = hours24 >= 12 ? "PM" : "AM";

  let result = format
    .replace("YYYY", year)
    .replace("YY", yearShort)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", String(hours24).padStart(2, "0"))
    .replace("hh", String(hours12).padStart(2, "0"))
    .replace("mm", minutes)
    .replace("ss", seconds)
    .replace("a", ampm);

  clockElement.innerText = result;
}

updateTime();
setInterval(updateTime, 1000);
