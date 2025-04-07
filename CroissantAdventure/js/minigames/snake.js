/**
 * Snake Minigame
 * A classic snake game where the player controls a growing snake to collect food
 */
class SnakeMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    reset() {
        // Grid properties
        this.gridSize = 20; // Size of each grid cell
        this.gridWidth = Math.floor(this.game.width / this.gridSize);
        this.gridHeight = Math.floor(this.game.height / this.gridSize);
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        
        // Snake properties
        this.snake = [
            { x: Math.floor(this.gridWidth / 2), y: Math.floor(this.gridHeight / 2) }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.moveTimer = 0;
        this.moveInterval = 0.15; // Time between snake movements in seconds
        
        // Food properties
        this.food = this.generateFood();
        
        // Special items
        this.specialFood = null;
        this.specialFoodTimer = 0;
        this.specialFoodDuration = 10; // How long special food stays on screen
        this.specialFoodChance = 0.1; // Chance of special food appearing after eating normal food
        
        // Power-ups
        this.speedBoost = false;
        this.speedBoostTimer = 0;
        this.speedBoostDuration = 5;
        
        // Instructions
        this.showInstructions = true;
        this.instructionTimer = 3;
    }
    
    generateFood() {
        // Generate food at a random position not occupied by the snake
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.isPositionOccupied(food));
        
        return food;
    }
    
    generateSpecialFood() {
        // Only generate if no special food exists
        if (this.specialFood) return;
        
        // Random chance to spawn special food
        if (Math.random() > this.specialFoodChance) return;
        
        let specialFood;
        do {
            specialFood = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight),
                type: Math.random() < 0.5 ? 'speedBoost' : 'extraPoints'
            };
        } while (this.isPositionOccupied(specialFood) || 
                 (specialFood.x === this.food.x && specialFood.y === this.food.y));
        
        this.specialFood = specialFood;
        this.specialFoodTimer = this.specialFoodDuration;
    }
    
    isPositionOccupied(pos) {
        // Check if position is occupied by snake
        return this.snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    }
    
    enter() {
        console.log("Entering Snake minigame");
        this.reset();
    }
    
    exit() {
        console.log("Exiting Snake minigame");
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
            return;
        }
        
        // Handle restart on game over
        if (this.gameOver) {
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
        
        // Handle pause
        if (this.game.keys['p'] && !this.pPressed) {
            this.paused = !this.paused;
            this.pPressed = true;
        } else if (!this.game.keys['p']) {
            this.pPressed = false;
        }
        
        if (this.paused) return;
        
        // Handle direction changes
        if ((this.game.keys['w'] || this.game.keys['arrowup']) && this.direction !== 'down') {
            this.nextDirection = 'up';
        } else if ((this.game.keys['s'] || this.game.keys['arrowdown']) && this.direction !== 'up') {
            this.nextDirection = 'down';
        } else if ((this.game.keys['a'] || this.game.keys['arrowleft']) && this.direction !== 'right') {
            this.nextDirection = 'left';
        } else if ((this.game.keys['d'] || this.game.keys['arrowright']) && this.direction !== 'left') {
            this.nextDirection = 'right';
        }
        
        // Update move timer
        this.moveTimer += deltaTime;
        let moveInterval = this.moveInterval;
        
        // Apply speed boost if active
        if (this.speedBoost) {
            moveInterval *= 0.5; // Twice as fast
            this.speedBoostTimer -= deltaTime;
            if (this.speedBoostTimer <= 0) {
                this.speedBoost = false;
            }
        }
        
        // Move snake when timer expires
        if (this.moveTimer >= moveInterval) {
            this.moveTimer = 0;
            this.moveSnake();
        }
        
        // Update special food timer
        if (this.specialFood) {
            this.specialFoodTimer -= deltaTime;
            if (this.specialFoodTimer <= 0) {
                this.specialFood = null;
            }
        }
    }
    
    moveSnake() {
        // Update direction
        this.direction = this.nextDirection;
        
        // Get current head position
        const head = { ...this.snake[0] };
        
        // Move head based on direction
        switch (this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // Check for wall collision (wrap around)
        if (head.x < 0) head.x = this.gridWidth - 1;
        if (head.x >= this.gridWidth) head.x = 0;
        if (head.y < 0) head.y = this.gridHeight - 1;
        if (head.y >= this.gridHeight) head.y = 0;
        
        // Check for self-collision
        if (this.isPositionOccupied(head)) {
            this.gameOver = true;
            // Add points to main game
            this.game.addPoints(this.score, 'snake');
            return;
        }
        
        // Add new head to snake
        this.snake.unshift(head);
        
        // Check for food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            // Eat food and generate new one
            this.score += 10;
            this.food = this.generateFood();
            // Chance to generate special food
            this.generateSpecialFood();
            // Don't remove tail (snake grows)
        } else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            // Handle special food effects
            if (this.specialFood.type === 'speedBoost') {
                this.speedBoost = true;
                this.speedBoostTimer = this.speedBoostDuration;
                this.score += 5;
            } else if (this.specialFood.type === 'extraPoints') {
                this.score += 30;
            }
            this.specialFood = null;
        } else {
            // Remove tail (snake moves without growing)
            this.snake.pop();
        }
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#2e3131';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw grid lines
        ctx.strokeStyle = '#3e4141';
        ctx.lineWidth = 1;
        
        // Draw vertical grid lines
        for (let x = 0; x <= this.gridWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.gridSize, 0);
            ctx.lineTo(x * this.gridSize, this.game.height);
            ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = 0; y <= this.gridHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.gridSize);
            ctx.lineTo(this.game.width, y * this.gridSize);
            ctx.stroke();
        }
        
        // Draw snake
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            // Different colors for head and body
            if (i === 0) {
                // Head
                ctx.fillStyle = '#e6b266'; // Croissant color
            } else {
                // Body - gradient from head color to darker shade
                const colorRatio = 1 - i / this.snake.length;
                const r = Math.floor(230 * colorRatio + 150 * (1 - colorRatio));
                const g = Math.floor(178 * colorRatio + 110 * (1 - colorRatio));
                const b = Math.floor(102 * colorRatio + 60 * (1 - colorRatio));
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            }
            
            // Draw segment with slight padding for visual clarity
            const padding = 1;
            ctx.fillRect(
                segment.x * this.gridSize + padding,
                segment.y * this.gridSize + padding,
                this.gridSize - padding * 2,
                this.gridSize - padding * 2
            );
            
            // Draw eyes on head
            if (i === 0) {
                ctx.fillStyle = '#000000';
                
                // Different eye positions based on direction
                if (this.direction === 'right') {
                    ctx.beginPath();
                    ctx.arc(segment.x * this.gridSize + this.gridSize * 0.75, segment.y * this.gridSize + this.gridSize * 0.3, 2, 0, Math.PI * 2);
                    ctx.arc(segment.x * this.gridSize + this.gridSize * 0.75, segment.y * this.gridSize + this.gridSize * 0.7, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.direction === 'left') {
                    ctx.beginPath();
                    ctx.arc(segment.x * this.gridSize + this.gridSize * 0.25, segment.y * this.gridSize + this.gridSize * 0.3, 2, 0, Math.PI * 2);
                    ctx.arc(segment.x * this.gridSize + this.gridSize * 0.25, segment.y * this.gridSize + this.gridSize * 0.7, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.direction === 'up') {
                    ctx.beginPath();
                    ctx.arc(segment.x * this.gridSize + this.gridSize * 0.3, segment.y * this.gridSize + this.gridSize * 0.25, 2, 0, Math.PI * 2);
                    ctx.arc(segment.x * this.gridSize + this.gridSize * 0.7, segment.y * this.gridSize + this.gridSize * 0.25, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.direction === 'down') {
                    ctx.beginPath();
                    ctx.arc(segment.x * this.gridSize + this.gridSize * 0.3, segment.y * this.gridSize + this.gridSize * 0.75, 2, 0, Math.PI * 2);
                    ctx.arc(segment.x * this.gridSize + this.gridSize * 0.7, segment.y * this.gridSize + this.gridSize * 0.75, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Draw food
        ctx.fillStyle = '#ff6347'; // Tomato color
        ctx.beginPath();
        ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw special food if it exists
        if (this.specialFood) {
            // Pulsating animation
            const pulseRate = 3;
            const pulseAmount = 0.15;
            const pulseOffset = Math.sin(Date.now() / 200 * pulseRate) * pulseAmount;
            const radius = (this.gridSize / 2 - 2) * (1 + pulseOffset);
            
            if (this.specialFood.type === 'speedBoost') {
                ctx.fillStyle = '#00ffff'; // Cyan
            } else {
                ctx.fillStyle = '#ffff00'; // Yellow
            }
            
            ctx.beginPath();
            ctx.arc(
                this.specialFood.x * this.gridSize + this.gridSize / 2,
                this.specialFood.y * this.gridSize + this.gridSize / 2,
                radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw icon inside
            ctx.fillStyle = '#000000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.specialFood.type === 'speedBoost' ? '⚡' : '$',
                this.specialFood.x * this.gridSize + this.gridSize / 2,
                this.specialFood.y * this.gridSize + this.gridSize / 2
            );
        }
        
        // Draw UI
        super.render(ctx); // Draw exit button
        
        // Draw score
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${this.score}`, 20, 80);
        ctx.fillText(`Length: ${this.snake.length}`, 20, 110);
        
        // Draw speedboost indicator if active
        if (this.speedBoost) {
            ctx.fillStyle = '#00ffff';
            ctx.fillText('Speed Boost!', 20, 140);
            ctx.fillText(`${Math.ceil(this.speedBoostTimer)}s`, 20, 170);
        }
        
        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ff5555';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Game Over', this.game.width / 2, this.game.height / 2 - 40);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.fillText(`Final Score: ${this.score}`, this.game.width / 2, this.game.height / 2);
            ctx.fillText(`Snake Length: ${this.snake.length}`, this.game.width / 2, this.game.height / 2 + 30);
            
            // Restart button
            ctx.fillStyle = '#4CAF50';
            const buttonX = this.game.width / 2;
            const buttonY = this.game.height / 2 + 80;
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
            ctx.fillText('Play Again', buttonX, buttonY);
        }
        
        // Draw instructions
        if (this.showInstructions) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Snake', this.game.width / 2, this.game.height / 3 - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText('Use WASD or Arrow Keys to change direction', this.game.width / 2, this.game.height / 3);
            ctx.fillText('Collect food to grow longer', this.game.width / 2, this.game.height / 3 + 35);
            ctx.fillText('Watch for special items!', this.game.width / 2, this.game.height / 3 + 70);
            ctx.fillText('Press P to pause', this.game.width / 2, this.game.height / 3 + 105);
        }
        
        // Draw pause screen
        if (this.paused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PAUSED', this.game.width / 2, this.game.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText('Press P to Continue', this.game.width / 2, this.game.height / 2 + 50);
        }
    }
}
