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

// Simple click handler
document.querySelector('.dial').addEventListener('click', () => {
    currentNumber = (currentNumber + 1) % 147;
    update();
});

function update() {
    const dialElement = document.querySelector('.dial');
    dialElement.textContent = currentNumber;
    
    if (episodes.length === 0) {
        document.getElementById('episode').innerHTML = "Loading...";
    } else {
        document.getElementById('episode').innerHTML = episodes[currentNumber] || "";
    }
}