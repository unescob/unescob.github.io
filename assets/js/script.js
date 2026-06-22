'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }


// sidebar variables + toggle for mobile
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebarBtn) sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });


// ---- project detail modal ----
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalCategory = document.querySelector("[data-modal-category]");
const modalTech = document.querySelector("[data-modal-tech]");
const modalText = document.querySelector("[data-modal-text]");
const modalLinks = document.querySelector("[data-modal-links]");

const toggleModal = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

const projectItems = document.querySelectorAll("[data-project]");

for (let i = 0; i < projectItems.length; i++) {
  const item = projectItems[i];
  const trigger = item.querySelector("[data-project-trigger]");
  const detail = item.querySelector("[data-project-detail]");

  trigger.addEventListener("click", function () {
    modalImg.src = item.dataset.img;
    modalImg.alt = item.dataset.title;
    modalTitle.innerHTML = item.dataset.title;
    modalCategory.innerHTML = item.dataset.category || "";
    modalTech.innerHTML = item.dataset.tech ? ("<strong>Tech:</strong> " + item.dataset.tech) : "";
    modalText.innerHTML = detail ? detail.innerHTML : "";

    // build links
    modalLinks.innerHTML = "";
    let links = [];
    try { links = JSON.parse(item.dataset.links || "[]"); } catch (e) { links = []; }
    links.forEach(function (lnk) {
      const a = document.createElement("a");
      a.href = lnk.url;
      a.textContent = lnk.label;
      a.className = "project-modal-link";
      a.target = "_blank";
      a.rel = "noopener";
      modalLinks.appendChild(a);
    });

    toggleModal();
  });
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", toggleModal);
if (overlay) overlay.addEventListener("click", toggleModal);


// ---- smooth-scroll navigation + scroll spy ----
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const sections = document.querySelectorAll("[data-section]");

for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const target = document.getElementById(this.dataset.navLink);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// highlight the nav link for whichever section is in view
const spy = function () {
  let current = sections.length ? sections[0].dataset.section : null;
  const offset = 120;
  sections.forEach(function (sec) {
    if (sec.getBoundingClientRect().top - offset <= 0) current = sec.dataset.section;
  });
  navigationLinks.forEach(function (link) {
    link.classList.toggle("active", link.dataset.navLink === current);
  });
};

window.addEventListener("scroll", spy, { passive: true });
window.addEventListener("load", spy);
spy();
