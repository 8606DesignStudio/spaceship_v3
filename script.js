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

let currentNumber = 0;
const maxEpisode = 146; // Update this when new episodes are added

// Initialize episodes loading
loadEpisodes();

document.getElementById('dials').innerHTML = `<div class="dial">${String(currentNumber).padStart(3, '0')}</div>`;

const dialElement = document.querySelector('.dial');
dialElement.addEventListener('click', () => spin());
dialElement.addEventListener('touchstart', (e) => handleTouchStart(e));
dialElement.addEventListener('touchmove', (e) => handleTouchMove(e));
dialElement.addEventListener('touchend', handleTouchEnd);

function spin() {
    currentNumber = (currentNumber + 1) % (maxEpisode + 1);
    update();
}

function spinDown() {
    currentNumber = (currentNumber - 1 + maxEpisode + 1) % (maxEpisode + 1);
    update();
}

let touchStartY = 0;
let touchStartX = 0;
let lastTouchX = 0;
let baseEpisodeNumber = 0;
const swipeSensitivity = 30; // Pixels per episode change

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    lastTouchX = touchStartX;
    baseEpisodeNumber = currentNumber;
    e.preventDefault();
}

function handleTouchMove(e) {
    const currentTouchX = e.touches[0].clientX;
    const deltaX = currentTouchX - touchStartX;
    
    // Calculate episode change based on swipe distance
    const episodeChange = Math.floor(Math.abs(deltaX) / swipeSensitivity);
    
    if (Math.abs(deltaX) > 10) { // Only start changing after 10px to avoid jitter
        let newEpisodeNumber;
        
        if (deltaX > 0) {
            // Swiping right - increase episode number
            newEpisodeNumber = (baseEpisodeNumber + episodeChange) % (maxEpisode + 1);
        } else {
            // Swiping left - decrease episode number
            newEpisodeNumber = (baseEpisodeNumber - episodeChange + maxEpisode + 1) % (maxEpisode + 1);
        }
        
        // Update the dial display in real-time
        currentNumber = newEpisodeNumber;
        updateDialOnly();
    }
    
    lastTouchX = currentTouchX;
    e.preventDefault();
}

function handleTouchEnd(e) {
    // Update the episode content to match the current dial number
    updateEpisodeContent();
    e.preventDefault();
}

function updateDialOnly() {
    const dialElement = document.querySelector('.dial');
    dialElement.textContent = String(currentNumber).padStart(3, '0');
}

function updateEpisodeContent() {
    // Only show "Loading..." if episodes haven't been loaded yet
    // Otherwise show the episode or empty string for non-existent episodes
    if (episodes.length === 0) {
        document.getElementById('episode').innerHTML = "Loading...";
    } else {
        document.getElementById('episode').innerHTML = episodes[currentNumber] || "";
    }
}

function update() {
    updateDialOnly();
    updateEpisodeContent();
}
