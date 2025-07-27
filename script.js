// Load episodes data with Firefox-compatible cache busting
let episodes = {};

async function loadEpisodes() {
    try {
        const module = await import('./data/generatedEpisodes.js?t=' + Math.random());
        episodes = module.episodes;
        updateEpisodeContent();
    } catch (error) {
        console.error('Failed to load episodes:', error);
        const fallbackModule = await import('./data/generatedEpisodes.js');
        episodes = fallbackModule.episodes;
        updateEpisodeContent();
    }
}

let currentNumber = 0;
const maxEpisode = 146;

loadEpisodes();

document.getElementById('dials').innerHTML = `<div class="dial">${String(currentNumber).padStart(3, '0')}</div>`;

const dialElement = document.querySelector('.dial');

const touchArea = document.createElement('div');
touchArea.style.position = 'absolute';
touchArea.style.width = '225px';
touchArea.style.height = '150px';
touchArea.style.left = '50%';
touchArea.style.top = '50%';
touchArea.style.transform = 'translate(-50%, -50%)';
touchArea.style.zIndex = '10';

document.getElementById('dials').appendChild(touchArea);

dialElement.addEventListener('click', () => spin());
touchArea.addEventListener('touchstart', (e) => handleTouchStart(e));
touchArea.addEventListener('touchmove', (e) => handleTouchMove(e));
touchArea.addEventListener('touchend', handleTouchEnd);

function spin() {
    currentNumber = (currentNumber + 1) % (maxEpisode + 1);
    updateDialOnly();
    updateEpisodeContent();
}

let touchStartY = 0;
let touchStartX = 0;
const swipeSensitivity = 8;

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    e.preventDefault();
}

function handleTouchMove(e) {
    const currentTouchX = e.touches[0].clientX;
    const totalDeltaX = currentTouchX - touchStartX;
    
    if (Math.abs(totalDeltaX) > 10) {
        const episodeChange = totalDeltaX / swipeSensitivity;
        const newNumber = Math.floor(episodeChange);
        
        if (newNumber !== 0) {
            currentNumber = (currentNumber + newNumber) % (maxEpisode + 1);
            if (currentNumber < 0) {
                currentNumber += (maxEpisode + 1);
            }
            touchStartX = currentTouchX;
            updateDialOnly();
            updateEpisodeContent();
        }
    }
    
    e.preventDefault();
}

function handleTouchEnd(e) {
    e.preventDefault();
}

function updateDialOnly() {
    const dialElement = document.querySelector('.dial');
    dialElement.textContent = String(currentNumber).padStart(3, '0');
}

function updateEpisodeContent() {
    if (episodes.length === 0) {
        document.getElementById('episode').innerHTML = "Loading...";
    } else {
        document.getElementById('episode').innerHTML = episodes[currentNumber] || "";
    }
}