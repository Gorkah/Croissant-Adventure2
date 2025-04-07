/**
 * Coin Collector Minigame
 * Player moves around an arena collecting coins within a time limit
 */
class CoinCollectorMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    /**
     * Reset the minigame state
     */
    reset() {
        // Player properties
        this.player = {
            x: this.game.width / 2,
            y: this.game.height / 2,
            width: 40,
            height: 40,
            speed: 200 // pixels per second
        };
        
        // Game state
        this.score = 0;
        this.timeLeft = 30; // seconds
        this.coins = [];
        this.gameOver = false;
        
        // Generate initial coins
        this.generateCoins(10);
    }
    
    /**
     * Generate random coins in the game area
     */
    generateCoins(count) {
        const margin = 60;
        
        for (let i = 0; i < count; i++) {
            this.coins.push({
                x: margin + Math.random() * (this.game.width - 2 * margin),
                y: margin + Math.random() * (this.game.height - 2 * margin),
                width: 20,
                height: 20
            });
        }
    }
    
    /**
     * Check if the player has collected any coins
     */
    checkCoinCollection() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            
            if (
                this.player.x < coin.x + coin.width &&
                this.player.x + this.player.width > coin.x &&
                this.player.y < coin.y + coin.height &&
                this.player.y + this.player.height > coin.y
            ) {
                // Coin collected
                this.coins.splice(i, 1);
                this.score++;
                
                // Generate a new coin
                this.generateCoins(1);
            }
        }
    }
    
    enter() {
        this.reset();
    }
    
    exit() {
        // Nothing specific needed
    }
    
    update(deltaTime) {
        // Call parent update to handle exit button
        super.update(deltaTime);
        
        if (this.gameOver) {
            // Check for restart
            if (this.game.isKeyPressed('r')) {
                this.reset();
            }
            return;
        }
        
        // Update timer
        this.timeLeft -= deltaTime;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.gameOver = true;
            return;
        }
        
        // Handle player movement
        let dx = 0;
        let dy = 0;
        
        if (this.game.isKeyPressed('w') || this.game.isKeyPressed('arrowup')) {
            dy -= this.player.speed * deltaTime;
        }
        if (this.game.isKeyPressed('s') || this.game.isKeyPressed('arrowdown')) {
            dy += this.player.speed * deltaTime;
        }
        if (this.game.isKeyPressed('a') || this.game.isKeyPressed('arrowleft')) {
            dx -= this.player.speed * deltaTime;
        }
        if (this.game.isKeyPressed('d') || this.game.isKeyPressed('arrowright')) {
            dx += this.player.speed * deltaTime;
        }
        
        // Move player with boundary checking
        const margin = 20;
        this.player.x = Math.max(margin, Math.min(this.player.x + dx, this.game.width - this.player.width - margin));
        this.player.y = Math.max(margin, Math.min(this.player.y + dy, this.game.height - this.player.height - margin));
        
        // Check for coin collection
        this.checkCoinCollection();
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#227733';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw border
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, this.game.width - 20, this.game.height - 20);
        
        // Draw coins
        ctx.fillStyle = '#ffcc00';
        for (const coin of this.coins) {
            ctx.beginPath();
            ctx.arc(
                coin.x + coin.width / 2,
                coin.y + coin.height / 2,
                coin.width / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw player
        ctx.drawImage(
            this.game.croissantImage,
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
        
        // Draw UI
        super.render(ctx);
        
        // Draw score and time
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${this.score}`, 20, 60);
        ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, 20, 90);
        
        // Draw title
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Coin Collector', this.game.width / 2, 20);
        
        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.width / 2 - 150, this.game.height / 2 - 100, 300, 200);
            
            ctx.fillStyle = '#fff';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Game Over!', this.game.width / 2, this.game.height / 2 - 50);
            ctx.fillText(`Final Score: ${this.score}`, this.game.width / 2, this.game.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Press R to restart', this.game.width / 2, this.game.height / 2 + 50);
        }
    }
}
