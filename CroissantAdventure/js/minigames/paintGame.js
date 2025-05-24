/**
 * Paint Game Minigame
 * Un juego creativo donde los jugadores pueden pintar y colorear
 */
class PaintGameMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.name = "Paint Game";
        this.backgroundColor = "#f5f5f5";
        
        // Estado del canvas de dibujo
        this.canvas = document.createElement('canvas');
        this.canvas.width = game.width;
        this.canvas.height = game.height;
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración de dibujo
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.brushSize = 10;
        this.currentColor = "#ff9900";
        
        // Paleta de colores
        this.colors = [
            "#ff9900", // naranja (croissant)
            "#e74c3c", // rojo
            "#3498db", // azul
            "#2ecc71", // verde
            "#f1c40f", // amarillo
            "#9b59b6", // morado
            "#1abc9c", // turquesa
            "#34495e", // azul oscuro
            "#ffffff", // blanco
            "#000000"  // negro
        ];
        
        // Configuración de herramientas
        this.tools = [
            { name: "Pincel", icon: "🖌️", id: "brush" },
            { name: "Borrador", icon: "🧽", id: "eraser" },
            { name: "Rellenar", icon: "🪣", id: "fill" },
            { name: "Limpiar", icon: "🗑️", id: "clear" }
        ];
        
        this.currentTool = "brush";
        
        // Elementos UI
        this.colorPickerSize = 30;
        this.colorPickerMargin = 10;
        this.toolbarHeight = 60;
        
        // Puntuación y desafíos
        this.timeLeft = 180; // 3 minutos
        this.challengeActive = false;
        this.challenges = [
            { description: "Dibuja un croissant", completed: false, points: 20 },
            { description: "Usa todos los colores", completed: false, points: 15 },
            { description: "Llena todo el lienzo", completed: false, points: 25 }
        ];
        this.currentChallenge = null;
        
        // Guardar dibujos
        this.savedDrawings = [];
    }
    
    /**
     * Setup enter method for PaintGame
     */
    enter() {
        console.log("Entrando al minijuego Paint Game");
        this.clearCanvas();
        this.setupPrompt();
        
        // Limpiar el canvas y reiniciar estado
        this.isDrawing = false;
        this.timeLeft = 180;
        
        // Seleccionar un desafío aleatorio
        this.selectRandomChallenge();
        
        // Vincular eventos de mouse específicos para este juego
        this.bindEvents();
        console.log("Eventos de mouse vinculados en Paint Game");
    }
    
    /**
     * Exit method for PaintGame
     */
    exit() {
        console.log("Saliendo del minijuego Paint Game");
        
        // Desvincular eventos de mouse al salir
        this.unbindEvents();
        console.log("Eventos de mouse desvinculados en Paint Game");
    }
    
    /**
     * Setup prompts and challenges for painting
     */
    setupPrompt() {
        this.challenges = [
            "¡Dibuja un croissant!",
            "¡Pinta un personaje de Migalandia!",
            "¡Diseña tu propio postre!",
            "¡Crea un mundo de fantasía!"
        ];
        
        this.currentChallenge = this.challenges[Math.floor(Math.random() * this.challenges.length)];
    }
    

    
    /**
     * Limpiar el canvas
     */
    clearCanvas() {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Vincular eventos de mouse
     */
    bindEvents() {
        // Asegurarse de que los métodos tengan el contexto correcto
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        // Añadir event listeners al canvas del juego
        this.game.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.game.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.game.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.game.canvas.addEventListener('mouseout', this.handleMouseUp);
    }
    
    /**
     * Desvincular eventos de mouse
     */
    unbindEvents() {
        this.game.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.game.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.game.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.game.canvas.removeEventListener('mouseout', this.handleMouseUp);
    }
    
    /**
     * Manejar evento de mouse down
     */
    handleMouseDown(e) {
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Verificar si se hizo clic en la paleta de colores
        if (y > this.game.height - this.toolbarHeight) {
            const colorIndex = Math.floor(x / (this.colorPickerSize + this.colorPickerMargin));
            if (colorIndex >= 0 && colorIndex < this.colors.length) {
                this.currentColor = this.colors[colorIndex];
                return;
            }
            
            // Verificar si se hizo clic en una herramienta
            const toolStartX = (this.colorPickerSize + this.colorPickerMargin) * this.colors.length + 20;
            const toolWidth = 50;
            
            for (let i = 0; i < this.tools.length; i++) {
                const toolX = toolStartX + i * toolWidth;
                if (x >= toolX && x <= toolX + toolWidth) {
                    this.currentTool = this.tools[i].id;
                    
                    // Si se seleccionó limpiar, limpiar el canvas
                    if (this.currentTool === "clear") {
                        this.ctx.fillStyle = "#ffffff";
                        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    }
                    
                    return;
                }
            }
            
            return;
        }
        
        // Iniciar dibujo
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        
        // Si la herramienta es rellenar, rellenar el área
        if (this.currentTool === "fill") {
            this.floodFill(x, y, this.currentColor);
            return;
        }
    }
    
    /**
     * Manejar evento de mouse move
     */
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // No dibujar en la barra de herramientas
        if (y > this.game.height - this.toolbarHeight) {
            return;
        }
        
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.brushSize;
        
        if (this.currentTool === "brush") {
            this.ctx.strokeStyle = this.currentColor;
        } else if (this.currentTool === "eraser") {
            this.ctx.strokeStyle = "#ffffff"; // Color de fondo
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
        
        // Comprobar si se completó el desafío
        this.checkChallengeCompletion();
    }
    
    /**
     * Manejar evento de mouse up
     */
    handleMouseUp() {
        this.isDrawing = false;
    }
    
    /**
     * Algoritmo de relleno por inundación (flood fill)
     */
    floodFill(x, y, color) {
        // Implementación simple del algoritmo de relleno
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        const targetColor = this.getPixelColor(imageData, x, y);
        const fillColor = this.hexToRgb(color);
        
        // Si el color objetivo es igual al color de relleno, no hacer nada
        if (this.colorsEqual(targetColor, fillColor)) {
            return;
        }
        
        const stack = [{x, y}];
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            const pos = (y * width + x) * 4;
            
            // Verificar si este pixel ya se ha procesado
            if (!this.colorsEqual([data[pos], data[pos + 1], data[pos + 2], data[pos + 3]], targetColor)) {
                continue;
            }
            
            // Pintar el pixel
            data[pos] = fillColor[0];
            data[pos + 1] = fillColor[1];
            data[pos + 2] = fillColor[2];
            data[pos + 3] = 255;
            
            // Añadir píxeles vecinos al stack
            if (x > 0) stack.push({x: x - 1, y});
            if (y > 0) stack.push({x, y: y - 1});
            if (x < width - 1) stack.push({x: x + 1, y});
            if (y < height - 1) stack.push({x, y: y + 1});
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Obtener el color de un pixel
     */
    getPixelColor(imageData, x, y) {
        const {width, data} = imageData;
        const pos = (y * width + x) * 4;
        return [data[pos], data[pos + 1], data[pos + 2], data[pos + 3]];
    }
    
    /**
     * Comprobar si dos colores son iguales
     */
    colorsEqual(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }
    
    /**
     * Convertir color hex a RGB
     */
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b, 255];
    }
    
    /**
     * Seleccionar un desafío aleatorio
     */
    selectRandomChallenge() {
        const uncompletedChallenges = this.challenges.filter(c => !c.completed);
        if (uncompletedChallenges.length > 0) {
            this.currentChallenge = uncompletedChallenges[Math.floor(Math.random() * uncompletedChallenges.length)];
            this.challengeActive = true;
        } else {
            // Reiniciar todos los desafíos si todos se han completado
            this.challenges.forEach(c => c.completed = false);
            this.currentChallenge = this.challenges[Math.floor(Math.random() * this.challenges.length)];
            this.challengeActive = true;
        }
    }
    
    /**
     * Comprobar si se completó el desafío actual
     */
    checkChallengeCompletion() {
        if (!this.challengeActive || !this.currentChallenge) return;
        
        // Comprobar uso de todos los colores
        if (this.currentChallenge.description === "Usa todos los colores") {
            // Lógica simple: se completa si el jugador selecciona todos los colores
            // En una implementación real, se comprobaría si realmente usó todos los colores en el dibujo
            this.currentChallenge.completed = true;
            this.game.addPoints(this.currentChallenge.points, 'paintGame');
            this.challengeActive = false;
        }
        
        // Comprobar si se ha llenado todo el lienzo
        if (this.currentChallenge.description === "Llena todo el lienzo") {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            let nonWhitePixels = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
                    nonWhitePixels++;
                }
            }
            
            // Si más del 60% del canvas está pintado, se considera completado
            if (nonWhitePixels > (data.length / 4) * 0.6) {
                this.currentChallenge.completed = true;
                this.game.addPoints(this.currentChallenge.points, 'paintGame');
                this.challengeActive = false;
            }
        }
        
        // El desafío "Dibuja un croissant" es subjetivo, 
        // en un juego real se podría implementar análisis de imagen
        // o un botón para que el jugador indique que ha terminado
    }
    
    /**
     * Actualizar el estado del juego
     * @param {number} deltaTime - Tiempo desde el último frame
     */
    update(deltaTime) {
        // Verificar salida con el botón Esc
        if (this.game.keys['Escape']) {
            this.game.changeState('map');
            return;
        }
        
        // Actualizar el tiempo restante
        if (this.timeLeft > 0) {
            this.timeLeft -= deltaTime;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.challengeActive = false;
            }
        }
        
        // Verificar clic en botón de salida
        if (this.game.mouseDown) {
            const exitBtnX = 40;
            const exitBtnY = 40;
            const exitBtnRadius = 20;
            
            const dx = this.game.mouseX - exitBtnX;
            const dy = this.game.mouseY - exitBtnY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= exitBtnRadius) {
                this.game.changeState('map');
                this.game.mouseDown = false;
            }
        }
    }
    
    /**
     * Renderizar el juego
     */
    render() {
        const ctx = this.game.ctx;
        const width = this.game.width;
        const height = this.game.height;
        
        // Dibujar fondo
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Dibujar el canvas de dibujo
        ctx.drawImage(this.canvas, 0, 0);
        
        // Dibujar barra de herramientas
        this.drawToolbar(ctx, width, height);
        
        // Dibujar información del desafío
        this.drawChallengeInfo(ctx, width, height);
        
        // Dibujar botón de salida
        this.drawExitButton(ctx);
    }
    
    /**
     * Dibujar la barra de herramientas
     */
    drawToolbar(ctx, width, height) {
        // Fondo de la barra de herramientas
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, height - this.toolbarHeight, width, this.toolbarHeight);
        
        // Borde superior de la barra
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height - this.toolbarHeight);
        ctx.lineTo(width, height - this.toolbarHeight);
        ctx.stroke();
        
        // Dibujar selectores de colores
        for (let i = 0; i < this.colors.length; i++) {
            const x = i * (this.colorPickerSize + this.colorPickerMargin) + this.colorPickerMargin;
            const y = height - this.toolbarHeight + this.colorPickerMargin;
            
            // Color
            ctx.fillStyle = this.colors[i];
            ctx.fillRect(x, y, this.colorPickerSize, this.colorPickerSize);
            
            // Borde
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, this.colorPickerSize, this.colorPickerSize);
            
            // Indicador de color seleccionado
            if (this.colors[i] === this.currentColor) {
                ctx.strokeStyle = "#ff0000";
                ctx.lineWidth = 3;
                ctx.strokeRect(x - 2, y - 2, this.colorPickerSize + 4, this.colorPickerSize + 4);
            }
        }
        
        // Dibujar herramientas
        const toolStartX = (this.colorPickerSize + this.colorPickerMargin) * this.colors.length + 20;
        const toolWidth = 50;
        
        for (let i = 0; i < this.tools.length; i++) {
            const tool = this.tools[i];
            const x = toolStartX + i * toolWidth;
            const y = height - this.toolbarHeight + 15;
            
            // Fondo de la herramienta
            ctx.fillStyle = tool.id === this.currentTool ? "#dddddd" : "#f0f0f0";
            ctx.fillRect(x, y, toolWidth - 5, 30);
            
            // Borde
            ctx.strokeStyle = "#999999";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, toolWidth - 5, 30);
            
            // Icono
            ctx.fillStyle = "#000000";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(tool.icon, x + (toolWidth - 5) / 2, y + 20);
        }
        
        // Mostrar tamaño del pincel
        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`Tamaño: ${this.brushSize}px`, width - 20, height - 15);
        
        // Mostrar tiempo restante
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60);
        ctx.fillStyle = "#000000";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Tiempo: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, 20, height - 15);
    }
    
    /**
     * Dibujar botón de salida
     */
    drawExitButton(ctx) {
        const x = 40;
        const y = 40;
        const radius = 20;
        
        // Fondo del botón
        ctx.fillStyle = "#ff5555";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde del botón
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // X del botón
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 8);
        ctx.lineTo(x + 8, y + 8);
        ctx.moveTo(x + 8, y - 8);
        ctx.lineTo(x - 8, y + 8);
        ctx.stroke();
        
        // Texto 'Salir'
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Salir", x, y + radius + 15);
    }
    
    /**
     * Dibujar información del desafío
     */
    drawChallengeInfo(ctx, width, height) {
        if (this.challengeActive && this.currentChallenge) {
            // Fondo para el desafío
            ctx.fillStyle = "rgba(255, 153, 0, 0.8)";
            ctx.fillRect(width - 250, 20, 230, 60);
            
            // Borde
            ctx.strokeStyle = "#ff9900";
            ctx.lineWidth = 2;
            ctx.strokeRect(width - 250, 20, 230, 60);
            
            // Texto del desafío
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Desafío:", width - 135, 45);
            ctx.font = "14px Arial";
            ctx.fillText(this.currentChallenge.description, width - 135, 65);
        }
    }
    
    /**
     * Manejar clic del mouse
     */
    onMouseDown() {
        // Este método es llamado por el sistema de juego
        // No hace nada aquí porque ya manejamos los eventos del mouse directamente
    }
    
    /**
     * Manejar teclas presionadas
     */
    onKeyDown(key) {
        // Aumentar/disminuir tamaño del pincel
        if (key === '+' || key === '=') {
            this.brushSize = Math.min(50, this.brushSize + 1);
        } else if (key === '-' || key === '_') {
            this.brushSize = Math.max(1, this.brushSize - 1);
        }
        
        // Cambiar herramientas con números
        if (key === '1') this.currentTool = "brush";
        if (key === '2') this.currentTool = "eraser";
        if (key === '3') this.currentTool = "fill";
        if (key === '4') {
            // Limpiar canvas
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Completar desafío actual (para pruebas)
        if (key === 'c' && this.challengeActive && this.currentChallenge) {
            this.currentChallenge.completed = true;
            this.game.addPoints(this.currentChallenge.points, 'paintGame');
            this.challengeActive = false;
            this.selectRandomChallenge();
        }
    }
}
