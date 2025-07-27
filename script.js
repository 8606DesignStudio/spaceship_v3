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
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // Reset cursor
    dialElement.style.cursor = 'grab';
    
    // Calculate steps based on distance and velocity
    let steps = 0;
    if (Math.abs(deltaX) > 20) { // Minimum swipe distance
        steps = Math.round(Math.abs(deltaX) / 30); // Base steps on distance
        if (velocity > 0.5) { // Add momentum for fast swipes
            steps += Math.round(velocity * 5);
        }
        steps = Math.max(1, Math.min(steps, 20)); // Limit steps
        
        if (deltaX < 0) steps = -steps; // Negative for left swipe
    }
    
    // Reset position
    startX = 0;
    
    if (steps !== 0) {
        animateSteps(steps);
    } else {
        // Reset transform if no movement
        dialElement.style.transform = '';
    }
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