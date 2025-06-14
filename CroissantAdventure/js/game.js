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
        
        // Audio system
        this.audioSystem = {
            musicEnabled: true,
            sfxEnabled: true,
            backgroundMusic: null,
            currentMusic: null,
            volume: 0.3 // Volumen por defecto
        };
        
        // Sistema de control parental
        this.parentalControl = {
            timeTracking: {
                sessionStart: new Date(),
                totalPlayTime: 0, // en minutos
                lastSaved: new Date(),
                sessionsPlayed: 0,
                dailyLimitMinutes: 60 // límite diario en minutos
            },
            minigamesPlayed: {}, // registro de minijuegos jugados
            lastLogin: new Date()
        };
        
        // Firebase status
        this.firebaseReady = false;
        this.syncWithFirebase = false;
        
        // Cargar datos de control parental si existen
        this.loadParentalControls();
        
        // Set up inputs
        this.setupInputs();
        
        // Load assets
        this.loadAssets();
        
        // Inicializar Firebase y cargar datos del usuario
        this.initializeFirebase();
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
        
        // Mouse events
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
            // Recalcular coordenadas en caso de que mousemove no se haya activado
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
            this.mouseDown = true;
            // Comprobar si se ha hecho clic en el botón de música
            const musicBtnX = this.width - 40;
            const musicBtnY = 20;
            const musicBtnRadius = 15;
            const dx = this.mouseX - musicBtnX;
            const dy = this.mouseY - musicBtnY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= musicBtnRadius) {
                // Toggle de música
                const musicEnabled = this.toggleBackgroundMusic();
                console.log(`Música ${musicEnabled ? 'activada' : 'desactivada'}`);
                return;
            }
            
            // Pass mouse event to current scene if it has a handler
            if (this.currentScene && this.currentScene.onMouseDown) {
                this.currentScene.onMouseDown();
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            // Actualizar coordenadas del ratón al soltar
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
            
            this.mouseDown = false;
            
            // Propagar el evento a la escena actual si existe el método
            if (this.currentScene && typeof this.currentScene.onMouseUp === 'function') {
                this.currentScene.onMouseUp();
            }
        });
        
        // Asegurar que mouseDown se resetea si el cursor sale del canvas
        this.canvas.addEventListener('mouseleave', () => {
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

        // Obtener el personaje y outfit seleccionados
        const selectedCharacter = localStorage.getItem('selectedCharacter') || 'croiso';
        const selectedOutfit = localStorage.getItem('selectedOutfit') || '1';
        
        console.log(`Cargando personaje: ${selectedCharacter} con outfit: ${selectedOutfit}`);
        
        // Cargar imágenes de personajes con el outfit seleccionado
        // Croiso (personaje masculino)
        this.croisoImage = new Image();
        this.croisoImage.onload = () => logAsset(`Croiso outfit ${selectedOutfit}`, true);
        this.croisoImage.onerror = () => {
            logAsset(`Croiso outfit ${selectedOutfit}`, false);
            // Cargar imagen por defecto si falla
            this.croisoImage.src = 'croiso.png';
        };
        this.croisoImage.src = `croiso_outfit${selectedOutfit}.png`;
        
        // Croisa (personaje femenino)
        this.croisaImage = new Image();
        this.croisaImage.onload = () => logAsset(`Croisa outfit ${selectedOutfit}`, true);
        this.croisaImage.onerror = () => {
            logAsset(`Croisa outfit ${selectedOutfit}`, false);
            // Cargar imagen por defecto si falla
            this.croisaImage.src = 'croisa.png';
        };
        this.croisaImage.src = `croisa_outfit${selectedOutfit}.png`;
        
        // Mantener compatibilidad con código existente
        this.croissantImage = selectedCharacter === 'croiso' ? this.croisoImage : this.croisaImage;
        
        // Load basic tileset with better graphics
        this.tilesetImage = new Image();
        this.tilesetImage.onload = () => logAsset('Tileset', true);
        this.tilesetImage.onerror = () => logAsset('Tileset', false);
        // A nicer colored grid as tileset
        this.tilesetImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="40" height="40" fill="%234a6c2a"/><path d="M0,0 L40,0 L40,40 L0,40 Z M0,10 L40,10 M0,20 L40,20 M0,30 L40,30 M10,0 L10,40 M20,0 L20,40 M30,0 L30,40 M72,0 L72,40" stroke="%235a7c3a" stroke-width="1"/><rect x="40" width="40" height="40" fill="%238B4513"/><path d="M40,0 L80,0 L80,40 L40,40 Z M40,8 L80,8 M40,16 L80,16 M40,24 L80,24 M40,32 L80,32 M48,0 L48,40 M56,0 L56,40 M64,0 L64,40 M72,0 L72,40" stroke="%23654321" stroke-width="1"/></svg>';
        
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
            // Guardar el estado de la música actual
            const wasPlayingMusic = this.audioSystem.backgroundMusic !== null;
            const currentMusicPath = this.audioSystem.currentMusic;
            
            if (this.currentScene) {
                this.currentScene.exit();
            }
            
            this.currentScene = this.scenes[name];
            this.currentScene.enter();
            
            // Si la música estaba sonando y se detuvo durante el cambio, reiniciarla
            if (wasPlayingMusic && this.audioSystem.backgroundMusic === null && this.audioSystem.musicEnabled) {
                this.playBackgroundMusic(currentMusicPath);
            }
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
            // Sincronizar con Firebase
            if (this.syncWithFirebase && window.firebaseGameUtils) {
                window.firebaseGameUtils.logPlayerAchievement('coinsCollected', this.achievements.coinsCollected);
            }
        } else if (source === 'minigame') {
            this.achievements.minigamesPlayed++;
            // Sincronizar con Firebase
            if (this.syncWithFirebase && window.firebaseGameUtils) {
                window.firebaseGameUtils.logPlayerAchievement('minigamesPlayed', this.achievements.minigamesPlayed);
            }
        } else if (source === 'chess') {
            this.achievements.chessMoves++;
            // Sincronizar con Firebase
            if (this.syncWithFirebase && window.firebaseGameUtils) {
                window.firebaseGameUtils.logPlayerAchievement('chessMoves', this.achievements.chessMoves);
            }
        } else if (source === 'maze') {
            this.achievements.mazeCompleted = true;
            // Sincronizar con Firebase
            if (this.syncWithFirebase && window.firebaseGameUtils) {
                window.firebaseGameUtils.logPlayerAchievement('mazeCompleted', true);
            }
        } else if (source === 'shooter') {
            this.achievements.shooterHighscore = Math.max(this.achievements.shooterHighscore, points);
            // Sincronizar con Firebase
            if (this.syncWithFirebase && window.firebaseGameUtils) {
                window.firebaseGameUtils.logPlayerAchievement('shooterHighscore', this.achievements.shooterHighscore);
            }
        }
        
        // Actualizar puntuación en Firebase
        if (this.syncWithFirebase && window.firebaseGameUtils) {
            window.firebaseGameUtils.updatePlayerScore(this.playerScore, source)
                .then(success => {
                    if (success) {
                        console.log('Puntuación sincronizada con Firebase');
                    }
                })
                .catch(error => {
                    console.error('Error al sincronizar puntuación:', error);
                });
        }
    }
    
    /**
     * Cargar y reproducir música de fondo
     * @param {string} musicPath - Ruta al archivo de audio
     * @param {boolean} loop - Si la música debe repetirse
     */
    playBackgroundMusic(musicPath, loop = true) {
        // Si la música está desactivada, no hacer nada
        if (!this.audioSystem.musicEnabled) return;
        
        // Si ya hay música sonando, detenerla
        this.stopBackgroundMusic();
        
        // Crear nuevo elemento de audio
        const audio = new Audio(musicPath);
        audio.loop = loop;
        audio.volume = this.audioSystem.volume; // Usar el volumen configurado
        
        // Guardar referencia a la música actual
        this.audioSystem.backgroundMusic = audio;
        this.audioSystem.currentMusic = musicPath;
        
        // Reproducir música
        audio.play().catch(error => {
            console.warn('Error al reproducir música de fondo:', error);
        });
    }
    
    /**
     * Detener la música de fondo
     */
    stopBackgroundMusic() {
        if (this.audioSystem.backgroundMusic) {
            this.audioSystem.backgroundMusic.pause();
            this.audioSystem.backgroundMusic = null;
        }
    }
    
    /**
     * Método simplificado para reproducir música por nombre (para compatibilidad con minijuegos)
     * @param {string} musicName - Nombre de la música a reproducir (sin extensión)
     */
    playMusic(musicName) {
        const musicPath = `assets/music/${musicName}.mp3`;
        this.playBackgroundMusic(musicPath);
    }
    
    /**
     * Detener la música actual (alias para compatibilidad)
     */
    stopMusic() {
        this.stopBackgroundMusic();
    }
    
    /**
     * Activar/desactivar la música de fondo
     * @returns {boolean} - Estado actual de la música (true = activada)
     */
    toggleBackgroundMusic() {
        this.audioSystem.musicEnabled = !this.audioSystem.musicEnabled;
        
        if (this.audioSystem.musicEnabled) {
            // Si hay una música guardada, reproducirla
            if (this.audioSystem.currentMusic) {
                this.playBackgroundMusic(this.audioSystem.currentMusic);
            }
        } else {
            // Detener la música actual
            this.stopBackgroundMusic();
        }
        
        // Guardar preferencias de audio
        this.saveAudioSettings();
        
        return this.audioSystem.musicEnabled;
    }
    
    /**
     * Establecer el volumen de la música de fondo
     * @param {number} volume - Volumen entre 0.0 y 1.0
     */
    setMusicVolume(volume) {
        // Asegurar que el volumen está entre 0 y 1
        volume = Math.max(0, Math.min(1, volume));
        this.audioSystem.volume = volume;
        
        // Aplicar a la música actual si está sonando
        if (this.audioSystem.backgroundMusic) {
            this.audioSystem.backgroundMusic.volume = volume;
        }
        
        // Guardar preferencias de audio
        this.saveAudioSettings();
        
        return volume;
    }
    
    /**
     * Guardar configuración de audio en localStorage
     */
    saveAudioSettings() {
        const audioSettings = {
            musicEnabled: this.audioSystem.musicEnabled,
            sfxEnabled: this.audioSystem.sfxEnabled,
            volume: this.audioSystem.volume
        };
        
        localStorage.setItem('croissantAdventure_audioSettings', JSON.stringify(audioSettings));
    }
    
    /**
     * Cargar configuración de audio desde localStorage
     */
    loadAudioSettings() {
        const savedSettings = localStorage.getItem('croissantAdventure_audioSettings');
        
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.audioSystem.musicEnabled = settings.musicEnabled;
                this.audioSystem.sfxEnabled = settings.sfxEnabled;
                this.audioSystem.volume = settings.volume;
            } catch (error) {
                console.warn('Error al cargar configuración de audio:', error);
            }
        }
    }
    
    /**
     * Guardar datos de control parental
     */
    saveParentalControls() {
        // Actualizar tiempo de juego antes de guardar
        this.updatePlayTime();
        
        const parentalData = {
            timeTracking: this.parentalControl.timeTracking,
            minigamesPlayed: this.parentalControl.minigamesPlayed,
            lastLogin: new Date().toISOString()
        };
        
        // Guardar en localStorage
        localStorage.setItem('croissantAdventure_parentalControl', JSON.stringify(parentalData));
        
        // Guardar en Firebase si está disponible
        if (this.syncWithFirebase) {
            // Guardar todos los datos del jugador, incluyendo control parental
            this.saveGameDataToFirebase();
        }
    }
    
    /**
     * Cargar datos de control parental
     */
    loadParentalControls() {
        const savedData = localStorage.getItem('croissantAdventure_parentalControl');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Convertir strings de fecha a objetos Date
                if (data.timeTracking) {
                    data.timeTracking.sessionStart = new Date();
                    data.timeTracking.lastSaved = new Date(data.timeTracking.lastSaved);
                    this.parentalControl.timeTracking = data.timeTracking;
                }
                
                if (data.minigamesPlayed) {
                    this.parentalControl.minigamesPlayed = data.minigamesPlayed;
                }
                
                this.parentalControl.lastLogin = data.lastLogin ? new Date(data.lastLogin) : new Date();
                
                // Iniciar nueva sesión
                this.parentalControl.timeTracking.sessionStart = new Date();
                this.parentalControl.timeTracking.sessionsPlayed++;
                
            } catch (error) {
                console.warn('Error al cargar datos de control parental:', error);
            }
        }
        
        // Cargar también configuración de audio
        this.loadAudioSettings();
    }
    
    /**
     * Actualizar tiempo de juego
     */
    updatePlayTime() {
        const now = new Date();
        const sessionTime = (now - this.parentalControl.timeTracking.sessionStart) / (1000 * 60); // en minutos
        
        this.parentalControl.timeTracking.totalPlayTime += sessionTime;
        this.parentalControl.timeTracking.lastSaved = now;
        this.parentalControl.timeTracking.sessionStart = now; // Reiniciar para la próxima actualización
        
        return {
            sessionTime: sessionTime.toFixed(2),
            totalPlayTime: this.parentalControl.timeTracking.totalPlayTime.toFixed(2)
        };
    }
    
    /**
     * Registrar juego de un minijuego
     * @param {string} minigameName - Nombre del minijuego
     */
    logMinigamePlayed(minigameName) {
        if (!this.parentalControl.minigamesPlayed[minigameName]) {
            this.parentalControl.minigamesPlayed[minigameName] = {
                timesPlayed: 0,
                lastPlayed: null,
                totalTimeSpent: 0 // en minutos
            };
        }
        
        this.parentalControl.minigamesPlayed[minigameName].timesPlayed++;
        this.parentalControl.minigamesPlayed[minigameName].lastPlayed = new Date().toISOString();
        
        // Actualizar estadísticas generales
        this.achievements.minigamesPlayed++;
        
        // Sincronizar con Firebase si está disponible
        if (this.syncWithFirebase && window.firebaseGameUtils) {
            window.firebaseGameUtils.logPlayerAchievement('minigamesPlayed', this.achievements.minigamesPlayed);
        }
        
        // Guardar datos actualizados
        this.saveParentalControls();
    }
    
    /**
     * Inicializar Firebase y cargar datos del usuario
     */
    async initializeFirebase() {
        try {
            // Verificar si está disponible firebaseGameUtils
            if (!window.firebaseGameUtils) {
                console.warn('Las utilidades de Firebase no están disponibles');
                this.firebaseReady = false;
                this.syncWithFirebase = false;
                return;
            }
            
            // Inicializar Firebase
            const initialized = window.firebaseGameUtils.initializeFirebaseGame();
            if (!initialized) {
                console.warn('No se pudo inicializar Firebase');
                return;
            }
            
            // Obtener nombre de usuario del localStorage
            const username = localStorage.getItem('playerName');
            if (!username) {
                console.warn('No hay usuario logueado para sincronizar con Firebase');
                return;
            }
            
            // Configurar nombre de usuario para Firebase
            window.firebaseGameUtils.setUsername(username);
            
            // Inicializar autenticación de Firebase
            const user = await window.firebaseGameUtils.initializeFirebaseAuth();
            
            if (user) {
                console.log('Usuario autenticado en Firebase:', user.uid);
                this.firebaseReady = true;
                this.syncWithFirebase = true;
                
                // Cargar datos del jugador desde Firebase
                await this.loadGameDataFromFirebase();
            } else {
                // Si no hay autenticación pero tenemos usuario en localStorage,
                // intentamos cargar datos de todas formas (modo sin conexión)
                console.log('Usando Firebase en modo sin autenticación');
                this.firebaseReady = true;
                this.syncWithFirebase = true;
                
                // Cargar datos del jugador desde Firebase
                await this.loadGameDataFromFirebase();
            }
        } catch (error) {
            console.error('Error al inicializar Firebase:', error);
            this.firebaseReady = false;
            this.syncWithFirebase = false;
        }
    }
    
    /**
     * Guardar datos del juego en Firebase
     */
    async saveGameDataToFirebase() {
        if (!this.syncWithFirebase || !window.firebaseGameUtils) {
            return false;
        }
        
        try {
            // Preparar datos del juego para guardar
            const gameData = {
                playerScore: this.playerScore,
                playerCoins: this.playerCoins,
                achievements: this.achievements,
                parentalControl: this.parentalControl
            };
            
            // Guardar datos en Firebase
            const success = await window.firebaseGameUtils.savePlayerData(gameData);
            return success;
        } catch (error) {
            console.error('Error al guardar datos del juego en Firebase:', error);
            return false;
        }
    }
    
    /**
     * Cargar datos del juego desde Firebase
     */
    async loadGameDataFromFirebase() {
        if (!this.syncWithFirebase || !window.firebaseGameUtils) {
            return false;
        }
        
        try {
            // Cargar datos desde Firebase
            const gameData = await window.firebaseGameUtils.loadPlayerData();
            
            if (gameData) {
                console.log('Datos cargados desde Firebase:', gameData);
                
                // Actualizar datos del juego con los datos cargados
                this.playerScore = gameData.playerScore;
                this.playerCoins = gameData.playerCoins;
                
                // Actualizar logros, manteniendo los que ya existen
                if (gameData.achievements) {
                    this.achievements = {
                        ...this.achievements,
                        ...gameData.achievements
                    };
                }
                
                // Actualizar control parental si existe
                if (gameData.parentalControl) {
                    // Mantener la sesión actual
                    const currentSession = this.parentalControl.timeTracking.sessionStart;
                    
                    this.parentalControl = {
                        ...this.parentalControl,
                        ...gameData.parentalControl
                    };
                    
                    // Restaurar la sesión actual
                    this.parentalControl.timeTracking.sessionStart = currentSession;
                }
                
                console.log('Datos del juego actualizados con Firebase');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error al cargar datos del juego desde Firebase:', error);
            return false;
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
            
            // Iniciar música de fondo para todo el juego
            try {
                // Usamos uno de los archivos de música existentes
                this.playBackgroundMusic('assets/audio/future-design-344320.mp3');
                console.log('Música de fondo iniciada con éxito');
            } catch (e) {
                console.warn('No se pudo iniciar la música de fondo:', e);
                // Intentar con el segundo archivo de música como respaldo
                try {
                    this.playBackgroundMusic('assets/audio/jungle-waves-drumampbass-electronic-inspiring-promo-345013.mp3');
                    console.log('Música de fondo alternativa iniciada con éxito');
                } catch (err) {
                    console.error('No se pudo iniciar ninguna música de fondo:', err);
                }
            }
            
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
                    // Registrar la versión normal
                    const normalPlatform = new PlatformMinigame(this);
                    normalPlatform.isLavaVersion = false; // Explícitamente establecer a false
                    this.registerScene('platform', normalPlatform);
                    console.log('PlatformMinigame registered');
                } else {
                    console.error('PlatformMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering normal PlatformMinigame:', e);
            }
            
            // Registro del Platform Lava (completamente separado)
            try {
                if (typeof PlatformLavaMinigame !== 'undefined') {
                    this.registerScene('platform_lava', new PlatformLavaMinigame(this));
                    console.log('PlatformLavaMinigame (Lava version) registered');
                } else {
                    console.error('PlatformLavaMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering PlatformLavaMinigame:', e);
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
            
            // Registro de Pescador Pastelero
            try {
                if (typeof FishingMinigame !== 'undefined') {
                    this.registerScene('fishing', new FishingMinigame(this));
                    console.log('FishingMinigame registered');
                } else {
                    console.error('FishingMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering FishingMinigame:', e);
            }
            
            // Registro de Surfista Glaseado
            try {
                if (typeof SurfingMinigame !== 'undefined') {
                    this.registerScene('surfing', new SurfingMinigame(this));
                    console.log('SurfingMinigame registered');
                } else {
                    console.error('SurfingMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering SurfingMinigame:', e);
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
            
            // Registrar Carrera de Fondant Ardiente (Racing)
            try {
                if (typeof RacingMinigame !== 'undefined') {
                    this.registerScene('racing', new RacingMinigame(this));
                    console.log('RacingMinigame registered');
                } else {
                    console.error('RacingMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering RacingMinigame:', e);
            }
            
            // Registrar Explorador de Cristales Dulces (Cave Explorer)
            try {
                if (typeof CaveExplorerMinigame !== 'undefined') {
                    this.registerScene('caveExplorer', new CaveExplorerMinigame(this));
                    console.log('CaveExplorerMinigame registered');
                } else {
                    console.error('CaveExplorerMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering CaveExplorerMinigame:', e);
            }
            
            // Registrar Tutorial del juego
            try {
                if (typeof TutorialMinigame !== 'undefined') {
                    this.registerScene('tutorial', new TutorialMinigame(this));
                    console.log('TutorialMinigame registered');
                } else {
                    console.error('TutorialMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering TutorialMinigame:', e);
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
            
            // Registrar StoryTeller minigame
            try {
                if (typeof StoryTellerMinigame !== 'undefined') {
                    this.registerScene('storyTeller', new StoryTellerMinigame(this));
                    console.log('StoryTellerMinigame registered');
                } else {
                    console.error('StoryTellerMinigame class is not defined');
                }
            } catch (e) {
                console.error('Error registering StoryTellerMinigame:', e);
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
        
        // Renderizar elementos de UI como la puntuación
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${this.playerScore}`, 10, 20);


        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.width - 150, 20, 130, 60);
            
            // Dibujar borde
        this.ctx.strokeStyle = '#FFCC00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.width - 150, 20, 130, 60);
            
            // Dibujar texto de puntuación
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Puntos: ${this.playerScore || 0}`, this.width - 30, 45);
            
           


        
        // Botón de música (icono de altavoz)
        this.renderMusicButton(this.ctx);
        
        // Continue the loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    /**
     * Renderizar el botón de música
     */
    renderMusicButton(ctx) {
        const x = this.width - 40;
        const y = 20;
        const size = 30;
        
        // Dibujar fondo del botón
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Dibujar icono de altavoz
        ctx.fillStyle = '#fff';
        
        if (this.audioSystem.musicEnabled) {
            // Altavoz con ondas (música activada)
            // Dibujar base del altavoz
            ctx.beginPath();
            ctx.moveTo(x - 8, y - 5);
            ctx.lineTo(x - 3, y - 5);
            ctx.lineTo(x + 3, y - 10);
            ctx.lineTo(x + 3, y + 10);
            ctx.lineTo(x - 3, y + 5);
            ctx.lineTo(x - 8, y + 5);
            ctx.closePath();
            ctx.fill();
            
            // Dibujar ondas de sonido
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            
            // Primera onda
            ctx.beginPath();
            ctx.arc(x + 2, y, 8, -Math.PI/3, Math.PI/3);
            ctx.stroke();
            
            // Segunda onda
            ctx.beginPath();
            ctx.arc(x + 2, y, 12, -Math.PI/3, Math.PI/3);
            ctx.stroke();
        } else {
            // Altavoz con cruz (música desactivada)
            // Dibujar base del altavoz
            ctx.beginPath();
            ctx.moveTo(x - 8, y - 5);
            ctx.lineTo(x - 3, y - 5);
            ctx.lineTo(x + 3, y - 10);
            ctx.lineTo(x + 3, y + 10);
            ctx.lineTo(x - 3, y + 5);
            ctx.lineTo(x - 8, y + 5);
            ctx.closePath();
            ctx.fill();
            
            // Dibujar cruz
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 8, y - 8);
            ctx.lineTo(x + 14, y - 2);
            ctx.moveTo(x + 14, y - 8);
            ctx.lineTo(x + 8, y - 2);
            ctx.stroke();
        }
    }
    
    isKeyPressed(key) {
        // Debugging to help diagnose key issues
        if (key === 'w' || key === 'a' || key === 's' || key === 'd' || 
            key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
            if (this.keys[key.toLowerCase()] === true) {
            }
        }
        return this.keys[key.toLowerCase()] === true;
    }
}
