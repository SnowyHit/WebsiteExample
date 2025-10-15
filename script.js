// Inject shared header/footer for all pages and set active nav
async function injectPartials() {
  const headerContainer = document.createElement('div');
  const footerContainer = document.createElement('div');
  headerContainer.setAttribute('data-partial', 'header');
  footerContainer.setAttribute('data-partial', 'footer');

  // Insert at top/bottom of body
  document.body.insertBefore(headerContainer, document.body.firstChild);
  document.body.appendChild(footerContainer);

  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch('partials/header.html'),
      fetch('partials/footer.html')
    ]);
    const [headerHtml, footerHtml] = await Promise.all([
      headerRes.text(), footerRes.text()
    ]);
    headerContainer.innerHTML = headerHtml;
    footerContainer.innerHTML = footerHtml;

    // Set active nav link based on current filename
    const path = window.location.pathname;
    const file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    const links = headerContainer.querySelectorAll('nav a');
    links.forEach((a) => {
      const isActive = a.getAttribute('href') === file;
      if (isActive) a.classList.add('active');
      else a.classList.remove('active');
    });
  } catch (e) {
    // Fail silently if running from local file without fetch permissions
  }
}
injectPartials();

// Carousel functionality (only if present on page)
const carouselEl = document.querySelector('.carousel');
if (carouselEl) {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');
  let currentSlide = 0;
  let interval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      indicators[i].classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function startCarousel() {
    interval = setInterval(nextSlide, 3000);
  }

  function stopCarousel() {
    clearInterval(interval);
  }

  slides.forEach((slide) => {
    slide.addEventListener('click', () => {
      const link = slide.getAttribute('data-link');
      if (link && document.querySelector(link)) {
        document.querySelector(link).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  indicators.forEach((indicator, i) => {
    indicator.addEventListener('click', () => {
      showSlide(i);
    });
  });

  carouselEl.addEventListener('mouseenter', stopCarousel);
  carouselEl.addEventListener('mouseleave', startCarousel);

  // Initialize
  showSlide(0);
  startCarousel();
}

// Subnav gallery toggling on Hizmetler page
const subnavLinks = document.querySelectorAll('.subnav-link');
if (subnavLinks.length) {
  const galleries = document.querySelectorAll('.gallery');
  subnavLinks.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      // Update active button
      subnavLinks.forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      // Show selected gallery, hide others
      galleries.forEach((gal) => {
        const isTarget = gal.getAttribute('data-gallery') === target;
        gal.classList.toggle('hidden', !isTarget);
      });
      // Scroll into view of the first visible gallery
      const activeGallery = document.querySelector('.gallery:not(.hidden)');
      if (activeGallery) {
        activeGallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}