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

document.getElementById('dials').innerHTML = `<div class="dial"><span class="dial-number">${String(currentNumber).padStart(3, '0')}</span></div>`;

const dialElement = document.querySelector('.dial');
dialElement.addEventListener('click', () => spin());
dialElement.addEventListener('touchstart', (e) => handleTouchStart(e));
dialElement.addEventListener('touchend', handleTouchEnd);

function spin(direction = 'forward') {
    const oldNumber = currentNumber;
    
    if (direction === 'forward') {
        currentNumber = (currentNumber + 1) % (maxEpisode + 1);
    } else {
        currentNumber = (currentNumber - 1 + maxEpisode + 1) % (maxEpisode + 1);
    }
    
    animateNumberChange(oldNumber, currentNumber, direction);
}


let touchStartY = 0;
let touchStartX = 0;

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    e.preventDefault();
}

function handleTouchEnd(e) {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchStartY - touchEndY;
    const deltaX = touchStartX - touchEndX;
    const threshold = 30;
    
    // Check if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
            // Swiped right (forward)
            spin('forward');
        } else {
            // Swiped left (backward)
            spin('backward');
        }
    } else {
        // Default to forward if no clear swipe direction
        spin('forward');
    }
    e.preventDefault();
}

function animateNumberChange(oldNumber, newNumber, direction) {
    const dialNumberElement = document.querySelector('.dial-number');
    const newNumberText = String(newNumber).padStart(3, '0');
    
    if (direction === 'forward') {
        // Create new number element positioned off-screen to the right
        const newElement = document.createElement('span');
        newElement.className = 'dial-number preparing-right';
        newElement.textContent = newNumberText;
        newElement.style.position = 'absolute';
        newElement.style.top = '0';
        newElement.style.left = '0';
        newElement.style.width = '100%';
        newElement.style.height = '100%';
        newElement.style.display = 'flex';
        newElement.style.alignItems = 'center';
        newElement.style.justifyContent = 'center';
        
        dialElement.appendChild(newElement);
        
        // Force reflow
        newElement.offsetHeight;
        
        // Start animation
        dialNumberElement.classList.add('slide-out-left');
        newElement.classList.remove('preparing-right');
        newElement.classList.add('slide-in-right');
        
        // Clean up after animation
        setTimeout(() => {
            dialNumberElement.textContent = newNumberText;
            dialNumberElement.classList.remove('slide-out-left');
            dialElement.removeChild(newElement);
            updateEpisodeDisplay();
        }, 300);
        
    } else {
        // Create new number element positioned off-screen to the left
        const newElement = document.createElement('span');
        newElement.className = 'dial-number preparing-left';
        newElement.textContent = newNumberText;
        newElement.style.position = 'absolute';
        newElement.style.top = '0';
        newElement.style.left = '0';
        newElement.style.width = '100%';
        newElement.style.height = '100%';
        newElement.style.display = 'flex';
        newElement.style.alignItems = 'center';
        newElement.style.justifyContent = 'center';
        
        dialElement.appendChild(newElement);
        
        // Force reflow
        newElement.offsetHeight;
        
        // Start animation
        dialNumberElement.classList.add('slide-out-right');
        newElement.classList.remove('preparing-left');
        newElement.classList.add('slide-in-left');
        
        // Clean up after animation
        setTimeout(() => {
            dialNumberElement.textContent = newNumberText;
            dialNumberElement.classList.remove('slide-out-right');
            dialElement.removeChild(newElement);
            updateEpisodeDisplay();
        }, 300);
    }
}
function update() {
    const dialNumberElement = document.querySelector('.dial-number');
    dialNumberElement.textContent = String(currentNumber).padStart(3, '0');
    updateEpisodeDisplay();
}

function updateEpisodeDisplay() {
    
    // Only show "Loading..." if episodes haven't been loaded yet
    // Otherwise show the episode or empty string for non-existent episodes
    if (episodes.length === 0) {
        document.getElementById('episode').innerHTML = "Loading...";
    } else {
        document.getElementById('episode').innerHTML = episodes[currentNumber] || "";
    }
}
