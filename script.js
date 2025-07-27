// Episode data and current state
let episodes = {};
let currentEpisode = 0;

// Load episodes data
async function loadEpisodes() {
    try {
        const module = await import('./data/generatedEpisodes.js?t=' + Math.random());
        episodes = module.episodes;
        updateDisplay();
    } catch (error) {
        console.error('Failed to load episodes:', error);
    }
}

// Update the display with current episode
function updateDisplay() {
    const buttonElement = document.querySelector('.episode-button');
    const episodeElement = document.getElementById('episode');
    
    if (buttonElement) {
        buttonElement.textContent = currentEpisode;
    }
    
    if (episodeElement && episodes.length > 0) {
        episodeElement.innerHTML = episodes[currentEpisode] || "";
    }
}

// Button interaction class
class ButtonController {
    constructor(element) {
        this.element = element;
        this.isDragging = false;
        this.startX = 0;
        this.startTime = 0;
        this.isAnimating = false;
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Mouse events
        this.element.addEventListener('mousedown', this.handleStart.bind(this));
        document.addEventListener('mousemove', this.handleMove.bind(this));
        document.addEventListener('mouseup', this.handleEnd.bind(this));
        
        // Touch events
        this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleEnd.bind(this));
        
        // Click fallback
        this.element.addEventListener('click', this.handleClick.bind(this));
    }
    
    handleStart(e) {
        if (this.isAnimating) return;
        
        e.preventDefault();
        this.isDragging = true;
        this.startX = this.getClientX(e);
        this.startTime = Date.now();
        
        this.element.style.transform = 'scale(0.95)';
    }
    
    handleMove(e) {
        if (!this.isDragging || this.isAnimating) return;
        e.preventDefault();
    }
    
    handleEnd(e) {
        if (!this.isDragging || this.isAnimating) return;
        
        const endX = this.getClientX(e);
        const deltaX = endX - this.startX;
        const deltaTime = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX) / deltaTime;
        
        this.isDragging = false;
        this.element.style.transform = '';
        
        // Calculate movement based on swipe
        const minSwipeDistance = 20;
        if (Math.abs(deltaX) > minSwipeDistance) {
            const direction = deltaX > 0 ? 1 : -1;
            let steps = Math.round(Math.abs(deltaX) / 30);
            
            // Add momentum for fast swipes
            if (velocity > 0.5) {
                steps += Math.round(velocity * 5);
            }
            
            steps = Math.max(1, Math.min(steps, 10));
            this.animateMovement(direction * steps);
        }
        
        this.startX = 0;
    }
    
    handleClick(e) {
        if (this.isDragging || this.isAnimating || this.startX !== 0) return;
        this.changeEpisode(1);
    }
    
    animateMovement(steps) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const totalSteps = Math.abs(steps);
        const direction = steps > 0 ? 1 : -1;
        let currentStep = 0;
        
        const animate = () => {
            if (currentStep >= totalSteps) {
                this.isAnimating = false;
                return;
            }
            
            this.changeEpisode(direction);
            currentStep++;
            
            const delay = 80 + (currentStep * 20);
            setTimeout(animate, delay);
        };
        
        animate();
    }
    
    changeEpisode(direction) {
        const maxEpisode = episodes.length - 1;
        currentEpisode = (currentEpisode + direction + episodes.length) % episodes.length;
        
        if (currentEpisode === 0 && direction === -1) {
            currentEpisode = maxEpisode;
        }
        
        updateDisplay();
    }
    
    getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const buttonContainer = document.getElementById('dials');
    buttonContainer.innerHTML = '<div class="episode-button">0</div>';
    
    const buttonElement = document.querySelector('.episode-button');
    new ButtonController(buttonElement);
    
    loadEpisodes();
});