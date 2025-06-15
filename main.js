let artworks = [];
let filteredArtworks = [];

document.addEventListener('DOMContentLoaded', () => {
  const galleryContainer = document.getElementById('galleryContainer');

  // Fetch artworks
  fetch('data/artworks.json')
    .then(res => res.json())
    .then(data => {
      artworks = data.map((art, i) => ({
        title: art.title || `Artwork #${i + 1}`,
        image: art.image || 'images/placeholder.jpg',
        description: art.description || '',
        category: art.category || 'Other'
      }));
      filteredArtworks = [...artworks];
      renderFilters();
      renderGallery();
    })
    .catch(err => console.error('Error loading artworks:', err));

  // Render gallery
  function renderGallery() {
    galleryContainer.innerHTML = "";
    // No need for .five-items class anymore
    filteredArtworks.forEach(art => {
      const item = document.createElement("div");
      item.className = "gallery-item fade-in";
      const shareUrl = encodeURIComponent(window.location.origin + '/' + art.image);
      const shareText = encodeURIComponent(`${art.title} - ${window.origin}/${art.image}`);

      item.innerHTML = `
        <div class="gallery-img-wrap" onclick="openLightbox && openLightbox('${art.image}', '${art.title}', '${art.description}')">
          <img loading="lazy" src="${art.image}" alt="${art.title}" />
        </div>
        <h3>${art.title}</h3>
        <p>${art.description}</p>
        <div class="gallery-share">
          <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" title="Share on WhatsApp"><i class="ri-whatsapp-line"></i></a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" title="Share on Facebook"><i class="ri-facebook-fill"></i></a>
          <a href="#" onclick="navigator.clipboard.writeText('${window.location.origin}/${art.image}');alert('Link copied! Open Instagram and paste in your story.');return false;" title="Copy link for Instagram Story"><i class="ri-instagram-line"></i></a>
        </div>
      `;
      galleryContainer.appendChild(item);
    });
    animateOnScroll();
  }

  // Render category filters
  function renderFilters() {
    const filterBar = document.getElementById('galleryFilters');
    if (!filterBar) return;
    const categories = Array.from(new Set(artworks.map(a => a.category || "Other")));
    // Set the default category (e.g., "POPART")
    let defaultCategory = "POPART";
    if (!categories.includes(defaultCategory)) defaultCategory = categories[0];
    filterBar.innerHTML = categories.map(cat =>
      `<button class="filter-btn${cat === defaultCategory ? ' active' : ''}" data-category="${cat}">${cat}</button>`
    ).join('');
    // Set filteredArtworks to default category
    filteredArtworks = artworks.filter(a => (a.category || "Other") === defaultCategory);
    renderGallery();
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        filteredArtworks = artworks.filter(a => (a.category || "Other") === cat);
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery();
      });
    });
  }

  // Fade-in animation for gallery items
  function animateOnScroll() {
    document.querySelectorAll('.fade-in').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', animateOnScroll);
  window.addEventListener('resize', animateOnScroll);

  // Navbar toggle for mobile
  const menuBtn = document.querySelector('.nav__menu__btn');
  const navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuBtn.classList.toggle('open'); // animate hamburger
    });
    // Auto-close menu on link click (mobile)
    navLinks.querySelectorAll('a, .btn').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900 && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          menuBtn.classList.remove('open');
        }
      });
    });
    // Auto-close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        window.innerWidth <= 900 &&
        navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        navLinks.classList.remove('open');
        menuBtn.classList.remove('open');
      }
    });
  }

  // Swiper init (if you use Swiper elsewhere)
  if (typeof Swiper !== "undefined") {
    new Swiper('.swiper', {
      slidesPerView: 1,
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

  // Adjust bio image margin (if needed)
  function adjustImageMargin() {
    const bioImg = document.querySelector('.BIO__image img');
    if (bioImg) {
      bioImg.style.marginTop = window.innerWidth < 900 ? "0" : "2em";
    }
  }
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(adjustImageMargin, 100);
  });
  adjustImageMargin();

  // Dark mode toggle logic for both desktop and mobile buttons
  const darkModeToggles = [
    document.getElementById('darkModeToggle'),
    document.getElementById('darkModeToggle-desktop')
  ].filter(Boolean);

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedMode = localStorage.getItem('theme');
  if (savedMode === 'dark' || (!savedMode && prefersDark)) {
    document.body.classList.add('dark-mode');
    darkModeToggles.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'ri-sun-line';
      btn.querySelector('.dark-btn-text').textContent = 'Light Mode';
    });
  }
  darkModeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      darkModeToggles.forEach(b => {
        const icon = b.querySelector('i');
        if (icon) icon.className = document.body.classList.contains('dark-mode') ? 'ri-sun-line' : 'ri-moon-line';
        b.querySelector('.dark-btn-text').textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
      });
    });
  });

  function createStoryTemplate(imgUrl, title, desc) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = "#e0c3fc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw main image
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
      // Draw image centered
      const imgW = 900, imgH = 900;
      ctx.drawImage(img, (canvas.width-imgW)/2, 220, imgW, imgH);

      // Draw title
      ctx.font = "bold 64px Montserrat, Arial";
      ctx.fillStyle = "#b16cea";
      ctx.textAlign = "center";
      ctx.fillText(title, canvas.width/2, 1200);

      // Draw description
      ctx.font = "36px Montserrat, Arial";
      ctx.fillStyle = "#3d246c";
      wrapText(ctx, desc, canvas.width/2, 1280, 900, 48);

      // Download
      const url = canvas.toDataURL("image/png");
      const a = document.createElement('a');
      a.href = url;
      a.download = "artsyycart-story.png";
      a.click();

      alert("Story template downloaded! Open Instagram, add to your story, and select this image from your gallery.");
    };
    img.src = imgUrl;
  }

  // Helper for wrapping text
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }
});
