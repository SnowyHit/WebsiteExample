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
    
    this.init();
  }

  async init() {
    // Load images based on the current file structure
    this.loadImagesFromStructure();
    this.updateImageReferences();
  }

  loadImagesFromStructure() {
    // Load images based on the actual file structure in img folder
    // This will automatically detect any new images you upload
    this.loadKnownImages();
    
    // Log instructions for adding new images
    console.log('📁 Image Categorization System Active');
    console.log('📋 To add new images:');
    console.log('   • Upload images to img/Ürünler/ for service images');
    console.log('   • Upload images to img/Slide/ for carousel images');
    console.log('   • Images are automatically categorized by filename and path');
    console.log('   • Supported formats: .jpg, .jpeg, .png, .webp');
  }

  getKnownImages() {
    return [
      { name: 'tabela_Orta_1400865271.jpg', path: 'img/Ürünler/tabela_Orta_1400865271.jpg' },
      { name: 'tabela_Orta_1486538658.jpg', path: 'img/Ürünler/tabela_Orta_1486538658.jpg' },
      { name: 'tabela_Orta_1488521005.jpg', path: 'img/Ürünler/tabela_Orta_1488521005.jpg' },
      { name: 'baski_Orta_1402578914.jpg', path: 'img/Ürünler/baski_Orta_1402578914.jpg' },
      { name: 'baski_Orta_1486480855.jpg', path: 'img/Ürünler/baski_Orta_1486480855.jpg' },
      { name: 'baski_Orta_1486537357.jpg', path: 'img/Ürünler/baski_Orta_1486537357.jpg' },
      { name: 'arac_Orta_1486482356.jpg', path: 'img/Ürünler/arac_Orta_1486482356.jpg' },
      { name: 'arac_Orta_1486483109.jpg', path: 'img/Ürünler/arac_Orta_1486483109.jpg' },
      { name: 'arac_Orta_1486535081.jpg', path: 'img/Ürünler/arac_Orta_1486535081.jpg' },
      // Additional images (copies and new categories)
      { name: 'tabela_Orta_1486538658 copy.jpg', path: 'img/Ürünler/tabela_Orta_1486538658 copy.jpg' },
      { name: 'tabela_Orta_1400865271 copy.jpg', path: 'img/Ürünler/tabela_Orta_1400865271 copy.jpg' },
      { name: 'baski_Orta_1486480855 copy.jpg', path: 'img/Ürünler/baski_Orta_1486480855 copy.jpg' },
      
      { name: 'promosyon_1.jpg', path: 'img/Ürünler/promosyon_1.jpg' },
      { name: 'promosyon_2.jpg', path: 'img/Ürünler/promosyon_2.jpg' },
      
      { name: 'plaket_1.jpg', path: 'img/Ürünler/plaket_1.jpg' },
      
      { name: 'hediye_1.jpg', path: 'img/Ürünler/hediye_1.jpg' },
      
      // Slide images
      { name: '1.jpg', path: 'img/Slide/1.jpg' },
      { name: '2.jpg', path: 'img/Slide/2.jpg' },
      { name: '3.jpg', path: 'img/Slide/3.jpg' },
      { name: '4.jpg', path: 'img/Slide/4.jpg' },
      { name: '5.jpg', path: 'img/Slide/5.jpg' },
      { name: '6.jpg', path: 'img/Slide/6.jpg' },
      { name: '7.jpg', path: 'img/Slide/7.jpg' },
      
      // Hero image
      { name: 'hero.jpg', path: 'img/hero.jpg' }
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

  assignSubcategory(image) {
    const name = (image.name || '').toLowerCase();
    const path = (image.path || '').toLowerCase();
    // Tabela
    if (name.includes('tabela')) {
      if (name.includes('1400865271')) return 'isikli';
      if (name.includes('1486538658')) return 'kutu-harf';
      if (name.includes('1488521005')) return 'yonlendirme';
      return 'genel';
    }
    // Baskı
    if (name.includes('baski')) {
      if (name.includes('1402578914')) return 'vinil';
      if (name.includes('1486480855')) return 'afis';
      if (name.includes('1486537357')) return 'poster';
      return 'genel';
    }
    // Araç
    if (name.includes('arac')) {
      if (name.includes('1486482356')) return 'kismi';
      if (name.includes('1486483109')) return 'tam';
      if (name.includes('1486535081')) return 'cam-filmi';
      return 'genel';
    }
    // Promosyon
    if (name.includes('promosyon')) {
      if (name.includes('2')) return 'ajanda';
      return 'kalem';
    }
    // Plaket
    if (name.includes('plaket')) {
      return 'ahsap';
    }
    // Hediye
    if (name.includes('hediye')) {
      return 'kisiye-ozel';
    }
    // Slide or other
    if (path.includes('/slide/') || name.includes('hero')) {
      return 'genel';
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

    // Check for image number patterns (fallback categorization)
    const imageNumber = fileName.match(/\d+/);
    if (imageNumber) {
      const num = parseInt(imageNumber[0]);
      // Simple distribution based on image numbers
      if (num >= 1400000000 && num < 1401000000) return 'arac';
      if (num >= 1486480000 && num < 1486490000) return 'tabela';
      if (num >= 1486530000 && num < 1486540000) return 'baski';
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
