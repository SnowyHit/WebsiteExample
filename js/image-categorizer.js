// Automatic Image Categorization System - File-Based
class ImageCategorizer {
  constructor() {
    this.imageCategories = {
      tabela: [],
      baski: [],
      arac: [],
      hediye: [],
      plaket: [],
      promosyon: [],
      slide: [],
      other: []
    };
    
    this.categoryKeywords = {
      tabela: ['tabela'],
      plaket:['plaket'],
      hediye:['hediye'],
      promosyon:['promosyon'],
      baski: ['baski'],
      arac: ['arac'],
      slide: ['slide', 'hero', 'main', 'banner', 'carousel']
    };

    // Subcategory navigation keywords used to derive nested subnav and filtering
    this.subcategoryKeywords = {
      tabela: ['vinyl', 'kutuharf', 'cnc', 'kompozit', 'forex', 'pilon' ,'totem'],
      baski: ['folyo', 'poster', 'afis'],
      arac: ['tam', 'kismi'],
      promosyon: ['ajanda', 'kalem', 'kupa', 'çakmak'],
      plaket: ['kadife', 'gümüş', 'kristal'],
      hediye: []
    };

    this.init();
  }

  async init() {
    // Load images based on the current file structure
    this.loadImagesFromStructure();
    this.updateImageReferences();
  }

  loadImagesFromStructure() {
    this.loadKnownImages();
  }

  getKnownImages() {
    return [
      { name: 'arac-kismi-2', path: 'img/services/arac-kismi-2.jpg' },
      { name: 'arac-kismi-3', path: 'img/services/arac-kismi-3.jpg' },
      { name: 'arac-tam-1', path: 'img/services/arac-tam-1.jpg' },
      { name: 'baski-afis-3', path: 'img/services/baski-afis-3.jpg' },
      { name: 'baski-afis-4', path: 'img/services/baski-afis-4.jpg' },
      { name: 'baski-folyo-1', path: 'img/services/baski-folyo-1.jpg' },
      { name: 'baski-poster-2', path: 'img/services/baski-poster-2.jpg' },
      { name: 'hediye-1', path: 'img/services/hediye-1.jpg' },
      { name: 'plaket-gümüş-2', path: 'img/services/plaket-gümüş-2.jpg' },
      { name: 'plaket-kadife-1', path: 'img/services/plaket-kadife-1.jpg' },
      { name: 'plaket-kristal-3', path: 'img/services/plaket-kristal-3.jpg' },
      { name: 'promosyon-ajanda-3', path: 'img/services/promosyon-ajanda-3.jpg' },
      { name: 'promosyon-çakmak-2', path: 'img/services/promosyon-çakmak-2.jpg' },
      { name: 'promosyon-kalem-1', path: 'img/services/promosyon-kalem-1.jpg' },
      { name: 'promosyon-kupa-2', path: 'img/services/promosyon-kupa-2.jpg' },
      { name: 'tabela-cnc-3', path: 'img/services/tabela-cnc-3.jpg' },
      { name: 'tabela-forex-1', path: 'img/services/tabela-forex-1.jpg' },
      { name: 'tabela-kompozit-2', path: 'img/services/tabela-kompozit-2.jpg' },
      { name: 'tabela-kompozit-8', path: 'img/services/tabela-kompozit-8.jpg' },
      { name: 'tabela-kutuharf-4', path: 'img/services/tabela-kutuharf-4.jpg' },
      { name: 'tabela-pilon-6', path: 'img/services/tabela-pilon-6.jpg' },
      { name: 'tabela-totem-7', path: 'img/services/tabela-totem-7.jpg' },
      { name: 'tabela-vinyl-5', path: 'img/services/tabela-vinyl-5.jpg' },
    ];
  }

  loadKnownImages() {
    const knownImages = this.getKnownImages();
    knownImages.forEach(image => {
      const category = this.categorizeImage(image);
      const subcategory = this.assignSubcategory(image, category);
      this.imageCategories[category].push({ ...image, subcategory });
    });
  }

  assignSubcategory(image, resolvedCategory) {
    const name = (image.name || '').toLowerCase();
    const path = (image.path || '').toLowerCase();
    // Slides and hero have no specific subcategory
    if (path.includes('/slide/') || name.includes('hero')) return 'genel';

    const category = resolvedCategory || this.categorizeImage(image);
    const keywords = (this.subcategoryKeywords && this.subcategoryKeywords[category]) || [];
    for (const key of keywords) {
      if (name.includes(key)) return key;
    }
    return 'genel';
  }

  categorizeImage(image) {
    const fileName = image.name.toLowerCase();
    const filePath = image.path.toLowerCase();

    // Check for slide/carousel images
    if (filePath.includes('/slide/') || filePath.includes('hero')) {
      return 'slide';
    }

    // Check for specific patterns in filename
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (category === 'slide') continue; // Skip slide as we handled it above
      
      for (const keyword of keywords) {
        if (fileName.includes(keyword) || filePath.includes(keyword)) {
          return category;
        }
      }
    }

    return 'other';
  }

  updateImageReferences() {
    // Update the global image categories for use in other components
    window.imageCategories = this.imageCategories;
    
    // Log categorization results
    console.log('Image categorization completed:', this.imageCategories);
    
    // Update any existing components that use image categories
    this.notifyComponents();
  }

  notifyComponents() {
    // Dispatch custom event to notify other components
    const event = new CustomEvent('imageCategorizationComplete', {
      detail: { categories: this.imageCategories }
    });
    window.dispatchEvent(event);
  }

  getImagesByCategory(category) {
    return this.imageCategories[category] || [];
  }

  getAllImages() {
    return Object.values(this.imageCategories).flat();
  }

  getRandomImage(category) {
    const images = this.getImagesByCategory(category);
    if (images.length === 0) return null;
    return images[Math.floor(Math.random() * images.length)];
  }

  getRandomImages(category, count = 3) {
    const images = this.getImagesByCategory(category);
    if (images.length === 0) return [];
    
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, images.length));
  }

  // Method to refresh images from file system
  refreshImages() {
    console.log('🔄 Refreshing image categories from file system...');
    this.imageCategories = {
      tabela: [],
      baski: [],
      arac: [],
      plaket: [],
      promosyon: [],
      hediye: [],
      slide: [],
      other: []
    };
    this.loadImagesFromStructure();
    this.updateImageReferences();
    console.log('✅ Image categories refreshed');
  }

  // Method to get category statistics
  getCategoryStats() {
    const stats = {};
    for (const [category, images] of Object.entries(this.imageCategories)) {
      stats[category] = images.length;
    }
    return stats;
  }

}

// Initialize the image categorizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.imageCategorizer = new ImageCategorizer();
});
