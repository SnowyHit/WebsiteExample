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
      const hash = e.state?.hash || null;
      this.navigateTo(route, false, hash);
    });

    // Handle card clicks with route data
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.service-card[data-route]');
      if (card) {
        e.preventDefault();
        const route = card.getAttribute('data-route');
        const hash = card.getAttribute('data-hash');
        this.navigateTo(route, true, hash);
      }
    });
  }

  handleInitialRoute() {
    // Check URL hash for initial route, supporting sub-hash (e.g., #hizmetler#tabela)
    const rawHash = window.location.hash.substring(1);
    const [route, subhash] = rawHash.split('#');
    if (route && ['home', 'hakkimizda', 'hizmetler', 'galeri', 'referanslar', 'iletisim'].includes(route)) {
      this.navigateTo(route, false, subhash || null);
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
    
    // Initialize home page functionality
    if (route === 'home') {
      this.updateHomeGallery();
      this.initInstagramFeed();
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
          if (['hizmetler', 'iletisim'].includes(targetRoute)) {
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


  // Subnav with secondary filtering on Hizmetler page
  initSubnav(hash = null) {
    const primaryLinks = document.querySelectorAll('.subnav-link');
    if (primaryLinks.length === 0) return;

    const secondaryNav = document.getElementById('subcategory-nav');
    const galleryEl = document.getElementById('gallery');
    const sidebarEl = document.querySelector('.hizmetler-sidebar');
    const toggleBtn = null; // toggle removed; categories always visible
    const mobileNestedNav = document.querySelector('.mobile-nested-nav');

    const isImagesReady = () => Boolean(window.imageCategories);

    const getCategoryImages = (category) => {
      const images = (window.imageCategories && window.imageCategories[category]) || [];
      return images;
    };

    const getSubcategories = (category) => {
      const subcats = new Set();
      getCategoryImages(category).forEach((img) => {
        if (img && img.subcategory) subcats.add(img.subcategory);
      });
      return Array.from(subcats);
    };

    const shuffleArray = (arr) => {
      return [...arr].sort(() => 0.5 - Math.random());
    };

    let currentCategory = (hash && Array.from(primaryLinks).some(b => b.getAttribute('data-target') === hash))
      ? hash
      : (primaryLinks[0]?.getAttribute('data-target') || 'tabela');
    let currentSubcategory = null;

    const categoryDisplayNames = {
      tabela: 'Tabela',
      baski: 'Dijital Baskı',
      arac: 'Araç Kaplama',
      promosyon: 'Promosyon',
      plaket: 'Plaket',
      hediye: 'Hediye'
    };
    const allPrimaryCategories = ['tabela', 'baski', 'arac', 'promosyon', 'plaket', 'hediye'];

    const renderGallery = (category, subcat) => {
      if (!galleryEl) return;
      const images = getCategoryImages(category).filter(img => !subcat || img.subcategory === subcat);
      galleryEl.innerHTML = images.map((image) => (
        `<div class="gallery-item"><img src="${image.path}" alt="${image.name || category}"></div>`
      )).join('');
      galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const renderMobileNestedUI = (activeCategory, activeSub = null) => {
      if (!mobileNestedNav) return;
      const getSubcatButtons = (cat, selectedSub) => {
        const subcats = getSubcategories(cat);
        if (subcats.length === 0) return '';
        return `<div class="nested-subcats">${
          subcats.map(sc => `
            <button class="nested-subcat-btn ${selectedSub === sc ? 'active' : ''}" data-parent="${cat}" data-subcat="${sc}">
              ${(sc || '').replace(/-/g, ' ')}
            </button>
          `).join('')
        }</div>`;
      };

      mobileNestedNav.innerHTML = allPrimaryCategories.map(cat => {
        const openAttr = cat === activeCategory ? ' open' : '';
        const title = categoryDisplayNames[cat] || cat;
        // Remove dynamic suffix to keep summary width consistent
        return `
          <details class="nested-group" data-cat="${cat}"${openAttr}>
            <summary>${title}</summary>
            ${getSubcatButtons(cat, cat === activeCategory ? activeSub : null)}
          </details>
        `;
      }).join('');

      // Wire up events
      mobileNestedNav.querySelectorAll('summary').forEach((summaryEl) => {
        summaryEl.addEventListener('click', (e) => {
          e.preventDefault();
          const group = summaryEl.parentElement;
          const cat = group?.getAttribute('data-cat');
          if (!cat) return;
          // Toggle open state manually for consistent behavior
          const willOpen = !group.hasAttribute('open');
          mobileNestedNav.querySelectorAll('details.nested-group').forEach(d => {
            if (d !== group) d.removeAttribute('open');
          });
          if (willOpen) {
            group.setAttribute('open', '');
          } else {
            group.removeAttribute('open');
          }
          setActiveCategory(cat);
        });
      });
      mobileNestedNav.querySelectorAll('.nested-subcat-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const parent = btn.getAttribute('data-parent');
          const sub = btn.getAttribute('data-subcat');
          if (!parent || !sub) return;
          if (parent !== currentCategory) {
            setActiveCategory(parent, sub);
          } else {
            renderSecondary(currentCategory, sub);
            renderGallery(currentCategory, sub);
            currentSubcategory = sub;
            renderMobileNestedUI(currentCategory, sub);
          }
        });
      });
    };

    const renderSecondary = (category, preferredActiveSub = null) => {
      if (!secondaryNav) return null;
      const subcats = getSubcategories(category);

      if (subcats.length === 0) {
        secondaryNav.innerHTML = '';
        return null;
      }

      const activeSub = subcats.includes(preferredActiveSub) ? preferredActiveSub : subcats[0];

      secondaryNav.innerHTML = subcats.map(sc => (
        `<button class="subnav-link ${sc === activeSub ? 'active' : ''}" data-subcat="${sc}" role="tab" aria-selected="${sc === activeSub}">`
        + `${sc.replace(/-/g, ' ')}`
        + `</button>`
      )).join('');

      secondaryNav.querySelectorAll('button[data-subcat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const chosen = btn.getAttribute('data-subcat');
          secondaryNav.querySelectorAll('button[data-subcat]').forEach(b => {
            const isActive = b === btn;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });
          renderGallery(currentCategory, chosen);
          currentSubcategory = chosen;
          renderMobileNestedUI(currentCategory, chosen);
        });
      });

      return activeSub;
    };

    const setActiveCategory = (category, preferredSub = null) => {
      currentCategory = category;
      primaryLinks.forEach((b) => {
        const isActive = b.getAttribute('data-target') === category;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      // Reflect selected category in URL hash
      window.history.pushState({ route: 'hizmetler', hash: category }, '', `#hizmetler#${category}`);
      const activeSub = renderSecondary(category, preferredSub);
      currentSubcategory = activeSub;
      renderGallery(category, activeSub);
      renderMobileNestedUI(currentCategory, activeSub);
    };

    primaryLinks.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target) setActiveCategory(target);
      });
    });

    // Sidebar toggle removed; keep categories open across viewports

    if (!isImagesReady()) {
      const onReady = () => {
        window.removeEventListener('imageCategorizationComplete', onReady);
        setActiveCategory(currentCategory);
      };
      window.addEventListener('imageCategorizationComplete', onReady);
      // Render UI placeholders immediately
      setActiveCategory(currentCategory);
      return;
    }

    setActiveCategory(currentCategory);
  }

  // Update home gallery with categorized images
  updateHomeGallery() {
    const galleryPreview = document.querySelector('.gallery-preview');
    if (!galleryPreview || !window.imageCategories) return;

    // Clear existing content
    galleryPreview.innerHTML = '';

    // Get random images from each category
    const categories = ['tabela', 'baski', 'arac', 'promosyon', 'plaket', 'hediye'];
    const categoryNames = {
      tabela: 'Tabela Üretimi',
      baski: 'Dijital Baskı',
      arac: 'Araç Kaplama',
      promosyon: 'Promosyon',
      plaket: 'Plaket',
      hediye: 'Hediye'
    };

    categories.forEach(category => {
      const images = window.imageCategories[category] || [];
      if (images.length > 0) {
        // Get 2 random images from this category
        const randomImages = this.getRandomImages(images, 2);
        
        randomImages.forEach(image => {
          const galleryItem = document.createElement('div');
          galleryItem.className = 'gallery-item';
          galleryItem.setAttribute('data-route', 'hizmetler');
          galleryItem.setAttribute('data-hash', category);
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
        const hash = item.getAttribute('data-hash');
        this.navigateTo('hizmetler', true, hash || null);
      });
    });
  }

  // Initialize Instagram feed (JS-only via third-party widget)
  initInstagramFeed() {
    const widgetContainer = document.getElementById('instagram-widget');
    if (!widgetContainer) return;

    const provider = widgetContainer.getAttribute('data-provider') || 'elfsight';
    if (provider !== 'elfsight') return; // currently only elfsight supported

    const configuredId = widgetContainer.getAttribute('data-widget-id') || (window.INSTAGRAM_WIDGET_ID || '');

    // If no widget ID configured, keep fallback visible
    if (!configuredId || configuredId.trim() === '') return;

    // Add provider-specific class only once
    const hasClass = Array.from(widgetContainer.classList).some(c => c.startsWith('elfsight-app-'));
    if (!hasClass) {
      widgetContainer.classList.add(`elfsight-app-${configuredId}`);
      widgetContainer.setAttribute('data-elfsight-app-lazy', '');
    }

    // Hide fallback when content is injected
    const fallbackEl = widgetContainer.querySelector('.insta-fallback');
    const maybeHideFallback = () => {
      if (!fallbackEl) return;
      const hasExtraChildren = widgetContainer.children.length > 1;
      if (hasExtraChildren) {
        fallbackEl.style.display = 'none';
      }
    };
    maybeHideFallback();
    const observer = new MutationObserver(() => {
      maybeHideFallback();
      // Stop observing once content appears
      if (widgetContainer.children.length > 1) observer.disconnect();
    });
    observer.observe(widgetContainer, { childList: true, subtree: true });

    // Ensure platform script is loaded once
    const existingScript = document.querySelector('script[src^="https://static.elfsight.com/platform/platform.js"]');
    if (!existingScript) {
      const s = document.createElement('script');
      s.src = 'https://static.elfsight.com/platform/platform.js';
      s.async = true;
      s.defer = true;
      s.setAttribute('data-elfsight-platform', 'true');
      document.head.appendChild(s);
    } else if (window.ELFSIGHT_APP_INSTANCE && typeof window.ELFSIGHT_APP_INSTANCE.init === 'function') {
      try { window.ELFSIGHT_APP_INSTANCE.init(); } catch (_) { /* ignore */ }
    }
  }

}

// Initialize the SPA router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SPARouter();
});