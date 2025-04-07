/**
 * Shooter Minigame
 * A simple 2D shooter game where the player (croissant) shoots at targets
 */
class ShooterMinigame extends Minigame {
    constructor(game) {
        super(game);
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.timeLeft = 60; // Game lasts 60 seconds
        this.highScore = game.achievements.shooterHighscore || 0;
        
        // Player properties
        this.player = {
            x: game.width / 2,
            y: game.height - 80,
            width: 40,
            height: 40,
            speed: 300 // pixels per second
        };
        
        // Projectiles
        this.projectiles = [];
        this.shootCooldown = 0;
        this.shootCooldownMax = 0.5; // Can shoot every 0.5 seconds
        
        // Targets
        this.targets = [];
        this.targetSpawnTimer = 0;
        this.targetSpawnRate = 1.0; // Spawn a target every 1 second initially
        this.targetSpeed = 100; // Initial target speed
        
        // Particles
        this.particles = [];
        
        // UI
        this.instructionsShown = true;
        this.instructionsTimer = 3; // Show instructions for 3 seconds
    }
    
    enter() {
        console.log("Entering Shooter minigame");
        // Reset game state on enter
        this.score = 0;
        this.gameOver = false;
        this.timeLeft = 60;
        this.targets = [];
        this.projectiles = [];
        this.particles = [];
        this.instructionsShown = true;
        this.instructionsTimer = 3;
        this.targetSpawnRate = 1.0;
        this.targetSpeed = 100;
        this.spawnInitialTargets();
    }
    
    exit() {
        console.log("Exiting Shooter minigame");
        // Record high score if current score is higher
        if (this.score > this.highScore) {
            this.game.achievements.shooterHighscore = this.score;
            this.highScore = this.score;
        }
    }
    
    spawnInitialTargets() {
        // Spawn a few initial targets
        for (let i = 0; i < 5; i++) {
            this.spawnTarget();
        }
    }
    
    spawnTarget() {
        const size = 30 + Math.random() * 20; // Random size between 30 and 50
        const x = Math.random() * (this.game.width - size);
        const y = -size; // Start above the screen
        const pointValue = Math.floor(50 / size * 10); // Smaller targets are worth more points
        
        this.targets.push({
            x: x,
            y: y,
            size: size,
            speed: this.targetSpeed * (0.8 + Math.random() * 0.4), // Vary speed slightly
            pointValue: pointValue,
            color: `hsl(${Math.random() * 360}, 80%, 60%)` // Random color
        });
    }
    
    spawnParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: color,
                life: 1, // 1 second lifetime
                maxLife: 1
            });
        }
    }
    
    update(deltaTime) {
        // Call parent update method to handle exit button
        super.update(deltaTime);
        
        // Handle instructions timeout
        if (this.instructionsShown) {
            this.instructionsTimer -= deltaTime;
            if (this.instructionsTimer <= 0) {
                this.instructionsShown = false;
            }
        }
        
        // Don't update game if it's over
        if (this.gameOver) {
            // Check for restart on click
            if (this.game.mouseDown) {
                const restartButtonX = this.game.width / 2;
                const restartButtonY = this.game.height / 2 + 50;
                const restartButtonWidth = 150;
                const restartButtonHeight = 40;
                
                if (
                    this.game.mouseX >= restartButtonX - restartButtonWidth / 2 &&
                    this.game.mouseX <= restartButtonX + restartButtonWidth / 2 &&
                    this.game.mouseY >= restartButtonY - restartButtonHeight / 2 &&
                    this.game.mouseY <= restartButtonY + restartButtonHeight / 2
                ) {
                    this.enter(); // Restart the game
                    this.game.mouseDown = false;
                }
            }
            return;
        }
        
        // Update game timer
        this.timeLeft -= deltaTime;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.gameOver = true;
            // Add points to the main game
            this.game.addPoints(this.score, 'shooter');
            return;
        }
        
        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        // Handle player movement
        let dx = 0;
        
        // Check for keyboard movement
        if (this.game.keys['a'] || this.game.keys['arrowleft']) {
            dx -= this.player.speed * deltaTime;
        }
        if (this.game.keys['d'] || this.game.keys['arrowright']) {
            dx += this.player.speed * deltaTime;
        }
        
        // Move with boundary checking
        this.player.x = Math.max(0, Math.min(this.player.x + dx, this.game.width - this.player.width));
        
        // Handle shooting
        if ((this.game.keys[' '] || this.game.mouseDown) && this.shootCooldown <= 0) {
            // Create a new projectile
            this.projectiles.push({
                x: this.player.x + this.player.width / 2 - 5, // Center of player
                y: this.player.y,
                width: 10,
                height: 20,
                speed: 500 // pixels per second
            });
            
            // Reset cooldown
            this.shootCooldown = this.shootCooldownMax;
        }
        
        // Update target spawn timer
        this.targetSpawnTimer += deltaTime;
        if (this.targetSpawnTimer >= this.targetSpawnRate) {
            this.spawnTarget();
            this.targetSpawnTimer = 0;
            
            // Gradually increase difficulty
            this.targetSpawnRate = Math.max(0.3, this.targetSpawnRate - 0.01);
            this.targetSpeed = Math.min(300, this.targetSpeed + 0.5);
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.y -= projectile.speed * deltaTime;
            
            // Remove projectiles that go off-screen
            if (projectile.y + projectile.height < 0) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update targets
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            target.y += target.speed * deltaTime;
            
            // Check for collision with projectiles
            for (let j = this.projectiles.length - 1; j >= 0; j--) {
                const projectile = this.projectiles[j];
                
                // Simple collision detection using distance between centers
                const targetCenterX = target.x + target.size / 2;
                const targetCenterY = target.y + target.size / 2;
                const projectileCenterX = projectile.x + projectile.width / 2;
                const projectileCenterY = projectile.y + projectile.height / 2;
                
                const dx = targetCenterX - projectileCenterX;
                const dy = targetCenterY - projectileCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < target.size / 2 + projectile.width / 2) {
                    // Hit! Remove both target and projectile
                    this.score += target.pointValue;
                    this.spawnParticles(targetCenterX, targetCenterY, 20, target.color);
                    this.targets.splice(i, 1);
                    this.projectiles.splice(j, 1);
                    break;
                }
            }
            
            // If the target reaches the bottom, player loses points
            if (target.y > this.game.height) {
                this.score = Math.max(0, this.score - 5);
                this.targets.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        // Clear screen and draw background
        ctx.fillStyle = '#111122';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw stars in the background
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = Math.sin(i * 123.456) * 0.5 + 0.5;
            const y = Math.cos(i * 789.012) * 0.5 + 0.5;
            const size = Math.sin(i * 345.678) * 1.5 + 1.5;
            ctx.beginPath();
            ctx.arc(x * this.game.width, y * this.game.height, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw player (croissant)
        if (this.game.croissantImage.complete && this.game.croissantImage.naturalHeight !== 0) {
            ctx.drawImage(
                this.game.croissantImage,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
        } else {
            // Fallback to a simple rectangle
            ctx.fillStyle = '#e6b266';
            ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
        
        // Draw projectiles
        ctx.fillStyle = '#ffff00';
        for (const projectile of this.projectiles) {
            ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        }
        
        // Draw targets
        for (const target of this.targets) {
            ctx.fillStyle = target.color;
            ctx.beginPath();
            ctx.arc(
                target.x + target.size / 2,
                target.y + target.size / 2,
                target.size / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw target inner detail
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(
                target.x + target.size / 2,
                target.y + target.size / 2,
                target.size / 4,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw particles
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw exit button using parent method
        super.render(ctx);
        
        // Draw score and time
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${this.score}`, this.game.width - 20, 20);
        ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, this.game.width - 20, 50);
        ctx.fillText(`High Score: ${this.highScore}`, this.game.width - 20, 80);
        
        // Draw game over screen if game is over
        if (this.gameOver) {
            // Semi-transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            // Game over text
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Game Over!', this.game.width / 2, this.game.height / 2 - 40);
            
            // Final score
            ctx.font = '32px Arial';
            ctx.fillText(`Final Score: ${this.score}`, this.game.width / 2, this.game.height / 2);
            
            // Restart button
            ctx.fillStyle = '#4CAF50';
            const restartButtonX = this.game.width / 2;
            const restartButtonY = this.game.height / 2 + 50;
            const restartButtonWidth = 150;
            const restartButtonHeight = 40;
            
            ctx.fillRect(
                restartButtonX - restartButtonWidth / 2,
                restartButtonY - restartButtonHeight / 2,
                restartButtonWidth,
                restartButtonHeight
            );
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText('Play Again', restartButtonX, restartButtonY);
        }
        
        // Draw instructions if needed
        if (this.instructionsShown) {
            // Semi-transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            // Instructions text
            ctx.fillStyle = '#ffffff';
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Croissant Shooter', this.game.width / 2, this.game.height / 3 - 50);
            
            ctx.font = '20px Arial';
            ctx.fillText('Use A/D or Arrow Keys to move', this.game.width / 2, this.game.height / 3);
            ctx.fillText('Press SPACE or click to shoot', this.game.width / 2, this.game.height / 3 + 30);
            ctx.fillText('Hit targets to score points', this.game.width / 2, this.game.height / 3 + 60);
            ctx.fillText('Smaller targets are worth more!', this.game.width / 2, this.game.height / 3 + 90);
        }
    }
}
