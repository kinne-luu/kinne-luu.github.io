// --- SAKURA EFFECT ---
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('sakura');
    petal.style.left = Math.random() * 100 + 'vw';
    const size = Math.random() * 10 + 5; 
    petal.style.width = size + 'px'; petal.style.height = size + 'px';
    const duration = Math.random() * 3 + 4; 
    petal.style.animationDuration = duration + 's';
    petal.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(petal);
    setTimeout(() => { petal.remove(); }, duration * 1000 + 2000);
}
setInterval(createPetal, 300);

// --- DYNAMIC COPY & DISCORD ---
function copyDynamicText(iconElement) {
    const wrapper = iconElement.closest('.game-uid-wrapper');
    const text = wrapper.querySelector('.copy-text').innerText.trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        iconElement.style.color = '#5ec8ff';
        setTimeout(() => iconElement.style.color = '#ffffffcc', 800);
    });
}
function copyDiscordUsername() {
    const username = "kienmanhluu";
    navigator.clipboard.writeText(username).then(() => {
        const tooltip = document.getElementById("discord-tooltip");
        tooltip.textContent = "Copied!";
        tooltip.style.backgroundColor = "#06c755";
        setTimeout(() => {
            tooltip.textContent = "Click to Copy ID";
            tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
        }, 1500);
    });
}

// --- YOUTUBE PLAYER & 3D CAROUSEL ---
let ytPlayer;
let isYtPlaying = false;
let isMusicUnlocked = false; 
let currentVideoID = "YNaFdsEIvew"; 
let currentActiveBtn = null; 
let musicCurrentIndex = 0;
const musicCards = document.querySelectorAll('.music-box-new');

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-audio-player', {
        height: '0', width: '0', videoId: currentVideoID,
        playerVars: { 'autoplay': 0, 'controls': 0, 'showinfo': 0, 'rel': 0, 'playsinline': 1 },
        events: {
            'onReady': (event) => { 
                ytPlayer.setVolume(50); 
                currentActiveBtn = document.querySelector('.play-btn-circle');
            },
            'onStateChange': onPlayerStateChange
        }
    });
}
function onPlayerStateChange(event) {
    if (event.data === 0) ytPlayer.playVideo(); 
    if (event.data == 1) { isYtPlaying = true; updateAllIcons(); } 
    else if (event.data == 2 || event.data == 0) { isYtPlaying = false; updateAllIcons(); }
}
function updateAllIcons() {
    document.querySelectorAll('.play-btn-circle i').forEach(icon => { icon.className = 'fa-solid fa-play'; });
    if (isYtPlaying && currentActiveBtn) {
        const activeIcon = currentActiveBtn.querySelector('i');
        if (activeIcon) activeIcon.className = 'fa-solid fa-pause';
    }
}
function toggleMusic(videoId, element) {
    if (!ytPlayer || typeof ytPlayer.loadVideoById !== 'function') return;
    isMusicUnlocked = true;
    if (currentVideoID === videoId) {
        isYtPlaying ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
    } else {
        currentVideoID = videoId;
        currentActiveBtn = element;
        ytPlayer.loadVideoById(videoId);
        musicCurrentIndex = Array.from(musicCards).findIndex(card => card.contains(element));
        updateMusicCarousel();
    }
}
function updateMusicCarousel() {
    musicCards.forEach((card, i) => {
        card.classList.remove('active', 'prev-card', 'next-card', 'hidden');
        if (i === musicCurrentIndex) card.classList.add('active');
        else if (i === (musicCurrentIndex - 1 + musicCards.length) % musicCards.length) card.classList.add('prev-card');
        else if (i === (musicCurrentIndex + 1) % musicCards.length) card.classList.add('next-card');
        else card.classList.add('hidden');
    });
}
function moveCarousel(step) {
    musicCurrentIndex = (musicCurrentIndex + step + musicCards.length) % musicCards.length;
    updateMusicCarousel();
}
document.addEventListener('DOMContentLoaded', updateMusicCarousel);

// --- WELCOME & PHYSICS ---
function closeWelcome() {
    const overlay = document.getElementById('welcome-overlay');
    overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none';
    if (window.ytPlayer) { ytPlayer.playVideo(); isMusicUnlocked = true; }
    setTimeout(() => { overlay.style.display = 'none'; }, 500);
}
const mahiruImg = document.getElementById("draggableImg");
const GRAVITY = 0.6; const BOUNCE = 0.7; const FRICTION = 0.96;
let isDragging = false; let isThrown = false;
let pos = { x: 0, y: 0 }; let vel = { x: 0, y: 0 };
let rot = 0; let rotVel = 0; let dragOffset = { x: 0, y: 0 };
if (mahiruImg) {
    const getX = (e) => e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const getY = (e) => e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    function startDrag(e) {
        isDragging = true; isThrown = false;
        const rect = mahiruImg.getBoundingClientRect();
        if (mahiruImg.parentElement !== document.body) document.body.appendChild(mahiruImg);
        mahiruImg.style.position = "fixed";
        pos = { x: rect.left, y: rect.top };
        dragOffset = { x: getX(e) - rect.left, y: getY(e) - rect.top };
        vel = { x: 0, y: 0 };
    }
    function drag(e) {
        if (!isDragging) return;
        const cx = getX(e); const cy = getY(e);
        const lastX = pos.x; const lastY = pos.y;
        pos.x = cx - dragOffset.x; pos.y = cy - dragOffset.y;
        vel = { x: pos.x - lastX, y: pos.y - lastY };
        mahiruImg.style.left = pos.x + "px"; mahiruImg.style.top = pos.y + "px";
    }
    function endDrag() { if (!isDragging) return; isDragging = false; isThrown = true; rotVel = vel.x * 1.2; updatePhysics(); }
    mahiruImg.addEventListener("mousedown", startDrag); mahiruImg.addEventListener("touchstart", startDrag);
    document.addEventListener("mousemove", drag); document.addEventListener("touchmove", drag);
    document.addEventListener("mouseup", endDrag); document.addEventListener("touchend", endDrag);
    function updatePhysics() {
        if (!isDragging && isThrown) {
            vel.y += GRAVITY; pos.x += vel.x; pos.y += vel.y;
            const floor = window.innerHeight - mahiruImg.offsetHeight;
            const rightWall = window.innerWidth - mahiruImg.offsetWidth;
            if (pos.y >= floor) { pos.y = floor; vel.y *= -BOUNCE; }
            if (pos.x <= 0 || pos.x >= rightWall) { pos.x = pos.x <= 0 ? 0 : rightWall; vel.x *= -0.8; }
            vel.x *= (pos.y >= floor) ? FRICTION : 0.99;
            rot += (pos.y >= floor && Math.abs(vel.x) > 0.1) ? (vel.x * 2.5) : rotVel;
            mahiruImg.style.left = pos.x + "px"; mahiruImg.style.top = pos.y + "px";
            mahiruImg.style.transform = `rotate(${rot}deg)`;
            if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1 || pos.y < floor) requestAnimationFrame(updatePhysics);
        }
    }
}

// --- OTHERS: DISCORD, LENIS, PORTFOLIO ---
const discordUserID = "838041121090830366";
async function fetchDiscordStatus() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserID}`);
        const data = await response.json();
        if (data.success) {
            const status = data.data.discord_status;
            document.getElementById("discord-status-dot").className = "status-dot " + status;
            document.getElementById("discord-status-text").innerText = status.charAt(0).toUpperCase() + status.slice(1);
        }
    } catch (e) {}
}
fetchDiscordStatus(); setInterval(fetchDiscordStatus, 5000);

if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ duration: 1.2 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
}

const pfFullData = {
    '3d': ["https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/alime%20background%20file/20250709_004547.jpg","https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/alime%20background%20file/20250709_004559.jpg","https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/alime%20background%20file/IMG_20250617_190900.jpg"],
    'drawing': ["https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/Drawing/Untitled71_0009-26-14_20260309210516.png","https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/Drawing/Untitled68_0002-46-51_20260302173559.jpg"]
};
function toggleSection(type) {
    const grid = document.getElementById("modal-grid");
    document.getElementById("modal-pf-title").innerText = type === '3d' ? "3D Backgrounds" : "Drawings";
    grid.innerHTML = '';
    pfFullData[type].forEach(src => {
        const img = document.createElement('img'); img.src = src; img.className = "pf-img-full";
        img.onclick = () => { document.getElementById("lightbox-img").src = src; document.getElementById("lightbox").classList.add("active"); };
        grid.appendChild(img);
    });
    document.getElementById("portfolioModal").classList.add("active");
}
function closePortfolio() { document.getElementById("portfolioModal").classList.remove("active"); }
function unlockAudio() {
    if (isMusicUnlocked || !ytPlayer) return;
    ytPlayer.playVideo(); isMusicUnlocked = true;
    document.removeEventListener('click', unlockAudio);
}
document.addEventListener('click', unlockAudio);