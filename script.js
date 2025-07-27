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

// Create a larger invisible touch area
const touchArea = document.createElement('div');
touchArea.style.position = 'absolute';
touchArea.style.width = '225px'; // 3x the dial width (75px * 3)
touchArea.style.height = '150px'; // 3x the dial height (50px * 3)
touchArea.style.left = '50%';
touchArea.style.top = '50%';
touchArea.style.transform = 'translate(-50%, -50%)';
touchArea.style.zIndex = '10';
// touchArea.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; // Uncomment to visualize the touch area

// Add the touch area to the dials container
document.getElementById('dials').appendChild(touchArea);

// Add event listeners to both the dial (for clicks) and touch area (for swipes)
dialElement.addEventListener('click', () => spin());
touchArea.addEventListener('touchstart', (e) => handleTouchStart(e));
touchArea.addEventListener('touchmove', (e) => handleTouchMove(e));
touchArea.addEventListener('touchend', handleTouchEnd);

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
const swipeSensitivity = 8; // Pixels per episode change

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    e.preventDefault();
}

function handleTouchMove(e) {
    const currentTouchX = e.touches[0].clientX;
    const totalDeltaX = currentTouchX - touchStartX;
    
    // Update currentNumber based on total swipe distance
    if (Math.abs(totalDeltaX) > 10) { // Only start changing after 10px to avoid jitter
        const episodeChange = totalDeltaX / swipeSensitivity;
        const newNumber = Math.floor(episodeChange);
        
        if (newNumber !== 0) {
            currentNumber = (currentNumber + newNumber) % (maxEpisode + 1);
            if (currentNumber < 0) {
                currentNumber += (maxEpisode + 1);
            }
            touchStartX = currentTouchX; // Reset start position
            update(); // Update both dial and episode content in real-time
        }
    }
    
    e.preventDefault();
}

function handleTouchEnd(e) {
    // Episode content is already updated in real-time, no need to update again
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
