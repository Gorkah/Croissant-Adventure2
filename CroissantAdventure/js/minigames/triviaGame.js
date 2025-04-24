/**
 * Trivia Game Minigame
 * Un juego de preguntas y respuestas sobre postres y cocina
 */
class TriviaGameMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.name = "Pastry Trivia";
        this.backgroundColor = "#f8e7d4";
        
        // Estado del juego
        this.currentQuestion = null;
        this.selectedAnswer = null;
        this.answered = false;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.questionIndex = 0;
        this.showingFeedback = false;
        this.feedbackTimer = 0;
        
        // Preguntas de trivia
        this.questions = [
            {
                question: "¿De qué país es originario el croissant?",
                answers: ["Francia", "Austria", "Italia", "Suiza"],
                correctAnswer: 1, // Austria
                explanation: "Aunque asociado con Francia, el croissant se originó en Austria como 'kipferl'."
            },
            {
                question: "¿Qué ingrediente principal hace que la masa del croissant sea hojaldrada?",
                answers: ["Huevo", "Levadura", "Mantequilla", "Azúcar"],
                correctAnswer: 2, // Mantequilla
                explanation: "Las capas de mantequilla entre la masa crean el característico hojaldre del croissant."
            },
            {
                question: "¿Cuál de estos no es un ingrediente tradicional para croissants?",
                answers: ["Harina", "Sal", "Chocolate", "Levadura"],
                correctAnswer: 2, // Chocolate (es un relleno, no parte de la masa básica)
                explanation: "El chocolate es un relleno popular pero no un ingrediente de la masa tradicional."
            },
            {
                question: "¿Qué forma tiene tradicionalmente un croissant?",
                answers: ["Media luna", "Círculo", "Triángulo", "Cuadrado"],
                correctAnswer: 0, // Media luna
                explanation: "El croissant tradicional tiene forma de media luna o creciente."
            },
            {
                question: "¿Cuál es la técnica de amasado que se utiliza para hacer croissants?",
                answers: ["Amasado simple", "Fermentación", "Laminado", "Batido"],
                correctAnswer: 2, // Laminado
                explanation: "El laminado consiste en plegar la masa con mantequilla para crear múltiples capas."
            },
            {
                question: "¿Cuál es el pariente más cercano del croissant en la pastelería?",
                answers: ["Brioche", "Pain au chocolat", "Pretzel", "Baguette"],
                correctAnswer: 1, // Pain au chocolat
                explanation: "El pain au chocolat utiliza la misma masa que el croissant pero con forma rectangular."
            },
            {
                question: "¿Qué hace que un croissant sea 'au beurre'?",
                answers: ["Lleva relleno", "Está hecho con mantequilla", "Es más grande", "Tiene azúcar"],
                correctAnswer: 1, // Está hecho con mantequilla
                explanation: "'Au beurre' indica que está hecho con mantequilla pura en lugar de margarina."
            },
            {
                question: "¿Aproximadamente cuántas capas tiene un croissant bien hecho?",
                answers: ["10-20", "27", "50-60", "Más de 80"],
                correctAnswer: 2, // 50-60
                explanation: "Un croissant tradicional bien hecho tiene entre 50 y 60 capas finas alternadas."
            },
            {
                question: "¿Cuál es el nombre del patrón de corte que se hace en la masa del croissant?",
                answers: ["Cuadrícula", "Triángulo", "Diamante", "No se corta"],
                correctAnswer: 1, // Triángulo
                explanation: "Los croissants se cortan en triángulos antes de enrollarlos en forma de media luna."
            },
            {
                question: "¿Qué temperatura es ideal para hornear croissants?",
                answers: ["150-180°C", "190-200°C", "210-220°C", "230-250°C"],
                correctAnswer: 1, // 190-200°C
                explanation: "La temperatura ideal es entre 190-200°C para lograr un dorado perfecto."
            }
        ];
        
        // Elementos UI
        this.buttonWidth = 500;
        this.buttonHeight = 60;
        this.buttonSpacing = 20;
        this.headerHeight = 150;
        
        // Temporizador
        this.timePerQuestion = 15; // segundos
        this.timeLeft = this.timePerQuestion;
        
        // Puntuación
        this.pointsPerCorrectAnswer = 10;
    }
    
    /**
     * Inicializar el juego
     */
    enter() {
        console.log("Entrando al minijuego Trivia");
        
        // Reiniciar estado
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.questionIndex = 0;
        this.showingFeedback = false;
        this.feedbackTimer = 0;
        this.selectedAnswer = null;
        this.answered = false;
        
        // Barajar preguntas
        this.shuffleQuestions();
        
        // Seleccionar primera pregunta
        this.setCurrentQuestion();
        
        // Vincular eventos de mouse directamente al método handleMouseClick
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.game.canvas.addEventListener('mousedown', this.handleMouseClick);
        console.log("Eventos de mouse vinculados en Trivia Game");
    }
    
    /**
     * Salir del juego
     */
    exit() {
        console.log("Saliendo del minijuego Trivia");
        
        // Desvincular eventos de mouse
        this.game.canvas.removeEventListener('mousedown', this.handleMouseClick);
        console.log("Eventos de mouse desvinculados en Trivia Game");
    }
    
    /**
     * Barajar el orden de las preguntas
     */
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }
    
    /**
     * Establecer la pregunta actual
     */
    setCurrentQuestion() {
        if (this.questionIndex < this.questions.length) {
            this.currentQuestion = this.questions[this.questionIndex];
            this.selectedAnswer = null;
            this.answered = false;
            this.timeLeft = this.timePerQuestion;
        } else {
            // Fin del juego - mostrar puntuación final
            this.currentQuestion = null;
            
            // Dar puntos basados en respuestas correctas
            const totalPoints = this.correctAnswers * this.pointsPerCorrectAnswer;
            this.game.addPoints(totalPoints, 'triviaGame');
        }
    }
    
    /**
     * Comprobar la respuesta seleccionada
     */
    checkAnswer() {
        if (this.selectedAnswer === null || this.answered) return;
        
        this.answered = true;
        this.showingFeedback = true;
        this.feedbackTimer = 3; // 3 segundos de feedback
        
        if (this.selectedAnswer === this.currentQuestion.correctAnswer) {
            this.correctAnswers++;
        } else {
            this.incorrectAnswers++;
        }
    }
    
    /**
     * Actualizar el estado del juego
     * @param {number} deltaTime - Tiempo desde el último frame
     */
    update(deltaTime) {
        // Si está mostrando feedback, actualizar temporizador de feedback
        if (this.showingFeedback) {
            this.feedbackTimer -= deltaTime;
            
            if (this.feedbackTimer <= 0) {
                this.showingFeedback = false;
                this.questionIndex++;
                this.setCurrentQuestion();
            }
            
            return;
        }
        
        // Si no hay pregunta actual, no hay nada que actualizar
        if (!this.currentQuestion) return;
        
        // Actualizar temporizador de pregunta
        if (!this.answered) {
            this.timeLeft -= deltaTime;
            
            if (this.timeLeft <= 0) {
                // Tiempo agotado, contar como respuesta incorrecta
                this.timeLeft = 0;
                this.answered = true;
                this.incorrectAnswers++;
                this.showingFeedback = true;
                this.feedbackTimer = 3;
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
        
        // Si no hay pregunta actual, mostrar pantalla de fin de juego
        if (!this.currentQuestion) {
            this.renderGameOver(ctx, width, height);
            return;
        }
        
        // Dibujar encabezado
        this.renderHeader(ctx, width);
        
        // Dibujar pregunta
        this.renderQuestion(ctx, width, height);
        
        // Dibujar opciones de respuesta
        this.renderAnswers(ctx, width, height);
        
        // Dibujar temporizador
        this.renderTimer(ctx, width, height);
        
        // Dibujar feedback si es necesario
        if (this.showingFeedback) {
            this.renderFeedback(ctx, width, height);
        }
    }
    
    /**
     * Renderizar el encabezado
     */
    renderHeader(ctx, width) {
        // Fondo del encabezado
        ctx.fillStyle = "#e8c39e";
        ctx.fillRect(0, 0, width, this.headerHeight);
        
        // Línea divisoria
        ctx.strokeStyle = "#bf8d60";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, this.headerHeight);
        ctx.lineTo(width, this.headerHeight);
        ctx.stroke();
        
        // Título del juego
        ctx.fillStyle = "#7d5a3c";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Trivia de Pastelería", width / 2, 60);
        
        // Puntuación
        ctx.fillStyle = "#7d5a3c";
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Correctas: ${this.correctAnswers}    Incorrectas: ${this.incorrectAnswers}    Pregunta: ${this.questionIndex + 1}/${this.questions.length}`, width / 2, 100);
    }
    
    /**
     * Renderizar la pregunta actual
     */
    renderQuestion(ctx, width, height) {
        ctx.fillStyle = "#7d5a3c";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.currentQuestion.question, width / 2, this.headerHeight + 80);
    }
    
    /**
     * Renderizar las opciones de respuesta
     */
    renderAnswers(ctx, width, height) {
        const startY = this.headerHeight + 150;
        const centerX = width / 2;
        
        for (let i = 0; i < this.currentQuestion.answers.length; i++) {
            const answer = this.currentQuestion.answers[i];
            const y = startY + (this.buttonHeight + this.buttonSpacing) * i;
            
            // Color del botón (cambia si está seleccionado)
            let buttonColor = "#ff9900";
            if (this.selectedAnswer === i) {
                buttonColor = "#ffb84d";
            }
            
            // Si está mostrando feedback y está respondido, mostrar colores de correcto/incorrecto
            if (this.showingFeedback && this.answered) {
                if (i === this.currentQuestion.correctAnswer) {
                    buttonColor = "#4CAF50"; // Verde para respuesta correcta
                } else if (i === this.selectedAnswer && i !== this.currentQuestion.correctAnswer) {
                    buttonColor = "#F44336"; // Rojo para respuesta incorrecta seleccionada
                }
            }
            
            // Dibujar botón
            ctx.fillStyle = buttonColor;
            this.roundRect(ctx, centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight, 10, true);
            
            // Efecto hover
            if (!this.answered && this.isMouseOverButton(centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight)) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                this.roundRect(ctx, centerX - this.buttonWidth / 2, y, this.buttonWidth, this.buttonHeight, 10, true);
            }
            
            // Texto del botón
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(answer, centerX, y + this.buttonHeight / 2 + 8);
        }
    }
    
    /**
     * Renderizar el temporizador
     */
    renderTimer(ctx, width, height) {
        // No mostrar temporizador durante el feedback
        if (this.showingFeedback) return;
        
        const timerWidth = 300;
        const timerHeight = 20;
        const timerX = (width - timerWidth) / 2;
        const timerY = height - 80;
        
        // Fondo del temporizador
        ctx.fillStyle = "#dddddd";
        this.roundRect(ctx, timerX, timerY, timerWidth, timerHeight, 5, true);
        
        // Barra de progreso
        const progress = Math.max(0, this.timeLeft / this.timePerQuestion);
        const progressWidth = timerWidth * progress;
        
        // Color basado en el tiempo restante
        let timerColor = "#4CAF50"; // Verde
        if (progress < 0.5) {
            timerColor = "#FFC107"; // Amarillo
        }
        if (progress < 0.25) {
            timerColor = "#F44336"; // Rojo
        }
        
        ctx.fillStyle = timerColor;
        this.roundRect(ctx, timerX, timerY, progressWidth, timerHeight, 5, true);
        
        // Texto del temporizador
        ctx.fillStyle = "#333333";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.ceil(this.timeLeft)}s`, width / 2, timerY + timerHeight + 20);
    }
    
    /**
     * Renderizar feedback de respuesta
     */
    renderFeedback(ctx, width, height) {
        // Fondo semitransparente
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, this.headerHeight, width, height - this.headerHeight);
        
        // Panel de feedback
        const panelWidth = 600;
        const panelHeight = 200;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;
        
        ctx.fillStyle = "#ffffff";
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15, true);
        
        // Título del feedback
        if (this.selectedAnswer === this.currentQuestion.correctAnswer) {
            ctx.fillStyle = "#4CAF50";
            ctx.font = "bold 30px Arial";
            ctx.textAlign = "center";
            ctx.fillText("¡Correcto!", width / 2, panelY + 50);
        } else {
            ctx.fillStyle = "#F44336";
            ctx.font = "bold 30px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Incorrecto", width / 2, panelY + 50);
            
            // Mostrar respuesta correcta
            ctx.fillStyle = "#333333";
            ctx.font = "20px Arial";
            ctx.fillText(`Respuesta correcta: ${this.currentQuestion.answers[this.currentQuestion.correctAnswer]}`, width / 2, panelY + 90);
        }
        
        // Explicación
        ctx.fillStyle = "#333333";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        this.wrapText(ctx, this.currentQuestion.explanation, width / 2, panelY + 130, panelWidth - 40, 25);
        
        // Temporizador de feedback
        ctx.fillStyle = "#999999";
        ctx.font = "14px Arial";
        ctx.fillText(`Siguiente pregunta en ${Math.ceil(this.feedbackTimer)}s...`, width / 2, panelY + panelHeight - 20);
    }
    
    /**
     * Renderizar pantalla de fin de juego
     */
    renderGameOver(ctx, width, height) {
        // Fondo
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Panel de resultados
        const panelWidth = 700;
        const panelHeight = 400;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;
        
        ctx.fillStyle = "#ffffff";
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 20, true);
        
        // Borde del panel
        ctx.strokeStyle = "#ff9900";
        ctx.lineWidth = 5;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 20, false, true);
        
        // Título
        ctx.fillStyle = "#7d5a3c";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("¡Trivia completada!", width / 2, panelY + 70);
        
        // Resultados
        ctx.fillStyle = "#333333";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Respuestas correctas: ${this.correctAnswers}`, width / 2, panelY + 150);
        ctx.fillText(`Respuestas incorrectas: ${this.incorrectAnswers}`, width / 2, panelY + 190);
        
        // Puntuación
        const totalPoints = this.correctAnswers * this.pointsPerCorrectAnswer;
        ctx.fillStyle = "#ff9900";
        ctx.font = "bold 30px Arial";
        ctx.fillText(`¡Has ganado ${totalPoints} puntos!`, width / 2, panelY + 250);
        
        // Mensaje motivacional
        let message = "¡Buen trabajo!";
        if (this.correctAnswers >= 8) {
            message = "¡Excelente! ¡Eres un maestro pastelero!";
        } else if (this.correctAnswers >= 6) {
            message = "¡Muy bien! Tienes buenos conocimientos de pastelería.";
        } else if (this.correctAnswers >= 4) {
            message = "No está mal, pero puedes mejorar tus conocimientos.";
        } else {
            message = "¡Sigue aprendiendo sobre el mundo de la pastelería!";
        }
        
        ctx.fillStyle = "#333333";
        ctx.font = "20px Arial";
        ctx.fillText(message, width / 2, panelY + 300);
        
        // Botón para volver al mapa
        const buttonWidth = 250;
        const buttonHeight = 60;
        const buttonX = (width - buttonWidth) / 2;
        const buttonY = panelY + panelHeight - 80;
        
        ctx.fillStyle = "#ff9900";
        this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10, true);
        
        // Efecto hover
        if (this.isMouseOverButton(buttonX, buttonY, buttonWidth, buttonHeight)) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10, true);
        }
        
        // Texto del botón
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Volver al mapa", width / 2, buttonY + buttonHeight / 2 + 7);
    }
    
    /**
     * Método para renderizar texto con saltos de línea
     */
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let testLine = '';
        let lineCount = 0;
        
        for (let n = 0; n < words.length; n++) {
            testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
                lineCount++;
            } else {
                line = testLine;
            }
        }
        
        ctx.fillText(line, x, y);
        return lineCount;
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
            console.log("Mouse está sobre un botón");
        }
        
        return isOver;
    }
    

    
    /**
     * Manejador de evento de clic del mouse
     */
    handleMouseClick(e) {
        console.log("Clic detectado en Trivia en:", this.game.mouseX, this.game.mouseY);
        
        // Si está mostrando feedback, ignorar clics
        if (this.showingFeedback) {
            console.log("Ignorando clic durante feedback");
            return;
        }
        
        // Si no hay pregunta actual (fin del juego), comprobar clic en botón de volver al mapa
        if (!this.currentQuestion) {
            const buttonWidth = 250;
            const buttonHeight = 60;
            const buttonX = (this.game.width - buttonWidth) / 2;
            const buttonY = (this.game.height - buttonHeight) / 2 + 120;
            
            if (this.isMouseOverButton(buttonX, buttonY, buttonWidth, buttonHeight)) {
                console.log("Clic en botón de volver al mapa");
                this.game.switchScene('worldMap');
                return;
            }
            
            return;
        }
        
        // Si ya se ha respondido, ignorar clics
        if (this.answered) {
            console.log("Pregunta ya respondida, ignorando clic");
            return;
        }
        
        // Comprobar clic en opciones de respuesta
        const startY = this.headerHeight + 150;
        const centerX = this.game.width / 2;
        
        console.log("Comprobando opciones de respuesta");
        
        for (let i = 0; i < this.currentQuestion.answers.length; i++) {
            const y = startY + (this.buttonHeight + this.buttonSpacing) * i;
            const buttonX = centerX - this.buttonWidth / 2;
            
            console.log(`Opción ${i}: x=${buttonX}, y=${y}, width=${this.buttonWidth}, height=${this.buttonHeight}`);
            
            if (this.isMouseOverButton(buttonX, y, this.buttonWidth, this.buttonHeight)) {
                console.log(`Clic en opción ${i}: ${this.currentQuestion.answers[i]}`);
                this.selectedAnswer = i;
                this.checkAnswer();
                return;
            }
        }
        
        console.log("No se detectó clic en ninguna opción");
    }
    
    /**
     * Manejar clic del mouse (método del sistema)
     */
    onMouseDown() {
        // Este método es llamado por el sistema de juego
        // Ya no lo usamos directamente, sino a través del event listener
    }
}
