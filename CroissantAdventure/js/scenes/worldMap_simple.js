/**
 * Improved World Map Scene
 * Una versión mejorada y visualmente atractiva del mapa de Migalandia
 */
class WorldMapScene extends Scene {
    constructor(game) {
        super(game);
        console.log("Creating world map scene");
        
        // Temas de regiones
        this.regions = [
            {
                name: "Valle Dorado",
                color: "#ffee99",
                borderColor: "#ffcc00",
                x: 100,
                y: 100,
                width: 300,
                height: 200,
                bgType: "gold"
            },
            {
                name: "Bosque Enredado",
                color: "#aaddaa",
                borderColor: "#44aa44",
                x: 50,
                y: 350,
                width: 300,
                height: 250,
                bgType: "forest"
            },
            {
                name: "Cielo Azucarado",
                color: "#aaccff",
                borderColor: "#66aaff",
                x: 800,
                y: 150,
                width: 300,
                height: 300,
                bgType: "sky"
            },
            {
                name: "Reino Cuadriculado",
                color: "#ccaaff",
                borderColor: "#9966ff",
                x: 400,
                y: 450,
                width: 400,
                height: 250,
                bgType: "kingdom"
            },
            {
                name: "Villa de los Recuerdos",
                color: "#ffccaa",
                borderColor: "#ff9966",
                x: 400,
                y: 100,
                width: 350,
                height: 300,
                bgType: "village"
            },
        ];
        
        // Player properties
        this.player = {
            x: game.width / 2,
            y: game.height / 2,
            width: 40,
            height: 40,
            speed: 200, // pixels per second
            direction: 'right', // for animation
            animFrame: 0,
            animTimer: 0,
            glowSize: 0,
            glowDir: 1
        };
        
        // Caminos entre zonas
        this.paths = [];
        
        // Minigame zones - reordenadas por regiones temáticas
        this.minigameZones = [
            // Valle Dorado
            {
                x: 180,
                y: 150,
                width: 75,
                height: 75,
                name: 'Coin Collector',
                displayName: 'El Tesoro del Valle Dorado',
                scene: 'coinCollector',
                color: '#ffcc00',
                borderColor: '#ffaa00',
                points: 10,
                icon: '🪙',
                region: 0,
                description: 'Recoge las monedas doradas antes de que se acabe el tiempo'
            },
            {
                x: 300,
                y: 200,
                width: 75,
                height: 75,
                name: 'Roulette',
                displayName: 'La Rueda de la Fortuna',
                scene: 'roulette',
                color: '#ff9900',
                borderColor: '#ff7700',
                points: 15,
                icon: '🎰',
                region: 0,
                description: 'Gira la rueda y prueba tu suerte'
            },
            
            // Bosque Enredado
            {
                x: 150,
                y: 450,
                width: 75,
                height: 75,
                name: 'Maze',
                displayName: 'El Bosque Enredado',
                scene: 'maze',
                color: '#66cc66',
                borderColor: '#44aa44',
                points: 25,
                icon: '🧩',
                region: 1,
                description: 'Encuentra el camino a través del misterioso laberinto'
            },
            {
                x: 250,
                y: 500,
                width: 75,
                height: 75,
                name: 'Snake',
                displayName: 'Silbi la Serpiente',
                scene: 'snake',
                color: '#44cc44',
                borderColor: '#33aa33',
                points: 45,
                icon: '🐍',
                region: 1,
                description: 'Ayuda a Silbi a comer sin tropezar con su cola'
            },
            
            // Cielo Azucarado
            {
                x: 850,
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
                region: 2,
                description: 'Revienta las burbujas mágicas en el cielo'
            },
            {
                x: 950,
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
                region: 2,
                description: 'Salta entre las plataformas flotantes'
            },
            
            // Reino Cuadriculado
            {
                x: 500,
                y: 600,
                width: 75,
                height: 75,
                name: 'Chess',
                displayName: 'Guardianes del Reino',
                scene: 'chess',
                color: '#5555ff',
                borderColor: '#3333dd',
                points: 20,
                icon: '♞',
                region: 3,
                description: 'Planifica tus movimientos estratégicos'
            },
            {
                x: 650,
                y: 550,
                width: 75,
                height: 75,
                name: 'Tower Defense',
                displayName: 'Castillo de Azúcar',
                scene: 'towerDefense',
                color: '#9966ff',
                borderColor: '#7744ff',
                points: 70,
                icon: '🏰',
                region: 3,
                description: 'Defiende el castillo de los invasores'
            },
            {
                x: 450,
                y: 500,
                width: 75,
                height: 75,
                name: 'Admin Panel',
                displayName: 'Panel de Administración',
                scene: 'adminPanel',
                color: '#aaaaaa',
                borderColor: '#888888',
                points: 25,
                icon: '🔧',
                region: 3,
                description: 'Explora los planos del Reino de Migalandia'
            },
            
            // Villa de los Recuerdos
            {
                x: 450,
                y: 150,
                width: 75,
                height: 75,
                name: 'Memory',
                displayName: 'Cartas Gemelas',
                scene: 'memory',
                color: '#cc66ff',
                borderColor: '#aa44ff',
                points: 40,
                icon: '🃏',
                region: 4,
                description: 'Encuentra los pares coincidentes'
            },
            {
                x: 600,
                y: 200,
                width: 75,
                height: 75,
                name: 'Puzzle',
                displayName: 'Cuadro Mágico',
                scene: 'puzzle',
                color: '#ff9966',
                borderColor: '#ff7744',
                points: 50,
                icon: '🧠',
                region: 4,
                description: 'Desliza las piezas para completar la imagen'
            },
            {
                x: 500,
                y: 300,
                width: 75,
                height: 75,
                name: 'Rhythm',
                displayName: 'Orquesta Dulce',
                scene: 'rhythm',
                color: '#ff66cc',
                borderColor: '#ff44aa',
                points: 55,
                icon: '🎵',
                region: 4,
                description: 'Sigue el ritmo de las notas musicales'
            },
            {
                x: 650,
                y: 350,
                width: 75,
                height: 75,
                name: 'Paint Game',
                displayName: 'Estudio Artístico',
                scene: 'paintGame',
                color: '#ff99cc',
                borderColor: '#ff77aa',
                points: 45,
                icon: '🎨',
                region: 4,
                description: 'Dibuja y pinta tus propias creaciones'
            },
            {
                x: 550,
                y: 350,
                width: 75,
                height: 75,
                name: 'Trivia Game',
                displayName: 'Trivia de Pastelería',
                scene: 'triviaGame',
                color: '#ffaa66',
                borderColor: '#ff8844',
                points: 40,
                icon: '🥨',
                region: 4,
                description: 'Pon a prueba tus conocimientos sobre croissants'
            },
            {
                x: 350,
                y: 250,
                width: 75,
                height: 75,
                name: 'Story Teller',
                displayName: 'Narrador de Historias',
                scene: 'storyTeller',
                color: '#66cccc',
                borderColor: '#44aaaa',
                points: 30,
                icon: '📚',
                region: 4,
                description: 'Vive una aventura narrativa interactiva'
            }
        ];
        
        // Generar caminos entre las zonas de juego cercanas
        this.generatePaths();
        
        // Collectible coins on the map
        this.coins = [];
        this.generateCoins(20);
        
        // Decorative elements - más decoraciones temáticas
        this.decorations = [];
        this.generateDecorations();
        
        // Efectos visuales
        this.particles = [];
        
        // UI
        this.interactionPrompt = null;
        this.showScoreUI = true;
        this.showMinimap = true;
        
        // Tooltip para mostrar info del juego
        this.tooltip = {
            visible: false,
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
    }
    
    enter() {
        console.log("Entering world map scene");
        
        // Check if player is in a minigame zone and move them away if needed
        let isInMinigameZone = false;
        let closestZone = null;
        let shortestDistance = Infinity;
        
        // Get player center position
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        // Find if player is in any minigame zone
        for (const zone of this.minigameZones) {
            const zoneCenterX = zone.x + zone.width / 2;
            const zoneCenterY = zone.y + zone.height / 2;
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < zone.width / 2 + 20) { // Added 20px buffer
                isInMinigameZone = true;
            }
            
            // Track the closest zone for reference
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestZone = zone;
            }
        }
        
        // If player is in a minigame zone, move them out
        if (isInMinigameZone && closestZone) {
            console.log("Player is in minigame zone on return, repositioning");
            const zoneCenterX = closestZone.x + closestZone.width / 2;
            const zoneCenterY = closestZone.y + closestZone.height / 2;
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            
            // Determine direction away from zone (normalize vector)
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance === 0) distance = 1; // Avoid division by zero
            
            // Move the player away by 100 pixels in the direction away from the zone
            const moveDistance = closestZone.width / 2 + 60; // 60px buffer
            this.player.x = zoneCenterX + (dx / distance) * moveDistance - this.player.width / 2;
            this.player.y = zoneCenterY + (dy / distance) * moveDistance - this.player.height / 2;
            
            // Keep player inside boundaries
            this.player.x = Math.max(0, Math.min(this.player.x, this.game.width - this.player.width));
            this.player.y = Math.max(0, Math.min(this.player.y, this.game.height - this.player.height));
        }
    }
    
    exit() {
        // Nothing specific needed here
    }
    
    update(deltaTime) {
        // Handle player movement
        let dx = 0;
        let dy = 0;
        
        // Check for keyboard movement
        if (this.game.isKeyPressed('w') || this.game.isKeyPressed('arrowup')) {
            dy -= this.player.speed * deltaTime;
            this.player.direction = 'up';
        }
        if (this.game.isKeyPressed('s') || this.game.isKeyPressed('arrowdown')) {
            dy += this.player.speed * deltaTime;
            this.player.direction = 'down';
        }
        if (this.game.isKeyPressed('a') || this.game.isKeyPressed('arrowleft')) {
            dx -= this.player.speed * deltaTime;
            this.player.direction = 'left';
        }
        if (this.game.isKeyPressed('d') || this.game.isKeyPressed('arrowright')) {
            dx += this.player.speed * deltaTime;
            this.player.direction = 'right';
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
        
        // Add click-to-move functionality
        if (this.game.mouseDown) {
            const targetX = this.game.mouseX;
            const targetY = this.game.mouseY;
            
            // Calculate direction to target
            const dirX = targetX - (this.player.x + this.player.width/2);
            const dirY = targetY - (this.player.y + this.player.height/2);
            
            // Set player direction based on movement
            if (Math.abs(dirX) > Math.abs(dirY)) {
                this.player.direction = dirX > 0 ? 'right' : 'left';
            } else {
                this.player.direction = dirY > 0 ? 'down' : 'up';
            }
            
            // Normalize and scale by speed
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            if (length > 5) { // Only move if clicked some distance away
                dx = dirX / length * this.player.speed * deltaTime;
                dy = dirY / length * this.player.speed * deltaTime;
            }
        }
        
        // Move player with boundary checking and collision detection
        if (dx !== 0 || dy !== 0) {
            // Update animation
            this.player.animTimer += deltaTime;
            if (this.player.animTimer > 0.2) { // Frame change every 0.2 seconds
                this.player.animFrame = (this.player.animFrame + 1) % 2; // Toggle between 0 and 1
                this.player.animTimer = 0;
            }
            
            // Move with boundary checking
            this.player.x = Math.max(0, Math.min(this.player.x + dx, this.game.width - this.player.width));
            this.player.y = Math.max(0, Math.min(this.player.y + dy, this.game.height - this.player.height));
        }
        
        // Check coin collection
        this.checkCoinCollection();
        
        // Check for minigame zones
        for (const zone of this.minigameZones) {
            // Check if player center is inside zone
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            
            // Calculate distance to zone center
            const zoneCenterX = zone.x + zone.width / 2;
            const zoneCenterY = zone.y + zone.height / 2;
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < zone.width / 2) {
                // Player is in a minigame zone - enter the minigame
                console.log(`Entering minigame: ${zone.name}`);
                this.game.addPoints(zone.points, 'minigame');
                this.game.switchScene(zone.scene);
                break;
            }
        }
    }
    
    /**
     * Genera caminos entre las zonas de juego cercanas
     */
    generatePaths() {
        // Par cada zona, conectar con las 2-3 zonas más cercanas
        for (let i = 0; i < this.minigameZones.length; i++) {
            const zone = this.minigameZones[i];
            const center1 = {
                x: zone.x + zone.width / 2,
                y: zone.y + zone.height / 2
            };
            
            // Calcular distancias a todas las demás zonas
            const distances = [];
            for (let j = 0; j < this.minigameZones.length; j++) {
                if (i === j) continue;
                
                const otherZone = this.minigameZones[j];
                const center2 = {
                    x: otherZone.x + otherZone.width / 2,
                    y: otherZone.y + otherZone.height / 2
                };
                
                const dx = center1.x - center2.x;
                const dy = center1.y - center2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                distances.push({
                    index: j,
                    distance: distance
                });
            }
            
            // Ordenar por distancia
            distances.sort((a, b) => a.distance - b.distance);
            
            // Conectar con las 2-3 zonas más cercanas
            const connectCount = 2 + Math.floor(Math.random() * 2); // 2 o 3 conexiones
            for (let k = 0; k < Math.min(connectCount, distances.length); k++) {
                const targetIndex = distances[k].index;
                
                // Evitar duplicados (si ya existe un camino en la dirección opuesta)
                let pathExists = false;
                for (const path of this.paths) {
                    if ((path.from === i && path.to === targetIndex) || 
                        (path.from === targetIndex && path.to === i)) {
                        pathExists = true;
                        break;
                    }
                }
                
                if (!pathExists) {
                    // Determinar el tipo de camino basado en las regiones
                    let pathType = "normal";
                    const fromRegion = zone.region;
                    const toRegion = this.minigameZones[targetIndex].region;
                    
                    if (fromRegion === toRegion) {
                        // Camino dentro de la misma región
                        pathType = "region";
                    } else {
                        // Camino entre regiones
                        pathType = "bridge";
                    }
                    
                    this.paths.push({
                        from: i,
                        to: targetIndex,
                        type: pathType,
                        color: zone.borderColor,
                        width: 4 + Math.random() * 3,
                        dashOffset: 0
                    });
                }
            }
        }
    }
    
    /**
     * Genera decoraciones temáticas para cada región
     */
    generateDecorations() {
        // Árboles en el Bosque Enredado
        const forestRegion = this.regions[1]; // Bosque Enredado
        for (let i = 0; i < 12; i++) {
            const x = forestRegion.x + 30 + Math.random() * (forestRegion.width - 60);
            const y = forestRegion.y + 30 + Math.random() * (forestRegion.height - 60);
            
            let valid = true;
            for (const zone of this.minigameZones) {
                const dx = x - (zone.x + zone.width/2);
                const dy = y - (zone.y + zone.height/2);
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < zone.width + 20) {
                    valid = false;
                    break;
                }
            }
            
            // Verificar que no esté demasiado cerca de otras decoraciones
            for (const existingDec of this.decorations) {
                const dx = x - existingDec.x;
                const dy = y - existingDec.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 50) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                this.decorations.push({
                    x: x,
                    y: y,
                    type: 'tree',
                    size: 0.8 + Math.random() * 0.5,
                    variant: Math.floor(Math.random() * 3),
                    animOffset: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Nubes en el Cielo Azucarado
        const skyRegion = this.regions[2]; // Cielo Azucarado
        for (let i = 0; i < 8; i++) {
            const x = skyRegion.x + 30 + Math.random() * (skyRegion.width - 60);
            const y = skyRegion.y + 30 + Math.random() * (skyRegion.height - 60);
            
            let valid = true;
            for (const zone of this.minigameZones) {
                const dx = x - (zone.x + zone.width/2);
                const dy = y - (zone.y + zone.height/2);
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < zone.width + 20) {
                    valid = false;
                    break;
                }
            }
            
            // Verificar que no esté demasiado cerca de otras decoraciones
            for (const existingDec of this.decorations) {
                const dx = x - existingDec.x;
                const dy = y - existingDec.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 50) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                this.decorations.push({
                    x: x,
                    y: y,
                    type: 'cloud',
                    size: 0.7 + Math.random() * 0.7,
                    speed: 0.5 + Math.random() * 1.5,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    animOffset: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Decoraciones para el Reino Cuadriculado
        const kingdomRegion = this.regions[3]; // Reino Cuadriculado
        for (let i = 0; i < 8; i++) {
            const x = kingdomRegion.x + 30 + Math.random() * (kingdomRegion.width - 60);
            const y = kingdomRegion.y + 30 + Math.random() * (kingdomRegion.height - 60);
            
            let valid = true;
            for (const zone of this.minigameZones) {
                const dx = x - (zone.x + zone.width/2);
                const dy = y - (zone.y + zone.height/2);
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < zone.width + 20) {
                    valid = false;
                    break;
                }
            }
            
            // Verificar que no esté demasiado cerca de otras decoraciones
            for (const existingDec of this.decorations) {
                const dx = x - existingDec.x;
                const dy = y - existingDec.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 50) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                const types = ['tower', 'flag', 'lamp'];
                this.decorations.push({
                    x: x,
                    y: y,
                    type: types[Math.floor(Math.random() * types.length)],
                    size: 0.7 + Math.random() * 0.4,
                    variant: Math.floor(Math.random() * 3),
                    animOffset: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Decoraciones para la Villa de los Recuerdos
        const villageRegion = this.regions[4]; // Villa de los Recuerdos
        for (let i = 0; i < 10; i++) {
            const x = villageRegion.x + 30 + Math.random() * (villageRegion.width - 60);
            const y = villageRegion.y + 30 + Math.random() * (villageRegion.height - 60);
            
            let valid = true;
            for (const zone of this.minigameZones) {
                const dx = x - (zone.x + zone.width/2);
                const dy = y - (zone.y + zone.height/2);
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < zone.width + 20) {
                    valid = false;
                    break;
                }
            }
            
            // Verificar que no esté demasiado cerca de otras decoraciones
            for (const existingDec of this.decorations) {
                const dx = x - existingDec.x;
                const dy = y - existingDec.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 50) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                const types = ['house', 'book', 'fountain'];
                this.decorations.push({
                    x: x,
                    y: y,
                    type: types[Math.floor(Math.random() * types.length)],
                    size: 0.7 + Math.random() * 0.4,
                    variant: Math.floor(Math.random() * 3),
                    animOffset: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Monedas brillantes para el Valle Dorado
        const goldRegion = this.regions[0]; // Valle Dorado
        for (let i = 0; i < 6; i++) {
            const x = goldRegion.x + 30 + Math.random() * (goldRegion.width - 60);
            const y = goldRegion.y + 30 + Math.random() * (goldRegion.height - 60);
            
            let valid = true;
            for (const zone of this.minigameZones) {
                const dx = x - (zone.x + zone.width/2);
                const dy = y - (zone.y + zone.height/2);
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < zone.width + 20) {
                    valid = false;
                    break;
                }
            }
            
            // Verificar que no esté demasiado cerca de otras decoraciones
            for (const existingDec of this.decorations) {
                const dx = x - existingDec.x;
                const dy = y - existingDec.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 50) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                this.decorations.push({
                    x: x,
                    y: y,
                    type: 'sparkle',
                    size: 0.5 + Math.random() * 0.5,
                    color: '#ffcc00',
                    animOffset: Math.random() * Math.PI * 2
                });
            }
        }
    }
    
    /**
     * Genera monedas coleccionables en el mapa
     */
    generateCoins(count) {
        // Colores para diferentes tipos de monedas
        const coinTypes = [
            { color: '#ffcc00', outline: '#cc9900', value: 5, chance: 0.7 },  // Oro (común)
            { color: '#cccccc', outline: '#999999', value: 10, chance: 0.2 },  // Plata (poco común)
            { color: '#ff6666', outline: '#cc3333', value: 25, chance: 0.1 }   // Rubí (raro)
        ];
        
        for (let i = 0; i < count; i++) {
            // Find position not overlapping with zones
            let valid = false;
            let x, y;
            while (!valid) {
                x = 50 + Math.random() * (this.game.width - 100);
                y = 50 + Math.random() * (this.game.height - 100);
                valid = true;
                
                // Check no collision with minigame zones
                for (const zone of this.minigameZones) {
                    const dx = x - (zone.x + zone.width/2);
                    const dy = y - (zone.y + zone.height/2);
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < 100) {
                        valid = false;
                        break;
                    }
                }
            }
            
            // Determinar el tipo de moneda basado en probabilidad
            let coinType;
            const roll = Math.random();
            let cumulativeChance = 0;
            
            for (const type of coinTypes) {
                cumulativeChance += type.chance;
                if (roll <= cumulativeChance) {
                    coinType = type;
                    break;
                }
            }
            
            if (!coinType) coinType = coinTypes[0]; // Fallback
            
            this.coins.push({
                x: x,
                y: y,
                size: 20,
                collected: false,
                animOffset: Math.random() * Math.PI * 2, // Para animación flotante
                color: coinType.color,
                outline: coinType.outline,
                value: coinType.value,
                glowSize: Math.random() * 5,  // Para efecto de brillo
                glowDir: Math.random() > 0.5 ? 1 : -1  // Dirección del efecto
            });
        }
    }
    
    // Check for coin collection
    checkCoinCollection() {
        const playerCenterX = this.player.x + this.player.width/2;
        const playerCenterY = this.player.y + this.player.height/2;
        
        for (const coin of this.coins) {
            if (!coin.collected) {
                const dx = playerCenterX - coin.x;
                const dy = playerCenterY - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 30) { // Collection radius
                    coin.collected = true;
                    this.game.addPoints(coin.value, 'coin');
                    // Crear un efecto visual cuando se recoge la moneda
                    console.log(`Moneda recogida! +${coin.value} puntos`);
                }
            }
        }
    }
    
    render(ctx) {
        const now = Date.now() / 1000;
        
        // 1. Dibujar fondo base
        ctx.fillStyle = '#87CEEB'; // Cielo azul claro
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // 2. Dibujar las regiones temáticas
        for (const region of this.regions) {
            // Fondo de la región
            ctx.fillStyle = region.color;
            ctx.fillRect(region.x, region.y, region.width, region.height);
            
            // Borde de la región con efecto
            ctx.strokeStyle = region.borderColor;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(region.x, region.y, region.width, region.height);
            ctx.setLineDash([]);
            
            // Nombre de la región
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(region.name, region.x + region.width/2, region.y + 10);
            
            // Efectos especiales según el tipo de región
            switch (region.bgType) {
                case 'gold':
                    // Destellos dorados para el Valle Dorado
                    for (let i = 0; i < 10; i++) {
                        const x = region.x + Math.random() * region.width;
                        const y = region.y + Math.random() * region.height;
                        const size = 2 + Math.random() * 3;
                        const alpha = 0.3 + Math.sin(now * 2 + i) * 0.2;
                        
                        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;
                case 'forest':
                    // Patrón de hojas para el Bosque Enredado
                    ctx.fillStyle = 'rgba(50, 120, 50, 0.1)';
                    for (let i = 0; i < 15; i++) {
                        const x = region.x + Math.random() * region.width;
                        const y = region.y + Math.random() * region.height;
                        const size = 10 + Math.random() * 15;
                        
                        ctx.beginPath();
                        ctx.moveTo(x, y - size/2);
                        ctx.bezierCurveTo(x + size/2, y - size/4, x + size/2, y + size/4, x, y + size/2);
                        ctx.bezierCurveTo(x - size/2, y + size/4, x - size/2, y - size/4, x, y - size/2);
                        ctx.fill();
                    }
                    break;
                case 'sky':
                    // Efecto de cielo brillante
                    const gradient = ctx.createLinearGradient(
                        region.x, region.y,
                        region.x + region.width, region.y + region.height
                    );
                    gradient.addColorStop(0, 'rgba(173, 216, 230, 0.4)');
                    gradient.addColorStop(0.5, 'rgba(135, 206, 250, 0.3)');
                    gradient.addColorStop(1, 'rgba(173, 216, 230, 0.4)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(region.x, region.y, region.width, region.height);
                    break;
                case 'kingdom':
                    // Patrón de tablero de ajedrez sutil
                    const squareSize = 20;
                    ctx.fillStyle = 'rgba(100, 100, 200, 0.1)';
                    
                    for (let x = 0; x < region.width; x += squareSize * 2) {
                        for (let y = 0; y < region.height; y += squareSize * 2) {
                            ctx.fillRect(region.x + x, region.y + y, squareSize, squareSize);
                            ctx.fillRect(region.x + x + squareSize, region.y + y + squareSize, squareSize, squareSize);
                        }
                    }
                    break;
                case 'village':
                    // Efecto de pergamino para la Villa de los Recuerdos
                    ctx.fillStyle = 'rgba(222, 184, 135, 0.1)';
                    ctx.fillRect(region.x, region.y, region.width, region.height);
                    
                    // Algunas líneas horizontales como texto en un libro
                    ctx.strokeStyle = 'rgba(139, 69, 19, 0.1)';
                    ctx.lineWidth = 1;
                    
                    for (let y = region.y + 40; y < region.y + region.height - 20; y += 15) {
                        ctx.beginPath();
                        ctx.moveTo(region.x + 20, y);
                        ctx.lineTo(region.x + region.width - 20, y);
                        ctx.stroke();
                    }
                    break;
            }
        }
        
        // 3. Dibujar los caminos entre zonas
        for (const path of this.paths) {
            const fromZone = this.minigameZones[path.from];
            const toZone = this.minigameZones[path.to];
            
            const fromX = fromZone.x + fromZone.width / 2;
            const fromY = fromZone.y + fromZone.height / 2;
            const toX = toZone.x + toZone.width / 2;
            const toY = toZone.y + toZone.height / 2;
            
            // Estilo del camino según el tipo
            switch (path.type) {
                case 'region':
                    // Camino dentro de la misma región - línea sólida del color de la zona
                    ctx.strokeStyle = fromZone.borderColor;
                    ctx.lineWidth = path.width;
                    ctx.setLineDash([]);
                    break;
                case 'bridge':
                    // Camino entre regiones - línea punteada degradada
                    const gradient = ctx.createLinearGradient(fromX, fromY, toX, toY);
                    gradient.addColorStop(0, fromZone.borderColor);
                    gradient.addColorStop(1, toZone.borderColor);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = path.width;
                    ctx.setLineDash([10, 5]);
                    
                    // Efecto de animación en el patrón de línea
                    path.dashOffset = (path.dashOffset + 0.2) % 15;
                    ctx.lineDashOffset = path.dashOffset;
                    break;
                default:
                    // Camino normal
                    ctx.strokeStyle = '#777777';
                    ctx.lineWidth = path.width;
                    ctx.setLineDash([]);
            }
            
            // Dibujar el camino
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            
            // Crear una curva suave si no es una línea recta
            const dx = toX - fromX;
            const dy = toY - fromY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 200) {
                // Para caminos largos, crear una curva
                const midX = (fromX + toX) / 2;
                const midY = (fromY + toY) / 2;
                const perpX = -dy * 0.3;
                const perpY = dx * 0.3;
                
                ctx.quadraticCurveTo(
                    midX + perpX,
                    midY + perpY,
                    toX,
                    toY
                );
            } else {
                // Para caminos cortos, línea recta
                ctx.lineTo(toX, toY);
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // 4. Dibujar las decoraciones (detrás de las zonas de minijuegos)
        for (const decoration of this.decorations) {
            // Posición con posible animación para algunos elementos
            let x = decoration.x;
            let y = decoration.y;
            
            if (decoration.type === 'cloud') {
                // Nubes flotantes con movimiento
                x += Math.sin(now * decoration.speed * 0.01) * 15 * decoration.direction;
            } else if (decoration.type === 'coin' || decoration.type === 'gem') {
                // Animación flotante para monedas y gemas
                y += Math.sin(now + decoration.animOffset) * 3;
            }
            
            const size = decoration.size || 1;
            
            // Dibujar decoración según tipo
            switch (decoration.type) {
                case 'tree':
                    // Árbol mejorado con diferentes variantes
                    const variant = decoration.variant || 0;
                    const treeColors = [
                        { leaf: '#225522', trunk: '#8B4513' },  // Verde normal
                        { leaf: '#336633', trunk: '#A0522D' },  // Verde oscuro
                        { leaf: '#558855', trunk: '#8B4513' }   // Verde claro
                    ];
                    const treeColor = treeColors[variant % treeColors.length];
                    
                    // Tronco
                    ctx.fillStyle = treeColor.trunk;
                    ctx.fillRect(x - 5 * size, y, 10 * size, 20 * size);
                    
                    // Copa en varias capas
                    ctx.fillStyle = treeColor.leaf;
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.moveTo(x, y - (40 + i * 10) * size);
                        ctx.lineTo(x + (30 - i * 5) * size, y - i * 10 * size);
                        ctx.lineTo(x - (30 - i * 5) * size, y - i * 10 * size);
                        ctx.closePath();
                        ctx.fill();
                    }
                    break;
                case 'rock':
                    // Rocas con diferentes tonos
                    const rockVariant = decoration.variant || 0;
                    const rockColors = ['#999999', '#aaaaaa', '#777777'];
                    const rockColor = rockColors[rockVariant % rockColors.length];
                    
                    ctx.fillStyle = rockColor;
                    ctx.beginPath();
                    ctx.ellipse(x, y, 20 * size, 15 * size, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#555555';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    break;
                case 'cloud':
                    // Nubes esponjosas con sombra
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    
                    // Primera parte de la nube
                    ctx.beginPath();
                    ctx.arc(x, y, 20 * size, 0, Math.PI * 2);
                    ctx.arc(x + 15 * size, y - 10 * size, 15 * size, 0, Math.PI * 2);
                    ctx.arc(x + 25 * size, y, 20 * size, 0, Math.PI * 2);
                    ctx.arc(x + 10 * size, y + 8 * size, 15 * size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'coin':
                    // Moneda brillante
                    ctx.fillStyle = '#ffcc00';
                    ctx.beginPath();
                    ctx.arc(x, y, 10 * size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#cc9900';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    // Brillo de la moneda
                    const coinGlow = Math.sin(now * 2 + decoration.animOffset) * 5 + 5;
                    ctx.fillStyle = `rgba(255, 215, 0, ${0.1 + Math.sin(now * 3) * 0.05})`;
                    ctx.beginPath();
                    ctx.arc(x, y, (10 + coinGlow) * size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'gem':
                    // Gema brillante
                    ctx.fillStyle = '#ff55aa';
                    ctx.beginPath();
                    ctx.moveTo(x, y - 10 * size);
                    ctx.lineTo(x + 8 * size, y);
                    ctx.lineTo(x, y + 10 * size);
                    ctx.lineTo(x - 8 * size, y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#cc3377';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    // Brillo de la gema
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.beginPath();
                    ctx.moveTo(x - 3 * size, y - 3 * size);
                    ctx.lineTo(x + 2 * size, y - 1 * size);
                    ctx.lineTo(x, y + 2 * size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'tower':
                    // Torre de castillo
                    ctx.fillStyle = '#9966cc';
                    ctx.fillRect(x - 10 * size, y - 25 * size, 20 * size, 30 * size);
                    
                    // Techo de la torre
                    ctx.fillStyle = '#cc66ff';
                    ctx.beginPath();
                    ctx.moveTo(x - 15 * size, y - 25 * size);
                    ctx.lineTo(x, y - 40 * size);
                    ctx.lineTo(x + 15 * size, y - 25 * size);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Ventana
                    ctx.fillStyle = '#ffcc66';
                    ctx.fillRect(x - 5 * size, y - 15 * size, 10 * size, 10 * size);
                    break;
                case 'house':
                    // Casa simple para la villa
                    ctx.fillStyle = '#ffcc99';
                    ctx.fillRect(x - 15 * size, y - 15 * size, 30 * size, 20 * size);
                    
                    // Techo
                    ctx.fillStyle = '#ff7744';
                    ctx.beginPath();
                    ctx.moveTo(x - 20 * size, y - 15 * size);
                    ctx.lineTo(x, y - 30 * size);
                    ctx.lineTo(x + 20 * size, y - 15 * size);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Puerta
                    ctx.fillStyle = '#aa5533';
                    ctx.fillRect(x - 5 * size, y - 5 * size, 10 * size, 10 * size);
                    break;
                case 'book':
                    // Libro
                    ctx.fillStyle = '#ddaa88';
                    ctx.fillRect(x - 10 * size, y - 7 * size, 20 * size, 14 * size);
                    
                    // Páginas
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x - 9 * size, y - 6 * size, 18 * size, 12 * size);
                    
                    // Líneas de texto
                    ctx.strokeStyle = '#555555';
                    ctx.lineWidth = 0.5;
                    for (let i = 0; i < 4; i++) {
                        ctx.beginPath();
                        ctx.moveTo(x - 7 * size, y - 4 * size + i * 4 * size);
                        ctx.lineTo(x + 7 * size, y - 4 * size + i * 4 * size);
                        ctx.stroke();
                    }
                    break;
                case 'lamp':
                    // Farol con efecto de luz más intenso
                    ctx.fillStyle = '#555555';
                    ctx.fillRect(x - 2 * size, y - 20 * size, 4 * size, 25 * size);
                    
                    // Luz
                    ctx.fillStyle = '#ffcc66';
                    ctx.beginPath();
                    ctx.arc(x, y - 25 * size, 8 * size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Brillo mejorado
                    const lampGlow = Math.sin(now * 2) * 3 + 5;
                    ctx.fillStyle = `rgba(255, 200, 100, ${0.1 + Math.sin(now) * 0.05})`;
                    ctx.beginPath();
                    ctx.arc(x, y - 25 * size, (8 + lampGlow) * size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'sparkle':
                    // Efecto de brillo dorado
                    const sparkleSize = (1 + Math.sin(now * 5 + decoration.animOffset)) * size * 5;
                    const sparkleAlpha = 0.3 + Math.sin(now * 3 + decoration.animOffset) * 0.2;
                    
                    ctx.fillStyle = decoration.color || `rgba(255, 220, 50, ${sparkleAlpha})`;
                    
                    // Estrella de 4 puntas
                    ctx.beginPath();
                    for (let i = 0; i < 4; i++) {
                        const angle = (Math.PI / 2) * i;
                        const innerAngle = angle + Math.PI / 4;
                        
                        ctx.lineTo(x + Math.cos(angle) * sparkleSize, y + Math.sin(angle) * sparkleSize);
                        ctx.lineTo(x + Math.cos(innerAngle) * sparkleSize * 0.4, y + Math.sin(innerAngle) * sparkleSize * 0.4);
                    }
                    ctx.closePath();
                    ctx.fill();
                    
                    // Brillo central
                    ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
                    ctx.beginPath();
                    ctx.arc(x, y, sparkleSize * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'fountain':
                    // Base de la fuente
                    ctx.fillStyle = '#aaaaaa';
                    ctx.beginPath();
                    ctx.arc(x, y, 15 * size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Agua de la fuente
                    ctx.fillStyle = '#66ccff';
                    ctx.beginPath();
                    ctx.arc(x, y, 10 * size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Efecto de spray de agua
                    const fountainHeight = Math.sin(now * 5 + decoration.animOffset) * 3 + 10;
                    const dropletCount = 5;
                    
                    for (let i = 0; i < dropletCount; i++) {
                        const angle = (Math.PI * 2 / dropletCount) * i + now;
                        const dropX = x + Math.cos(angle) * 5 * size;
                        const dropY = y - fountainHeight * size + Math.sin(now * 8 + i) * 5 * size;
                        
                        ctx.fillStyle = 'rgba(150, 210, 255, 0.7)';
                        ctx.beginPath();
                        ctx.arc(dropX, dropY, 2 * size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;
                    
                case 'flag':
                    // Base del mástil
                    ctx.fillStyle = '#888888';
                    ctx.fillRect(x - 1 * size, y - 25 * size, 2 * size, 25 * size);
                    
                    // Tela ondeante
                    const flagOffset = Math.sin(now * 3 + decoration.animOffset) * 3;
                    ctx.fillStyle = decoration.variant === 0 ? '#ff6644' : (decoration.variant === 1 ? '#44aaff' : '#ffcc44');
                    ctx.beginPath();
                    ctx.moveTo(x, y - 25 * size);
                    ctx.lineTo(x + 15 * size, y - 20 * size + flagOffset);
                    ctx.lineTo(x + 15 * size, y - 30 * size + flagOffset);
                    ctx.lineTo(x, y - 25 * size);
                    ctx.fill();
                    break;
            }
        }
        
        // 5. Dibujar las zonas de minijuegos con efectos mejorados
        for (const zone of this.minigameZones) {
            // Calcular efecto pulsante basado en tiempo
            const pulse = Math.sin(now * 2) * 3 + 3;
            
            // Dibujar fondo de la zona con brillo
            ctx.fillStyle = zone.color;
            ctx.beginPath();
            ctx.arc(zone.x + zone.width/2, zone.y + zone.height/2, zone.width/2 + pulse, 0, Math.PI * 2);
            ctx.fill();
            
            // Borde de la zona
            ctx.strokeStyle = zone.borderColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(zone.x + zone.width/2, zone.y + zone.height/2, zone.width/2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Círculo interior
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(zone.x + zone.width/2, zone.y + zone.height/2, zone.width/2 - 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Ícono del juego
            ctx.fillStyle = zone.color;
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(zone.icon, zone.x + zone.width/2, zone.y + zone.height/2);
            
            // Nombre del juego
            ctx.fillStyle = '#222222';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(zone.displayName, zone.x + zone.width/2, zone.y + zone.height + 15);
        }
        
        // 6. Dibujar monedas coleccionables con efectos
        for (const coin of this.coins) {
            if (!coin.collected) {
                // Animación flotante
                const yOffset = Math.sin(now + coin.animOffset) * 3;
                
                // Actualizar tamaño del brillo
                coin.glowSize += 0.1 * coin.glowDir;
                if (coin.glowSize > 5) {
                    coin.glowDir = -1;
                } else if (coin.glowSize < 0) {
                    coin.glowDir = 1;
                }
                
                // Dibujar brillo
                const alpha = 0.3 - coin.glowSize * 0.05;
                ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                ctx.beginPath();
                ctx.arc(coin.x, coin.y + yOffset, coin.size/2 + coin.glowSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Dibujar moneda
                ctx.fillStyle = coin.color;
                ctx.beginPath();
                ctx.arc(coin.x, coin.y + yOffset, coin.size/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = coin.outline;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Dibujar detalle interior
                ctx.fillStyle = coin.outline;
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('' + coin.value, coin.x, coin.y + yOffset);
            }
        }
        
        // 7. Dibujar jugador con efecto de brillo
        // Actualizar tamaño del brillo del jugador
        this.player.glowSize += 0.2 * this.player.glowDir;
        if (this.player.glowSize > 10) {
            this.player.glowDir = -1;
        } else if (this.player.glowSize < 0) {
            this.player.glowDir = 1;
        }
        
        // Dibujar brillo alrededor del jugador
        ctx.fillStyle = `rgba(255, 235, 150, ${0.3 - this.player.glowSize * 0.02})`;
        ctx.beginPath();
        ctx.arc(
            this.player.x + this.player.width/2,
            this.player.y + this.player.height/2,
            this.player.width/2 + this.player.glowSize,
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Determinar qué imagen usar según el personaje seleccionado
        let playerImage;
        
        if (window.playerCharacter && window.playerCharacter.character === 'croisa') {
            playerImage = this.game.croisaImage;
        } else {
            playerImage = this.game.croisoImage;
        }
        
        // Dibujar la imagen del personaje seleccionado
        if (playerImage && playerImage.complete && playerImage.naturalHeight !== 0) {
            ctx.drawImage(
                playerImage,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
        } else {
            // Dibujar un croissant genérico como respaldo
            const playerCenterX = this.player.x + this.player.width/2;
            const playerCenterY = this.player.y + this.player.height/2;
            
            // Forma principal
            ctx.fillStyle = '#e6b266';
            ctx.beginPath();
            ctx.moveTo(playerCenterX - 15, playerCenterY + 5);
            ctx.bezierCurveTo(
                playerCenterX - 20, playerCenterY - 15,
                playerCenterX + 10, playerCenterY - 15,
                playerCenterX + 15, playerCenterY
            );
            ctx.bezierCurveTo(
                playerCenterX + 5, playerCenterY + 15,
                playerCenterX - 10, playerCenterY + 10,
                playerCenterX - 15, playerCenterY + 5
            );
            ctx.fill();
            
            // Borde
            ctx.strokeStyle = '#966f33';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Detalles
            ctx.fillStyle = '#966f33';
            ctx.beginPath();
            ctx.arc(playerCenterX - 5, playerCenterY - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(playerCenterX + 5, playerCenterY - 5, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw score UI
        if (this.showScoreUI) {
            const padding = 10;
            const uiWidth = 180;
            const uiHeight = 90;
            
            // Draw UI panel
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(padding, padding, uiWidth, uiHeight);
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 2;
            ctx.strokeRect(padding, padding, uiWidth, uiHeight);
            
            // Draw score text
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Puntos: ${this.game.playerScore}`, padding + 10, padding + 10);
            ctx.fillText(`Monedas: ${this.game.playerCoins}`, padding + 10, padding + 35);
            ctx.fillText(`Minijuegos: ${this.game.achievements.minigamesPlayed}`, padding + 10, padding + 60);
        }
        
        // Draw minimap
        if (this.showMinimap) {
            const mapSize = 120;
            const mapX = this.game.width - mapSize - 10;
            const mapY = 10;
            
            // Draw map background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(mapX, mapY, mapSize, mapSize);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(mapX, mapY, mapSize, mapSize);
            
            // Draw minigame zones on minimap
            const scaleX = mapSize / this.game.width;
            const scaleY = mapSize / this.game.height;
            
            for (const zone of this.minigameZones) {
                const miniX = mapX + zone.x * scaleX;
                const miniY = mapY + zone.y * scaleY;
                const miniSize = zone.width * scaleX;
                
                ctx.fillStyle = zone.color;
                ctx.beginPath();
                ctx.arc(miniX + miniSize/2, miniY + miniSize/2, miniSize/2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw player on minimap
            const miniPlayerX = mapX + this.player.x * scaleX;
            const miniPlayerY = mapY + this.player.y * scaleY;
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(miniPlayerX + this.player.width * scaleX / 2, 
                    miniPlayerY + this.player.height * scaleY / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw instructions with better UI
        const instructions = [
            'WASD o flechas para moverte',
            'Clic para moverte a un punto',
            'Recoge monedas para ganar puntos',
            'Entra en las zonas para jugar minijuegos'
        ];
        
        const instructionsY = this.game.height - 25 * instructions.length - 10;
        
        // Background panel for instructions
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, instructionsY - 10, this.game.width, 25 * instructions.length + 20);
        
        // Instruction text
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        instructions.forEach((text, i) => {
            ctx.fillText(text, this.game.width / 2, instructionsY + i * 25);
        });
    }
}
