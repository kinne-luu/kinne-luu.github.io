// --- SAKURA EFFECT ---
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('sakura');
    petal.style.left = Math.random() * 100 + 'vw';
    const size = Math.random() * 10 + 5; 
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    const duration = Math.random() * 3 + 4; 
    petal.style.animationDuration = duration + 's';
    petal.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(petal);
    setTimeout(() => { petal.remove(); }, duration * 1000 + 2000);
}
setInterval(createPetal, 300);




// --- DYNAMIC COPY FUNCTION ---
function copyDynamicText(iconElement) {
    const wrapper = iconElement.closest('.game-uid-wrapper');
    const textElement = wrapper.querySelector('.copy-text');
    const text = textElement.innerText.trim();
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
    }).catch(err => console.error("Copy failed", err));
}

// --- LIGHTBOX PORTFOLIO (ZOOM CẬN CẢNH) ---
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
if (lightbox) {
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) { lightbox.classList.remove("active"); }
    });
}

// --- YOUTUBE MUSIC PLAYER & MOBILE AUTOPLAY ---
let ytPlayer;
let isYtPlaying = false;
let isMusicUnlocked = false; // Theo dõi tương tác đầu tiên
const playIcon = document.getElementById('play-icon');
const videoID = "YNaFdsEIvew"; 

// Tải API YouTube
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-audio-player', {
        height: '0', width: '0', 
        videoId: videoID,
        playerVars: { 
            'autoplay': 0, 'controls': 0, 'showinfo': 0, 'rel': 0, 
            'loop': 1, 'playlist': videoID 
        },
        events: {
            'onReady': (event) => { ytPlayer.setVolume(50); },
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        isYtPlaying = true;
        if (playIcon) { playIcon.classList.replace('fa-play', 'fa-pause'); }
    } else {
        isYtPlaying = false;
        if (playIcon) { playIcon.classList.replace('fa-pause', 'fa-play'); }
    }
}

// Hàm Play/Pause thủ công
function toggleMusic() {
    if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') return;
    isMusicUnlocked = true; // Đánh dấu đã tương tác
    isYtPlaying ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
}

// Hàm kích hoạt nhạc khi chạm màn hình lần đầu (Fix Mobile)
function unlockAudio() {
    if (isMusicUnlocked || !ytPlayer || typeof ytPlayer.playVideo !== 'function') return;
    
    ytPlayer.playVideo();
    isMusicUnlocked = true;
    
    // Xóa các event này sau khi nhạc đã chạy
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click', unlockAudio);
}
document.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio);

// --- SCROLL BAR HIDE/SHOW ---
let isScrolling;
window.addEventListener('scroll', () => {
    document.body.classList.add('is-scrolling');
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
    }, 1000); 
});

// --- DISCORD STATUS API ---
const discordUserID = "838041121090830366"; 
const statusDot = document.getElementById("discord-status-dot");
const statusText = document.getElementById("discord-status-text");

async function fetchDiscordStatus() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserID}`);
        const data = await response.json();
        if (data.success) {
            const status = data.data.discord_status; 
            statusDot.className = "status-dot " + status;
            statusText.innerText = status.charAt(0).toUpperCase() + status.slice(1);
        }
    } catch (error) {
        if (statusDot) statusDot.className = "status-dot offline";
        if (statusText) statusText.innerText = "Offline";
    }
}
fetchDiscordStatus();
setInterval(fetchDiscordStatus, 5000);

// --- LENIS SMOOTH SCROLL ---
if (typeof Lenis !== 'undefined') {
    window.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smoothWheel: true,     
        smoothTouch: false,    
        syncTouch: false       
    });
    function raf(time) { window.lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
}

// --- PHYSICS DRAWER ---
const drawer = document.getElementById("drawerBox");
const content = document.getElementById("drawerContent");
const handle = document.getElementById("drawerHandle");
let isDrawerOpen = false;
if (handle && drawer && content) {
    drawer.classList.add("drawer-smooth");
    handle.addEventListener("click", () => {
        isDrawerOpen = !isDrawerOpen;
        drawer.style.left = isDrawerOpen ? "0px" : "-170px";
        content.style.opacity = isDrawerOpen ? "1" : "0.3";
    });
}

// --- MAHIRU PHYSICS ---
const mahiruImg = document.getElementById("draggableImg");
const GRAVITY = 0.6; const BOUNCE = 0.7; const FRICTION = 0.96;
let isDragging = false; let isThrown = false;
let pos = { x: 0, y: 0 }; let vel = { x: 0, y: 0 };
let rot = 0; let rotVel = 0; let dragOffset = { x: 0, y: 0 };
let lastMouse = { x: 0, y: 0 }; let physicsFrame;

if (mahiruImg) {
    const getX = (e) => e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const getY = (e) => e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    function startDrag(e) {
        isDragging = true; isThrown = false;
        const cx = getX(e); const cy = getY(e);
        const rect = mahiruImg.getBoundingClientRect();
        if (mahiruImg.parentElement !== document.body) document.body.appendChild(mahiruImg);
        mahiruImg.style.position = "fixed";
        pos.x = rect.left; pos.y = rect.top;
        dragOffset.x = cx - rect.left; dragOffset.y = cy - rect.top;
        vel = { x: 0, y: 0 }; lastMouse = { x: cx, y: cy };
        cancelAnimationFrame(physicsFrame);
    }
    function drag(e) {
        if (!isDragging) return;
        const cx = getX(e); const cy = getY(e);
        pos.x = cx - dragOffset.x; pos.y = cy - dragOffset.y;
        vel.x = cx - lastMouse.x; vel.y = cy - lastMouse.y;
        mahiruImg.style.left = pos.x + "px"; mahiruImg.style.top = pos.y + "px";
        lastMouse = { x: cx, y: cy };
    }
    function endDrag() { if (!isDragging) return; isDragging = false; isThrown = true; rotVel = vel.x * 1.2; updatePhysics(); }

    mahiruImg.addEventListener("mousedown", startDrag);
    mahiruImg.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);

    function updatePhysics() {
        if (!isDragging && isThrown) {
            vel.y += GRAVITY; pos.x += vel.x; pos.y += vel.y;
            const floor = window.innerHeight - mahiruImg.offsetHeight;
            const rightWall = window.innerWidth - mahiruImg.offsetWidth;
            if (pos.y >= floor) { pos.y = floor; vel.y *= -BOUNCE; if (Math.abs(vel.y) < 1.2) vel.y = 0; }
            if (pos.x <= 0 || pos.x >= rightWall) { pos.x = pos.x <= 0 ? 0 : rightWall; vel.x *= -0.8; rotVel *= -0.5; }
            vel.x *= (pos.y >= floor) ? FRICTION : 0.99;
            rot += (pos.y >= floor && Math.abs(vel.x) > 0.1) ? (vel.x * 2.5) : rotVel;
            mahiruImg.style.left = pos.x + "px"; mahiruImg.style.top = pos.y + "px";
            mahiruImg.style.transform = `rotate(${rot}deg)`;
            if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1 || pos.y < floor) physicsFrame = requestAnimationFrame(updatePhysics);
        }
    }
}





// --- WELCOME POP-UP LOGIC ---
function closeWelcome() {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return; // Phòng trường hợp không tìm thấy ID

    // 1. Làm mờ và khóa tương tác ngay lập tức
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    
    // 2. Kích hoạt nhạc YouTube
    if (window.ytPlayer && typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
        isMusicUnlocked = true;
    }
    
    // 3. Xóa hoàn toàn khỏi màn hình sau khi hiệu ứng mờ kết thúc
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 500);
}


// --- PORTFOLIO MODAL LOGIC ---
const pfFullData = {
    '3d': ["https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/alime%20background%20file/20250709_004547.jpg","https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/alime%20background%20file/20250709_004559.jpg","https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/alime%20background%20file/IMG_20250617_190900.jpg","https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/alime%20background%20file/New%20Project%2065%20%5B7F642B5%5D.png","https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/alime%20background%20file/New%20Project%2043%20%5B4C9E502%5D.png"],
    'drawing': ["https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/Drawing/Untitled71_0009-26-14_20260309210516.png","https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/Drawing/Untitled68_0002-46-51_20260302173559.jpg"]
};
function toggleSection(type) {
    const modal = document.getElementById("portfolioModal");
    const grid = document.getElementById("modal-grid");
    document.getElementById("modal-pf-title").innerText = type === '3d' ? "3D Backgrounds" : "Drawings";
    grid.innerHTML = ''; 
    pfFullData[type].forEach(src => {
        const img = document.createElement('img'); img.src = src; img.className = "pf-img-full";
        img.onclick = (e) => { e.stopPropagation(); lightboxImg.src = src; lightbox.classList.add("active"); };
        grid.appendChild(img);
    });
    modal.classList.add("active"); document.body.style.overflow = 'hidden';
}
function closePortfolio() { document.getElementById("portfolioModal").classList.remove("active"); document.body.style.overflow = 'auto'; }
document.getElementById("portfolioModal").addEventListener("click", function(e) { if (e.target === this) closePortfolio(); });