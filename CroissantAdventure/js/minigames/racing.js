/**
 * Hill Climbing Minigame - Escalada de Fondant
 * Un juego de conducción donde el jugador debe subir colinas manteniendo el equilibrio del vehículo
 */
window.RacingMinigame = class RacingMinigame extends Minigame {
    constructor(game) {
        super(game);
        
        // Configuración de colores para generar gráficos por código
        this.colors = {
            groundTop: '#8B4513',       // Superficie del terreno
            groundFill: '#A0522D',      // Relleno del terreno
            groundLine: '#5C3317',      // Línea del terreno
            sky: '#87CEEB',             // Cielo
            skyGradient1: '#FFB347',    // Gradiente del cielo 1
            skyGradient2: '#FFCBA4',    // Gradiente del cielo 2
            car: '#FF6347',             // Cuerpo principal del vehículo
            wheel: '#333333',           // Ruedas
            wheelInner: '#888888',      // Interior de las ruedas
            fuel: '#00FF00',            // Combustible
            coin: '#FFD700',            // Monedas/estrellas
            particle: '#FFA500'         // Partículas
        };
        
        // Variables para optimización de rendimiento
        this.lastFrameTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.frameTime = 0;
        this.debugMode = false; // Activar/desactivar modo debug con T
        
        // Modo de renderizado optimizado (para equipos de bajo rendimiento)
        this.optimizedRendering = true;
        this.visibleTerrainSegments = [];
        this.visibleCollectibles = [];
        
        // Física del juego - Ajustados para mejor comportamientotes
        this.gravity = 0.1;           // Aumentada la fuerza de gravedadcesivos
        this.friction = 0.95;         // Ajustado para mejor tracción
        this.airFriction = 0.98;      // Más resistencia en el aire
        
        // Sistema de partículas
        this.maxParticles = 50;
        
        // Cache para mejorar rendimiento
        this.terrainSegmentCount = 0;
        
        // Inicializar el juego
        this.reset();
        
        // Sonidos - objeto vacío para evitar errores
        this.sounds = {};
        console.log('Minijuego de Hill Climbing inicializado correctamente');
    }
    
    reset() {
        console.log('Reiniciando juego Hill Climbing');
        
        // Estado del juego
        this.score = 0;
        this.distance = 0;         // Distancia recorrida
        this.gameOver = false;
        this.victory = false;
        this.fuel = 100;           // Nivel de combustible (0-100)
        this.coins = 0;            // Monedas recolectadas
        
        // Vehículo con propiedades de física estilo Hill Climbing - Mejoradasas
        this.vehicle = {
            // Chasis del vehículo
            x: 150,                // Posición inicial X
            y: 0,                  // Se ajustará al terreno
            width: 80,             // Ancho del vehículo
            height: 40,            // Altura del vehículo
            rotation: 0,           // Rotación del vehículo en radianes
            speed: 0,              // Velocidad horizontal
            speedY: 0,             // Velocidad vertical
            power: 0,              // Potencia del motor (aceleración)
            maxPower: 0.1,         // Reducida para más control suave
            brake: 0,              // Fuerza de frenado
            flipped: false,        // Si el vehículo ha volcado
            grounded: false,       // Si el vehículo está en contacto con el suelo
            
            // Ruedas del vehículo
            wheelFront: {
                x: 0,              // Posición relativa X (se actualiza)
                y: 0,              // Posición relativa Y (se actualiza)
                radius: 8,        // Radio de la rueda
                rotation: 0,       // Rotación de la rueda
                grounded: false,   // Si la rueda toca el suelo
                springForce: 0,    // Fuerza de resorte aplicada a la rueda
                suspension: 0      // Estado actual de la suspensión
            },
            wheelBack: {
                x: 0,              // Posición relativa X (se actualiza)
                y: 0,              // Posición relativa Y (se actualiza)
                radius: 8,        // Radio de la rueda
                rotation: 0,       // Rotación de la rueda
                grounded: false,   // Si la rueda toca el suelo
                springForce: 0,    // Fuerza de resorte aplicada a la rueda
                suspension: 0      // Estado actual de la suspensión
            },
            
            // Propiedades de la suspensión - Ajustadas para mejor comportamiento
            suspension: {
                stiffness: 0.3,     // Aumentada rigidez para evitar rebotar demasiado
                damping: 0.6,       // Ajustada amortiguación
                restLength: 20,     // Longitud en reposo
                maxLength: 35       // Extensión máxima
            },
            
            // Consumo de combustible
            fuelConsumption: 0.05,  // Consumo base por segundo cuando acelera
            
            // Estado de control
            accelerating: false,    // Si está acelerando
            braking: false         // Si está frenando
        };
        
        // Generar terreno ondulado con colinas y valles
        const terrainLength = this.optimizedRendering ? 500 : 2000;
        this.terrain = this.generateTerrain(terrainLength);
        this.terrainSegmentCount = this.terrain.length;
        
        // Generar coleccionables (combustible y monedas)
        this.collectibles = this.generateCollectibles(terrainLength);
        
        // Determinar posición inicial del vehículo según el terreno
        this.setVehicleInitialPosition();
        
        // Actualizar posiciones de las ruedas
        this.updateWheelPositions();
        
        // Meta final
        this.finish = {
            x: (terrainLength - 10) * 31, // Cerca del final del terreno
            y: 0, // Se ajustará al terreno
            width: 300,
            height: 100,
            reached: false,
            flag: {
                height: 150,
                waving: 0
            }
        };
        
        // Ajustar Y de la meta al terreno
        const finishTerrainIndex = Math.floor(this.finish.x / 30);
        if (finishTerrainIndex < this.terrain.length) {
            this.finish.y = this.terrain[finishTerrainIndex].y - this.finish.height / 2;
        }
        
        // Partículas para efectos
        this.particles = [];
        
        // Cámara con enfoque suave que sigue al vehículo
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.07, // Suavizado de cámara
            shakeAmount: 0,  // Cantidad de temblor para efectos
            shakeDecay: 0.9  // Velocidad a la que se reduce el temblor
        };
        
        // Variables para rendimiento y consistencia
        this.lastUpdateTime = performance.now();
        this.deltaTimeMultiplier = 1.0;
        
        // Hitos de distancia para puntuación
        this.distanceMilestones = [100, 250, 500, 1000, 2000, 3000, 5000];
        this.nextMilestoneIndex = 0;
    }
    
    /**
     * Establece la posición inicial del vehículo según el terreno
     */
    setVehicleInitialPosition() {
        // Asegurarse de que el vehículo empiece sobre el terreno plano inicial
        if (this.terrain && this.terrain.length > 0) {
            // Colocar el vehículo al principio del terreno
            this.vehicle.y = this.terrain[5].y - this.vehicle.height - this.vehicle.wheelBack.radius;
        }
    }
    
    /**
     * Actualiza las posiciones de las ruedas relativas al vehículo
     */
    updateWheelPositions() {
    const wheelBase = this.vehicle.width * 0.8;
    
    // Actualizar solo las rotaciones de las ruedas
    this.vehicle.wheelBack.rotation += this.vehicle.speed * 0.1;
    this.vehicle.wheelFront.rotation += this.vehicle.speed * 0.1;
}
    
    /**
     * Genera un terreno ondulado para el juego de hill climbing
     * @param {number} length - Longitud del terreno a generar
     */
    generateTerrain(length = 5000 ) {
        const terrain = [];
        const segmentWidth = 30; // Ancho de cada segmento de terreno
        
        // Crear terreno inicial plano para el arranque
        for (let i = 0; i < 10; i++) {
            terrain.push({
                x: i * segmentWidth,
                y: this.game.height - 100, // Altura base 
                checkpoint: false,
                fuel: false,
                coin: false
            });
        }
        
        // Altura actual
        let currentHeight = this.game.height - 100;
        
        // Patrón de terreno: combinación de senos, cosenos y ruido para terreno natural
        let hilliness = 0.1; // Factor de ondulación inicial
        let prevSlope = 0;   // Pendiente anterior para evitar cambios bruscos
        
        // Generar el resto del terreno ondulado
        for (let i = 10; i < length; i++) {
            // Aumentar gradualmente la dificultad
            if (i > length * 0.2) {
                hilliness = Math.min(0.4, hilliness + 0.0003);
            }
            
            // Calcular la siguiente altura usando una combinación de ondas
            let slope = 0;
            
            // Ondas principales para la forma del terreno
            slope += Math.sin(i * 0.05) * hilliness * 5;
            slope += Math.cos(i * 0.08) * hilliness * 3;
            
            // Añadir ruido de alta frecuencia para detalles pequeños
            slope += (Math.random() - 0.5) * hilliness * 2;
            
            // Suavizar cambios de pendiente para evitar picos imposibles
            slope = prevSlope * 0.7 + slope * 0.3;
            prevSlope = slope;
            
            // Calcular nueva altura
            currentHeight += slope;
            
            // Limitar altura entre límites razonables
            const minHeight = this.game.height * 0.2;
            const maxHeight = this.game.height - 50;
            currentHeight = Math.max(minHeight, Math.min(maxHeight, currentHeight));
            
            // Crear colinas y pendientes más pronunciadas ocasionalmente
            if (i > 50 && Math.random() < 0.03) {
                // Crear una rampa o un salto
                const rampHeight = (Math.random() * 70) * (Math.random() < 0.5 ? -1 : 1);
                currentHeight += rampHeight;
                
                // Si es un salto muy alto, añadir una pequeña plataforma
                if (Math.abs(rampHeight) > 40) {
                    terrain.push({
                        x: i * segmentWidth,
                        y: currentHeight,
                        checkpoint: i % 100 === 0, // Checkpoint cada 100 segmentos
                        fuel: false,
                        coin: false,
                        isJump: false
                    });
                    
                    // Pequeña plataforma después del salto
                    for (let j = 1; j <= 3; j++) {
                        terrain.push({
                            x: (i + j) * segmentWidth,
                            y: currentHeight,
                            checkpoint: false,
                            fuel: false,
                            coin: false
                        });
                    }
                    
                    i += 3; // Avanzar el contador para considerar la plataforma
                    continue; // Saltar a la siguiente iteración
                }
            }
            
            // Añadir punto de control cada cierta distancia
            const isCheckpoint = i % 100 === 0 && i > 0;
            
            // Añadir segmento al terreno
            terrain.push({
                x: i * segmentWidth,
                y: currentHeight,
                checkpoint: isCheckpoint,
                fuel: false,
                coin: false
            });
        }
        
        return terrain;
    }
    
    /**
     * Genera coleccionables (combustible y monedas) a lo largo del terreno
     * @param {number} terrainLength - Longitud del terreno
     */
    generateCollectibles(terrainLength) {
        const collectibles = [];
        
        // Distribuir bidones de combustible a lo largo del terreno
        const fuelSpacing = 150; // Cada cuantos segmentos colocar combustible
        for (let i = 50; i < terrainLength; i += fuelSpacing) {
            // Variar un poco la posición
            const actualIndex = i + Math.floor((Math.random() - 0.5) * 20);
            
            if (actualIndex >= 0 && actualIndex < this.terrain.length) {
                collectibles.push({
                    x: this.terrain[actualIndex].x,
                    y: this.terrain[actualIndex].y - 40, // Posicionar por encima del terreno
                    type: 'fuel',
                    width: 30,
                    height: 40,
                    collected: false,
                    animOffset: Math.random() * Math.PI * 2 // Para animación flotante
                });
            }
        }
        
        // Distribuir monedas/estrellas para puntos extra
        const coinSpacing = 50; // Cada cuantos segmentos colocar monedas
        for (let i = 30; i < terrainLength; i += coinSpacing) {
            // A veces crear pequeños grupos de monedas
            const isGroup = Math.random() < 0.3;
            
            if (isGroup) {
                // Crear un patrón de 3-5 monedas
                const numCoins = 3 + Math.floor(Math.random() * 3);
                for (let j = 0; j < numCoins; j++) {
                    const coinIndex = i + j;
                    if (coinIndex < this.terrain.length) {
                        // Formar un arco ascendente
                        const heightOffset = -30 - Math.sin(j / numCoins * Math.PI) * 40;
                        
                        collectibles.push({
                            x: this.terrain[coinIndex].x,
                            y: this.terrain[coinIndex].y + heightOffset,
                            type: 'coin',
                            radius: 15,
                            collected: false,
                            animOffset: Math.random() * Math.PI * 2,
                            value: 5 // Valor en puntos
                        });
                    }
                }
                
                // Saltar al final del grupo
                i += numCoins - 1;
            } else {
                // Moneda individual
                if (i < this.terrain.length) {
                    collectibles.push({
                        x: this.terrain[i].x,
                        y: this.terrain[i].y - 35, // Posicionar por encima del terreno
                        type: 'coin',
                        radius: 15,
                        collected: false,
                        animOffset: Math.random() * Math.PI * 2,
                        value: 10 // Valor en puntos
                    });
                }
            }
        }
        
        return collectibles;
    }
    
    /**
     * Comprueba si un punto está por debajo del terreno
     * @param {number} x - Coordenada X a comprobar
     * @param {number} y - Coordenada Y a comprobar
     * @returns {Object|null} - El punto del terreno debajo de la coordenada o null
     */
    getTerrainPointAt(x) {
        if (!this.terrain || this.terrain.length === 0) return null;
        
        // Encontrar los dos puntos del terreno que rodean la coordenada X
        const segmentWidth = 30; // Ancho de cada segmento
        const index = Math.floor(x / segmentWidth);
        
        if (index < 0 || index >= this.terrain.length - 1) return null;
        
        const point1 = this.terrain[index];
        const point2 = this.terrain[index + 1];
        
        // Calcular la posición relativa entre los dos puntos (0-1)
        const t = (x - point1.x) / (point2.x - point1.x);
        
        // Interpolar linealmente la altura
        const y = point1.y + t * (point2.y - point1.y);
        
        return {
            x: x,
            y: y,
            index: index,
            t: t,
            slope: (point2.y - point1.y) / (point2.x - point1.x),
            checkpoint: point1.checkpoint || point2.checkpoint
        };
    }
    
    /**
     * Obtiene la pendiente del terreno en un punto dado
     * @param {number} x - Coordenada X
     * @returns {number} - Ángulo de la pendiente en radianes
     */
    getTerrainSlopeAt(x) {
        const segmentWidth = 30;
        const index = Math.floor(x / segmentWidth);
        
        if (index < 0 || index >= this.terrain.length - 1) return 0;
        
        const point1 = this.terrain[index];
        const point2 = this.terrain[index + 1];
        
        // Calcular la pendiente (rise / run)
        const rise = point2.y - point1.y;
        const run = point2.x - point1.x;
        
        // Calcular ángulo de la pendiente
        return Math.atan2(rise, run);
    }
    
    /**
     * Método para reproducir sonidos de forma segura
     */
    playSound(soundName) {
        try {
            if (this.sounds && this.sounds[soundName]) {
                this.sounds[soundName].play().catch(err => {
                    console.warn(`Error al reproducir sonido ${soundName}:`, err);
                });
            }
        } catch (e) {
            console.warn(`Error al intentar reproducir sonido ${soundName}:`, e);
        }
    }
    
    /**
     * Maneja la entrada del usuario para el juego de Hill Climbing
     */
    handleInput(deltaTime) {
        // Si el juego ha terminado, solo permitir reiniciar o salir
        if (this.gameOver || this.victory) {
            if (this.game.isKeyPressed(' ')) {
                this.reset();
            }
            
            if (this.game.isKeyPressed('Escape')) {
                this.game.switchScene('worldMap');
            }
            return;
        }
        
        // Normalizar deltaTime para tener un control consistente
        const normalizedDelta = Math.min(deltaTime, 0.05) * 60; // Limitado a 50ms, normalizado para 60 FPS
        
        // Aceleración (tecla flecha arriba o W)
        if (this.game.isKeyPressed('ArrowUp') || this.game.isKeyPressed('w')) {
            // Solo acelerar si hay combustible
            if (this.fuel > 0) {
                // Aplicar aceleración gradual
                this.vehicle.power = Math.min(this.vehicle.maxPower, this.vehicle.power + 0.02 * normalizedDelta);
                this.vehicle.accelerating = true;
                
                // Consumir combustible
                this.fuel -= this.vehicle.fuelConsumption * normalizedDelta;
                
                // Efectos de aceleración: partículas si el vehículo está en contacto con el suelo
                if (this.vehicle.wheelBack.grounded && Math.random() < 0.2) {
                    this.createParticles(
                        this.vehicle.wheelBack.x,
                        this.vehicle.wheelBack.y,
                        2,
                        '#888888',
                        0.5
                    );
                }
            } else {
                // Sin combustible
                this.vehicle.power *= 0.95; // Desacelerar gradualmente
                this.vehicle.accelerating = false;
            }
        } else {
            // Desacelerar gradualmente cuando no se presiona acelerar
            this.vehicle.power *= 0.95;
            this.vehicle.accelerating = false;
        }
        
        // Freno (tecla flecha abajo o S)
        if (this.game.isKeyPressed('ArrowDown') || this.game.isKeyPressed('s')) {
            this.vehicle.brake = Math.min(1, this.vehicle.brake + 0.1 * normalizedDelta);
            this.vehicle.braking = true;
            
            // Efectos de frenado: partículas si está en movimiento y en contacto con el suelo
            if (Math.abs(this.vehicle.speed) > 0.5 && 
                (this.vehicle.wheelBack.grounded || this.vehicle.wheelFront.grounded) && 
                Math.random() < 0.3) {
                
                this.createParticles(
                    (this.vehicle.wheelBack.x + this.vehicle.wheelFront.x) / 2,
                    (this.vehicle.wheelBack.y + this.vehicle.wheelFront.y) / 2,
                    2,
                    '#AAAAAA',
                    0.3
                );
            }
        } else {
            this.vehicle.brake = 0;
            this.vehicle.braking = false;
        }
        
        // Balance del vehículo (teclas izquierda/derecha o A/D)
        // Esto ayuda a ajustar el ángulo del vehículo para evitar volcar
        if (this.game.isKeyPressed('ArrowLeft') || this.game.isKeyPressed('a')) {
            // Inclinar hacia atrás/izquierda (rotar en sentido antihorario)
            this.vehicle.rotation -= 0.03 * normalizedDelta;
        }
        
        if (this.game.isKeyPressed('ArrowRight') || this.game.isKeyPressed('d')) {
            // Inclinar hacia adelante/derecha (rotar en sentido horario)
            this.vehicle.rotation += 0.03 * normalizedDelta;
        }
        
        // Activar/desactivar modo depuración con tecla T
        if (this.game.isKeyPressed('t') && !this.lastTKeyState) {
            this.debugMode = !this.debugMode;
            console.log(`Modo debug ${this.debugMode ? 'activado' : 'desactivado'}`);
        }
        this.lastTKeyState = this.game.isKeyPressed('t');
    }
    
    /**
     * Actualiza el estado del juego de Hill Climbing
     */
    update(deltaTime) {
        // Call parent update method first to handle common functionality like exit button
        super.update(deltaTime);
        
        // Medir rendimiento
        const now = performance.now();
        this.frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Calcular FPS para depuración
        this.frameCount++;
        if (this.frameCount >= 10) {
            this.fps = Math.round(1000 / (this.frameTime || 1));
            this.frameCount = 0;
        }
        
        // Normalizar deltaTime para tener una experiencia consistente
        // en diferentes tasas de fotogramas
        const normalizedDelta = Math.min(deltaTime, 0.05); // Limitar a 50ms para evitar saltos grandes
        const physicsStep = normalizedDelta * 60; // Normalizado para 60 FPS
        
        // Manejar entrada del usuario
        this.handleInput(normalizedDelta);
         
        if (!this.gameOver && !this.victory) {
            // Actualizar física del vehículo
            this.updateVehiclePhysics(physicsStep);
            
            // Actualizar distancia recorrida
            this.distance = Math.max(this.distance, this.vehicle.x);
            
            // Comprobar si el vehículo ha volcado
            if (Math.abs(this.vehicle.rotation) > Math.PI * 0.7 && !this.vehicle.flipped) {
                this.vehicle.flipped = true;
                this.createParticles(this.vehicle.x, this.vehicle.y, 10, '#888888', 0.8);
                this.playSound('crash');
                // Sacudir la cámara
                this.camera.shakeAmount = 5;
            }
            
            // Si está volcado, dar un tiempo para corregir antes de game over
            if (this.vehicle.flipped) {
                // El jugador tiene 3 segundos para corregir
                this.flipTimer = (this.flipTimer || 3) - normalizedDelta;
                
                // Si logra enderezar el vehículo
                if (Math.abs(this.vehicle.rotation) < Math.PI * 0.5) {
                    this.vehicle.flipped = false;
                    this.flipTimer = undefined;
                }
                
                // Si se acaba el tiempo, game over
                if (this.flipTimer <= 0) {
                    this.gameOver = true;
                    this.playSound('gameover');
                }
            }
            
            // Comprobar colisión con coleccionables
            this.checkCollectibles(physicsStep);
            
            // Comprobar si ha alcanzado la meta
            if (this.vehicle.x >= this.finish.x && !this.victory) {
                this.victory = true;
                this.playSound('victory');
                
                // Calcular bonificación
                const fuelBonus = Math.floor(this.fuel) * 2;
                const distanceBonus = Math.floor(this.distance / 100) * 10;
                this.score += fuelBonus + distanceBonus + this.coins * 10;
                
                // Añadir puntos al juego principal
                if (this.game && typeof this.game.addPoints === 'function') {
                    this.game.addPoints(this.score, 'hillclimbing');
                }
                
                // Partículas de celebración
                this.createParticles(this.finish.x, this.finish.y, 30, this.colors.coin, 1.0);
                
                // Hacer que la bandera ondee más rápido
                this.finish.flag.waving = 5;
            }
            
            // Comprobar si se ha quedado sin combustible y está parado
            if (this.fuel <= 0 && Math.abs(this.vehicle.speed) < 0.1 && this.vehicle.grounded) {
                this.fuelEmptyTimer = (this.fuelEmptyTimer || 3) - normalizedDelta;
                
                if (this.fuelEmptyTimer <= 0) {
                    this.gameOver = true;
                    this.playSound('gameover');
                }
            } else {
                this.fuelEmptyTimer = undefined;
            }
            
            // Actualizar cámara para seguir al vehículo
            this.updateCamera(physicsStep);
            
            // Comprobar hitos de distancia para puntuación
            if (this.nextMilestoneIndex < this.distanceMilestones.length) {
                const nextMilestone = this.distanceMilestones[this.nextMilestoneIndex];
                if (this.distance >= nextMilestone) {
                    // Otorgar puntos por alcanzar un nuevo hito de distancia
                    this.score += nextMilestone / 10;
                    this.nextMilestoneIndex++;
                    
                    // Mostrar efecto visual
                    this.createParticles(this.vehicle.x, this.vehicle.y - 50, 15, this.colors.coin, 1.0);
                }
            }
        }
        
        // Actualizar efectos visuales
        this.updateVisualEffects(physicsStep);
        
        // Efecto de ondeo de la bandera en la meta
        if (this.finish.flag.waving > 0) {
            this.finish.flag.waving -= 0.01 * physicsStep;
        }
    }
    
    /**
     * Actualiza la física del vehículo sin suspensión (movimiento recto)
     */
    updateVehiclePhysics(physicsStep) {
        // Limitar physicsStep para evitar saltos de física
        const limitedStep = Math.min(physicsStep, 2.0);
        
        // Reiniciar estado de contacto con el suelo
        this.vehicle.wheelBack.grounded = false;
        this.vehicle.wheelFront.grounded = false;
        this.vehicle.grounded = false;
        
        // Actualizar posiciones de las ruedas según la rotación del vehículo
        const wheelBase = this.vehicle.width * 0.8; // Distancia entre ruedas
        
        // Calcular posiciones de las ruedas con la rotación
        const wheelBackX = this.vehicle.x - Math.cos(this.vehicle.rotation) * wheelBase / 2;
        const wheelBackY = this.vehicle.y + Math.sin(this.vehicle.rotation) * wheelBase / 2;
        
        const wheelFrontX = this.vehicle.x + Math.cos(this.vehicle.rotation) * wheelBase / 2;
        const wheelFrontY = this.vehicle.y - Math.sin(this.vehicle.rotation) * wheelBase / 2;
        
        // Guardar las posiciones en el objeto del vehículo
        this.vehicle.wheelBack.x = wheelBackX;
        this.vehicle.wheelBack.y = wheelBackY;
        this.vehicle.wheelFront.x = wheelFrontX;
        this.vehicle.wheelFront.y = wheelFrontY;
        
        // Obtener puntos del terreno bajo las ruedas
        const terrainBack = this.getTerrainPointAt(wheelBackX);
        const terrainFront = this.getTerrainPointAt(wheelFrontX);
        
        // Altura del terreno bajo el centro del vehículo
        const terrainCenter = this.getTerrainPointAt(this.vehicle.x);
        
        // Verificar si el vehículo está sobre el terreno (sin suspensión)
        if (terrainBack && terrainFront && terrainCenter) {
            // Calcular altura del vehículo con respecto al terreno
            // (simplemente posicionamos el vehículo justo encima del terreno)
            const terrainY = terrainCenter.y;
            
            // Si el vehículo está sobre o por debajo del terreno
            if (this.vehicle.y + this.vehicle.height/2 >= terrainY - this.vehicle.wheelBack.radius) {
                // Colocar el vehículo justo encima del terreno sin suspensión
                this.vehicle.y = terrainY - this.vehicle.height/2 - this.vehicle.wheelBack.radius;
                
                // Detener caída vertical
                this.vehicle.speedY = 0;
                
                // Marcar como en contacto con el suelo
                this.vehicle.grounded = true;
                this.vehicle.wheelBack.grounded = true;
                this.vehicle.wheelFront.grounded = true;
                
                // Alinear el vehículo con la pendiente del terreno
                // (para que siga el contorno del terreno pero de forma más rígida)
                if (terrainBack && terrainFront) {
                    // Calcular ángulo de la pendiente
                    const terrainAngle = Math.atan2(terrainFront.y - terrainBack.y, 
                                                  wheelFrontX - wheelBackX);
                    
                    // Aplicar la rotación directamente (sin amortiguación)
                    this.vehicle.rotation = terrainAngle;
                }
                
                // Aplicar fricción al estar en contacto con el suelo
                this.vehicle.speed *= this.friction;
            }
        }
        
        // Si el vehículo está en contacto con el suelo
        if (this.vehicle.grounded) {
            // Aplicar aceleración cuando el motor está activo y hay combustible
            if (this.vehicle.accelerating && this.fuel > 0) {
                // Aceleración directa y constante
                this.vehicle.speed += this.vehicle.power * 0.7 * limitedStep;
            }
            
            // Aplicar frenado inmediato
            if (this.vehicle.braking) {
                this.vehicle.speed *= (1 - this.vehicle.brake * 0.05 * limitedStep);
            }
        } else {
            // En el aire: menos control
            this.vehicle.speed *= this.airFriction;
            
            // En el aire, aplicar rotación constante basada en controles del usuario
            // No agregar rotación automática para mantener estabilidad
        }
        
        // Aplicar gravedad cuando no está en el suelo
        if (!this.vehicle.grounded) {
            this.vehicle.speedY += this.gravity * limitedStep;
        }
        
        // Limitar velocidades para prevenir comportamientos extraños
        const maxSpeed = 15; // Velocidad horizontal máxima más alta para compensar la falta de suspensión
        const maxSpeedY = 15; // Velocidad vertical máxima
        
        this.vehicle.speed = Math.max(-maxSpeed, Math.min(maxSpeed, this.vehicle.speed));
        this.vehicle.speedY = Math.max(-maxSpeedY, Math.min(maxSpeedY, this.vehicle.speedY));
        
        // Actualizar posición del vehículo (velocidad normal, sin multiplicador excesivo)
        this.vehicle.x += this.vehicle.speed * limitedStep * 20; // Factor 3 para un buen avance sin ser excesivo
        
        // La posición Y solo se actualiza si no está en el suelo
        if (!this.vehicle.grounded) {
            this.vehicle.y += this.vehicle.speedY * limitedStep;
        }
        
        // Actualizar rotación de ruedas
        if (this.vehicle.grounded) {
            // Rotación de ruedas directamente proporcional a la velocidad
            const wheelRotationFactor = 0.5;
            this.vehicle.wheelBack.rotation += this.vehicle.speed * wheelRotationFactor;
            this.vehicle.wheelFront.rotation += this.vehicle.speed * wheelRotationFactor;
        } else {
            // En el aire, rotación constante
            const airWheelRotationFactor = 0.1;
            this.vehicle.wheelBack.rotation += this.vehicle.speed * airWheelRotationFactor;
            this.vehicle.wheelFront.rotation += this.vehicle.speed * airWheelRotationFactor;
        }
    }
    
    /**
     * Comprueba colisiones con coleccionables (combustible y monedas)
     */
    checkCollectibles(physicsStep) {
        // Filtrar coleccionables visibles para optimizar
        this.visibleCollectibles = this.collectibles.filter(item => {
            return !item.collected && 
                   item.x > this.camera.x - 100 && 
                   item.x < this.camera.x + this.game.width + 100;
        });
        
        // Comprobar colisiones con el vehículo
        for (const collectible of this.visibleCollectibles) {
            if (collectible.collected) continue;
            
            // Calcular distancia
            const dx = this.vehicle.x - collectible.x;
            const dy = this.vehicle.y - collectible.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Radio de colisión dependiendo del tipo
            const collisionRadius = collectible.type === 'fuel' ? collectible.width : collectible.radius;
            
            // Comprobar colisión
            if (distance < this.vehicle.width / 2 + collisionRadius) {
                collectible.collected = true;
                
                // Efectos según tipo
                if (collectible.type === 'fuel') {
                    // Recargar combustible
                    this.fuel = Math.min(100, this.fuel + 30);
                    this.playSound('fuel');
                    this.createParticles(collectible.x, collectible.y, 15, this.colors.fuel, 1.0);
                } else if (collectible.type === 'coin') {
                    // Sumar monedas y puntos
                    this.coins++;
                    this.score += collectible.value;
                    this.playSound('coin');
                    this.createParticles(collectible.x, collectible.y, 10, this.colors.coin, 1.0);
                }
            }
        }
    }
    
    /**
     * Actualiza la cámara para seguir al vehículo
     */
    /**
     * Actualiza la cámara para seguir al vehículo sin perder el terreno
     */
    updateCamera(physicsStep) {
        // Seguimiento más directo con menos suavizado cuando el vehículo va rápido
        const speedFactor = Math.min(1, Math.abs(this.vehicle.speed) / 5); // Factor basado en velocidad
        
        // Cálculo del offset de avance visual (más espacio adelante a mayor velocidad)
        const lookAheadOffset = this.vehicle.speed * 50;
        
        // Posiciones objetivo de la cámara
        this.camera.targetX = this.vehicle.x - this.game.width / 3 + lookAheadOffset;
        this.camera.targetY = this.vehicle.y - this.game.height / 2;
        
        // Mantener la cámara por encima de cierta altura mínima
        const minCameraY = this.game.height * 0.1;
        this.camera.targetY = Math.min(this.camera.targetY, this.game.height - minCameraY);
        
        // Ajustar velocidad de seguimiento de la cámara basándose en la velocidad del vehículo
        // Más rápido cuando el vehículo va rápido para evitar que se salga de pantalla
        const cameraSpeed = this.camera.smoothing * (1 + speedFactor * 2);
        
        // Aplicar el movimiento de la cámara con aceleración proporcional a la distancia
        // Esto hace que la cámara "alcance" al vehículo rápidamente si está muy lejos
        const distanceX = this.camera.targetX - this.camera.x;
        const distanceY = this.camera.targetY - this.camera.y;
        
        // Factor de "urgencia" cuando el vehículo está lejos de la cámara
        const urgencyFactor = Math.min(3, 1 + Math.abs(distanceX) / this.game.width * 2);
        
        this.camera.x += distanceX * cameraSpeed * physicsStep * urgencyFactor;
        this.camera.y += distanceY * cameraSpeed * physicsStep;
        
        // Aplicar efecto de temblor si es necesario
        if (this.camera.shakeAmount > 0) {
            this.camera.x += (Math.random() - 0.5) * this.camera.shakeAmount;
            this.camera.y += (Math.random() - 0.5) * this.camera.shakeAmount;
            this.camera.shakeAmount *= this.camera.shakeDecay;
            
            if (this.camera.shakeAmount < 0.1) {
                this.camera.shakeAmount = 0;
            }
        }
    }
    
    /**
     * Actualiza efectos visuales como partículas
     */
    updateVisualEffects(physicsStep) {
        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Actualizar posición
            particle.x += particle.vx * physicsStep;
            particle.y += particle.vy * physicsStep;
            
            // Aplicar gravedad
            particle.vy += 0.02 * physicsStep;
            
            // Reducir velocidad gradualmente
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Reducir tamaño y opacidad
            particle.life -= 0.015 * physicsStep;
            
            // Eliminar partículas muertas
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Limitar número de partículas
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }
    
    /**
     * Método auxiliar para crear partículas
     */
    createParticles(x, y, count, color, lifeMultiplier = 1.0) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length < this.maxParticles) {
                this.particles.push({
                    x: x + (Math.random() - 0.5) * 10,
                    y: y + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    size: 2 + Math.random() * 6,
                    color: color,
                    life: (0.5 + Math.random() * 0.5) * lifeMultiplier
                });
            }
        }
    }
    
    /**
     * Renderiza el juego
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        // Limpiar canvas
        ctx.clearRect(0, 0, this.game.width, this.game.height);
        
        // Crear un cielo con degradado
        const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
        gradient.addColorStop(0, this.colors.skyGradient1);
        gradient.addColorStop(0.6, this.colors.skyGradient2);
        gradient.addColorStop(1, this.colors.sky);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Guardar estado actual
        ctx.save();
        
        // Aplicar transformación de cámara
        ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));
        
        // Renderizar solo las partes visibles para optimizar
        const visibleLeft = this.camera.x - 100000;
        const visibleRight = this.camera.x + this.game.width + 100000;
        const visibleTop = this.camera.y - 10000;
        const visibleBottom = this.camera.y + this.game.height + 20000; // Margen extra abajo
        
        // Calcular qué segmentos de terreno son visibles con un margen mucho mayor
        // para evitar que desaparezca con movimientos rápidos
        const segmentWidth = 20; // Ancho aproximado de cada segmento
        const extraMargin = 30; // Más segmentos de margen para prevenir desapariciones
        
        const startIndex = Math.max(0, Math.floor(visibleLeft / segmentWidth) - extraMargin);
        const endIndex = Math.min(this.terrain.length - 1, Math.ceil(visibleRight / segmentWidth) + extraMargin);
        
        // Dibujar meta
        this.renderFinishLine(ctx, visibleLeft, visibleRight);
        
        // Dibujar terreno si hay segmentos visibles
        if (startIndex < endIndex) {
            // Comenzar un nuevo path para el terreno
            ctx.beginPath();
            ctx.moveTo(this.terrain[startIndex].x, this.terrain[startIndex].y);
            
            // Dibujar la línea superior del terreno with una curva suave
            for (let i = startIndex + 1; i <= endIndex; i++) {
                ctx.lineTo(this.terrain[i].x, this.terrain[i].y);
            }
            
            // Completar el path hacia abajo y de vuelta para rellenar
            ctx.lineTo(this.terrain[endIndex].x, visibleBottom);
            ctx.lineTo(this.terrain[startIndex].x, visibleBottom);
            ctx.closePath();
            
            // Rellenar el terreno con un degradado
            const terrainGradient = ctx.createLinearGradient(
                0, this.terrain[startIndex].y - 50, 
                0, visibleBottom
            );
            terrainGradient.addColorStop(0, this.colors.groundTop);
            terrainGradient.addColorStop(1, this.colors.groundFill);
            ctx.fillStyle = terrainGradient;
            ctx.fill();
            
            // Dibujar el contorno superior del terreno
            ctx.beginPath();
            ctx.moveTo(this.terrain[startIndex].x, this.terrain[startIndex].y);
            
            for (let i = startIndex + 1; i <= endIndex; i++) {
                ctx.lineTo(this.terrain[i].x, this.terrain[i].y);
            }
            
            ctx.strokeStyle = this.colors.groundLine;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Renderizar coleccionables (combustible y monedas)
        this.renderCollectibles(ctx, visibleLeft, visibleRight);
        
        // Renderizar el vehículo y sus ruedas
        this.renderVehicle(ctx);
        
        // Renderizar partículas
        this.renderParticles(ctx);
        
        // Restaurar contexto
        ctx.restore();
        
        // Renderizar UI
        this.renderUI(ctx);
    }
    
    /**
     * Renderiza la meta
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} visibleLeft - Límite izquierdo visible
     * @param {number} visibleRight - Límite derecho visible
     */
    renderFinishLine(ctx, visibleLeft, visibleRight) {
        // Solo renderizar si la meta está en el área visible
        if (this.finish.x >= visibleLeft && this.finish.x <= visibleRight) {
            // Dibujar poste de la bandera
            ctx.fillStyle = '#888888';
            ctx.fillRect(this.finish.x - 5, this.finish.y, 10, this.finish.height);
            
            // Dibujar bandera
            const flagWidth = 50;
            const flagHeight = 30;
            
            // Efecto de ondeo de la bandera
            const waveAmount = 5 * this.finish.flag.waving;
            const time = performance.now() / 1000;
            
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(this.finish.x, this.finish.y);
            
            // Crear efecto de ondeo con curva sinusoidal
            for (let i = 0; i <= flagWidth; i += 5) {
                const waveY = Math.sin((i / flagWidth) * Math.PI * 2 + time * 5) * waveAmount;
                ctx.lineTo(this.finish.x + i, this.finish.y + waveY);
            }
            
            // Completar la forma de la bandera
            for (let i = flagWidth; i >= 0; i -= 5) {
                const waveY = Math.sin((i / flagWidth) * Math.PI * 2 + time * 5) * waveAmount;
                ctx.lineTo(this.finish.x + i, this.finish.y + flagHeight + waveY);
            }
            
            ctx.closePath();
            ctx.fill();
            
            // Línea de meta a cuadros en el suelo
            const squareSize = 10;
            const checkeredWidth = 100;
            const terrainY = this.getTerrainPointAt(this.finish.x)?.y || this.finish.y + this.finish.height;
            
            for (let i = 0; i < checkeredWidth; i += squareSize) {
                ctx.fillStyle = i % (squareSize * 2) === 0 ? '#FFFFFF' : '#000000';
                ctx.fillRect(this.finish.x - checkeredWidth/2 + i, terrainY - squareSize, squareSize, squareSize);
            }
        }
    }
    
    /**
     * Renderiza los coleccionables (combustible y monedas)
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} visibleLeft - Límite izquierdo visible
     * @param {number} visibleRight - Límite derecho visible
     */
    renderCollectibles(ctx, visibleLeft, visibleRight) {
        // Filtrar solo coleccionables visibles
        this.visibleCollectibles = this.collectibles.filter(item => {
            return !item.collected && 
                   item.x >= visibleLeft && 
                   item.x <= visibleRight;
        });
        
        // Tiempo para efectos de animación
        const time = performance.now() / 1000;
        
        // Renderizar cada coleccionable
        for (const collectible of this.visibleCollectibles) {
            if (collectible.collected) continue;
            
            if (collectible.type === 'fuel') {
                // Dibujar bidón de combustible
                ctx.fillStyle = this.colors.fuel;
                
                // Cuerpo del bidón
                ctx.fillRect(
                    collectible.x - collectible.width / 2,
                    collectible.y - collectible.height / 2,
                    collectible.width,
                    collectible.height
                );
                
                // Detalles del bidón
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(
                    collectible.x - collectible.width / 4,
                    collectible.y - collectible.height / 2 - 5,
                    collectible.width / 2,
                    5
                );
                
                // Contorno
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    collectible.x - collectible.width / 2,
                    collectible.y - collectible.height / 2,
                    collectible.width,
                    collectible.height
                );
                
                // Efecto pulsante de brillo
                const pulseSize = 3 + Math.sin(time * 3) * 2;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(
                    collectible.x - collectible.width / 4,
                    collectible.y - collectible.height / 4,
                    pulseSize,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
            } else if (collectible.type === 'coin') {
                // Actualizar rotación de la moneda
                collectible.rotation += collectible.rotationSpeed;
                
                // Dibujar moneda con efecto 3D según rotación
                const scaleX = Math.abs(Math.cos(collectible.rotation));
                const glow = Math.abs(Math.sin(collectible.rotation * 2)) * 0.5;
                
                // Sombra
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.ellipse(
                    collectible.x + 3,
                    collectible.y + 3,
                    collectible.radius,
                    collectible.radius * scaleX,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Moneda
                ctx.fillStyle = this.colors.coin;
                ctx.beginPath();
                ctx.ellipse(
                    collectible.x,
                    collectible.y,
                    collectible.radius,
                    collectible.radius * scaleX,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Brillo
                ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + glow})`;
                ctx.beginPath();
                ctx.ellipse(
                    collectible.x - collectible.radius / 3,
                    collectible.y - collectible.radius / 3,
                    collectible.radius / 3,
                    (collectible.radius / 3) * scaleX,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    
    /**
     * Renderiza el vehículo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderVehicle(ctx) {
        ctx.save();
        
        // Trasladar al centro del vehículo y rotar
        ctx.translate(this.vehicle.x, this.vehicle.y);
        ctx.rotate(this.vehicle.rotation);
        
        const w = this.vehicle.width;
        const h = this.vehicle.height;
        const wheelRadius = 15;
        const wheelBase = w * 0.8;
        
        // 1. Dibujar chasis primero
        ctx.fillStyle = this.colors.car;
        ctx.beginPath();
        ctx.moveTo(-w/2, h/4);      // Base izquierda
        ctx.lineTo(-w/2, -h/2);     // Lateral izquierdo
        ctx.lineTo(-w/4, -h*0.7);   // Capó izquierdo
        ctx.lineTo(w/4, -h*0.7);    // Techo
        ctx.lineTo(w/2, -h/2);      // Capó derecho
        ctx.lineTo(w/2, h/4);       // Base derecha
        ctx.closePath();
        ctx.fill();
        
        // Contorno del chasis
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Ventana
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.moveTo(-w/4, -h*0.5);
        ctx.lineTo(-w/8, -h*0.65);
        ctx.lineTo(w/8, -h*0.65);
        ctx.lineTo(w/4, -h*0.5);
        ctx.closePath();
        ctx.fill();
        
        // 2. Dibujar las ruedas encima del chasis
        const wheels = [
            { x: -wheelBase/2, y: h/4 }, // Rueda trasera
            { x: wheelBase/2, y: h/4 }   // Rueda delantera
        ];
        
        wheels.forEach((wheel, index) => {
            // Neumático exterior
            ctx.fillStyle = this.colors.wheel;
            ctx.beginPath();
            ctx.arc(wheel.x, wheel.y, wheelRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Llanta
            ctx.fillStyle = this.colors.wheelInner;
            ctx.beginPath();
            ctx.arc(wheel.x, wheel.y, wheelRadius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            // Radios de la rueda
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            const rotation = index === 0 ? this.vehicle.wheelBack.rotation : this.vehicle.wheelFront.rotation;
            
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI / 2) * i + rotation;
                ctx.beginPath();
                ctx.moveTo(wheel.x, wheel.y);
                ctx.lineTo(
                    wheel.x + Math.cos(angle) * wheelRadius * 0.6,
                    wheel.y + Math.sin(angle) * wheelRadius * 0.6
                );
                ctx.stroke();
            }
            
            // Borde de la rueda
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(wheel.x, wheel.y, wheelRadius, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // Efectos de aceleración
        if (this.vehicle.accelerating && this.vehicle.grounded && this.fuel > 0) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(-w/2 - 10, 0, 5 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Renderiza una rueda del vehículo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} wheel - Objeto de la rueda a renderizar
     */
    renderWheel(ctx, wheel) {
        ctx.save();
        
        // Trasladar al centro de la rueda
        ctx.translate(wheel.x, wheel.y);
        ctx.rotate(wheel.rotation);
        
        // Dibujar neumático
        ctx.fillStyle = this.colors.wheel;
        ctx.beginPath();
        ctx.arc(0, 0, wheel.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Dibujar llanta
        ctx.fillStyle = this.colors.wheelInner;
        ctx.beginPath();
        ctx.arc(0, 0, wheel.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Dibujar radios
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * wheel.radius * 0.6, Math.sin(angle) * wheel.radius * 0.6);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * Renderiza las partículas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderParticles(ctx) {
        for (const particle of this.particles) {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            
            // Dibujar partícula
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Restaurar opacidad
        ctx.globalAlpha = 1;
    }
    
    /**
     * Renderiza la interfaz de usuario
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderUI(ctx) {
        // Fondo semitransparente para la interfaz
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 300, 110);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 300, 110);
        
        // Información del juego
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.fillText(`Puntuación: ${Math.floor(this.score)}`, 20, 35);
        ctx.fillText(`Distancia: ${Math.floor(this.distance)}m`, 20, 60);
        
        // Monedas recolectadas
        ctx.fillStyle = this.colors.coin;
        ctx.beginPath();
        ctx.arc(215, 35, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`x ${this.coins}`, 230, 40);
        
        // Barra de combustible
        const fuelBarWidth = 150;
        const fuelAmount = this.fuel / 100 * fuelBarWidth;
        
        // Icono de combustible
        ctx.fillStyle = this.colors.fuel;
        ctx.fillRect(20, 70, 15, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`${Math.floor(this.fuel)}%`, 40, 85);
        
        // Fondo de la barra
        ctx.fillStyle = '#555555';
        ctx.fillRect(110, 73, fuelBarWidth, 15);
        
        // Color según la cantidad de combustible
        if (this.fuel > 60) {
            ctx.fillStyle = this.colors.fuel; // Verde
        } else if (this.fuel > 30) {
            ctx.fillStyle = '#FFFF00'; // Amarillo
        } else {
            ctx.fillStyle = '#FF0000'; // Rojo
        }
        
        // Barra de combustible
        ctx.fillRect(110, 73, fuelAmount, 15);
        
        // Contorno
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(110, 73, fuelBarWidth, 15);
        
        // Advertencia de vuelco
        if (this.vehicle.flipped) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '16px Arial Bold';
            ctx.fillText(`¡VOLCADO! ${Math.ceil(this.flipTimer || 0)}s`, 20, 110);
        }
        
        // Indicador de combustible vacío
        if (this.fuel <= 0) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '16px Arial Bold';
            if (this.fuelEmptyTimer) {
                ctx.fillText(`¡SIN COMBUSTIBLE! ${Math.ceil(this.fuelEmptyTimer)}s`, 110, 60);
            } else {
                ctx.fillText('¡SIN COMBUSTIBLE!', 110, 60);
            }
        }
        
        // Indicador de controles en pantalla
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.game.width - 210, 10, 200, 100);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.strokeRect(this.game.width - 210, 10, 200, 100);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.fillText('Controles:', this.game.width - 200, 30);
        ctx.fillText('↑ / W - Acelerar', this.game.width - 200, 50);
        ctx.fillText('↓ / S - Frenar', this.game.width - 200, 70);
        ctx.fillText('← / → - Equilibrar', this.game.width - 200, 90);
        
        // Contador FPS (solo en modo debug)
        if (this.debugMode) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(10, this.game.height - 120, 200, 110);
            
            ctx.fillStyle = '#FFFF00';
            ctx.font = '14px Arial';
            ctx.fillText(`FPS: ${this.fps}`, 20, this.game.height - 100);
            ctx.fillText(`Frame Time: ${this.frameTime.toFixed(2)}ms`, 20, this.game.height - 80);
            ctx.fillText(`Partículas: ${this.particles.length}`, 20, this.game.height - 60);
            ctx.fillText(`Vehículo X: ${Math.floor(this.vehicle.x)}`, 20, this.game.height - 40);
            ctx.fillText(`Vehículo Y: ${Math.floor(this.vehicle.y)}`, 20, this.game.height - 20);
        }
        
        // Mensajes de estado del juego
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, this.game.height / 2 - 70, this.game.width, 140);
            
            ctx.fillStyle = '#FF5555';
            ctx.font = '36px Arial Bold';
            ctx.textAlign = 'center';
            ctx.fillText('¡GAME OVER!', this.game.width / 2, this.game.height / 2 - 30);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '18px Arial';
            ctx.fillText(`Puntuación final: ${Math.floor(this.score)} | Distancia: ${Math.floor(this.distance)}m | Monedas: ${this.coins}`, 
                       this.game.width / 2, this.game.height / 2 + 10);
            ctx.fillText('Presiona ESPACIO para reintentar', this.game.width / 2, this.game.height / 2 + 40);
            ctx.fillText('ESC para volver al mapa', this.game.width / 2, this.game.height / 2 + 70);
            ctx.textAlign = 'left';
        }
        
        if (this.victory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, this.game.height / 2 - 70, this.game.width, 140);
            
            ctx.fillStyle = '#55FF55';
            ctx.font = '36px Arial Bold';
            ctx.textAlign = 'center';
            ctx.fillText('¡VICTORIA!', this.game.width / 2, this.game.height / 2 - 30);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '18px Arial';
            ctx.fillText(`Puntuación final: ${Math.floor(this.score)} | Distancia: ${Math.floor(this.distance)}m | Monedas: ${this.coins}`, 
                       this.game.width / 2, this.game.height / 2 + 10);
            ctx.fillText('Presiona ESPACIO para jugar de nuevo', this.game.width / 2, this.game.height / 2 + 40);
            ctx.fillText('ESC para volver al mapa', this.game.width / 2, this.game.height / 2 + 70);
            ctx.textAlign = 'left';
        }
        
        // Draw exit button in top-left corner
        const exitButtonSize = 40;
        const exitButtonPadding = 10;
        const exitButtonX = exitButtonPadding; // Cambiado a la izquierda
        const exitButtonY = exitButtonPadding;

        // Button background
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(
            exitButtonX + exitButtonSize/2,
            exitButtonY + exitButtonSize/2,
            exitButtonSize/2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // X symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(exitButtonX + exitButtonSize*0.3, exitButtonY + exitButtonSize*0.3);
        ctx.lineTo(exitButtonX + exitButtonSize*0.7, exitButtonY + exitButtonSize*0.7);
        ctx.moveTo(exitButtonX + exitButtonSize*0.7, exitButtonY + exitButtonSize*0.3);
        ctx.lineTo(exitButtonX + exitButtonSize*0.3, exitButtonY + exitButtonSize*0.7);
        ctx.stroke();

        // Check for exit button click
        if (this.game.mouseDown) {
            const dx = this.game.mouseX - (exitButtonX + exitButtonSize/2);
            const dy = this.game.mouseY - (exitButtonY + exitButtonSize/2);
            if (dx*dx + dy*dy < (exitButtonSize/2)*(exitButtonSize/2)) {
                this.game.switchScene('worldMap');
            }
        }
    }

    /**
     * Método que se ejecuta cuando se entra en la escena
     */
    enter() {
        console.log("Iniciando minijuego de carreras");
        this.reset();
        this.playSound('engine');
    }
    
    /**
     * Método que se ejecuta cuando se sale de la escena
     */
    exit() {
        console.log("Saliendo del minijuego de carreras");
        // Detener sonidos de forma segura
        try {
            if (this.sounds) {
                for (const sound of Object.values(this.sounds)) {
                    if (sound && typeof sound.pause === 'function') {
                        sound.pause();
                        if (typeof sound.currentTime !== 'undefined') {
                            sound.currentTime = 0;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Error al detener los sonidos:', e);
        }
    }
}