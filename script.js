// Load episodes data with Firefox-compatible cache busting
let episodes = {};

// Use float for smooth momentum calculations
let currentNumberFloat = 0;
// Dynamic import with Firefox compatibility
async function loadEpisodes() {
    try {
        const module = await import('./data/generatedEpisodes.js?t=' + Math.random());
        episodes = module.episodes;
        currentNumberFloat = currentNumber;
        update(); // Update display after episodes are loaded
    } catch (error) {
        console.error('Failed to load episodes:', error);
        // Fallback to static import
        const fallbackModule = await import('./data/generatedEpisodes.js');
        episodes = fallbackModule.episodes;
        currentNumberFloat = currentNumber;
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
    currentNumberFloat = (currentNumberFloat + 1) % (maxEpisode + 1);
    currentNumber = Math.floor(currentNumberFloat);
    update();
}

function spinDown() {
    currentNumberFloat = (currentNumberFloat - 1 + maxEpisode + 1) % (maxEpisode + 1);
    currentNumber = Math.floor(currentNumberFloat);
    update();
}

let touchStartY = 0;
let touchStartX = 0;
let lastTouchX = 0;
let lastTouchTime = 0;
let initialTouchNumberFloat = 0;
const swipeSensitivity = 30; // Pixels per episode change
let momentumAnimation = null;

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    lastTouchX = touchStartX;
    lastTouchTime = Date.now();
    initialTouchNumberFloat = currentNumberFloat;
    
    // Stop any existing momentum
    if (momentumAnimation) {
        cancelAnimationFrame(momentumAnimation);
        momentumAnimation = null;
    }
    
    e.preventDefault();
}

function handleTouchMove(e) {
    const currentTouchX = e.touches[0].clientX;
    const currentTime = Date.now();
    const totalDeltaX = currentTouchX - touchStartX;
    
    // Update currentNumberFloat based on total swipe distance
    if (Math.abs(totalDeltaX) > 10) { // Only start changing after 10px to avoid jitter
        const episodeChange = totalDeltaX / swipeSensitivity;
        currentNumberFloat = initialTouchNumberFloat + episodeChange;
        
        // Handle wrapping
        while (currentNumberFloat < 0) {
            currentNumberFloat += (maxEpisode + 1);
        }
        while (currentNumberFloat >= (maxEpisode + 1)) {
            currentNumberFloat -= (maxEpisode + 1);
        }
        
        currentNumber = Math.floor(currentNumberFloat);
        updateDialOnly();
    }
    
    lastTouchX = currentTouchX;
    lastTouchTime = currentTime;
    e.preventDefault();
}

function handleTouchEnd(e) {
    // Calculate velocity for momentum
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTouchTime;
    const finalTouchX = e.changedTouches[0].clientX;
    const distanceDelta = finalTouchX - lastTouchX;
    
    // Calculate velocity (pixels per millisecond)
    const velocity = timeDelta > 0 ? distanceDelta / timeDelta : 0;
    
    // Start momentum animation if velocity is significant
    if (Math.abs(velocity) > 0.05) { // Minimum velocity threshold
        startMomentum(velocity);
    } else {
        // Just update content if no momentum
        currentNumber = Math.floor(currentNumberFloat);
        updateEpisodeContent();
    }
    
    e.preventDefault();
}

function startMomentum(initialVelocity) {
    let velocity = initialVelocity;
    const friction = 0.99; // How quickly momentum decays
    const minVelocity = 0.01; // Stop when velocity gets too small
    
    function animateMomentum() {
        // Apply friction
        velocity *= friction;
        
        // Stop if velocity is too small
        if (Math.abs(velocity) < minVelocity) {
            momentumAnimation = null;
            currentNumber = Math.floor(currentNumberFloat);
            updateEpisodeContent();
            return;
        }
        
        // Update currentNumberFloat based on velocity
        const episodeChange = (velocity * 16) / swipeSensitivity; // 16ms frame time
        currentNumberFloat += episodeChange;
        
        // Handle wrapping
        while (currentNumberFloat < 0) {
            currentNumberFloat += (maxEpisode + 1);
        }
        while (currentNumberFloat >= (maxEpisode + 1)) {
            currentNumberFloat -= (maxEpisode + 1);
        }
        
        currentNumber = Math.floor(currentNumberFloat);
        updateDialOnly();
        
        // Continue animation
        momentumAnimation = requestAnimationFrame(animateMomentum);
    }
    
    momentumAnimation = requestAnimationFrame(animateMomentum);
}

function stopMomentum() {
    if (momentumAnimation) {
        cancelAnimationFrame(momentumAnimation);
        momentumAnimation = null;
    }
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
