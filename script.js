import { episodes } from './data/generatedEpisodes.js';

let numbers = [0, 0, 0];

document.getElementById('dials').innerHTML = numbers.map((n, i) => 
    `<div class="dial" data-dial-index="${i}">${n}</div>`
).join('');

const dialElements = document.querySelectorAll('.dial');
dialElements.forEach((dial, i) => {
    dial.addEventListener('click', () => spin(i));
    dial.addEventListener('touchstart', (e) => handleTouchStart(e, i));
    dial.addEventListener('touchend', handleTouchEnd);
});

function spin(i) {
    numbers[i] = (numbers[i] + 1) % 10;
    
    if (numbers[i] === 0 && i > 0) {
        spin(i - 1);
    }
    
    update();
}

function spinDown(i) {
    const oldValue = numbers[i];
    numbers[i] = (numbers[i] - 1 + 10) % 10;
    
    if (oldValue === 0 && i > 0) {
        spinDown(i - 1);
    }
    
    update();
}

let touchStartY = 0;
let currentDial = -1;

function handleTouchStart(e, dialIndex) {
    touchStartY = e.touches[0].clientY;
    currentDial = dialIndex;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (currentDial === -1) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    const threshold = 30;
    
    if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
            spin(currentDial);
        } else {
            spinDown(currentDial);
        }
    } else {
        spin(currentDial);
    }
    
    currentDial = -1;
    e.preventDefault();
}

function update() {
    const dialElements = document.querySelectorAll('.dial');
    dialElements.forEach((dial, i) => {
        dial.textContent = numbers[i];
    });
    
    const episodeNum = numbers[0] * 100 + numbers[1] * 10 + numbers[2];
    document.getElementById('episode').innerHTML = episodes[episodeNum] || "";
}

update();