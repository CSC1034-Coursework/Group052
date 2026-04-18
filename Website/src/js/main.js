let navBound = false;

function initNavigation() {
  if (navBound) {
    return;
  }

  const burger = document.getElementById('navBurger');
  const nav = document.getElementById('navLinks');

  if (!burger || !nav) {
    return;
  }

  navBound = true;

  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    }
  });
}

document.addEventListener('DOMContentLoaded', initNavigation);
document.addEventListener('components:loaded', initNavigation);