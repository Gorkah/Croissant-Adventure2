/**
 * Maze Minigame
 * A simple maze game where the player navigates from start to finish
 */
class MazeMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    /**
     * Reset the maze game state
     */
    reset() {
        // Maze properties
        this.cellSize = 40;
        this.rows = 10;
        this.cols = 15;
        this.mazeWidth = this.cols * this.cellSize;
        this.mazeHeight = this.rows * this.cellSize;
        this.mazeX = (this.game.width - this.mazeWidth) / 2;
        this.mazeY = (this.game.height - this.mazeHeight) / 2 + 30;
        
        // Player properties
        this.player = {
            row: 1,
            col: 1,
            size: this.cellSize * 0.8,
            color: '#ffcc00'
        };
        
        // Game state
        this.gameOver = false;
        this.timeLeft = 60; // seconds
        this.startTime = Date.now() / 1000;
        
        // Create the maze layout
        this.generateMaze();
    }
    
    /**
     * Generate a random maze layout using a simple algorithm
     */
    generateMaze() {
        // Create a grid filled with walls
        this.maze = [];
        for (let r = 0; r < this.rows; r++) {
            this.maze[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.maze[r][c] = 1; // 1 = wall
            }
        }
        
        // Set start and end points
        this.startPosition = { row: 1, col: 1 };
        this.endPosition = { row: this.rows - 2, col: this.cols - 2 };
        
        // Carve passages using recursive backtracking
        const carvePassage = (r, c) => {
            // Mark this cell as a passage
            this.maze[r][c] = 0;
            
            // Define possible directions to move (up, right, down, left)
            const directions = [
                { dr: -2, dc: 0 },
                { dr: 0, dc: 2 },
                { dr: 2, dc: 0 },
                { dr: 0, dc: -2 }
            ];
            
            // Shuffle directions for randomness
            for (let i = directions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [directions[i], directions[j]] = [directions[j], directions[i]];
            }
            
            // Try each direction
            for (const dir of directions) {
                const newR = r + dir.dr;
                const newC = c + dir.dc;
                
                // Check if this new position is valid and still a wall
                if (newR > 0 && newR < this.rows - 1 && 
                    newC > 0 && newC < this.cols - 1 &&
                    this.maze[newR][newC] === 1) {
                    
                    // Carve a passage by making the wall in between a passage too
                    this.maze[r + dir.dr/2][c + dir.dc/2] = 0;
                    
                    // Continue recursively
                    carvePassage(newR, newC);
                }
            }
        };
        
        // Start carving from the start position
        carvePassage(this.startPosition.row, this.startPosition.col);
        
        // Make sure end is accessible
        this.maze[this.endPosition.row][this.endPosition.col] = 0;
        
        // Set the player position to the start
        this.player.row = this.startPosition.row;
        this.player.col = this.startPosition.col;
    }
    
    enter() {
        this.reset();
    }
    
    exit() {
        // Nothing specific needed
    }
    
    /**
     * Check if a position is a valid move (not a wall)
     */
    isValidMove(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return false;
        }
        return this.maze[row][col] === 0;
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
        const currentTime = Date.now() / 1000;
        this.timeLeft = Math.max(0, 60 - (currentTime - this.startTime));
        
        if (this.timeLeft <= 0) {
            this.gameOver = true;
            this.winner = false;
            return;
        }
        
        // Handle player movement
        let newRow = this.player.row;
        let newCol = this.player.col;
        
        // Only allow one move per keypress
        if (this.game.isKeyPressed('w') || this.game.isKeyPressed('arrowup')) {
            if (!this.keyPressed) {
                newRow--;
                this.keyPressed = true;
            }
        } else if (this.game.isKeyPressed('s') || this.game.isKeyPressed('arrowdown')) {
            if (!this.keyPressed) {
                newRow++;
                this.keyPressed = true;
            }
        } else if (this.game.isKeyPressed('a') || this.game.isKeyPressed('arrowleft')) {
            if (!this.keyPressed) {
                newCol--;
                this.keyPressed = true;
            }
        } else if (this.game.isKeyPressed('d') || this.game.isKeyPressed('arrowright')) {
            if (!this.keyPressed) {
                newCol++;
                this.keyPressed = true;
            }
        } else {
            this.keyPressed = false;
        }
        
        // Check if move is valid
        if (this.isValidMove(newRow, newCol)) {
            this.player.row = newRow;
            this.player.col = newCol;
            
            // Check if player reached the end
            if (this.player.row === this.endPosition.row && 
                this.player.col === this.endPosition.col) {
                this.gameOver = true;
                this.winner = true;
                // Award points for completion
                const timeBonus = Math.floor(this.timeLeft * 5);
                this.game.addPoints(100 + timeBonus, 'maze');
            }
        }
        
        // Allow for click movement
        if (this.game.mouseDown) {
            const mouseX = this.game.mouseX - this.mazeX;
            const mouseY = this.game.mouseY - this.mazeY;
            
            if (mouseX >= 0 && mouseX < this.mazeWidth && mouseY >= 0 && mouseY < this.mazeHeight) {
                const clickRow = Math.floor(mouseY / this.cellSize);
                const clickCol = Math.floor(mouseX / this.cellSize);
                
                // Check if adjacent to player and valid
                const rowDiff = Math.abs(clickRow - this.player.row);
                const colDiff = Math.abs(clickCol - this.player.col);
                
                if (rowDiff + colDiff === 1 && this.isValidMove(clickRow, clickCol)) {
                    this.player.row = clickRow;
                    this.player.col = clickCol;
                    
                    // Check if player reached the end
                    if (this.player.row === this.endPosition.row && 
                        this.player.col === this.endPosition.col) {
                        this.gameOver = true;
                        this.winner = true;
                        // Award points for completion
                        const timeBonus = Math.floor(this.timeLeft * 5);
                        this.game.addPoints(100 + timeBonus, 'maze');
                    }
                }
            }
            
            this.game.mouseDown = false;
        }
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#335577';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw maze
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = this.mazeX + c * this.cellSize;
                const y = this.mazeY + r * this.cellSize;
                
                if (this.maze[r][c] === 1) {
                    // Wall
                    ctx.fillStyle = '#444444';
                    ctx.fillRect(x, y, this.cellSize, this.cellSize);
                } else {
                    // Passage
                    ctx.fillStyle = '#dddddd';
                    ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    
                    // Draw grid lines
                    ctx.strokeStyle = '#cccccc';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                }
                
                // Mark start and end
                if (r === this.startPosition.row && c === this.startPosition.col) {
                    ctx.fillStyle = '#55cc55'; // Green for start
                    ctx.beginPath();
                    ctx.arc(
                        x + this.cellSize / 2,
                        y + this.cellSize / 2,
                        this.cellSize / 4,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                } else if (r === this.endPosition.row && c === this.endPosition.col) {
                    ctx.fillStyle = '#cc5555'; // Red for end
                    ctx.beginPath();
                    ctx.arc(
                        x + this.cellSize / 2,
                        y + this.cellSize / 2,
                        this.cellSize / 4,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }
        
        // Draw player
        if (!this.gameOver || this.winner) {
            const x = this.mazeX + this.player.col * this.cellSize;
            const y = this.mazeY + this.player.row * this.cellSize;
            
            if (this.game.croissantImage.complete && this.game.croissantImage.naturalHeight !== 0) {
                ctx.drawImage(
                    this.game.croissantImage,
                    x + (this.cellSize - this.player.size) / 2,
                    y + (this.cellSize - this.player.size) / 2,
                    this.player.size,
                    this.player.size
                );
            } else {
                ctx.fillStyle = this.player.color;
                ctx.beginPath();
                ctx.arc(
                    x + this.cellSize / 2,
                    y + this.cellSize / 2,
                    this.player.size / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.strokeStyle = '#996600';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        
        // Draw UI
        super.render(ctx);
        
        // Draw title and timer
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Maze', this.game.width / 2, 20);
        
        ctx.font = '16px Arial';
        ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, this.game.width / 2, 50);
        
        // Draw instructions
        if (!this.gameOver) {
            ctx.font = '14px Arial';
            ctx.fillText('Use WASD or arrow keys to navigate', this.game.width / 2, this.game.height - 40);
            ctx.fillText('Or click an adjacent cell to move there', this.game.width / 2, this.game.height - 20);
        }
        
        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.width / 2 - 150, this.game.height / 2 - 100, 300, 200);
            
            ctx.fillStyle = '#fff';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (this.winner) {
                ctx.fillText('¡Laberinto completado!', this.game.width / 2, this.game.height / 2 - 50);
                const timeBonus = Math.floor(this.timeLeft * 5);
                ctx.fillText(`Puntos: 100 + ${timeBonus} = ${100 + timeBonus}`, this.game.width / 2, this.game.height / 2);
            } else {
                ctx.fillText('¡Se acabó el tiempo!', this.game.width / 2, this.game.height / 2 - 50);
                ctx.fillText('¡Inténtalo de nuevo!', this.game.width / 2, this.game.height / 2);
            }
            
            ctx.font = '20px Arial';
            ctx.fillText('Pulsa R para reiniciar', this.game.width / 2, this.game.height / 2 + 50);
        }
    }
}
