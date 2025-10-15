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

// Hizmetler cards background rotation functionality
function initHizmetlerCards() {
  const hizmetlerCards = document.querySelectorAll('#hizmetler .card');
  if (hizmetlerCards.length === 0) return;

  // Define image arrays for each category
  const imageCategories = {
    tabela: [
      'img/Ürünler/Orta_1486480855.jpg',
      'img/Ürünler/Orta_1486482356.jpg',
      'img/Ürünler/Orta_1486483109.jpg'
    ],
    baski: [
      'img/Ürünler/Orta_1486535081.jpg',
      'img/Ürünler/Orta_1486537357.jpg',
      'img/Ürünler/Orta_1486538658.jpg'
    ],
    arac: [
      'img/Ürünler/Orta_1400865271.jpg',
      'img/Ürünler/Orta_1402578914.jpg',
      'img/Ürünler/Orta_1488521005.jpg'
    ]
  };

  hizmetlerCards.forEach(card => {
    const category = card.getAttribute('data-category');
    const images = imageCategories[category];
    
    if (!images || images.length === 0) return;

    // Create background container and overlay
    const backgroundContainer = document.createElement('div');
    backgroundContainer.className = 'card-background';
    
    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';

    // Insert background and overlay into card
    card.appendChild(backgroundContainer);
    card.appendChild(overlay);

    let currentImageIndex = 0;

    function showNextImage() {
      // Remove active class from current image
      const currentActive = backgroundContainer.querySelector('.active');
      if (currentActive) {
        currentActive.classList.remove('active');
      }

      // Move to next image
      currentImageIndex = (currentImageIndex + 1) % images.length;
      
      // Create new image element
      const img = document.createElement('div');
      img.style.backgroundImage = `url(${images[currentImageIndex]})`;
      img.style.backgroundSize = 'cover';
      img.style.backgroundPosition = 'center';
      img.style.backgroundRepeat = 'no-repeat';
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.opacity = '0';
      img.style.transition = 'opacity 1s ease-in-out';
      
      // Add to background container
      backgroundContainer.appendChild(img);
      
      // Fade in new image
      setTimeout(() => {
        img.style.opacity = '1';
      }, 50);
      
      // Remove old images (keep only the last 2)
      const allImages = backgroundContainer.querySelectorAll('div');
      if (allImages.length > 2) {
        allImages[0].remove();
      }
    }

    // Start with first image
    showNextImage();
    
    // Set up rotation interval
    setInterval(showNextImage, 4500);
  });
}

// Initialize hizmetler cards when page loads
document.addEventListener('DOMContentLoaded', initHizmetlerCards);

// Subnav gallery toggling on Hizmetler page
const subnavLinks = document.querySelectorAll('.subnav-link');
if (subnavLinks.length) {
  const galleries = document.querySelectorAll('.gallery');
  
  // Function to activate a specific tab
  function activateTab(target) {
    const targetBtn = document.querySelector(`[data-target="${target}"]`);
    if (targetBtn) {
      // Update active button
      subnavLinks.forEach((b) => {
        b.classList.toggle('active', b === targetBtn);
        b.setAttribute('aria-selected', b === targetBtn ? 'true' : 'false');
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
    }
  }
  
  // Check URL hash on page load and activate corresponding tab
  const hash = window.location.hash.substring(1); // Remove the # symbol
  if (hash && ['tabela', 'baski', 'arac'].includes(hash)) {
    activateTab(hash);
  }
  
  // Add click event listeners
  subnavLinks.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      activateTab(target);
    });
  });
}