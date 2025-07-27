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
let lastTouchTime = 0;
let baseEpisodeNumber = 0;
const swipeSensitivity = 30; // Pixels per episode change
let momentumAnimation = null;

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    lastTouchX = touchStartX;
    lastTouchTime = Date.now();
    baseEpisodeNumber = currentNumber;
    
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
    if (Math.abs(velocity) > 0.1) { // Minimum velocity threshold
        startMomentum(velocity);
    } else {
        // Just update content if no momentum
        updateEpisodeContent();
    }
    
    e.preventDefault();
}

function startMomentum(initialVelocity) {
    let velocity = initialVelocity * 5; // Amplify the initial velocity
    const friction = 0.98; // Reduced friction for longer momentum (0.98 = 2% loss per frame)
    const minVelocity = 0.02; // Lower threshold for longer spinning
    
    function animateMomentum() {
        // Apply friction
        velocity *= friction;
        
        // Stop if velocity is too small
        if (Math.abs(velocity) < minVelocity) {
            momentumAnimation = null;
            updateEpisodeContent();
            return;
        }
        
        // Calculate episode change based on current velocity
        const episodeChange = Math.floor(Math.abs(velocity * 32) / swipeSensitivity); // Doubled the frame multiplier for faster changes
        
        if (episodeChange > 0) {
            if (velocity > 0) {
                // Moving right - increase episode number
                currentNumber = (currentNumber + episodeChange) % (maxEpisode + 1);
            } else {
                // Moving left - decrease episode number
                currentNumber = (currentNumber - episodeChange + maxEpisode + 1) % (maxEpisode + 1);
            }
            updateDialOnly();
        }
        
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
