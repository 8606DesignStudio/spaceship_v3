// Ambient lights and effects system
// Uses absolute positioning to maintain alignment with background image

class AmbientEffectsSystem {
    constructor() {
        this.effects = [];
        this.container = null;
        this.init();
    }

    init() {
        // Create effects container
        this.container = document.createElement('div');
        this.container.id = 'ambient-effects-container';
        this.container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            overflow: hidden;
        `;
        
        document.body.appendChild(this.container);
        
        // Start creating effects
        this.createAmbientLights();
        this.createFloatingParticles();
        this.createPulsingGlow();
    }

    createAmbientLights() {
        // Create multiple ambient light sources
        const lightPositions = [
            { x: 15, y: 25, color: '#4bb8e9', intensity: 0.3 },
            { x: 85, y: 20, color: '#87ceeb', intensity: 0.4 },
            { x: 30, y: 45, color: '#ffd700', intensity: 0.2 },
            { x: 70, y: 40, color: '#9370db', intensity: 0.3 },
            { x: 50, y: 15, color: '#00ced1', intensity: 0.25 }
        ];

        lightPositions.forEach((light, index) => {
            const lightElement = document.createElement('div');
            lightElement.className = 'ambient-light';
            lightElement.style.cssText = `
                position: absolute;
                left: ${light.x}%;
                top: ${light.y}%;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: radial-gradient(circle, ${light.color}${Math.floor(light.intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%);
                filter: blur(20px);
                animation: ambientPulse ${3 + index * 0.5}s ease-in-out infinite alternate;
                transform: translate(-50%, -50%);
            `;
            
            this.container.appendChild(lightElement);
        });
    }

    createFloatingParticles() {
        // Create floating light particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            
            const x = Math.random() * 100;
            const y = Math.random() * 60 + 10; // Keep particles in upper 60% of screen
            const size = Math.random() * 3 + 2;
            const duration = Math.random() * 4 + 6;
            const delay = Math.random() * 2;
            
            particle.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                animation: floatParticle ${duration}s ease-in-out infinite alternate;
                animation-delay: ${delay}s;
                transform: translate(-50%, -50%);
            `;
            
            this.container.appendChild(particle);
        }
    }

    createPulsingGlow() {
        // Create subtle pulsing glow effects around key areas
        const glowAreas = [
            { x: 50, y: 32, size: 200, color: '#ffd700', opacity: 0.1 }, // Around dial area
            { x: 50, y: 12, size: 300, color: '#4bb8e9', opacity: 0.08 }, // Around episode area
        ];

        glowAreas.forEach((glow, index) => {
            const glowElement = document.createElement('div');
            glowElement.className = 'pulsing-glow';
            glowElement.style.cssText = `
                position: absolute;
                left: ${glow.x}%;
                top: ${glow.y}%;
                width: ${glow.size}px;
                height: ${glow.size}px;
                border-radius: 50%;
                background: radial-gradient(circle, ${glow.color}${Math.floor(glow.opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 60%);
                filter: blur(30px);
                animation: pulseGlow ${4 + index}s ease-in-out infinite alternate;
                transform: translate(-50%, -50%);
            `;
            
            this.container.appendChild(glowElement);
        });
    }

    // Method to add custom effect at specific coordinates
    addCustomEffect(x, y, options = {}) {
        const effect = document.createElement('div');
        effect.className = 'custom-ambient-effect';
        
        const defaultOptions = {
            size: 80,
            color: '#ffffff',
            opacity: 0.3,
            blur: 15,
            duration: 3,
            type: 'pulse' // 'pulse', 'float', 'glow'
        };
        
        const config = { ...defaultOptions, ...options };
        
        effect.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: ${config.size}px;
            height: ${config.size}px;
            border-radius: 50%;
            background: radial-gradient(circle, ${config.color}${Math.floor(config.opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%);
            filter: blur(${config.blur}px);
            animation: ${config.type}Effect ${config.duration}s ease-in-out infinite alternate;
            transform: translate(-50%, -50%);
        `;
        
        this.container.appendChild(effect);
        return effect;
    }

    // Method to remove all effects
    clearEffects() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    // Method to toggle effects visibility
    toggleEffects(visible = null) {
        if (this.container) {
            const isVisible = visible !== null ? visible : this.container.style.display !== 'none';
            this.container.style.display = isVisible ? 'none' : 'block';
        }
    }
}

// Initialize the ambient effects system
let ambientSystem;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    ambientSystem = new AmbientEffectsSystem();
});

// Export for potential external use
window.AmbientEffects = AmbientEffectsSystem;