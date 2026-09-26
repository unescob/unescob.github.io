'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }


// sidebar variables + toggle for mobile
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebarBtn) sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });


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

// Stable fragment URLs work on GitHub Pages without server routing.
const detailItems = new Map(Array.from(document.querySelectorAll('[data-detail-id]'),
  item => [item.dataset.detailId, item]));
const modalContainer = document.querySelector('[data-modal-container]');
const dialog = modalContainer.querySelector('[role="dialog"]');
const closeButton = document.querySelector('[data-modal-close-btn]');
const overlay = document.querySelector('[data-overlay]');
const copyButton = document.querySelector('[data-copy-link]');
const copyStatus = document.querySelector('[data-copy-status]');
const linkFallback = document.querySelector('[data-link-fallback]');
const background = document.querySelectorAll('.page-scroll, .navbar, [data-sidebar]');
const defaultTitle = document.title;
let activeItem = null;
let returnFocus = null;
let previousOverflow = '';

function hideDetail() {
  if (!activeItem) return;
  activeItem = null;
  modalContainer.classList.remove('active');
  overlay.classList.remove('active');
  background.forEach(element => { element.inert = false; });
  document.body.style.overflow = previousOverflow;
  document.title = defaultTitle;
  if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
}

function showDetail(item) {
  if (activeItem === item) return;
  if (!activeItem) {
    returnFocus = document.activeElement === document.body
      ? item.querySelector('[data-detail-link]') : document.activeElement;
    previousOverflow = document.body.style.overflow;
  }
  activeItem = item;
  const title = item.dataset.title;
  const image = document.querySelector('[data-modal-img]');
  if (item.dataset.img) image.src = item.dataset.img;
  image.alt = title;
  dialog.classList.toggle('no-banner', item.dataset.hideModalImage === 'true');
  document.querySelector('[data-modal-title]').textContent = title;
  document.querySelector('[data-modal-category]').textContent = item.dataset.category || '';
  const tech = document.querySelector('[data-modal-tech]');
  tech.textContent = item.dataset.tech ? 'Tech: ' + item.dataset.tech : '';
  tech.hidden = !item.dataset.tech;
  const detail = item.querySelector('[data-project-detail], [data-experience-detail]');
  document.querySelector('[data-modal-text]').innerHTML = detail ? detail.innerHTML : '';
  const linksContainer = document.querySelector('[data-modal-links]');
  linksContainer.replaceChildren();
  let links = [];
  try { links = JSON.parse(item.dataset.links || '[]'); } catch (_) { /* No links. */ }
  links.forEach(link => {
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.textContent = link.label;
    anchor.className = 'project-modal-link';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    linksContainer.appendChild(anchor);
  });
  copyStatus.textContent = '';
  linkFallback.hidden = true;
  modalContainer.classList.add('active');
  overlay.classList.add('active');
  background.forEach(element => { element.inert = true; });
  document.body.style.overflow = 'hidden';
  document.title = title + ' | ' + defaultTitle;
  dialog.scrollTop = 0;
  closeButton.focus({ preventScroll: true });
}

function syncDetailFromURL() {
  // A lookup, rather than a CSS selector, also handles unknown/malformed hashes safely.
  const item = detailItems.get(window.location.hash.slice(1));
  if (item) showDetail(item);
  else hideDetail();
}

function openDetail(item) {
  const hash = '#' + item.dataset.detailId;
  if (window.location.hash !== hash) {
    history.pushState({ portfolioDetail: true }, '', hash);
  }
  showDetail(item);
}

function closeDetail() {
  if (!activeItem) return;
  if (history.state && history.state.portfolioDetail) {
    history.back();
  } else {
    // Fresh shared links should close into the portfolio, not leave the website.
    const item = activeItem;
    const section = item.hasAttribute('data-experience') ? 'resume' : 'projects';
    history.replaceState(null, '', '#' + section);
    hideDetail();
    item.scrollIntoView({ block: 'center' });
  }
}

detailItems.forEach(item => {
  const trigger = item.querySelector('[data-project-trigger]');
  if (trigger) trigger.addEventListener('click', () => openDetail(item));
  item.querySelector('[data-detail-link]').addEventListener('click', event => {
    // Preserve the browser's normal modified-click / open-in-new-tab behavior.
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openDetail(item);
  });
});

copyButton.addEventListener('click', async () => {
  const item = activeItem;
  if (!item) return;
  const url = new URL(window.location.href);
  url.hash = item.dataset.detailId;
  try {
    await navigator.clipboard.writeText(url.href);
    if (activeItem === item) copyStatus.textContent = 'Link copied!';
  } catch (_) {
    // Clipboard access can be denied or unavailable when previewing local files.
    if (activeItem !== item) return;
    copyStatus.textContent = 'Select and copy the link below.';
    linkFallback.hidden = false;
    linkFallback.value = url.href;
    linkFallback.focus();
    linkFallback.select();
  }
});

closeButton.addEventListener('click', closeDetail);
overlay.addEventListener('click', closeDetail);
document.addEventListener('keydown', event => {
  if (!activeItem) return;
  if (event.key === 'Escape') { event.preventDefault(); closeDetail(); }
  if (event.key === 'Tab') {
    const focusable = Array.from(dialog.querySelectorAll('button, a[href], input, [tabindex="0"]'))
      .filter(element => !element.hidden && !element.disabled && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});
window.addEventListener('popstate', syncDetailFromURL);
window.addEventListener('hashchange', syncDetailFromURL);
syncDetailFromURL();
