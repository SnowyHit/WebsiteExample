# 📸 Image Management Guide

## How to Add Images to Your Website

The website automatically categorizes images based on their location and filename. Simply upload images to the appropriate folders and they will be automatically detected and categorized.

### 📁 Folder Structure

```
img/
├── Ürünler/          # Service/Product images
│   ├── tabela_*.jpg  # Tabela images
│   ├── baski_*.jpg   # Digital printing images  
│   └── arac_*.jpg    # Vehicle wrapping images
├── Slide/            # Carousel/Slider images
│   ├── 1.jpg
│   ├── 2.jpg
│   └── 3.jpg
└── hero.jpg          # Hero/background image
```

### 🏷️ Automatic Categorization

The system automatically categorizes images based on:

**Filename Keywords:**
- `tabela`, `sign`, `board` → **Tabela Üretimi**
- `baski`, `print`, `poster`, `vinyl` → **Dijital Baskı**  
- `arac`, `vehicle`, `car`, `truck` → **Araç Kaplama**

**Folder Location:**
- `img/Slide/` → **Carousel images**
- `img/hero.jpg` → **Hero background**

### 📋 Adding New Images

#### For Service Images (Ürünler):
1. Upload images to `img/Ürünler/` folder
2. Use descriptive filenames like:
   - `tabela_restaurant_sign.jpg`
   - `baski_vinyl_banner.jpg`
   - `arac_delivery_truck.jpg`
3. Images automatically appear in:
   - Service cards background rotation
   - Home gallery preview
   - Services page galleries

#### For Carousel Images (Slide):
1. Upload images to `img/Slide/` folder
2. Use numbered format: `1.jpg`, `2.jpg`, `3.jpg`, etc.
3. Images automatically appear in the main carousel

### 🔄 Refresh After Adding Images

If you add new images and they don't appear immediately:
1. Open browser console (F12)
2. Type: `window.imageCategorizer.refreshImages()`
3. Press Enter

### 📊 Supported Formats

- `.jpg` / `.jpeg`
- `.png` 
- `.webp`

### 💡 Tips

- **Keep filenames descriptive** for better categorization
- **Use consistent naming patterns** for easier management
- **Optimize images** for web (compress for faster loading)
- **Maintain aspect ratios** for consistent display

### 🎯 Where Images Appear

- **Service Cards**: Rotating background images from their category
- **Home Gallery**: Random selection from each category
- **Services Page**: Category-specific galleries
- **Carousel**: All images from Slide folder
- **Gallery Page**: All images from Ürünler folder

The system is designed to work automatically - just upload images to the correct folders and they'll be integrated into your website!
