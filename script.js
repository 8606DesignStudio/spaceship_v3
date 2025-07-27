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

// Initialize episodes loading
loadEpisodes();

document.getElementById('dials').innerHTML = `<div class="dial" data-dial-index="0">${currentNumber}</div>`;

const dialElement = document.querySelector('.dial');
dialElement.addEventListener('click', () => spin());
dialElement.addEventListener('touchstart', (e) => handleTouchStart(e));
dialElement.addEventListener('touchend', handleTouchEnd);

function spin() {
    currentNumber = (currentNumber + 1) % 147; // 0-146 episodes
    
    update();
}

function spinDown() {
    currentNumber = (currentNumber - 1 + 147) % 147; // 0-146 episodes
    
    update();
}

let touchStartY = 0;
let touchActive = false;

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchActive = true;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!touchActive) return;
    
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
    
    touchActive = false;
    e.preventDefault();
}

function update() {
    const dialElement = document.querySelector('.dial');
    dialElement.textContent = currentNumber;
    
    const episodeNum = currentNumber;
    
    // Only show "Loading..." if episodes haven't been loaded yet
    // Otherwise show the episode or empty string for non-existent episodes
    if (episodes.length === 0) {
        document.getElementById('episode').innerHTML = "Loading...";
    } else {
        document.getElementById('episode').innerHTML = episodes[episodeNum] || "";
    }
}
