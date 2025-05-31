/**
 * Chess Minigame
 * A simple chess game where the player plays against a very basic AI
 */
class ChessMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    /**
     * Reset the chess game state
     */
    reset() {
        // Chess board properties
        this.boardSize = 400;
        this.squareSize = this.boardSize / 8;
        this.boardX = (this.game.width - this.boardSize) / 2;
        this.boardY = (this.game.height - this.boardSize) / 2 + 20;
        
        // Game state
        this.selectedPiece = null;
        this.playerTurn = true; // true = white, false = black
        this.gameOver = false;
        this.winner = null;
        this.aiThinking = false;
        this.message = "White's turn";
        
        // Initialize the board
        this.initializeBoard();
    }
    
    /**
     * Create the initial chess board
     */
    initializeBoard() {
        this.board = [];
        
        // Create empty board
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = null;
            }
        }
        
        // Place pawns
        for (let col = 0; col < 8; col++) {
            this.board[1][col] = { type: 'pawn', color: 'black' };
            this.board[6][col] = { type: 'pawn', color: 'white' };
        }
        
        // Place rooks
        this.board[0][0] = { type: 'rook', color: 'black' };
        this.board[0][7] = { type: 'rook', color: 'black' };
        this.board[7][0] = { type: 'rook', color: 'white' };
        this.board[7][7] = { type: 'rook', color: 'white' };
        
        // Place knights
        this.board[0][1] = { type: 'knight', color: 'black' };
        this.board[0][6] = { type: 'knight', color: 'black' };
        this.board[7][1] = { type: 'knight', color: 'white' };
        this.board[7][6] = { type: 'knight', color: 'white' };
        
        // Place bishops
        this.board[0][2] = { type: 'bishop', color: 'black' };
        this.board[0][5] = { type: 'bishop', color: 'black' };
        this.board[7][2] = { type: 'bishop', color: 'white' };
        this.board[7][5] = { type: 'bishop', color: 'white' };
        
        // Place queens
        this.board[0][3] = { type: 'queen', color: 'black' };
        this.board[7][3] = { type: 'queen', color: 'white' };
        
        // Place kings
        this.board[0][4] = { type: 'king', color: 'black' };
        this.board[7][4] = { type: 'king', color: 'white' };
    }
    
    enter() {
        this.reset();
    }
    
    exit() {
        // Nothing specific needed
    }
    
    /**
     * Get the valid moves for a piece
     */
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        
        // This is a simplified version that doesn't check for check/checkmate
        switch (piece.type) {
            case 'pawn':
                this.getPawnMoves(row, col, piece, moves);
                break;
            case 'rook':
                this.getRookMoves(row, col, piece, moves);
                break;
            case 'knight':
                this.getKnightMoves(row, col, piece, moves);
                break;
            case 'bishop':
                this.getBishopMoves(row, col, piece, moves);
                break;
            case 'queen':
                this.getQueenMoves(row, col, piece, moves);
                break;
            case 'king':
                this.getKingMoves(row, col, piece, moves);
                break;
        }
        
        return moves;
    }
    
    /**
     * Get valid moves for a pawn
     */
    getPawnMoves(row, col, piece, moves) {
        const direction = piece.color === 'white' ? -1 : 1;
        const startingRow = piece.color === 'white' ? 6 : 1;
        
        // Move forward
        if (row + direction >= 0 && row + direction < 8 && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col: col });
            
            // Move forward two spaces from starting position
            if (row === startingRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col: col });
            }
        }
        
        // Capture diagonally
        for (let colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            if (
                newCol >= 0 && 
                newCol < 8 && 
                row + direction >= 0 && 
                row + direction < 8 && 
                this.board[row + direction][newCol] && 
                this.board[row + direction][newCol].color !== piece.color
            ) {
                moves.push({ row: row + direction, col: newCol });
            }
        }
    }
    
    /**
     * Get valid moves for a rook
     */
    getRookMoves(row, col, piece, moves) {
        // Directions: up, right, down, left
        const directions = [
            { dr: -1, dc: 0 },
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 }
        ];
        
        for (const dir of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dir.dr * i;
                const newCol = col + dir.dc * i;
                
                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) {
                    break;
                }
                
                if (!this.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.board[newRow][newCol].color !== piece.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }
    }
    
    /**
     * Get valid moves for a knight
     */
    getKnightMoves(row, col, piece, moves) {
        const knightMoves = [
            { dr: -2, dc: -1 },
            { dr: -2, dc: 1 },
            { dr: -1, dc: -2 },
            { dr: -1, dc: 2 },
            { dr: 1, dc: -2 },
            { dr: 1, dc: 2 },
            { dr: 2, dc: -1 },
            { dr: 2, dc: 1 }
        ];
        
        for (const move of knightMoves) {
            const newRow = row + move.dr;
            const newCol = col + move.dc;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
    
    /**
     * Get valid moves for a bishop
     */
    getBishopMoves(row, col, piece, moves) {
        // Directions: up-left, up-right, down-right, down-left
        const directions = [
            { dr: -1, dc: -1 },
            { dr: -1, dc: 1 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];
        
        for (const dir of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dir.dr * i;
                const newCol = col + dir.dc * i;
                
                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) {
                    break;
                }
                
                if (!this.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.board[newRow][newCol].color !== piece.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }
    }
    
    /**
     * Get valid moves for a queen
     */
    getQueenMoves(row, col, piece, moves) {
        // Queen combines rook and bishop movements
        this.getRookMoves(row, col, piece, moves);
        this.getBishopMoves(row, col, piece, moves);
    }
    
    /**
     * Get valid moves for a king
     */
    getKingMoves(row, col, piece, moves) {
        // All 8 directions
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    if (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
    }
    
    /**
     * Move a piece from one square to another
     */
    movePiece(fromRow, fromCol, toRow, toCol) {
        // Check if this is a capture
        const captured = this.board[toRow][toCol];
        
        // Move the piece
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // Check for pawn promotion (simplified - always promote to queen)
        if (this.board[toRow][toCol].type === 'pawn') {
            if ((toRow === 0 && this.board[toRow][toCol].color === 'white') || 
                (toRow === 7 && this.board[toRow][toCol].color === 'black')) {
                this.board[toRow][toCol].type = 'queen';
            }
        }
        
        // Check for king capture (game over)
        if (captured && captured.type === 'king') {
            this.gameOver = true;
            this.winner = this.board[toRow][toCol].color;
        }
        
        // Switch turns
        this.playerTurn = !this.playerTurn;
        this.message = this.playerTurn ? "White's turn" : "Black's turn";
        
        // If it's AI's turn, make a move
        if (!this.playerTurn && !this.gameOver) {
            this.aiThinking = true;
            
            // Use setTimeout to give a small delay before AI moves
            setTimeout(() => {
                this.makeAIMove();
                this.aiThinking = false;
            }, 500);
        }
    }
    
    /**
     * Make a random move for the AI
     */
    makeAIMove() {
        if (this.gameOver) return;
        
        // Find all pieces that belong to the AI
        const aiPieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].color === 'black') {
                    aiPieces.push({ row, col });
                }
            }
        }
        
        // Shuffle pieces to add randomness
        for (let i = aiPieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [aiPieces[i], aiPieces[j]] = [aiPieces[j], aiPieces[i]];
        }
        
        // Try to find a valid move
        for (const piece of aiPieces) {
            const moves = this.getValidMoves(piece.row, piece.col);
            
            if (moves.length > 0) {
                // Pick a random move
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                this.movePiece(piece.row, piece.col, randomMove.row, randomMove.col);
                return;
            }
        }
        
        // If no moves are possible, it's a stalemate
        this.gameOver = true;
        this.winner = 'stalemate';
    }
    
    /**
     * Handle a square click
     */
    handleSquareClick(row, col) {
        if (this.gameOver || this.aiThinking || !this.playerTurn) return;
        
        // If no piece is selected yet
        if (!this.selectedPiece) {
            // Check if there's a piece at the clicked square
            if (this.board[row][col] && this.board[row][col].color === 'white') {
                this.selectedPiece = { row, col };
            }
        } else {
            // A piece is already selected
            const fromRow = this.selectedPiece.row;
            const fromCol = this.selectedPiece.col;
            
            // Check if the clicked square is a valid move
            const validMoves = this.getValidMoves(fromRow, fromCol);
            const isValidMove = validMoves.some(move => move.row === row && move.col === col);
            
            if (isValidMove) {
                // Move the piece
                this.movePiece(fromRow, fromCol, row, col);
                this.selectedPiece = null;
            } else if (this.board[row][col] && this.board[row][col].color === 'white') {
                // Select a different piece
                this.selectedPiece = { row, col };
            } else {
                // Deselect the piece
                this.selectedPiece = null;
            }
        }
    }
    
    update(deltaTime) {
        // Call parent update to handle exit button
        super.update(deltaTime);
        
        // Handle mouse click on chess board
        if (this.game.mouseDown) {
            const mouseX = this.game.mouseX - this.boardX;
            const mouseY = this.game.mouseY - this.boardY;
            
            if (mouseX >= 0 && mouseX < this.boardSize && mouseY >= 0 && mouseY < this.boardSize) {
                const col = Math.floor(mouseX / this.squareSize);
                const row = Math.floor(mouseY / this.squareSize);
                
                this.handleSquareClick(row, col);
            }
            
            this.game.mouseDown = false;
        }
        
        // Check for restart when game is over
        if (this.gameOver && this.game.isKeyPressed('r')) {
            this.reset();
        }
    }
    
    /**
     * Draw a chess piece
     */
    drawPiece(ctx, piece, x, y, size) {
        // Use characters to represent pieces
        let symbol = '';
        
        switch (piece.type) {
            case 'pawn': symbol = '♟'; break;
            case 'rook': symbol = '♜'; break;
            case 'knight': symbol = '♞'; break;
            case 'bishop': symbol = '♝'; break;
            case 'queen': symbol = '♛'; break;
            case 'king': symbol = '♚'; break;
        }
        
        ctx.fillStyle = piece.color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = piece.color === 'white' ? '#000000' : '#ffffff';
        ctx.font = `${size * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, x, y);
        ctx.lineWidth = 1;
        ctx.strokeText(symbol, x, y);
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#335577';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw chess board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = this.boardX + col * this.squareSize;
                const y = this.boardY + row * this.squareSize;
                
                // Draw square
                ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
                ctx.fillRect(x, y, this.squareSize, this.squareSize);
                
                // Highlight selected piece
                if (
                    this.selectedPiece && 
                    this.selectedPiece.row === row && 
                    this.selectedPiece.col === col
                ) {
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
                    ctx.fillRect(x, y, this.squareSize, this.squareSize);
                }
                
                // Highlight valid moves
                if (this.selectedPiece) {
                    const validMoves = this.getValidMoves(this.selectedPiece.row, this.selectedPiece.col);
                    if (validMoves.some(move => move.row === row && move.col === col)) {
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                        ctx.fillRect(x, y, this.squareSize, this.squareSize);
                    }
                }
                
                // Draw piece
                if (this.board[row][col]) {
                    this.drawPiece(
                        ctx,
                        this.board[row][col],
                        x + this.squareSize / 2,
                        y + this.squareSize / 2,
                        this.squareSize
                    );
                }
            }
        }
        
        // Draw coordinates
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < 8; i++) {
            // Draw column letters (a-h)
            ctx.fillText(
                String.fromCharCode(97 + i),
                this.boardX + i * this.squareSize + this.squareSize / 2,
                this.boardY + this.boardSize + 15
            );
            
            // Draw row numbers (1-8)
            ctx.fillText(
                8 - i,
                this.boardX - 15,
                this.boardY + i * this.squareSize + this.squareSize / 2
            );
        }
        
        // Draw UI
        super.render(ctx);
        
        // Draw title and status
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Chess', this.game.width / 2, 20);
        
        ctx.font = '16px Arial';
        ctx.fillText(
            this.aiThinking ? 'Black is thinking...' : this.message,
            this.game.width / 2,
            this.boardY + this.boardSize + 30
        );
        
        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.width / 2 - 150, this.game.height / 2 - 100, 300, 200);
            
            ctx.fillStyle = '#fff';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Game Over!', this.game.width / 2, this.game.height / 2 - 50);
            
            let resultText = '';
            if (this.winner === 'stalemate') {
                resultText = 'Stalemate!';
            } else {
                resultText = `${this.winner === 'white' ? 'White' : 'Black'} wins!`;
            }
            
            ctx.fillText(resultText, this.game.width / 2, this.game.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Press R to restart', this.game.width / 2, this.game.height / 2 + 50);
        }
    }
}
