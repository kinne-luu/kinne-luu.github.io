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

// --- MUSIC PLAYER ---
const audio = document.getElementById('bgm');
const playIcon = document.getElementById('play-icon');
function toggleMusic() {
    if (audio.paused) {
        audio.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    } else {
        audio.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    }
}
if (audio) audio.volume = 0.5;

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
    if (discordUserID === "NHAP_ID_DISCORD_CUA_BAN_VAO_DAY" || !statusDot) return;
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserID}`);
        const data = await response.json();
        if (data.success) {
            const status = data.data.discord_status; 
            statusDot.classList.remove("online", "idle", "dnd", "offline");
            switch (status) {
                case "online": statusDot.classList.add("online"); statusText.innerText = "Online"; break;
                case "idle": statusDot.classList.add("idle"); statusText.innerText = "Idle"; break;
                case "dnd": statusDot.classList.add("dnd"); statusText.innerText = "Do Not Disturb"; break;
                default: statusDot.classList.add("offline"); statusText.innerText = "Offline"; break;
            }
        }
    } catch (error) {
        if (statusDot) statusDot.className = "status-dot offline";
        if (statusText) statusText.innerText = "Offline";
    }
}
fetchDiscordStatus();
setInterval(fetchDiscordStatus, 5000);

// --- LENIS SMOOTH SCROLL ---
window.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    smooth: true,
});
function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- PHYSICS DRAWER ---
const drawer = document.getElementById("drawerBox");
const content = document.getElementById("drawerContent");
const handle = document.getElementById("drawerHandle");
let isDrawerOpen = false;
if (handle && drawer && content) {
    drawer.classList.add("drawer-smooth");
    handle.addEventListener("click", () => {
        isDrawerOpen = !isDrawerOpen;
        if (isDrawerOpen) {
            drawer.style.left = "0px";
            content.style.opacity = "1";
        } else {
            drawer.style.left = "-170px";
            content.style.opacity = "0.3";
        }
    });
}

// --- AUDIO AUTOPLAY ---
function enableAutoplay() {
    if (audio && audio.paused) {
        audio.play().then(() => {
            if (playIcon) {
                playIcon.classList.remove('fa-play');
                playIcon.classList.add('fa-pause');
            }
            window.removeEventListener('touchstart', enableAutoplay);
            window.removeEventListener('scroll', enableAutoplay);
            window.removeEventListener('mousedown', enableAutoplay);
        }).catch(error => console.log("Chưa thể phát nhạc: ", error));
    }
}
window.addEventListener('touchstart', enableAutoplay, { passive: false });
window.addEventListener('scroll', enableAutoplay);
window.addEventListener('mousedown', enableAutoplay);
window.addEventListener('wheel', enableAutoplay); 
window.addEventListener('keydown', enableAutoplay);

// --- MAHIRU PHYSICS (FULL) ---
const mahiruImg = document.getElementById("draggableImg");
const GRAVITY = 0.6;       
const BOUNCE = 0.7;        
const FRICTION = 0.96;     
const WALL_DAMPER = 0.8;   
const ROTATION_SPEED = 1.2;

let isDragging = false;
let isThrown = false;
let pos = { x: 0, y: 0 };
let vel = { x: 0, y: 0 };
let rot = 0;
let rotVel = 0;
let dragOffset = { x: 0, y: 0 };
let lastMouse = { x: 0, y: 0 };
let physicsFrame;

function getX(e) { return e.type.includes('touch') ? e.touches[0].clientX : e.clientX; }
function getY(e) { return e.type.includes('touch') ? e.touches[0].clientY : e.clientY; }

if (mahiruImg) {
    function startDrag(e) {
        if (e.target !== mahiruImg) return;
        isDragging = true;
        isThrown = false; 
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        const clientX = getX(e);
        const clientY = getY(e);
        const rect = mahiruImg.getBoundingClientRect();
        
        if (mahiruImg.parentElement !== document.body) { document.body.appendChild(mahiruImg); }
        mahiruImg.style.position = "fixed";
        mahiruImg.style.transform = `rotate(${rot}deg)`; 
        mahiruImg.style.transition = "none";
        mahiruImg.style.zIndex = "10000";
        
        pos.x = rect.left;
        pos.y = rect.top;
        mahiruImg.style.left = pos.x + "px";
        mahiruImg.style.top = pos.y + "px";
        dragOffset.x = clientX - rect.left;
        dragOffset.y = clientY - rect.top;
        
        vel = { x: 0, y: 0 };
        lastMouse = { x: clientX, y: clientY };
        cancelAnimationFrame(physicsFrame); 
    }

    function drag(e) {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault(); 
        const clientX = getX(e);
        const clientY = getY(e);
        pos.x = clientX - dragOffset.x;
        pos.y = clientY - dragOffset.y;
        vel.x = clientX - lastMouse.x;
        vel.y = clientY - lastMouse.y;
        mahiruImg.style.left = pos.x + "px";
        mahiruImg.style.top = pos.y + "px";
        lastMouse = { x: clientX, y: clientY };
    }

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        isThrown = true;
        rotVel = vel.x * ROTATION_SPEED;
        updatePhysics(); 
    }

    mahiruImg.addEventListener("mousedown", startDrag);
    mahiruImg.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
    document.addEventListener("touchcancel", endDrag);

    function updatePhysics() {
        if (!isDragging && isThrown) {
            vel.y += GRAVITY;
            pos.x += vel.x;
            pos.y += vel.y;
            const floor = window.innerHeight - mahiruImg.offsetHeight;
            const rightWall = window.innerWidth - mahiruImg.offsetWidth;
            let onGround = false;

            if (pos.y >= floor) {
                pos.y = floor; vel.y *= -BOUNCE; onGround = true;
                if (Math.abs(vel.y) < GRAVITY * 2) { vel.y = 0; }
            }
            if (pos.x <= 0) {
                pos.x = 0; vel.x *= -WALL_DAMPER; rotVel *= -0.5;
            } else if (pos.x >= rightWall) {
                pos.x = rightWall; vel.x *= -WALL_DAMPER; rotVel *= -0.5;
            }

            if (!onGround) {
                vel.x *= 0.99; rot += rotVel; rotVel *= 0.99;
            } else {
                vel.x *= FRICTION; 
                if (Math.abs(vel.x) > 0.1) { rot += (vel.x * 2.5); } else { vel.x = 0; rotVel = 0; }
            }

            mahiruImg.style.left = pos.x + "px";
            mahiruImg.style.top = pos.y + "px";
            mahiruImg.style.transform = `rotate(${rot}deg)`;
            if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1 || pos.y < floor) {
                physicsFrame = requestAnimationFrame(updatePhysics);
            }
        }
    }
}

// --- PORTFOLIO MODAL LOGIC (FULL SCREEN) ---
const pfFullData = {
    '3d': [
        "https://raw.githubusercontent.com/kienmanhluu/kinne/refs/heads/main/alime%20background%20file/20250709_004547.jpg",
        "https://raw.githubusercontent.com/kienmanhluu/kinne/main/alime%20background%20file/IMG_20250617_190900.jpg",
        "https://raw.githubusercontent.com/kienmanhluu/kinne/refs/heads/main/alime%20background%20file/IMG_20251107_111548.png",
        "https://raw.githubusercontent.com/kienmanhluu/kinne/refs/heads/main/alime%20background%20file/New%20Project%2065%20%5B7F642B5%5D.png",
        "https://raw.githubusercontent.com/kienmanhluu/kinne/refs/heads/main/alime%20background%20file/New%20Project%2065%20%5B7F642B5%5D.png",
        "https://raw.githubusercontent.com/kienmanhluu/kinne/main/alime%20background%20file/New%20Project%2043%20%5B4C9E502%5D.png"
    ],
    'drawing': [
        "https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/Drawing/Untitled71_0009-26-14_20260309210516.png",
        "https://raw.githubusercontent.com/kinne-luu/kinne-luu.github.io/refs/heads/main/Drawing/Untitled68_0002-46-51_20260302173559.jpg"

    ]
};

function toggleSection(type) {
    const modal = document.getElementById("portfolioModal");
    const grid = document.getElementById("modal-grid");
    const title = document.getElementById("modal-pf-title");

    title.innerText = type === '3d' ? "3D Backgrounds" : "Drawings";
    
    grid.innerHTML = ''; 
    pfFullData[type].forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = "pf-img-full";
        img.onclick = (e) => {
            e.stopPropagation();
            const lb = document.getElementById("lightbox");
            const lbImg = document.getElementById("lightbox-img");
            lbImg.src = img.src;
            lb.classList.add("active");
        };
        grid.appendChild(img);
    });

    modal.classList.add("active");
    document.body.style.overflow = 'hidden'; // Khóa cuộn màn hình dưới
}

function closePortfolio() {
    document.getElementById("portfolioModal").classList.remove("active");
    document.body.style.overflow = 'auto'; // Mở lại cuộn màn hình dưới
}

// Đóng khi click ngoài khung modal
document.getElementById("portfolioModal").addEventListener("click", function(e) {
    if (e.target === this) {
        closePortfolio();
    }
});

// --- ANTI F12 & RIGHT CLICK ---
// Chặn chuột phải
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Chặn các phím tắt mở DevTools và View Source
document.addEventListener('keydown', function(e) {
    // Chặn F12
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
    }
    // Chặn Ctrl+Shift+I (Mở DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
    }
    // Chặn Ctrl+Shift+J (Mở Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
    }
    // Chặn Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
    }
});