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

// Momentum scrolling variables
let isDragging = false;
let startX = 0;
let currentX = 0;
let velocity = 0;
let lastTime = 0;
let lastX = 0;
let animationId = null;

// Mouse events
dialElement.addEventListener('mousedown', handleStart);
document.addEventListener('mousemove', handleMove);
document.addEventListener('mouseup', handleEnd);

// Touch events
dialElement.addEventListener('touchstart', handleStart, { passive: false });
document.addEventListener('touchmove', handleMove, { passive: false });
document.addEventListener('touchend', handleEnd);

// Click event for simple clicks (when no dragging occurred)
dialElement.addEventListener('click', handleClick);

function handleStart(e) {
    e.preventDefault();
    
    // Stop any ongoing animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    isDragging = true;
    
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    startX = clientX;
    currentX = clientX;
    lastX = clientX;
    lastTime = Date.now();
    velocity = 0;
    
    dialElement.style.cursor = 'grabbing';
}

function handleMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const now = Date.now();
    const deltaTime = now - lastTime;
    
    if (deltaTime > 0) {
        velocity = (clientX - lastX) / deltaTime;
    }
    
    currentX = clientX;
    lastX = clientX;
    lastTime = now;
    
    // Visual feedback during drag
    const deltaX = currentX - startX;
    const rotation = deltaX * 0.5; // Subtle rotation during drag
    dialElement.style.transform = `rotate(${rotation}deg) scale(1.05)`;
}

function handleEnd(e) {
    if (!isDragging) return;
    
    isDragging = false;
    dialElement.style.cursor = 'grab';
    
    const deltaX = currentX - startX;
    const threshold = 30;
    
    // If it was just a small movement, treat as click
    if (Math.abs(deltaX) < 10) {
        dialElement.style.transform = '';
        return; // Let the click handler deal with it
    }
    
    // Calculate momentum based on velocity and distance
    const momentumVelocity = velocity * 15; // Amplify velocity for momentum
    const totalDelta = deltaX + momentumVelocity;
    
    // Determine how many steps to move based on total delta
    const steps = Math.round(Math.abs(totalDelta) / threshold);
    const direction = totalDelta > 0 ? 1 : -1;
    
    if (steps > 0) {
        animateSteps(steps, direction);
    } else {
        // Reset transform if no significant movement
        dialElement.style.transform = '';
    }
}

function handleClick(e) {
    // Only handle click if we weren't dragging
    if (Math.abs(currentX - startX) < 10) {
        spin();
        
        // Quick visual feedback for click
        dialElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            dialElement.style.transform = '';
        }, 150);
    }
}

function animateSteps(steps, direction) {
    let currentStep = 0;
    const stepDuration = 100; // ms per step
    const totalDuration = steps * stepDuration;
    
    function animate() {
        if (currentStep < steps) {
            // Easing function for deceleration
            const progress = currentStep / steps;
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Update episode number
            if (direction > 0) {
                currentNumber = (currentNumber + 1) % 147;
            } else {
                currentNumber = (currentNumber - 1 + 147) % 147;
            }
            
            update();
            
            // Visual rotation effect
            const rotation = (1 - easeOut) * direction * 360;
            const scale = 1 + (1 - easeOut) * 0.1;
            dialElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;
            
            currentStep++;
            
            // Variable delay for deceleration effect
            const delay = stepDuration * (1 + easeOut);
            setTimeout(() => {
                animationId = requestAnimationFrame(animate);
            }, delay);
        } else {
            // Animation complete
            dialElement.style.transform = '';
            animationId = null;
        }
    }
    
    animate();
}

function spin() {
    currentNumber = (currentNumber + 1) % 147; // 0-146 episodes
    update();
}

function spinDown() {
    currentNumber = (currentNumber - 1 + 147) % 147; // 0-146 episodes
    update();
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