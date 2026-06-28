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
    // Clear fields
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


// === CHARACTERS PAGE ===
/*==========================================================
    FACTION ARCHIVE CANOPY DATABASE
==========================================================*/
const FACTION_MANIFESTVS = {
  akagi: {
    name: "House Akagi", crest: "火", creed: "Loyalty · Discipline · Tradition",
    desc: "Tanned skin, red horns, masters of offensive elemental magic. Loyalty is not blind here — it is chosen and renewed in every action. The sole heir carries the full weight of a House that is revered but carefully watched.",
    traits: ["Offensive Magic", "Tanned Skin", "Red Horns", "Sole Heir Line"], color: "#e05050"
  },
  saiwa: {
    name: "House Saiwa", crest: "盾", creed: "Loyalty · Adaptability · Strategy",
    desc: "Pale skin, black horns, masters of defensive magic. They bend rather than break. Lord Kenji's calm authority and Lady Sayuri's cold resolve produced five heirs — each expected to be a weapon. The last arrived too soft for any of it.",
    traits: ["Defensive Matrix", "Pale Skin", "Black Horns", "Five Heirs"], color: "#6090d0"
  },
  ryuhwa: {
    name: "House Ryuhwa", crest: "強", creed: "Only the Strong Thrive",
    desc: "Deep brown skin, white horns, masters of support magic that curdles into necromancy. Heirs rise by breaking their Lord. Lord Jinwoo broke his father in judgment, not anger. His daughter returned from a decade away wearing the same eyes.",
    traits: ["Necromantic Support", "Brown Skin", "White Horns", "Blood Succession"], color: "#9a70d0"
  },
  koryuu: {
    name: "Koryuu-gyeong", crest: "獄", creed: "The Imperial Capital Province",
    desc: "The imperial capital — once the undisputed cultural heart of Goryūto, now feeling its dominance slip. Those who serve it do so with rigid authority and a growing dread that what they protect is already fading.",
    traits: ["Prison Systems", "Rigid Order", "Imperial Guard"], color: "#607088"
  },
  independent: {
    name: "Independent", crest: "✦", creed: "Bound to No Provincial Throne",
    desc: "Those who answer to no House — wanderers, rogue captains of the Driftcrag Isles, and clifftop seers operating in the secret spaces the high court provincial crowns cannot reach.",
    traits: ["Unclaimed Blood", "Self-Determined", "Isles Rogue"], color: "#c9a84c"
  },
  wyrm: {
    name: "Wyrm Kin", crest: "爪", creed: "The Marginalized Fringe Caste",
    desc: "Digitigrade legs, bestial profiles, called wyrm as a slur. The lowest rung of the continent's hierarchy — feared for their raw, primitive biology and denied the spaces Horned Ones move through freely.",
    traits: ["Shattered Caste", "Digitigrade Legs", "Bestial Magic"], color: "#50b880"
  }
};

// === CORE REPLACEMENT FILTER ENGINE ===
function filterHouse(btn) {
  document.querySelectorAll('.char-house-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const house = btn.dataset.house;
  const hero = document.getElementById('charHero');

  // Filter visibility states across vertical profile cards
  document.querySelectorAll('.char-card').forEach(card => {
    const match = house === 'all' || card.dataset.house === house;
    card.classList.toggle('char-hidden', !match);
  });

  // 🎯 THE INTERFACE EXCHANGE ROUTINE: 
  // If a house is targeted, fill the header database slots. If "all", switch back to default title!
  const manifest = FACTION_MANIFESTVS[house];
  if (manifest && hero) {
    document.getElementById('manifestCrest').textContent = manifest.crest;
    document.getElementById('manifestName').textContent = manifest.name;
    document.getElementById('manifestCreed').textContent = manifest.creed;
    document.getElementById('manifestDesc').textContent = manifest.desc;
    document.getElementById('manifestTraits').innerHTML = manifest.traits.map(t => `<span class="manifest-trait-pill">${t}</span>`).join('');
    
    // Inject custom colors down to CSS context variables
    hero.style.setProperty('--dynamic-house-color', manifest.color);
    hero.classList.add('active-mode');
  } else {
    if (hero) hero.classList.remove('active-mode');
  }
}
