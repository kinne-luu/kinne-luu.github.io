const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEra84HjALgZ3L1exZV-CbPblskFQlr1MX4f2nuQxdVj-uLNyPDxzLMddNVcK5ECsF/exec";

let pfFullData = {};

function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('sakura');
    petal.style.left = Math.random() * 100 + 'vw';
    const size = Math.random() * 10 + 5;
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    const duration = Math.random() * 3 + 4;
    petal.style.animationDuration = duration + 's';
    document.body.appendChild(petal);
    setTimeout(() => { petal.remove(); }, duration * 1000 + 2000);
}
setInterval(createPetal, 300);

// Load data trực tiếp từ Apps Script API
async function loadPortfolioData() {
    const container = document.getElementById('portfolio-container');
    if (!container) return;
    try {
        const response = await fetch(APP_SCRIPT_URL);
        const data = await response.json();
        
        pfFullData = data.portfolio || {};
        
        if (Object.keys(pfFullData).length > 0) renderPortfolio();
        else container.innerHTML = '<div style="color:white; text-align:center; width:100%">Chưa có dữ liệu</div>';
    } catch (e) { 
        console.error("Load Data Error", e); 
        container.innerHTML = '<div style="color:red; text-align:center; width:100%">Lỗi tải dữ liệu</div>';
    }
}

function initLazyLoad() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    }, { rootMargin: '100px' });
    document.querySelectorAll('.lazy-img').forEach(img => observer.observe(img));
}

function renderPortfolio() {
    const container = document.getElementById('portfolio-container');
    container.innerHTML = '';
    Object.keys(pfFullData).forEach(type => {
        const images = pfFullData[type];
        const section = document.createElement('div');
        section.className = 'portfolio-section';
        section.onclick = () => openPortfolioDetail(type);
        let previewHTML = images.slice(0, 2).map(src => `<img data-src="${src}" src="" class="pf-img-prev lazy-img" loading="lazy">`).join('');
        section.innerHTML = `<div class="section-content-wrapper"><h3 class="section-title">${type.toUpperCase()}</h3><div class="section-preview-scroll">${previewHTML}</div><div class="section-hover-overlay"><span>Click to view</span></div></div>`;
        container.appendChild(section);
    });
    initLazyLoad();
}

function openPortfolioDetail(type) {
    const grid = document.getElementById("modal-grid");
    document.getElementById("modal-pf-title").innerText = type.toUpperCase();
    grid.innerHTML = pfFullData[type].map(src => `<img data-src="${src}" src="" class="pf-img-full lazy-img" onclick="showLightbox('${src}')">`).join('');
    document.getElementById("portfolioModal").classList.add("active");
    initLazyLoad();
}
function showLightbox(src) { document.getElementById("lightbox-img").src = src; document.getElementById("lightbox").classList.add("active"); }
function closePortfolio() { document.getElementById("portfolioModal").classList.remove("active"); }

function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('active');
    document.getElementById('sync-password').value = "";
    document.getElementById('settings-unlock-zone').style.display = "block";
    document.getElementById('settings-admin-zone').style.display = "none";
    document.getElementById('sync-status-msg').innerText = "";
}
function closeSettingsModal() { document.getElementById('settingsModal').classList.remove('active'); }

// Gửi password lên server để check, đúng mới lấy data setting về
async function checkSettingsPass() {
    const pass = document.getElementById('sync-password').value;
    const statusMsg = document.getElementById('sync-status-msg');
    
    if (!pass) return;
    statusMsg.innerText = "Đang kiểm tra...";

    try {
        const response = await fetch(APP_SCRIPT_URL, {
            method: 'POST',
            headers: {'Content-Type': 'text/plain;charset=utf-8'},
            body: JSON.stringify({ action: 'login', password: pass })
        });
        const result = await response.json();

        if (result.success) {
            statusMsg.innerText = "Đã mở khóa!";
            document.getElementById('settings-unlock-zone').style.display = "none";
            document.getElementById('settings-admin-zone').style.display = "block";

            // Render form điền link
            const container = document.getElementById('link-inputs-container');
            container.innerHTML = '';
            if (result.settings && result.settings.length > 0) {
                result.settings.forEach(s => addLinkRow(s.type, s.url));
            } else {
                addLinkRow();
            }
        } else {
            statusMsg.innerText = result.message;
        }
    } catch(e) {
        statusMsg.innerText = "Lỗi kết nối server!";
    }
}

function addLinkRow(type = "", url = "") {
    const div = document.createElement('div');
    div.className = 'link-row';
    div.innerHTML = `<input type="text" placeholder="Type" class="setting-input-type" value="${type}"><input type="text" placeholder="URL" class="setting-input-url" value="${url}"><button onclick="this.parentElement.remove()" class="remove-row-btn">&times;</button>`;
    document.getElementById('link-inputs-container').appendChild(div);
}

// Push data update kèm theo password
async function performSync() {
    const passInput = document.getElementById('sync-password').value;
    const statusMsg = document.getElementById('sync-status-msg');
    const driveLinks = Array.from(document.querySelectorAll('.link-row')).map(row => ({
        type: row.querySelector('.setting-input-type').value.trim().toLowerCase(),
        url: row.querySelector('.setting-input-url').value.trim()
    })).filter(item => item.type && item.url);

    statusMsg.innerText = "Đang cập nhật hệ thống...";

    try {
        const response = await fetch(APP_SCRIPT_URL, { 
            method: 'POST', 
            headers: {'Content-Type': 'text/plain;charset=utf-8'}, 
            body: JSON.stringify({ action: 'update', password: passInput, driveLinks: driveLinks }) 
        });
        const result = await response.json();
        
        if (result.success) {
            statusMsg.innerText = "Thành công!";
            setTimeout(() => location.reload(), 500);
        } else {
            statusMsg.innerText = result.message;
        }
    } catch (e) { 
        statusMsg.innerText = "Lỗi rùi nha!";
    }
}

let ytPlayer, isYtPlaying = false, currentVideoID = "YNaFdsEIvew", musicCurrentIndex = 0;
const musicCards = document.querySelectorAll('.music-box-new');

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-audio-player', {
        height: '0', width: '0', videoId: currentVideoID,
        playerVars: { 'autoplay': 0, 'controls': 0, 'playsinline': 1, 'loop': 1, 'playlist': currentVideoID },
        events: { 'onStateChange': (e) => { isYtPlaying = (e.data == 1); updateMusicIcons(); } }
    });
}

function updateMusicIcons() {
    document.querySelectorAll('.play-btn-circle i').forEach(i => i.className = 'fa-solid fa-play');
    if (isYtPlaying) {
        const activeCard = musicCards[musicCurrentIndex];
        if (activeCard) activeCard.querySelector('i').className = 'fa-solid fa-pause';
    }
}

function toggleMusic(videoId, element) {
    if (currentVideoID === videoId) { isYtPlaying ? ytPlayer.pauseVideo() : ytPlayer.playVideo(); }
    else { currentVideoID = videoId; ytPlayer.loadVideoById(videoId); musicCurrentIndex = Array.from(musicCards).findIndex(c => c.contains(element)); updateMusicCarousel(); }
}

function updateMusicCarousel() {
    musicCards.forEach((card, i) => {
        card.classList.remove('active', 'prev-card', 'next-card', 'hidden');
        if (i === musicCurrentIndex) card.classList.add('active');
        else if (i === (musicCurrentIndex - 1 + musicCards.length) % musicCards.length) card.classList.add('prev-card');
        else if (i === (musicCurrentIndex + 1) % musicCards.length) card.classList.add('next-card');
        else card.classList.add('hidden');
    });
    updateMusicIcons();
}
function moveCarousel(step) { musicCurrentIndex = (musicCurrentIndex + step + musicCards.length) % musicCards.length; updateMusicCarousel(); }

function initPhysics() {
    const img = document.getElementById("draggableImg");
    if (!img) return;

    // --- THÊM Ở ĐÂY: Ẩn gấu và dừng logic vật lý trên màn hình nhỏ (Mobile/Tablet) ---
    if (window.innerWidth <= 1024) {
        img.style.display = 'none';
        return;
    }

    let isDragging = false;
    let pos = { x: 20, y: window.innerHeight * 0.38 };
    let vel = { x: 0, y: 0 };
    let dragOff = { x: 0, y: 0 };
    let rot = 0;
    let animFrame = null;

    requestAnimationFrame(() => {
        const r = img.getBoundingClientRect();
        pos = { x: r.left, y: r.top };
    });

    function startDrag(clientX, clientY) {
        isDragging = true;
        const r = img.getBoundingClientRect();
        pos = { x: r.left, y: r.top };
        dragOff = { x: clientX - r.left, y: clientY - r.top };
        vel = { x: 0, y: 0 };
        img.style.cursor = 'grabbing';
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    }

    function moveDrag(clientX, clientY) {
        if (!isDragging) return;
        const nx = clientX - dragOff.x;
        const ny = clientY - dragOff.y;
        vel.x = nx - pos.x;
        vel.y = ny - pos.y;
        pos = { x: nx, y: ny };
        img.style.left = pos.x + 'px';
        img.style.top = pos.y + 'px';
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        img.style.cursor = 'grab';

        const run = () => {
            if (isDragging) return;
            const floor = window.innerHeight - img.offsetHeight;
            const wallR = window.innerWidth - img.offsetWidth;

            vel.y += 0.55;
            vel.x *= 0.995;
            pos.x += vel.x;
            pos.y += vel.y;

            if (pos.y >= floor) { pos.y = floor; vel.y *= -0.65; vel.x *= 0.92; if (Math.abs(vel.y) < 0.8) vel.y = 0; }
            if (pos.y < 0) { pos.y = 0; vel.y *= -0.5; }
            if (pos.x <= 0) { pos.x = 0; vel.x *= -0.75; }
            if (pos.x >= wallR) { pos.x = wallR; vel.x *= -0.75; }

            rot += vel.x * 1.5;
            img.style.left = pos.x + 'px';
            img.style.top = pos.y + 'px';
            img.style.transform = 'rotate(' + rot + 'deg)';

            if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1 || pos.y < floor) {
                animFrame = requestAnimationFrame(run);
            } else {
                animFrame = null;
            }
        };
        animFrame = requestAnimationFrame(run);
    }

    img.addEventListener('mousedown', (e) => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
    img.addEventListener('touchstart', (e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });
    document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => { 
        if (isDragging) {
            moveDrag(e.touches[0].clientX, e.touches[0].clientY); 
            e.preventDefault(); 
        }
    }, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

document.addEventListener('DOMContentLoaded', () => {
    updateMusicCarousel();
    initPhysics();
    loadPortfolioData();

    fetchDiscordStatus();
    setInterval(fetchDiscordStatus, 10000);

    const lenis = new Lenis({ duration: 1.2, smooth: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // --- FIX: CHUYỂN CUỘN DỌC THÀNH NGANG & CHẶN LENIS ---
    const pfContainer = document.getElementById('portfolio-container');
    if (pfContainer) {
        pfContainer.addEventListener('wheel', (e) => {
            e.preventDefault();       // Chặn trình duyệt cuộn dọc mặc định
            e.stopPropagation();      // Chặn Lenis cuộn toàn bộ trang web
            pfContainer.scrollLeft += e.deltaY; // Lấy lực cuộn dọc cộng vào cuộn ngang
        }, { passive: false });
    }

    // --- FIX: CHẶN CUỘN TRANG KHI XEM MODAL CHI TIẾT ẢNH ---
    const modalGrid = document.getElementById('modal-grid');
    if (modalGrid) {
        modalGrid.addEventListener('wheel', (e) => {
            e.stopPropagation(); // Chỉ cuộn danh sách ảnh, không cuộn nền web bên dưới
        }, { passive: true });

        const lineBtn = document.querySelector('.line-wrapper');
    if (lineBtn) {
        lineBtn.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                const qrImgSrc = lineBtn.querySelector('.qr-tooltip-dark img').src;
                showLightbox(qrImgSrc);
            }
        });
    }
    
    }
});

function copyDynamicText(i) { navigator.clipboard.writeText(i.closest('.game-uid-wrapper').querySelector('.copy-text').innerText); i.style.color = "#5ec8ff"; setTimeout(() => i.style.color = "", 800); }
function copyDiscordUsername() { navigator.clipboard.writeText("kienmanhluu"); alert("Copied Discord!"); }
function closeWelcome() { document.getElementById('welcome-overlay').style.display = 'none'; if (ytPlayer) ytPlayer.playVideo(); }
document.getElementById('lightbox').onclick = function () { this.classList.remove('active'); };

async function fetchDiscordStatus() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/838041121090830366`);
        const data = await res.json();
        if (data.success) {
            const status = data.data.discord_status;
            const dot = document.getElementById("discord-status-dot");
            const text = document.getElementById("discord-status-text");
            if (dot && text) {
                dot.className = "status-dot " + status;
                text.innerText = status.charAt(0).toUpperCase() + status.slice(1);
            }
        }
    } catch (e) {
        console.error("Lanyard Error:", e);
    }
}