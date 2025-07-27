// Load episodes data with Firefox-compatible cache busting
let episodes = {};

// Dynamic import with Firefox compatibility
async function loadEpisodes() {
    try {
        const module = await import('./data/generatedEpisodes.js?t=' + Math.random());
        episodes = module.episodes;
        update(); // Update display after episodes are loaded
    } catch (error) {
        console.error('Failed to load episodes:', error);
        // Fallback to static import
        const fallbackModule = await import('./data/generatedEpisodes.js');
        episodes = fallbackModule.episodes;
        update();
    }
}

let currentEpisode = 0;
const maxEpisode = 146; // Based on your data

// Initialize episodes loading
loadEpisodes();

// Create the single dial container
document.getElementById('dials').innerHTML = `
    <div class="dial-container">
        <div class="dial-track" id="dialTrack">
            <div class="dial-handle" id="dialHandle"></div>
        </div>
        <div class="episode-number" id="episodeNumber">${currentEpisode}</div>
    </div>
`;

const dialTrack = document.getElementById('dialTrack');
const dialHandle = document.getElementById('dialHandle');
const episodeNumber = document.getElementById('episodeNumber');

let isDragging = false;
let startX = 0;
let startEpisode = 0;

// Mouse events
dialHandle.addEventListener('mousedown', handleStart);
document.addEventListener('mousemove', handleMove);
document.addEventListener('mouseup', handleEnd);

// Touch events
dialHandle.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleEnd);

// Keyboard events
document.addEventListener('keydown', handleKeyboard);

function handleStart(e) {
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX;
    startEpisode = currentEpisode;
    dialHandle.style.cursor = 'grabbing';
    e.preventDefault();
}

function handleTouchStart(e) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startEpisode = currentEpisode;
    e.preventDefault();
}

function handleMove(e) {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const deltaX = currentX - startX;
    const sensitivity = 3; // Adjust this to change sensitivity
    
    const newEpisode = Math.max(0, Math.min(maxEpisode, startEpisode + Math.floor(deltaX / sensitivity)));
    
    if (newEpisode !== currentEpisode) {
        currentEpisode = newEpisode;
        update();
    }
    
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const sensitivity = 3;
    
    const newEpisode = Math.max(0, Math.min(maxEpisode, startEpisode + Math.floor(deltaX / sensitivity)));
    
    if (newEpisode !== currentEpisode) {
        currentEpisode = newEpisode;
        update();
    }
    
    e.preventDefault();
}

function handleEnd(e) {
    if (isDragging) {
        isDragging = false;
        dialHandle.style.cursor = 'grab';
    }
}

function handleKeyboard(e) {
    if (e.key === 'ArrowLeft') {
        currentEpisode = Math.max(0, currentEpisode - 1);
        update();
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        currentEpisode = Math.min(maxEpisode, currentEpisode + 1);
        update();
        e.preventDefault();
    }
}

// Wheel event for mouse scroll
dialTrack.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    currentEpisode = Math.max(0, Math.min(maxEpisode, currentEpisode + delta));
    update();
});

function update() {
    // Update episode number display
    episodeNumber.textContent = currentEpisode;
    
    // Update handle position
    const percentage = (currentEpisode / maxEpisode) * 100;
    dialHandle.style.left = `${percentage}%`;
    
    // Update episode content
    if (episodes.length === 0) {
        document.getElementById('episode').innerHTML = "Loading...";
    } else {
        document.getElementById('episode').innerHTML = episodes[currentEpisode] || "";
    }
}

// Initialize
update();