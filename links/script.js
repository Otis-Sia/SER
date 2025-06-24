// Highlight current page in navbar
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("nav a");
  const currentPath = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.style.backgroundColor = "#003366";
      link.style.borderRadius = "5px";
    }
  });
