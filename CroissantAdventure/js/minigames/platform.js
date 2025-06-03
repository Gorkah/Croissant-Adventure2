/**
 * Platform Jump Minigame
 * A platform jumping game where the croissant needs to reach the top
 */
class PlatformMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    reset() {
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.victory = false;
        this.timeLeft = 60; // 60 seconds time limit
        
        // Player properties
        this.player = {
            x: this.game.width / 2,
            y: this.game.height - 200,
            width: 70,
            height: 70,
            velocityX: 0,
            velocityY: 0,
            jumping: false,
            grounded: false,
            facing: 'right'
        };
        
        // Physics
        this.gravity = 0.5;
        this.friction = 0.8;
        this.jumpPower = -14;
        
        // Platforms
        this.platforms = this.generatePlatforms();
        
        // Goal at the top
        this.goal = {
            x: this.game.width / 2 - 25,
            y: 50,
            width: 50,
            height: 30
        };
        
        // Collectibles on platforms
        this.collectibles = this.generateCollectibles();
        
        // Camera tracking
        this.cameraY = 0;
        
        // UI
        this.showInstructions = true;
        this.instructionTimer = 3; // Show instructions for 3 seconds
    }
    
    generatePlatforms() {
        const platforms = [];
        
        // Ground platform
        platforms.push({
            x: 0,
            y: this.game.height - 50,
            width: this.game.width,
            height: 50,
            color: '#8B4513'
        });
        
        // Random platforms
        const numPlatforms = 15;
        const minY = 100;
        const maxY = this.game.height - 100;
        const minWidth = 70;
        const maxWidth = 200;
        const heightInterval = (maxY - minY) / numPlatforms;
        
        for (let i = 0; i < numPlatforms; i++) {
            const y = maxY - i * heightInterval;
            const width = minWidth + Math.random() * (maxWidth - minWidth);
            const x = Math.random() * (this.game.width - width);
            
            platforms.push({
                x: x,
                y: y,
                width: width,
                height: 20,
                color: i % 2 === 0 ? '#44aa44' : '#55bb55'
            });
        }
        
        return platforms;
    }
    
    generateCollectibles() {
        const collectibles = [];
        const numCollectibles = 8;
        
        // Place some collectibles on random platforms (excluding ground)
        const availablePlatforms = [...this.platforms].slice(1);
        for (let i = 0; i < numCollectibles && i < availablePlatforms.length; i++) {
            const platform = availablePlatforms[i];
            
            collectibles.push({
                x: platform.x + platform.width / 2,
                y: platform.y - 20,
                size: 15,
                collected: false
            });
        }
        
        return collectibles;
    }
    
    enter() {
        console.log("Entering Platform Jump minigame");
        this.reset();
    }
    
    exit() {
        console.log("Exiting Platform Jump minigame");
    }
    
    update(deltaTime) {
        // Call parent update method to handle exit button
        super.update(deltaTime);
        
        // Update instruction timer
        if (this.showInstructions) {
            this.instructionTimer -= deltaTime;
            if (this.instructionTimer <= 0) {
                this.showInstructions = false;
            }
        }
        
        // Check for game over or victory
        if (this.gameOver || this.victory) {
            // Check for restart on click
            if (this.game.mouseDown) {
                const buttonX = this.game.width / 2;
                const buttonY = this.game.height / 2 + 50;
                const buttonWidth = 150;
                const buttonHeight = 40;
                
                if (
                    this.game.mouseX >= buttonX - buttonWidth / 2 &&
                    this.game.mouseX <= buttonX + buttonWidth / 2 &&
                    this.game.mouseY >= buttonY - buttonHeight / 2 &&
                    this.game.mouseY <= buttonY + buttonHeight / 2
                ) {
                    this.reset();
                    this.game.mouseDown = false;
                }
            }
            return;
        }
        
        // Update time limit
        this.timeLeft -= deltaTime;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.gameOver = true;
            return;
        }
        
        // Player horizontal movement
        if (this.game.keys['a'] || this.game.keys['arrowleft']) {
            this.player.velocityX = Math.max(this.player.velocityX - 1, -8);
            this.player.facing = 'left';
        }
        
        if (this.game.keys['d'] || this.game.keys['arrowright']) {
            this.player.velocityX = Math.min(this.player.velocityX + 1, 8);
            this.player.facing = 'right';
        }
        
        // Jumping
        if ((this.game.keys['w'] || this.game.keys['arrowup'] || this.game.keys[' ']) && !this.player.jumping && this.player.grounded) {
            this.player.jumping = true;
            this.player.grounded = false;
            this.player.velocityY = this.jumpPower;
        }
        
        // Apply physics
        this.player.velocityX *= this.friction;
        this.player.velocityY += this.gravity;
        
        // Reset grounded flag
        this.player.grounded = false;
        
        // Platform collision
        for (const platform of this.platforms) {
            // Adjust platform position for camera if needed
            const adjustedPlatformY = platform.y - this.cameraY;
            
            // Check for collision
            const colliding = 
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > adjustedPlatformY &&
                this.player.y < adjustedPlatformY + platform.height;
            
            // Handle collision only if falling onto the platform from above
            if (colliding && this.player.velocityY > 0 && 
                this.player.y + this.player.height - this.player.velocityY <= adjustedPlatformY) {
                this.player.grounded = true;
                this.player.jumping = false;
                this.player.y = adjustedPlatformY - this.player.height;
                this.player.velocityY = 0;
            }
        }
        
        // Apply velocity
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Screen boundaries
        if (this.player.x < 0) {
            this.player.x = 0;
            this.player.velocityX = 0;
        } else if (this.player.x + this.player.width > this.game.width) {
            this.player.x = this.game.width - this.player.width;
            this.player.velocityX = 0;
        }
        
        // Simple camera following player vertically when player goes high enough
        if (this.player.y < this.game.height / 3) {
            const targetCameraY = this.player.y - this.game.height / 3;
            this.cameraY = Math.max(0, targetCameraY); // Don't go below 0
        }
        
        // Check for collectible collection
        for (const collectible of this.collectibles) {
            if (!collectible.collected) {
                const dx = this.player.x + this.player.width / 2 - collectible.x;
                const dy = this.player.y + this.player.height / 2 - (collectible.y - this.cameraY);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.player.width / 2 + collectible.size / 2) {
                    collectible.collected = true;
                    this.score += 10;
                }
            }
        }
        
        // Check for victory (reaching the goal)
        const goalY = this.goal.y - this.cameraY;
        if (
            this.player.x < this.goal.x + this.goal.width &&
            this.player.x + this.player.width > this.goal.x &&
            this.player.y < goalY + this.goal.height &&
            this.player.y + this.player.height > goalY
        ) {
            this.victory = true;
            // Add bonus points for remaining time
            const timeBonus = Math.floor(this.timeLeft);
            this.score += timeBonus;
            // Add to the main game score
            this.game.addPoints(this.score, 'platform');
        }
        
        // Check for falling off the bottom of the screen
        if (this.player.y > this.game.height) {
            this.gameOver = true;
        }
    }
    
    render(ctx) {
        // Sky background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#E0F7FA'); // Light blue
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Decorative clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 300 + Date.now() / 100) % this.game.width;
            const y = 100 + i * 50;
            
            // Draw cloud
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.arc(x + 20, y - 15, 25, 0, Math.PI * 2);
            ctx.arc(x + 40, y, 30, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw goal
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.fillRect(this.goal.x, this.goal.y - this.cameraY, this.goal.width, this.goal.height);
        ctx.strokeStyle = '#B8860B'; // Dark golden rod
        ctx.lineWidth = 2;
        ctx.strokeRect(this.goal.x, this.goal.y - this.cameraY, this.goal.width, this.goal.height);
        
        // Draw star on goal
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        const starX = this.goal.x + this.goal.width / 2;
        const starY = this.goal.y - this.cameraY + this.goal.height / 2;
        const spikes = 5;
        const outerRadius = 15;
        const innerRadius = 7;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = Math.PI * i / spikes - Math.PI / 2;
            if (i === 0) {
                ctx.moveTo(starX + radius * Math.cos(angle), starY + radius * Math.sin(angle));
            } else {
                ctx.lineTo(starX + radius * Math.cos(angle), starY + radius * Math.sin(angle));
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Draw platforms
        for (const platform of this.platforms) {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y - this.cameraY, platform.width, platform.height);
        }
        
        // Draw collectibles
        ctx.fillStyle = '#FFD700'; // Gold
        for (const collectible of this.collectibles) {
            if (!collectible.collected) {
                // Draw coin
                ctx.beginPath();
                ctx.arc(collectible.x, collectible.y - this.cameraY, collectible.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#B8860B';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw dollar sign
                ctx.fillStyle = '#B8860B';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', collectible.x, collectible.y - this.cameraY);
                ctx.fillStyle = '#FFD700';
            }
        }
        
        // Draw player (croissant)
        if (this.game.croissantImage.complete && this.game.croissantImage.naturalHeight !== 0) {
            // Use the croissant image with appropriate flipping based on direction
            ctx.save();
            if (this.player.facing === 'left') {
                ctx.translate(this.player.x + this.player.width, this.player.y);
                ctx.scale(-1, 1);
                ctx.drawImage(this.game.croissantImage, 0, 0, this.player.width, this.player.height);
            } else {
                ctx.drawImage(
                    this.game.croissantImage,
                    this.player.x,
                    this.player.y,
                    this.player.width,
                    this.player.height
                );
            }
            ctx.restore();
        } else {
            // Fallback shape
            ctx.fillStyle = '#e6b266';
            ctx.beginPath();
            ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.width / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw UI
        super.render(ctx); // Draw exit button
        
        // Draw score and time
        ctx.fillStyle = '#000000';
        ctx.font = '24px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Score: ${this.score}`, this.game.width - 20, 30);
        ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, this.game.width - 20, 60);
        
        // Draw instructions if needed
        if (this.showInstructions) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Platform Jump', this.game.width / 2, this.game.height / 3 - 50);
            
            ctx.font = '20px Arial';
            ctx.fillText('Use A/D or Arrow Keys to move', this.game.width / 2, this.game.height / 3);
            ctx.fillText('Press W, Up Arrow, or SPACE to jump', this.game.width / 2, this.game.height / 3 + 30);
            ctx.fillText('Collect coins for points', this.game.width / 2, this.game.height / 3 + 60);
            ctx.fillText('Reach the star at the top to win!', this.game.width / 2, this.game.height / 3 + 90);
        }
        
        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Game Over', this.game.width / 2, this.game.height / 2 - 40);
            
            ctx.font = '24px Arial';
            ctx.fillText(`Score: ${this.score}`, this.game.width / 2, this.game.height / 2);
            
            // Restart button
            ctx.fillStyle = '#ff5555';
            const buttonX = this.game.width / 2;
            const buttonY = this.game.height / 2 + 50;
            const buttonWidth = 150;
            const buttonHeight = 40;
            
            ctx.fillRect(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight
            );
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText('Try Again', buttonX, buttonY);
        }
        
        // Draw victory screen
        if (this.victory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffdd00';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Victory!', this.game.width / 2, this.game.height / 2 - 60);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.fillText(`Score: ${this.score}`, this.game.width / 2, this.game.height / 2 - 20);
            ctx.fillText(`Time Bonus: ${Math.floor(this.timeLeft)}`, this.game.width / 2, this.game.height / 2 + 10);
            
            // Continue button
            ctx.fillStyle = '#55aa55';
            const buttonX = this.game.width / 2;
            const buttonY = this.game.height / 2 + 60;
            const buttonWidth = 150;
            const buttonHeight = 40;
            
            ctx.fillRect(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight
            );
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText('Continue', buttonX, buttonY);
        }
    }
}
