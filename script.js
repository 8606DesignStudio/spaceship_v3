// Simple episode data
const episodes = [
    "Episode 000: Welcome to the Show",
    "Episode 001: The Beginning",
    "Episode 002: First Steps",
    "Episode 003: Building Momentum",
    "Episode 004: Finding Your Voice",
    "Episode 005: The Journey Continues",
    "Episode 006: New Horizons",
    "Episode 007: Breaking Barriers",
    "Episode 008: The Next Level",
    "Episode 009: Almost There",
    "Episode 010: Double Digits"
];

let currentEpisode = 0;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.episode-button');
    const episodeDisplay = document.getElementById('episode');
    
    // Update display
    function updateDisplay() {
        button.textContent = currentEpisode;
        episodeDisplay.textContent = episodes[currentEpisode];
    }
    
    // Button click handler
    button.addEventListener('click', function() {
        currentEpisode = (currentEpisode + 1) % episodes.length;
        updateDisplay();
    });
    
    // Initial display
    updateDisplay();
});