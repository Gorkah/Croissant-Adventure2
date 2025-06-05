/**
 * Pescador Pastelero Minigame
 * Un juego donde el jugador debe pescar dulces del mar de caramelo
 */
class FishingMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.name = "Pescador Pastelero - Fishing Minigame"
        this.background = "#87CEEB"; // cielo azul
        this.reset();
    }
    
    reset() {
        // Configuración del juego
        this.timeLimit = 60; // 60 segundos
        this.score = 0;
        this.timer = this.timeLimit;
        this.gameActive = true;
        this.gameOver = false;
        
        // Mensajes de ayuda
        this.showMessage = true;
        this.messageTimer = 5;
        this.message = "Usa A/D o ←/→ para moverte y ESPACIO/CLIC para lanzar la caña";
        
        // Propiedades del jugador
        this.player = {
            x: this.game.width / 2,
            y: 50,
            width: 40,
            height: 60,
            speed: 300,
            casting: false,
            line: {
                length: 0,
                maxLength: 650,     
                speed: 200,         
                hooked: false,
                hookX: 0,
                hookY: 0,
                retracting: false,
                retractSpeed: 300   
            }
        };
        
        // Crear dulces (peces)
        this.candies = [];
        this.candySpeed = 80; // pixels per second
        this.candySpawnRate = 2; // segundos entre apariciones
        this.candyTimer = 0;
        
        // Iniciar con algunos dulces
        for (let i = 0; i < 5; i++) {
            this.spawnCandy();
        }
    }
    
    enter() {
        this.reset();
    }
    
    exit() {
        // Cleanup resources
    }
    
    spawnCandy() {
        const size = 20 + Math.random() * 20;
        const candy = {
            x: Math.random() * this.game.width,
            y: 100 + Math.random() * (this.game.height - 200),
            width: size,
            height: size,
            speed: this.candySpeed * (0.8 + Math.random() * 0.4),
            direction: Math.random() > 0.5 ? 1 : -1,
            value: Math.ceil(size / 5) // Mayor tamaño = mayor valor
        };
        this.candies.push(candy);
    }
    
    checkHooking() {
        const hookX = this.player.line.hookX;
        const hookY = this.player.line.hookY;
        
        for (let i = 0; i < this.candies.length; i++) {
            const candy = this.candies[i];
            
            // Distancia entre el anzuelo y el dulce
            const dx = hookX - candy.x;
            const dy = hookY - candy.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Si está lo suficientemente cerca, pescamos
            if (distance < candy.width / 2 + 5) {
                this.player.line.hooked = true;
                this.player.line.hookedCandy = candy;
                this.candies.splice(i, 1);
                
                // Mensaje de éxito
                this.showMessage = true;
                this.messageTimer = 1.5;
                this.message = `¡Atrapaste un dulce! +${candy.value} puntos`;
                
                return;
            }
        }
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
        
        // Actualizar temporizador
        this.timer -= deltaTime;
        if (this.timer <= 0) {
            this.gameOver = true;
            this.gameActive = false;
            return;
        }
        
        // Movimiento del jugador con WASD o flechas
        let dx = 0;
        if (this.game.isKeyPressed('ArrowLeft') || this.game.isKeyPressed('a') || this.game.isKeyPressed('A')) {
            dx = -this.player.speed * deltaTime;
        }
        if (this.game.isKeyPressed('ArrowRight') || this.game.isKeyPressed('d') || this.game.isKeyPressed('D')) {
            dx = this.player.speed * deltaTime;
        }
        
        // Actualizar posición del jugador
        this.player.x = Math.max(this.player.width/2, Math.min(this.player.x + dx, this.game.width - this.player.width/2));
        
        // Manejo de la caña de pescar
        if (this.game.isKeyPressed('space') || this.game.mouseDown) {
            if (!this.player.casting) {
                // Iniciar lanzamiento
                this.player.casting = true;
                this.player.line.length = 10;
                this.player.line.hooked = false;
                
                // Mostrar mensaje de instrucción
                this.showMessage = true;
                this.messageTimer = 2;
                this.message = "Mantén pulsado para extender la línea, suelta para recoger";
            } else if (!this.player.line.hooked) {
                // Extender la línea
                this.player.line.length = Math.min(
                    this.player.line.length + this.player.line.speed * deltaTime,
                    this.player.line.maxLength
                );
                
                // Verificar si pescamos algo
                this.checkHooking();
            }
        } else if (this.player.casting) {
            // Soltar botón mientras pescamos
            if (this.player.line.hooked && this.player.line.hookedCandy) {
                // Si tenemos algo en el anzuelo, recogemos puntos
                this.score += this.player.line.hookedCandy.value;
                this.player.line.hookedCandy = null; // Usar null en lugar de delete para evitar errores
            }
            
            // Retraer la línea
            this.player.line.retracting = true;
            this.player.line.length -= this.player.line.retractSpeed * deltaTime;
            
            if (this.player.line.length <= 0) {
                // Terminamos de recoger
                this.player.casting = false;
                this.player.line.retracting = false;
            }
        }
        
        // Actualizar posición del anzuelo
        if (this.player.casting) {
            const angle = Math.PI / 2; // lanzar hacia abajo
            this.player.line.hookX = this.player.x + this.player.line.length * Math.cos(angle);
            this.player.line.hookY = this.player.y + this.player.line.length * Math.sin(angle);
        }
        
        // Spawning de nuevos dulces
        this.candyTimer += deltaTime;
        if (this.candyTimer >= this.candySpawnRate) {
            this.spawnCandy();
            this.candyTimer = 0;
        }
        
        // Actualizar movimiento de dulces
        for (let i = 0; i < this.candies.length; i++) {
            const candy = this.candies[i];
            candy.x += candy.speed * candy.direction * deltaTime;
            
            // Cambiar dirección si llega al borde
            if (candy.x < 0 || candy.x > this.game.width) {
                candy.direction *= -1;
            }
        }
    }
    
    render(ctx) {
        // Fondo
        ctx.fillStyle = '#87CEEB'; // cielo azul
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Agua (desde la mitad hacia abajo)
        ctx.fillStyle = '#1E90FF'; // agua más oscura
        ctx.fillRect(0, 80, this.game.width, this.game.height - 80);
        
        // Dibujar todos los dulces
        for (let i = 0; i < this.candies.length; i++) {
            const candy = this.candies[i];
            ctx.fillStyle = `hsl(${(i * 30) % 360}, 100%, 70%)`; // Colores variados
            ctx.beginPath();
            ctx.arc(candy.x, candy.y, candy.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Detalles del dulce
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(candy.x - candy.width/4, candy.y - candy.width/4, candy.width/8, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Dibujar jugador (pescador)
        ctx.fillStyle = '#d2691e'; // marrón
        ctx.fillRect(this.player.x - this.player.width/2, this.player.y - this.player.height/2, 
                    this.player.width, this.player.height);
                    
        // Caña de pescar
        if (this.player.casting) {
            ctx.strokeStyle = '#663300';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.player.x, this.player.y);
            ctx.lineTo(this.player.line.hookX, this.player.line.hookY);
            ctx.stroke();
            
            // Anzuelo
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(this.player.line.hookX, this.player.line.hookY, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Si tenemos algo en el anzuelo
            if (this.player.line.hooked && this.player.line.hookedCandy) {
                const candy = this.player.line.hookedCandy;
                ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 70%)`; // Color aleatorio
                ctx.beginPath();
                ctx.arc(this.player.line.hookX, this.player.line.hookY, candy.width/2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw UI
        super.render(ctx);
        
        // Información del juego
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Puntos: ${this.score}`, 20, 20);
        
        // Formato de tiempo (mm:ss)
        const minutes = Math.floor(this.timer / 60);
        const seconds = Math.floor(this.timer % 60);
        const timeText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        ctx.fillText(`Tiempo: ${timeText}`, 20, 50);
        
        // Mostrar mensajes de instrucciones
        if (this.showMessage) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.width/2 - 300, this.game.height - 80, 600, 50);
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.message, this.game.width/2, this.game.height - 55);
        }
        
        // Draw title
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pescador Pastelero', this.game.width / 2, 20);
        
        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.width / 2 - 150, this.game.height / 2 - 100, 300, 200);
            
            ctx.fillStyle = '#fff';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('¡Juego Terminado!', this.game.width / 2, this.game.height / 2 - 50);
            ctx.fillText(`Puntuación: ${this.score}`, this.game.width / 2, this.game.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Presiona R para reiniciar', this.game.width / 2, this.game.height / 2 + 50);
        }
    }
}
