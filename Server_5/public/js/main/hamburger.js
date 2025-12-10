document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const hamburgerBtn = document.querySelector(".hamburger");
  const overlay = document.querySelector(".sidebar-overlay");

  if (!hamburgerBtn || !sidebar) return;

  // 1. 사이드바를 닫는 UI 로직 (히스토리 조작 없음, 순수 UI 변경)
  const closeSidebarUI = () => {
    sidebar.classList.remove("active");
    hamburgerBtn.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  // 2. 사이드바를 여는 로직 (히스토리 추가 포함)
  const openSidebar = () => {
    sidebar.classList.add("active");
    hamburgerBtn.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    
    // 중요: 사이드바가 열렸다는 상태를 브라우저 기록에 추가
    history.pushState({ sidebar: "open" }, "");
  };

  // 3. 햄버거 버튼 클릭 이벤트
  hamburgerBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("active")) {
      // 이미 열려있다면, '뒤로가기'를 실행하여 닫음 (popstate 이벤트 트리거)
      history.back();
    } else {
      openSidebar();
    }
  });

  // 4. 오버레이 클릭 이벤트
  if (overlay) {
    overlay.addEventListener("click", () => {
      // 오버레이를 눌러 닫을 때도 '뒤로가기'를 실행하여 히스토리 꼬임을 방지
      history.back();
    });
  }

  // 5. 뒤로가기 버튼 감지 (핵심 로직)
  window.addEventListener("popstate", () => {
    // 뒤로가기가 발생하면 무조건 사이드바를 닫는 UI 로직 실행
    // (햄버거 버튼이나 오버레이로 닫을 때도 history.back()을 호출하므로 이 코드가 실행됨)
    if (sidebar.classList.contains("active")) {
      closeSidebarUI();
    }
  });

  // 6. 리사이즈 이벤트 (화면이 커지면 강제로 닫음)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      // 화면이 커졌을 때 사이드바가 열려있다면 닫아줍니다.
      // 주의: 리사이즈로 닫힐 때는 히스토리가 남을 수 있으나, 
      // 사용자 경험상 큰 문제는 없으므로 UI만 조용히 닫습니다.
      if (sidebar.classList.contains("active")) {
        history.back(); // 혹은 closeSidebarUI()만 호출해도 됩니다.
      }
    }
  });
});