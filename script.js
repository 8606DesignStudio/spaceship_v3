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
    const dialElement = document.querySelector('.dial');
    const episodeElement = document.getElementById('episode');
    
    if (dialElement) {
        dialElement.textContent = currentEpisode;
    }
    
    if (episodeElement && episodes.length > 0) {
        episodeElement.innerHTML = episodes[currentEpisode] || "";
    }
}

// Dial interaction class
class DialController {
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
        
        this.element.style.cursor = 'grabbing';
        this.element.style.transform = 'scale(1.05)';
    }
    
    handleMove(e) {
        if (!this.isDragging || this.isAnimating) return;
        
        e.preventDefault();
        const currentX = this.getClientX(e);
        const deltaX = currentX - this.startX;
        
        // Visual feedback during drag
        const rotation = deltaX * 0.3;
        this.element.style.transform = `scale(1.05) rotate(${rotation}deg)`;
    }
    
    handleEnd(e) {
        if (!this.isDragging || this.isAnimating) return;
        
        const endX = this.getClientX(e);
        const deltaX = endX - this.startX;
        const deltaTime = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX) / deltaTime;
        
        this.isDragging = false;
        this.element.style.cursor = 'grab';
        
        // Calculate movement based on swipe
        const minSwipeDistance = 15;
        if (Math.abs(deltaX) > minSwipeDistance) {
            const direction = deltaX > 0 ? 1 : -1;
            let steps = Math.floor(Math.abs(deltaX) / 25);
            
            // Add momentum for fast swipes
            if (velocity > 0.4) {
                steps += Math.floor(velocity * 8);
            }
            
            steps = Math.max(1, Math.min(steps, 15)); // Limit steps
            this.animateMovement(direction * steps);
        } else {
            // Reset transform if no significant movement
            this.resetTransform();
        }
        
        this.startX = 0;
    }
    
    handleClick(e) {
        if (this.isDragging || this.isAnimating || this.startX !== 0) return;
        
        // Simple click advances by 1
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
                this.resetTransform();
                return;
            }
            
            // Update episode
            this.changeEpisode(direction);
            
            // Visual animation with easing
            const progress = currentStep / totalSteps;
            const easing = 1 - Math.pow(1 - progress, 2); // Ease out
            const rotation = (1 - easing) * direction * 90;
            const scale = 1 + (1 - easing) * 0.1;
            
            this.element.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            
            currentStep++;
            
            // Progressive delay for deceleration
            const delay = 60 + (currentStep * 15);
            setTimeout(animate, delay);
        };
        
        animate();
    }
    
    changeEpisode(direction) {
        const maxEpisode = episodes.length - 1;
        currentEpisode = (currentEpisode + direction + episodes.length) % episodes.length;
        
        // Skip episode 0 when going backwards from episode 1
        if (currentEpisode === 0 && direction === -1) {
            currentEpisode = maxEpisode;
        }
        
        updateDisplay();
    }
    
    resetTransform() {
        this.element.style.transform = '';
    }
    
    getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create dial element
    const dialContainer = document.getElementById('dials');
    dialContainer.innerHTML = '<div class="dial">0</div>';
    
    // Initialize dial controller
    const dialElement = document.querySelector('.dial');
    new DialController(dialElement);
    
    // Load episodes
    loadEpisodes();
});