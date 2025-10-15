// SPA (Single Page Application) Router
class SPARouter {
  constructor() {
    this.currentPage = 'home';
    this.isLoading = false;
    this.pageCache = new Map();
    this.init();
  }

  init() {
    this.injectPartials();
    this.setupEventListeners();
    this.handleInitialRoute();
  }

// Inject shared header/footer for all pages and set active nav
  async injectPartials() {
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

      this.setupNavigationEvents();
    } catch (e) {
      console.log('Running locally - partials not loaded');
    }
  }

  setupNavigationEvents() {
    const navLinks = document.querySelectorAll('nav a[data-route]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigateTo(route);
      });
    });
  }

  setupEventListeners() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      const route = e.state?.route || 'home';
      this.navigateTo(route, false);
    });

    // Handle card clicks with route data
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.card[data-route]');
      if (card) {
        e.preventDefault();
        const route = card.getAttribute('data-route');
        const hash = card.getAttribute('data-hash');
        this.navigateTo(route, true, hash);
      }
    });
  }

  handleInitialRoute() {
    // Check URL hash for initial route
    const hash = window.location.hash.substring(1);
    if (hash && ['home', 'hakkimizda', 'hizmetler', 'galeri', 'referanslar', 'iletisim'].includes(hash)) {
      this.navigateTo(hash, false);
    } else {
      this.loadPage('home');
    }
  }

  async navigateTo(route, pushState = true, hash = null) {
    if (this.isLoading || this.currentPage === route) return;

    this.isLoading = true;
    this.currentPage = route;

    // Update URL
    if (pushState) {
      const url = hash ? `#${route}#${hash}` : `#${route}`;
      window.history.pushState({ route, hash }, '', url);
    }

    // Update active nav link
    this.updateActiveNav(route);

    // Load page content
    await this.loadPage(route, hash);

    this.isLoading = false;
  }

  updateActiveNav(route) {
    const navLinks = document.querySelectorAll('nav a[data-route]');
    navLinks.forEach(link => {
      const isActive = link.getAttribute('data-route') === route;
      link.classList.toggle('active', isActive);
    });
  }

  async loadPage(route, hash = null) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Show loading state
    mainContent.innerHTML = `
      <div class="page-container">
        <div class="loading">Sayfa yükleniyor...</div>
      </div>
    `;

    try {
      let content;
      
      // Check cache first
      if (this.pageCache.has(route)) {
        content = this.pageCache.get(route);
      } else {
        // Load page content
        const response = await fetch(`pages/${route}.html`);
        if (!response.ok) {
          throw new Error(`Page not found: ${route}`);
        }
        content = await response.text();
        this.pageCache.set(route, content);
      }

      // Create new page container
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      pageContainer.innerHTML = content;

      // Replace content with transition
      setTimeout(() => {
        mainContent.innerHTML = '';
        mainContent.appendChild(pageContainer);
        
        // Trigger fade-in animation
        setTimeout(() => {
          pageContainer.classList.add('active');
        }, 50);

        // Initialize page-specific functionality
        this.initializePageContent(route, hash);
      }, 300);

    } catch (error) {
      console.error('Error loading page:', error);
      mainContent.innerHTML = `
        <div class="page-container active">
          <section>
            <h2>Hata</h2>
            <p>Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.</p>
          </section>
        </div>
      `;
      this.isLoading = false;
    }
  }

  initializePageContent(route, hash = null) {
    // Initialize carousel if present
    this.initCarousel();
    
    // Initialize hizmetler cards if on home page
    if (route === 'home') {
      this.initHizmetlerCards();
      this.updateHomeGallery();
    }
    
    // Initialize subnav if on hizmetler page
    if (route === 'hizmetler') {
      this.initSubnav(hash);
    }
    
  }

  // Carousel functionality
  initCarousel() {
const carouselEl = document.querySelector('.carousel');
    if (!carouselEl) return;

  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');
  let currentSlide = 0;
  let interval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
        if (indicators[i]) {
      indicators[i].classList.toggle('active', i === index);
        }
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
        if (link && link.startsWith('#')) {
          const targetRoute = link.substring(1);
          if (['hizmetler', 'galeri', 'iletisim'].includes(targetRoute)) {
            this.navigateTo(targetRoute);
          }
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
  initHizmetlerCards() {
    const hizmetlerCards = document.querySelectorAll('#hizmetler .card');
    if (hizmetlerCards.length === 0) return;

    // Get images from the categorization system
    const getImagesForCategory = (category) => {
      if (window.imageCategories && window.imageCategories[category]) {
        return window.imageCategories[category].map(img => img.path);
      }
      // Fallback to hardcoded images if categorization not ready
      const fallbackImages = {
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
      return fallbackImages[category] || [];
    };

    hizmetlerCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const images = getImagesForCategory(category);
      
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

// Subnav gallery toggling on Hizmetler page
  initSubnav(hash = null) {
const subnavLinks = document.querySelectorAll('.subnav-link');
    if (subnavLinks.length === 0) return;
    
  const galleries = document.querySelectorAll('.gallery');
    
    // Function to activate a specific tab
    const activateTab = (target) => {
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
    };
    
    // Activate tab from hash if provided
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

  // Update home gallery with categorized images
  updateHomeGallery() {
    const galleryPreview = document.querySelector('.gallery-preview');
    if (!galleryPreview || !window.imageCategories) return;

    // Clear existing content
    galleryPreview.innerHTML = '';

    // Get random images from each category
    const categories = ['tabela', 'baski', 'arac'];
    const categoryNames = {
      tabela: 'Tabela Üretimi',
      baski: 'Dijital Baskı',
      arac: 'Araç Kaplama'
    };

    categories.forEach(category => {
      const images = window.imageCategories[category] || [];
      if (images.length > 0) {
        // Get 2 random images from this category
        const randomImages = this.getRandomImages(images, 2);
        
        randomImages.forEach(image => {
          const galleryItem = document.createElement('div');
          galleryItem.className = 'gallery-item';
          galleryItem.innerHTML = `
            <img src="${image.path}" alt="${categoryNames[category]}">
            <div class="gallery-overlay">
              <span>${categoryNames[category]}</span>
            </div>
          `;
          galleryPreview.appendChild(galleryItem);
        });
      }
    });

    // Add click handlers for gallery items
    this.addGalleryClickHandlers();
  }

  // Helper method to get random images
  getRandomImages(images, count) {
    if (images.length === 0) return [];
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, images.length));
  }

  // Add click handlers to gallery items
  addGalleryClickHandlers() {
    const galleryItems = document.querySelectorAll('.gallery-preview .gallery-item');
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        this.navigateTo('galeri');
      });
    });
  }

}

// Initialize the SPA router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SPARouter();
});