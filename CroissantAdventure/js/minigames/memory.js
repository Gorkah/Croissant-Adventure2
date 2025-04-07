/**
 * Memory Match Minigame
 * A card matching game where the player has to find pairs of matching cards
 */
class MemoryMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    reset() {
        // Game state
        this.score = 0;
        this.moves = 0;
        this.gameOver = false;
        this.timeLeft = 120; // 2 minutes time limit
        
        // Card grid
        this.gridSizeX = 6;
        this.gridSizeY = 4;
        this.cardWidth = 80;
        this.cardHeight = 120;
        this.cardMargin = 10;
        
        // Card data
        this.cards = this.generateCards();
        
        // Game flow
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = (this.gridSizeX * this.gridSizeY) / 2;
        this.canClick = true;
        this.revealDelay = 1.0; // Time to show two cards before hiding them
        this.revealTimer = 0;
        
        // Animations
        this.animatedCards = [];
        
        // Instructions
        this.showInstructions = true;
        this.instructionTimer = 3;
    }
    
    generateCards() {
        const cards = [];
        const totalCards = this.gridSizeX * this.gridSizeY;
        
        // Define card symbols (emojis for easier display)
        const symbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍍', '🥝', '🍒', '🥥', '🍑', '🍋'];
        
        // Create pairs of cards
        for (let i = 0; i < totalCards / 2; i++) {
            // Create a pair with the same value
            const value = i % symbols.length;
            const symbol = symbols[value];
            
            for (let j = 0; j < 2; j++) {
                cards.push({
                    value: value,
                    symbol: symbol,
                    flipped: false,
                    matched: false,
                    x: 0, // Will be set in the layout function
                    y: 0,
                    width: this.cardWidth,
                    height: this.cardHeight,
                    animationProgress: 0
                });
            }
        }
        
        // Shuffle the cards
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        // Layout the cards in a grid
        const startX = (this.game.width - (this.gridSizeX * (this.cardWidth + this.cardMargin))) / 2 + this.cardMargin;
        const startY = (this.game.height - (this.gridSizeY * (this.cardHeight + this.cardMargin))) / 2 + this.cardMargin;
        
        let index = 0;
        for (let y = 0; y < this.gridSizeY; y++) {
            for (let x = 0; x < this.gridSizeX; x++) {
                cards[index].x = startX + x * (this.cardWidth + this.cardMargin);
                cards[index].y = startY + y * (this.cardHeight + this.cardMargin);
                index++;
            }
        }
        
        return cards;
    }
    
    enter() {
        console.log("Entering Memory Match minigame");
        this.reset();
    }
    
    exit() {
        console.log("Exiting Memory Match minigame");
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
            // Don't allow interaction during instructions
            return;
        }
        
        // Update time if the game is active
        if (!this.gameOver) {
            this.timeLeft -= deltaTime;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.gameOver = true;
                return;
            }
        }
        
        // Check for victory
        if (this.matchedPairs === this.totalPairs && !this.gameOver) {
            this.gameOver = true;
            
            // Calculate score based on moves and time
            const moveBonus = Math.max(0, 100 - this.moves * 5);
            const timeBonus = Math.max(0, Math.floor(this.timeLeft));
            this.score = 1000 + moveBonus + timeBonus * 10;
            
            // Add score to the main game
            this.game.addPoints(this.score, 'memory');
        }
        
        // Handle card reveal timer
        if (this.revealTimer > 0) {
            this.revealTimer -= deltaTime;
            if (this.revealTimer <= 0) {
                // Check if we have a match
                const [card1, card2] = this.selectedCards;
                if (card1.value === card2.value) {
                    // It's a match!
                    card1.matched = true;
                    card2.matched = true;
                    this.matchedPairs++;
                    
                    // Add the matched cards to animated cards
                    this.animatedCards.push(card1, card2);
                } else {
                    // Not a match, flip them back
                    card1.flipped = false;
                    card2.flipped = false;
                }
                
                this.selectedCards = [];
                this.canClick = true;
            }
        }
        
        // Update card animations
        for (const card of this.cards) {
            if (card.matched && !card.animationComplete) {
                card.animationProgress += deltaTime * 2;
                if (card.animationProgress >= 1) {
                    card.animationProgress = 1;
                    card.animationComplete = true;
                }
            }
        }
        
        // Handle card clicking
        if (this.canClick && this.game.mouseDown && !this.gameOver) {
            for (const card of this.cards) {
                if (
                    !card.flipped && 
                    !card.matched && 
                    this.game.mouseX >= card.x && 
                    this.game.mouseX <= card.x + card.width &&
                    this.game.mouseY >= card.y && 
                    this.game.mouseY <= card.y + card.height
                ) {
                    // Flip the card
                    card.flipped = true;
                    this.selectedCards.push(card);
                    this.game.mouseDown = false;
                    
                    // If we've selected two cards, start the reveal timer
                    if (this.selectedCards.length === 2) {
                        this.canClick = false;
                        this.revealTimer = this.revealDelay;
                        this.moves++;
                    }
                    
                    break;
                }
            }
        }
        
        // Game over restart button
        if (this.gameOver && this.game.mouseDown) {
            const buttonX = this.game.width / 2;
            const buttonY = this.game.height / 2 + 100;
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
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#3a5f8a';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw decorative pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let x = 0; x < this.game.width; x += 40) {
            for (let y = 0; y < this.game.height; y += 40) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw cards
        for (const card of this.cards) {
            if (card.matched) {
                // Draw matched card with animation
                ctx.save();
                
                // Scale and rotate animation
                const scale = 1 + card.animationProgress * 0.2;
                ctx.translate(card.x + card.width / 2, card.y + card.height / 2);
                ctx.rotate(card.animationProgress * Math.PI * 2);
                ctx.scale(scale, scale);
                
                // Draw card background
                ctx.fillStyle = '#88ff88';
                ctx.fillRect(-card.width / 2, -card.height / 2, card.width, card.height);
                
                // Draw card symbol
                ctx.fillStyle = '#228822';
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(card.symbol, 0, 0);
                
                ctx.restore();
            } else if (card.flipped) {
                // Draw card front
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(card.x, card.y, card.width, card.height);
                
                // Draw card symbol
                ctx.fillStyle = '#333333';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(card.symbol, card.x + card.width / 2, card.y + card.height / 2);
            } else {
                // Draw card back
                ctx.fillStyle = '#ff9900';
                ctx.fillRect(card.x, card.y, card.width, card.height);
                
                // Draw decorative back design
                ctx.strokeStyle = '#ffcc66';
                ctx.lineWidth = 2;
                ctx.strokeRect(card.x + 5, card.y + 5, card.width - 10, card.height - 10);
                
                // Draw question mark
                ctx.fillStyle = '#ffcc66';
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', card.x + card.width / 2, card.y + card.height / 2);
            }
        }
        
        // Draw UI
        super.render(ctx); // Draw exit button
        
        // Draw time and moves
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, 20, 80);
        ctx.fillText(`Moves: ${this.moves}`, 20, 110);
        
        // Draw matched pairs
        ctx.textAlign = 'right';
        ctx.fillText(`Pairs: ${this.matchedPairs}/${this.totalPairs}`, this.game.width - 20, 80);
        
        // Draw instructions
        if (this.showInstructions) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Memory Match', this.game.width / 2, this.game.height / 3 - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText('Find all matching pairs of cards', this.game.width / 2, this.game.height / 3);
            ctx.fillText('Click on cards to flip them', this.game.width / 2, this.game.height / 3 + 35);
            ctx.fillText('Find all pairs before time runs out', this.game.width / 2, this.game.height / 3 + 70);
        }
        
        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            if (this.matchedPairs === this.totalPairs) {
                // Victory screen
                ctx.fillStyle = '#ffcc00';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Victory!', this.game.width / 2, this.game.height / 3);
                
                // Score breakdown
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px Arial';
                ctx.fillText(`Moves: ${this.moves}`, this.game.width / 2, this.game.height / 2 - 60);
                ctx.fillText(`Time Bonus: ${Math.floor(this.timeLeft)}s`, this.game.width / 2, this.game.height / 2 - 30);
                ctx.fillText(`Final Score: ${this.score}`, this.game.width / 2, this.game.height / 2);
            } else {
                // Game over screen
                ctx.fillStyle = '#ff5555';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Time\'s Up!', this.game.width / 2, this.game.height / 3);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px Arial';
                ctx.fillText(`Pairs Found: ${this.matchedPairs}/${this.totalPairs}`, this.game.width / 2, this.game.height / 2 - 30);
                ctx.fillText(`Moves: ${this.moves}`, this.game.width / 2, this.game.height / 2);
            }
            
            // Play again button
            ctx.fillStyle = '#4CAF50';
            const buttonX = this.game.width / 2;
            const buttonY = this.game.height / 2 + 100;
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
    }
}
