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
let velocityX = 0;
let momentumAnimation = null;
let baseEpisodeNumber = 0;
const swipeSensitivity = 30; // Pixels per episode change

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    lastTouchX = touchStartX;
    lastTouchTime = Date.now();
    velocityX = 0;
    
    // Stop any ongoing momentum animation
    if (momentumAnimation) {
        cancelAnimationFrame(momentumAnimation);
        momentumAnimation = null;
    }
    
    baseEpisodeNumber = currentNumber;
    e.preventDefault();
}

function handleTouchMove(e) {
    const currentTime = Date.now();
    const currentTouchX = e.touches[0].clientX;
    const deltaX = currentTouchX - touchStartX;
    
    // Calculate velocity for momentum
    const timeDelta = currentTime - lastTouchTime;
    if (timeDelta > 0) {
        velocityX = (currentTouchX - lastTouchX) / timeDelta;
    }
    
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
    // Start momentum animation if there's sufficient velocity
    const minVelocity = 0.5; // Minimum velocity to trigger momentum
    const maxVelocity = 5; // Cap the velocity to prevent crazy speeds
    
    if (Math.abs(velocityX) > minVelocity) {
        // Clamp velocity to reasonable range
        const clampedVelocity = Math.sign(velocityX) * Math.min(Math.abs(velocityX), maxVelocity);
        startMomentumAnimation(clampedVelocity);
    } else {
        // Update the episode content to match the current dial number
        updateEpisodeContent();
    }
    
    e.preventDefault();
}

function startMomentumAnimation(initialVelocity) {
    let velocity = initialVelocity;
    const friction = 0.95; // How quickly momentum decays (0.95 = 5% reduction per frame)
    const minVelocity = 0.1; // Stop when velocity gets too small
    
    function animate() {
        // Apply friction
        velocity *= friction;
        
        // Stop if velocity is too small
        if (Math.abs(velocity) < minVelocity) {
            momentumAnimation = null;
            updateEpisodeContent();
            return;
        }
        
        // Calculate movement based on velocity
        const movement = velocity * 10; // Scale factor for movement
        const episodeChange = Math.floor(Math.abs(movement) / swipeSensitivity);
        
        if (episodeChange > 0) {
            if (movement > 0) {
                // Moving right - increase episode number
                for (let i = 0; i < episodeChange; i++) {
                    currentNumber = (currentNumber + 1) % (maxEpisode + 1);
                }
            } else {
                // Moving left - decrease episode number
                for (let i = 0; i < episodeChange; i++) {
                    currentNumber = (currentNumber - 1 + maxEpisode + 1) % (maxEpisode + 1);
                }
            }
            updateDialOnly();
        }
        
        // Continue animation
        momentumAnimation = requestAnimationFrame(animate);
    }
    
    momentumAnimation = requestAnimationFrame(animate);
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
