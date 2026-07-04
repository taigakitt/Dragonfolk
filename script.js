// === GLOBAL STATE ===
let currentPage = 'landing', player, isPlaying = false, playerReady = false, lastSelectedImage = '';

// === PAGE NAVIGATION (WITH FIXED ROUTING SCOPE) ===
// 🎯 FIXED: Declared updateURL as an optional parameter to prevent variable crash!
function showPage(pageId, updateURL = true) {
  if (pageId === 'announce') setTimeout(initAnnounceParticles, 120);
  window.scrollTo(0, 0);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  const el = document.getElementById(pageId);
  if (el) el.classList.add('active');
  currentPage = pageId;

  if (updateURL) {
    if (pageId === 'landing') {
      history.pushState(null, '', window.location.pathname); // Clears the hash cleanly on home
    } else {
      window.location.hash = pageId;
    }
  }
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

// === INITIALIZATION & LINK DETECTION (CONSOLIDATED) ===
// 🎯 FIXED: Merged your duplicate init listeners into a single clean vault loop!
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

  // 🔗 THE DEEP LINK CHECK: Auto-teleports deep link traffic on script arrival!
  const sharedHash = window.location.hash.replace('#', '');
  if (sharedHash) {
    showPage(sharedHash, false); 
  }
});

// 🪐 BROWSER NATIVE HISTORY ENGINE OVERSEER
window.addEventListener('hashchange', () => {
  const currentHash = window.location.hash.replace('#', '');
  if (currentHash) {
    showPage(currentHash, false);
  } else {
    showPage('landing', false);
  }
});

function toggleKeys(el, e) {
  if (e) e.stopPropagation();
  el.classList.toggle('open');
  const keysEl = el.nextElementSibling;
  if (keysEl) keysEl.classList.toggle('visible');
  el.textContent = el.classList.contains('open') ? '➵ Triggers' : '➴ Triggers';
}

// === CREATOR REQUEST FORM ===
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeAyv9hzRUvk9A_78QV3YVxxTEliU_Ms5pzjJsGZ8fRp-MfKQ/formResponse';

const FORM_FIELDS = {
  name:    'entry.759807844',   
  type:    'entry.1479835832',   
  subject: 'entry.288351301', 
  body:    'entry.553433055',  
  contact: 'entry.1327562600',  
};

function submitRequest() {
  const name    = document.getElementById('req-name').value.trim();
  const type    = document.getElementById('req-type').value;
  const subject = document.getElementById('req-subject').value.trim();
  const body    = document.getElementById('req-body').value.trim();
  const contact = document.getElementById('req-contact').value.trim();
  const status  = document.getElementById('formStatus');
  const btn     = document.querySelector('.creator-submit-btn');

  if (!name || !type || !subject || !body) {
    status.textContent = 'Please fill in all required fields.';
    status.className = 'creator-form-status error';
    return;
  }

  const data = new FormData();
  data.append(FORM_FIELDS.name,    name);
  data.append(FORM_FIELDS.type,    type);
  data.append(FORM_FIELDS.subject, subject);
  data.append(FORM_FIELDS.body,    body);
  data.append(FORM_FIELDS.contact, contact);

  btn.disabled = true;
  btn.style.opacity = '0.6';
  status.textContent = 'Sending...';
  status.className = 'creator-form-status';

  fetch(GOOGLE_FORM_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: data,
  })
  .then(() => {
    status.textContent = 'Request sent. ✦ Thank you.';
    status.className = 'creator-form-status success';
    ['req-name','req-type','req-subject','req-body','req-contact']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    document.getElementById('req-type').selectedIndex = 0;
  })
  .catch(() => {
    status.textContent = 'Something went wrong. Try again?';
    status.className = 'creator-form-status error';
  })
  .finally(() => {
    btn.disabled = false;
    btn.style.opacity = '';
  });
}

// === CHARACTERS PAGE CONTROLLER ===
function filterHouse(slatElement) {
  const houseId = slatElement.dataset.house;
  const hero = document.getElementById('charHero');
  const alreadyActive = slatElement.classList.contains('active');

  document.querySelectorAll('.slat').forEach(s => s.classList.remove('active'));

  if (!alreadyActive) {
    slatElement.classList.add('active');

    const sourceTray = slatElement.querySelector('.slat-lore-source');
    if (sourceTray && hero) {
      document.getElementById('manifestCrest').textContent = sourceTray.querySelector('.source-crest').textContent;
      document.getElementById('manifestName').textContent = sourceTray.querySelector('.source-name').textContent;
      document.getElementById('manifestCreed').textContent = sourceTray.querySelector('.source-creed').textContent;
      document.getElementById('manifestDesc').innerHTML = sourceTray.querySelector('.source-desc').innerHTML;
      document.getElementById('manifestTraits').innerHTML = sourceTray.querySelector('.source-traits').innerHTML;
      
      const computedColor = getComputedStyle(slatElement).getPropertyValue('--house-color');
      hero.style.setProperty('--dynamic-house-color', computedColor);
      hero.classList.add('active-mode');
    }

    const strip = slatElement.querySelector('.slat-strip-wrap');
    if (strip && !strip._drag) initDrag(strip);

  } else {
    if (hero) hero.classList.remove('active-mode');
    slatElement.classList.remove('active'); 
  }
}

// ── MOUSE/TOUCH GRAB TRANSITION SCROLL ──
function initDrag(el) {
  el._drag = true;
  let down = false, startX, scrollLeft;
  el.addEventListener('mousedown', e => {
    down = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft;
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('mouseleave', () => { down = false; el.style.cursor = 'grab'; });
  el.addEventListener('mouseup',    () => { down = false; el.style.cursor = 'grab'; });
  el.addEventListener('mousemove', e => {
    if (!down) return;
    e.preventDefault();
    el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5;
  });
}
