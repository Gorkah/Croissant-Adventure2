/**
 * Surfista Glaseado Minigame
 * Un juego donde el jugador surfea sobre olas de caramelo esquivando obstáculos
 */
class SurfingMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.name = "Surfista Glaseado";
        this.background = "#66ddee";
        this.reset();
    }
    
    reset() {
        // Configuración del juego
        this.distance = 0; // distancia recorrida
        this.distanceGoal = 5000; // distancia objetivo aumentada para que dure más
        this.gameActive = true;
        this.gameOver = false;
        this.score = 0;
        
        // Mensajes de ayuda
        this.showMessage = true;
        this.messageTimer = 5;
        this.message = "Usa las teclas ↑/↓ para subir y bajar en la ola, ESPACIO para saltar obstáculos";
        
        // Propiedades del jugador
        this.player = {
            x: this.game.width / 3,
            y: this.game.height / 2,
            width: 50,
            height: 50,
            speed: 200, // Velocidad reducida para mayor control
            jumping: false,
            yVelocity: 0,
            gravity: 500, // Gravedad reducida para que no caiga tan rápido
            jumpForce: -300, // Fuerza de salto reducida para que no vuele tanto
            maxHeight: 150 // Límite máximo de altura para evitar volar demasiado alto
        };
        
        // Propiedades de la ola
        this.wave = {
            height: this.game.height / 2 + 50,
            amplitude: 15, // Amplitud reducida para olas más suaves
            frequency: 0.015, // Frecuencia reducida para olas más largas
            speed: 80 // Velocidad reducida para que el juego no sea tan rápido
        };
        
        // Obstáculos
        this.obstacles = [];
        this.obstacleTypes = [
            { name: 'Roca', width: 40, height: 40, color: '#555555', shape: 'circle', scoreValue: 0, description: 'Esquívalo' },
            { name: 'Coral', width: 50, height: 30, color: '#ff66aa', shape: 'triangle', scoreValue: 0, description: 'Salta sobre él' },
            { name: 'Madera', width: 60, height: 20, color: '#aa6633', shape: 'rect', scoreValue: 0, description: 'Rodéalo' }
        ];
        
        // Coleccionables
        this.collectibles = [];
        this.collectibleTypes = [
            { name: 'Caramelo', width: 20, height: 20, color: '#ffcc00', scoreValue: 10 },
            { name: 'Estrella', width: 25, height: 25, color: '#ffff00', scoreValue: 20 }
        ];
        
        // Efectos
        this.particles = [];
        
        // Generar objetos iniciales
        this.spawnObstacles();
        this.spawnCollectibles();
    }
    
    enter() {
        this.reset();
    }
    
    exit() {
        // No se necesita nada específico
    }
    
    spawnObstacles() {
        // Limpiar obstáculos existentes
        this.obstacles = [];
        
        // Crear nuevos obstáculos distribuidos en la distancia
        const numberOfObstacles = 25;
        const spacing = 600 + Math.random() * 400; // Espaciado mucho mayor entre obstáculos
        
        for (let i = 0; i < numberOfObstacles; i++) {
            const obstacleType = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
            
            this.obstacles.push({
                x: this.game.width + (i * spacing),
                y: 0, // Se ajustará a la altura de la ola en update()
                width: obstacleType.width,
                height: obstacleType.height,
                type: obstacleType,
                active: true
            });
        }
    }
    
    spawnCollectibles() {
        // Limpiar coleccionables existentes
        this.collectibles = [];
        
        // Crear nuevos coleccionables distribuidos en la distancia
        const numberOfCollectibles = 40;
        const spacing = this.distanceGoal / numberOfCollectibles;
        
        for (let i = 0; i < numberOfCollectibles; i++) {
            const collectibleType = this.collectibleTypes[Math.floor(Math.random() * this.collectibleTypes.length)];
            // Posición vertical aleatoria por encima de la ola
            const yOffset = -50 - Math.random() * 100;
            
            this.collectibles.push({
                x: this.game.width + (i * spacing) + Math.random() * 100,
                y: yOffset, // Se ajustará a la altura de la ola en update()
                width: collectibleType.width,
                height: collectibleType.height,
                type: collectibleType,
                active: true,
                floatOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    getWaveHeightAt(x) {
        // Simular una ola con una función sinusoidal
        const now = Date.now() / 1000;
        return this.wave.height + 
               Math.sin((x + this.distance) * this.wave.frequency + now) * this.wave.amplitude;
    }
    
    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
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
        
        // Actualizar temporizador de mensajes
        if (this.showMessage) {
            this.messageTimer -= deltaTime;
            if (this.messageTimer <= 0) {
                this.showMessage = false;
            }
        }
        
        // Incrementar distancia recorrida
        const scrollSpeed = this.wave.speed;
        this.distance += scrollSpeed * deltaTime;
        
        // Verificar si llegamos a la meta
        if (this.distance >= this.distanceGoal) {
            this.gameOver = true;
            return;
        }
        
        // Movimiento vertical del jugador
        let dy = 0;
        if (this.game.isKeyPressed('ArrowUp') || this.game.isKeyPressed('w')) {
            dy = -this.player.speed * deltaTime;
        }
        if (this.game.isKeyPressed('ArrowDown') || this.game.isKeyPressed('s')) {
            dy = this.player.speed * deltaTime;
        }
        
        // Salto
        if ((this.game.isKeyPressed('space') || 
            this.game.isKeyPressed('ArrowUp') || 
            this.game.isKeyPressed('w')) && 
            !this.player.jumping && 
            this.player.y >= this.getWaveHeightAt(this.player.x) - 20) {
            // Iniciar salto
            this.player.jumping = true;
            this.player.yVelocity = this.player.jumpForce;
            
            // Crear efecto de partículas al saltar
            for (let i = 0; i < 10; i++) {
                this.particles.push({
                    x: this.player.x,
                    y: this.player.y + this.player.height/2,
                    vx: (Math.random() - 0.5) * 100,
                    vy: (Math.random() - 0.5) * 100,
                    size: 5 + Math.random() * 5,
                    color: '#ffffff',
                    life: 0.5 + Math.random() * 0.5
                });
            }
        }
        
        // Lógica de salto y caída
        // Siempre aplicar gravedad al jugador (esté o no saltando)
        const waveHeight = this.getWaveHeightAt(this.player.x);
        const waveHeightTarget = waveHeight - this.player.height/2;
        
        if (this.player.jumping) {
            // Cuando está saltando, aplicar gravedad típica
            this.player.yVelocity += this.player.gravity * deltaTime;
            this.player.y += this.player.yVelocity * deltaTime;
            
            // Limitar la altura máxima del salto
            const minY = waveHeight - this.player.maxHeight;
            if (this.player.y < minY) {
                this.player.y = minY;
                this.player.yVelocity = 0;
            }
            
            // Comprobar si ha aterrizado en la ola
            if (this.player.y >= waveHeightTarget) {
                this.player.y = waveHeightTarget;
                this.player.jumping = false;
                this.player.yVelocity = 0;
                
                // Crear efecto de salpicadura al aterrizar
                for (let i = 0; i < 10; i++) {
                    this.particles.push({
                        x: this.player.x,
                        y: waveHeight,
                        vx: (Math.random() - 0.5) * 150,
                        vy: -Math.random() * 200,
                        size: 3 + Math.random() * 3,
                        color: '#88ddff',
                        life: 0.5 + Math.random() * 0.5
                    });
                }
            }
        } else {
            // Si no está saltando, aplicar una física más suave pero realista para seguir las olas
            // Calcular la diferencia entre la posición actual y la posición ideal sobre la ola
            const diff = waveHeightTarget - this.player.y;
            
            // Aplicar una fuerza proporcional a la distancia al objetivo (como un resorte)
            this.player.yVelocity += diff * 5 * deltaTime; // Fuerza de atracción a la ola
            
            // Aplicar resistencia/amortiguación para evitar que rebote perpetuamente
            this.player.yVelocity *= 0.9;
            
            // Aplicar control manual (movimiento arriba/abajo controlado por el jugador)
            this.player.yVelocity += dy * 3;
            
            // Actualizar posición
            this.player.y += this.player.yVelocity * deltaTime;
            
            // Limitar movimiento vertical
            const minY = waveHeight - this.player.height*2;
            const maxY = waveHeight;
            this.player.y = Math.max(minY, Math.min(this.player.y, maxY));
        }
        
        // Actualizar posición de los obstáculos
        for (const obstacle of this.obstacles) {
            if (!obstacle.active) continue;
            
            // Mover el obstáculo hacia el jugador
            obstacle.x -= scrollSpeed * deltaTime;
            
            // Ajustar altura a la ola
            obstacle.y = this.getWaveHeightAt(obstacle.x) - obstacle.height/2;
            
            // Verificar colisión con el jugador
            if (this.checkCollision(this.player, obstacle)) {
                obstacle.active = false;
                this.wave.speed *= 0.9; // Reducir velocidad al chocar
                
                // Crear efecto de partículas en la colisión
                for (let i = 0; i < 20; i++) {
                    this.particles.push({
                        x: obstacle.x,
                        y: obstacle.y,
                        vx: (Math.random() - 0.5) * 200,
                        vy: -Math.random() * 200,
                        size: 4 + Math.random() * 4,
                        color: obstacle.type.color,
                        life: 0.5 + Math.random() * 0.5
                    });
                }
            }
            
            // Eliminar si está fuera de pantalla
            if (obstacle.x < -obstacle.width) {
                obstacle.active = false;
            }
        }
        
        // Actualizar posición de los coleccionables
        for (const collectible of this.collectibles) {
            if (!collectible.active) continue;
            
            // Mover el coleccionable hacia el jugador
            collectible.x -= scrollSpeed * deltaTime;
            
            // Flotación suave
            const bobHeight = Math.sin(Date.now() / 500 + collectible.floatOffset) * 10;
            collectible.y = this.getWaveHeightAt(collectible.x) + bobHeight - 50;
            
            // Verificar colisión con el jugador
            if (this.checkCollision(this.player, collectible)) {
                collectible.active = false;
                this.score += collectible.type.scoreValue;
                
                // Crear efecto de partículas al recoger
                for (let i = 0; i < 15; i++) {
                    this.particles.push({
                        x: collectible.x,
                        y: collectible.y,
                        vx: (Math.random() - 0.5) * 100,
                        vy: (Math.random() - 0.5) * 100,
                        size: 3 + Math.random() * 3,
                        color: collectible.type.color,
                        life: 0.5 + Math.random() * 0.5
                    });
                }
            }
            
            // Eliminar si está fuera de pantalla
            if (collectible.x < -collectible.width) {
                collectible.active = false;
            }
        }
        
        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    hexToRgb(hex) {
        // Convierte un color hex a valores RGB
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? 
            parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) :
            '255,255,255';
    }
    
    render(ctx) {
        // Fondo - cielo
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.wave.height - this.wave.amplitude);
        skyGradient.addColorStop(0, '#66ccff');
        skyGradient.addColorStop(1, '#99ddff');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.game.width, this.wave.height - this.wave.amplitude);
        
        // Dibujar nubes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const cloudPositions = [
            { x: (100 - (this.distance * 0.1) % 1200), y: 80, size: 40 },
            { x: (400 - (this.distance * 0.08) % 1200), y: 120, size: 50 },
            { x: (700 - (this.distance * 0.12) % 1200), y: 60, size: 30 }
        ];
        
        for (const cloud of cloudPositions) {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.8, cloud.y - cloud.size * 0.3, cloud.size * 0.7, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 1.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dibujar agua
        const waterGradient = ctx.createLinearGradient(0, this.wave.height - this.wave.amplitude, 0, this.game.height);
        waterGradient.addColorStop(0, '#00aaff');
        waterGradient.addColorStop(1, '#0066aa');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, this.wave.height - this.wave.amplitude, this.game.width, this.game.height);
        
        // Dibujar ola
        ctx.fillStyle = '#66eeff';
        ctx.beginPath();
        ctx.moveTo(0, this.game.height);
        ctx.lineTo(0, this.getWaveHeightAt(0));
        
        for (let x = 0; x <= this.game.width; x += 10) {
            const y = this.getWaveHeightAt(x);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(this.game.width, this.game.height);
        ctx.closePath();
        ctx.fill();
        
        // Espuma de la ola
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        
        for (let x = 0; x <= this.game.width; x += 10) {
            const y = this.getWaveHeightAt(x);
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        
        // Dibujar obstáculos
        for (const obstacle of this.obstacles) {
            if (!obstacle.active) continue;
            
            ctx.fillStyle = obstacle.type.color;
            
            if (obstacle.type.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(obstacle.x, obstacle.y, obstacle.width/2, 0, Math.PI * 2);
                ctx.fill();
            } else if (obstacle.type.shape === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(obstacle.x, obstacle.y - obstacle.height/2);
                ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
                ctx.lineTo(obstacle.x - obstacle.width/2, obstacle.y + obstacle.height/2);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(obstacle.x - obstacle.width/2, obstacle.y - obstacle.height/2, 
                    obstacle.width, obstacle.height);
            }
        }
        
        // Dibujar coleccionables
        for (const collectible of this.collectibles) {
            if (!collectible.active) continue;
            
            ctx.fillStyle = collectible.type.color;
            
            if (collectible.type.name === 'Estrella') {
                // Dibujar estrella
                const spikes = 5;
                const outerRadius = collectible.width / 2;
                const innerRadius = collectible.width / 4;
                
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI / spikes) * i;
                    const x = collectible.x + Math.cos(angle) * radius;
                    const y = collectible.y + Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
            } else {
                // Dibujar caramelo circular
                ctx.beginPath();
                ctx.arc(collectible.x, collectible.y, collectible.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillo
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(collectible.x - collectible.width/5, collectible.y - collectible.width/5, 
                    collectible.width/6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Dibujar partículas
        for (const particle of this.particles) {
            const alpha = particle.life; // Desvanecer con el tiempo
            ctx.fillStyle = `rgba(${this.hexToRgb(particle.color)}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dibujar jugador (surfista)
        ctx.fillStyle = '#ff9900'; // Tabla de surf
        ctx.fillRect(this.player.x - this.player.width/2, this.player.y, 
                    this.player.width, this.player.height/4);
        
        // Cuerpo del surfista 
        ctx.fillStyle = window.playerCharacter && window.playerCharacter.character === 'croisa' ? 
            '#ff99cc' : '#ffcc66';
        ctx.fillRect(this.player.x - this.player.width/4, this.player.y - this.player.height/2, 
                    this.player.width/2, this.player.height/2);
        
        // Draw UI
        super.render(ctx);
        
        // Draw progress
        const progressWidth = this.game.width - 100;
        const progressHeight = 20;
        const progressX = 50;
        const progressY = 30;
        
        // Background
        ctx.fillStyle = '#555555';
        ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
        
        // Progress bar
        const progress = this.distance / this.distanceGoal;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Progreso: ${Math.floor(progress * 100)}%`, progressX + progressWidth/2, progressY + 15);
        
        // Score
        ctx.textAlign = 'left';
        ctx.fillText(`Puntos: ${this.score}`, 20, 70);
        
        // Mostrar mensajes de instrucciones
        if (this.showMessage) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.width/2 - 300, this.game.height - 80, 600, 50);
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.message, this.game.width/2, this.game.height - 55);
            
            // Leyenda de obstáculos (solo al inicio)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(20, 100, 200, 150);
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText("Obstáculos:", 30, 125);
            
            // Dibujar ejemplos de obstáculos
            for (let i = 0; i < this.obstacleTypes.length; i++) {
                const obstacle = this.obstacleTypes[i];
                const y = 155 + (i * 30);
                
                // Dibujar el obstáculo
                ctx.fillStyle = obstacle.color;
                if (obstacle.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(45, y, 10, 0, Math.PI * 2);
                    ctx.fill();
                } else if (obstacle.shape === 'triangle') {
                    ctx.beginPath();
                    ctx.moveTo(45, y - 10);
                    ctx.lineTo(55, y + 10);
                    ctx.lineTo(35, y + 10);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillRect(35, y - 5, 20, 10);
                }
                
                // Texto descriptivo
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.fillText(`${obstacle.name}: ${obstacle.description}`, 70, y);
            }
        }
        
        // Game Over screen
        if (this.gameOver) {
            let message;
            if (this.distance >= this.distanceGoal) {
                message = '¡Nivel Completado!';
            } else {
                message = '¡Juego Terminado!';
            }
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.width/2 - 200, this.game.height/2 - 100, 400, 200);
            
            ctx.fillStyle = '#fff';
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(message, this.game.width/2, this.game.height/2 - 50);
            ctx.fillText(`Puntuación: ${this.score}`, this.game.width/2, this.game.height/2);
            ctx.font = '20px Arial';
            ctx.fillText('Presiona R para reiniciar', this.game.width/2, this.game.height/2 + 50);
        }
    }
}
