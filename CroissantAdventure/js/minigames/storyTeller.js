/**
 * Story Teller Minigame
 * Un juego interactivo donde los jugadores crean historias eligiendo caminos
 */
class StoryTellerMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.name = "Story Teller";
        this.backgroundColor = "#8a5cbd";
        
        // Enlazar métodos de eventos del mouse para mantener el contexto
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        
        // Estado del juego
        this.currentScene = 'start';
        this.playerChoices = [];
        this.storyProgress = 0;
        this.storyCompleted = false;
        
        // Elementos de la UI
        this.buttonWidth = 300;
        this.buttonHeight = 60;
        this.buttonSpacing = 20;
        
        // Historias disponibles
        this.stories = [
            {
                title: "La Aventura del Croissant Mágico",
                scenes: {
                    'start': {
                        text: "Eres un croissant mágico que acaba de despertar en el mundo de Migalandia. Te encuentras en un cruce de caminos. ¿Hacia dónde te diriges?",
                        choices: [
                            { text: "Hacia el bosque misterioso", nextScene: 'forest' },
                            { text: "Hacia la ciudad brillante", nextScene: 'city' },
                            { text: "Hacia las montañas nevadas", nextScene: 'mountains' }
                        ],
                        background: "#8c6d3f"
                    },
                    'forest': {
                        text: "Te adentras en el bosque y encuentras a una serpiente colorida jugando con unas manzanas. Te dice que está aburrida y quiere compañía.",
                        choices: [
                            { text: "Jugar con la serpiente a atrapar manzanas", nextScene: 'snake_game' },
                            { text: "Preguntar sobre el camino hacia el tesoro oculto", nextScene: 'treasure_map' }
                        ],
                        background: "#2d6a4f"
                    },
                    'snake_game': {
                        text: "Pasas horas jugando con Silbi la Serpiente. Te enseña su juego favorito donde tiene que moverse por el bosque recogiendo manzanas sin chocarse con su cola.",
                        choices: [
                            { text: "Continuar tu viaje con un recuerdo feliz", nextScene: 'happy_ending' }
                        ],
                        background: "#2d6a4f",
                        gameRecommendation: 'snake'
                    },
                    'treasure_map': {
                        text: "La serpiente te entrega un mapa con un laberinto. Dice que en el centro hay un tesoro de monedas doradas, pero debes encontrar tu camino a través del confuso Bosque Enredado.",
                        choices: [
                            { text: "Explorar el laberinto en busca del tesoro", nextScene: 'maze_game' }
                        ],
                        background: "#2d6a4f",
                        gameRecommendation: 'maze'
                    },
                    'maze_game': {
                        text: "Después de muchas vueltas y giros, encuentras el tesoro en el centro del laberinto. ¡Un cofre lleno de monedas brillantes!",
                        choices: [
                            { text: "Recoger las monedas y celebrar", nextScene: 'happy_ending' }
                        ],
                        background: "#2d6a4f",
                        gameRecommendation: 'coinCollector'
                    },
                    'city': {
                        text: "Llegas a la Ciudad de los Deseos donde todo brilla con luces de colores. En el centro hay una gran ruleta dorada donde los habitantes juegan para cumplir sus sueños.",
                        choices: [
                            { text: "Probar suerte en la ruleta mágica", nextScene: 'roulette_game' },
                            { text: "Buscar al sabio de las cartas", nextScene: 'memory_quest' }
                        ],
                        background: "#745296"
                    },
                    'roulette_game': {
                        text: "La ruleta gira y gira, destellando con colores mágicos. Todos contienen la respiración mientras esperan ver dónde se detendrá.",
                        choices: [
                            { text: "Aceptar tu premio y continuar la aventura", nextScene: 'city_explore' }
                        ],
                        background: "#745296",
                        gameRecommendation: 'roulette'
                    },
                    'memory_quest': {
                        text: "El sabio de las cartas te desafía a un juego de memoria. Debes encontrar todas las parejas de cartas mágicas para recibir su consejo.",
                        choices: [
                            { text: "Aceptar el desafío", nextScene: 'memory_game' }
                        ],
                        background: "#745296",
                        gameRecommendation: 'memory'
                    },
                    'memory_game': {
                        text: "¡Lo lograste! El sabio está impresionado con tu memoria y te revela un secreto: 'A veces, la verdadera magia está en construir y proteger lo que amas'.",
                        choices: [
                            { text: "Agradecer y continuar explorando la ciudad", nextScene: 'city_explore' }
                        ],
                        background: "#745296"
                    },
                    'city_explore': {
                        text: "Mientras exploras la ciudad, escuchas una dulce melodía. Te acercas y ves una orquesta de pasteles tocando instrumentos musicales al ritmo de notas que caen del cielo.",
                        choices: [
                            { text: "Unirte a la orquesta y tocar música", nextScene: 'rhythm_game' },
                            { text: "Continuar tu viaje hacia las montañas", nextScene: 'mountains' }
                        ],
                        background: "#745296"
                    },
                    'rhythm_game': {
                        text: "Sigues el ritmo de la música, presionando las notas en el momento exacto. La melodía es hermosa y todos en la ciudad se unen para bailar.",
                        choices: [
                            { text: "Despedirte con una reverencia y continuar", nextScene: 'happy_ending' }
                        ],
                        background: "#b45ca8",
                        gameRecommendation: 'rhythm'
                    },
                    'mountains': {
                        text: "Llegas a las Montañas Nevadas donde ves un majestuoso castillo de chocolate. Pero hay problemas: ¡un ejército de hormigas golosas se acerca para comerse las torres!",
                        choices: [
                            { text: "Ayudar a defender el castillo", nextScene: 'tower_defense' },
                            { text: "Buscar una ruta alternativa saltando por las plataformas heladas", nextScene: 'platform_adventure' }
                        ],
                        background: "#6ca3d4"
                    },
                    'tower_defense': {
                        text: "Te pones al mando de la defensa. Construyes torres estratégicamente para detener a las hormigas invasoras y proteger el delicioso castillo.",
                        choices: [
                            { text: "Celebrar la victoria con los habitantes", nextScene: 'happy_ending' }
                        ],
                        background: "#6ca3d4",
                        gameRecommendation: 'towerDefense'
                    },
                    'platform_adventure': {
                        text: "Decides tomar la ruta alta, saltando de plataforma en plataforma sobre el abismo helado. Es peligroso pero emocionante.",
                        choices: [
                            { text: "Seguir saltando hacia la cima", nextScene: 'platform_game' }
                        ],
                        background: "#6ca3d4",
                        gameRecommendation: 'platform'
                    },
                    'platform_game': {
                        text: "Saltas con habilidad, recogiendo estrellas brillantes mientras evitas caer. ¡La vista desde arriba es espectacular!",
                        choices: [
                            { text: "Llegar a la cima y contemplar todo Migalandia", nextScene: 'happy_ending' }
                        ],
                        background: "#6ca3d4"
                    },
                    'happy_ending': {
                        text: "Tu aventura ha llegado a su fin, pero Migalandia siempre tendrá nuevas historias para ti. Has descubierto que cada elección te lleva a experiencias únicas y maravillosas.",
                        choices: [
                            { text: "Comenzar una nueva aventura", nextScene: 'start' }
                        ],
                        background: "#f7d08a",
                        isEnding: true
                    }
                }
            }
        ];
        
        // Historia actual
        this.currentStory = this.stories[0];
        
        // Transición entre escenas
        this.transition = {
            active: false,
            progress: 0,
            duration: 30, // frames
            nextScene: null
        };
        
        // Recompensas
        this.rewardPoints = 20;
        this.pointsPerChoice = 5;
    }
    
    /**
     * Inicializar el juego
     */
    enter() {
        console.log("Entrando al minijuego Story Teller");
        
        // Reiniciar estado del juego
        this.currentScene = 'start';
        this.playerChoices = [];
        this.storyProgress = 0;
        this.storyCompleted = false;
        
        // Seleccionar una historia aleatoria (para futura expansión)
        this.currentStory = this.stories[Math.floor(Math.random() * this.stories.length)];
        
        // Asegurarse de que los listeners de eventos estén configurados
        console.log("Configurando eventos del mouse...");
        this.game.canvas.addEventListener('mousedown', (e) => {
            console.log("Canvas mousedown event triggered");
            this.onMouseDown();
        });
        
        // Añadir event listener para teclas
        window.addEventListener('keydown', (e) => {
            this.onKeyDown(e.key);
        });
    }
    
    /**
     * Salir del juego
     */
    exit() {
        console.log("Saliendo del minijuego Story Teller");
        
        // Limpiar los event listeners cuando salimos del juego
        this.game.canvas.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('keydown', this.onKeyDown);
    }
    
    /**
     * Actualizar el estado del juego
     * @param {number} deltaTime - Tiempo desde el último frame
     */
    update(deltaTime) {
        // Manejar transición entre escenas
        if (this.transition.active) {
            this.transition.progress++;
            
            if (this.transition.progress >= this.transition.duration) {
                this.transition.active = false;
                this.transition.progress = 0;
                this.currentScene = this.transition.nextScene;
                
                // Verificar si se ha completado la historia
                const currentSceneData = this.currentStory.scenes[this.currentScene];
                if (currentSceneData.isEnding) {
                    this.storyCompleted = true;
                    // Dar puntos por completar la historia
                    this.game.addPoints(this.rewardPoints + (this.playerChoices.length * this.pointsPerChoice), 'storyTeller');
                }
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
        
        // Obtener datos de la escena actual
        const currentSceneData = this.currentStory.scenes[this.currentScene];
        
        // Color de fondo (basado en la escena)
        ctx.fillStyle = currentSceneData.background || this.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Dibujar marco de historia
        this.drawStoryFrame(ctx, width, height);
        
        // Dibujar título de la historia
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.currentStory.title, width / 2, 80);
        
        // Dibujar texto de la escena
        this.drawText(ctx, currentSceneData.text, width / 2, 180, 700);
        
        // Dibujar opciones
        if (!this.transition.active) {
            this.drawChoices(ctx, currentSceneData.choices, width, height);
        }
        
        // Si hay una recomendación de juego, mostrarla
        if (currentSceneData.gameRecommendation) {
            this.drawGameRecommendation(ctx, currentSceneData.gameRecommendation, width, height);
        }
        
        // Dibujar efecto de transición
        if (this.transition.active) {
            const alpha = this.transition.progress / this.transition.duration;
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, width, height);
        }
        
        // Si la historia está completada, mostrar mensaje de felicitación
        if (this.storyCompleted && this.currentScene === 'start') {
            this.drawCompletionMessage(ctx, width, height);
            this.storyCompleted = false;
        }
    }
    
    /**
     * Dibujar un marco para la historia
     */
    drawStoryFrame(ctx, width, height) {
        const margin = 40;
        const borderRadius = 20;
        
        // Marco exterior
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        this.roundRect(ctx, margin, margin, width - margin * 2, height - margin * 2, borderRadius, true);
        
        // Línea decorativa
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 3;
        this.roundRect(ctx, margin + 10, margin + 10, width - (margin + 10) * 2, height - (margin + 10) * 2, borderRadius - 5, false, true);
    }
    
    /**
     * Dibujar texto con saltos de línea automáticos
     */
    drawText(ctx, text, x, y, maxWidth) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        
        const words = text.split(' ');
        let line = '';
        let lineHeight = 30;
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            
            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        
        ctx.fillText(line, x, currentY);
    }
    
    /**
     * Dibujar las opciones de elección
     */
    drawChoices(ctx, choices, width, height) {
        if (!choices || choices.length === 0) return;
        
        const startY = height - 200;
        const centerX = width / 2;
        
        for (let i = 0; i < choices.length; i++) {
            const choice = choices[i];
            const y = startY + (this.buttonHeight + this.buttonSpacing) * i;
            
            // Dibujar botón
            ctx.fillStyle = "#ff9900";
            this.roundRect(ctx, centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight, 10, true);
            
            // Efecto hover
            if (this.isMouseOverButton(centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight)) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                this.roundRect(ctx, centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight, 10, true);
            }
            
            // Texto del botón
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.fillText(choice.text, centerX, y + this.buttonHeight / 2 + 6);
        }
    }
    
    /**
     * Dibujar recomendación de juego
     */
    drawGameRecommendation(ctx, gameKey, width, height) {
        const games = {
            coinCollector: { name: "Recolector de Monedas", icon: "🪙" },
            roulette: { name: "Ruleta de la Fortuna", icon: "🎰" },
            chess: { name: "Ajedrez", icon: "♞" },
            maze: { name: "Laberinto", icon: "🧩" },
            shooter: { name: "Disparos", icon: "🔫" },
            platform: { name: "Plataformas", icon: "🏃" },
            memory: { name: "Memoria", icon: "🃏" },
            snake: { name: "Serpiente", icon: "🐍" },
            puzzle: { name: "Puzzle", icon: "🧠" },
            rhythm: { name: "Ritmo", icon: "🎵" },
            towerDefense: { name: "Torres de Defensa", icon: "🏰" }
        };
        
        const game = games[gameKey];
        if (!game) return;
        
        // Dibujar botón de juego recomendado
        const rectX = width - 250;
        const rectY = height - 80;
        const rectWidth = 230;
        const rectHeight = 60;
        
        // Fondo del botón
        ctx.fillStyle = "#6366f1";
        this.roundRect(ctx, rectX, rectY, rectWidth, rectHeight, 15, true);
        
        // Efecto hover
        if (this.isMouseOverButton(rectX, rectY, rectWidth, rectHeight)) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.roundRect(ctx, rectX, rectY, rectWidth, rectHeight, 15, true);
        }
        
        // Texto del botón
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${game.icon} Jugar a ${game.name}`, rectX + rectWidth / 2, rectY + 25);
        
        ctx.font = "12px Arial";
        ctx.fillText("¡Prueba este juego ahora!", rectX + rectWidth / 2, rectY + 45);
    }
    
    /**
     * Dibujar mensaje de felicitación por completar la historia
     */
    drawCompletionMessage(ctx, width, height) {
        // Fondo semitransparente
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, width, height);
        
        // Cuadro de mensaje
        const boxWidth = 500;
        const boxHeight = 300;
        const boxX = (width - boxWidth) / 2;
        const boxY = (height - boxHeight) / 2;
        
        ctx.fillStyle = "#ff9900";
        this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 20, true);
        
        // Borde
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        this.roundRect(ctx, boxX + 5, boxY + 5, boxWidth - 10, boxHeight - 10, 15, false, true);
        
        // Título
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("¡Historia Completada!", width / 2, boxY + 60);
        
        // Mensaje
        ctx.font = "20px Arial";
        ctx.fillText(`¡Felicidades! Has completado la aventura.`, width / 2, boxY + 120);
        ctx.fillText(`Has ganado ${this.rewardPoints + (this.playerChoices.length * this.pointsPerChoice)} puntos.`, width / 2, boxY + 160);
        ctx.fillText("¿Quieres iniciar una nueva historia?", width / 2, boxY + 200);
        
        // Botón para continuar
        const buttonWidth = 150;
        const buttonHeight = 50;
        const buttonX = (width - buttonWidth) / 2;
        const buttonY = boxY + boxHeight - 70;
        
        ctx.fillStyle = "#6366f1";
        this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10, true);
        
        // Efecto hover
        if (this.isMouseOverButton(buttonX, buttonY, buttonWidth, buttonHeight)) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10, true);
        }
        
        // Texto del botón
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Continuar", width / 2, buttonY + 32);
    }
    
    /**
     * Dibujar un rectángulo con bordes redondeados
     */
    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        if (fill) {
            ctx.fill();
        }
        
        if (stroke) {
            ctx.stroke();
        }
    }
    
    /**
     * Verificar si el mouse está sobre un botón
     */
    isMouseOverButton(x, y, width, height) {
        const isOver = (
            this.game.mouseX >= x &&
            this.game.mouseX <= x + width &&
            this.game.mouseY >= y &&
            this.game.mouseY <= y + height
        );
        
        if (isOver) {
            console.log("Mouse is over button!");
        }
        
        return isOver;
    }
    
    /**
     * Manejar clic del mouse
     */
    onMouseDown() {
        console.log("Mouse clicked at:", this.game.mouseX, this.game.mouseY);
        
        // Si está en transición, ignorar clics
        if (this.transition.active) {
            console.log("Ignoring click during transition");
            return;
        }
        
        // Obtener datos de la escena actual
        const currentSceneData = this.currentStory.scenes[this.currentScene];
        console.log("Current scene:", this.currentScene);
        
        // Verificar clic en opciones
        if (currentSceneData.choices) {
            const startY = this.game.height - 200;
            const centerX = this.game.width / 2;
            
            console.log("Choices available:", currentSceneData.choices.length);
            
            for (let i = 0; i < currentSceneData.choices.length; i++) {
                const choice = currentSceneData.choices[i];
                const y = startY + (this.buttonHeight + this.buttonSpacing) * i;
                const buttonX = centerX - this.buttonWidth / 2;
                
                console.log(`Button ${i} at: x=${buttonX}, y=${y}, width=${this.buttonWidth}, height=${this.buttonHeight}`);
                
                if (this.isMouseOverButton(buttonX, y, this.buttonWidth, this.buttonHeight)) {
                    console.log("Selecting choice:", choice.text);
                    this.selectChoice(choice);
                    return;
                }
            }
            console.log("No button clicked");
        }
        
        // Verificar clic en recomendación de juego
        if (currentSceneData.gameRecommendation) {
            const rectX = this.game.width - 250;
            const rectY = this.game.height - 80;
            const rectWidth = 230;
            const rectHeight = 60;
            
            if (this.isMouseOverButton(rectX, rectY, rectWidth, rectHeight)) {
                this.game.switchScene(currentSceneData.gameRecommendation);
                return;
            }
        }
        
        // Si se muestra el mensaje de completado, verificar clic en botón continuar
        if (this.storyCompleted && this.currentScene === 'start') {
            const buttonWidth = 150;
            const buttonHeight = 50;
            const buttonX = (this.game.width - buttonWidth) / 2;
            const buttonY = (this.game.height - buttonHeight) / 2 + 80;
            
            if (this.isMouseOverButton(buttonX, buttonY, buttonWidth, buttonHeight)) {
                this.storyCompleted = false;
            }
        }
    }
    
    /**
     * Seleccionar una opción
     */
    selectChoice(choice) {
        console.log("Selected choice:", choice);
        this.playerChoices.push(choice);
        this.storyProgress++;
        
        // Iniciar transición a la siguiente escena
        this.transition.active = true;
        this.transition.progress = 0;
        this.transition.nextScene = choice.nextScene;
        
        console.log("Transitioning to scene:", choice.nextScene);
    }
    
    /**
     * Manejar teclas presionadas
     */
    onKeyDown(key) {
        // Números 1-9 para seleccionar opciones
        const num = parseInt(key);
        if (!isNaN(num) && num >= 1 && num <= 9 && !this.transition.active) {
            const currentSceneData = this.currentStory.scenes[this.currentScene];
            if (currentSceneData.choices && num <= currentSceneData.choices.length) {
                this.selectChoice(currentSceneData.choices[num - 1]);
            }
        }
        
        // Espacio para continuar después de completar la historia
        if (key === ' ' && this.storyCompleted && this.currentScene === 'start') {
            this.storyCompleted = false;
        }
    }
}
