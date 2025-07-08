// Carousel functionality
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

slides.forEach((slide, i) => {
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

document.querySelector('.carousel').addEventListener('mouseenter', stopCarousel);
document.querySelector('.carousel').addEventListener('mouseleave', startCarousel);

// Initialize
showSlide(0);
startCarousel(); 