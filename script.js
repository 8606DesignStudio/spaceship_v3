// Load episodes data
let episodes = {};

// Dynamic import with Firefox compatibility
async function loadEpisodes() {
    try {
        const module = await import('./data/generatedEpisodes.js?t=' + Math.random());
        episodes = module.episodes;
        update();
    } catch (error) {
        console.error('Failed to load episodes:', error);
        const fallbackModule = await import('./data/generatedEpisodes.js');
        episodes = fallbackModule.episodes;
        update();
    }
}

let currentNumber = 0;

// Initialize
loadEpisodes();
document.getElementById('dials').innerHTML = `<div class="dial" data-dial-index="0">${currentNumber}</div>`;

// Touch/swipe variables
let startX = 0;
let startTime = 0;
let isAnimating = false;

// Get dial element and add event listeners
const dialElement = document.querySelector('.dial');

// Mouse events
dialElement.addEventListener('mousedown', handleStart);
document.addEventListener('mousemove', handleMove);
document.addEventListener('mouseup', handleEnd);

// Touch events
dialElement.addEventListener('touchstart', handleStart, { passive: false });
document.addEventListener('touchmove', handleMove, { passive: false });
document.addEventListener('touchend', handleEnd);

// Click fallback
dialElement.addEventListener('click', handleClick);

function handleStart(e) {
    if (isAnimating) return;
    
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startX = clientX;
    startTime = Date.now();
    dialElement.style.cursor = 'grabbing';
}

function handleMove(e) {
    if (startX === 0 || isAnimating) return;
    
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    
    // Visual feedback during drag
    const rotation = deltaX * 0.5;
    dialElement.style.transform = `rotate(${rotation}deg) scale(1.05)`;
}

function handleEnd(e) {
    if (startX === 0 || isAnimating) return;
    
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    const deltaTime = Date.now() - startTime;
    
    // Calculate velocity (pixels per millisecond)
    const velocity = deltaX / Math.max(deltaTime, 1);
    const speed = Math.abs(velocity);
    
    // Reset cursor and transform
    dialElement.style.cursor = 'grab';
    dialElement.style.transform = '';
    
    // Reset position
    startX = 0;
    
    // Apply inertia if there's sufficient velocity or distance
    if (speed > 0.1 || Math.abs(deltaX) > 15) {
        applyInertia(velocity);
    }
}

function applyInertia(initialVelocity) {
    if (isAnimating) return;
    
    isAnimating = true;
    let velocity = initialVelocity;
    const friction = 0.92; // Friction coefficient (0-1, lower = more friction)
    const minVelocity = 0.05; // Minimum velocity before stopping
    const pixelsPerStep = 25; // How many pixels equal one episode step
    
    function inertiaStep() {
        // Apply friction
        velocity *= friction;
        
        // Check if we should stop
        if (Math.abs(velocity) < minVelocity) {
            isAnimating = false;
            dialElement.style.transform = '';
            return;
        }
        
        // Calculate if we should advance an episode
        const movement = velocity * 16; // 16ms frame time approximation
        
        if (Math.abs(movement) >= pixelsPerStep) {
            // Advance episode
            const direction = movement > 0 ? 1 : -1;
            currentNumber = (currentNumber + direction + 147) % 147;
            update();
            
            // Reduce velocity after each step
            velocity *= 0.8;
            
            // Visual feedback
            const rotation = velocity * 2;
            const scale = 1 + Math.abs(velocity) * 0.1;
            dialElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        }
        
        // Continue animation
        requestAnimationFrame(inertiaStep);
    }
    
    inertiaStep();
}

function handleClick(e) {
    if (isAnimating || startX !== 0) return;
    
    // Simple click advances by 1
    currentNumber = (currentNumber + 1) % 147;
    update();
}

function animateSteps(steps) {
    if (isAnimating) return;
    
    isAnimating = true;
    const totalSteps = Math.abs(steps);
    const direction = steps > 0 ? 1 : -1;
    let currentStep = 0;
    
    function animateStep() {
        if (currentStep >= totalSteps) {
            isAnimating = false;
            dialElement.style.transform = '';
            return;
        }
        
        // Update episode number
        currentNumber = (currentNumber + direction + 147) % 147;
        update();
        
        // Visual animation
        const progress = currentStep / totalSteps;
        const easing = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const rotation = (1 - easing) * direction * 180;
        const scale = 1 + (1 - easing) * 0.1;
        
        dialElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        
        currentStep++;
        
        // Slow down over time
        const delay = 50 + (currentStep * 20);
        setTimeout(animateStep, delay);
    }
    
    animateStep();
}

function update() {
    const dialElement = document.querySelector('.dial');
    dialElement.textContent = currentNumber;
    
    if (episodes.length === 0) {
        document.getElementById('episode').innerHTML = "";
    } else {
        document.getElementById('episode').innerHTML = episodes[currentNumber] || "";
    }
}