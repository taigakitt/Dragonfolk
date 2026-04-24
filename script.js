// === GLOBAL STATE ===
let currentPage = 'landing', player, isPlaying = false, playerReady = false, lastSelectedImage = '';

// === PAGE NAVIGATION ===
function showPage(pageId) {
  if (pageId === 'announce') setTimeout(initAnnounceParticles, 120);
  window.scrollTo(0, 0);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(pageId);
  if (el) el.classList.add('active');
  currentPage = pageId;
}

function goBack() { showPage('landing'); }

// === PARTICLE SYSTEM ===
function initAnnounceParticles() {
  const container = document.getElementById('announceParticles');
  if (!container) return;
  container.innerHTML = '';
  const style = getComputedStyle(document.documentElement);
  const count = parseInt(style.getPropertyValue('--particle-count')) || 25;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'announce-particle';
    p.style.setProperty('--r-x', Math.random());
    p.style.setProperty('--r-s', Math.random());
    p.style.setProperty('--r-d', Math.random());
    fragment.appendChild(p);
  }
  container.appendChild(fragment);
}

// === MUSIC PLAYER (YouTube API) ===
window.onYouTubeIframeAPIReady = function() {
  const videoId = getComputedStyle(document.documentElement).getPropertyValue('--theme-song-id').replace(/["' ]/g, "");
  player = new YT.Player('player', {
    height: '0', width: '0', videoId: videoId,
    playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': videoId },
    events: { 'onReady': () => {
      playerReady = true;
      document.addEventListener('click', () => { if (!isPlaying) toggleMusic(); }, { once: true });
    }}
  });
};

function toggleMusic() {
  if (!playerReady) return;
  const cd = document.querySelector('.dragon-cd');
  isPlaying = !isPlaying;
  if (isPlaying) {
    player.playVideo();
    cd.classList.add('playing');
  } else {
    player.pauseVideo();
    cd.classList.remove('playing');
  }
}

// === LORE ACTIONS ===
function toggleRegion(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.lore-region').forEach(r => r.classList.remove('open'));
  
  if (!isOpen) {
    el.classList.add('open');
    // Direct access: No checks, just speed
    lastSelectedImage = el.querySelector('.lore-region-bg').style.backgroundImage;
    const activeFilter = document.querySelector('.lore-filter-btn.active').dataset.filter;
    const worldLorePage = document.getElementById('world-lore');
    
    if (worldLorePage) {
      worldLorePage.style.backgroundImage = (activeFilter !== 'geography') 
        ? `linear-gradient(rgba(13, 10, 8, 0.85), rgba(13, 10, 8, 0.85)), ${lastSelectedImage}` 
        : 'none';
    }
  }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lore-filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.lore-filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter, worldLorePage = document.getElementById('world-lore');

      document.querySelectorAll('.lore-section[data-category]').forEach(sec => {
        sec.classList.toggle('hidden', filter !== 'all' && sec.dataset.category !== filter);
      });

      if (worldLorePage) {
        worldLorePage.style.backgroundImage = (filter === 'geography' || !lastSelectedImage) 
          ? 'none' 
          : `linear-gradient(rgba(13, 10, 8, 0.85), rgba(13, 10, 8, 0.85)), ${lastSelectedImage}`;
      }
    });
  });
  const defaultBtn = document.querySelector('.lore-filter-btn[data-filter="geography"]');
  if (defaultBtn) defaultBtn.click();
});

function toggleKeys(el, e) {
  if (e) e.stopPropagation();
  el.classList.toggle('open');
  const keysEl = el.nextElementSibling;
  if (keysEl) keysEl.classList.toggle('visible');
  el.textContent = el.classList.contains('open') ? '➵ Triggers' : '➴ Triggers';
}
