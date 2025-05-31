/**
 * StorytellerAI - Sistema narrativo personalizado con Trash y Croiso para Croissant Adventure
 * Proporciona una experiencia conversacional a través de los personajes del juego
 * Con integración de la API de Hugging Face
 */
class StorytellerAI {
    constructor() {
        this.initialized = false;
        this.messages = [];
        this.gameOptions = {};
        this.isFetchingResponse = false;
        this.loadingTime = 1500; // Tiempo simulado de carga
        
        // Configuración para la API de Hugging Face
        this.useHuggingFace = true; // Controla si se usa HF o el sistema local
        this.huggingFaceToken = "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"; // Token para la API
        
        // Usando un modelo directamente accesible a través de la API estándar
        this.huggingFaceModel = "mistralai/Mixtral-8x7B-Instruct-v0.1"; // Modelo potente multilingüe
        this.huggingFaceAPIEndpoint = "https://api-inference.huggingface.co/models/"; // Base endpoint
        this.tokenError = false; // Para rastrear si hay problemas con el token
        
        // Obtener el nombre del personaje seleccionado por el usuario
        this.playerCharacter = window.playerCharacter || { getDisplayName: () => 'Croiso' };
        
        // Sistema de memoria para mantener contexto de conversación
        this.memory = {
            lastUserMessage: "",
            lastBotMessage: "",
            mentionedGames: new Set(),
            userPreferences: new Set(),
            negativePreferences: new Set(), // Lo que al usuario no le gusta
            conversationCount: 0,
            lastSuggestedGames: [],
            huggingFaceHistory: [] // Historial para la API de Hugging Face
        };
        
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
        
        // Obtener el nombre del personaje para la historia de introducción
        const playerName = this.playerCharacter.getDisplayName();
        
        // Historia de introducción con Trash y el personaje seleccionado
        this.introStory = `¡Hola ${playerName}! Soy Trash, tu guía en Migalandia, un reino mágico lleno de aventuras y misterios. ¿Qué tipo de historia te gustaría explorar hoy? Puedes pedirme una aventura con monedas brillantes, un desafío de estrategia, un laberinto misterioso, o cualquier otra cosa que te intrigue. ¡Cuéntame qué buscas y te guiaré!`;
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
     * Carga respuestas predefinidas con mayor precisión contextual
     */
    loadResponses() {
        // Obtener el nombre del personaje para personalizar las respuestas
        const playerName = this.playerCharacter.getDisplayName();
        
        this.responses = {
            // Bienvenida inicial desde Trash al personaje seleccionado
            intro: [
                `¡Hola ${playerName}! Soy Trash, tu guía en Migalandia, un reino mágico lleno de aventuras y misterios. ¿Qué tipo de historia te gustaría explorar hoy? Puedes pedirme una aventura con monedas brillantes, un desafío de estrategia, un laberinto misterioso, o cualquier otra cosa que te intrigue. ¡Cuéntame qué buscas y te guiaré!`
            ],
            
            // Saludos básicos de Trash al personaje seleccionado
            greeting: [
                `¡Hola ${playerName}! Encantado de verte de nuevo en las tierras de Migalandia. Tengo muchas historias que podrían interesarte, ¿qué tipo de aventura buscas hoy?`,
                `¡Un saludo desde la Torre del Narrador, amigo ${playerName}! ¿Qué tipo de misión te gustaría emprender en Migalandia?`,
                `¡Bienvenido de nuevo, ${playerName}! Las páginas de mis libros están listas para mostrar nuevas aventuras. ¿Qué historia te gustaría vivir hoy?`
            ],
            
            // Respuestas a expresiones negativas
            negative: [
                "Veo que esa aventura no ha captado tu interés. No te preocupes, el reino de Migalandia tiene muchas otras historias que podrían emocionarte más. ¿Buscas acción, estrategia o tal vez un reto de ingenio?",
                "Comprendo que eso no te entusiasma. Déjame mostrarte algo completamente diferente. ¿Quizás prefieras una aventura con más acción o un desafío estratégico?",
                "Entiendo perfectamente, no todos los caminos son para todos los aventureros. Permíteme sugerirte algunas opciones completamente distintas que podrían despertar tu interés."
            ],
            
            // Respuestas para emociones positivas
            positive: [
                "¡Me alegra que te guste! Puedo mostrarte más aventuras similares si quieres seguir por ese camino, o podemos explorar algo totalmente nuevo.",
                "¡Excelente elección! Ese es uno de los destinos favoritos en Migalandia. ¿Te gustaría saber más sobre esta aventura o prefieres embarcarte en ella directamente?",
                "¡Tu entusiasmo hace que las páginas del libro brillen! Tengo muchas más historias que seguramente disfrutarás si te gustó esa."
            ],
            
            // Respuestas para preguntas o confusión
            question: [
                "En Migalandia, cada rincón alberga una historia única. ¿Qué te gustaría saber específicamente sobre nuestro mundo mágico o sus aventuras?",
                "Como Narrador, puedo revelarte los secretos de Migalandia y guiarte a través de sus tierras. ¿Qué misterios te intrigan más?",
                "Las preguntas son el inicio de toda gran aventura. ¿Qué dudas tienes sobre el reino de Migalandia o sus desafíos?"
            ],
            
            // Sugerencias específicas
            suggestion: [
                "Basado en lo que me cuentas, creo que estas aventuras podrían ser perfectas para ti:",
                "He buscado en mi libro de historias y encontré estas misiones que parecen ideales para tu espíritu aventurero:",
                "Explorando el mapa de Migalandia, estos son los destinos que más podrían interesarte:"
            ],
            
            // Cuando no hay indicaciones claras - Trash al personaje seleccionado
            default: [
                `Migalandia tiene tantas historias por contar que a veces es difícil decidir, ${playerName}. ¿Prefieres acción, estrategia, misterio o creatividad?`,
                `Como tu amigo Trash, puedo guiarte a numerosos reinos mágicos dentro de Migalandia. ¿Qué tipo de aventura atraería más a tu espíritu, ${playerName}?`,
                `Las páginas de mi libro mágico contienen infinitas posibilidades, querido ${playerName}. Dime qué buscas y te mostraré el camino hacia la aventura perfecta.`
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
     * Primero intenta usar Hugging Face, y si falla, usa el sistema local
     */
    async processUserMessage(userInput) {
        if (!this.initialized) {
            console.error("El sistema no está inicializado");
            return "Lo siento, el narrador aún no está listo. Por favor, espera un momento.";
        }
        
        if (this.isFetchingResponse) {
            return "Estoy preparando mi respuesta, dame un momento...";
        }
        
        try {
            this.isFetchingResponse = true;
            
            // Guardar el mensaje anterior para contexto
            this.memory.lastUserMessage = userInput;
            this.memory.conversationCount++;
            
            // Añadir mensaje del usuario
            this.addMessage('user', userInput);
            
            // Analizar sentimiento y contexto del mensaje
            const messageContext = this.analyzeMessage(userInput);
            
            // Identificar juegos relevantes o excluir juegos no deseados
            let suggestedGames = [];
            
            // Generar sugerencias basándonos en el análisis
            if (messageContext.sentiment === 'negative') {
                // Si al usuario no le gusta lo sugerido anteriormente, ofrecer algo diferente
                // Evitar sugerir los mismos juegos de antes
                suggestedGames = this.getSuggestedGames(3, this.memory.lastSuggestedGames);
                
                // Actualizar juegos que no le gustan al usuario
                this.memory.lastSuggestedGames.forEach(game => {
                    this.memory.negativePreferences.add(game);
                });
            } else if (messageContext.detectedGames.length > 0) {
                // Si detectó juegos específicos
                suggestedGames = messageContext.detectedGames;
                
                // Guardar preferencias
                suggestedGames.forEach(game => {
                    this.memory.userPreferences.add(game);
                });
            } else {
                // Sugerir juegos basándonos en contexto o al azar
                suggestedGames = this.getSuggestedGames(3);
            }
            
            // Actualizar memoria
            this.memory.lastSuggestedGames = suggestedGames;
            
            // Preparar opciones para mostrar
            if (suggestedGames.length > 0) {
                this.gameOptions = {};
                suggestedGames.forEach(game => {
                    this.gameOptions[game] = this.gameStories[game];
                });
            }
            
            // Construir respuesta apropiada - índice del mensaje en proceso
            const responseIndex = this.addMessage('assistant', 'Pensando...');
            
            // Intentar obtener respuesta de la API de Hugging Face o usar el sistema local
            let responseText = '';
            let usingHuggingFace = false;
            
            // Reactivamos Hugging Face con el nuevo modelo GPT-2
            this.useHuggingFace = true;
            
            if (this.useHuggingFace && !this.tokenError) {
                try {
                    // Formatear contexto para la API
                    const gameNames = suggestedGames.map(gameId => this.getGameNameFromId(gameId));
                    const gameDescriptions = suggestedGames.map(gameId => this.gameStories[gameId]);
                    
                    // Obtener respuesta de Hugging Face API con un timeout para evitar bloqueos
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error("Timeout esperando respuesta de Hugging Face")), 5000);
                    });
                    
                    responseText = await Promise.race([
                        this.getHuggingFaceResponse(userInput, gameNames, gameDescriptions),
                        timeoutPromise
                    ]);
                    
                    console.log("Respuesta obtenida de Hugging Face");
                    usingHuggingFace = true;
                } catch (huggingFaceError) {
                    console.error("Error con Hugging Face API, usando sistema local:", huggingFaceError);
                    // Si hay un error de token, lo marcamos para no volver a intentar
                    if (huggingFaceError.message.includes('401') || huggingFaceError.message.includes('403')) {
                        this.tokenError = true;
                        console.log("Se desactivaron futuras llamadas a Hugging Face por error de autenticación");
                    }
                    
                    // Si falla, usar el sistema local
                    responseText = this.buildResponse(messageContext, suggestedGames);
                }
            } else {
                // Usar el sistema local directamente
                responseText = this.buildResponse(messageContext, suggestedGames);
            }
            
            // Efecto de escritura gradual (simulación de tipeo)
            await this.simulateTyping(responseIndex, responseText);
            
            // Finalizar respuesta
            this.messages[responseIndex].content = responseText;
            this.renderMessages();
            
            // Guardar la respuesta para contexto futuro
            this.memory.lastBotMessage = responseText;
            
            // Mostrar opciones de juego como botones
            if (suggestedGames.length > 0) {
                this.displayGameOptions(suggestedGames);
            }
            
            this.isFetchingResponse = false;
            return responseText;
            
        } catch (error) {
            console.error("Error al procesar mensaje:", error);
            this.isFetchingResponse = false;
            
            // Mensaje de error amigable
            const errorMessage = "Parece que mi libro de historias está un poco desordenado. ¿Podríamos intentar otra vez? Tengo muchas aventuras emocionantes para compartir contigo.";
            this.messages[this.messages.length - 1].content = errorMessage;
            this.renderMessages();
            
            return errorMessage;
        }
    }

    /**
     * Obtiene una respuesta de la API de Hugging Face
     * @param {string} userInput - Mensaje del usuario
     * @param {Array} gameNames - Nombres de los juegos a recomendar
     * @param {Array} gameDescriptions - Descripciones de los juegos
     * @returns {Promise<string>} - Respuesta generada por la API
     */
    async getHuggingFaceResponse(userInput, gameNames, gameDescriptions) {
        // Si ya tuvimos un error con el token, saltamos directamente al sistema local
        if (this.tokenError) {
            console.log("Usando sistema local debido a error previo con token");
            throw new Error("Token error detected previously");
        }

        // Actualizar el historial con el mensaje del usuario
        this.memory.huggingFaceHistory.push({
            role: "user",
            content: userInput
        });

        // Preparar el contexto para el modelo
        const playerName = this.playerCharacter.getDisplayName();
        
        // Preparar formato para el modelo Mixtral-8x7B-Instruct-v0.1
        // Este modelo requiere un formato de texto específico
        
        // Construir el contexto para el prompt
        const systemInstruction = `Eres Trash, un narrador mágico en el mundo de Migalandia en el juego Croissant Adventure. 
Tu misión es contar historias cautivadoras en español y recomendar juegos a ${playerName}.
Sé amigable, mágico e imaginativo. Usa un lenguaje colorido y apropiado para un mundo de fantasía.`;
        
        // Información sobre los juegos disponibles
        const gamesInfo = `Estos son los juegos disponibles que puedes recomendar según el contexto:
${gameNames.map((name, i) => `- ${name}: ${gameDescriptions[i]}`).join('\n')}`;
        
        // Obtener historial reciente limitado
        const recentHistory = this.memory.huggingFaceHistory.slice(-4);
        const historyText = recentHistory.map(msg => 
            `${msg.role === 'user' ? playerName : 'Trash'}: ${msg.content}`
        ).join('\n\n');
        
        // Formato de prompt para Mixtral-8x7B-Instruct-v0.1
        // Usa el formato <s>[INST] instrucción [/INST] respuesta </s>
        const prompt = `<s>[INST] ${systemInstruction}\n\n${gamesInfo}\n\nHistorial de conversación:\n${historyText}\n\n${playerName}: ${userInput}\n\nResponde SIEMPRE en ESPAÑOL como si fueras Trash, el narrador mágico. [/INST]`;
        
        try {
            console.log("Enviando solicitud a Hugging Face para el modelo: " + this.huggingFaceModel);
            
            // Construir la URL completa
            const fullEndpoint = `${this.huggingFaceAPIEndpoint}${this.huggingFaceModel}`;
            console.log("URL de la API: " + fullEndpoint);
            console.log("Enviando formato de texto, no de chat");
            
            // Llamar a la API con el formato correcto para Mixtral
            const response = await fetch(fullEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.huggingFaceToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,  // Ahora enviamos un string, no un array
                    parameters: {
                        max_new_tokens: 250,
                        return_full_text: false,
                        temperature: 0.75,
                        top_p: 0.9,
                        do_sample: true
                    }
                })
            });
            
            console.log("Respuesta recibida con status: " + response.status);
            
            if (response.status === 401 || response.status === 403) {
                console.error("Error de autenticación con la API de Hugging Face");
                this.tokenError = true; // Marcar que hay un problema con el token para no intentar más llamadas
                throw new Error(`Error de autenticación: ${response.status}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error de API detallado:", errorText);
                throw new Error(`Error de API: ${response.status} - ${errorText}`);
            }

            // Obtener los datos de respuesta
            let data;
            const responseText = await response.text();
            try {
                data = JSON.parse(responseText);
                console.log("Datos recibidos de Hugging Face:", data);
            } catch (jsonError) {
                console.error("Error al parsear la respuesta JSON:", jsonError);
                console.log("Respuesta en texto plano:", responseText);
                data = { generated_text: responseText };
            }
            
            // Extraer el texto generado (el modelo Qwen tiene un formato específico)
            let generatedText = '';
            
            // Extraer según diferentes formatos posibles de respuesta
            if (data && data.generated_text) {
                // Formato estándar
                generatedText = data.generated_text;
            } else if (Array.isArray(data) && data[0] && data[0].generated_text) {
                // Formato array
                generatedText = data[0].generated_text;
            } else if (data && data.choices && data.choices[0] && data.choices[0].message) {
                // Formato tipo OpenAI que algunos modelos usan
                generatedText = data.choices[0].message.content;
            } else if (data && data.content) {
                // Formato simple con content
                generatedText = data.content;
            } else if (data && data.message && data.message.content) {
                // Formato tipo chat
                generatedText = data.message.content;
            } else if (typeof data === 'string') {
                // Respuesta directa como string
                generatedText = data;
            } else {
                // Si no podemos extraer el texto de una forma específica
                generatedText = JSON.stringify(data);
            }

            console.log("Texto generado final:", generatedText);

            // Limpiar y formatear la respuesta
            let cleanResponse = this.cleanHuggingFaceResponse(generatedText);
            
            // Guardar en el historial
            this.memory.huggingFaceHistory.push({
                role: "assistant",
                content: cleanResponse
            });

            return cleanResponse;

        } catch (error) {
            console.error("Error al llamar a la API de Hugging Face:", error);
            throw error; // Permitir que el fallback se active
        }
    }

    /**
     * Limpia y formatea la respuesta de la API para mostrarla
     * @param {string} response - Respuesta de la API
     * @returns {string} - Respuesta limpia
     */
    cleanHuggingFaceResponse(response) {
        // Si la respuesta está en formato JSON (como string), intentar extraer el texto
        let cleaned = response;
        
        try {
            // Comprobar si la respuesta es un JSON en formato string
            if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
                const jsonData = JSON.parse(cleaned);
                if (jsonData.message && jsonData.message.content) {
                    cleaned = jsonData.message.content;
                } else if (jsonData.generated_text) {
                    cleaned = jsonData.generated_text;
                } else if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].message) {
                    cleaned = jsonData.choices[0].message.content;
                }
            }
        } catch (e) {
            // Si hay error al parsear, seguimos con el texto original
            console.log("No se pudo parsear la respuesta como JSON");
        }
        
        // Eliminar marcadores de rol o formato extraño
        cleaned = cleaned.replace(/^(assistant|AI|bot|trash|narrador trash|narrador):\s*/i, '');
        
        // Cortar la respuesta si continúa con un diálogo
        const dialogueCutoff = cleaned.indexOf('\n' + this.playerCharacter.getDisplayName() + ':');
        if (dialogueCutoff > 0) {
            cleaned = cleaned.substring(0, dialogueCutoff);
        }
        
        // También cortar si hay otros marcadores de inicio de un nuevo turno
        const userMarkers = ['\nUser:', '\nUsuario:', '\nPlayer:', '\nJugador:'];
        for (const marker of userMarkers) {
            const markerIndex = cleaned.indexOf(marker);
            if (markerIndex > 0) {
                cleaned = cleaned.substring(0, markerIndex);
            }
        }
        
        // Detectar si la respuesta está en inglés
        const englishWords = ['the', 'and', 'is', 'in', 'of', 'to', 'a', 'for', 'with', 'that', 'this', 'it', 'you', 'are', 'your', 'I', 'would', 'like', 'can', 'will'];
        const words = cleaned.toLowerCase().split(/\s+/);
        const englishWordCount = words.filter(word => englishWords.includes(word)).length;
        
        if (englishWordCount > words.length * 0.3 && words.length > 5) {
            console.log("Respuesta detectada en inglés, usando respuesta en español");
            return this.getRandomResponse('default');
        }
        
        // Si la respuesta está vacía o es inválida, proporcionar un mensaje predeterminado
        if (!cleaned || cleaned.trim() === '') {
            return "¡Vaya! Parece que me quedé sin palabras por un momento. ¿En qué tipo de aventura estábamos?";
        }
        
        // Verificar que la respuesta es lo suficientemente larga y coherente
        if (cleaned.length < 15) {
            return this.getRandomResponse('default');
        }
        
        return cleaned;
    }
    
    /**
     * Simula el efecto de escritura gradual
     */
    async simulateTyping(messageIndex, text) {
        const chunks = this.chunkText(text, 15);
        for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70));
            this.messages[messageIndex].content += chunk;
            this.renderMessages();
        }
    }
    
    /**
     * Analiza el mensaje del usuario para determinar contexto y sentimiento
     */
    analyzeMessage(userInput) {
        const lowerInput = userInput.toLowerCase();
        
        // Objeto de resultado del análisis
        const result = {
            isGreeting: false,
            isQuestion: false,
            sentiment: 'neutral', // positive, negative, neutral
            detectedGames: [],
            keywords: []
        };
        
        // Detectar saludos
        const greetings = ['hola', 'saludos', 'buenos días', 'buenas tardes', 'buenas noches', 'qué tal', 'cómo estás', 'hey'];
        result.isGreeting = greetings.some(g => lowerInput.includes(g));
        
        // Detectar preguntas
        result.isQuestion = lowerInput.includes('?') || 
                          ['qué', 'cómo', 'cuándo', 'cuál', 'dónde', 'por qué', 'qué es', 'cuántos'].some(q => lowerInput.includes(q));
        
        // Detectar sentimiento
        const negativeTerms = ['no me gusta', 'aburrido', 'aburre', 'aburrida', 'malo', 'mala', 'no quiero', 'no sirve', 'no es bueno', 'odio', 'detesto', 'fastidioso'];
        
        const positiveTerms = ['me gusta', 'bueno', 'buena', 'excelente', 'genial', 'divertido', 'interesante', 'fantástico', 'increíble', 'amo', 'encanta', 'maravilloso'];
        
        if (negativeTerms.some(term => lowerInput.includes(term))) {
            result.sentiment = 'negative';
        } else if (positiveTerms.some(term => lowerInput.includes(term))) {
            result.sentiment = 'positive';
        }
        
        // Detectar juegos mencionados
        result.detectedGames = this.detectGames(userInput);
        
        // Extraer palabras clave para futuro análisis
        const significantWords = lowerInput.split(/\s+/).filter(word => 
            word.length > 3 && 
            !['como', 'para', 'este', 'esta', 'estos', 'estas', 'pero', 'porque', 'aunque'].includes(word)
        );
        
        result.keywords = significantWords;
        
        return result;
    }
    
    /**
     * Construye una respuesta contextual basada en el análisis del mensaje
     */
    buildResponse(messageContext, suggestedGames) {
        let responseType = 'default';
        let intro = '';
        
        // Determinar el tipo de respuesta según el contexto
        if (messageContext.isGreeting) {
            responseType = 'greeting';
        } else if (messageContext.isQuestion) {
            responseType = 'question';
        } else if (messageContext.sentiment === 'positive') {
            responseType = 'positive';
        } else if (messageContext.sentiment === 'negative') {
            responseType = 'negative';
        } else if (this.memory.conversationCount <= 1) {
            responseType = 'intro';  // Primera interacción
        }
        
        // Obtener una introducción apropiada
        intro = this.getRandomResponse(responseType);
        
        // Preparar descripciones de juegos sugeridos
        const gameDescriptions = suggestedGames.map(gameId => {
            // Marcar juegos que coinciden con los intereses detectados
            return `${this.getGameNameFromId(gameId)}: ${this.gameStories[gameId]}`;
        }).join("\n\n");
        
        // Construir respuesta final
        let response = '';
        
        if (messageContext.sentiment === 'negative') {
            // Respuesta para sentimiento negativo
            response = `${intro}\n\n${gameDescriptions}`;
        } else if (suggestedGames.length > 0) {
            // Respuesta con juegos sugeridos
            if (messageContext.detectedGames.length > 0) {
                // Si mencionó juegos específicos
                const gamesText = messageContext.detectedGames.length === 1 ? 
                    this.getGameNameFromId(messageContext.detectedGames[0]) : 
                    'estas aventuras';
                    
                response = `${intro} ${gamesText}\n\n${gameDescriptions}`;
            } else {
                // Sugerencias generales
                const suggestionIntro = this.getRandomResponse('suggestion');
                response = `${intro}\n\n${suggestionIntro}\n\n${gameDescriptions}`;
            }
        } else {
            // Respuesta genérica sin sugerencias
            response = intro;
        }
        
        return response;
    }
    
    /**
     * Obtiene juegos sugeridos basándonos en preferencias del usuario y contexto
     */
    getSuggestedGames(count = 3, gamesToExclude = []) {
        const allGames = Object.keys(this.gameStories);
        const result = [];
        
        // Convertir a arrays para manipulación más fácil
        const userPreferencesArray = Array.from(this.memory.userPreferences);
        const excludedGamesArray = Array.from(this.memory.negativePreferences).concat(gamesToExclude);
        
        // 1. Primero intentar con juegos que le gustan al usuario
        if (userPreferencesArray.length > 0 && result.length < count) {
            for (const game of userPreferencesArray) {
                if (!excludedGamesArray.includes(game) && !result.includes(game)) {
                    result.push(game);
                    if (result.length >= count) break;
                }
            }
        }
        
        // 2. Completar con juegos aleatorios que no hayan sido excluidos
        if (result.length < count) {
            // Filtrar juegos ya incluidos o excluidos
            const availableGames = allGames.filter(game => 
                !result.includes(game) && 
                !excludedGamesArray.includes(game));
                
            // Si no quedan juegos disponibles, usar todos (ignorando exclusiones)
            const gamesToChooseFrom = availableGames.length > 0 ? 
                availableGames : 
                allGames.filter(game => !result.includes(game));
            
            // Seleccionar aleatoriamente
            while (result.length < count && gamesToChooseFrom.length > 0) {
                const randomIndex = Math.floor(Math.random() * gamesToChooseFrom.length);
                const selectedGame = gamesToChooseFrom[randomIndex];
                
                result.push(selectedGame);
                
                // Eliminar el juego seleccionado para evitar duplicados
                gamesToChooseFrom.splice(randomIndex, 1);
            }
        }
        
        return result;
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
