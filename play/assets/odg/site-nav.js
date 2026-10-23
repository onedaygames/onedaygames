(() => {
  const header = document.querySelector('[data-mobile-header]');
  if (!header) return;
  const button = header.querySelector('.odg-menu-toggle');
  const nav = header.querySelector('[data-mobile-nav]');
  const label = button?.querySelector('[data-menu-label]');
  if (!button || !nav || !label) return;

  const mobile = window.matchMedia('(max-width: 960px)');
  const setOpen = (open, restoreFocus = false) => {
    header.dataset.navOpen = String(open);
    button.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    if (restoreFocus) button.focus();
  };

  setOpen(false);
  button.hidden = false;
  header.setAttribute('data-nav-ready', '');
  button.addEventListener('click', () => {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', (event) => {
    if (mobile.matches && event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.dataset.navOpen === 'true') {
      setOpen(false, true);
    }
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  document.addEventListener('focusin', (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => {
    const focusWillHide = mobile.matches && nav.contains(document.activeElement);
    setOpen(false, focusWillHide);
  });
})();
