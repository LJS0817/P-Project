document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const hamburgerBtn = document.querySelector(".hamburger");
  const overlay = document.querySelector(".sidebar-overlay");

  if (!hamburgerBtn || !sidebar) return;

  hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    hamburgerBtn.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
    document.body.style.overflow = sidebar.classList.contains("active")
      ? "hidden"
      : "";
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      hamburgerBtn.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("active");
      hamburgerBtn.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
});
