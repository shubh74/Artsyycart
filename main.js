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
        <div class="gallery-img-wrap">
          <img loading="lazy" src="${art.image}" alt="${art.title}" />
        </div>
        <h3>${art.title}</h3>
        <p>${art.description}</p>
        <div class="gallery-share">
          <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" title="Share on WhatsApp"><i class="ri-whatsapp-line"></i></a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" title="Share on Facebook"><i class="ri-facebook-fill"></i></a>
          <button class="story-btn" type="button" title="Create Instagram Story"><i class="ri-instagram-line"></i></button>
        </div>
      `;
      galleryContainer.appendChild(item);

      const storyBtn = item.querySelector('.story-btn');
      storyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        createStoryTemplate(art.image, art.title, art.description);
      });

      const imgWrap = item.querySelector('.gallery-img-wrap');
      imgWrap.addEventListener('click', () => {
        if (typeof openLightbox === "function") openLightbox(art.image, art.title, art.description);
      });
    });
    animateOnScroll();
  }

  // Render category filters
  function renderFilters() {
    const filterBar = document.getElementById('galleryFilters');
    if (!filterBar) return;
    const categories = Array.from(new Set(artworks.map(a => a.category || "Other")));
    // Set the default category (e.g., "POPART")
    let defaultCategory = "FLYER";
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

function createStoryTemplate(imgUrl, title, desc, backgroundChoice = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");

  const background = new Image();
  background.src =
    backgroundChoice === 2
      ? "./WhatsApp Image 2025-06-20 at 10.54.17 PM.jpeg"
      : "./WhatsApp Image 2025-06-20 at 10.54.17 PM (1).jpeg";

  background.onload = () => {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Soft overlay for contrast
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawElements();
  };

  function drawElements() {
  // Decorative floating circles
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 1080, Math.random() * 1920, 20 + Math.random() * 30, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05 + 0.03})`;
    ctx.fill();
  }

  // Rounded rectangle for image
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Draw white card base behind image (optional)
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 90, 220, 900, 900, 60);
  ctx.fill();
  ctx.restore();

  // Draw main image
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function () {
    ctx.save();
    roundRect(ctx, 90, 220, 900, 900, 60);
    ctx.clip();
    ctx.drawImage(img, 90, 220, 900, 900);
    ctx.restore();

    // Dashed border
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#f39c12";
    ctx.setLineDash([28, 18]);
    roundRect(ctx, 90, 220, 900, 900, 60);
    ctx.stroke();
    ctx.restore();

    // Title
    ctx.font = "bold 78px Montserrat, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 16;
    ctx.fillText("CLASSES", canvas.width / 2, 1240);
    ctx.font = "bold 48px Montserrat, sans-serif";
    ctx.fillText("DRAWING CLASSES", canvas.width / 2, 1290);
    ctx.shadowBlur = 0;

    // Website
    ctx.font = "bold 36px Montserrat, sans-serif";
    ctx.fillStyle = "#00ffff";
    ctx.fillText("🌐 Visit: https://shubh74.github.io/Artsyycart/", canvas.width / 2, 1360);

    // Instagram
    ctx.font = "bold 38px Montserrat, sans-serif";
    ctx.fillStyle = "#f1c40f";
    ctx.fillText("📸 @artsyycart__   |   @shubh_2006__", canvas.width / 2, 1420);

    // Tag Bubble
    ctx.save();
    ctx.beginPath();
    ctx.arc(880, 1700, 90, 0, 2 * Math.PI);
    ctx.fillStyle = "linear-gradient(to right, #8e44ad, #3498db)";
    ctx.fillStyle = "#8e44ad";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 34px Montserrat, sans-serif";
    ctx.fillText("Tag Us!", 880, 1705);
    ctx.restore();

    // Share text
    ctx.font = "bold 52px Montserrat, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#f39c12";
    ctx.shadowBlur = 12;
    ctx.fillText("✨ Share & Tag to Get Featured!", canvas.width / 2, 1860);
    ctx.shadowBlur = 0;

    // Download
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "artsyycart-story.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert("Template saved. Add to your story & tag @artsyycart__ and @shubh_2006__ 🎨");
  };
  img.src = imgUrl;
}


  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const testWidth = context.measureText(testLine).width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }
}

  // Helper for wrapping text (keep this in your main.js)
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
