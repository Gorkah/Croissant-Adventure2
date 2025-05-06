/**
 * Main Game Engine
 * Handles the game loop, scene management, and input
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 1200;
        this.height = 800;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Input handling
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        
        // Scene management
        this.scenes = {};
        this.currentScene = null;
        
        // Points system
        this.playerScore = 0;
        this.playerCoins = 0;
        this.achievements = {
            minigamesPlayed: 0,
            coinsCollected: 0,
            chessMoves: 0,
            mazeCompleted: false,
            shooterHighscore: 0
        };
        
        // Set up inputs
        this.setupInputs();
        
        // Load assets
        this.loadAssets();
    }
    
    /**
     * Set up input event listeners
     */
    setupInputs() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            // Verificar si el foco está en un elemento de entrada de texto
            const isInputFocused = document.activeElement && 
                (document.activeElement.tagName === 'INPUT' || 
                 document.activeElement.tagName === 'TEXTAREA' || 
                 document.activeElement.isContentEditable);
                 
            console.log('Key pressed:', e.key, 'Input focused:', isInputFocused);
            
            // Solo capturar teclas si no hay un elemento de entrada con foco
            if (!isInputFocused) {
                this.keys[e.key.toLowerCase()] = true;
                // Prevent default browser behavior for arrow keys and WASD
                if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'e'].includes(e.key.toLowerCase())) {
                    e.preventDefault();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            // Verificar si el foco está en un elemento de entrada de texto
            const isInputFocused = document.activeElement && 
                (document.activeElement.tagName === 'INPUT' || 
                 document.activeElement.tagName === 'TEXTAREA' || 
                 document.activeElement.isContentEditable);
                 
            this.keys[e.key.toLowerCase()] = false;
            
            // Solo prevenir comportamiento predeterminado si no hay un elemento de entrada con foco
            if (!isInputFocused) {
                if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'e'].includes(e.key.toLowerCase())) {
                    e.preventDefault();
                }
            }
        });
        
        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            // Calcular coordenadas precisas considerando el escalado del canvas
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;    // Factor de escala en X
            const scaleY = this.canvas.height / rect.height;  // Factor de escala en Y
            
            // Coordenadas ajustadas por el escalado
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            // Recalcular en caso de que mousemove no se haya activado
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
            
            console.log('Mouse clicked at:', this.mouseX, this.mouseY);
            this.mouseDown = true;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
    }
    
    /**
     * Load game assets
     */
    loadAssets() {
        // Create a simple debug function
        const logAsset = (name, obj) => {
            console.log(`Loading asset: ${name}`, obj ? 'loaded' : 'failed');
        };

        // Load croissant character with better appearance
        this.croissantImage = new Image();
        this.croissantImage.onload = () => logAsset('Croissant', true);
        this.croissantImage.onerror = () => logAsset('Croissant', false);
        // Better croissant shape with SVG
        this.croissantImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M10,25 C8,20 10,15 15,10 C20,5 30,5 35,10 C25,10 20,10 15,15 C10,20 15,25 20,25 C25,25 30,20 35,15 C30,25 20,30 10,25 Z" fill="%23e6b266" stroke="%23966f33" stroke-width="1.5"/><circle cx="13" cy="15" r="1" fill="%23966f33"/><circle cx="18" cy="13" r="1" fill="%23966f33"/></svg>';
        
        // Load basic tileset with better graphics
        this.tilesetImage = new Image();
        this.tilesetImage.onload = () => logAsset('Tileset', true);
        this.tilesetImage.onerror = () => logAsset('Tileset', false);
        // A nicer colored grid as tileset
        this.tilesetImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="40" height="40" fill="%234a6c2a"/><path d="M0,0 L40,0 L40,40 L0,40 Z M0,10 L40,10 M0,20 L40,20 M0,30 L40,30 M10,0 L10,40 M20,0 L20,40 M30,0 L30,40" stroke="%235a7c3a" stroke-width="1"/><rect x="40" width="40" height="40" fill="%238B4513"/><path d="M40,0 L80,0 L80,40 L40,40 Z M40,8 L80,8 M40,16 L80,16 M40,24 L80,24 M40,32 L80,32 M48,0 L48,40 M56,0 L56,40 M64,0 L64,40 M72,0 L72,40" stroke="%23654321" stroke-width="1"/></svg>';
        
        // Load UI elements
        this.uiElements = new Image();
        this.uiElements.onload = () => logAsset('UI Elements', true);
        this.uiElements.onerror = () => logAsset('UI Elements', false);
        // Better UI elements with SVG
        this.uiElements.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><rect width="200" height="50" rx="10" ry="10" fill="%23ff9900" stroke="%23cc7700" stroke-width="2"/><text x="100" y="30" font-family="Arial" font-size="18" text-anchor="middle" fill="white">Button</text></svg>';
    }
    
    /**
     * Register a scene with the game
     * @param {string} name - Name of the scene
     * @param {Scene} scene - Scene object
     */
    registerScene(name, scene) {
        this.scenes[name] = scene;
    }
    
    /**
     * Switch to a different scene
     * @param {string} name - Name of the scene to switch to
     */
    switchScene(name) {
        if (this.scenes[name]) {
            if (this.currentScene) {
                this.currentScene.exit();
            }
            this.currentScene = this.scenes[name];
            this.currentScene.enter();
        }
    }
    
    /**
     * Add points to player score
     * @param {number} points - Points to add
     * @param {string} source - Source of the points (for tracking)
     */
    addPoints(points, source) {
        this.playerScore += points;
        console.log(`Added ${points} points from ${source}. Total: ${this.playerScore}`);
        
        // Update achievements
        if (source === 'coin') {
            this.playerCoins++;
            this.achievements.coinsCollected++;
        } else if (source === 'minigame') {
            this.achievements.minigamesPlayed++;
        } else if (source === 'chess') {
            this.achievements.chessMoves++;
        } else if (source === 'maze') {
            this.achievements.mazeCompleted = true;
        } else if (source === 'shooter') {
            this.achievements.shooterHighscore = Math.max(this.achievements.shooterHighscore, points);
        }
    }
    
    /**
     * Start the game
     */
    start() {
        try {
            console.log('Starting game and registering scenes...');
            // Register scenes
            this.registerScene('mainMenu', new MainMenuScene(this));
            console.log('MainMenuScene registered');
            
            this.registerScene('worldMap', new WorldMapScene(this));
            console.log('WorldMapScene registered');
            
            this.registerScene('coinCollector', new CoinCollectorMinigame(this));
            console.log('CoinCollectorMinigame registered');
            
            this.registerScene('roulette', new RouletteMinigame(this));
            console.log('RouletteMinigame registered');
            
            this.registerScene('chess', new ChessMinigame(this));
            console.log('ChessMinigame registered');
            
            // New minigames - wrapped in try-catch blocks to prevent errors
            try {
                if (typeof MazeMinigame !== 'undefined') {
                    this.registerScene('maze', new MazeMinigame(this));
                    console.log('MazeMinigame registered');
                } else {
                    console.error('MazeMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering MazeMinigame:', e);
            }
            
            try {
                if (typeof ShooterMinigame !== 'undefined') {
                    this.registerScene('shooter', new ShooterMinigame(this));
                    console.log('ShooterMinigame registered');
                } else {
                    console.error('ShooterMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering ShooterMinigame:', e);
            }
            
            // Register new minigames
            try {
                if (typeof PlatformMinigame !== 'undefined') {
                    this.registerScene('platform', new PlatformMinigame(this));
                    console.log('PlatformMinigame registered');
                } else {
                    console.error('PlatformMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering PlatformMinigame:', e);
            }
            
            try {
                if (typeof MemoryMinigame !== 'undefined') {
                    this.registerScene('memory', new MemoryMinigame(this));
                    console.log('MemoryMinigame registered');
                } else {
                    console.error('MemoryMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering MemoryMinigame:', e);
            }
            
            try {
                if (typeof SnakeMinigame !== 'undefined') {
                    this.registerScene('snake', new SnakeMinigame(this));
                    console.log('SnakeMinigame registered');
                } else {
                    console.error('SnakeMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering SnakeMinigame:', e);
            }
            
            try {
                if (typeof PuzzleMinigame !== 'undefined') {
                    this.registerScene('puzzle', new PuzzleMinigame(this));
                    console.log('PuzzleMinigame registered');
                } else {
                    console.error('PuzzleMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering PuzzleMinigame:', e);
            }
            
            try {
                if (typeof RhythmMinigame !== 'undefined') {
                    this.registerScene('rhythm', new RhythmMinigame(this));
                    console.log('RhythmMinigame registered');
                } else {
                    console.error('RhythmMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering RhythmMinigame:', e);
            }
            
            // Register Tower Defense minigame
            try {
                if (typeof TowerDefenseMinigame !== 'undefined') {
                    this.registerScene('towerDefense', new TowerDefenseMinigame(this));
                    console.log('TowerDefenseMinigame registered');
                } else {
                    console.error('TowerDefenseMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering TowerDefenseMinigame:', e);
            }
            
            // Registrar Paint Game minigame
            try {
                if (typeof PaintGameMinigame !== 'undefined') {
                    this.registerScene('paintGame', new PaintGameMinigame(this));
                    console.log('PaintGameMinigame registered');
                } else {
                    console.error('PaintGameMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering PaintGameMinigame:', e);
            }
            
            // Registrar Trivia Game minigame
            try {
                if (typeof TriviaGameMinigame !== 'undefined') {
                    this.registerScene('triviaGame', new TriviaGameMinigame(this));
                    console.log('TriviaGameMinigame registered');
                } else {
                    console.error('TriviaGameMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering TriviaGameMinigame:', e);
            }
            
            // Registrar Admin Panel minigame
            try {
                if (typeof AdminPanel !== 'undefined') {
                    this.registerScene('adminPanel', new AdminPanel(this));
                    console.log('AdminPanel registered');
                } else {
                    console.error('AdminPanel class is not defined');
                }
            } catch (e) {
                console.error('Error registering AdminPanel:', e);
            }
            
            // Start with main menu
            console.log('Switching to main menu scene');
            this.switchScene('mainMenu');
            
            // Start game loop
            this.lastTime = 0;
            requestAnimationFrame(this.gameLoop.bind(this));
        } catch (e) {
            console.error('Critical error starting game:', e);
            // Display error on screen
            const ctx = this.canvas.getContext('2d');
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = '#ff0000';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Error loading game: ' + e.message, this.width / 2, this.height / 2);
            ctx.fillText('Check console for details', this.width / 2, this.height / 2 + 40);
        }
    }
    
    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp
     */
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = this.lastTime ? (timestamp - this.lastTime) / 1000 : 0;
        this.lastTime = timestamp;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update and render current scene
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
            this.currentScene.render(this.ctx);
        }
        
        // Continue the loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Check if a key is currently pressed
     * @param {string} key - Key to check
     * @returns {boolean} - True if the key is pressed
     */
    isKeyPressed(key) {
        // Debugging to help diagnose key issues
        if (key === 'w' || key === 'a' || key === 's' || key === 'd' || 
            key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
            if (this.keys[key.toLowerCase()] === true) {
                console.log(`Key pressed: ${key}`);
            }
        }
        return this.keys[key.toLowerCase()] === true;
    }
}
