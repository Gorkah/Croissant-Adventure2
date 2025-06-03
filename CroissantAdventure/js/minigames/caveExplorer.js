/**
 * Cave Explorer Minigame - Explorador de Cristales Dulces
 * Un juego de exploración donde el jugador debe encontrar pares de cristales en la oscuridad de la cueva
 */
window.CaveExplorerMinigame = class CaveExplorerMinigame extends Minigame {
    constructor(game) {
        super(game);
        
        // Definir colores para los cristales (respaldo cuando no hay imágenes)
        this.crystalColors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#800080', '#FFA500', '#FFC0CB', '#00FFFF'];
        
        // Definir tipos de cristales
        this.crystalTypes = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
        
        // Cargar imágenes de cristales
        this.crystalImages = [];
        
        // No usaremos imágenes externas, solo dibujos generados con código
        // para evitar errores de recursos no encontrados
        this.useBackupGraphics = true;
        
        // Inicializar el juego después de definir las propiedades básicas
        this.reset();
        
        // Sonidos - inicialización segura para evitar errores
        try {
            this.sounds = {
                match: new Audio('assets/sounds/match.mp3'),
                noMatch: new Audio('assets/sounds/no_match.mp3'),
                victory: new Audio('assets/sounds/victory.mp3'),
                click: new Audio('assets/sounds/click.mp3'),
                ambient: new Audio('assets/sounds/cave_ambient.mp3')
            };
            
            // Configurar sonido ambiente en loop
            if (this.sounds.ambient) {
                this.sounds.ambient.loop = true;
            }
        } catch (e) {
            console.warn('No se pudieron cargar los sonidos para CaveExplorerMinigame', e);
            this.sounds = {};
        }
    }
    
    reset() {
        // Estado del juego
        this.score = 0;
        this.gameOver = false;
        this.victory = false;
        this.timeLeft = 120; // 2 minutos para completar
        this.moves = 0;
        
        // Configuración del tablero
        this.gridSize = 6; // Tablero 6x6
        this.board = [];
        this.selectedCrystal = null;
        this.revealedCrystals = [];
        this.matchedPairs = 0;
        
        // Propiedades para la linterna
        this.flashlight = {
            x: 0,
            y: 0,
            radius: 120, // Radio del círculo de luz
            fadeRadius: 60 // Radio del desvanecimiento
        };
        
        // Partículas para efectos
        this.particles = [];
        
        // Animación de cristales
        this.animating = false;
        this.animationTime = 0;
        
        // Generar tablero
        this.generateBoard();
    }
    
    /**
     * Genera el tablero de juego
     */
    generateBoard() {
        this.board = [];
        
        // Calcular número de pares (la mitad de las celdas)
        const totalCells = this.gridSize * this.gridSize;
        const numPairs = Math.floor(totalCells / 2);
        
        // Crear array con pares de valores
        let values = [];
        for (let i = 0; i < numPairs; i++) {
            const crystalType = i % this.crystalTypes.length;
            values.push(crystalType, crystalType); // Añadir par de cristales
        }
        
        // Si hay un número impar de celdas, añadir un cristal especial
        if (totalCells % 2 !== 0) {
            values.push(-1); // -1 representa el cristal especial
        }
        
        // Mezclar array
        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }
        
        // Calcular tamaño de cada celda
        const cellSize = Math.min(
            (this.game.width - 40) / this.gridSize,
            (this.game.height - 120) / this.gridSize
        );
        
        // Calcular posición inicial para centrar el tablero
        const startX = (this.game.width - cellSize * this.gridSize) / 2;
        const startY = (this.game.height - cellSize * this.gridSize) / 2;
        
        // Crear tablero con cristales
        let index = 0;
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.board.push({
                    x: startX + x * cellSize,
                    y: startY + y * cellSize,
                    width: cellSize - 10, // Espacio entre cristales
                    height: cellSize - 10,
                    value: values[index],
                    revealed: false,
                    matched: false,
                    animOffset: Math.random() * Math.PI * 2, // Para animación
                    rotation: 0
                });
                index++;
            }
        }
    }
    
    /**
     * Método que se ejecuta cuando el usuario hace clic en el canvas
     */
    onMouseDown() {
        console.log('onMouseDown detectado en CaveExplorer');
        
        // Si estamos en animación, no permitir clicks
        if (this.animating) return;
        
        let clickedOnCrystal = false;
        for (const crystal of this.board) {
            // Comprobar si el ratón está sobre el cristal con un margen extra para mejor detección
            if (this.game.mouseX >= crystal.x - 10 && this.game.mouseX <= crystal.x + crystal.width + 10 &&
                this.game.mouseY >= crystal.y - 10 && this.game.mouseY <= crystal.y + crystal.height + 10) {
                
                // Comprobar si el cristal ya está revelado o emparejado
                if (!crystal.revealed && !crystal.matched) {
                    console.log('Revelando cristal en posición:', crystal.x, crystal.y);
                    this.playSound('click');
                    this.revealCrystal(crystal);
                    clickedOnCrystal = true;
                    break;
                }
            }
        }
        
        if (!clickedOnCrystal) {
            console.log('Click no detectado en ningún cristal en posición:', this.game.mouseX, this.game.mouseY);
            console.log('Tablero de juego:', this.board);
        }
    }
    
    /**
     * Método que se ejecuta cuando el usuario suelta el clic
     */
    onMouseUp() {
        // No necesitamos hacer nada especial al soltar el clic
    }
    
    /**
     * Maneja la entrada del usuario
     */
    handleInput(deltaTime) {
        // Actualizar posición de la linterna con el ratón
        this.flashlight.x = this.game.mouseX;
        this.flashlight.y = this.game.mouseY;
        
        // Reiniciar juego con espacio
        if (this.gameOver || this.victory) {
            if (this.game.isKeyPressed(' ')) {
                this.reset();
            }
            
            // Volver al mapa con ESC
            if (this.game.isKeyPressed('Escape')) {
                this.game.switchScene('worldMap');
            }
        }
    }
    
    /**
     * Método para reproducir sonidos de forma segura
     */
    playSound(soundName) {
        // Método seguro que no intenta reproducir sonidos para evitar errores
        // Solo registra la intención de reproducir
        console.log(`Simulando reproducción de sonido: ${soundName}`);
        // No hacemos nada más para evitar errores con archivos de sonido inexistentes
    }
    
    /**
     * Revela un cristal
     */
    revealCrystal(crystal) {
        crystal.revealed = true;
        this.revealedCrystals.push(crystal);
        
        // Si ya hay dos cristales revelados, comprobar si son pareja
        if (this.revealedCrystals.length === 2) {
            this.moves++;
            this.animating = true;
            this.animationTime = 0;
            
            // Cristal especial (-1) siempre hace pareja
            if (this.revealedCrystals[0].value === -1 || this.revealedCrystals[1].value === -1) {
                this.matchCrystals();
            }
            // Comprobar si los valores coinciden
            else if (this.revealedCrystals[0].value === this.revealedCrystals[1].value) {
                this.matchCrystals();
            }
            // No coinciden
            else {
                // Usar una función para manejar el setTimeout y prevenir problemas de contexto
                const hideNonMatchingCrystals = () => {
                    this.playSound('noMatch');
                    if (this.revealedCrystals.length >= 2) {
                        this.revealedCrystals[0].revealed = false;
                        this.revealedCrystals[1].revealed = false;
                        this.revealedCrystals = [];
                    }
                    this.animating = false;
                };
                
                setTimeout(hideNonMatchingCrystals, 1000);
            }
        }
    }
    
    /**
     * Empareja dos cristales
     */
    matchCrystals() {
        this.playSound('match');
        
        // Marcar como emparejados
        this.revealedCrystals[0].matched = true;
        this.revealedCrystals[1].matched = true;
        
        // Crear partículas de celebración
        for (const crystal of this.revealedCrystals) {
            const crystalType = crystal.value;
            let color;
            
            // Asignar color según el tipo de cristal
            switch (crystalType % this.crystalTypes.length) {
                case 0: color = '#FF0000'; break; // Rojo
                case 1: color = '#0000FF'; break; // Azul
                case 2: color = '#00FF00'; break; // Verde
                case 3: color = '#FFFF00'; break; // Amarillo
                case 4: color = '#800080'; break; // Púrpura
                case 5: color = '#FFA500'; break; // Naranja
                case 6: color = '#FFC0CB'; break; // Rosa
                case 7: color = '#00FFFF'; break; // Cian
                default: color = '#FFFFFF'; break; // Blanco (especial)
            }
            
            // Generar partículas
            for (let i = 0; i < 10; i++) {
                this.particles.push({
                    x: crystal.x + crystal.width / 2,
                    y: crystal.y + crystal.height / 2,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    radius: 2 + Math.random() * 3,
                    color: color,
                    life: 1.0
                });
            }
        }
        
        // Sumar puntos
        this.score += 10;
        this.matchedPairs++;
        
        // Añadir tiempo extra por cada pareja
        this.timeLeft += 5;
        
        // Resetear cristales revelados
        this.revealedCrystals = [];
        this.animating = false;
        
        // Comprobar victoria
        if (this.matchedPairs === Math.floor(this.board.length / 2)) {
            this.victory = true;
            this.playSound('victory');
            
            // Bonus por tiempo restante
            const timeBonus = Math.floor(this.timeLeft);
            this.score += timeBonus;
            
            // Bonus por menos movimientos
            const moveBonus = Math.max(0, 200 - this.moves * 10);
            this.score += moveBonus;
        }
    }
    
    /**
     * Actualiza el estado del juego
     */
    update(deltaTime) {
        // Manejar entrada
        this.handleInput(deltaTime);
        
        // Actualizar animación
        if (this.animating) {
            this.animationTime += deltaTime;
        }
        
        // Animar cristales
        const time = Date.now() / 1000;
        for (const crystal of this.board) {
            if (crystal.matched) {
                // Rotar y hacer flotar los cristales emparejados
                crystal.rotation += deltaTime * 2;
                crystal.y += Math.sin(time + crystal.animOffset) * 0.2;
            }
        }
        
        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Actualizar tiempo
        if (!this.gameOver && !this.victory) {
            this.timeLeft -= deltaTime;
            
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.gameOver = true;
            }
        }
    }
    
    /**
     * Renderiza el juego
     */
    render(ctx) {
        // Limpiar canvas
        ctx.clearRect(0, 0, this.game.width, this.game.height);
        
        // Dibujar fondo de cueva con gradiente
        const bgGradient = ctx.createRadialGradient(
            this.game.width / 2, this.game.height / 2, 10,
            this.game.width / 2, this.game.height / 2, Math.max(this.game.width, this.game.height)
        );
        bgGradient.addColorStop(0, '#333333');
        bgGradient.addColorStop(1, '#111111');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Añadir textura de roca a la cueva
        ctx.save();
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 50; i++) {
            const size = 5 + Math.random() * 15;
            const x = Math.random() * this.game.width;
            const y = Math.random() * this.game.height;
            ctx.fillStyle = '#666666';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        
        // Aplicar oscuridad a toda la cueva
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Crear recorte para la luz de la linterna
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        
        // Gradiente radial para la luz
        const gradient = ctx.createRadialGradient(
            this.flashlight.x, this.flashlight.y, 0,
            this.flashlight.x, this.flashlight.y, this.flashlight.radius + this.flashlight.fadeRadius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.flashlight.x, this.flashlight.y, 
             this.flashlight.radius + this.flashlight.fadeRadius, 
             0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Dibujar tablero con cristales
        for (const crystal of this.board) {
            // Determinar color según el tipo
            let crystalColor;
            if (crystal.value === -1) {
                crystalColor = '#FFFFFF'; // Cristal especial
            } else {
                const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#800080', '#FFA500', '#FFC0CB', '#00FFFF'];
                crystalColor = colors[crystal.value % colors.length];
            }
            
            // Dibujar fondo de la celda
            ctx.fillStyle = '#333333';
            ctx.fillRect(crystal.x, crystal.y, crystal.width, crystal.height);
            
            // Si el cristal está revelado o emparejado, mostrar el cristal
            if (crystal.revealed || crystal.matched) {
                ctx.save();
                
                // Trasladar al centro del cristal
                ctx.translate(crystal.x + crystal.width / 2, crystal.y + crystal.height / 2);
                
                // Rotar si está emparejado
                if (crystal.matched) {
                    ctx.rotate(crystal.rotation);
                }
                
                // Efecto de brillo para cristales emparejados
                if (crystal.matched) {
                    const glowRadius = 5 + Math.sin(Date.now() / 200 + crystal.animOffset) * 3;
                    ctx.shadowColor = crystalColor;
                    ctx.shadowBlur = glowRadius;
                }
                
                // Dibujar cristal con formas generadas por código
                ctx.fillStyle = crystalColor;
                
                // Forma de cristal
                ctx.beginPath();
                ctx.moveTo(0, -crystal.height / 3);
                ctx.lineTo(crystal.width / 3, 0);
                ctx.lineTo(0, crystal.height / 3);
                ctx.lineTo(-crystal.width / 3, 0);
                ctx.closePath();
                ctx.fill();
                
                // Contorno del cristal
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Brillo interior
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(-crystal.width / 6, -crystal.height / 6, crystal.width / 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                
                // Reflejos adicionales si está emparejado
                if (crystal.matched) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 300) * 0.2;
                    ctx.beginPath();
                    ctx.arc(crystal.width / 8, crystal.height / 8, crystal.width / 15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
                
                ctx.restore();
            } else {
                // Si no está revelado, mostrar la parte trasera
                ctx.fillStyle = '#555555';
                ctx.fillRect(crystal.x + 5, crystal.y + 5, crystal.width - 10, crystal.height - 10);
                
                // Añadir detalles de roca
                ctx.fillStyle = '#777777';
                for (let i = 0; i < 5; i++) {
                    const dotX = crystal.x + 10 + Math.sin(crystal.x + i * 10) * (crystal.width - 20);
                    const dotY = crystal.y + 10 + Math.cos(crystal.y + i * 10) * (crystal.height - 20);
                    const dotSize = 2 + Math.random() * 3;
                    
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Dibujar partículas
        for (const particle of this.particles) {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Dibujar linterna con gráficos generados por código
        // Luz central
        const lightGradient = ctx.createRadialGradient(
            this.flashlight.x, this.flashlight.y, 0,
            this.flashlight.x, this.flashlight.y, 15
        );
        lightGradient.addColorStop(0, '#FFFFFF');
        lightGradient.addColorStop(0.7, '#FFCC00');
        lightGradient.addColorStop(1, '#FFA500');
        
        ctx.fillStyle = lightGradient;
        ctx.beginPath();
        ctx.arc(this.flashlight.x, this.flashlight.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde metálico
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.flashlight.x, this.flashlight.y, 14, 0, Math.PI * 2);
        ctx.stroke();
        
        // Mango de la linterna
        ctx.fillStyle = '#777777';
        ctx.beginPath();
        ctx.ellipse(this.flashlight.x, this.flashlight.y + 20, 8, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Brillo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.flashlight.x - 4, this.flashlight.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // UI
        this.renderUI(ctx);
    }
    
    /**
     * Renderiza la interfaz de usuario
     */
    renderUI(ctx) {
        // Fondo para la UI
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 100);
        
        // Puntuación
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.fillText(`Puntos: ${this.score}`, 20, 40);
        
        // Tiempo restante
        ctx.fillStyle = this.timeLeft < 30 ? '#FF0000' : '#FFFFFF';
        ctx.fillText(`Tiempo: ${Math.floor(this.timeLeft)}s`, 20, 70);
        
        // Parejas encontradas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Parejas: ${this.matchedPairs}/${Math.floor(this.board.length / 2)}`, 20, 100);
        
        // Instrucciones
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.game.width - 250, 10, 240, 50);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Usa el ratón para mover la linterna', this.game.width - 240, 30);
        ctx.fillText('Encuentra todos los pares de cristales', this.game.width - 240, 50);
        
        // Pantalla de game over
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#FF0000';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('¡TIEMPO AGOTADO!', this.game.width / 2, this.game.height / 2 - 40);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px Arial';
            ctx.fillText(`Puntuación final: ${this.score}`, this.game.width / 2, this.game.height / 2 + 10);
            ctx.fillText(`Parejas encontradas: ${this.matchedPairs}/${Math.floor(this.board.length / 2)}`, 
                      this.game.width / 2, this.game.height / 2 + 50);
            
            ctx.fillText('Presiona ESPACIO para reintentar', this.game.width / 2, this.game.height / 2 + 100);
            ctx.fillText('Presiona ESC para volver al mapa', this.game.width / 2, this.game.height / 2 + 140);
        }
        
        // Pantalla de victoria
        if (this.victory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#00FF00';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('¡VICTORIA!', this.game.width / 2, this.game.height / 2 - 60);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px Arial';
            ctx.fillText(`Puntuación final: ${this.score}`, this.game.width / 2, this.game.height / 2 - 10);
            ctx.fillText(`Tiempo restante: ${Math.floor(this.timeLeft)}s`, this.game.width / 2, this.game.height / 2 + 30);
            ctx.fillText(`Movimientos: ${this.moves}`, this.game.width / 2, this.game.height / 2 + 70);
            
            ctx.fillText('Presiona ESPACIO para reintentar', this.game.width / 2, this.game.height / 2 + 120);
            ctx.fillText('Presiona ESC para volver al mapa', this.game.width / 2, this.game.height / 2 + 160);
        }
    }
    
    /**
     * Método que se ejecuta cuando se entra en la escena
     */
    enter() {
        console.log("Iniciando minijuego de exploración de cuevas");
        this.reset();
        
        try {
            // Inicializar sonidos con URLs relativas seguras
            this.sounds = {};
            // No intentamos cargar sonidos para evitar errores
            console.log("Sonidos inicializados sin cargar archivos externos");
        } catch (e) {
            console.warn('Error al inicializar sonidos:', e);
        }
        
        // Mostrar instrucciones en la consola para depuración
        console.log("Haz clic en los cristales para revelarlos y encontrar parejas");
    }
    
    /**
     * Método que se ejecuta cuando se sale de la escena
     */
    exit() {
        console.log("Saliendo del minijuego de exploración");
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
