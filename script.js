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

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}

function handleTouchEnd(e) {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    const threshold = 30;
    
    if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
            spin();
        } else {
            spinDown();
        }
    } else {
        spin();
    }
    e.preventDefault();
}

function update() {
    const dialElement = document.querySelector('.dial');
    dialElement.textContent = String(currentNumber).padStart(3, '0');
    
    // Only show "Loading..." if episodes haven't been loaded yet
    // Otherwise show the episode or empty string for non-existent episodes
    if (episodes.length === 0) {
        document.getElementById('episode').innerHTML = "Loading...";
    } else {
        document.getElementById('episode').innerHTML = episodes[currentNumber] || "";
    }
}
