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
        this.conversationContext = {
            lastTopics: [],
            userInterests: new Set(),
            conversationState: 'greeting',  // greeting, exploring, recommending, storytelling
            mentionedGames: new Set(),
            userMood: 'neutral'
        }
        
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
     * Carga respuestas predefinidas para diferentes temas y contextos conversacionales
     */
    loadResponses() {
        // Respuestas contextuales para diferentes situaciones de la conversación
        this.responses = {
            // Saludos y bienvenidas
            welcome: [
                "¡Hola aventurero! Bienvenido a Migalandia, un reino donde los croissants hablan y las aventuras esperan. ¿Qué tipo de historia te gustaría vivir hoy?",
                "¡Qué alegría verte por aquí! Migalandia está llena de magia, secretos y tesoros por descubrir. ¿Qué te gustaría explorar primero?",
                "¡Saludos, viajero! Como Narrador de Migalandia, puedo guiarte a través de numerosas aventuras. ¿Buscas acción, misterio, desafíos de ingenio o simplemente diversión?"
            ],
            
            // Respuestas para cuando no se detecta un tema específico
            unknown: [
                "Hmm, esa es una idea interesante. En Migalandia tenemos de todo: desde tesoros brillantes hasta laberintos misteriosos. ¿Te gustaría que te cuente más sobre alguna aventura específica?",
                "¡Vaya, qué creatividad! Déjame pensar... Podría mostrarte el Valle Dorado con sus monedas mágicas, o quizás prefieras el desafío del Bosque Enredado con sus caminos confusos. ¿Qué te llama más la atención?",
                "Interesante pregunta. Migalandia es un reino vasto con muchas historias por contar. ¿Te interesaría una aventura de acción, una historia de misterio o quizás un desafío de estrategia?"
            ],
            
            // Respuestas para saludos simples o conversación casual
            greeting: [
                "¡Hola! ¿Cómo estás hoy? Puedo ver que el sol brilla en Migalandia. ¿Qué tipo de aventura busca tu corazón en este hermoso día?",
                "¡Saludos! Espero que estés teniendo un día maravilloso. Todas las criaturas de Migalandia están ansiosas por conocer qué aventura elegirás hoy.",
                "¡Hola! Me alegra mucho conversar contigo. ¿Qué te trae hoy por el mágico reino de Migalandia?"
            ],
            
            // Respuestas para cuando el usuario muestra entusiasmo
            excitement: [
                "¡Veo que tienes mucho entusiasmo! Esa energía te será muy útil en las aventuras de Migalandia. ¿Te gustaría probar algo lleno de acción como los Burbujeadores del Cielo Azucarado?",
                "¡Tu emoción es contagiosa! Con ese espíritu, seguramente disfrutarías saltando entre las Islas Flotantes de Bizcocho o defendiendo el Castillo de Azúcar.",
                "¡Me encanta tu energía! Creo que disfrutarías mucho de una aventura llena de ritmo como la Orquesta Dulce de Migalandia, donde cada nota musical cobra vida."
            ],
            
            // Respuestas para preguntas sobre el universo de Migalandia
            lore: [
                "Migalandia surgió hace milenios cuando un panadero mágico horneó el primer croissant con harina encantada bajo la luz de la luna llena. Desde entonces, sus migas crearon valles, ríos y bosques llenos de magia y aventuras.",
                "En el corazón de Migalandia se encuentra la Gran Pastelería, donde el Maestro Horneador crea constantemente nuevos rincones para este mundo mágico. Cada lugar tiene su propia historia y secretos por descubrir.",
                "Las leyendas cuentan que Migalandia está conectada con nuestro mundo a través de los sueños y la imaginación. Cada vez que alguien disfruta de un delicioso croissant, se abre brevemente un portal entre los dos mundos."
            ],
            
            // Respuestas para dar continuidad a la conversación
            continuation: [
                "Cuéntame más sobre lo que te interesa. ¿Hay algún tipo de aventura que te llame especialmente la atención?",
                "¿Qué otros aspectos de Migalandia te gustaría explorar? Hay tantas historias por descubrir...",
                "Me intriga tu forma de pensar. ¿Qué otra cosa te gustaría saber sobre las maravillas de Migalandia?"
            ],
            
            // Respuestas para reconocimiento de patrones de búsqueda
            search_pattern: [
                "Parece que estás buscando algo específico. En Migalandia tenemos aventuras para todos los gustos. ¿Puedo ayudarte a encontrar exactamente lo que buscas?",
                "Veo que tienes una idea clara de lo que quieres. Déjame ayudarte a encontrar la aventura perfecta para ti en los vastos reinos de Migalandia.",
                "Tu búsqueda me da pistas sobre tus intereses. Permíteme guiarte hacia las aventuras de Migalandia que más podrían fascinarte."
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
     * Procesa un mensaje del usuario y genera una respuesta contextualmente apropiada
     */
    async processUserMessage(userInput) {
        if (!this.initialized) {
            console.error("El sistema no está inicializado");
            return "Lo siento, el narrador aún no está listo. Por favor, espera un momento.";
        }
        
        if (this.isFetchingResponse) {
            return "Espera un momento, estoy tejiendo las palabras para mi respuesta...";
        }
        
        try {
            this.isFetchingResponse = true;
            
            // Añadir mensaje del usuario
            this.addMessage('user', userInput);
            
            // Analizar el contenido del mensaje
            this.analyzeUserMessage(userInput);
            
            // Identificar juegos relevantes basados en palabras clave
            const detectedGames = this.detectGames(userInput);
            
            // Actualizar juegos mencionados en el contexto de la conversación
            detectedGames.forEach(game => {
                this.conversationContext.mentionedGames.add(game);
            });
            
            // Si se detectan juegos, se añaden opciones de juego
            if (detectedGames.length > 0) {
                this.gameOptions = {};
                detectedGames.forEach(game => {
                    this.gameOptions[game] = this.gameStories[game];
                });
                
                // Si se detectan juegos específicos, cambiamos el estado de la conversación
                this.conversationContext.conversationState = 'recommending';
            }
            
            // Simular tiempo de "pensamiento"
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            
            // Generar respuesta contextual basada en el análisis del mensaje
            const responseIndex = this.addMessage('assistant', '...');
            let responseText = this.generateContextualResponse(userInput, detectedGames);
            
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
            
            // Guardar el tema actual para dar continuidad a la conversación
            if (detectedGames.length > 0) {
                this.conversationContext.lastTopics = [...detectedGames];
            }
            
            // Cambiar el estado de la conversación si es necesario
            if (this.messages.length > 3 && this.conversationContext.conversationState === 'greeting') {
                this.conversationContext.conversationState = 'exploring';
            }
            
            this.isFetchingResponse = false;
            return responseText;
            
        } catch (error) {
            console.error("Error al procesar mensaje:", error);
            this.isFetchingResponse = false;
            
            // Mensaje de error en caso de fallo que mantenga el tono narrativo
            const errorMessage = "Oh, parece que las páginas de mi libro de historias se han mezclado por un momento. ¿Podríamos empezar de nuevo con una nueva aventura? Tengo historias sobre valles dorados, bosques mágicos y muchas otras maravillas de Migalandia para compartir contigo.";
            this.messages[this.messages.length - 1].content = errorMessage;
            this.renderMessages();
            
            return errorMessage;
        }
    }
    
    /**
     * Analiza el mensaje del usuario para entender su contexto e intención
     */
    analyzeUserMessage(userInput) {
        const lowerInput = userInput.toLowerCase();
        
        // Detectar saludos
        const greetings = ['hola', 'saludos', 'buenos días', 'buenas tardes', 'buenas noches', 'qué tal', 'cómo estás', 'hey'];
        if (greetings.some(greeting => lowerInput.includes(greeting))) {
            this.conversationContext.conversationState = 'greeting';
        }
        
        // Detectar preguntas sobre el mundo
        const loreQuestions = ['qué es migalandia', 'cuéntame sobre', 'historia de', 'origen', 'qué hay en', 'qué puedo hacer', 'qué juegos hay'];
        if (loreQuestions.some(question => lowerInput.includes(question))) {
            this.conversationContext.conversationState = 'storytelling';
        }
        
        // Detectar entusiasmo
        const enthusiasmMarkers = ['me encanta', 'genial', 'increíble', 'fantástico', 'asombroso', 'interesante', 'me gusta', '!', '!!'];
        if (enthusiasmMarkers.some(marker => lowerInput.includes(marker))) {
            this.conversationContext.userMood = 'excited';
        }
        
        // Detectar confusión
        const confusionMarkers = ['no entiendo', 'qué significa', 'cómo funciona', 'no sé', 'confuso', 'confundido', 'confundida'];
        if (confusionMarkers.some(marker => lowerInput.includes(marker))) {
            this.conversationContext.userMood = 'confused';
        }
        
        // Detectar intereses del usuario y agregarlos al conjunto
        const interestKeywords = ['me gusta', 'me interesa', 'quiero', 'preferiría', 'busco', 'me gustaría'];
        interestKeywords.forEach(keyword => {
            if (lowerInput.includes(keyword)) {
                // Extraer lo que viene después de la palabra clave (simplificado)
                const startIndex = lowerInput.indexOf(keyword) + keyword.length;
                const interestPhrase = lowerInput.substring(startIndex).trim();
                if (interestPhrase) {
                    this.conversationContext.userInterests.add(interestPhrase);
                }
            }
        });
    }
    
    /**
     * Genera una respuesta contextual basada en el mensaje del usuario y el estado de la conversación
     */
    generateContextualResponse(userInput, detectedGames) {
        // Establecer el tipo de respuesta basado en el estado de la conversación
        let responseType = 'unknown';
        
        // Seleccionar tipo de respuesta según el contexto
        if (this.conversationContext.conversationState === 'greeting') {
            responseType = 'greeting';
        } else if (this.conversationContext.conversationState === 'storytelling') {
            responseType = 'lore';
        } else if (this.conversationContext.conversationState === 'recommending') {
            // Ya se maneja con respuestas específicas de juegos
        } else if (this.conversationContext.userMood === 'excited') {
            responseType = 'excitement';
        } else if (this.conversationContext.userMood === 'confused') {
            // Dar una respuesta más explicativa
            responseType = 'lore';
        }
        
        // Si se han detectado juegos, generar respuesta personalizada
        if (detectedGames.length > 0) {
            const gameResponses = detectedGames.map(gameId => {
                return this.gameStories[gameId];
            });
            
            // Crear introducción contextual
            let intro = this.getRandomResponse(responseType);
            
            // Añadir referencias a los juegos detectados
            const gameNames = detectedGames.map(gameId => this.getGameNameFromId(gameId)).join(", ");
            const response = `${intro} Veo que te interesa ${gameNames}. \n\n${gameResponses.join(" \n\n")}\n\nPuedes hacer clic en las palabras resaltadas para iniciar la aventura, o preguntarme sobre otro tipo de historias.`;
            
            return response;
        } 
        // Si no se detectaron juegos específicos
        else {
            // Personalizar según temas previos o intereses detectados
            let customResponse = "";
            
            // Si hay temas previos, hacer referencia a ellos
            if (this.conversationContext.lastTopics.length > 0) {
                const lastGameId = this.conversationContext.lastTopics[0];
                const lastGameName = this.getGameNameFromId(lastGameId);
                customResponse = `Antes hablábamos sobre ${lastGameName}. `;
            }
            
            // Elegir una respuesta contextual
            const contextualResponse = this.getRandomResponse(responseType);
            
            // Seleccionar 2-3 juegos aleatorios para sugerir, pero evitando repeticiones
            const allGames = Object.keys(this.gameStories);
            const suggestedGames = [];
            const mentionedGamesArray = Array.from(this.conversationContext.mentionedGames);
            
            // Priorizar juegos que aún no se han mencionado
            const unmentionedGames = allGames.filter(game => !mentionedGamesArray.includes(game));
            const gamesToChooseFrom = unmentionedGames.length > 0 ? unmentionedGames : allGames;
            
            while (suggestedGames.length < 3 && gamesToChooseFrom.length > suggestedGames.length) {
                const randomGame = gamesToChooseFrom[Math.floor(Math.random() * gamesToChooseFrom.length)];
                if (!suggestedGames.includes(randomGame)) {
                    suggestedGames.push(randomGame);
                }
            }
            
            const gameDescriptions = suggestedGames.map(gameId => {
                return `${this.getGameNameFromId(gameId)}: ${this.gameStories[gameId]}`;
            }).join("\n\n");
            
            // Generar respuesta final con continuidad conversacional
            let continuationPrompt = "";
            if (this.messages.length > 3) {
                continuationPrompt = "\n\n" + this.getRandomResponse('continuation');
            }
            
            return `${customResponse}${contextualResponse}\n\nAquí tienes algunas aventuras que podrían interesarte:\n\n${gameDescriptions}${continuationPrompt}`;
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
    
    // La función generateResponse ha sido reemplazada por generateContextualResponse
    // que proporciona respuestas más contextualmente apropiadas
    
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
