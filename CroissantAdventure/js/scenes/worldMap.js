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
        
        // Control parental - se puede activar/desactivar desde el Panel de Administración
        this.parentalControlEnabled = localStorage.getItem('parentalControlEnabled') === 'true';
        this.parentalControlPin = localStorage.getItem('parentalControlPin') || '0000';
        
        // Arrays para elementos visuales
        this.particles = [];
        this.floatingTexts = [];
        
        // UI
        this.interactionPrompt = null;
        this.tooltip = {
            visible: false,
            x: 0,
            y: 0,
            game: null
        };
        
        // Minimapa
        this.minimap = {
            visible: true,
            x: 10,
            y: 10,
            width: 150,
            height: 150,
            scale: 150 / 2400 // Escala basada en el ancho del mapa
        };
        
        // Control de UI
        this.showScoreUI = true;
        
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
            game: null
        };
        
        // Animación de transición
        this.transition = {
            active: false,
            alpha: 0,
            targetScene: null
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
                    ground: 'bosque',
                    decoration: 'árboles densos'
                },
                hasGrass: true, // Hierba alta donde pueden aparecer encuentros
                displayName: 'Bosque de Chocolate',
                color: '#556B2F',
                borderColor: '#3A4C1F',
                description: 'Un denso bosque lleno de árboles de chocolate y sorpresas'
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
                description: 'Una montaña escarpada hecha de galletas crujientes'
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
                description: 'Una playa de azúcar con un mar de caramelo líquido'
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
                description: 'Una bulliciosa ciudad con edificios hechos de pasteles'
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
                description: 'Un lago tranquilo con aguas de merengue y nata'
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
                borderColor: '#484848',
                description: 'Una cueva oscura con cristales de caramelo brillantes'
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
                description: 'Una vasta pradera cubierta de hierba de azúcar y flores de caramelo'
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
                description: 'Un volcán activo con lava de chocolate caliente'
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
                icon: '♞',
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
     * Comprueba si el jugador ha recogido alguna moneda
     */
    checkCoinCollection() {
        const playerCenterX = this.player.x + this.player.width/2;
        const playerCenterY = this.player.y + this.player.height/2;
        
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            
            // Solo comprobar monedas en la región actual y no recogidas
            if (coin.region === this.player.region && !coin.collected) {
                const dx = playerCenterX - coin.x;
                const dy = playerCenterY - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 25) { // Radio de recogida
                    // Marcar como recogida
                    coin.collected = true;
                    
                    // Añadir puntos al jugador
                    if (this.game.addPoints) {
                        this.game.addPoints(coin.value, 'coin');
                    } else {
                        // Si no existe el método, incrementar directamente
                        this.game.points = (this.game.points || 0) + coin.value;
                        this.game.playerCoins = (this.game.playerCoins || 0) + 1;
                    }
                    
                    // Crear efecto visual de recogida
                    this.createCoinCollectionEffect(coin.x, coin.y, coin.color, coin.value);
                    
                    // Reproducir sonido (si está disponible)
                    if (this.game.playSoundEffect) {
                        this.game.playSoundEffect('coin');
                    }
                    
                    console.log(`Moneda recogida! +${coin.value} puntos`);
                    
                    // Aumentar temporalmente el brillo del jugador
                    this.player.glowSize = 1;
                    this.player.glowDir = -1;
                }
            }
        }
    }
    
    /**
     * Crea efecto visual al recoger una moneda
     */
    createCoinCollectionEffect(x, y, color, value) {
        // Crear partículas que salen disparadas desde el punto de recogida
        const numParticles = 8;
        
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,  // Comienza con vida completa
                decay: 0.02 + Math.random() * 0.02,  // Velocidad de desaparición
                size: 3 + Math.random() * 3,
                color: color || '#ffcc00'
            });
        }
        
        // Añadir también un número que sube mostrando el valor
        this.floatingTexts.push({
            x: x,
            y: y,
            text: '+' + value,
            color: '#ffffff',
            vy: -1.5,  // Velocidad hacia arriba
            life: 1.0,
            decay: 0.02
        });
    }
    
    /**
     * Genera monedas de oro especiales en ciertas regiones
     */
    generateGoldCoins() {
        // Regiones donde colocar monedas de oro especiales
        const goldRegions = ['volcán-brownie', 'cueva-caramelo', 'lago-merengue'];
        
        for (const regionId of goldRegions) {
            const region = this.regions.find(r => r.id === regionId);
            if (!region) continue;
            
            // Generar entre 3-5 monedas de oro especiales por región
            const numCoins = 3 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < numCoins; i++) {
                // Encontrar posición válida
                let x, y, valid;
                let attempts = 0;
                
                do {
                    valid = true;
                    attempts++;
                    
                    // Posición aleatoria dentro de la región
                    x = region.x + 50 + Math.random() * (region.width - 100);
                    y = region.y + 50 + Math.random() * (region.height - 100);
                    
                    // Comprobar colisión con zonas de minijuegos
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
                    
                    // Comprobar colisión con otras monedas ya colocadas
                    for (const coin of this.coins) {
                        const dx = x - coin.x;
                        const dy = y - coin.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        
                        if (distance < 40) {
                            valid = false;
                            break;
                        }
                    }
                    
                    // Evitar intentos infinitos
                    if (attempts > 30) {
                        valid = true;
                        break;
                    }
                    
                } while (!valid);
                
                if (attempts <= 30) {  // Solo añadir si encontramos una posición válida
                    // Añadir moneda especial de oro
                    this.coins.push({
                        x: x,
                        y: y,
                        color: '#ffd700', // Gold
                        outline: '#b8860b', // DarkGoldenRod
                        value: 50, // Mayor valor que las monedas normales
                        region: region.id,
                        collected: false,
                        animTimer: Math.random() * Math.PI * 2,
                        glowSize: Math.random() * 5,
                        glowDir: Math.random() > 0.5 ? 1 : -1,
                        special: true // Marcar como especial para efectos visuales
                    });
                }
            }
        }
    }
    
    /**
     * Encuentra la región adyacente en una dirección determinada
     */   const adjacentRegion = this.regions.find(r => 
            r.x === adjacentX && r.y === adjacentY
        );
        
        if (adjacentRegion) {
            console.log(`Región adyacente en dirección ${direction} desde ${regionId}: ${adjacentRegion.id}`);
{{ ... }}
            region: this.player.region
        }));
    }
    
    /**
     * Actualiza el estado del juego en cada frame
     */
    update(deltaTime) {
        // Actualizar la posición del jugador basado en la entrada
        this.updatePlayerPosition(deltaTime);
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
                this.game.changeScene(nearbyZone.scene);
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
                        
                        // Calcular la posición del jugador en la nueva región
                        // Si toca el borde izquierdo, reposicionar a la derecha de la nueva región
                        if (Math.abs(wall.x - fromRegion.x) < 10) { // Borde izquierdo
                            this.player.x = toRegion.x + toRegion.width - this.player.width - 20;
                        }
                        // Si toca el borde derecho, reposicionar a la izquierda de la nueva región
                        else if (Math.abs(wall.x + wall.width - (fromRegion.x + fromRegion.width)) < 10) { // Borde derecho
                            this.player.x = toRegion.x + 20;
                        }
                        
                        // Si toca el borde superior, reposicionar abajo de la nueva región
                        if (Math.abs(wall.y - fromRegion.y) < 10) { // Borde superior
                            this.player.y = toRegion.y + toRegion.height - this.player.height - 20;
                        }
                        // Si toca el borde inferior, reposicionar arriba de la nueva región
                        else if (Math.abs(wall.y + wall.height - (fromRegion.y + fromRegion.height)) < 10) { // Borde inferior
                            this.player.y = toRegion.y + 20;
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
     * Dibuja hierba alta estilo Pokémon
     */
    drawTallGrass(ctx, region) {
        const tileSize = this.map.tileSize;
        
        // Crear patrón de hierba semi-aleatorio basado en la región
        const seedX = region.x;
        const seedY = region.y;
        
        // Color base de la hierba (más oscuro que el fondo)
        const baseColor = region.id === 'bosque-chocolate' ? '#3E5622' : '#4D8A3D';
        
        ctx.fillStyle = baseColor;
        
        // Dibujar manchas de hierba alta
        for (let x = region.x; x < region.x + region.width; x += tileSize) {
            for (let y = region.y; y < region.y + region.height; y += tileSize) {
                // Solo dibujar si es visible en la cámara
                if (!this.isRectVisible({x, y, width: tileSize, height: tileSize})) continue;
                
                // Pseudo-aleatorio basado en coordenadas
                const hash = (x * 31 + y * 17 + seedX * 13 + seedY * 7) % 100;
                
                if (hash < 30) { // 30% de probabilidad de hierba
                    // Dibujar hierba alta
                    ctx.fillRect(x, y, tileSize, tileSize);
                    
                    // Dibujar detalles de hierba
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = 1;
                    
                    // Dibujar las "puntas" de la hierba
                    const time = Date.now() / 1000;
                    const waveOffset = Math.sin(time + x * 0.1) * 2;
                    
                    ctx.beginPath();
                    // Línea central
                    ctx.moveTo(x + tileSize/2, y + tileSize);
                    ctx.lineTo(x + tileSize/2 + waveOffset, y + tileSize/4);
                    // Línea izquierda
                    ctx.moveTo(x + tileSize/4, y + tileSize);
                    ctx.lineTo(x + tileSize/4 + waveOffset, y + tileSize/3);
                    // Línea derecha
                    ctx.moveTo(x + tileSize*3/4, y + tileSize);
                    ctx.lineTo(x + tileSize*3/4 + waveOffset, y + tileSize/3);
                    
                    ctx.stroke();
                }
            }
        }
    }
    
    /**
     * Dibuja playa y agua estilo Pokémon para la Playa Caramelizada
     */
    drawBeach(ctx, region) {
        const tileSize = this.map.tileSize;
        
        // Dibujar agua solo en la parte derecha de la playa
        const waterStartX = region.x + region.width * 0.6;
        
        // Color del agua
        const waterColor = '#5DA9E9';
        
        // Tiempo para la animación
        const time = Date.now() / 1000;
        
        // Dibujar agua
        for (let x = waterStartX; x < region.x + region.width; x += tileSize) {
            for (let y = region.y; y < region.y + region.height; y += tileSize) {
                // Solo dibujar si es visible en la cámara
                if (!this.isRectVisible({x, y, width: tileSize, height: tileSize})) continue;
                
                // Dibujar tile de agua
                ctx.fillStyle = waterColor;
                ctx.fillRect(x, y, tileSize, tileSize);
                
                // Dibujar reflejos de agua
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                
                // Efecto de olas
                const wavePhase = (x * 0.1 + y * 0.1 + time) % (Math.PI * 2);
                const waveHeight = Math.sin(wavePhase) * 2;
                
                ctx.beginPath();
                ctx.moveTo(x, y + tileSize/2 + waveHeight);
                ctx.lineTo(x + tileSize, y + tileSize/2 - waveHeight);
                ctx.stroke();
            }
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
     * Dibuja efecto de lava para el volcán
     */
    drawLavaEffect(ctx, region) {
        const tileSize = this.map.tileSize;
        const time = Date.now() / 1000;
        
        // Colores de lava
        const colors = ['#FF5722', '#FF9800', '#FFEB3B'];
        
        // Crear patrón de lava aleatorio
        for (let x = region.x; x < region.x + region.width; x += tileSize) {
            for (let y = region.y; y < region.y + region.height; y += tileSize) {
                // Solo dibujar si es visible en la cámara
                if (!this.isRectVisible({x, y, width: tileSize, height: tileSize})) continue;
                
                // Pseudoaleatorio basado en coordenadas
                const hash = (x * 31 + y * 17) % 100;
                
                if (hash < 40) { // 40% de probabilidad de lava
                    // Seleccionar color de lava y añadir pulsación
                    const colorIndex = Math.floor((x * y) % 3);
                    const pulsation = Math.sin(time + (x * 0.05 + y * 0.05)) * 0.5 + 0.5;
                    
                    ctx.fillStyle = colors[colorIndex];
                    ctx.globalAlpha = 0.5 + pulsation * 0.5;
                    
                    // Dibujar mancha de lava
                    ctx.fillRect(x, y, tileSize, tileSize);
                    
                    // Dibujar burbuja de lava ocasionalmente
                    if (hash < 10 && Math.sin(time * 2 + x + y) > 0.7) {
                        ctx.beginPath();
                        ctx.arc(
                            x + tileSize/2 + Math.sin(time * 3) * 5, 
                            y + tileSize/2 + Math.cos(time * 2) * 5, 
                            tileSize/6, 0, Math.PI * 2
                        );
                        ctx.fillStyle = '#FFEB3B';
                        ctx.fill();
                    }
                    
                    ctx.globalAlpha = 1;
                }
            }
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
        this.decorations = [];
        // Implementa la generación de decoraciones según la región
        for (const region of this.regions) {
            // Añadir decoraciones específicas para cada región
            this.addRegionDecorations(region);
        }
        
        // Generar monedas de oro especiales (más valiosas) en algunas regiones
        this.generateGoldCoins();
    }
    
    /**
     * Genera monedas coleccionables en el mapa
     */
    generateCoins(count = 20) {
        this.coins = [];
        
        // Colores para diferentes tipos de monedas
        const coinTypes = [
            { color: '#ffcc00', outline: '#cc9900', value: 5, chance: 0.7 },  // Oro (común)
            { color: '#cccccc', outline: '#999999', value: 10, chance: 0.2 },  // Plata (poco común)
            { color: '#ff6666', outline: '#cc3333', value: 25, chance: 0.1 }   // Rubí (raro)
        ];
        
        // Distribuir monedas en cada región
        for (const region of this.regions) {
            // Número de monedas basado en el tamaño de la región
            const regionCoins = Math.floor(count / this.regions.length) + 
                               Math.floor(Math.random() * 3);
            
            for (let i = 0; i < regionCoins; i++) {
                // Encontrar posición no superpuesta con zonas de minijuegos
                let x, y, valid;
                let attempts = 0;
                
                do {
                    valid = true;
                    attempts++;
                    
                    // Posición aleatoria dentro de la región
                    x = region.x + 50 + Math.random() * (region.width - 100);
                    y = region.y + 50 + Math.random() * (region.height - 100);
                    
                    // Comprobar colisión con zonas de minijuegos
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
                    
                    // Comprobar colisión con otras monedas ya colocadas
                    for (const coin of this.coins) {
                        const dx = x - coin.x;
                        const dy = y - coin.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        
                        if (distance < 40) {
                            valid = false;
                            break;
                        }
                    }
                    
                    // Evitar intentos infinitos
                    if (attempts > 50) {
                        valid = true; // Forzar salida
                        break;
                    }
                    
                } while (!valid);
                
                if (attempts <= 50) {  // Solo añadir si encontramos una posición válida
                    // Determinar tipo de moneda basado en probabilidad
                    const rand = Math.random();
                    let cumulative = 0;
                    let selectedType = coinTypes[0];
                    
                    for (const type of coinTypes) {
                        cumulative += type.chance;
                        if (rand <= cumulative) {
                            selectedType = type;
                            break;
                        }
                    }
                    
                    // Añadir moneda al mapa
                    this.coins.push({
                        x: x,
                        y: y,
                        color: selectedType.color,
                        outline: selectedType.outline,
                        value: selectedType.value,
                        region: region.id,
                        collected: false,
                        animTimer: Math.random() * Math.PI * 2,
                        glowSize: Math.random() * 5,
                        glowDir: Math.random() > 0.5 ? 1 : -1
                    });
                }
            }
        }
    }

    /**
     * Renderiza la escena
     */
    render(ctx) {
        // Guardar el estado del canvas
        ctx.save();
        
        // Aplicar offset de la cámara
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Obtener la región actual del jugador
        const currentRegion = this.regions.find(r => r.id === this.player.region);
        
        // Dibujar el fondo de la región actual
        if (currentRegion) {
            ctx.fillStyle = currentRegion.bgColor;
            ctx.fillRect(currentRegion.x, currentRegion.y, currentRegion.width, currentRegion.height);
            
            // Dibujar grid de tiles (estilo Pokémon)
            this.drawTileGrid(ctx, currentRegion);
            
            // Dibujar efectos especiales según la región
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
        
        // Dibujar el cuerpo del jugador
        ctx.fillStyle = '#FF0000'; // Color temporal hasta que tengamos sprites
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
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
        // Dibujar fondo para la puntuación
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.game.width - 150, 20, 130, 60);
        
        // Dibujar borde
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.game.width - 150, 20, 130, 60);
        
        // Dibujar texto de puntuación
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Puntos: ${this.game.points || 0}`, this.game.width - 30, 45);
        
        // Dibujar texto de ayuda
        ctx.font = '10px Arial';
        ctx.fillText('M: Minimapa | TAB: Puntaje', this.game.width - 30, 65);
    }
}
