// ========== EPISODE DATA ========== 
// Import episode data from auto-generated file
import { episodes } from './data/generatedEpisodes.js';

// ========== DIAL LOGIC ========== 
// Array to store the current numbers on each dial
// Example: [1, 4, 2] = Episode 142
let numbers = [0, 0, 0];

// Create the three dials dynamically and insert them into the HTML
document.getElementById('dials').innerHTML = numbers.map((n, i) => 
    `<div class="dial" data-dial-index="${i}">${n}</div>`
).join('');

// Attach event listeners after dials are created
const dialElements = document.querySelectorAll('.dial');
dialElements.forEach((dial, i) => {
    dial.addEventListener('click', () => spin(i));
    dial.addEventListener('touchstart', (e) => handleTouchStart(e, i));
    dial.addEventListener('touchend', handleTouchEnd);
});

// Function to increase a dial's number (0-9, wraps around)
function spin(i) {
    numbers[i] = (numbers[i] + 1) % 10; // Increment and wrap at 10
    
    // Handle carry-over: if this dial wrapped from 9 to 0, increment the next dial
    if (numbers[i] === 0 && i > 0) {
        spin(i - 1); // Recursively increment the next higher position
    }
    
    update();
}

// Function to decrease a dial's number (0-9, wraps around)
function spinDown(i) {
    const oldValue = numbers[i];
    numbers[i] = (numbers[i] - 1 + 10) % 10; // Decrement and wrap at 0
    
    // Handle borrow: if this dial wrapped from 0 to 9, decrement the next dial
    if (oldValue === 0 && i > 0) {
        spinDown(i - 1); // Recursively decrement the next higher position
    }
    
    update();
}

// Touch gesture handling variables
let touchStartY = 0;
let currentDial = -1; // Which dial is being touched

// Handle start of touch gesture
function handleTouchStart(e, dialIndex) {
    touchStartY = e.touches[0].clientY; // Record starting Y position
    currentDial = dialIndex;
    e.preventDefault(); // Prevent default touch behavior
}

// Handle end of touch gesture - determine swipe direction
function handleTouchEnd(e) {
    if (currentDial === -1) return; // No dial being touched
    
    const touchEndY = e.changedTouches[0].clientY; // End Y position
    const deltaY = touchStartY - touchEndY; // Calculate swipe distance
    const threshold = 30; // Minimum distance for a flick
    
    // Determine swipe direction and update dial accordingly
    if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
            // Flicked up - increase number
            spin(currentDial);
        } else {
            // Flicked down - decrease number
            spinDown(currentDial);
        }
    } else {
        // Small movement or tap - just increase (original behavior)
        spin(currentDial);
    }
    
    currentDial = -1; // Reset touch state
    e.preventDefault();
}

// Update the display when dials change
function update() {
    // Update the visual display of each dial
    const dialElements = document.querySelectorAll('.dial');
    dialElements.forEach((dial, i) => {
        dial.textContent = numbers[i];
    });
    
    // Calculate episode number from the three dials
    // hundreds*100 + tens*10 + ones = episode number
    const episodeNum = numbers[0] * 100 + numbers[1] * 10 + numbers[2];
    
    // Display the episode title/link or "not available" message
    document.getElementById('episode').innerHTML = episodes[episodeNum] || "";
}

// Initialize the display
update();

// ========== FULL-SCREEN FUNCTIONALITY ========== 
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenIcon = document.querySelector('.fullscreen-icon');
const fullscreenText = document.querySelector('.fullscreen-text');

// Check if Fullscreen API is supported
const isFullscreenSupported = document.fullscreenEnabled || 
                             document.webkitFullscreenEnabled || 
                             document.mozFullScreenEnabled || 
                             document.msFullscreenEnabled;

if (!isFullscreenSupported) {
    // Hide the button if fullscreen is not supported
    fullscreenBtn.style.display = 'none';
}

// Full-screen toggle function
function toggleFullscreen() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        // Enter fullscreen
        const docEl = document.documentElement;
        
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Update button appearance based on fullscreen state
function updateFullscreenButton() {
    const isFullscreen = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;
    
    if (isFullscreen) {
        fullscreenIcon.textContent = '⛶'; // Exit fullscreen icon
        fullscreenText.textContent = 'Exit Full Screen';
    } else {
        fullscreenIcon.textContent = '⛶'; // Enter fullscreen icon
        fullscreenText.textContent = 'Full Screen';
    }
}

// Event listeners
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Listen for fullscreen changes (including when user presses ESC)
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

// Initialize button state
updateFullscreenButton();