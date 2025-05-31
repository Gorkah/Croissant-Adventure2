/**
 * Base Scene class
 * All game scenes inherit from this class
 */
class Scene {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Called when the scene becomes active
     */
    enter() {
        // Override in subclasses
    }
    
    /**
     * Called when the scene becomes inactive
     */
    exit() {
        // Override in subclasses
    }
    
    /**
     * Update the scene logic
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Override in subclasses
    }
    
    /**
     * Render the scene
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Override in subclasses
    }
}
