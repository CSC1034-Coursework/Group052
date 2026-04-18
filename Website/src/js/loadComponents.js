document.addEventListener('DOMContentLoaded', async () => {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  const requests = [];

  if (headerPlaceholder) {
    requests.push(
      fetch('../html/components/header.html')
        .then((response) => response.text())
        .then((html) => {
          headerPlaceholder.innerHTML = html;
          setActiveNavLink();
        })
    );
  }

  if (footerPlaceholder) {
    requests.push(
      fetch('../html/components/footer.html')
        .then((response) => response.text())
        .then((html) => {
          footerPlaceholder.innerHTML = html;
        })
    );
  }

  await Promise.all(requests);
  document.dispatchEvent(new CustomEvent('components:loaded'));
});

function setActiveNavLink() {
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const navLinks = document.querySelectorAll('.nav__links .nav__link');

  navLinks.forEach((link) => {
    link.classList.remove('nav__link--active');
    const linkPage = (link.getAttribute('href') || '').split('/').pop().toLowerCase();

    if (linkPage === currentPage) {
      link.classList.add('nav__link--active');
    }
  });
}
