/**
 * Base Minigame class
 * All minigames inherit from this class
 */
class Minigame extends Scene {
    constructor(game) {
        super(game);
        // Common properties for all minigames
        this.exitButton = {
            text: 'Exit',
            x: 70,
            y: 30,
            width: 100,
            height: 40,
            action: () => game.switchScene('worldMap')
        };
    }
    
    /**
     * Update method for minigames
     */
    update(deltaTime) {
        // Check for exit button clicks
        if (this.game.mouseDown) {
            if (
                this.game.mouseX >= this.exitButton.x - this.exitButton.width / 2 &&
                this.game.mouseX <= this.exitButton.x + this.exitButton.width / 2 &&
                this.game.mouseY >= this.exitButton.y - this.exitButton.height / 2 &&
                this.game.mouseY <= this.exitButton.y + this.exitButton.height / 2
            ) {
                this.exitButton.action();
                this.game.mouseDown = false;
            }
        }
    }
    
    /**
     * Render method for minigames
     */
    render(ctx) {
        // Draw exit button
        // Button background
        ctx.fillStyle = '#ff5555';
        ctx.fillRect(
            this.exitButton.x - this.exitButton.width / 2,
            this.exitButton.y - this.exitButton.height / 2,
            this.exitButton.width,
            this.exitButton.height
        );
        
        // Button text
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.exitButton.text, this.exitButton.x, this.exitButton.y);
    }
}
