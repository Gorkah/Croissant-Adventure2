/**
 * StoryTeller Minigame
 * Un menú de juegos para 2 jugadores
 */
class StoryTellerMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.name = "Mini Juegos";
        this.backgroundColor = "#8a5cbd";
        
        // Música específica para cada juego
        this.music = {
            menu: 'assets/audio/jungle-waves-drumampbass-electronic-inspiring-promo-345013.mp3',
            tictactoe: 'assets/audio/future-design-344320.mp3',
            connect4: 'assets/audio/jungle-waves-drumampbass-electronic-inspiring-promo-345013.mp3',
            memory: 'assets/audio/future-design-344320.mp3',
            battleship: 'assets/audio/jungle-waves-drumampbass-electronic-inspiring-promo-345013.mp3'
        };
        
        // Música por defecto (para el menú)
        this.gameMusic = this.music.menu;
        
        // Enlazar métodos de eventos
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        
        // Estado del juego
        this.currentScreen = 'menu';  // 'menu', 'game'
        this.currentGame = null;
        
        // Elementos de la UI
        this.buttonWidth = 300;
        this.buttonHeight = 60;
        this.buttonSpacing = 20;
        
        // Lista de juegos disponibles
        this.games = [
            { id: 'tictactoe', name: 'Tres en Raya', description: 'El clásico juego de X y O para 2 jugadores' },
            { id: 'connect4', name: 'Conecta 4', description: 'Conecta 4 fichas en línea antes que tu oponente' },
            { id: 'memory', name: 'Memoria', description: 'Encuentra todas las parejas de cartas' },
            { id: 'battleship', name: 'Hundir la Flota', description: 'Hunde los barcos de tu oponente' }
        ];
        
        // Juego de Tres en Raya
        this.tictactoe = {
            board: [null, null, null, null, null, null, null, null, null],
            currentPlayer: 'X',
            winner: null,
            gameOver: false,
            cellSize: 100,
            gridOffset: { x: 0, y: 0 }
        };
        
        // Juego de Conecta 4
        this.connect4 = {
            board: Array(6).fill().map(() => Array(7).fill(null)),
            currentPlayer: 'red',
            winner: null,
            gameOver: false,
            cellSize: 60,
            gridOffset: { x: 0, y: 0 }
        };
        
        // Juego de Memoria
        this.memory = {
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            totalPairs: 8,
            currentPlayer: 1,
            scores: [0, 0],
            gameOver: false,
            cardSize: 80,
            gridOffset: { x: 0, y: 0 }
        };
        
        // Juego de Hundir la Flota
        this.battleship = {
            boards: [
                Array(10).fill().map(() => Array(10).fill(null)), // Jugador 1
                Array(10).fill().map(() => Array(10).fill(null))  // Jugador 2
            ],
            ships: [
                [], // Jugador 1
                []  // Jugador 2
            ],
            currentPlayer: 0,
            setupPhase: true,
            selectedShip: null,
            winner: null,
            gameOver: false,
            cellSize: 40,
            gridOffset: { x: 0, y: 0 }
        };
    }
    
    /**
     * Inicializar el juego
     */
    enter() {
        console.log("Entrando al minijuego de Mini Juegos");
        this.currentScreen = 'menu';
        this.currentGame = null;
        
        // Guardar la música actual para restaurarla al salir
        this.previousMusic = this.game.audioSystem.currentMusic;
        
        // Reproducir música específica para este minijuego
        if (this.game.audioSystem.musicEnabled) {
            this.game.playBackgroundMusic(this.gameMusic);
        }
        
        // Configurar eventos
        window.addEventListener('keydown', this.onKeyDown);
    }
    
    /**
     * Salir del juego
     */
    exit() {
        console.log("Saliendo del minijuego de Mini Juegos");
        
        // Restaurar la música anterior si existía
        if (this.previousMusic && this.game.audioSystem.musicEnabled) {
            this.game.playBackgroundMusic(this.previousMusic);
        }
        
        window.removeEventListener('keydown', this.onKeyDown);
    }
    
    /**
     * Actualizar el estado del juego
     * @param {number} deltaTime - Tiempo desde el último frame
     */
    update(deltaTime) {
        // Nada que actualizar automáticamente
    }
    
    /**
     * Renderizar el juego
     */
    render() {
        const ctx = this.game.ctx;
        const width = this.game.width;
        const height = this.game.height;
        
        // Color de fondo
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        if (this.currentScreen === 'menu') {
            this.renderMenu(ctx, width, height);
        } else if (this.currentScreen === 'game') {
            this.renderGame(ctx, width, height);
        }
    }
    
    /**
     * Renderizar el menú principal
     */
    renderMenu(ctx, width, height) {
        // Título
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Mini Juegos para 2 Jugadores", width / 2, 100);
        
        // Subtítulo
        ctx.font = "24px Arial";
        ctx.fillText("Selecciona un juego para comenzar", width / 2, 150);
        
        // Botones de juegos
        const startY = 220;
        const centerX = width / 2;
        
        for (let i = 0; i < this.games.length; i++) {
            const game = this.games[i];
            const y = startY + (this.buttonHeight + this.buttonSpacing) * i;
            
            // Dibujar botón
            ctx.fillStyle = "#ff9900";
            this.roundRect(ctx, centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight, 10, true);
            
            // Efecto hover
            if (this.isMouseOverButton(centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight)) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                this.roundRect(ctx, centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight, 10, true);
            }
            
            // Texto del botón
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(game.name, centerX, y + 25);
            
            // Descripción
            ctx.font = "14px Arial";
            ctx.fillText(game.description, centerX, y + 45);
        }
        
        // Botón para volver al mapa
        const backY = height - 70;
        
        ctx.fillStyle = "#ff5555";
        this.roundRect(ctx, centerX - 150, backY, 300, 50, 10, true);
        
        // Efecto hover
        if (this.isMouseOverButton(centerX - 150, backY, 300, 50)) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.roundRect(ctx, centerX - 150, backY, 300, 50, 10, true);
        }
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.fillText("Volver al Mapa", centerX, backY + 30);
    }
    
    /**
     * Renderizar el juego seleccionado
     */
    renderGame(ctx, width, height) {
        if (this.currentGame === 'tictactoe') {
            this.renderTicTacToe(ctx, width, height);
        } else if (this.currentGame === 'connect4') {
            this.renderConnect4(ctx, width, height);
        } else if (this.currentGame === 'memory') {
            this.renderMemory(ctx, width, height);
        } else if (this.currentGame === 'battleship') {
            this.renderBattleship(ctx, width, height);
        }
        
        // Botón para volver al menú
        const backY = height - 70;
        const centerX = width / 2;
        
        ctx.fillStyle = "#ff5555";
        this.roundRect(ctx, centerX - 150, backY, 300, 50, 10, true);
        
        // Efecto hover
        if (this.isMouseOverButton(centerX - 150, backY, 300, 50)) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.roundRect(ctx, centerX - 150, backY, 300, 50, 10, true);
        }
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.fillText("Volver al Menú", centerX, backY + 30);
    }
    
    /**
     * Renderizar el juego de Tres en Raya
     */
    renderTicTacToe(ctx, width, height) {
        const game = this.tictactoe;
        
        // Título
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Tres en Raya", width / 2, 60);
        
        // Turno actual
        ctx.font = "24px Arial";
        if (!game.gameOver) {
            ctx.fillText(`Turno del Jugador: ${game.currentPlayer}`, width / 2, 100);
        } else if (game.winner) {
            ctx.fillText(`¡El Jugador ${game.winner} ha ganado!`, width / 2, 100);
        } else {
            ctx.fillText("¡Empate!", width / 2, 100);
        }
        
        // Calcular el tamaño y posición del tablero
        const boardSize = game.cellSize * 3;
        const offsetX = (width - boardSize) / 2;
        const offsetY = 150;
        
        game.gridOffset = { x: offsetX, y: offsetY };
        
        // Dibujar el tablero
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        
        // Líneas horizontales
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + game.cellSize);
        ctx.lineTo(offsetX + boardSize, offsetY + game.cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + game.cellSize * 2);
        ctx.lineTo(offsetX + boardSize, offsetY + game.cellSize * 2);
        ctx.stroke();
        
        // Líneas verticales
        ctx.beginPath();
        ctx.moveTo(offsetX + game.cellSize, offsetY);
        ctx.lineTo(offsetX + game.cellSize, offsetY + boardSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(offsetX + game.cellSize * 2, offsetY);
        ctx.lineTo(offsetX + game.cellSize * 2, offsetY + boardSize);
        ctx.stroke();
        
        // Dibujar X y O
        for (let i = 0; i < 9; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = offsetX + col * game.cellSize;
            const y = offsetY + row * game.cellSize;
            
            if (game.board[i] === 'X') {
                this.drawX(ctx, x, y, game.cellSize);
            } else if (game.board[i] === 'O') {
                this.drawO(ctx, x, y, game.cellSize);
            }
        }
        
        // Botón para reiniciar el juego
        if (game.gameOver) {
            const resetY = height - 130;
            const centerX = width / 2;
            
            ctx.fillStyle = "#4caf50";
            this.roundRect(ctx, centerX - 150, resetY, 300, 50, 10, true);
            
            // Efecto hover
            if (this.isMouseOverButton(centerX - 150, resetY, 300, 50)) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                this.roundRect(ctx, centerX - 150, resetY, 300, 50, 10, true);
            }
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px Arial";
            ctx.fillText("Jugar de Nuevo", centerX, resetY + 30);
        }
    }
    
    /**
     * Dibujar una X para el juego de Tres en Raya
     */
    drawX(ctx, x, y, size) {
        const padding = size * 0.2;
        ctx.strokeStyle = "#ff5555";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        
        ctx.beginPath();
        ctx.moveTo(x + padding, y + padding);
        ctx.lineTo(x + size - padding, y + size - padding);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + size - padding, y + padding);
        ctx.lineTo(x + padding, y + size - padding);
        ctx.stroke();
    }
    
    /**
     * Dibujar una O para el juego de Tres en Raya
     */
    drawO(ctx, x, y, size) {
        const padding = size * 0.2;
        const radius = (size - padding * 2) / 2;
        
        ctx.strokeStyle = "#5555ff";
        ctx.lineWidth = 8;
        
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
        /**
     * Renderizar el juego de Conecta 4
     */
        renderConnect4(ctx, width, height) {
            const game = this.connect4;
            
            // Título
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 36px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Conecta 4", width / 2, 60);
            
            // Turno actual
            ctx.font = "24px Arial";
            if (!game.gameOver) {
                ctx.fillText(`Turno del Jugador: ${game.currentPlayer === 'red' ? 'Rojo' : 'Amarillo'}`, width / 2, 100);
            } else if (game.winner) {
                ctx.fillText(`¡El Jugador ${game.winner === 'red' ? 'Rojo' : 'Amarillo'} ha ganado!`, width / 2, 100);
            }
            
            // Calcular el tamaño y posición del tablero
            const boardWidth = game.cellSize * 7;
            const boardHeight = game.cellSize * 6;
            const offsetX = (width - boardWidth) / 2;
            const offsetY = 150;
            
            game.gridOffset = { x: offsetX, y: offsetY };
            
            // Dibujar el tablero
            ctx.fillStyle = "#3f51b5";
            ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);
            
            // Dibujar los huecos
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 7; col++) {
                    const x = offsetX + col * game.cellSize + game.cellSize / 2;
                    const y = offsetY + row * game.cellSize + game.cellSize / 2;
                    
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(x, y, game.cellSize * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Dibujar fichas
                    if (game.board[row][col] === 'red') {
                        ctx.fillStyle = "#ff5555";
                        ctx.beginPath();
                        ctx.arc(x, y, game.cellSize * 0.4, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (game.board[row][col] === 'yellow') {
                        ctx.fillStyle = "#ffff00";
                        ctx.beginPath();
                        ctx.arc(x, y, game.cellSize * 0.4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            
            // Botón para reiniciar el juego
            if (game.gameOver) {
                const resetY = height - 130;
                const centerX = width / 2;
                
                ctx.fillStyle = "#4caf50";
                this.roundRect(ctx, centerX - 150, resetY, 300, 50, 10, true);
                
                // Efecto hover
                if (this.isMouseOverButton(centerX - 150, resetY, 300, 50)) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                    this.roundRect(ctx, centerX - 150, resetY, 300, 50, 10, true);
                }
                
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 20px Arial";
                ctx.fillText("Jugar de Nuevo", centerX, resetY + 30);
            }
        }
        
        /**
         * Renderizar el juego de Memoria
         */
        renderMemory(ctx, width, height) {
            const game = this.memory;
            
            // Título
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 36px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Juego de Memoria", width / 2, 60);
            
            // Turno actual y puntuación
            ctx.font = "24px Arial";
            if (!game.gameOver) {
                ctx.fillText(`Turno del Jugador ${game.currentPlayer}`, width / 2, 100);
            } else {
                const winner = game.scores[0] > game.scores[1] ? 1 : (game.scores[1] > game.scores[0] ? 2 : "Empate");
                if (winner === "Empate") {
                    ctx.fillText("¡Empate!", width / 2, 100);
                } else {
                    ctx.fillText(`¡El Jugador ${winner} ha ganado!`, width / 2, 100);
                }
            }
            
            // Mostrar puntuaciones
            ctx.font = "20px Arial";
            ctx.textAlign = "left";
            ctx.fillText(`Jugador 1: ${game.scores[0]} pares`, 50, 100);
            
            ctx.textAlign = "right";
            ctx.fillText(`Jugador 2: ${game.scores[1]} pares`, width - 50, 100);
            
            // Calcular el tamaño y posición del tablero
            const cols = 4;
            const rows = 4;
            const boardWidth = game.cardSize * cols;
            const boardHeight = game.cardSize * rows;
            const offsetX = (width - boardWidth) / 2;
            const offsetY = 150;
            
            game.gridOffset = { x: offsetX, y: offsetY };
            
            // Dibujar las cartas
            for (let i = 0; i < game.cards.length; i++) {
                const card = game.cards[i];
                const row = Math.floor(i / cols);
                const col = i % cols;
                const x = offsetX + col * game.cardSize;
                const y = offsetY + row * game.cardSize;
                
                if (card.matched) {
                    // Carta emparejada (transparente)
                    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                    this.roundRect(ctx, x + 5, y + 5, game.cardSize - 10, game.cardSize - 10, 5, true);
                } else if (card.flipped) {
                    // Carta volteada (mostrar valor)
                    ctx.fillStyle = "#ffffff";
                    this.roundRect(ctx, x + 5, y + 5, game.cardSize - 10, game.cardSize - 10, 5, true);
                    
                    ctx.fillStyle = "#000000";
                    ctx.font = "bold 24px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(card.value, x + game.cardSize / 2, y + game.cardSize / 2);
                } else {
                    // Carta boca abajo
                    ctx.fillStyle = "#ff9900";
                    this.roundRect(ctx, x + 5, y + 5, game.cardSize - 10, game.cardSize - 10, 5, true);
                    
                    // Dibujar patrón de carta
                    ctx.fillStyle = "#ffcc66";
                    ctx.beginPath();
                    ctx.arc(x + game.cardSize / 2, y + game.cardSize / 2, 15, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Botón para reiniciar el juego
            if (game.gameOver) {
                const resetY = height - 130;
                const centerX = width / 2;
                
                ctx.fillStyle = "#4caf50";
                this.roundRect(ctx, centerX - 150, resetY, 300, 50, 10, true);
                
                // Efecto hover
                if (this.isMouseOverButton(centerX - 150, resetY, 300, 50)) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                    this.roundRect(ctx, centerX - 150, resetY, 300, 50, 10, true);
                }
                
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 20px Arial";
                ctx.fillText("Jugar de Nuevo", centerX, resetY + 30);
            }
        }
        
        /**
         * Renderizar el juego de Hundir la Flota
         */
        renderBattleship(ctx, width, height) {
            const game = this.battleship;
            
            // Título
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 36px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Hundir la Flota", width / 2, 60);
            
            // Fase de juego
            ctx.font = "24px Arial";
            if (game.setupPhase) {
                ctx.fillText(`Jugador ${game.currentPlayer + 1}: Coloca tus barcos`, width / 2, 100);
            } else if (!game.gameOver) {
                ctx.fillText(`Turno del Jugador ${game.currentPlayer + 1}`, width / 2, 100);
            } else {
                ctx.fillText(`¡El Jugador ${game.winner + 1} ha ganado!`, width / 2, 100);
            }
            
            // Calcular el tamaño y posición de los tableros
            const boardSize = game.cellSize * 10;
            const offsetY = 150;
            const player1OffsetX = width / 4 - boardSize / 2;
            const player2OffsetX = width * 3/4 - boardSize / 2;
            
            game.gridOffset = [
                { x: player1OffsetX, y: offsetY },
                { x: player2OffsetX, y: offsetY }
            ];
            
            // Etiquetas de los tableros
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Jugador 1", width / 4, offsetY - 10);
            ctx.fillText("Jugador 2", width * 3/4, offsetY - 10);
            
            // Dibujar los tableros
            for (let player = 0; player < 2; player++) {
                const offsetX = player === 0 ? player1OffsetX : player2OffsetX;
                
                // Fondo del tablero
                ctx.fillStyle = "#1e88e5";
                ctx.fillRect(offsetX, offsetY, boardSize, boardSize);
                
                // Cuadrícula
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1;
                
                for (let i = 0; i <= 10; i++) {
                    // Líneas verticales
                    ctx.beginPath();
                    ctx.moveTo(offsetX + i * game.cellSize, offsetY);
                    ctx.lineTo(offsetX + i * game.cellSize, offsetY + boardSize);
                    ctx.stroke();
                    
                    // Líneas horizontales
                    ctx.beginPath();
                    ctx.moveTo(offsetX, offsetY + i * game.cellSize);
                    ctx.lineTo(offsetX + boardSize, offsetY + i * game.cellSize);
                    ctx.stroke();
                }
                
                // Dibujar barcos y disparos
                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        const cell = game.boards[player][row][col];
                        const x = offsetX + col * game.cellSize;
                        const y = offsetY + row * game.cellSize;
                        
                        if (cell === 'ship' && (player === game.currentPlayer || game.setupPhase || game.gameOver)) {
                            // Barco (solo visible para el jugador actual o en fase de configuración)
                            ctx.fillStyle = "#555555";
                            ctx.fillRect(x + 2, y + 2, game.cellSize - 4, game.cellSize - 4);
                        } else if (cell === 'hit') {
                            // Barco golpeado
                            ctx.fillStyle = "#ff0000";
                            ctx.beginPath();
                            ctx.arc(x + game.cellSize / 2, y + game.cellSize / 2, game.cellSize * 0.3, 0, Math.PI * 2);
                            ctx.fill();
                        } else if (cell === 'miss') {
                            // Disparo al agua
                            ctx.fillStyle = "#ffffff";
                            ctx.beginPath();
                            ctx.arc(x + game.cellSize / 2, y + game.cellSize / 2, game.cellSize * 0.1, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }
            
            // Botón para reiniciar el juego
            if (game.gameOver) {
                const resetY = height - 130;
                const centerX = width / 2;
                
                ctx.fillStyle = "#4caf50";
                this.roundRect(ctx, centerX - 150, resetY, 300, 50, 10, true);
                
                // Efecto hover
                if (this.isMouseOverButton(centerX - 150, resetY, 300, 50)) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                    this.roundRect(ctx, centerX - 150, resetY, 300, 50, 10, true);
                }
                
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 20px Arial";
                ctx.fillText("Jugar de Nuevo", centerX, resetY + 30);
            }
        }
        
        /**
         * Dibujar un rectángulo con bordes redondeados
         */
        roundRect(ctx, x, y, width, height, radius, fill, stroke) {
            if (typeof radius === 'undefined') {
                radius = 5;
            }
            
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            
            if (fill) {
                ctx.fill();
            }
            
            if (stroke) {
                ctx.stroke();
            }
        }
        
        /**
         * Verificar si el mouse está sobre un botón
         */
        isMouseOverButton(x, y, width, height) {
            return (
                this.game.mouseX >= x &&
                this.game.mouseX <= x + width &&
                this.game.mouseY >= y &&
                this.game.mouseY <= y + height
            );
        }
        
        /**
         * Manejar clic del mouse
         */
        onMouseDown() {
            const width = this.game.width;
            const height = this.game.height;
            
            if (this.currentScreen === 'menu') {
                // Comprobar clic en botones del menú
                const startY = 220;
                const centerX = width / 2;
                
                // Botones de juegos
                for (let i = 0; i < this.games.length; i++) {
                    const game = this.games[i];
                    const y = startY + (this.buttonHeight + this.buttonSpacing) * i;
                    
                    if (this.isMouseOverButton(centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight)) {
                        console.log(`Seleccionado juego: ${game.name}`);
                        this.startGame(game.id);
                        return;
                    }
                }
                
                // Botón para volver al mapa
                const backY = height - 70;
                if (this.isMouseOverButton(centerX - 150, backY, 300, 50)) {
                    console.log("Volviendo al mapa");
                    this.game.switchScene('worldMap');
                    return;
                }
            } else if (this.currentScreen === 'game') {
                // Comprobar clic en el botón de volver
                const backY = height - 70;
                const centerX = width / 2;
                
                if (this.isMouseOverButton(centerX - 150, backY, 300, 50)) {
                    console.log("Volviendo al menú");
                    this.currentScreen = 'menu';
                    return;
                }
                
                // Comprobar clics según el juego actual
                if (this.currentGame === 'tictactoe') {
                    this.handleTicTacToeClick();
                } else if (this.currentGame === 'connect4') {
                    this.handleConnect4Click();
                } else if (this.currentGame === 'memory') {
                    this.handleMemoryClick();
                } else if (this.currentGame === 'battleship') {
                    this.handleBattleshipClick();
                }
            }
        }
        
        /**
         * Manejar teclas presionadas
         */
        onKeyDown(key) {
            // Manejar teclas según el juego actual
            if (this.currentScreen === 'game') {
                if (key === 'Escape') {
                    this.currentScreen = 'menu';
                }
                
                if (this.currentGame === 'tictactoe') {
                    // Implementar controles de teclado para Tres en Raya si es necesario
                } else if (this.currentGame === 'connect4') {
                    // Implementar controles de teclado para Conecta 4 si es necesario
                }
            }
        }
        
        /**
         * Iniciar un juego
         */
        startGame(gameId) {
            this.currentScreen = 'game';
            this.currentGame = gameId;
            
            // Cambiar la música según el juego seleccionado
            if (this.game.audioSystem.musicEnabled && this.music[gameId]) {
                // Guardar la música actual del menú para restaurarla al volver
                if (!this.previousGameMusic) {
                    this.previousGameMusic = this.game.audioSystem.currentMusic;
                }
                // Reproducir la música específica del juego
                this.game.playBackgroundMusic(this.music[gameId]);
            }
            
            // Inicializar el juego seleccionado
            if (gameId === 'tictactoe') {
                this.initTicTacToe();
            } else if (gameId === 'connect4') {
                this.initConnect4();
            } else if (gameId === 'memory') {
                this.initMemory();
            } else if (gameId === 'battleship') {
                this.initBattleship();
            }
        }
        
        //=====================================
        // IMPLEMENTACIÓN JUEGO TRES EN RAYA
        //=====================================
        
        /**
         * Inicializar el juego de Tres en Raya
         */
        initTicTacToe() {
            this.tictactoe = {
                board: [null, null, null, null, null, null, null, null, null],
                currentPlayer: 'X',
                winner: null,
                gameOver: false,
                cellSize: 100,
                gridOffset: { x: 0, y: 0 }
            };
        }
        
        /**
         * Manejar clic en el juego de Tres en Raya
         */
        handleTicTacToeClick() {
            const game = this.tictactoe;
            const width = this.game.width;
            const height = this.game.height;
            
            // Si el juego ha terminado, comprobar el botón de reinicio
            if (game.gameOver) {
                const resetY = height - 130;
                const centerX = width / 2;
                
                if (this.isMouseOverButton(centerX - 150, resetY, 300, 50)) {
                    this.initTicTacToe();
                    return;
                }
            }
            
            // Si el juego no ha terminado, comprobar clics en las celdas
            if (!game.gameOver) {
                const offsetX = game.gridOffset.x;
                const offsetY = game.gridOffset.y;
                const cellSize = game.cellSize;
                
                // Determinar en qué celda se ha hecho clic
                for (let i = 0; i < 9; i++) {
                    const col = i % 3;
                    const row = Math.floor(i / 3);
                    const x = offsetX + col * cellSize;
                    const y = offsetY + row * cellSize;
                    
                    if (this.isMouseOverButton(x, y, cellSize, cellSize) && game.board[i] === null) {
                        // Realizar jugada
                        game.board[i] = game.currentPlayer;
                        
                        // Comprobar si hay un ganador
                        const winner = this.checkTicTacToeWinner();
                        if (winner) {
                            game.winner = winner;
                            game.gameOver = true;
                            // Dar puntos al ganador
                            this.game.addPoints(10, 'storyTeller');
                        } else if (!game.board.includes(null)) {
                            // Empate
                            game.gameOver = true;
                        } else {
                            // Cambiar de jugador
                            game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
                        }
                        
                        break;
                    }
                }
            }
        }
        
        /**
         * Comprobar si hay un ganador en el Tres en Raya
         */
        checkTicTacToeWinner() {
            const board = this.tictactoe.board;
            
            // Comprobar filas
            for (let i = 0; i < 9; i += 3) {
                if (board[i] && board[i] === board[i + 1] && board[i] === board[i + 2]) {
                    return board[i];
                }
            }
            
            // Comprobar columnas
            for (let i = 0; i < 3; i++) {
                if (board[i] && board[i] === board[i + 3] && board[i] === board[i + 6]) {
                    return board[i];
                }
            }
            
            // Comprobar diagonales
            if (board[0] && board[0] === board[4] && board[0] === board[8]) {
                return board[0];
            }
            
            if (board[2] && board[2] === board[4] && board[2] === board[6]) {
                return board[2];
            }
            
            return null;
        }
        
        //=====================================
        // IMPLEMENTACIÓN JUEGO CONECTA 4
        //=====================================
        
        /**
         * Inicializar el juego de Conecta 4
         */
        initConnect4() {
            this.connect4 = {
                board: Array(6).fill().map(() => Array(7).fill(null)),
                currentPlayer: 'red',
                winner: null,
                gameOver: false,
                cellSize: 60,
                gridOffset: { x: 0, y: 0 }
            };
        }
        
        /**
         * Manejar clic en el juego de Conecta 4
         */
        handleConnect4Click() {
            const game = this.connect4;
            const width = this.game.width;
            const height = this.game.height;
            
            // Si el juego ha terminado, comprobar el botón de reinicio
            if (game.gameOver) {
                const resetY = height - 130;
                const centerX = width / 2;
                
                if (this.isMouseOverButton(centerX - 150, resetY, 300, 50)) {
                    this.initConnect4();
                    return;
                }
            }
            
            // Si el juego no ha terminado, comprobar clics en las columnas
            if (!game.gameOver) {
                const offsetX = game.gridOffset.x;
                const offsetY = game.gridOffset.y;
                const cellSize = game.cellSize;
                
                // Determinar en qué columna se ha hecho clic
                for (let col = 0; col < 7; col++) {
                    const x = offsetX + col * cellSize;
                    
                    if (this.game.mouseX >= x && this.game.mouseX <= x + cellSize) {
                        // Encontrar la primera posición libre en la columna (de abajo hacia arriba)
                        for (let row = 5; row >= 0; row--) {
                            if (game.board[row][col] === null) {
                                // Realizar jugada
                                game.board[row][col] = game.currentPlayer;
                                
                                // Comprobar si hay un ganador
                                const winner = this.checkConnect4Winner(row, col);
                                if (winner) {
                                    game.winner = winner;
                                    game.gameOver = true;
                                    // Dar puntos al ganador
                                    this.game.addPoints(15, 'storyTeller');
                                } else {
                                    // Comprobar si hay empate
                                    let isFull = true;
                                    for (let c = 0; c < 7; c++) {
                                        if (game.board[0][c] === null) {
                                            isFull = false;
                                            break;
                                        }
                                    }
                                    
                                    if (isFull) {
                                        game.gameOver = true;
                                    } else {
                                        // Cambiar de jugador
                                        game.currentPlayer = game.currentPlayer === 'red' ? 'yellow' : 'red';
                                    }
                                }
                                
                                break;
                            }
                        }
                        
                        break;
                    }
                }
            }
        }
        
        /**
         * Comprobar si hay un ganador en Conecta 4
         */
        checkConnect4Winner(row, col) {
            const board = this.connect4.board;
            const player = board[row][col];
            
            // Verificar horizontal
            let count = 0;
            for (let c = 0; c < 7; c++) {
                if (board[row][c] === player) {
                    count++;
                    if (count >= 4) return player;
                } else {
                    count = 0;
                }
            }
            
            // Verificar vertical
            count = 0;
            for (let r = 0; r < 6; r++) {
                if (board[r][col] === player) {
                    count++;
                    if (count >= 4) return player;
                } else {
                    count = 0;
                }
            }
            
            // Verificar diagonal /
            count = 0;
            let startRow = row;
            let startCol = col;
            while (startRow < 5 && startCol > 0) {
                startRow++;
                startCol--;
            }
            
            for (let i = 0; startRow - i >= 0 && startCol + i < 7; i++) {
                if (board[startRow - i][startCol + i] === player) {
                    count++;
                    if (count >= 4) return player;
                } else {
                    count = 0;
                }
            }
            
            // Verificar diagonal \
            count = 0;
            startRow = row;
            startCol = col;
            while (startRow > 0 && startCol > 0) {
                startRow--;
                startCol--;
            }
            
            for (let i = 0; startRow + i < 6 && startCol + i < 7; i++) {
                if (board[startRow + i][startCol + i] === player) {
                    count++;
                    if (count >= 4) return player;
                } else {
                    count = 0;
                }
            }
            
            return null;
        }
        
        //=====================================
        // IMPLEMENTACIÓN JUEGO DE MEMORIA
        //=====================================
        
        /**
         * Inicializar el juego de Memoria
         */
        initMemory() {
            // Crear las cartas
            const values = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            const cards = [];
            
            // Crear parejas de cartas
            for (let value of values) {
                cards.push({ value, flipped: false, matched: false });
                cards.push({ value, flipped: false, matched: false });
            }
            
            // Mezclar las cartas
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cards[i], cards[j]] = [cards[j], cards[i]];
            }
            
            this.memory = {
                cards: cards,
                flippedCards: [],
                matchedPairs: 0,
                totalPairs: 8,
                currentPlayer: 1,
                scores: [0, 0],
                gameOver: false,
                cardSize: 80,
                gridOffset: { x: 0, y: 0 }
            };
        }
        
        /**
         * Manejar clic en el juego de Memoria
         */
        handleMemoryClick() {
            const game = this.memory;
            const width = this.game.width;
            const height = this.game.height;
            
            // Si el juego ha terminado, comprobar el botón de reinicio
            if (game.gameOver) {
                const resetY = height - 130;
                const centerX = width / 2;
                
                if (this.isMouseOverButton(centerX - 150, resetY, 300, 50)) {
                    this.initMemory();
                    return;
                }
            }
            
            // Si el juego no ha terminado, comprobar clics en las cartas
            if (!game.gameOver) {
                const cols = 4;
                const offsetX = game.gridOffset.x;
                const offsetY = game.gridOffset.y;
                const cardSize = game.cardSize;
                
                // Determinar en qué carta se ha hecho clic
                for (let i = 0; i < game.cards.length; i++) {
                    const card = game.cards[i];
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    const x = offsetX + col * cardSize;
                    const y = offsetY + row * cardSize;
                    
                    if (this.isMouseOverButton(x, y, cardSize, cardSize) && !card.flipped && !card.matched) {
                        // Si ya hay dos cartas volteadas, no permitir voltear más
                        if (game.flippedCards.length >= 2) {
                            return;
                        }
                        
                        // Voltear la carta
                        card.flipped = true;
                        game.flippedCards.push(i);
                        
                        // Si hay dos cartas volteadas, comprobar si son pareja
                        if (game.flippedCards.length === 2) {
                            const card1 = game.cards[game.flippedCards[0]];
                            const card2 = game.cards[game.flippedCards[1]];
                            
                            if (card1.value === card2.value) {
                                // Es una pareja
                                card1.matched = true;
                                card2.matched = true;
                                game.matchedPairs++;
                                
                                // Sumar punto al jugador actual
                                game.scores[game.currentPlayer - 1]++;
                                
                                // Dar puntos en el juego
                                this.game.addPoints(5, 'storyTeller');
                                
                                // Comprobar si se han encontrado todas las parejas
                                if (game.matchedPairs >= game.totalPairs) {
                                    game.gameOver = true;
                                    
                                    // Dar puntos extra al ganador
                                    const winner = game.scores[0] > game.scores[1] ? 0 : 1;
                                    this.game.addPoints(10, 'storyTeller');
                                }
                                
                                // Reiniciar las cartas volteadas
                                game.flippedCards = [];
                            } else {
                                // No es una pareja, esperar un momento y voltearlas de nuevo
                                setTimeout(() => {
                                    card1.flipped = false;
                                    card2.flipped = false;
                                    game.flippedCards = [];
                                    
                                    // Cambiar de jugador
                                    game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
                                }, 1000);
                            }
                        }
                        
                        break;
                    }
                }
            }
        }
        
        //=====================================
        // IMPLEMENTACIÓN HUNDIR LA FLOTA
        //=====================================
        
        /**
         * Inicializar el juego de Hundir la Flota
         */
        initBattleship() {
            this.battleship = {
                boards: [
                    Array(10).fill().map(() => Array(10).fill(null)), // Jugador 1
                    Array(10).fill().map(() => Array(10).fill(null))  // Jugador 2
                ],
                ships: [
                    [], // Jugador 1
                    []  // Jugador 2
                ],
                currentPlayer: 0,
                setupPhase: true,
                selectedShip: null,
                winner: null,
                gameOver: false,
                cellSize: 40,
                gridOffset: { x: 0, y: 0 }
            };
            
            // Colocar barcos automáticamente para simplificar
            this.placeRandomShips(0);
            this.placeRandomShips(1);
            
            // Pasar directamente a la fase de juego
            this.battleship.setupPhase = false;
        }
        
        /**
         * Colocar barcos aleatorios para un jugador
         */
        placeRandomShips(player) {
            const board = this.battleship.boards[player];
            const ships = [5, 4, 3, 3, 2]; // Tamaños de los barcos
            
            for (let shipSize of ships) {
                let placed = false;
                
                while (!placed) {
                    const horizontal = Math.random() < 0.5;
                    const row = Math.floor(Math.random() * (horizontal ? 10 : (11 - shipSize)));
                    const col = Math.floor(Math.random() * (horizontal ? (11 - shipSize) : 10));
                    
                    // Comprobar si se puede colocar el barco
                    let canPlace = true;
                    
                    for (let i = 0; i < shipSize; i++) {
                        const r = horizontal ? row : row + i;
                        const c = horizontal ? col + i : col;
                        
                        if (board[r][c] !== null) {
                            canPlace = false;
                            break;
                        }
                        
                        // Comprobar celdas adyacentes
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                const nr = r + dr;
                                const nc = c + dc;
                                
                                if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] === 'ship') {
                                    canPlace = false;
                                    break;
                                }
                            }
                            if (!canPlace) break;
                        }
                        
                        if (!canPlace) break;
                    }
                    
                    if (canPlace) {
                        // Colocar el barco
                        for (let i = 0; i < shipSize; i++) {
                            const r = horizontal ? row : row + i;
                            const c = horizontal ? col + i : col;
                            board[r][c] = 'ship';
                        }
                        
                        // Añadir el barco a la lista
                        this.battleship.ships[player].push({
                            size: shipSize,
                            hits: 0,
                            horizontal,
                            row,
                            col
                        });
                        
                        placed = true;
                    }
                }
            }
        }
        
        /**
         * Manejar clic en el juego de Hundir la Flota
         */
        handleBattleshipClick() {
            const game = this.battleship;
            const width = this.game.width;
            const height = this.game.height;
            
            // Si el juego ha terminado, comprobar el botón de reinicio
            if (game.gameOver) {
                const resetY = height - 130;
                const centerX = width / 2;
                
                if (this.isMouseOverButton(centerX - 150, resetY, 300, 50)) {
                    this.initBattleship();
                    return;
                }
            }
            
            // Si el juego no ha terminado y no estamos en fase de configuración
            if (!game.gameOver && !game.setupPhase) {
                const cellSize = game.cellSize;
                const opponentPlayer = game.currentPlayer === 0 ? 1 : 0;
                const offsetX = game.gridOffset[opponentPlayer].x;
                const offsetY = game.gridOffset[opponentPlayer].y;
                
                // Comprobar si se ha hecho clic en el tablero del oponente
                if (this.game.mouseX >= offsetX && this.game.mouseX <= offsetX + cellSize * 10 &&
                    this.game.mouseY >= offsetY && this.game.mouseY <= offsetY + cellSize * 10) {
                    
                    const col = Math.floor((this.game.mouseX - offsetX) / cellSize);
                    const row = Math.floor((this.game.mouseY - offsetY) / cellSize);
                    
                    // Comprobar si ya se ha disparado a esta celda
                    if (game.boards[opponentPlayer][row][col] === 'hit' || game.boards[opponentPlayer][row][col] === 'miss') {
                        return;
                    }
                    
                    // Realizar disparo
                    if (game.boards[opponentPlayer][row][col] === 'ship') {
                        // Impacto
                        game.boards[opponentPlayer][row][col] = 'hit';
                        
                        // Actualizar barco impactado
                        for (let ship of game.ships[opponentPlayer]) {
                            let shipHit = false;
                            
                            for (let i = 0; i < ship.size; i++) {
                                const r = ship.horizontal ? ship.row : ship.row + i;
                                const c = ship.horizontal ? ship.col + i : ship.col;
                                
                                if (r === row && c === col) {
                                    ship.hits++;
                                    shipHit = true;
                                    break;
                                }
                            }
                            
                            if (shipHit && ship.hits === ship.size) {
                                // Barco hundido
                                this.game.addPoints(5, 'storyTeller');
                                
                                // Comprobar si todos los barcos están hundidos
                                let allSunk = true;
                                for (let s of game.ships[opponentPlayer]) {
                                    if (s.hits < s.size) {
                                        allSunk = false;
                                        break;
                                    }
                                }
                                
                                if (allSunk) {
                                    game.winner = game.currentPlayer;
                                    game.gameOver = true;
                                    this.game.addPoints(20, 'storyTeller');
                                }
                            }
                        }
                    } else {
                        // Agua
                        game.boards[opponentPlayer][row][col] = 'miss';
                        
                        // Cambiar de jugador
                        game.currentPlayer = opponentPlayer;
                        
                        // IA simple para el oponente
                        if (!game.gameOver) {
                            setTimeout(() => {
                                this.computerTurn();
                            }, 500);
                        }
                    }
                }
            }
        }
        
        /**
         * Turno del ordenador en Hundir la Flota
         */
        computerTurn() {
            const game = this.battleship;
            const player = game.currentPlayer === 0 ? 1 : 0; // Jugador objetivo
            
            // Elegir una celda aleatoria que no haya sido disparada
            let row, col;
            let validMove = false;
            
            while (!validMove) {
                row = Math.floor(Math.random() * 10);
                col = Math.floor(Math.random() * 10);
                
                if (game.boards[player][row][col] !== 'hit' && game.boards[player][row][col] !== 'miss') {
                    validMove = true;
                }
            }
            
            // Realizar disparo
            if (game.boards[player][row][col] === 'ship') {
                // Impacto
                game.boards[player][row][col] = 'hit';
                
                // Actualizar barco impactado
                for (let ship of game.ships[player]) {
                    let shipHit = false;
                    
                    for (let i = 0; i < ship.size; i++) {
                        const r = ship.horizontal ? ship.row : ship.row + i;
                        const c = ship.horizontal ? ship.col + i : ship.col;
                        
                        if (r === row && c === col) {
                            ship.hits++;
                            shipHit = true;
                            break;
                        }
                    }
                    
                    if (shipHit && ship.hits === ship.size) {
                        // Barco hundido
                        
                        // Comprobar si todos los barcos están hundidos
                        let allSunk = true;
                        for (let s of game.ships[player]) {
                            if (s.hits < s.size) {
                                allSunk = false;
                                break;
                            }
                        }
                        
                        if (allSunk) {
                            game.winner = game.currentPlayer;
                            game.gameOver = true;
                        }
                    }
                }
            } else {
                // Agua
                game.boards[player][row][col] = 'miss';
                
                // Cambiar de jugador
                game.currentPlayer = player;
            }
        }
}