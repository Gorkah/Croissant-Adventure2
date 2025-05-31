/**
 * World Map Scene
 * Mapa de mundo estilo Pokémon con características de worldMap_simple
 */
class WorldMapScene extends Scene {
    constructor(game) {
        super(game);
        
        // Player properties
        this.player = {
            x: 300,
            y: 300,
            width: 32,
            height: 32,
            speed: 120, // Velocidad para movimiento por tiles
            region: 'plaza-central', // región inicial
            direction: 'down', // dirección inicial
            moving: false,
            spriteIndex: 0,
            animationTimer: 0,
            glowSize: 0,
            glowDir: 1
        };
        
        // Cargar sprites del jugador (estilo Pokémon)
        this.playerSprites = {
            down: [],
            up: [],
            left: [],
            right: []
        };
        
        // Estado de la transición entre regiones
        this.regionTransition = {
            active: false,
            timer: 0,
            duration: 1, // segundos
            fromRegion: null,
            toRegion: null,
            alpha: 0
        };
        
        // Camera properties
        this.camera = {
            x: 0,
            y: 0,
            width: game.width,
            height: game.height,
            followPlayer: true
        };
        
        // Map properties - mundo con sistema de tiles
        this.map = {
            width: 2400,     // 3 regiones de ancho
            height: 1800,    // 3 regiones de alto
            tileSize: 32,    // Tamaño típico de tiles en Pokémon
            currentRegion: 'plaza-central'
        };
        
        // Definir regiones del mapa con sus características específicas
        this.regions = [
            {
                id: 'plaza-central',
                name: 'Plaza Central',
                x: 0,
                y: 0,
                width: 800,
                height: 600,
                bgColor: '#7CFC00', // Verde brillante para césped
                tilesets: {
                    ground: 'césped',
                    decoration: 'árboles y flores'
                },
                music: 'assets/audio/future-design-344320.mp3',
                displayName: 'Plaza Central',
                color: '#7CFC00',
                borderColor: '#5DAF00',
                description: 'El corazón de Migalandia, donde comienza tu aventura'
            },
            {
                id: 'bosque-chocolate',
                name: 'Bosque de Chocolate',
                x: 800,
                y: 0,
                width: 800,
                height: 600,
                bgColor: '#556B2F', // Verde oliva oscuro para bosque
                tilesets: {
                    ground: 'hierba',
                    decoration: 'árboles y arbustos'
                },
                hasGrass: true, // Hierba alta donde pueden aparecer encuentros
                displayName: 'Bosque de Chocolate',
                color: '#556B2F',
                borderColor: '#3A4B1F',
                description: 'Un frondoso bosque con árboles de chocolate',
                music: 'assets/audio/forest-with-small-river-birds-and-nature-field-recording-6735.mp3',
                lightEffect: 'forest_shade',
                ambientParticles: 'forest_pollen',
                specialEffect: 'forest_fireflies'
            },
            {
                id: 'montaña-galleta',
                name: 'Montaña Galleta',
                x: 1600,
                y: 0,
                width: 800,
                height: 600,
                bgColor: '#A9A9A9', // Gris para montaña
                tilesets: {
                    ground: 'rocoso',
                    decoration: 'rocas y elevaciones'
                },
                displayName: 'Montaña Galleta',
                color: '#A9A9A9',
                borderColor: '#787878',
                description: 'Una montaña escarpada hecha de galletas crujientes',
                music: 'assets/audio/epic-mountains-157980.mp3',
                lightEffect: 'mountain_shadows',
                ambientParticles: 'dust_particles',
                specialEffect: 'cookie_crumbs',
                weatherEffect: 'foggy'
            },
            {
                id: 'playa-caramelizada',
                name: 'Playa Caramelizada',
                x: 0,
                y: 600,
                width: 800,
                height: 600,
                bgColor: '#F5DEB3', // Wheat para arena
                tilesets: {
                    ground: 'arena',
                    decoration: 'conchas y palmeras'
                },
                music: 'assets/audio/jungle-waves-drumampbass-electronic-inspiring-promo-345013.mp3',
                hasWater: true,
                displayName: 'Playa Caramelizada',
                color: '#F5DEB3',
                borderColor: '#D4BD93',
                description: 'Una playa de azúcar con un mar de caramelo líquido',
                lightEffect: 'bright_day',
                ambientParticles: 'sparkling_sugar',
                specialEffect: 'caramel_bubbles',
                weatherEffect: 'light_rain'
            },
            {
                id: 'ciudad-pastelera',
                name: 'Ciudad Pastelera',
                x: 800,
                y: 600,
                width: 800,
                height: 600,
                bgColor: '#D3D3D3', // Light gray para calles
                tilesets: {
                    ground: 'pavimento',
                    decoration: 'edificios y farolas'
                },
                displayName: 'Ciudad Pastelera',
                color: '#D3D3D3',
                borderColor: '#B0B0B0',
                description: 'Una bulliciosa ciudad con edificios hechos de pasteles',
                music: 'assets/audio/city-ambience-9272.mp3',
                lightEffect: 'city_lights',
                ambientParticles: 'city_dust',
                specialEffect: 'sugar_sparkles'
            },
            {
                id: 'lago-merengue',
                name: 'Lago Merengue',
                x: 1600,
                y: 600,
                width: 800,
                height: 600,
                bgColor: '#87CEEB', // Sky blue para agua
                tilesets: {
                    ground: 'agua',
                    decoration: 'lirios y puentes'
                },
                hasWater: true,
                displayName: 'Lago Merengue',
                color: '#87CEEB',
                borderColor: '#5DAECB',
                description: 'Un lago tranquilo con aguas de merengue y nata',
                music: 'assets/audio/water-lake-stream-birds-loop-124980.mp3',
                lightEffect: 'water_reflections',
                ambientParticles: 'water_bubbles',
                specialEffect: 'sugar_sparkles'
            },
            {
                id: 'cueva-caramelo',
                name: 'Cueva Caramelo',
                x: 0,
                y: 1200,
                width: 800,
                height: 600,
                bgColor: '#696969', // Dim gray para cueva
                tilesets: {
                    ground: 'roca',
                    decoration: 'estalactitas y cristales'
                },
                isDark: true, // Las cuevas requieren iluminación especial
                displayName: 'Cueva Caramelo',
                color: '#696969',
                borderColor: '#404040',
                description: 'Una cueva oscura con cristales de caramelo brillante',
                music: 'assets/audio/cave-of-light-116826.mp3',
                lightEffect: 'crystal_illumination',
                ambientParticles: 'sparkling_sugar',
                specialEffect: 'caramel_bubbles'
            },
            {
                id: 'pradera-azucarada',
                name: 'Pradera Azucarada',
                x: 800,
                y: 1200,
                width: 800,
                height: 600,
                bgColor: '#98FB98', // Pale green para pradera
                tilesets: {
                    ground: 'hierba alta',
                    decoration: 'flores y arbustos'
                },
                hasGrass: true,
                displayName: 'Pradera Azucarada',
                color: '#98FB98',
                borderColor: '#78DB78',
                description: 'Una vasta pradera cubierta de hierba de azúcar y flores de caramelo',
                music: 'assets/audio/meadow-gentle-nature-soundtrack-birds-and-insects-on-a-peaceful-day-148403.mp3',
                lightEffect: 'bright_sunlight',
                ambientParticles: 'sparkling_sugar',
                specialEffect: 'sugar_sparkles',
                weatherEffect: 'falling_leaves'
            },
            {
                id: 'volcán-brownie',
                name: 'Volcán Brownie',
                x: 1600,
                y: 1200,
                width: 800,
                height: 600,
                bgColor: '#8B0000', // Dark red para volcán
                tilesets: {
                    ground: 'tierra quemada',
                    decoration: 'lava y rocas volcánicas'
                },
                hasHotSpots: true, // Zonas de lava que causan daño
                displayName: 'Volcán Brownie',
                color: '#8B0000',
                borderColor: '#6B0000',
                description: 'Un volcán activo con lava de chocolate caliente',
                music: 'assets/audio/cinematic-dramatic-11120.mp3',
                lightEffect: 'bright_day',
                ambientParticles: 'floating_embers',
                specialEffect: 'volcanic_smoke',
                weatherEffect: 'heavy_rain'
            }
        ];
        
        // Crear mapa de regiones por ID para acceso rápido
        this.regionsById = {};
        for (const region of this.regions) {
            this.regionsById[region.id] = region;
        }
        
        // Inicializar estructuras de datos para caminos, decoraciones y monedas
        this.paths = [];
        this.decorations = [];
        this.coins = [];
        
        // Zonas de minijuegos - ordenadas por regiones
        this.minigameZones = [
            // Plaza Central - Punto de inicio
            {
                x: 400,
                y: 300,
                width: 75,
                height: 75,
                name: 'Tutorial',
                displayName: 'Tutorial de Aventura',
                scene: 'tutorial',
                color: '#00BFFF',
                borderColor: '#0099CC',
                points: 5,
                icon: '📖',
                region: 'plaza-central',
                description: 'Aprende los controles básicos y mecánicas del juego'
            },
            
            // Bosque de Chocolate - Equivalente a Bosque Enredado
            {
                x: 950,
                y: 250,
                width: 75,
                height: 75,
                name: 'Maze',
                displayName: 'El Bosque Enredado',
                scene: 'maze',
                color: '#66cc66',
                borderColor: '#44aa44',
                points: 25,
                icon: '🧩',
                region: 'bosque-chocolate',
                description: 'Encuentra el camino a través del misterioso laberinto'
            },
            {
                x: 1050,
                y: 350,
                width: 75,
                height: 75,
                name: 'Snake',
                displayName: 'Silbi la Serpiente',
                scene: 'snake',
                color: '#44cc44',
                borderColor: '#33aa33',
                points: 45,
                icon: '🐍',
                region: 'bosque-chocolate',
                description: 'Ayuda a Silbi a comer sin tropezar con su cola'
            },
            
            // Montaña Galleta - Juegos de Cielo Azucarado
            {
                x: 1750,
                y: 200,
                width: 75,
                height: 75,
                name: 'Shooter',
                displayName: 'Burbujeadores del Cielo',
                scene: 'shooter',
                color: '#ff6666',
                borderColor: '#ff4444',
                points: 30,
                icon: '🔫',
                region: 'montaña-galleta',
                description: 'Revienta las burbujas mágicas en el cielo'
            },
            {
                x: 1850,
                y: 300,
                width: 75,
                height: 75,
                name: 'Platform',
                displayName: 'Islas Flotantes',
                scene: 'platform',
                color: '#66aaff',
                borderColor: '#4488ff',
                points: 35,
                icon: '🏃',
                region: 'montaña-galleta',
                description: 'Salta entre las plataformas flotantes'
            },
            
            // Playa Caramelizada - Juegos de playa (ya implementados, pero mejorados)
            {
                x: 200,
                y: 800,
                width: 75,
                height: 75,
                name: 'Fishing',
                displayName: 'Pescador Pastelero',
                scene: 'fishing',
                color: '#00ccff',
                borderColor: '#0099cc',
                points: 60,
                icon: '🎣',
                region: 'playa-caramelizada',
                special: true,
                pulseScale: 1,
                description: 'Captura deliciosos dulces en el mar de caramelo'
            },
            {
                x: 400,
                y: 950,
                width: 75,
                height: 75,
                name: 'Surfing',
                displayName: 'Surfista Glaseado',
                scene: 'surfing',
                color: '#66eeff',
                borderColor: '#00bbcc',
                points: 45,
                icon: '🏄',
                region: 'playa-caramelizada',
                special: true,
                pulseScale: 1,
                description: 'Deslízate sobre las olas de caramelo líquido'
            },
            
            // Ciudad Pastelera - Equivalente a Reino Cuadriculado
            {
                x: 900,
                y: 750,
                width: 75,
                height: 75,
                name: 'Chess',
                displayName: 'Guardianes del Reino',
                scene: 'chess',
                color: '#5555ff',
                borderColor: '#3333dd',
                points: 20,
                icon: '♘',
                region: 'ciudad-pastelera',
                description: 'Planifica tus movimientos estratégicos'
            },
            {
                x: 1050,
                y: 850,
                width: 75,
                height: 75,
                name: 'Tower Defense',
                displayName: 'Castillo de Azúcar',
                scene: 'towerDefense',
                color: '#9966ff',
                borderColor: '#7744ff',
                points: 70,
                icon: '🏰',
                region: 'ciudad-pastelera',
                description: 'Defiende el castillo de los invasores'
            },
            
            // Volcán Brownie - Juegos temáticos de lava
            {
                x: 1700,
                y: 1350,
                width: 75,
                height: 75,
                name: 'LavaRunner',
                displayName: 'Corredor de Lava Chocolatada',
                scene: 'platform',
                color: '#FF4500',
                borderColor: '#8B0000',
                points: 80,
                icon: '💥',
                region: 'volcán-brownie',
                special: true,
                pulseScale: 1,
                description: 'Salta entre las plataformas de chocolate flotando sobre la lava'
            },
            {
                x: 1850,
                y: 1450,
                width: 75,
                height: 75,
                name: 'LavaRacing',
                displayName: 'Carrera de Fondant Ardiente',
                scene: 'racing',
                color: '#FF6347',
                borderColor: '#CD5C5C',
                points: 65,
                icon: '🚗',
                region: 'volcán-brownie',
                special: true,
                pulseScale: 1,
                description: 'Conduce sobre el último borde del volcán evitando caías de lava'
            },
            
            // Cueva Caramelo - Juegos temáticos de exploración
            {
                x: 1200,
                y: 1550,
                width: 75,
                height: 75,
                name: 'CaveExplorer',
                displayName: 'Explorador de Cristales Dulces',
                scene: 'caveExplorer',
                color: '#9370DB',
                borderColor: '#6A5ACD',
                points: 55,
                icon: '🕳️',
                region: 'cueva-caramelo',
                special: true,
                pulseScale: 1,
                description: 'Encuentra los pares de cristales en la oscuridad de la cueva'
            },
            {
                x: 1050,
                y: 1650,
                width: 75,
                height: 75,
                name: 'CaveDigger',
                displayName: 'Minero de Caramelos',
                scene: 'puzzle',
                color: '#8A2BE2',
                borderColor: '#4B0082',
                points: 75,
                icon: '⛏️',
                region: 'cueva-caramelo',
                special: true,
                pulseScale: 1,
                description: 'Excava en la cueva y descubre tesoros dulces escondidos'
            },
            {
                x: 1200,
                y: 750,
                width: 75,
                height: 75,
                name: 'Admin Panel',
                displayName: 'Panel de Administración',
                scene: 'adminPanel',
                color: '#aaaaaa',
                borderColor: '#888888',
                points: 25,
                icon: '🔧',
                region: 'ciudad-pastelera',
                description: 'Explora los planos del Reino de Migalandia'
            },
            
            // Lago Merengue - Juegos de Valle Dorado
            {
                x: 1700,
                y: 750,
                width: 75,
                height: 75,
                name: 'Coin Collector',
                displayName: 'El Tesoro del Lago',
                scene: 'coinCollector',
                color: '#ffcc00',
                borderColor: '#ffaa00',
                points: 10,
                icon: '🪙',
                region: 'lago-merengue',
                description: 'Recoge las monedas doradas antes de que se acabe el tiempo'
            },
            {
                x: 1850,
                y: 850,
                width: 75,
                height: 75,
                name: 'Roulette',
                displayName: 'La Rueda de la Fortuna',
                scene: 'roulette',
                color: '#ff9900',
                borderColor: '#ff7700',
                points: 15,
                icon: '🎰',
                region: 'lago-merengue',
                description: 'Gira la rueda y prueba tu suerte'
            },
            
            // Cueva Caramelo - Juegos especiales
            {
                x: 400,
                y: 1400,
                width: 75,
                height: 75,
                name: 'Cave Explorer',
                displayName: 'Explorador de Cuevas',
                scene: 'caveExplorer',
                color: '#cc99ff',
                borderColor: '#aa77ff',
                points: 40,
                icon: '🔦',
                region: 'cueva-caramelo',
                description: 'Explora la oscuridad y encuentra tesoros escondidos'
            },
            
            // Pradera Azucarada - Equivalente a Villa de los Recuerdos
            {
                x: 900,
                y: 1300,
                width: 75,
                height: 75,
                name: 'Memory',
                displayName: 'Cartas Gemelas',
                scene: 'memory',
                color: '#cc66ff',
                borderColor: '#aa44ff',
                points: 40,
                icon: '🃏',
                region: 'pradera-azucarada',
                description: 'Encuentra los pares coincidentes'
            },
            {
                x: 1050,
                y: 1350,
                width: 75,
                height: 75,
                name: 'Puzzle',
                displayName: 'Cuadro Mágico',
                scene: 'puzzle',
                color: '#ff9966',
                borderColor: '#ff7744',
                points: 50,
                icon: '🧠',
                region: 'pradera-azucarada',
                description: 'Desliza las piezas para completar la imagen'
            },
            {
                x: 1200,
                y: 1400,
                width: 75,
                height: 75,
                name: 'Rhythm',
                displayName: 'Orquesta Dulce',
                scene: 'rhythm',
                color: '#ff66cc',
                borderColor: '#ff44aa',
                points: 55,
                icon: '🎵',
                region: 'pradera-azucarada',
                description: 'Sigue el ritmo de las notas musicales'
            },
            {
                x: 1050,
                y: 1450,
                width: 75,
                height: 75,
                name: 'Paint Game',
                displayName: 'Estudio Artístico',
                scene: 'paintGame',
                color: '#ff99cc',
                borderColor: '#ff77aa',
                points: 45,
                icon: '🎨',
                region: 'pradera-azucarada',
                description: 'Dibuja y pinta tus propias creaciones'
            },
            {
                x: 900,
                y: 1500,
                width: 75,
                height: 75,
                name: 'Trivia Game',
                displayName: 'Trivia de Pastelería',
                scene: 'triviaGame',
                color: '#ffaa66',
                borderColor: '#ff8844',
                points: 40,
                icon: '🥨',
                region: 'pradera-azucarada',
                description: 'Pon a prueba tus conocimientos sobre croissants'
            },
            {
                x: 1200,
                y: 1500,
                width: 75,
                height: 75,
                name: 'Story Teller',
                displayName: 'Narrador de Historias',
                scene: 'storyTeller',
                color: '#66cccc',
                borderColor: '#44aaaa',
                points: 30,
                icon: '📚',
                region: 'pradera-azucarada',
                description: 'Vive una aventura narrativa interactiva'
            },
            
            // Volcán Brownie - Juegos especiales
            {
                x: 1700,
                y: 1400,
                width: 75,
                height: 75,
                name: 'Lava Runner',
                displayName: 'Corredor de Lava',
                scene: 'lavaRunner',
                color: '#ff4500',
                borderColor: '#cc3700',
                points: 65,
                icon: '🔥',
                region: 'volcán-brownie',
                description: 'Escapa de la lava mientras recoges ingredientes especiales'
            }
        ];
        
        // Ya inicializamos los arrays vacíos en la parte superior del constructor
        // Ahora generamos los elementos del mapa
        this.generatePaths();
        this.generateDecorations();
        this.generateCoins();
        
        // Muros - ahora definidos para cada región
        this.walls = [];
        
        // Generar muros para los bordes de cada región (actuando como transiciones)
        this.regions.forEach(region => {
            // Añadir bordes como muros entre regiones (se pueden atravesar como portales)
            this.walls.push(
                // Izquierda
                { 
                    x: region.x, 
                    y: region.y, 
                    width: 5, 
                    height: region.height, 
                    isRegionBorder: true,
                    connectsTo: this.getAdjacentRegionId(region.id, 'left')
                },
                // Derecha
                { 
                    x: region.x + region.width - 5, 
                    y: region.y, 
                    width: 5, 
                    height: region.height, 
                    isRegionBorder: true,
                    connectsTo: this.getAdjacentRegionId(region.id, 'right')
                },
                // Arriba
                { 
                    x: region.x, 
                    y: region.y, 
                    width: region.width, 
                    height: 5, 
                    isRegionBorder: true,
                    connectsTo: this.getAdjacentRegionId(region.id, 'up')
                },
                // Abajo
                { 
                    x: region.x, 
                    y: region.y + region.height - 5, 
                    width: region.width, 
                    height: 5, 
                    isRegionBorder: true,
                    connectsTo: this.getAdjacentRegionId(region.id, 'down')
                }
            );
            
            // Obstáculos específicos para cada región
            if (region.id === 'plaza-central') {
                this.walls.push(
                    { x: region.x + 360, y: region.y + 260, width: 80, height: 80, isObstacle: true }
                );
            } else if (region.id === 'bosque-chocolate') {
                // Árboles de chocolate aleatorios
                for (let i = 0; i < 8; i++) {
                    this.walls.push({
                        x: region.x + 100 + Math.random() * (region.width - 200),
                        y: region.y + 100 + Math.random() * (region.height - 200),
                        width: 40 + Math.random() * 20,
                        height: 40 + Math.random() * 20,
                        isObstacle: true,
                        isTree: true
                    });
                }
            } else if (region.id === 'playa-caramelizada') {
                // Áreas de agua en la playa
                this.walls.push(
                    { 
                        x: region.x + 500, 
                        y: region.y + 100, 
                        width: 250, 
                        height: 400, 
                        isWater: true 
                    }
                );
            }
        });
        
        // UI
        this.interactionPrompt = null;
        
        // Estado del minimapa
        this.minimap = {
            visible: true,
            x: 20,
            y: 20,
            width: 150,
            height: 120,
            scale: 0.07 // escala del minimapa en relación al mapa
        };

        // Elementos de worldMap_simple
        // Caminos entre minijuegos
        this.paths = [];
        this.generatePaths();
        
        // Monedas coleccionables
        this.coins = [];
        this.generateCoins(30);
        
        // Decoraciones temáticas
        this.decorations = [];
        this.generateDecorations();
        
        // Efectos visuales
        this.particles = [];
        
        // UI adicional
        this.showScoreUI = true;
        
        // Tooltip para info de juegos
        this.tooltip = {
            visible: false,
            x: 0,
            y: 0,
            game: null
        };
        
        // Estado para teclas presionadas
        this.mPressed = false;
        this.tabPressed = false;
    }
    
    // Obtiene el ID de la región adyacente en la dirección especificada
    getAdjacentRegionId(regionId, direction) {
        const currentRegion = this.regions.find(r => r.id === regionId);
        if (!currentRegion) return null;
        
        let adjacentX = currentRegion.x;
        let adjacentY = currentRegion.y;
        
        // Tamaño estándar de las regiones
        const regionWidth = 800;
        const regionHeight = 600;
        
        switch (direction) {
            case 'left': adjacentX -= regionWidth; break;
            case 'right': adjacentX += regionWidth; break;
            case 'up': adjacentY -= regionHeight; break;
            case 'down': adjacentY += regionHeight; break;
        }
        
        // Verificar que las coordenadas están dentro del mapa
        if (adjacentX < 0 || adjacentY < 0 || adjacentX >= this.map.width || adjacentY >= this.map.height) {
            console.log(`No hay región en dirección ${direction} desde ${regionId} (${adjacentX}, ${adjacentY})`);
            return null;
        }
        
        // Encontrar la región en esas coordenadas
        const adjacentRegion = this.regions.find(r => 
            r.x === adjacentX && r.y === adjacentY
        );
        
        if (adjacentRegion) {
            console.log(`Región adyacente en dirección ${direction} desde ${regionId}: ${adjacentRegion.id}`);
        } else {
            console.log(`No se encontró región en (${adjacentX}, ${adjacentY})`);
        }
        
        return adjacentRegion ? adjacentRegion.id : null;
    }
    
    /**
     * Método que se ejecuta al entrar en la escena
     */
    enter() {
        console.log("Entrando en el mapa del mundo Croissant");
        
        // Cargar posición guardada si existe
        const savedPosition = localStorage.getItem('playerPosition');
        if (savedPosition) {
            const pos = JSON.parse(savedPosition);
            this.player.x = pos.x;
            this.player.y = pos.y;
            this.player.region = pos.region;
        }
        
        // Reset camera position to follow player
        this.updateCamera(true); // Inmediato para evitar transiciones extrañas
        
        // Iniciar la música de la región actual
        this.playRegionMusic();
        
        // Comprobar si el jugador está dentro de una zona de minijuego y moverlo si es necesario
        let isInMinigameZone = false;
        let closestZone = null;
        let shortestDistance = Infinity;
        
        // Obtener posición central del jugador
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        // Comprobar si está en alguna zona de minijuego
        for (const zone of this.minigameZones) {
            if (zone.region !== this.player.region) continue;
            
            const zoneCenterX = zone.x + zone.width / 2;
            const zoneCenterY = zone.y + zone.height / 2;
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < zone.width / 2 + 20) { // Añadir 20px de buffer
                isInMinigameZone = true;
            }
            
            // Seguir la zona más cercana como referencia
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestZone = zone;
            }
        }
        
        // Si el jugador está en una zona de minijuego, sacarlo
        if (isInMinigameZone && closestZone) {
            console.log("El jugador está en una zona de minijuego al regresar, reposicionando");
            const zoneCenterX = closestZone.x + closestZone.width / 2;
            const zoneCenterY = closestZone.y + closestZone.height / 2;
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            
            // Determinar dirección fuera de la zona (normalizar vector)
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance === 0) distance = 1; // Evitar división por cero
            
            // Mover al jugador lejos de la zona en 100 píxeles
            const moveDistance = closestZone.width / 2 + 60; // 60px de buffer
            this.player.x = zoneCenterX + (dx / distance) * moveDistance - this.player.width / 2;
            this.player.y = zoneCenterY + (dy / distance) * moveDistance - this.player.height / 2;
            
            // Mantener al jugador dentro de los límites
            this.player.x = Math.max(0, Math.min(this.player.x, this.map.width - this.player.width));
            this.player.y = Math.max(0, Math.min(this.player.y, this.map.height - this.player.height));
        }
    }
    
    /**
     * Reproduce la música adecuada para la región actual
     */
    playRegionMusic() {
        // Mapeo de regiones a música
        const musicMap = {
            'plaza-central': 'assets/audio/future-design-344320.mp3',
            'playa-caramelizada': 'assets/audio/jungle-waves-drumampbass-electronic-inspiring-promo-345013.mp3',
            // Podrías agregar más músicas para otras regiones cuando estén disponibles
        };
        
        const region = this.regions.find(r => r.id === this.player.region);
        const music = region && region.music ? region.music : musicMap[this.player.region] || musicMap['plaza-central'];
        this.game.playBackgroundMusic(music);
    }
    
    /**
     * Método que se ejecuta al salir de la escena
     */
    exit() {
        // Guardar la posición actual del jugador
        localStorage.setItem('playerPosition', JSON.stringify({
            x: this.player.x,
            y: this.player.y,
            region: this.player.region
        }));
    }
    
    /**
     * Actualiza la lógica del juego cada frame
     */
    update(deltaTime) {
        // Manejar transiciones entre regiones
        if (this.regionTransition.active) {
            this.regionTransition.timer += deltaTime;
            
            // Calcular alpha para el efecto fade
            if (this.regionTransition.timer < this.regionTransition.duration / 2) {
                // Fade out
                this.regionTransition.alpha = this.regionTransition.timer / (this.regionTransition.duration / 2);
            } else {
                // Fade in
                this.regionTransition.alpha = 1 - (this.regionTransition.timer - this.regionTransition.duration / 2) / (this.regionTransition.duration / 2);
            }
            
            // Terminar transición
            if (this.regionTransition.timer >= this.regionTransition.duration) {
                this.regionTransition.active = false;
                this.map.currentRegion = this.player.region;
            }
        }
        
        // Guardar posición anterior para colisiones
        const prevX = this.player.x;
        const prevY = this.player.y;
        
        // Variable para comprobar si el jugador se mueve
        let isMoving = false;
        
        // Calcular velocidad basada en tipo de terreno
        let speed = this.player.speed;
        
        // Reducir velocidad en agua
        if (this.isPlayerInWater()) {
            speed *= 0.5;
        }
        
        // Ajustar velocidad basada en deltaTime para movimiento constante
        const adjustedSpeed = speed * deltaTime;
        
        // Mover al jugador
        if (this.game.isKeyPressed('ArrowUp') || this.game.isKeyPressed('w')) {
            this.player.y -= adjustedSpeed;
            this.player.direction = 'up';
            isMoving = true;
        }
        if (this.game.isKeyPressed('ArrowDown') || this.game.isKeyPressed('s')) {
            this.player.y += adjustedSpeed;
            this.player.direction = 'down';
            isMoving = true;
        }
        if (this.game.isKeyPressed('ArrowLeft') || this.game.isKeyPressed('a')) {
            this.player.x -= adjustedSpeed;
            this.player.direction = 'left';
            isMoving = true;
        }
        if (this.game.isKeyPressed('ArrowRight') || this.game.isKeyPressed('d')) {
            this.player.x += adjustedSpeed;
            this.player.direction = 'right';
            isMoving = true;
        }
        
        // Comprobar colisiones con paredes y obstáculos
        const playerRect = {
            x: this.player.x,
            y: this.player.y,
            width: this.player.width,
            height: this.player.height
        };
        
        if (this.checkWallCollision(playerRect)) {
            // Restaurar posición anterior si hay colisión
            this.player.x = prevX;
            this.player.y = prevY;
        }
        
        // Limitar al jugador dentro del mapa
        this.player.x = Math.max(0, Math.min(this.player.x, this.map.width - this.player.width));
        this.player.y = Math.max(0, Math.min(this.player.y, this.map.height - this.player.height));
        
        // Actualizar estado de movimiento
        this.player.moving = isMoving;
        
        // Actualizar animación del jugador
        if (isMoving) {
            this.player.animationTimer += deltaTime;
            if (this.player.animationTimer >= 0.2) { // Cambiar cada 200ms
                this.player.animationTimer = 0;
                this.player.spriteIndex = (this.player.spriteIndex + 1) % 4; // 4 frames de animación
            }
        } else {
            this.player.spriteIndex = 0; // Frame estático cuando no se mueve
        }
        
        // Actualizar cámara para seguir al jugador
        this.updateCamera();
        
        // Comprobar interacción con zonas de minijuego
        const nearbyZone = this.getNearbyMinigameZone();
        
        // Mostrar prompt de interacción si hay una zona cercana
        if (nearbyZone) {
            // Establecer texto y posición del prompt
            this.interactionPrompt = {
                text: `Presiona 'E' para jugar ${nearbyZone.displayName}`,
                x: this.player.x + this.player.width / 2,
                y: this.player.y - 20,
                visible: true,
                zone: nearbyZone
            };
            
            // Si presiona E, iniciar el minijuego
            if (this.game.isKeyPressed('e')) {
                if (nearbyZone.points) {
                    this.game.addPoints(nearbyZone.points, 'minigame');
                }
                // Corregir el método para cambiar escenas - usar switchScene en lugar de changeScene
                this.game.switchScene(nearbyZone.scene);
            }
        } else {
            this.interactionPrompt = null;
        }
        
        // Efectos especiales para los minijuegos de la Playa Caramelizada
        for (const zone of this.minigameZones) {
            if (zone.special && zone.region === 'playa-caramelizada' && this.player.region === 'playa-caramelizada') {
                // Animación para minijuegos especiales
                zone.animTimer = (zone.animTimer || 0) + deltaTime;
                zone.pulseScale = 1 + Math.sin(zone.animTimer * 2) * 0.1; // Efecto de pulso
                
                // Efecto de partículas para mejorar la visibilidad
                if (Math.random() < 0.05) { // 5% de probabilidad cada frame
                    for (let i = 0; i < 3; i++) {
                        this.particles.push({
                            x: zone.x + Math.random() * zone.width,
                            y: zone.y + Math.random() * zone.height,
                            vx: (Math.random() - 0.5) * 20,
                            vy: -Math.random() * 30 - 10,
                            color: zone.color,
                            size: 2 + Math.random() * 3,
                            life: 1.0
                        });
                    }
                }
            }
        }
        
        // Actualizar partículas
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            // Mover partícula
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Reducir vida
            particle.life -= deltaTime;
            
            // Eliminar partículas muertas
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
        
        // Comprobar colección de monedas
        this.checkCoinCollection();
        
        // Actualizar caminos
        for (const path of this.paths) {
            path.dashOffset += deltaTime * 20; // Velocidad de animación de líneas punteadas
        }
        
        // Actualizar brillo del jugador (efecto de pulso)
        this.player.glowSize += deltaTime * 2 * this.player.glowDir;
        if (this.player.glowSize > 1) {
            this.player.glowSize = 1;
            this.player.glowDir = -1;
        } else if (this.player.glowSize < 0) {
            this.player.glowSize = 0;
            this.player.glowDir = 1;
        }
        
        // Toggle UI elements
        if (this.game.isKeyPressed('m') && !this.mPressed) {
            this.showMinimap = !this.showMinimap;
            this.mPressed = true;
        } else if (!this.game.isKeyPressed('m')) {
            this.mPressed = false;
        }
        
        if (this.game.isKeyPressed('tab') && !this.tabPressed) {
            this.showScoreUI = !this.showScoreUI;
            this.tabPressed = true;
        } else if (!this.game.isKeyPressed('tab')) {
            this.tabPressed = false;
        }
    }
    
    /**
     * Actualiza la posición de la cámara para seguir al jugador
     */
    updateCamera(immediate = false) {
        if (this.camera.followPlayer) {
            // Calcular la posición objetivo de la cámara (centrada en el jugador)
            const targetX = this.player.x - this.game.width / 2 + this.player.width / 2;
            const targetY = this.player.y - this.game.height / 2 + this.player.height / 2;
            
            // Limitar la cámara para que no se salga del mapa
            const limitedX = Math.max(0, Math.min(targetX, this.map.width - this.game.width));
            const limitedY = Math.max(0, Math.min(targetY, this.map.height - this.game.height));
            
            if (immediate) {
                // Actualizar inmediatamente
                this.camera.x = limitedX;
                this.camera.y = limitedY;
            } else {
                // Suavizar el movimiento de la cámara (interpolación lineal)
                const cameraSpeed = 0.1; // Ajustar para movimiento más suave o más rápido
                this.camera.x += (limitedX - this.camera.x) * cameraSpeed;
                this.camera.y += (limitedY - this.camera.y) * cameraSpeed;
            }
        }
    }
    
    /**
     * Comprobar si el jugador está en agua
     */
    isPlayerInWater() {
        const playerRect = {
            x: this.player.x,
            y: this.player.y,
            width: this.player.width,
            height: this.player.height
        };
        
        for (const wall of this.walls) {
            if (wall.isWater && 
                playerRect.x < wall.x + wall.width &&
                playerRect.x + playerRect.width > wall.x &&
                playerRect.y < wall.y + wall.height &&
                playerRect.y + playerRect.height > wall.y) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Inicia una transición entre regiones con efecto fade
     */
    startRegionTransition(fromRegion, toRegion) {
        this.regionTransition = {
            active: true,
            timer: 0,
            duration: 1, // segundos
            fromRegion: fromRegion,
            toRegion: toRegion,
            alpha: 0
        };
    }
    
    /**
     * Manejo de clicks/taps en el mapa
     */
    onMouseDown(x, y) {
        // Convertir coordenadas de pantalla a coordenadas del mundo
        const worldX = x + this.camera.x;
        const worldY = y + this.camera.y;
        
        // Verificar clic en tooltip para cerrar
        if (this.tooltip.visible) {
            this.tooltip.visible = false;
            return true;
        }
        
        // Verificar si hizo clic en una zona de minijuego
        for (const zone of this.minigameZones) {
            if (zone.region === this.player.region && // Solo zonas de la región actual
                worldX >= zone.x && worldX <= zone.x + zone.width &&
                worldY >= zone.y && worldY <= zone.y + zone.height) {
                
                // Añadir puntos al iniciar el minijuego
                if (zone.points) {
                    this.game.addPoints(zone.points, 'minigame');
                }
                
                // Iniciar el minijuego
                this.game.changeScene(zone.scene);
                return true;
            }
            
            // Mostrar tooltip al hacer clic cerca pero no directamente en la zona
            if (zone.region === this.player.region) {
                const zoneCenterX = zone.x + zone.width / 2;
                const zoneCenterY = zone.y + zone.height / 2;
                const dx = worldX - zoneCenterX;
                const dy = worldY - zoneCenterY;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < zone.width * 2 && distance >= zone.width / 2) {
                    this.tooltip.visible = true;
                    this.tooltip.x = zone.x + zone.width / 2;
                    this.tooltip.y = zone.y - 80;
                    this.tooltip.game = zone;
                    return true;
                }
            }
        }
        
        // Verificar clic en moneda
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            if (coin.region === this.player.region) {
                const dx = worldX - coin.x;
                const dy = worldY - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 20) { // Radio de colección por clic
                    // Recoger moneda
                    this.game.addPoints(coin.value, 'coin');
                    
                    // Crear efecto de partículas
                    for (let j = 0; j < 8; j++) {
                        this.particles.push({
                            x: coin.x,
                            y: coin.y,
                            vx: (Math.random() - 0.5) * 100,
                            vy: (Math.random() - 0.5) * 100,
                            color: coin.color,
                            size: 2 + Math.random() * 3,
                            life: 1.0
                        });
                    }
                    
                    // Eliminar la moneda
                    this.coins.splice(i, 1);
                    return true;
                }
            }
        }
        
        // Verificar clic en el minimapa
        if (this.minimap.visible &&
            x >= this.minimap.x && x <= this.minimap.x + this.minimap.width &&
            y >= this.minimap.y && y <= this.minimap.y + this.minimap.height) {
            
            // Convertir coordenadas del minimapa a coordenadas del mundo
            const mapX = (x - this.minimap.x) / this.minimap.scale;
            const mapY = (y - this.minimap.y) / this.minimap.scale;
            
            // Encontrar la región en esas coordenadas
            for (const region of this.regions) {
                if (mapX >= region.x && mapX <= region.x + region.width &&
                    mapY >= region.y && mapY <= region.y + region.height) {
                    
                    // Iniciar transición a la nueva región
                    this.startRegionTransition(this.player.region, region.id);
                    
                    // Mover al jugador a la nueva región
                    const centerX = region.x + region.width / 2;
                    const centerY = region.y + region.height / 2;
                    
                    // Asegurarse de que la nueva posición no esté en un obstáculo
                    this.player.x = centerX - this.player.width / 2;
                    this.player.y = centerY - this.player.height / 2;
                    this.player.region = region.id;
                    
                    // Actualizar música
                    this.playRegionMusic();
                    
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Comprobar si un rectángulo colisiona con algún muro
    // También maneja las transiciones entre regiones
    checkWallCollision(rect) {
        for (const wall of this.walls) {
            // Comprobar colisión con el muro
            if (rect.x < wall.x + wall.width &&
                rect.x + rect.width > wall.x &&
                rect.y < wall.y + wall.height &&
                rect.y + rect.height > wall.y) {
                
                // Si es un borde entre regiones, iniciar transición
                if (wall.isRegionBorder && wall.connectsTo) {
                    // Relajamos la condición - solo necesitamos que parte del jugador esté tocando el borde
                    // en lugar de requerir que esté completamente dentro
                    
                    // Obtener la región actual y destino
                    const fromRegion = this.regions.find(r => r.id === this.player.region);
                    const toRegion = this.regions.find(r => r.id === wall.connectsTo);
                    
                    if (fromRegion && toRegion) {
                        console.log(`Transición de ${fromRegion.id} a ${toRegion.id}`);
                        
                        // Iniciar transición visual
                        this.startRegionTransition(this.player.region, wall.connectsTo);
                        
                        // Actualizar región del jugador
                        this.player.region = wall.connectsTo;
                        
                        // Calcular la posición relativa del jugador en la región actual
                        // para mantener la misma posición relativa en la nueva región
                        let relativeX, relativeY;
                        
                        // Si está saliendo por el borde izquierdo de la región actual
                        if (Math.abs(rect.x - fromRegion.x) < 20) {
                            // Entrar por el borde derecho de la nueva región
                            this.player.x = toRegion.x + toRegion.width - this.player.width - 10;
                            // Mantener la misma posición vertical relativa
                            relativeY = (rect.y - fromRegion.y) / fromRegion.height;
                            this.player.y = toRegion.y + relativeY * toRegion.height;
                        }
                        // Si está saliendo por el borde derecho de la región actual
                        else if (Math.abs((rect.x + rect.width) - (fromRegion.x + fromRegion.width)) < 20) {
                            // Entrar por el borde izquierdo de la nueva región
                            this.player.x = toRegion.x + 10;
                            // Mantener la misma posición vertical relativa
                            relativeY = (rect.y - fromRegion.y) / fromRegion.height;
                            this.player.y = toRegion.y + relativeY * toRegion.height;
                        }
                        
                        // Si está saliendo por el borde superior de la región actual
                        if (Math.abs(rect.y - fromRegion.y) < 20) {
                            // Entrar por el borde inferior de la nueva región
                            this.player.y = toRegion.y + toRegion.height - this.player.height - 10;
                            // Mantener la misma posición horizontal relativa
                            relativeX = (rect.x - fromRegion.x) / fromRegion.width;
                            this.player.x = toRegion.x + relativeX * toRegion.width;
                        }
                        // Si está saliendo por el borde inferior de la región actual
                        else if (Math.abs((rect.y + rect.height) - (fromRegion.y + fromRegion.height)) < 20) {
                            // Entrar por el borde superior de la nueva región
                            this.player.y = toRegion.y + 10;
                            // Mantener la misma posición horizontal relativa
                            relativeX = (rect.x - fromRegion.x) / fromRegion.width;
                            this.player.x = toRegion.x + relativeX * toRegion.width;
                        }
                        
                        // Asegurarnos que el jugador no esté fuera de los límites de la nueva región
                        this.player.x = Math.max(toRegion.x + 10, Math.min(this.player.x, toRegion.x + toRegion.width - this.player.width - 10));
                        this.player.y = Math.max(toRegion.y + 10, Math.min(this.player.y, toRegion.y + toRegion.height - this.player.height - 10));
                        
                        console.log(`Jugador reposicionado en (${this.player.x}, ${this.player.y})`);
                        
                        // Actualizar música
                        this.playRegionMusic();
                        
                        // No bloquear el movimiento
                        return false;
                    }
                }
                
                // Si es agua, permitir el paso pero reducir velocidad (se maneja en update)
                if (wall.isWater) {
                    return false;
                }
                
                // Si es un obstáculo normal, bloquear el paso
                if (wall.isObstacle) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Comprobar si un punto está visible en la cámara
     */
    isPointVisible(x, y) {
        return x >= this.camera.x && x <= this.camera.x + this.camera.width &&
               y >= this.camera.y && y <= this.camera.y + this.camera.height;
    }
    
    /**
     * Comprobar si un rectángulo es visible en la cámara
     */
    isRectVisible(rect) {
        return rect.x < this.camera.x + this.camera.width &&
               rect.x + rect.width > this.camera.x &&
               rect.y < this.camera.y + this.camera.height &&
               rect.y + rect.height > this.camera.y;
    }
    
    /**
     * Comprueba si el jugador está cerca de una zona de minijuego
     */
    getNearbyMinigameZone() {
        const interactionDistance = 80; // Distancia para interactuar con minijuegos
        
        let closestZone = null;
        let shortestDistance = Infinity;
        
        for (const zone of this.minigameZones) {
            // Solo considerar zonas en la región actual del jugador
            if (zone.region !== this.player.region) continue;
            
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            
            const zoneCenterX = zone.x + zone.width / 2;
            const zoneCenterY = zone.y + zone.height / 2;
            
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Guardar la zona más cercana
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestZone = zone;
            }
            
            // Destacar las zonas especiales con mayor área de interacción
            const effectiveDistance = zone.special ? interactionDistance * 1.5 : interactionDistance;
            
            if (distance < effectiveDistance) {
                return zone;
            }
        }
        
        // Si estamos muy cerca de la zona más cercana pero no lo suficiente,
        // todavía mostrar un prompt sutil
        if (closestZone && shortestDistance < interactionDistance * 2) {
            closestZone.isNearby = true;
            return null;
        }
        
        return null;
    }
    
    /**
     * Comprueba si el jugador recoge alguna moneda
     */
    checkCoinCollection() {
        // Radio de colección alrededor del jugador
        const collectionRadius = 20;
        
        // Calcular centro del jugador
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        // Comprobar cada moneda en la región actual
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            
            if (coin.region === this.player.region) {
                const dx = playerCenterX - coin.x;
                const dy = playerCenterY - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < collectionRadius) {
                    // Recoger moneda
                    this.game.addPoints(coin.value, 'coin');
                    
                    // Crear efecto de partículas
                    for (let j = 0; j < 8; j++) {
                        this.particles.push({
                            x: coin.x,
                            y: coin.y,
                            vx: (Math.random() - 0.5) * 100,
                            vy: (Math.random() - 0.5) * 100,
                            color: coin.color,
                            size: 2 + Math.random() * 3,
                            life: 1.0
                        });
                    }
                    
                    // Eliminar la moneda
                    this.coins.splice(i, 1);
                    i--; // Ajustar índice
                }
            }
        }
    }
    
    /**
     * Genera caminos entre las zonas de minijuego cercanas
     */
    generatePaths() {
        // Para cada zona, conectar con las 1-2 zonas más cercanas de la misma región
        const zonesByRegion = {};
        
        // Agrupar zonas por región
        for (let i = 0; i < this.minigameZones.length; i++) {
            const zone = this.minigameZones[i];
            const regionId = zone.region;
            
            if (!zonesByRegion[regionId]) {
                zonesByRegion[regionId] = [];
            }
            
            zonesByRegion[regionId].push({
                index: i,
                zone: zone
            });
        }
        
        // Para cada región, crear caminos entre sus zonas
        for (const regionId in zonesByRegion) {
            const regionZones = zonesByRegion[regionId];
            
            // Si hay más de una zona en la región, crear caminos
            if (regionZones.length > 1) {
                for (let i = 0; i < regionZones.length; i++) {
                    const zone1 = regionZones[i];
                    
                    // Calcular distancias a todas las demás zonas de la región
                    const distances = [];
                    for (let j = 0; j < regionZones.length; j++) {
                        if (i === j) continue;
                        
                        const zone2 = regionZones[j];
                        const center1 = {
                            x: zone1.zone.x + zone1.zone.width / 2,
                            y: zone1.zone.y + zone1.zone.height / 2
                        };
                        const center2 = {
                            x: zone2.zone.x + zone2.zone.width / 2,
                            y: zone2.zone.y + zone2.zone.height / 2
                        };
                        
                        const dx = center1.x - center2.x;
                        const dy = center1.y - center2.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        distances.push({
                            index: j,
                            zoneIndex: zone2.index,
                            distance: distance
                        });
                    }
                    
                    // Ordenar por distancia
                    distances.sort((a, b) => a.distance - b.distance);
                    
                    // Conectar con la zona más cercana
                    if (distances.length > 0) {
                        const targetZone = distances[0];
                        
                        // Evitar duplicados
                        let pathExists = false;
                        for (const path of this.paths) {
                            if ((path.from === zone1.index && path.to === targetZone.zoneIndex) || 
                                (path.from === targetZone.zoneIndex && path.to === zone1.index)) {
                                pathExists = true;
                                break;
                            }
                        }
                        
                        if (!pathExists) {
                            // Crear un camino especial para la región "Playa Caramelizada"
                            let pathType = "region";
                            let pathWidth = 3;
                            let pathColor = zone1.zone.borderColor || "#ffffff";
                            
                            // Destacar caminos en la Playa Caramelizada
                            if (regionId === "playa-caramelizada") {
                                pathType = "beach";
                                pathWidth = 4;
                                pathColor = "#00CCFF"; // Azul brillante para caminos de playa
                            }
                            
                            this.paths.push({
                                from: zone1.index,
                                to: targetZone.zoneIndex,
                                type: pathType,
                                color: pathColor,
                                width: pathWidth,
                                dashOffset: 0
                            });
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Genera monedas coleccionables en el mapa
     */
    generateCoins(count) {
        for (let i = 0; i < count; i++) {
            // Elegir una región aleatoria
            const regionIndex = Math.floor(Math.random() * this.regions.length);
            const region = this.regions[regionIndex];
            
            // Posición aleatoria dentro de la región
            let x, y, valid;
            do {
                x = region.x + 50 + Math.random() * (region.width - 100);
                y = region.y + 50 + Math.random() * (region.height - 100);
                
                // Comprobar que no está sobre una zona de minijuego
                valid = true;
                for (const zone of this.minigameZones) {
                    if (zone.region === region.id) {
                        const dx = x - (zone.x + zone.width/2);
                        const dy = y - (zone.y + zone.height/2);
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        if (distance < zone.width + 20) {
                            valid = false;
                            break;
                        }
                    }
                }
                
                // Comprobar que no está sobre un obstáculo
                for (const wall of this.walls) {
                    if (wall.isObstacle && 
                        x >= wall.x - 20 && x <= wall.x + wall.width + 20 &&
                        y >= wall.y - 20 && y <= wall.y + wall.height + 20) {
                        valid = false;
                        break;
                    }
                }
                
                // Comprobar que no está demasiado cerca de otra moneda
                for (const coin of this.coins) {
                    const dx = x - coin.x;
                    const dy = y - coin.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < 40) {
                        valid = false;
                        break;
                    }
                }
            } while (!valid);
            
            // Tipo de moneda basado en la región
            let type, color, value;
            switch (region.id) {
                case 'plaza-central':
                    type = 'gold';
                    color = '#FFD700';
                    value = 5;
                    break;
                case 'bosque-chocolate':
                    type = 'green';
                    color = '#00AA00';
                    value = 8;
                    break;
                case 'montaña-galleta':
                    type = 'silver';
                    color = '#C0C0C0';
                    value = 10;
                    break;
                case 'playa-caramelizada':
                    type = 'blue';
                    color = '#00AAFF';
                    value = 15;
                    break;
                case 'ciudad-pastelera':
                    type = 'purple';
                    color = '#AA00AA';
                    value = 12;
                    break;
                case 'lago-merengue':
                    type = 'cyan';
                    color = '#00FFFF';
                    value = 18;
                    break;
                case 'cueva-caramelo':
                    type = 'ruby';
                    color = '#FF0000';
                    value = 25;
                    break;
                case 'pradera-azucarada':
                    type = 'emerald';
                    color = '#00FF00';
                    value = 20;
                    break;
                case 'volcán-brownie':
                    type = 'obsidian';
                    color = '#320000';
                    value = 30;
                    break;
                default:
                    type = 'gold';
                    color = '#FFD700';
                    value = 5;
            }
            
            this.coins.push({
                x: x,
                y: y,
                type: type,
                color: color,
                value: value,
                region: region.id,
                animTimer: Math.random() * Math.PI * 2 // Desplazamiento aleatorio para animación
            });
        }
    }
    
    /**
     * Genera decoraciones temáticas para cada región
     */
    generateDecorations() {
        // Para cada región, añadir decoraciones temáticas
        for (const region of this.regions) {
            // Número de decoraciones basado en el tamaño de la región
            const count = 10 + Math.floor(Math.random() * 10);
            
            for (let i = 0; i < count; i++) {
                // Posición aleatoria dentro de la región
                let x, y, valid;
                do {
                    x = region.x + 50 + Math.random() * (region.width - 100);
                    y = region.y + 50 + Math.random() * (region.height - 100);
                    
                    // Comprobar que no está sobre una zona de minijuego
                    valid = true;
                    for (const zone of this.minigameZones) {
                        if (zone.region === region.id) {
                            const dx = x - (zone.x + zone.width/2);
                            const dy = y - (zone.y + zone.height/2);
                            const distance = Math.sqrt(dx*dx + dy*dy);
                            if (distance < zone.width + 30) {
                                valid = false;
                                break;
                            }
                        }
                    }
                    
                    // Comprobar que no está sobre un obstáculo
                    for (const wall of this.walls) {
                        if (wall.isObstacle && 
                            x >= wall.x - 30 && x <= wall.x + wall.width + 30 &&
                            y >= wall.y - 30 && y <= wall.y + wall.height + 30) {
                            valid = false;
                            break;
                        }
                    }
                    
                    // Comprobar que no está demasiado cerca de otra decoración
                    for (const decoration of this.decorations) {
                        const dx = x - decoration.x;
                        const dy = y - decoration.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        if (distance < 60) {
                            valid = false;
                            break;
                        }
                    }
                } while (!valid);
                
                // Tipo de decoración basado en la región
                let types, colors;
                switch (region.id) {
                    case 'plaza-central':
                        types = ['fountain', 'bench', 'flowers'];
                        colors = ['#66CCFF', '#AA8866', '#FF9999'];
                        break;
                    case 'bosque-chocolate':
                        types = ['tree', 'bush', 'mushroom'];
                        colors = ['#228822', '#55AA55', '#FF5555'];
                        break;
                    case 'montaña-galleta':
                        types = ['rock', 'crystals', 'peak'];
                        colors = ['#777777', '#AAAAFF', '#CCCCCC'];
                        break;
                    case 'playa-caramelizada':
                        types = ['palm', 'shell', 'starfish'];
                        colors = ['#00AA55', '#FFCCAA', '#FF6644'];
                        break;
                    case 'ciudad-pastelera':
                        types = ['house', 'lamppost', 'sign'];
                        colors = ['#FFAA66', '#FFFF99', '#6699FF'];
                        break;
                    case 'lago-merengue':
                        types = ['lily', 'reed', 'bridge'];
                        colors = ['#FFFFFF', '#55AA55', '#AA6622'];
                        break;
                    case 'cueva-caramelo':
                        types = ['stalagmite', 'crystal', 'bat'];
                        colors = ['#555555', '#FF55FF', '#222222'];
                        break;
                    case 'pradera-azucarada':
                        types = ['flower', 'tallgrass', 'butterfly'];
                        colors = ['#FF88FF', '#88FF88', '#FFAAAA'];
                        break;
                    case 'volcán-brownie':
                        types = ['lava', 'smoke', 'rock'];
                        colors = ['#FF5500', '#999999', '#553333'];
                        break;
                    default:
                        types = ['tree', 'rock', 'bush'];
                        colors = ['#228822', '#777777', '#55AA55'];
                }
                
                const typeIndex = Math.floor(Math.random() * types.length);
                
                this.decorations.push({
                    x: x,
                    y: y,
                    type: types[typeIndex],
                    color: colors[typeIndex],
                    size: 0.5 + Math.random() * 0.8,
                    animOffset: Math.random() * Math.PI * 2,
                    variant: Math.floor(Math.random() * 3),
                    region: region.id
                });
            }
        }
        
        // Añadir decoraciones especiales para la región "Playa Caramelizada"
        // Estos son elementos que mejorarán la experiencia de los minijuegos especiales
        if (this.regionsById['playa-caramelizada']) {
            const region = this.regionsById['playa-caramelizada'];
            
            // Añadir más palmeras alrededor de la zona de Surfista Glaseado
            const surfZone = this.minigameZones.find(z => z.scene === 'surfingGame');
            if (surfZone) {
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    const distance = 100 + Math.random() * 50;
                    const x = surfZone.x + surfZone.width/2 + Math.cos(angle) * distance;
                    const y = surfZone.y + surfZone.height/2 + Math.sin(angle) * distance;
                    
                    // Asegurarse de que está dentro de la región
                    if (x >= region.x + 50 && x <= region.x + region.width - 50 &&
                        y >= region.y + 50 && y <= region.y + region.height - 50) {
                        this.decorations.push({
                            x: x,
                            y: y,
                            type: 'palm',
                            color: '#00AA55',
                            size: 0.8 + Math.random() * 0.4,
                            animOffset: Math.random() * Math.PI * 2,
                            variant: Math.floor(Math.random() * 3),
                            region: region.id,
                            special: true
                        });
                    }
                }
            }
            
            // Añadir conchas marinas alrededor de la zona de Pescador Pastelero
            const fishingZone = this.minigameZones.find(z => z.scene === 'fishingGame');
            if (fishingZone) {
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const distance = 80 + Math.random() * 40;
                    const x = fishingZone.x + fishingZone.width/2 + Math.cos(angle) * distance;
                    const y = fishingZone.y + fishingZone.height/2 + Math.sin(angle) * distance;
                    
                    // Asegurarse de que está dentro de la región
                    if (x >= region.x + 50 && x <= region.x + region.width - 50 &&
                        y >= region.y + 50 && y <= region.y + region.height - 50) {
                        this.decorations.push({
                            x: x,
                            y: y,
                            type: 'shell',
                            color: '#FFCCAA',
                            size: 0.5 + Math.random() * 0.3,
                            animOffset: Math.random() * Math.PI * 2,
                            variant: Math.floor(Math.random() * 3),
                            region: region.id,
                            special: true
                        });
                    }
                }
            }
        }
    }

    /**
     * Dibuja un efecto de hierba alta mejorado visualmente
     */
    drawTallGrass(ctx, region) {
        const tileSize = this.map.tileSize;
        const grassChance = 0.3; // 30% de probabilidad de hierba en cada tile
        
        // Solo dibujar hierba visible en la cámara
        const startX = Math.max(Math.floor(this.camera.x / tileSize), Math.floor(region.x / tileSize));
        const startY = Math.max(Math.floor(this.camera.y / tileSize), Math.floor(region.y / tileSize));
        const endX = Math.min(Math.ceil((this.camera.x + this.camera.width) / tileSize), Math.ceil((region.x + region.width) / tileSize));
        const endY = Math.min(Math.ceil((this.camera.y + this.camera.height) / tileSize), Math.ceil((region.y + region.height) / tileSize));
        
        // Usar un valor semilla para mantener consistencia
        const seed = this.map.seed || 12345;
        
        // Determinar si estamos en bosque glaseado para usar colores temáticos
        const isGlazedForest = region.id === 'bosque-glaseado';
        
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                // Usar una función pseudoaleatoria determinista
                const value = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
                const random = value - Math.floor(value);
                
                if (random < grassChance) {
                    const grassX = x * tileSize + tileSize / 2;
                    const grassY = y * tileSize + tileSize / 2;
                    
                    // Aplicar efecto de "movimiento" basado en el tiempo
                    const time = Date.now() / 1000;
                    const swayAmount = Math.sin(time + (x * y * 0.1)) * 2;
                    
                    // Colores según la región
                    const baseColor = isGlazedForest ? '#7FFFD4' : '#228B22'; // Aguamarina para bosque glaseado, verde normal para otros
                    const highlightColor = isGlazedForest ? '#E0FFFF' : '#32CD32'; // Celeste claro para bosque glaseado, verde lima para otros
                    
                    // Dibujar hierba con gradiente
                    const gradient = ctx.createLinearGradient(grassX, grassY + 5, grassX, grassY - 12);
                    gradient.addColorStop(0, baseColor);
                    gradient.addColorStop(1, highlightColor);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 2;
                    
                    // Tallos de hierba con efecto de movimiento
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const offsetX = (i - 2) * 3;
                        ctx.moveTo(grassX + offsetX, grassY + 5);
                        ctx.quadraticCurveTo(
                            grassX + offsetX + swayAmount, 
                            grassY - 5,
                            grassX + offsetX + (random * 6 - 3), 
                            grassY - 12
                        );
                    }
                    // Eliminar línea problemática que hace referencia a waveOffset no definido
                    
                    ctx.stroke();
                }
            }
        }
    }
    
    /**
     * Dibuja una espectacular playa caramelizada con efectos visuales
     */
    drawBeach(ctx, region) {
        // Crear zonas de la playa
        const beachWidth = region.width;
        const beachHeight = region.height;
        const shoreWidth = beachWidth * 0.4; // 40% de la playa es arena
        const waterStartX = region.x + shoreWidth;
        
        // Tiempo para animaciones
        const time = Date.now() / 1000;
        
        // Dibujar fondo de arena con degradado
        const sandGradient = ctx.createLinearGradient(
            region.x, region.y, 
            waterStartX, region.y
        );
        
        // Colores temáticos para arena caramelizada
        sandGradient.addColorStop(0, '#F4A460'); // Arena sáwyer
        sandGradient.addColorStop(0.7, '#FFD700'); // Dorado
        sandGradient.addColorStop(1, '#FFDAB9'); // Melocotón
        
        ctx.fillStyle = sandGradient;
        ctx.fillRect(region.x, region.y, shoreWidth, beachHeight);
        
        // Crear efecto de agua cristalina
        const waterGradient = ctx.createLinearGradient(
            waterStartX, region.y,
            region.x + beachWidth, region.y
        );
        
        // Colores temáticos para agua de caramelo
        waterGradient.addColorStop(0, '#87CEEB'); // Azul cielo
        waterGradient.addColorStop(0.5, '#1E90FF'); // Azul dodger
        waterGradient.addColorStop(1, '#4169E1'); // Azul real
        
        ctx.fillStyle = waterGradient;
        ctx.fillRect(waterStartX, region.y, beachWidth - shoreWidth, beachHeight);
        
        // Dibujar orilla con efecto de olas
        const shoreLineCount = 5;
        const shorePadding = 10;
        
        for (let i = 0; i < shoreLineCount; i++) {
            const distFromShore = (i / shoreLineCount) * shorePadding * 2;
            const alpha = 0.8 - (i / shoreLineCount) * 0.6;
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 3 - i * 0.5;
            
            ctx.beginPath();
            
            // Punto inicial de la orilla
            const startY = region.y;
            const endY = region.y + beachHeight;
            
            ctx.moveTo(waterStartX - distFromShore + Math.sin(time) * 5, startY);
            
            // Crear curva de orilla con efecto de olas
            const segments = 20;
            for (let j = 1; j <= segments; j++) {
                const segmentY = startY + (j / segments) * beachHeight;
                const waveOffset = Math.sin(time * 2 + j * 0.5) * 10;
                const controlOffset = Math.sin(j / segments * Math.PI) * 15;
                
                ctx.lineTo(
                    waterStartX - distFromShore + waveOffset + controlOffset, 
                    segmentY
                );
            }
            
            ctx.stroke();
        }
        
        // Dibujar palmeras decorativas
        this.drawPalms(ctx, region, waterStartX);
        
        // Dibujar conchas de caramelo
        this.drawCandyShells(ctx, region, waterStartX);
        
        // Efecto de brillo en el agua
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        
        // Dibujar varios destellos en el agua
        const numGlimmers = 20;
        for (let i = 0; i < numGlimmers; i++) {
            const glimmerX = waterStartX + Math.random() * (beachWidth - shoreWidth);
            const glimmerY = region.y + Math.random() * beachHeight;
            const glimmerSize = 5 + Math.random() * 15;
            const glimmerAlpha = Math.sin(time * 2 + i) * 0.5 + 0.5;
            
            ctx.globalAlpha = glimmerAlpha * 0.4;
            ctx.beginPath();
            ctx.arc(glimmerX, glimmerY, glimmerSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Restaurar alpha
        ctx.globalAlpha = 1;
    }
    
    /**
     * Dibuja palmeras decorativas en la playa
     */
    drawPalms(ctx, region, waterStartX) {
        // Dibujar varias palmeras a lo largo de la orilla
        const numPalms = 4;
        const shoreX = waterStartX - 30;
        
        for (let i = 0; i < numPalms; i++) {
            const palmY = region.y + (region.height / (numPalms + 1)) * (i + 1);
            
            // Tronco de la palmera
            ctx.fillStyle = '#8B4513'; // Marrón silla
            ctx.beginPath();
            ctx.moveTo(shoreX - 5, palmY);
            ctx.lineTo(shoreX + 5, palmY);
            ctx.lineTo(shoreX + 3, palmY - 50);
            ctx.lineTo(shoreX - 3, palmY - 50);
            ctx.fill();
            
            // Hojas de la palmera
            const leafCount = 5;
            const time = Date.now() / 1000;
            const swayAmount = Math.sin(time + i) * 5;
            
            for (let j = 0; j < leafCount; j++) {
                const angle = (j / leafCount) * Math.PI * 2;
                
                ctx.fillStyle = '#32CD32'; // Verde lima
                ctx.beginPath();
                
                // Punto de origen de la hoja
                const leafX = shoreX;
                const leafY = palmY - 50;
                
                // Dirección y longitud de la hoja
                const leafLength = 30 + Math.random() * 15;
                const dirX = Math.cos(angle) * leafLength + swayAmount;
                const dirY = Math.sin(angle) * leafLength;
                
                // Puntos de control para la curva de la hoja
                const cp1X = leafX + dirX * 0.3;
                const cp1Y = leafY + dirY * 0.3;
                const cp2X = leafX + dirX * 0.6;
                const cp2Y = leafY + dirY * 0.6;
                
                ctx.moveTo(leafX, leafY);
                ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, leafX + dirX, leafY + dirY);
                
                // Hacer la hoja más ancha en el medio
                const width = 8;
                const perp = { x: -dirY / leafLength * width, y: dirX / leafLength * width };
                
                ctx.lineTo(leafX + dirX + perp.x, leafY + dirY + perp.y);
                ctx.bezierCurveTo(
                    cp2X + perp.x, cp2Y + perp.y,
                    cp1X + perp.x, cp1Y + perp.y,
                    leafX, leafY
                );
                
                ctx.fill();
            }
            
            // Cocos
            const coconutCount = 2 + Math.floor(Math.random() * 3);
            for (let j = 0; j < coconutCount; j++) {
                const coconutAngle = Math.random() * Math.PI * 2;
                const coconutDist = 5 + Math.random() * 8;
                const coconutX = shoreX + Math.cos(coconutAngle) * coconutDist;
                const coconutY = palmY - 50 + Math.sin(coconutAngle) * coconutDist;
                
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(coconutX, coconutY, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    /**
     * Dibuja conchas de caramelo decorativas en la playa
     */
    drawCandyShells(ctx, region, waterStartX) {
        const numShells = 12;
        
        // Colores para las conchas temáticas de caramelo
        const shellColors = [
            '#FFB6C1', // Rosa claro
            '#FFC0CB', // Rosa
            '#FFD700', // Dorado
            '#FFDAB9', // Melocotón
            '#F0E68C'  // Caqui claro
        ];
        
        // Dibujar conchas a lo largo de la orilla
        for (let i = 0; i < numShells; i++) {
            const shellX = region.x + Math.random() * (waterStartX - region.x - 20);
            const shellY = region.y + Math.random() * region.height;
            const shellSize = 4 + Math.random() * 6;
            const colorIndex = Math.floor(Math.random() * shellColors.length);
            
            ctx.fillStyle = shellColors[colorIndex];
            
            // Dibujar concha estilizada
            ctx.beginPath();
            ctx.ellipse(
                shellX, shellY, 
                shellSize, shellSize * 0.6, 
                Math.random() * Math.PI * 2, // Rotación aleatoria
                0, Math.PI * 2
            );
            ctx.fill();
            
            // Añadir detalles a la concha
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            for (let j = 0; j < 3; j++) {
                ctx.moveTo(shellX - shellSize * 0.7, shellY + j * shellSize * 0.3 - shellSize * 0.3);
                ctx.lineTo(shellX + shellSize * 0.7, shellY + j * shellSize * 0.3 - shellSize * 0.3);
            }
            ctx.stroke();
        }
    }
    
    /**
     * Dibuja efecto de oscuridad para cuevas
     */
    drawCaveEffect(ctx, region) {
        // Radio de visión alrededor del jugador
        const visionRadius = 120;
        
        // Aplicar oscuridad en toda la región
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(region.x, region.y, region.width, region.height);
        
        // Crear gradiente radial centrado en el jugador
        const gradient = ctx.createRadialGradient(
            this.player.x + this.player.width/2, this.player.y + this.player.height/2, 10,
            this.player.x + this.player.width/2, this.player.y + this.player.height/2, visionRadius
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        
        // Recortar el área de visión
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 
                visionRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Restaurar modo de composición
        ctx.globalCompositeOperation = 'source-over';
    }
    
    /**
     * Dibuja un espectacular efecto de lava para el volcán de chocolate
     */
    drawLavaEffect(ctx, region) {
        const time = Date.now() / 1000;
        
        // Dibujar base de lava en toda la región
        const lavaBaseGradient = ctx.createRadialGradient(
            region.x + region.width / 2, region.y + region.height / 2, 20,
            region.x + region.width / 2, region.y + region.height / 2, region.width / 1.5
        );
        
        // Colores temáticos para lava de chocolate
        lavaBaseGradient.addColorStop(0, '#FF4500'); // Rojo anaranjado brillante
        lavaBaseGradient.addColorStop(0.4, '#8B4513'); // Marrón silla
        lavaBaseGradient.addColorStop(0.8, '#A0522D'); // Siena
        lavaBaseGradient.addColorStop(1, '#800000'); // Granate
        
        ctx.fillStyle = lavaBaseGradient;
        ctx.fillRect(region.x, region.y, region.width, region.height);
        
        // Generar "ríos" de lava
        const numRivers = 5;
        const riverWidth = 25;
        
        for (let i = 0; i < numRivers; i++) {
            // Crear camino serpenteante para cada río
            const pathPoints = [];
            const startX = region.x + (region.width / (numRivers + 1)) * (i + 1);
            const startY = region.y;
            
            let currentX = startX;
            let currentY = startY;
            
            pathPoints.push({x: currentX, y: currentY});
            
            // Crear puntos para la curva Bezier
            const numPoints = 10;
            for (let j = 1; j <= numPoints; j++) {
                const targetY = region.y + (region.height / numPoints) * j;
                const offsetX = Math.sin(j / numPoints * Math.PI * 2 + time * 0.1 + i) * 50;
                
                currentX = startX + offsetX;
                currentY = targetY;
                
                pathPoints.push({x: currentX, y: currentY});
            }
            
            // Dibujar camino del río de lava
            ctx.beginPath();
            ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
            
            for (let j = 1; j < pathPoints.length; j++) {
                const cp1 = {
                    x: pathPoints[j-1].x,
                    y: (pathPoints[j-1].y + pathPoints[j].y) / 2
                };
                const cp2 = {
                    x: pathPoints[j].x,
                    y: (pathPoints[j-1].y + pathPoints[j].y) / 2
                };
                
                ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, pathPoints[j].x, pathPoints[j].y);
            }
            
            // Crear gradiente para el río
            const riverGradient = ctx.createLinearGradient(
                startX, startY, startX, region.y + region.height
            );
            riverGradient.addColorStop(0, '#FFCC00'); // Amarillo dorado
            riverGradient.addColorStop(0.5, '#FF6600'); // Naranja
            riverGradient.addColorStop(1, '#FF3300'); // Rojo fuego
            
            ctx.lineWidth = riverWidth + Math.sin(time * 2 + i) * 5; // Anchura pulsante
            ctx.strokeStyle = riverGradient;
            ctx.stroke();
        }
        
        // Dibujar burbujas y partículas de lava
        const numBubbles = 50;
        
        for (let i = 0; i < numBubbles; i++) {
            // Posición pseudo-aleatoria pero con cierta estabilidad
            const bubbleSeed = (i * 1337 + Math.floor(time) * 7919) % 10000;
            const bubbleRandom = bubbleSeed / 10000;
            
            const bubbleX = region.x + bubbleRandom * region.width;
            const bubbleY = region.y + ((bubbleSeed % 100) / 100) * region.height;
            
            // Tamaño variable
            const bubbleSize = 2 + bubbleRandom * 10;
            
            // Animación de ascenso
            const yOffset = -((time * 20 + bubbleSeed) % 50);
            
            // Color variable
            const brightness = 50 + Math.floor(bubbleRandom * 50);
            const bubbleColor = `rgb(255, ${brightness}, 0)`;
            
            // Dibujar burbuja
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY + yOffset, bubbleSize, 0, Math.PI * 2);
            
            // Brillo interior
            const bubbleGradient = ctx.createRadialGradient(
                bubbleX, bubbleY + yOffset, 0,
                bubbleX, bubbleY + yOffset, bubbleSize
            );
            bubbleGradient.addColorStop(0, '#FFFFFF');
            bubbleGradient.addColorStop(0.6, bubbleColor);
            bubbleGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = bubbleGradient;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Efecto de brillo global
        ctx.globalCompositeOperation = 'lighter';
        
        ctx.fillStyle = 'rgba(255, 50, 0, 0.1)';
        ctx.fillRect(region.x, region.y, region.width, region.height);
        
        // Restaurar modo de composición
        ctx.globalCompositeOperation = 'source-over';
    }
    
    /**
     * Renderiza los efectos visuales para la región actual
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} region - Región actual
     */
    renderRegionEffects(ctx, region) {
        // Aplicar efectos de iluminación si la región los tiene definidos
        if (region.lightEffect) {
            this.drawLightEffect(ctx, region);
        }
        
        // Aplicar efectos ambientales (partículas, etc.)
        if (region.ambientParticles) {
            this.drawAmbientParticles(ctx, region);
        }
        
        // Aplicar efectos climáticos (lluvia, nieve, etc.)
        if (region.weatherEffect) {
            this.drawWeatherEffect(ctx, region);
        }
        
        // Aplicar efectos especiales específicos de cada región
        if (region.specialEffect) {
            this.drawSpecialEffect(ctx, region);
        }
    }
    
    /**
     * Dibuja efectos de luz para diferentes regiones
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} region - Región actual
     */
    drawLightEffect(ctx, region) {
        const time = Date.now() / 1000;
        const lightType = region.lightEffect;
        
        switch (lightType) {
            case 'bright_day':
                // Efecto de luz brillante diurna
                ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
                ctx.fillRect(region.x, region.y, region.width, region.height);
                
                // Brillos aleatorios de luz solar
                for (let i = 0; i < 5; i++) {
                    const x = region.x + Math.random() * region.width;
                    const y = region.y + Math.random() * region.height;
                    const size = 30 + Math.random() * 50;
                    
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
                    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'forest_shade':
                // Efecto de sombras de bosque
                ctx.fillStyle = 'rgba(30, 70, 30, 0.1)';
                ctx.fillRect(region.x, region.y, region.width, region.height);
                
                // Patrones de luz filtrada a través de los árboles
                for (let i = 0; i < 15; i++) {
                    const x = region.x + Math.random() * region.width;
                    const y = region.y + Math.random() * region.height;
                    const size = 20 + Math.random() * 30;
                    
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                    gradient.addColorStop(0, 'rgba(200, 255, 200, 0.15)');
                    gradient.addColorStop(1, 'rgba(200, 255, 200, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'mountain_shadows':
                // Sombras proyectadas en las montañas
                const mountainGradient = ctx.createLinearGradient(
                    region.x, region.y,
                    region.x, region.y + region.height
                );
                mountainGradient.addColorStop(0, 'rgba(100, 100, 120, 0.1)');
                mountainGradient.addColorStop(0.5, 'rgba(70, 70, 90, 0.1)');
                mountainGradient.addColorStop(1, 'rgba(40, 40, 60, 0.2)');
                
                ctx.fillStyle = mountainGradient;
                ctx.fillRect(region.x, region.y, region.width, region.height);
                break;
                
            case 'water_reflections':
                // Reflejos del agua
                for (let i = 0; i < 20; i++) {
                    const x = region.x + Math.random() * region.width;
                    const y = region.y + Math.random() * region.height;
                    const width = 10 + Math.random() * 40;
                    const height = 3 + Math.random() * 10;
                    const angle = Math.random() * Math.PI;
                    
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(angle);
                    
                    const gradient = ctx.createLinearGradient(-width/2, 0, width/2, 0);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                    gradient.addColorStop(0.5, 'rgba(255, 255, 255, ' + (0.1 + Math.random() * 0.1) + ')');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(-width/2, -height/2, width, height);
                    ctx.restore();
                }
                break;
                
            case 'crystal_illumination':
                // Iluminación de cristales en la cueva
                for (let i = 0; i < 12; i++) {
                    const x = region.x + (region.width / 12) * i + Math.random() * 50 - 25;
                    const y = region.y + (Math.random() > 0.5 ? Math.random() * 100 : region.height - Math.random() * 100);
                    const size = 20 + Math.random() * 40;
                    
                    // Colores de cristal aleatorios
                    const colors = [
                        'rgba(100, 200, 255, 0.3)', // Azul
                        'rgba(255, 100, 200, 0.3)', // Rosa
                        'rgba(200, 255, 100, 0.3)', // Verde
                        'rgba(255, 200, 100, 0.3)'  // Ámbar
                    ];
                    
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                    gradient.addColorStop(0, colors[Math.floor(Math.random() * colors.length)]);
                    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'bright_sunlight':
                // Luz solar brillante para la pradera
                ctx.fillStyle = 'rgba(255, 255, 230, 0.1)';
                ctx.fillRect(region.x, region.y, region.width, region.height);
                
                // Destellos de luz
                for (let i = 0; i < 8; i++) {
                    const x = region.x + Math.random() * region.width;
                    const y = region.y + Math.random() * region.height;
                    const size = 40 + Math.random() * 60;
                    
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.25)');
                    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'city_lights':
                // Luces de la ciudad
                for (let i = 0; i < 30; i++) {
                    const x = region.x + 50 + Math.random() * (region.width - 100);
                    const y = region.y + 50 + Math.random() * (region.height - 100);
                    const size = 5 + Math.random() * 15;
                    const alpha = 0.1 + Math.sin(time * 2 + i) * 0.05;
                    
                    // Colores variados para las luces de la ciudad
                    const colors = [
                        `rgba(255, 255, 150, ${alpha})`, // Amarillo
                        `rgba(255, 200, 100, ${alpha})`, // Naranja
                        `rgba(200, 230, 255, ${alpha})`, // Azul claro
                        `rgba(255, 150, 150, ${alpha})`  // Rosa claro
                    ];
                    
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                    gradient.addColorStop(0, colors[i % colors.length]);
                    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }
    }
    
    /**
     * Dibuja partículas ambientales para diferentes regiones
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} region - Región actual
     */
    drawAmbientParticles(ctx, region) {
        const time = Date.now() / 1000;
        const particleType = region.ambientParticles;
        
        switch (particleType) {
            case 'forest_pollen':
                // Polén flotando en el bosque
                for (let i = 0; i < 50; i++) {
                    const seed = i * 137.5 + Math.floor(time * 0.2) * 11.3;
                    const randomX = ((seed * 15485863) % 10000) / 10000;
                    const randomY = ((seed * 285377) % 10000) / 10000;
                    
                    const x = region.x + randomX * region.width;
                    const y = region.y + randomY * region.height + Math.sin(time + i) * 5;
                    
                    // Tamaño variable del polén
                    const size = 1 + (randomX * randomY) * 3;
                    
                    // Colores variables (verde y amarillo)
                    ctx.fillStyle = `rgba(${180 + randomX * 70}, ${220 + randomY * 35}, 100, ${0.3 + randomY * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'dust_particles':
                // Partículas de polvo
                for (let i = 0; i < 40; i++) {
                    const seed = i * 273.5 + Math.floor(time * 0.1) * 23.7;
                    const randomX = ((seed * 34567) % 10000) / 10000;
                    const randomY = ((seed * 76543) % 10000) / 10000;
                    
                    const x = region.x + randomX * region.width;
                    const y = region.y + randomY * region.height + Math.sin(time * 0.5 + i) * 2;
                    
                    // Tamaño variable del polvo
                    const size = 0.5 + randomY * 1.5;
                    
                    // Colores variables (tonos marrones/beige)
                    const alpha = 0.2 + randomX * 0.3;
                    ctx.fillStyle = `rgba(210, 180, 140, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'water_bubbles':
                // Burbujas en el agua
                for (let i = 0; i < 30; i++) {
                    const seed = i * 195.3 + Math.floor(time * 0.3) * 17.1;
                    const randomX = ((seed * 23456) % 10000) / 10000;
                    
                    // Movimiento ascendente de las burbujas
                    const yOffset = ((time * 15 + seed) % 100) / 100;
                    const y = region.y + region.height - yOffset * region.height;
                    const x = region.x + randomX * region.width + Math.sin(time + i) * 3;
                    
                    // Tamaño variable de las burbujas
                    const size = 1 + randomX * 4;
                    
                    // Brillo interior
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
                    gradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(150, 200, 255, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'floating_embers':
                // Ascuas flotantes para zonas volcánicas
                for (let i = 0; i < 25; i++) {
                    const seed = i * 357.9 + Math.floor(time * 0.2) * 19.3;
                    const randomX = ((seed * 45673) % 10000) / 10000;
                    
                    // Movimiento ascendente de las ascuas
                    const yOffset = ((time * 10 + seed) % 100) / 100;
                    const y = region.y + region.height - yOffset * region.height * 0.7;
                    const x = region.x + randomX * region.width + Math.sin(time * 0.3 + i) * 8;
                    
                    // Tamaño variable
                    const size = 1 + randomX * 2;
                    
                    // Brillo oscilante
                    const alpha = 0.5 + Math.sin(time * 3 + i) * 0.3;
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
                    gradient.addColorStop(0, `rgba(255, 200, 0, ${alpha})`);
                    gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`);
                    gradient.addColorStop(1, 'rgba(200, 0, 0, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Núcleo brillante
                    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'sparkling_sugar':
                // Destellos de azúcar para las praderas azucaradas
                for (let i = 0; i < 60; i++) {
                    const seed = i * 239.7 + Math.floor(time * 0.1) * 13.5;
                    const randomX = ((seed * 98765) % 10000) / 10000;
                    const randomY = ((seed * 12345) % 10000) / 10000;
                    
                    const x = region.x + randomX * region.width;
                    const y = region.y + randomY * region.height;
                    
                    // Brillo parpadeante
                    const alpha = 0.1 + Math.sin(time * 4 + i * 0.3) * 0.4;
                    if (alpha <= 0) continue; // Omitir si no es visible
                    
                    // Tamaño variable
                    const size = 0.5 + randomX * 1.5;
                    
                    // Colores pasteles
                    const colors = [
                        `rgba(255, 255, 255, ${alpha})`, // Blanco
                        `rgba(255, 230, 240, ${alpha})`, // Rosa claro
                        `rgba(230, 255, 240, ${alpha})`, // Verde menta
                        `rgba(240, 240, 255, ${alpha})`  // Azul lavanda
                    ];
                    
                    ctx.fillStyle = colors[Math.floor(i % 4)];
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'city_dust':
                // Polvo urbano para la ciudad
                ctx.globalAlpha = 0.3;
                for (let i = 0; i < 70; i++) {
                    const seed = i * 179.3 + Math.floor(time * 0.05) * 29.7;
                    const randomX = ((seed * 67890) % 10000) / 10000;
                    const randomY = ((seed * 12345) % 10000) / 10000;
                    
                    const x = region.x + randomX * region.width;
                    const y = region.y + randomY * region.height + Math.sin(time * 0.2 + i) * 1;
                    
                    // Tamaño variable
                    const size = 0.3 + randomY * 0.8;
                    
                    // Tonos grises para polvo urbano
                    const brightness = 150 + Math.floor(randomX * 50);
                    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
                break;
        }
    }
    
    /**
     * Dibuja efectos climáticos para diferentes regiones
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} region - Región actual
     */
    drawWeatherEffect(ctx, region) {
        const time = Date.now() / 1000;
        const weatherType = region.weatherEffect;
        
        switch (weatherType) {
            case 'light_rain':
                // Lluvia ligera
                ctx.strokeStyle = 'rgba(150, 190, 255, 0.7)';
                ctx.lineWidth = 1;
                
                for (let i = 0; i < 80; i++) {
                    const seed = i * 456.7 + Math.floor(time * 2) * 7.3;
                    const randomX = ((seed * 23456) % 10000) / 10000;
                    
                    // Posición vertical variable para efecto de movimiento
                    const yOffset = ((time * 40 + seed) % 100) / 100;
                    
                    const x = region.x + randomX * region.width;
                    const y = region.y + yOffset * region.height;
                    
                    // Línea de lluvia
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x - 1, y + 8); // Ligera inclinación
                    ctx.stroke();
                }
                break;
                
            case 'heavy_rain':
                // Lluvia intensa
                for (let i = 0; i < 200; i++) {
                    const seed = i * 123.4 + Math.floor(time * 3) * 9.7;
                    const randomX = ((seed * 76543) % 10000) / 10000;
                    
                    // Posición vertical variable para efecto de movimiento
                    const yOffset = ((time * 70 + seed) % 100) / 100;
                    
                    const x = region.x + randomX * region.width;
                    const y = region.y + yOffset * region.height;
                    
                    // Grosor variable
                    const thickness = 1 + randomX * 1.5;
                    
                    // Transparencia variable
                    const alpha = 0.3 + randomX * 0.4;
                    
                    // Línea de lluvia
                    ctx.strokeStyle = `rgba(150, 190, 255, ${alpha})`;
                    ctx.lineWidth = thickness;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x - 3, y + 15); // Mayor inclinación
                    ctx.stroke();
                }
                
                // Añadir efecto de salpicaduras
                ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
                for (let i = 0; i < 30; i++) {
                    const seed = i * 567.8 + Math.floor(time * 2) * 11.3;
                    const randomX = ((seed * 98765) % 10000) / 10000;
                    const randomY = ((seed * 56789) % 10000) / 10000;
                    
                    const x = region.x + randomX * region.width;
                    const y = region.y + region.height - 50 + randomY * 40;
                    
                    // Tamaño variable de la salpicadura
                    const size = 1 + randomX * 2;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'light_snow':
                // Nieve ligera
                for (let i = 0; i < 60; i++) {
                    const seed = i * 789.1 + Math.floor(time) * 5.3;
                    const randomX = ((seed * 34567) % 10000) / 10000;
                    
                    // Movimiento ondulante y descendente
                    const yOffset = ((time * 15 + seed) % 100) / 100;
                    const xOffset = Math.sin(time + i) * 5;
                    
                    const x = region.x + randomX * region.width + xOffset;
                    const y = region.y + yOffset * region.height;
                    
                    // Tamaño variable del copo
                    const size = 1 + randomX * 2;
                    
                    // Transparencia variable
                    const alpha = 0.4 + randomX * 0.4;
                    
                    // Copo de nieve
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'heavy_snow':
                // Nieve intensa
                for (let i = 0; i < 150; i++) {
                    const seed = i * 234.5 + Math.floor(time) * 8.7;
                    const randomX = ((seed * 87654) % 10000) / 10000;
                    const randomSize = ((seed * 43210) % 10000) / 10000;
                    
                    // Movimiento ondulante y descendente
                    const yOffset = ((time * 25 + seed) % 100) / 100;
                    const xOffset = Math.sin(time * 0.5 + i) * 10;
                    
                    const x = region.x + randomX * region.width + xOffset;
                    const y = region.y + yOffset * region.height;
                    
                    // Tamaño variable del copo
                    const size = 1.5 + randomSize * 3;
                    
                    // Transparencia variable
                    const alpha = 0.5 + randomSize * 0.4;
                    
                    // Copo de nieve
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    
                    // Diferentes formas de copos
                    if (i % 4 === 0) {
                        // Copo redondo
                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Copo estrellado (simplificado)
                        ctx.save();
                        ctx.translate(x, y);
                        ctx.rotate(time * 0.1 + i);
                        
                        ctx.beginPath();
                        for (let j = 0; j < 6; j++) {
                            const angle = (Math.PI * 2 / 6) * j;
                            const innerRadius = size * 0.5;
                            const outerRadius = size * 1.5;
                            
                            ctx.moveTo(0, 0);
                            ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
                        }
                        ctx.fill();
                        ctx.restore();
                    }
                }
                
                // Añadir acumulación de nieve en el suelo
                const snowLineGradient = ctx.createLinearGradient(
                    region.x, region.y + region.height - 50,
                    region.x, region.y + region.height
                );
                snowLineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                snowLineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
                
                ctx.fillStyle = snowLineGradient;
                ctx.fillRect(region.x, region.y + region.height - 50, region.width, 50);
                break;
                
            case 'foggy':
                // Niebla
                ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
                ctx.fillRect(region.x, region.y, region.width, region.height);
                
                // Capas de niebla con densidad variable
                for (let i = 0; i < 5; i++) {
                    const yPos = region.y + (region.height / 5) * i;
                    const fogHeight = region.height / 5;
                    
                    const fogGradient = ctx.createLinearGradient(
                        region.x, yPos,
                        region.x, yPos + fogHeight
                    );
                    
                    const alpha = 0.1 + (Math.sin(time * 0.2 + i) * 0.05);
                    fogGradient.addColorStop(0, `rgba(220, 220, 220, ${alpha})`);
                    fogGradient.addColorStop(0.5, `rgba(200, 200, 200, ${alpha + 0.05})`);
                    fogGradient.addColorStop(1, `rgba(220, 220, 220, ${alpha})`);
                    
                    ctx.fillStyle = fogGradient;
                    ctx.fillRect(region.x, yPos, region.width, fogHeight);
                }
                break;
                
            case 'falling_leaves':
                // Hojas cayendo (para bosque en otoño)
                for (let i = 0; i < 40; i++) {
                    const seed = i * 345.6 + Math.floor(time) * 7.1;
                    const randomX = ((seed * 45678) % 10000) / 10000;
                    
                    // Movimiento ondulante y descendente
                    const yOffset = ((time * 10 + seed) % 100) / 100;
                    const xOffset = Math.sin(time + i * 2.7) * 15;
                    
                    const x = region.x + randomX * region.width + xOffset;
                    const y = region.y + yOffset * region.height;
                    
                    // Tamaño variable de la hoja
                    const size = 3 + randomX * 4;
                    
                    // Colores otoñales
                    const colors = [
                        'rgba(205, 133, 63, 0.8)', // Marrón
                        'rgba(210, 105, 30, 0.8)', // Chocolate
                        'rgba(139, 69, 19, 0.8)',  // Silla de montar marrón
                        'rgba(160, 82, 45, 0.8)'   // Siena
                    ];
                    
                    // Rotación de la hoja
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(time + i);
                    
                    ctx.fillStyle = colors[i % 4];
                    
                    // Forma de hoja simple
                    ctx.beginPath();
                    ctx.ellipse(0, 0, size, size * 1.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Vena central de la hoja
                    ctx.strokeStyle = 'rgba(100, 50, 0, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, -size * 1.5);
                    ctx.lineTo(0, size * 1.5);
                    ctx.stroke();
                    
                    ctx.restore();
                }
                break;
        }
    }
    
    /**
     * Dibuja efectos especiales específicos para cada región
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} region - Región actual
     */
    drawSpecialEffect(ctx, region) {
        const time = Date.now() / 1000;
        const effectType = region.specialEffect;
        
        switch (effectType) {
            case 'chocolate_ripples':
                // Ondas de chocolate líquido
                for (let i = 0; i < 5; i++) {
                    const yPos = region.y + (region.height / 6) * (i + 0.5);
                    const waveHeight = 20;
                    
                    ctx.beginPath();
                    ctx.moveTo(region.x, yPos);
                    
                    // Onda sinusoidal con variación temporal
                    for (let x = 0; x <= region.width; x += 10) {
                        const y = yPos + Math.sin(x * 0.03 + time + i) * waveHeight;
                        ctx.lineTo(region.x + x, y);
                    }
                    
                    // Gradient chocolate
                    const gradient = ctx.createLinearGradient(region.x, yPos - waveHeight, region.x, yPos + waveHeight);
                    gradient.addColorStop(0, 'rgba(92, 51, 23, 0.5)');
                    gradient.addColorStop(0.5, 'rgba(139, 69, 19, 0.5)');
                    gradient.addColorStop(1, 'rgba(92, 51, 23, 0.5)');
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 10;
                    ctx.stroke();
                }
                break;
                
            case 'cookie_crumbs':
                // Migas de galleta cayendo
                for (let i = 0; i < 30; i++) {
                    const seed = i * 987.6 + Math.floor(time) * 13.7;
                    const randomX = ((seed * 54321) % 10000) / 10000;
                    
                    // Movimiento descendente
                    const yOffset = ((time * 30 + seed) % 100) / 100;
                    const xOffset = Math.sin(time * 0.5 + i) * 5;
                    
                    const x = region.x + randomX * region.width + xOffset;
                    const y = region.y + yOffset * region.height;
                    
                    // Tamaño variable
                    const size = 1 + randomX * 3;
                    
                    // Colores marrones variables
                    const brightness = 150 + Math.floor(randomX * 50);
                    ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.7}, ${brightness * 0.4})`;
                    
                    // Forma irregular para las migas
                    ctx.beginPath();
                    const numPoints = 5 + Math.floor(randomX * 3);
                    for (let j = 0; j < numPoints; j++) {
                        const angle = (Math.PI * 2 / numPoints) * j;
                        const radius = size * (0.8 + Math.random() * 0.4);
                        const pointX = x + Math.cos(angle) * radius;
                        const pointY = y + Math.sin(angle) * radius;
                        
                        if (j === 0) {
                            ctx.moveTo(pointX, pointY);
                        } else {
                            ctx.lineTo(pointX, pointY);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                }
                break;
                
            case 'sugar_sparkles':
                // Destellos de azúcar
                ctx.globalCompositeOperation = 'lighter';
                
                for (let i = 0; i < 50; i++) {
                    const seed = i * 567.8 + Math.floor(time * 2) * 11.9;
                    const randomX = ((seed * 67890) % 10000) / 10000;
                    const randomY = ((seed * 12345) % 10000) / 10000;
                    
                    const x = region.x + randomX * region.width;
                    const y = region.y + randomY * region.height;
                    
                    // Tamaño variable
                    const size = 1 + randomX * 2;
                    
                    // Brillo parpadeante
                    const alpha = Math.max(0, Math.sin(time * 3 + i));
                    
                    // Colores pasteles brillantes
                    const colors = [
                        `rgba(255, 255, 255, ${alpha * 0.8})`,
                        `rgba(255, 240, 245, ${alpha * 0.7})`,
                        `rgba(240, 255, 240, ${alpha * 0.7})`,
                        `rgba(240, 248, 255, ${alpha * 0.7})`
                    ];
                    
                    // Destello
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
                    gradient.addColorStop(0, colors[i % 4]);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.globalCompositeOperation = 'source-over';
                break;
                
            case 'volcanic_smoke':
                // Humo volcánico
                const numClouds = 3;
                
                for (let i = 0; i < numClouds; i++) {
                    // Posición de origen del humo
                    const originX = region.x + region.width * (0.3 + i * 0.2);
                    const originY = region.y + region.height * 0.7;
                    
                    // Altura variable del humo
                    const smokeHeight = 150 + Math.sin(time * 0.2 + i) * 30;
                    
                    // Gradiente de humo
                    const smokeGradient = ctx.createLinearGradient(
                        originX, originY,
                        originX, originY - smokeHeight
                    );
                    
                    smokeGradient.addColorStop(0, 'rgba(100, 100, 100, 0.8)');
                    smokeGradient.addColorStop(0.3, 'rgba(120, 120, 120, 0.6)');
                    smokeGradient.addColorStop(0.7, 'rgba(150, 150, 150, 0.4)');
                    smokeGradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
                    
                    // Dibujamos la columna de humo con formas irregulares
                    ctx.fillStyle = smokeGradient;
                    
                    ctx.beginPath();
                    ctx.moveTo(originX - 40, originY);
                    
                    // Lado izquierdo del humo
                    for (let y = 0; y < smokeHeight; y += 20) {
                        const waveFactor = 10 + Math.sin(y * 0.1 + time + i) * 15;
                        const x = originX - 40 - waveFactor - (y * 0.2);
                        ctx.lineTo(x, originY - y);
                    }
                    
                    // Parte superior
                    ctx.lineTo(originX, originY - smokeHeight - 20);
                    
                    // Lado derecho
                    for (let y = 0; y < smokeHeight; y += 20) {
                        const waveFactor = 10 + Math.sin(y * 0.1 + time + i + 10) * 15;
                        const x = originX + 40 + waveFactor + (y * 0.2);
                        ctx.lineTo(x, originY - (smokeHeight - y));
                    }
                    
                    ctx.closePath();
                    ctx.fill();
                }
                break;
                
            case 'caramel_bubbles':
                // Burbujas de caramelo
                for (let i = 0; i < 40; i++) {
                    const seed = i * 789.1 + Math.floor(time) * 15.3;
                    const randomX = ((seed * 54321) % 10000) / 10000;
                    const randomY = ((seed * 98765) % 10000) / 10000;
                    
                    // Movimiento ascendente lento
                    const yOffset = ((time * 5 + seed) % 100) / 100;
                    const y = region.y + region.height - yOffset * region.height * 0.5;
                    const x = region.x + randomX * region.width + Math.sin(time + i) * 5;
                    
                    // Tamaño variable
                    const size = 2 + randomX * 8;
                    
                    // Colores caramelo
                    const colors = [
                        'rgba(210, 105, 30, 0.6)', // Chocolate
                        'rgba(184, 134, 11, 0.6)', // Oro oscuro
                        'rgba(160, 82, 45, 0.6)'   // Siena
                    ];
                    
                    // Burbuja
                    ctx.fillStyle = colors[i % 3];
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Brillo de la burbuja
                    const gradient = ctx.createRadialGradient(
                        x - size * 0.3, y - size * 0.3, size * 0.1,
                        x, y, size
                    );
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'forest_fireflies':
                // Luciérnagas en el bosque
                ctx.globalCompositeOperation = 'lighter';
                
                for (let i = 0; i < 25; i++) {
                    // Movimiento aleatorio pero suave de las luciérnagas
                    const t = time * 0.3 + i * 10;
                    const x = region.x + region.width * 0.5 + Math.sin(t * 0.5) * region.width * 0.4;
                    const y = region.y + region.height * 0.5 + Math.cos(t * 0.3) * region.height * 0.4;
                    
                    // Parpadeo
                    const blink = 0.2 + Math.sin(time * 2 + i * 1.5) * 0.8;
                    const alpha = Math.max(0, blink);
                    
                    // Tamaño variable
                    const size = 1 + Math.random() * 2;
                    
                    // Luz de la luciérnaga
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
                    gradient.addColorStop(0, `rgba(230, 255, 100, ${alpha})`);
                    gradient.addColorStop(0.5, `rgba(180, 255, 0, ${alpha * 0.5})`);
                    gradient.addColorStop(1, 'rgba(100, 150, 0, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, size * 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.globalCompositeOperation = 'source-over';
                break;
        }
    }
    
    /**
     * Dibuja el grid de tiles
     */
    drawTileGrid(ctx, region) {
        const tileSize = this.map.tileSize;
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        // Dibujar líneas verticales
        for (let x = 0; x <= region.width; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(region.x + x, region.y);
            ctx.lineTo(region.x + x, region.y + region.height);
            ctx.stroke();
        }
        
        // Dibujar líneas horizontales
        for (let y = 0; y <= region.height; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(region.x, region.y + y);
            ctx.lineTo(region.x + region.width, region.y + y);
            ctx.stroke();
        }
    }
    
    /**
     * Genera caminos entre las zonas de minijuegos
     */
    generatePaths() {
        // Verificar que los arrays estén inicializados
        if (!this.paths) this.paths = [];
        if (!this.minigameZones) {
            console.warn('No hay zonas de minijuegos definidas');
            return;
        }
        
        // Crear caminos dentro de cada región
        const regionPaths = {};
        
        // Agrupar zonas por región
        for (const region of this.regions) {
            regionPaths[region.id] = [];
        }
        
        // Encontrar zonas para cada región
        for (let i = 0; i < this.minigameZones.length; i++) {
            const zone = this.minigameZones[i];
            if (!zone) continue;
            
            const regionId = zone.region;
            if (regionPaths[regionId]) {
                regionPaths[regionId].push(i);
            }
        }
        
        // Para cada región, crear caminos entre sus zonas
        for (const regionId in regionPaths) {
            const zones = regionPaths[regionId];
            
            // Si hay menos de 2 zonas, no hay caminos que crear
            if (!zones || zones.length < 2) continue;
            
            // Crear caminos entre todas las zonas de la misma región
            for (let i = 0; i < zones.length; i++) {
                for (let j = i + 1; j < zones.length; j++) {
                    const fromIndex = zones[i];
                    const toIndex = zones[j];
                    
                    if (fromIndex === undefined || toIndex === undefined) continue;
                    
                    const fromZone = this.minigameZones[fromIndex];
                    const toZone = this.minigameZones[toIndex];
                    
                    if (!fromZone || !toZone) continue;
                    
                    // Determinar el tipo de camino según la región
                    let pathType = 'normal';
                    let pathColor = '#ffffff';
                    
                    if (regionId === 'playa-caramelizada') {
                        pathType = 'beach';
                        pathColor = '#ADD8E6'; // Light blue para playa
                    } else if (regionId === 'bosque-chocolate') {
                        pathType = 'forest';
                        pathColor = '#228B22'; // Forest green para bosque
                    } else if (regionId === 'montaña-galleta') {
                        pathType = 'mountain';
                        pathColor = '#A9A9A9'; // Dark gray para montaña
                    } else if (regionId === 'volcán-brownie') {
                        pathType = 'lava';
                        pathColor = '#FF4500'; // Orange-red para lava
                    } else if (regionId === 'cueva-caramelo') {
                        pathType = 'cave';
                        pathColor = '#696969'; // Dim gray para cueva
                    }
                    
                    // Añadir el camino
                    this.paths.push({
                        from: fromIndex,
                        to: toIndex,
                        color: pathColor,
                        width: 2,
                        type: pathType,
                        dashOffset: Math.random() * 10 // Para animación
                    });
                }
            }
        }
        
        // Añadir algunos caminos entre regiones adyacentes
        const regionConnections = [
            { from: 'plaza-central', to: 'bosque-chocolate' },
            { from: 'plaza-central', to: 'playa-caramelizada' },
            { from: 'bosque-chocolate', to: 'montaña-galleta' },
            { from: 'playa-caramelizada', to: 'ciudad-pastelera' },
            { from: 'ciudad-pastelera', to: 'lago-merengue' },
            { from: 'cueva-caramelo', to: 'pradera-azucarada' },
            { from: 'pradera-azucarada', to: 'volcán-brownie' }
        ];
        
        for (const connection of regionConnections) {
            if (!connection.from || !connection.to) continue;
            
            // Encontrar una zona en cada región
            const fromZones = this.minigameZones.filter(z => z && z.region === connection.from);
            const toZones = this.minigameZones.filter(z => z && z.region === connection.to);
            
            if (fromZones.length > 0 && toZones.length > 0) {
                // Elegir zonas aleatorias para conectar
                const fromZone = fromZones[Math.floor(Math.random() * fromZones.length)];
                const toZone = toZones[Math.floor(Math.random() * toZones.length)];
                
                if (!fromZone || !toZone) continue;
                
                // Encontrar índices
                const fromIndex = this.minigameZones.findIndex(z => 
                    z && z.x === fromZone.x && z.y === fromZone.y && z.region === fromZone.region);
                const toIndex = this.minigameZones.findIndex(z => 
                    z && z.x === toZone.x && z.y === toZone.y && z.region === toZone.region);
                
                // Añadir camino entre regiones
                if (fromIndex !== -1 && toIndex !== -1) {
                    this.paths.push({
                        from: fromIndex,
                        to: toIndex,
                        color: '#FFFF00', // Yellow para caminos entre regiones
                        width: 3,
                        type: 'bridge',
                        dashOffset: Math.random() * 10
                    });
                }
            }
        }
    }
    
    /**
     * Genera decoraciones temáticas para cada región
     */
    generateDecorations() {
        // Verificar que el array esté inicializado
        if (!this.decorations) this.decorations = [];
        if (!this.minigameZones) {
            console.warn('No hay zonas de minijuegos definidas para posicionar decoraciones');
            this.minigameZones = [];
        }
        
        for (const region of this.regions) {
            if (!region || !region.id) continue;
            
            try {
                // Número de decoraciones basado en el tamaño de la región
                const area = region.width * region.height;
                const numDecorations = Math.floor(area / 10000) + 5; // Ajustar según necesidad
                
                for (let i = 0; i < numDecorations; i++) {
                    // Posición aleatoria dentro de la región
                    const x = region.x + Math.random() * region.width;
                    const y = region.y + Math.random() * region.height;
                    
                    // Evitar colocar decoraciones sobre minijuegos
                    let collides = false;
                    for (const zone of this.minigameZones) {
                        if (!zone) continue;
                        
                        if (zone.region === region.id) {
                            const distX = Math.abs(x - (zone.x + zone.width/2));
                            const distY = Math.abs(y - (zone.y + zone.height/2));
                            if (distX < zone.width && distY < zone.height) {
                                collides = true;
                                break;
                            }
                        }
                    }
                    
                    if (collides) continue;
                    
                    // Tipo y color según la región
                    let type = 'tree';
                    let color = '#4CAF50';
                    
                    switch (region.id) {
                        case 'plaza-central':
                            type = Math.random() < 0.7 ? 'flower' : 'tree';
                            color = ['#FF5555', '#FF9966', '#FFFF99', '#99FF99', '#9999FF'][Math.floor(Math.random() * 5)];
                            break;
                        case 'bosque-chocolate':
                            type = 'tree';
                            color = ['#8B4513', '#A0522D', '#6B8E23'][Math.floor(Math.random() * 3)];
                            break;
                        case 'montaña-galleta':
                            type = 'rock';
                            color = ['#A9A9A9', '#D3D3D3', '#CD853F'][Math.floor(Math.random() * 3)];
                            break;
                        case 'playa-caramelizada':
                            type = Math.random() < 0.5 ? 'palm' : (Math.random() < 0.5 ? 'shell' : 'starfish');
                            color = ['#FFD700', '#00CED1', '#FF6347', '#98FB98'][Math.floor(Math.random() * 4)];
                            break;
                        case 'ciudad-pastelera':
                            type = Math.random() < 0.7 ? 'building' : 'lamp';
                            color = ['#FF99CC', '#99CCFF', '#FFCC99', '#CCFFCC'][Math.floor(Math.random() * 4)];
                            break;
                        case 'lago-merengue':
                            type = Math.random() < 0.5 ? 'water_lily' : 'bridge';
                            color = ['#4682B4', '#87CEEB', '#00BFFF'][Math.floor(Math.random() * 3)];
                            break;
                        case 'cueva-caramelo':
                            type = Math.random() < 0.5 ? 'crystal' : 'stalagmite';
                            color = ['#9370DB', '#8A2BE2', '#BA55D3'][Math.floor(Math.random() * 3)];
                            break;
                        case 'pradera-azucarada':
                            type = Math.random() < 0.7 ? 'flower' : 'bush';
                            color = ['#FF9999', '#FFCC99', '#FFFF99', '#99FF99', '#9999FF'][Math.floor(Math.random() * 5)];
                            break;
                        case 'volcán-brownie':
                            type = Math.random() < 0.5 ? 'lava_pool' : 'volcanic_rock';
                            color = ['#FF4500', '#FF6347', '#8B0000'][Math.floor(Math.random() * 3)];
                            break;
                    }
                    
                    // Crear decoración
                    this.decorations.push({
                        x,
                        y,
                        type,
                        color,
                        size: 0.5 + Math.random() * 0.5, // Tamaño aleatorio
                        region: region.id,
                        animOffset: Math.random() * Math.PI * 2, // Offset para animación
                        special: Math.random() < 0.1 // 10% de ser especial con efectos adicionales
                    });
                }
            } catch (error) {
                console.error(`Error al generar decoraciones para la región ${region.id}:`, error);
            }
        }
    }
    
    /**
     * Genera monedas coleccionables en el mapa
     */
    generateCoins() {
        // Verificar que el array esté inicializado
        if (!this.coins) this.coins = [];
        if (!this.minigameZones) {
            console.warn('No hay zonas de minijuegos definidas para posicionar monedas');
            this.minigameZones = [];
        }
        if (!this.decorations) {
            console.warn('No hay decoraciones definidas para posicionar monedas');
            this.decorations = [];
        }
        
        // Para cada región, generar monedas
        for (const region of this.regions) {
            if (!region || !region.id) continue;
            
            try {
                // Número de monedas basado en el tamaño de la región
                const area = region.width * region.height;
                const numCoins = Math.floor(area / 20000) + 3; // Ajustar según necesidad
                
                for (let i = 0; i < numCoins; i++) {
                    // Posición aleatoria dentro de la región, evitando bordes
                    const margin = 50;
                    const x = region.x + margin + Math.random() * (region.width - margin * 2);
                    const y = region.y + margin + Math.random() * (region.height - margin * 2);
                    
                    // Evitar colocar monedas sobre minijuegos
                    let collides = false;
                    for (const zone of this.minigameZones) {
                        if (!zone) continue;
                        
                        if (zone.region === region.id) {
                            const distX = Math.abs(x - (zone.x + zone.width/2));
                            const distY = Math.abs(y - (zone.y + zone.height/2));
                            if (distX < zone.width * 1.2 && distY < zone.height * 1.2) {
                                collides = true;
                                break;
                            }
                        }
                    }
                    
                    // También evitar colocar sobre decoraciones
                    for (const decoration of this.decorations) {
                        if (!decoration) continue;
                        
                        if (decoration.region === region.id) {
                            const dist = Math.sqrt(Math.pow(x - decoration.x, 2) + Math.pow(y - decoration.y, 2));
                            if (dist < 30 * (decoration.size || 1)) {
                                collides = true;
                                break;
                            }
                        }
                    }
                    
                    if (collides) continue;
                    
                    // Color y valor según la región
                    let color = '#FFD700';
                    let value = 1;
                    
                    switch (region.id) {
                        case 'plaza-central':
                            color = '#FFD700'; // Gold
                            value = 1;
                            break;
                        case 'bosque-chocolate':
                            color = '#CD7F32'; // Bronze
                            value = 2;
                            break;
                        case 'montaña-galleta':
                            color = '#C0C0C0'; // Silver
                            value = 3;
                            break;
                        case 'playa-caramelizada':
                            color = '#00FFFF'; // Aqua
                            value = 5;
                            break;
                        case 'ciudad-pastelera':
                            color = '#4169E1'; // Royal Blue
                            value = 3;
                            break;
                        case 'lago-merengue':
                            color = '#FF00FF'; // Magenta
                            value = 4;
                            break;
                        case 'cueva-caramelo':
                            color = '#800080'; // Purple
                            value = 7;
                            break;
                        case 'pradera-azucarada':
                            color = '#32CD32'; // Lime Green
                            value = 2;
                            break;
                        case 'volcán-brownie':
                            color = '#FF4500'; // Orange Red
                            value = 10;
                            break;
                    }
                    
                    // Crear moneda
                    this.coins.push({
                        x,
                        y,
                        color,
                        value,
                        collected: false,
                        region: region.id,
                        animTimer: Math.random() * Math.PI * 2 // Offset para animación
                    });
                }
            } catch (error) {
                console.error(`Error al generar monedas para la región ${region.id}:`, error);
            }
        }
    }

    /**
     * Dibuja un fondo general para todo el mapa
     */
    drawMapBackground(ctx) {
        // Dibujar un patrón de fondo para las áreas fuera de las regiones
        const patternSize = 64;
        const viewportLeft = Math.floor(this.camera.x / patternSize) * patternSize;
        const viewportTop = Math.floor(this.camera.y / patternSize) * patternSize;
        const viewportRight = Math.ceil((this.camera.x + this.camera.width) / patternSize) * patternSize;
        const viewportBottom = Math.ceil((this.camera.y + this.camera.height) / patternSize) * patternSize;
        
        // Color base para el fondo exterior
        ctx.fillStyle = '#2a623d'; // Verde bosque oscuro
        ctx.fillRect(viewportLeft, viewportTop, viewportRight - viewportLeft, viewportBottom - viewportTop);
        
        // Dibujar patrón de "bosque" o "naturaleza" fuera de las regiones
        for (let x = viewportLeft; x < viewportRight; x += patternSize) {
            for (let y = viewportTop; y < viewportBottom; y += patternSize) {
                // Verificar si este punto está dentro de alguna región
                let isInsideRegion = false;
                for (const region of this.regions) {
                    if (x >= region.x && x < region.x + region.width &&
                        y >= region.y && y < region.y + region.height) {
                        isInsideRegion = true;
                        break;
                    }
                }
                
                // Si no está dentro de una región, dibujar elemento decorativo
                if (!isInsideRegion) {
                    // Usar un valor semilla para mantener consistencia
                    const seed = (x * 1731 + y * 4271) % 10;
                    
                    if (seed < 3) { // 30% de probabilidad: árbol
                        this.drawTree(ctx, x + patternSize/2, y + patternSize/2);
                    } else if (seed < 5) { // 20% de probabilidad: arbusto
                        this.drawBush(ctx, x + patternSize/2, y + patternSize/2);
                    } else if (seed < 6) { // 10% de probabilidad: flor
                        this.drawFlower(ctx, x + patternSize/2, y + patternSize/2);
                    }
                    // 40% restante: espacio vacío
                }
            }
        }
    }
    
    /**
     * Dibuja bordes decorativos alrededor de una región
     */
    drawRegionBorders(ctx, region) {
        const borderWidth = 8;
        
        // Seleccionar estilo de borde según el tipo de región
        let borderPattern;
        let borderColor;
        
        switch (region.id) {
            case 'plaza-central':
                borderColor = '#8B4513'; // Marrón
                borderPattern = 'stone';
                break;
            case 'bosque-glaseado':
                borderColor = '#228B22'; // Verde bosque
                borderPattern = 'hedge';
                break;
            case 'montaña-chocolate':
                borderColor = '#8B4513'; // Marrón chocolate
                borderPattern = 'rock';
                break;
            case 'cueva-caramelo':
                borderColor = '#663399'; // Púrpura
                borderPattern = 'crystal';
                break;
            case 'playa-caramelizada':
                borderColor = '#FFD700'; // Dorado
                borderPattern = 'sand';
                break;
            default:
                borderColor = '#8B4513';
                borderPattern = 'stone';
        }
        
        // Dibujar bordes
        ctx.fillStyle = borderColor;
        
        // Borde superior
        ctx.fillRect(region.x - borderWidth, region.y - borderWidth, 
                     region.width + borderWidth * 2, borderWidth);
        
        // Borde inferior
        ctx.fillRect(region.x - borderWidth, region.y + region.height, 
                     region.width + borderWidth * 2, borderWidth);
        
        // Borde izquierdo
        ctx.fillRect(region.x - borderWidth, region.y, 
                     borderWidth, region.height);
        
        // Borde derecho
        ctx.fillRect(region.x + region.width, region.y, 
                     borderWidth, region.height);
        
        // Añadir detalles al borde según el patrón
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        // Dibujar detalles en los bordes según el patrón seleccionado
        const segmentSize = 16; // Tamaño de cada segmento de patrón
        
        // Patrón para los bordes horizontales
        for (let x = region.x - borderWidth; x < region.x + region.width + borderWidth; x += segmentSize) {
            // Borde superior
            this.drawBorderPattern(ctx, x, region.y - borderWidth/2, borderPattern, 'horizontal');
            
            // Borde inferior
            this.drawBorderPattern(ctx, x, region.y + region.height + borderWidth/2, borderPattern, 'horizontal');
        }
        
        // Patrón para los bordes verticales
        for (let y = region.y; y < region.y + region.height; y += segmentSize) {
            // Borde izquierdo
            this.drawBorderPattern(ctx, region.x - borderWidth/2, y, borderPattern, 'vertical');
            
            // Borde derecho
            this.drawBorderPattern(ctx, region.x + region.width + borderWidth/2, y, borderPattern, 'vertical');
        }
    }
    
    /**
     * Dibuja un patrón decorativo en el borde
     */
    drawBorderPattern(ctx, x, y, pattern, orientation) {
        ctx.save();
        
        switch (pattern) {
            case 'stone':
                // Patrón de piedras
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'hedge':
                // Patrón de seto
                ctx.fillStyle = 'rgba(0, 100, 0, 0.5)';
                ctx.beginPath();
                if (orientation === 'horizontal') {
                    ctx.fillRect(x, y - 2, 8, 4);
                } else {
                    ctx.fillRect(x - 2, y, 4, 8);
                }
                break;
                
            case 'rock':
                // Patrón de rocas
                ctx.fillStyle = 'rgba(100, 70, 40, 0.5)';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'crystal':
                // Patrón de cristales
                ctx.fillStyle = 'rgba(200, 150, 255, 0.6)';
                ctx.beginPath();
                if (Math.random() > 0.5) {
                    // Diamante
                    ctx.moveTo(x, y - 4);
                    ctx.lineTo(x + 3, y);
                    ctx.lineTo(x, y + 4);
                    ctx.lineTo(x - 3, y);
                } else {
                    // Cristal hexagonal
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                }
                ctx.fill();
                break;
                
            case 'sand':
                // Patrón de arena
                ctx.fillStyle = 'rgba(255, 235, 150, 0.4)';
                ctx.beginPath();
                ctx.arc(x + (Math.random() * 4 - 2), y + (Math.random() * 4 - 2), 1.5, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * Dibuja un árbol decorativo
     */
    drawTree(ctx, x, y) {
        // Tronco
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 4, y - 5, 8, 20);
        
        // Follaje
        ctx.fillStyle = '#006400';
        ctx.beginPath();
        ctx.arc(x, y - 15, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x - 8, y - 5, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + 8, y - 8, 13, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Dibuja un arbusto decorativo
     */
    drawBush(ctx, x, y) {
        ctx.fillStyle = '#228B22';
        
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x - 7, y - 3, 7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + 7, y - 2, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Dibuja una flor decorativa
     */
    drawFlower(ctx, x, y) {
        // Tallo
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x, y - 5);
        ctx.stroke();
        
        // Flor
        const colors = ['#FF69B4', '#FF1493', '#FFD700', '#FF4500', '#9932CC'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        ctx.fillStyle = color;
        
        // Pétalos
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const angle = (i / 5) * Math.PI * 2;
            const pX = x + Math.cos(angle) * 5;
            const pY = y - 5 + Math.sin(angle) * 5;
            ctx.arc(pX, pY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Centro
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x, y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Renderiza la escena
     */
    render(ctx) {
        // Guardar el estado del canvas
        ctx.save();
        
        // Aplicar offset de la cámara
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Dibujar un fondo general para todo el mapa
        this.drawMapBackground(ctx);
        
        // Obtener la región actual del jugador
        const currentRegion = this.regions.find(r => r.id === this.player.region);
        
        // Dibujar el fondo de la región actual
        if (currentRegion) {
            ctx.fillStyle = currentRegion.bgColor;
            ctx.fillRect(currentRegion.x, currentRegion.y, currentRegion.width, currentRegion.height);
            
            // Dibujar grid de tiles (estilo Pokémon)
            this.drawTileGrid(ctx, currentRegion);
            
            // Dibujar efectos especiales según la región
            this.renderRegionEffects(ctx, currentRegion);
            
            // Mantener compatibilidad con el código existente para efectos antiguos
            if (currentRegion.hasGrass) {
                this.drawTallGrass(ctx, currentRegion);
            }
            
            if (currentRegion.id === 'playa-caramelizada') {
                this.drawBeach(ctx, currentRegion);
            }
            
            if (currentRegion.isDark) {
                this.drawCaveEffect(ctx, currentRegion);
            }
            
            if (currentRegion.hasHotSpots) {
                this.drawLavaEffect(ctx, currentRegion);
            }
            
            // Dibujar bordes decorativos alrededor de la región actual
            this.drawRegionBorders(ctx, currentRegion);
        }
        
        // Dibujar caminos entre minijuegos
        this.renderPaths(ctx);
        
        // Dibujar decoraciones
        this.renderDecorations(ctx);
        
        // Dibujar monedas coleccionables
        this.renderCoins(ctx);
        
        // Dibujar zonas de minijuegos solo de la región actual
        for (const zone of this.minigameZones) {
            if (zone.region === this.player.region) {
                // Solo dibujar si es visible en la cámara
                if (!this.isRectVisible(zone)) continue;
                
                // Destacar los minijuegos especiales de Playa Caramelizada
                if (zone.special && this.player.region === 'playa-caramelizada') {
                    // Efecto de pulso para los minijuegos especiales
                    const scale = zone.pulseScale || 1;
                    const centerX = zone.x + zone.width / 2;
                    const centerY = zone.y + zone.height / 2;
                    
                    // Guardar estado para la transformación
                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.scale(scale, scale);
                    ctx.translate(-centerX, -centerY);
                    
                    // Dibujar con un brillo especial
                    ctx.fillStyle = zone.color;
                    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
                    
                    // Añadir borde brillante
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
                    
                    // Añadir efecto de brillo
                    const gradient = ctx.createRadialGradient(
                        centerX, centerY, 5,
                        centerX, centerY, zone.width
                    );
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(zone.x - 10, zone.y - 10, zone.width + 20, zone.height + 20);
                    
                    // Dibujar icono según el tipo de juego
                    if (zone.scene === 'fishingGame') {
                        // Icono de caña de pescar
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(zone.x + 15, zone.y + 15);
                        ctx.lineTo(zone.x + zone.width - 15, zone.y + zone.height - 15);
                        ctx.stroke();
                        
                        // Anzuelo
                        ctx.beginPath();
                        ctx.arc(zone.x + zone.width - 15, zone.y + zone.height - 10, 5, 0, Math.PI * 2);
                        ctx.stroke();
                    } else if (zone.scene === 'surfingGame') {
                        // Icono de tabla de surf
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.ellipse(
                            zone.x + zone.width / 2, 
                            zone.y + zone.height / 2,
                            zone.width / 3, 
                            zone.height / 2 - 5,
                            0, 0, Math.PI * 2
                        );
                        ctx.fill();
                        ctx.strokeStyle = 'blue';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                    
                    // Restaurar estado
                    ctx.restore();
                } else {
                    // Dibujar zonas normales
                    ctx.fillStyle = zone.color;
                    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
                    
                    // Borde
                    ctx.strokeStyle = zone.borderColor || '#000000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
                    
                    // Dibujar icono si está disponible
                    if (zone.icon) {
                        ctx.font = '20px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(zone.icon, zone.x + zone.width / 2, zone.y + zone.height / 2);
                    }
                }
                
                // Dibujar nombre de la zona
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(zone.displayName || zone.name, zone.x + zone.width / 2, zone.y + zone.height + 15);
            }
        }
        
        // Dibujar objetos en el mapa (árboles, rocas, etc.)
        for (const wall of this.walls) {
            // Solo dibujar si es visible en la cámara y está en la región actual
            if (!this.isRectVisible(wall)) continue;
            
            // Dibujar solo si es un obstáculo visual (no los bordes)
            if (wall.isObstacle) {
                if (wall.isTree) {
                    // Dibujar árbol
                    ctx.fillStyle = '#5D4037'; // Tronco
                    ctx.fillRect(wall.x + wall.width/4, wall.y + wall.height/2, wall.width/2, wall.height/2);
                    
                    ctx.fillStyle = '#4CAF50'; // Copa
                    ctx.beginPath();
                    ctx.arc(wall.x + wall.width/2, wall.y + wall.height/3, wall.width/2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Dibujar roca u otro obstáculo
                    ctx.fillStyle = '#9E9E9E';
                    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
                }
            } else if (wall.isWater && this.player.region === 'playa-caramelizada') {
                // El agua se dibuja en drawBeach
            }
        }
        
        // Dibujar partículas
        for (const particle of this.particles) {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life; // Desvanecer al final de la vida
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Restaurar alpha
        ctx.globalAlpha = 1;
        
        // Dibujar jugador con efecto de brillo
        if (this.player.glowSize > 0) {
            const glowRadius = 20 + this.player.glowSize * 10;
            const gradient = ctx.createRadialGradient(
                this.player.x + this.player.width/2, 
                this.player.y + this.player.height/2, 
                this.player.width/4,
                this.player.x + this.player.width/2, 
                this.player.y + this.player.height/2, 
                glowRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                this.player.x + this.player.width/2, 
                this.player.y + this.player.height/2, 
                glowRadius, 0, Math.PI * 2
            );
            ctx.fill();
        }
        
        // Dibujar el cuerpo del jugador según el personaje seleccionado
        // Determinar qué imagen usar según el personaje seleccionado
        let playerImage;
        
        if (window.playerCharacter && window.playerCharacter.character === 'croisa') {
            playerImage = this.game.croisaImage;
        } else {
            playerImage = this.game.croisoImage;
        }
        
        // Dibujar la imagen del personaje seleccionado
        if (playerImage && playerImage.complete && playerImage.naturalHeight !== 0) {
            const scale = 3.5; // escala deseada
            ctx.drawImage(
                playerImage,
                this.player.x,
                this.player.y,
                this.player.width * scale,
                this.player.height * scale
            );
        } else {
            // Dibujar un croissant genérico como respaldo
            const playerCenterX = this.player.x + this.player.width/2;
            const playerCenterY = this.player.y + this.player.height/2;
            
            // Forma principal del croissant
            ctx.fillStyle = '#e6b266';
            ctx.beginPath();
            ctx.moveTo(playerCenterX - 15, playerCenterY + 5);
            ctx.bezierCurveTo(
                playerCenterX - 20, playerCenterY - 15,
                playerCenterX + 10, playerCenterY - 15,
                playerCenterX + 15, playerCenterY
            );
            ctx.bezierCurveTo(
                playerCenterX + 10, playerCenterY + 15,
                playerCenterX - 20, playerCenterY + 15,
                playerCenterX - 15, playerCenterY + 5
            );
            ctx.fill();
            
            // Detalles del croissant
            ctx.strokeStyle = '#b38533';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(playerCenterX - 10, playerCenterY + 3);
            ctx.bezierCurveTo(
                playerCenterX - 5, playerCenterY - 5,
                playerCenterX + 5, playerCenterY - 5,
                playerCenterX + 10, playerCenterY
            );
            ctx.stroke();
        }
        
        // Dibujar indicador de dirección del jugador
        ctx.fillStyle = '#FFFFFF';
        const indicatorSize = 8;
        
        switch (this.player.direction) {
            case 'up':
                ctx.beginPath();
                ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
                ctx.lineTo(this.player.x + this.player.width / 2 + indicatorSize/2, this.player.y + indicatorSize);
                ctx.lineTo(this.player.x + this.player.width / 2 - indicatorSize/2, this.player.y + indicatorSize);
                ctx.fill();
                break;
            case 'down':
                ctx.beginPath();
                ctx.moveTo(this.player.x + this.player.width / 2, this.player.y + this.player.height);
                ctx.lineTo(this.player.x + this.player.width / 2 + indicatorSize/2, this.player.y + this.player.height - indicatorSize);
                ctx.lineTo(this.player.x + this.player.width / 2 - indicatorSize/2, this.player.y + this.player.height - indicatorSize);
                ctx.fill();
                break;
            case 'left':
                ctx.beginPath();
                ctx.moveTo(this.player.x, this.player.y + this.player.height / 2);
                ctx.lineTo(this.player.x + indicatorSize, this.player.y + this.player.height / 2 + indicatorSize/2);
                ctx.lineTo(this.player.x + indicatorSize, this.player.y + this.player.height / 2 - indicatorSize/2);
                ctx.fill();
                break;
            case 'right':
                ctx.beginPath();
                ctx.moveTo(this.player.x + this.player.width, this.player.y + this.player.height / 2);
                ctx.lineTo(this.player.x + this.player.width - indicatorSize, this.player.y + this.player.height / 2 + indicatorSize/2);
                ctx.lineTo(this.player.x + this.player.width - indicatorSize, this.player.y + this.player.height / 2 - indicatorSize/2);
                ctx.fill();
                break;
        }
        
        // Dibujar prompt de interacción si está visible
        if (this.interactionPrompt && this.interactionPrompt.visible) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            
            // Medir ancho del texto
            const textWidth = ctx.measureText(this.interactionPrompt.text).width;
            
            // Dibujar fondo del prompt
            const padding = 5;
            ctx.fillRect(
                this.interactionPrompt.x - textWidth/2 - padding,
                this.interactionPrompt.y - 14 - padding,
                textWidth + padding * 2,
                18 + padding * 2
            );
            
            // Dibujar texto
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(
                this.interactionPrompt.text,
                this.interactionPrompt.x,
                this.interactionPrompt.y
            );
            
            // Si es un minijuego especial en Playa Caramelizada, añadir más detalles
            if (this.interactionPrompt.zone && this.interactionPrompt.zone.special && 
                this.interactionPrompt.zone.region === 'playa-caramelizada') {
                
                // Dibujar una línea brillante del jugador a la zona
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                ctx.lineTo(this.interactionPrompt.zone.x + this.interactionPrompt.zone.width/2, 
                         this.interactionPrompt.zone.y + this.interactionPrompt.zone.height/2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        
        // Dibujar efecto de transición entre regiones
        if (this.regionTransition.active) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.regionTransition.alpha})`;
            ctx.fillRect(0, 0, this.game.width * 2, this.game.height * 2);
        }
        
        // Restaurar el estado del canvas
        ctx.restore();
        
        // UI: Dibujar tooltip si está visible
        if (this.tooltip.visible && this.tooltip.game) {
            const zone = this.tooltip.game;
            const x = this.tooltip.x - this.camera.x;
            const y = this.tooltip.y - this.camera.y;
            
            // Fondo del tooltip
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x - 100, y - 50, 200, 100);
            
            // Borde
            ctx.strokeStyle = zone.borderColor || '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 100, y - 50, 200, 100);
            
            // Título
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(zone.displayName || zone.name, x, y - 30);
            
            // Puntos
            if (zone.points) {
                ctx.fillStyle = '#ffcc00';
                ctx.font = '12px Arial';
                ctx.fillText(`Recompensa: ${zone.points} puntos`, x, y - 10);
            }
            
            // Descripción
            ctx.fillStyle = '#cccccc';
            ctx.font = '10px Arial';
            
            // Romper descripción en múltiples líneas si es necesario
            const words = zone.description ? zone.description.split(' ') : [];
            let line = '';
            let lineY = y + 10;
            
            for (const word of words) {
                const testLine = line + word + ' ';
                if (ctx.measureText(testLine).width > 190) {
                    ctx.fillText(line, x, lineY);
                    line = word + ' ';
                    lineY += 15;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, lineY);
        }
        
        // Dibujar minimapa
        if (this.minimap.visible) {
            this.renderMinimap(ctx);
        }
        
        // Dibujar UI de puntuación si está visible
        if (this.showScoreUI) {
            this.renderScoreUI(ctx);
        }
    }
    
    /**
     * Renderiza los caminos entre minijuegos
     */
    renderPaths(ctx) {
        // Dibujar caminos entre minijuegos
        for (const path of this.paths) {
            const fromZone = this.minigameZones[path.from];
            const toZone = this.minigameZones[path.to];
            
            if (!fromZone || !toZone) continue;
            
            // Solo mostrar caminos que involucran la región actual
            if (fromZone.region !== this.player.region && toZone.region !== this.player.region) continue;
            
            // Calcular puntos de inicio y fin
            const startX = fromZone.x + fromZone.width / 2;
            const startY = fromZone.y + fromZone.height / 2;
            const endX = toZone.x + toZone.width / 2;
            const endY = toZone.y + toZone.height / 2;
            
            // Configurar estilo según tipo de camino
            ctx.strokeStyle = path.color || '#ffffff';
            ctx.lineWidth = path.width || 2;
            
            // Caminos especiales para región Playa Caramelizada
            if (path.type === 'beach' || 
                (fromZone.region === 'playa-caramelizada' && toZone.region === 'playa-caramelizada')) {
                // Camino ondulado de estilo playa
                ctx.setLineDash([5, 5]);
                ctx.lineDashOffset = path.dashOffset || 0;
                
                // Efecto de onda
                ctx.beginPath();
                const segments = 10;
                const dx = (endX - startX) / segments;
                const dy = (endY - startY) / segments;
                
                ctx.moveTo(startX, startY);
                
                for (let i = 1; i <= segments; i++) {
                    const t = i / segments;
                    const x = startX + dx * i;
                    const y = startY + dy * i;
                    const waveHeight = Math.sin(t * Math.PI * 2) * 10;
                    
                    // Dirección perpendicular para la onda
                    const perpX = -dy;
                    const perpY = dx;
                    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
                    
                    if (perpLength > 0) {
                        const offsetX = (perpX / perpLength) * waveHeight;
                        const offsetY = (perpY / perpLength) * waveHeight;
                        
                        ctx.lineTo(x + offsetX, y + offsetY);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.stroke();
                ctx.setLineDash([]);
            } else if (path.type === 'bridge') {
                // Camino punteado para puentes entre regiones
                ctx.setLineDash([10, 10]);
                ctx.lineDashOffset = path.dashOffset || 0;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                
                ctx.setLineDash([]);
            } else {
                // Camino normal
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        }
    }
    
    /**
     * Renderiza las decoraciones del mapa
     */
    renderDecorations(ctx) {
        const time = Date.now() / 1000;
        
        // Dibujar solo decoraciones de la región actual
        for (const decoration of this.decorations) {
            if (decoration.region !== this.player.region) continue;
            
            // Solo dibujar si es visible en la cámara
            if (!this.isPointVisible(decoration.x, decoration.y)) continue;
            
            // Efecto de animación sutil para dar vida
            const animScale = 1 + Math.sin(time + decoration.animOffset) * 0.05;
            const animRotate = Math.sin(time * 0.5 + decoration.animOffset) * 0.1;
            
            // Guardar contexto para transformaciones
            ctx.save();
            
            // Aplicar animación más intensa a las decoraciones especiales
            if (decoration.special) {
                // Centrar punto de rotación
                ctx.translate(decoration.x, decoration.y);
                ctx.rotate(animRotate);
                ctx.scale(animScale, animScale);
                ctx.translate(-decoration.x, -decoration.y);
            }
            
            // Dibujar según el tipo de decoración
            switch (decoration.type) {
                case 'tree':
                case 'palm':
                    // Tronco
                    ctx.fillStyle = '#5D4037';
                    ctx.fillRect(
                        decoration.x - 5 * decoration.size, 
                        decoration.y, 
                        10 * decoration.size, 
                        30 * decoration.size
                    );
                    
                    // Copa
                    ctx.fillStyle = decoration.color;
                    ctx.beginPath();
                    ctx.arc(
                        decoration.x, 
                        decoration.y - 15 * decoration.size, 
                        20 * decoration.size, 
                        0, Math.PI * 2
                    );
                    ctx.fill();
                    break;
                    
                case 'rock':
                    ctx.fillStyle = decoration.color;
                    ctx.beginPath();
                    ctx.ellipse(
                        decoration.x, 
                        decoration.y, 
                        15 * decoration.size, 
                        10 * decoration.size, 
                        0, 0, Math.PI * 2
                    );
                    ctx.fill();
                    break;
                    
                case 'flower':
                    // Tallo
                    ctx.strokeStyle = '#4CAF50';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(decoration.x, decoration.y + 10 * decoration.size);
                    ctx.lineTo(decoration.x, decoration.y - 10 * decoration.size);
                    ctx.stroke();
                    
                    // Pétalos
                    ctx.fillStyle = decoration.color;
                    for (let i = 0; i < 5; i++) {
                        const angle = (i / 5) * Math.PI * 2;
                        const petalX = decoration.x + Math.cos(angle) * 8 * decoration.size;
                        const petalY = decoration.y - 10 * decoration.size + Math.sin(angle) * 8 * decoration.size;
                        
                        ctx.beginPath();
                        ctx.arc(petalX, petalY, 5 * decoration.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;
                    
                case 'shell':
                    // Base de la concha
                    ctx.fillStyle = decoration.color;
                    ctx.beginPath();
                    ctx.arc(
                        decoration.x, 
                        decoration.y, 
                        10 * decoration.size, 
                        0, Math.PI * 2
                    );
                    ctx.fill();
                    
                    // Espiral
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let i = 0; i < 2 * Math.PI; i += 0.1) {
                        const radius = i * 2 * decoration.size;
                        const x = decoration.x + Math.cos(i) * radius;
                        const y = decoration.y + Math.sin(i) * radius;
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.stroke();
                    break;
                    
                case 'starfish':
                    // Estrella de mar
                    ctx.fillStyle = decoration.color;
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (i / 5) * Math.PI * 2;
                        const outerX = decoration.x + Math.cos(angle) * 15 * decoration.size;
                        const outerY = decoration.y + Math.sin(angle) * 15 * decoration.size;
                        const innerAngle1 = ((i + 0.5) / 5) * Math.PI * 2;
                        const innerAngle2 = ((i + 4.5) / 5) * Math.PI * 2;
                        const innerX1 = decoration.x + Math.cos(innerAngle1) * 5 * decoration.size;
                        const innerY1 = decoration.y + Math.sin(innerAngle1) * 5 * decoration.size;
                        const innerX2 = decoration.x + Math.cos(innerAngle2) * 5 * decoration.size;
                        const innerY2 = decoration.y + Math.sin(innerAngle2) * 5 * decoration.size;
                        
                        if (i === 0) {
                            ctx.moveTo(outerX, outerY);
                        } else {
                            ctx.lineTo(outerX, outerY);
                        }
                        ctx.lineTo(innerX1, innerY1);
                        ctx.lineTo(innerX2, innerY2);
                        ctx.lineTo(outerX, outerY);
                    }
                    ctx.fill();
                    break;
                    
                default:
                    // Decoración genérica
                    ctx.fillStyle = decoration.color;
                    ctx.beginPath();
                    ctx.arc(
                        decoration.x, 
                        decoration.y, 
                        10 * decoration.size, 
                        0, Math.PI * 2
                    );
                    ctx.fill();
            }
            
            // Restaurar contexto
            ctx.restore();
        }
    }
    
    /**
     * Renderiza las monedas coleccionables
     */
    renderCoins(ctx) {
        const time = Date.now() / 1000;
        
        // Dibujar solo monedas de la región actual
        for (const coin of this.coins) {
            if (coin.region !== this.player.region) continue;
            
            // Solo dibujar si es visible en la cámara
            if (!this.isPointVisible(coin.x, coin.y)) continue;
            
            // Animación de rebote
            const bounce = Math.sin(time * 3 + coin.animTimer) * 5;
            
            // Dibujar brillo detrás de la moneda
            const glowRadius = 10 + Math.sin(time * 2) * 3;
            const gradient = ctx.createRadialGradient(
                coin.x, coin.y + bounce, 2,
                coin.x, coin.y + bounce, glowRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(coin.x, coin.y + bounce, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Dibujar la moneda
            ctx.fillStyle = coin.color;
            ctx.beginPath();
            ctx.arc(coin.x, coin.y + bounce, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Borde de la moneda
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(coin.x, coin.y + bounce, 8, 0, Math.PI * 2);
            ctx.stroke();
            
            // Brillo
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(coin.x - 2, coin.y + bounce - 2, 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    /**
     * Renderiza el minimapa
     */
    renderMinimap(ctx) {
        // Dibujar fondo del minimapa
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.minimap.x, this.minimap.y, this.minimap.width, this.minimap.height);
        
        // Dibujar regiones en el minimapa
        for (const region of this.regions) {
            // Calcular posición y tamaño en el minimapa
            const minimapX = this.minimap.x + region.x * this.minimap.scale;
            const minimapY = this.minimap.y + region.y * this.minimap.scale;
            const minimapWidth = region.width * this.minimap.scale;
            const minimapHeight = region.height * this.minimap.scale;
            
            // Dibujar región
            ctx.fillStyle = region.color || region.bgColor;
            ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
            
            // Dibujar borde
            ctx.strokeStyle = region.id === this.player.region ? '#FFFFFF' : '#666666';
            ctx.lineWidth = region.id === this.player.region ? 2 : 1;
            ctx.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);
        }
        
        // Dibujar zonas de minijuego en el minimapa
        for (const zone of this.minigameZones) {
            const minimapX = this.minimap.x + zone.x * this.minimap.scale;
            const minimapY = this.minimap.y + zone.y * this.minimap.scale;
            const minimapWidth = zone.width * this.minimap.scale;
            const minimapHeight = zone.height * this.minimap.scale;
            
            // Destacar zonas especiales
            ctx.fillStyle = zone.special ? '#ffffff' : zone.color;
            ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
        }
        
        // Dibujar posición del jugador en el minimapa
        const playerX = this.minimap.x + this.player.x * this.minimap.scale;
        const playerY = this.minimap.y + this.player.y * this.minimap.scale;
        
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Dibujar viewport de la cámara
        const viewportX = this.minimap.x + this.camera.x * this.minimap.scale;
        const viewportY = this.minimap.y + this.camera.y * this.minimap.scale;
        const viewportWidth = this.camera.width * this.minimap.scale;
        const viewportHeight = this.camera.height * this.minimap.scale;
        
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 1;
        ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    }
    
    /**
     * Renderiza la UI de puntuación
     */
    renderScoreUI(ctx) {
        
    }
}
