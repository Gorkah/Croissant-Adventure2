/**
 * Puzzle Slide Minigame
 * A sliding puzzle game where the player has to arrange tiles in the correct order
 */
class PuzzleMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    reset() {
        // Game properties
        this.gridSize = 4; // 4x4 puzzle
        this.tileSize = 80;
        this.gridWidth = this.gridSize * this.tileSize;
        this.gridHeight = this.gridSize * this.tileSize;
        this.gridX = (this.game.width - this.gridWidth) / 2;
        this.gridY = (this.game.height - this.gridHeight) / 2;
        
        // Game state
        this.score = 0;
        this.moves = 0;
        this.gameOver = false;
        this.startTime = Date.now();
        this.timeTaken = 0;
        
        // Generate puzzle grid
        this.tiles = this.generateTiles();
        this.scrambleTiles(100);
        
        // Instructions
        this.showInstructions = true;
        this.instructionTimer = 3;
    }
    
    generateTiles() {
        const tiles = [];
        // Generate tiles 1 to 15, with 0 representing the empty space
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tileNum = y * this.gridSize + x + 1;
                if (tileNum < this.gridSize * this.gridSize) {
                    tiles.push({
                        value: tileNum,
                        currentX: x,
                        currentY: y,
                        targetX: x,
                        targetY: y
                    });
                }
            }
        }
        // Add empty tile (value 0) at the bottom right
        tiles.push({
            value: 0,
            currentX: this.gridSize - 1,
            currentY: this.gridSize - 1,
            targetX: this.gridSize - 1,
            targetY: this.gridSize - 1
        });
        
        return tiles;
    }
    
    scrambleTiles(moves) {
        // Scramble by making random valid moves
        for (let i = 0; i < moves; i++) {
            const emptyTile = this.tiles.find(tile => tile.value === 0);
            const possibleMoves = [];
            
            // Check all four directions
            if (emptyTile.currentX > 0) possibleMoves.push({dx: -1, dy: 0});
            if (emptyTile.currentX < this.gridSize - 1) possibleMoves.push({dx: 1, dy: 0});
            if (emptyTile.currentY > 0) possibleMoves.push({dx: 0, dy: -1});
            if (emptyTile.currentY < this.gridSize - 1) possibleMoves.push({dx: 0, dy: 1});
            
            // Pick a random move
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            // Find the tile to swap with
            const tileToSwap = this.tiles.find(tile => 
                tile.currentX === emptyTile.currentX + move.dx && 
                tile.currentY === emptyTile.currentY + move.dy
            );
            
            // Swap positions
            const tempX = emptyTile.currentX;
            const tempY = emptyTile.currentY;
            emptyTile.currentX = tileToSwap.currentX;
            emptyTile.currentY = tileToSwap.currentY;
            tileToSwap.currentX = tempX;
            tileToSwap.currentY = tempY;
        }
    }
    
    checkVictory() {
        return this.tiles.every(tile => 
            tile.currentX === tile.targetX && tile.currentY === tile.targetY
        );
    }
    
    isValidMove(tileX, tileY) {
        // Find the empty tile
        const emptyTile = this.tiles.find(tile => tile.value === 0);
        
        // Check if the tile is adjacent to the empty tile
        return (
            (Math.abs(tileX - emptyTile.currentX) === 1 && tileY === emptyTile.currentY) ||
            (Math.abs(tileY - emptyTile.currentY) === 1 && tileX === emptyTile.currentX)
        );
    }
    
    moveTile(tileX, tileY) {
        if (!this.isValidMove(tileX, tileY)) return false;
        
        // Find the empty tile
        const emptyTile = this.tiles.find(tile => tile.value === 0);
        
        // Find the tile to move
        const tileToMove = this.tiles.find(tile => 
            tile.currentX === tileX && tile.currentY === tileY
        );
        
        // Swap positions
        const tempX = emptyTile.currentX;
        const tempY = emptyTile.currentY;
        emptyTile.currentX = tileToMove.currentX;
        emptyTile.currentY = tileToMove.currentY;
        tileToMove.currentX = tempX;
        tileToMove.currentY = tempY;
        
        // Count the move
        this.moves++;
        
        // Check for victory
        if (this.checkVictory()) {
            this.gameOver = true;
            this.timeTaken = (Date.now() - this.startTime) / 1000;
            
            // Calculate score
            const movesFactor = Math.max(1, 200 - this.moves);
            const timeFactor = Math.max(1, 300 - this.timeTaken);
            this.score = Math.floor(movesFactor * 2 + timeFactor);
            
            // Add to the main game score
            this.game.addPoints(this.score, 'puzzle');
        }
        
        return true;
    }
    
    enter() {
        console.log("Entering Puzzle Slide minigame");
        this.reset();
    }
    
    exit() {
        console.log("Exiting Puzzle Slide minigame");
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
        
        // Skip game logic if game is over
        if (this.gameOver) {
            // Check for restart button click
            if (this.game.mouseDown) {
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
            return;
        }
        
        // Update timeTaken for display
        this.timeTaken = (Date.now() - this.startTime) / 1000;
        
        // Handle mouse clicks on tiles
        if (this.game.mouseDown) {
            // Convert mouse position to grid coordinates
            const gridMouseX = this.game.mouseX - this.gridX;
            const gridMouseY = this.game.mouseY - this.gridY;
            
            // Check if click is within grid bounds
            if (
                gridMouseX >= 0 && 
                gridMouseX < this.gridWidth && 
                gridMouseY >= 0 && 
                gridMouseY < this.gridHeight
            ) {
                // Convert to tile coordinates
                const tileX = Math.floor(gridMouseX / this.tileSize);
                const tileY = Math.floor(gridMouseY / this.tileSize);
                
                // Try to move the tile
                if (this.moveTile(tileX, tileY)) {
                    this.game.mouseDown = false;
                }
            }
        }
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#3f4a6b';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw puzzle frame
        ctx.fillStyle = '#2a3142';
        ctx.fillRect(
            this.gridX - 10, 
            this.gridY - 10, 
            this.gridWidth + 20, 
            this.gridHeight + 20
        );
        
        // Draw grid lines
        ctx.strokeStyle = '#555f7b';
        ctx.lineWidth = 2;
        
        // Draw tiles
        for (const tile of this.tiles) {
            // Skip empty tile
            if (tile.value === 0) continue;
            
            const x = this.gridX + tile.currentX * this.tileSize;
            const y = this.gridY + tile.currentY * this.tileSize;
            
            // Draw tile background
            ctx.fillStyle = '#6d87c3';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            
            // Draw tile border
            ctx.strokeStyle = '#3f4a6b';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, this.tileSize, this.tileSize);
            
            // Draw tile number
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tile.value.toString(), x + this.tileSize / 2, y + this.tileSize / 2);
            
            // Indicate correct position with a green dot
            if (tile.currentX === tile.targetX && tile.currentY === tile.targetY) {
                ctx.fillStyle = '#44ff44';
                ctx.beginPath();
                ctx.arc(x + 10, y + 10, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw UI
        super.render(ctx); // Draw exit button
        
        // Draw game stats
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Moves: ${this.moves}`, 20, 80);
        ctx.fillText(`Time: ${Math.floor(this.timeTaken)}s`, 20, 110);
        
        // Draw instructions
        if (this.showInstructions) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Puzzle Slide', this.game.width / 2, this.game.height / 3 - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText('Click tiles next to the empty space to move them', this.game.width / 2, this.game.height / 3);
            ctx.fillText('Arrange all numbers in order from 1-15', this.game.width / 2, this.game.height / 3 + 35);
            ctx.fillText('Complete the puzzle with fewer moves for a higher score', this.game.width / 2, this.game.height / 3 + 70);
        }
        
        // Draw victory screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffcc00';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Puzzle Complete!', this.game.width / 2, this.game.height / 3);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.fillText(`Moves: ${this.moves}`, this.game.width / 2, this.game.height / 2 - 30);
            ctx.fillText(`Time: ${Math.floor(this.timeTaken)}s`, this.game.width / 2, this.game.height / 2);
            ctx.fillText(`Score: ${this.score}`, this.game.width / 2, this.game.height / 2 + 30);
            
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
