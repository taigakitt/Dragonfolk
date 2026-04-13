// === GLOBAL STATE ===
let currentPage = 'landing';
let player;
let isPlaying = false;
let playerReady = false;

// === PAGE NAVIGATION ===
function showPage(pageId) {
  // Trigger particles if entering the announce page
  if (pageId === 'announce') {
    setTimeout(initAnnounceParticles, 120);
  }
  
  window.scrollTo(0, 0);

  // Toggle active classes
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(pageId);
  if (el) {
    el.classList.add('active');
  }
  
  currentPage = pageId;
}
  
function goBack() {
  showPage('landing');
}

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
    
    // Assigning the "Seed" variables for CSS Math
    p.style.setProperty('--r-x', Math.random());
    p.style.setProperty('--r-s', Math.random());
    p.style.setProperty('--r-d', Math.random());
    
    fragment.appendChild(p);
  }
  container.appendChild(fragment);
}

// === MUSIC PLAYER (YouTube API) ===

function checkYouTubeAPI() {
    // If the API is ready, build the player. If not, wait 500ms and try again.
    if (window.YT && YT.loaded) {
        initDragonPlayer();
    } else {
        setTimeout(checkYouTubeAPI, 500);
    }
}

function initDragonPlayer() {
    const style = getComputedStyle(document.documentElement);
    // Pull ID from CSS :root --theme-song-id
    const videoId = style.getPropertyValue('--theme-song-id').replace(/["' ]/g, "");

    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': videoId // Required for looping
        },
        events: {
            'onReady': () => {
                playerReady = true;
                console.log("THE DRAGON HAS AWAKENED.");
          
                // Initialize music on the very first click anywhere
                document.addEventListener('click', () => {
                    if (!isPlaying) toggleMusic();
                }, { once: true });
            }
        }
    });
}

function toggleMusic() {
    if (!playerReady) return;
    const cd = document.querySelector('.dragon-cd');

    if (!isPlaying) {
        player.playVideo();
        cd.classList.add('playing');
        isPlaying = true;
    } else {
        player.pauseVideo();
        cd.classList.remove('playing');
        isPlaying = false;
    }
}

// Start the check sequence
checkYouTubeAPI();