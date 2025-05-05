/**
 * StorytellerAI - Un sistema para contar historias y dirigir a los usuarios a diferentes juegos
 * Esta implementación utiliza reglas preestablecidas y respuestas predefinidas para simular una IA
 */
class StorytellerAI {
    constructor() {
        this.initialized = false;
        this.messages = [];
        this.gameOptions = {};
        this.isFetchingResponse = false;
        this.loadingTime = 2000; // Tiempo simulado de carga en ms
        
        // Mapeo de palabras clave a juegos
        this.gameKeywords = {
            'monedas': 'coinCollector',
            'tesoro': 'coinCollector',
            'dorado': 'coinCollector',
            'ruleta': 'roulette',
            'fortuna': 'roulette',
            'suerte': 'roulette',
            'ajedrez': 'chess',
            'estrategia': 'chess',
            'guardianes': 'chess',
            'laberinto': 'maze',
            'bosque': 'maze',
            'camino': 'maze',
            'disparar': 'shooter',
            'burbujas': 'shooter',
            'plataforma': 'platform',
            'saltar': 'platform',
            'islas': 'platform',
            'memoria': 'memory',
            'cartas': 'memory',
            'parejas': 'memory',
            'serpiente': 'snake',
            'silbi': 'snake',
            'rompecabezas': 'puzzle',
            'deslizar': 'puzzle',
            'cuadro': 'puzzle',
            'música': 'rhythm',
            'ritmo': 'rhythm',
            'melodía': 'rhythm',
            'torre': 'towerDefense',
            'defensa': 'towerDefense',
            'castillo': 'towerDefense',
            'pintar': 'paintGame',
            'dibujar': 'paintGame',
            'arte': 'paintGame',
            'trivia': 'triviaGame',
            'preguntas': 'triviaGame',
            'admin': 'adminPanel',
            'panel': 'adminPanel',
            'tablero': 'adminPanel'
        };
        
        // Historias predefinidas por juego
        this.gameStories = {
            'coinCollector': 'En el Valle Dorado, las monedas brillan con un resplandor mágico. Cada una contiene un fragmento de los sueños de Migalandia. ¿Te atreves a recogerlas antes de que se acabe el tiempo?',
            'roulette': 'La Rueda de la Fortuna Mágica gira en la Ciudad de los Deseos. Se dice que aquellos con suficiente suerte pueden obtener el premio mayor. ¿Probarás tu fortuna?',
            'chess': 'Los Guardianes del Reino Cuadriculado te desafían a una partida de ajedrez. Mueve tus piezas con sabiduría y derrota al rey enemigo para demostrar tu estrategia.',
            'maze': 'El Bosque Enredado esconde muchos secretos entre sus caminos confusos. Encuentra la salida antes de que la oscuridad te atrape en su laberinto eterno.',
            'shooter': 'En el Cielo Azucarado, burbujas mágicas flotan llevando dulces encantados. Dispara y reviéntalas para liberar su magia antes de que escapen.',
            'platform': 'Las Islas Flotantes de Bizcocho se elevan sobre las nubes. Salta entre ellas recogiendo estrellas fugaces mientras evitas caer al vacío.',
            'memory': 'En la Villa de los Recuerdos, las cartas guardan memorias de Migalandia. Encuentra los pares coincidentes para desbloquear historias olvidadas.',
            'snake': 'Silbi, la serpiente golosa, recorre los jardines de Migalandia en busca de manzanas mágicas. Ayúdala a comerlas sin tropezar con su propia cola.',
            'puzzle': 'El Cuadro Mágico de la Galería se ha roto en pedazos. Desliza las piezas para reconstruir la imagen y descubrir el secreto que guarda.',
            'rhythm': 'En el Valle de la Melodía, las notas musicales cobran vida. Sigue el ritmo y compón la canción que despertará a los espíritus dormidos.',
            'towerDefense': 'Los invasores se acercan al Castillo Glaseado. Construye torres para defender el reino y proteger el tesoro de la Corona Dulce.',
            'paintGame': 'El Estudio Artístico de Migalandia te invita a crear. Pinta nuevos personajes y paisajes que cobrarán vida en el mundo de los croissants.',
            'triviaGame': 'El Gran Sabio de la Pastelería pone a prueba tus conocimientos. Responde correctamente a sus preguntas y demuestra que eres digno de sus secretos.',
            'adminPanel': 'Los planos del Reino de Migalandia se encuentran en el Panel de Administración. Explora los diseños y contribuye a la expansión del mundo mágico.'
        };
        
        // Historia de introducción
        this.introStory = "¡Bienvenido a Croissant Adventure! Soy el Narrador de Migalandia, un reino mágico lleno de aventuras y misterios. ¿Qué tipo de historia te gustaría explorar hoy? Puedes pedirme una aventura con monedas brillantes, un desafío de estrategia, un laberinto misterioso, o cualquier otra cosa que te intrigue. ¡Cuéntame qué buscas y te guiaré!";
    }
    
    /**
     * Inicializa el sistema narrativo
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log("Inicializando StorytellerAI...");
            
            // Mostrar mensaje de carga
            this.updateStatus("Preparando historias...");
            
            // Simular tiempo de carga para dar sensación de que se está cargando algo
            await new Promise(resolve => setTimeout(resolve, this.loadingTime));
            
            // Cargar respuestas predefinidas
            this.loadResponses();
            
            this.initialized = true;
            this.updateStatus("Sistema narrativo listo");
            
            // Añadir historia de introducción como primer mensaje
            this.addMessage('assistant', this.introStory);
            
            console.log("StorytellerAI inicializado correctamente");
            return true;
        } catch (error) {
            console.error("Error al inicializar StorytellerAI:", error);
            this.updateStatus("Error al inicializar: " + error.message);
            return false;
        }
    }
    
    /**
     * Carga respuestas predefinidas para diferentes temas
     */
    loadResponses() {
        // Respuestas genéricas para diferentes categorías
        this.responses = {
            welcome: [
                "¡Hola aventurero! Bienvenido a Migalandia. ¿Qué tipo de aventura buscas hoy?",
                "¡Qué alegría verte por aquí! Migalandia está llena de magia y aventuras. ¿Qué te gustaría explorar?",
                "¡Saludos! Soy el narrador de Migalandia y estoy aquí para guiarte. ¿Qué clase de historia te interesa?"
            ],
            unknown: [
                "Hmm, eso suena interesante, pero no estoy seguro de qué aventura podría gustarte. ¿Te interesan los tesoros, los laberintos o tal vez los juegos de habilidad?",
                "¡Vaya imaginación tienes! Déjame pensar... Podría contarte sobre las monedas mágicas del Valle Dorado o quizás sobre el misterioso laberinto del Bosque Enredado.",
                "¡Qué curiosa pregunta! En Migalandia tenemos muchas aventuras. ¿Te gustaría saber más sobre algún juego en particular?"
            ]
        };
    }
    
    /**
     * Actualiza el estado mostrado al usuario
     */
    updateStatus(message) {
        const statusElement = document.getElementById('ai-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    /**
     * Añade un mensaje al historial de conversación
     */
    addMessage(role, content) {
        this.messages.push({ role, content });
        this.renderMessages();
        return this.messages.length - 1;
    }
    
    /**
     * Renderiza los mensajes en el interfaz
     */
    renderMessages() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.role}`;
            
            // Marcar las palabras clave que corresponden a juegos
            let content = message.content;
            Object.keys(this.gameKeywords).forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                content = content.replace(regex, match => {
                    const game = this.gameKeywords[keyword.toLowerCase()];
                    return `<span class="game-keyword" data-game="${game}">${match}</span>`;
                });
            });
            
            messageElement.innerHTML = content;
            chatMessages.appendChild(messageElement);
        });
        
        // Scroll al final de los mensajes
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Agregar eventos a las palabras clave
        document.querySelectorAll('.game-keyword').forEach(element => {
            element.addEventListener('click', () => {
                const game = element.getAttribute('data-game');
                if (game) {
                    this.redirectToGame(game);
                }
            });
        });
    }
    
    /**
     * Procesa un mensaje del usuario y genera una respuesta
     */
    async processUserMessage(userInput) {
        if (!this.initialized) {
            console.error("El sistema no está inicializado");
            return "Lo siento, el narrador aún no está listo. Por favor, espera un momento.";
        }
        
        if (this.isFetchingResponse) {
            return "Espera un momento, estoy pensando en mi respuesta...";
        }
        
        try {
            this.isFetchingResponse = true;
            
            // Añadir mensaje del usuario
            this.addMessage('user', userInput);
            
            // Identificar juegos relevantes basados en palabras clave
            const detectedGames = this.detectGames(userInput);
            
            // Si se detectan juegos, se añaden opciones de juego
            if (detectedGames.length > 0) {
                this.gameOptions = {};
                detectedGames.forEach(game => {
                    this.gameOptions[game] = this.gameStories[game];
                });
            }
            
            // Simular tiempo de "pensamiento"
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            
            // Generar respuesta basada en los juegos detectados
            const responseIndex = this.addMessage('assistant', '...');
            let responseText = this.generateResponse(userInput, detectedGames);
            
            // Simular respuesta por partes (efecto de escritura)
            const chunks = this.chunkText(responseText, 10 + Math.floor(Math.random() * 20));
            
            for (const chunk of chunks) {
                await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));
                this.messages[responseIndex].content += chunk;
                this.renderMessages();
            }
            
            // Finalizar respuesta
            this.messages[responseIndex].content = responseText;
            this.renderMessages();
            
            // Sugerir juegos si se detectaron
            if (detectedGames.length > 0) {
                this.displayGameOptions(detectedGames);
            }
            
            this.isFetchingResponse = false;
            return responseText;
            
        } catch (error) {
            console.error("Error al procesar mensaje:", error);
            this.isFetchingResponse = false;
            
            // Mensaje de error en caso de fallo
            const errorMessage = "Lo siento, parece que hay un problema con mi magia narrativa. ¿Qué tal si hablamos de otro tema? Puedo contarte sobre monedas brillantes, laberintos misteriosos o cualquier otra aventura en Migalandia.";
            this.messages[this.messages.length - 1].content = errorMessage;
            this.renderMessages();
            
            return errorMessage;
        }
    }
    
    /**
     * Divide un texto en fragmentos para simular escritura gradual
     */
    chunkText(text, avgChunkSize) {
        const chunks = [];
        let start = 0;
        
        while (start < text.length) {
            // Variar el tamaño del fragmento para hacerlo más natural
            const chunkSize = avgChunkSize + Math.floor(Math.random() * (avgChunkSize / 2)) - Math.floor(avgChunkSize / 4);
            const end = Math.min(start + chunkSize, text.length);
            chunks.push(text.substring(start, end));
            start = end;
        }
        
        return chunks;
    }
    
    /**
     * Genera una respuesta basada en el mensaje del usuario y los juegos detectados
     */
    generateResponse(userInput, detectedGames) {
        // Si se detectaron juegos, generar respuesta personalizada
        if (detectedGames.length > 0) {
            const gameResponses = detectedGames.map(gameId => {
                return this.gameStories[gameId];
            });
            
            // Crear introducción
            let intro = this.getRandomResponse('welcome');
            
            // Añadir referencias a los juegos detectados
            const gameNames = detectedGames.map(gameId => this.getGameNameFromId(gameId)).join(", ");
            const response = `${intro} Veo que te interesa ${gameNames}. \n\n${gameResponses.join(" \n\n")}\n\nPuedes hacer clic en las palabras resaltadas para iniciar la aventura, o preguntarme sobre otro tipo de historias.`;
            
            return response;
        } 
        // Si no se detectaron juegos específicos
        else {
            // Seleccionar una respuesta genérica y mencionar algunos juegos al azar
            const unknownResponse = this.getRandomResponse('unknown');
            
            // Seleccionar 3 juegos aleatorios para sugerir
            const allGames = Object.keys(this.gameStories);
            const suggestedGames = [];
            
            while (suggestedGames.length < 3 && allGames.length > suggestedGames.length) {
                const randomGame = allGames[Math.floor(Math.random() * allGames.length)];
                if (!suggestedGames.includes(randomGame)) {
                    suggestedGames.push(randomGame);
                }
            }
            
            const gameDescriptions = suggestedGames.map(gameId => {
                return `${this.getGameNameFromId(gameId)}: ${this.gameStories[gameId]}`;
            }).join("\n\n");
            
            return `${unknownResponse}\n\nAquí tienes algunas aventuras que podrían interesarte:\n\n${gameDescriptions}`;
        }
    }
    
    /**
     * Obtiene una respuesta aleatoria de una categoría específica
     */
    getRandomResponse(category) {
        if (this.responses && this.responses[category] && this.responses[category].length > 0) {
            const randomIndex = Math.floor(Math.random() * this.responses[category].length);
            return this.responses[category][randomIndex];
        }
        
        return "\u00a1Hola aventurero! Bienvenido a Migalandia. \u00bfQu\u00e9 tipo de aventura buscas hoy?";
    }
    
    /**
     * Detecta qué juegos pueden ser relevantes basados en palabras clave
     */
    detectGames(text) {
        const lowerText = text.toLowerCase();
        const detectedGames = new Set();
        
        Object.keys(this.gameKeywords).forEach(keyword => {
            if (lowerText.includes(keyword.toLowerCase())) {
                detectedGames.add(this.gameKeywords[keyword.toLowerCase()]);
            }
        });
        
        return Array.from(detectedGames);
    }
    
    /**
     * Muestra las opciones de juego detectadas
     */
    displayGameOptions(games) {
        const optionsContainer = document.getElementById('game-options');
        if (!optionsContainer) return;
        
        optionsContainer.innerHTML = '<h3>Aventuras disponibles:</h3>';
        
        games.forEach(gameId => {
            const gameOption = document.createElement('div');
            gameOption.className = 'game-option';
            gameOption.innerHTML = `<h4>${this.getGameNameFromId(gameId)}</h4><p>${this.gameStories[gameId]}</p>`;
            gameOption.addEventListener('click', () => this.redirectToGame(gameId));
            optionsContainer.appendChild(gameOption);
        });
        
        optionsContainer.style.display = 'block';
    }
    
    /**
     * Redirecciona al juego seleccionado
     */
    redirectToGame(gameId) {
        window.location.href = `juego_nuevo.html?game=${gameId}`;
    }
    
    /**
     * Obtiene el nombre amigable de un juego a partir de su ID
     */
    getGameNameFromId(gameId) {
        const gameNames = {
            'coinCollector': 'El Tesoro del Valle Dorado',
            'roulette': 'La Rueda de la Fortuna Mágica',
            'chess': 'Los Guardianes del Reino Cuadriculado',
            'maze': 'El Bosque Enredado de Migalandia',
            'shooter': 'Los Burbujeadores del Cielo Azucarado',
            'platform': 'Las Islas Flotantes de Bizcocho',
            'memory': 'El Misterio de las Cartas Gemelas',
            'snake': 'Las Aventuras de Silbi la Serpiente Golosa',
            'puzzle': 'El Cuadro Mágico Despiezado',
            'rhythm': 'La Orquesta Dulce de Migalandia',
            'towerDefense': 'Los Guardianes del Castillo de Azúcar',
            'paintGame': 'Estudio Artístico de Migalandia',
            'triviaGame': 'Trivia de Pastelería',
            'adminPanel': 'Panel de Administración'
        };
        
        return gameNames[gameId] || gameId;
    }
}
