/**
 * Interfaz para el chat con la IA narradora
 * Se encarga de gestionar la interfaz de usuario del chat
 */
class ChatInterface {
    constructor() {
        this.storyteller = new StorytellerAI();
        this.initialized = false;
        this.sendButton = null;
        this.userInput = null;
    }
    
    /**
     * Inicializa la interfaz del chat
     */
    async initialize() {
        if (this.initialized) return;
        
        // Crear elementos de la interfaz
        this.createChatInterface();
        
        // Obtener referencias a los elementos
        this.sendButton = document.getElementById('send-button');
        this.userInput = document.getElementById('user-input');
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Inicializar el modelo de IA
        await this.storyteller.initialize();
        
        this.initialized = true;
        console.log("Interfaz de chat inicializada");
    }
    
    /**
     * Crea la estructura HTML para la interfaz del chat
     */
    createChatInterface() {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) {
            console.error("No se encuentra el contenedor del chat");
            return;
        }
        
        // Limpiar contenido anterior
        chatContainer.innerHTML = '';
        
        // Obtener información del personaje seleccionado por el usuario
        const playerChar = window.playerCharacter || { getDisplayName: () => 'Croiso', getImage: () => 'croiso.png', character: 'croiso' };
        const characterName = playerChar.getDisplayName();
        const characterImage = playerChar.getImage();
        
        // Crear estructura del chat con Trash y el personaje del jugador
        const chatHTML = `
            <div class="ai-chat-container">
                <div class="ai-chat-header">
                    <div class="chat-characters">
                        <img src="trash.png" alt="Trash" class="character-avatar trash-avatar">
                        <h2>Conversación con <span class="player-character-name">${characterName}</span></h2>
                    </div>
                    <div id="ai-status" class="ai-status">Inicializando...</div>
                </div>
                <div id="chat-messages"></div>
                <div id="game-options"></div>
                <div class="ai-chat-input">
                    <input type="text" id="user-input" placeholder="Habla con ${characterName}..." autocomplete="off">
                    <button id="send-button" disabled>Enviar</button>
                </div>
            </div>
        `;
        
        chatContainer.innerHTML = chatHTML;
    }
    
    /**
     * Configura los eventos para la interacción con el chat
     */
    setupEventListeners() {
        // Verificar que los elementos existan
        if (!this.sendButton || !this.userInput) {
            this.sendButton = document.getElementById('send-button');
            this.userInput = document.getElementById('user-input');
            
            if (!this.sendButton || !this.userInput) {
                console.error("No se pueden encontrar los elementos de la interfaz");
                return;
            }
        }
        
        // Evento de envío de mensaje
        this.sendButton.addEventListener('click', () => {
            this.sendUserMessage();
        });
        
        // Enviar mensaje con Enter
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendUserMessage();
            }
        });
        
        // Habilitar/deshabilitar botón según contenido del input
        this.userInput.addEventListener('input', () => {
            this.sendButton.disabled = !this.userInput.value.trim();
        });
        
        // Verificar el estado del sistema periódicamente
        const checkSystemStatus = () => {
            if (this.storyteller.initialized) {
                this.sendButton.disabled = !this.userInput.value.trim();
                this.userInput.disabled = false;
                this.userInput.placeholder = "Cuéntame qué aventura buscas...";
            } else {
                this.sendButton.disabled = true;
                this.userInput.disabled = true;
                this.userInput.placeholder = "Esperando a que el narrador esté listo...";
            }
        };
        
        // Verificar el estado cada segundo
        setInterval(checkSystemStatus, 1000);
    }
    
    /**
     * Envía el mensaje del usuario a la IA
     */
    async sendUserMessage() {
        const userMessage = this.userInput.value.trim();
        if (!userMessage) return;
        
        // Limpiar input
        this.userInput.value = '';
        this.sendButton.disabled = true;
        
        // Añadir el avatar de Trash en el mensaje de respuesta
        // Enviar mensaje a la IA de Croiso
        try {
            await this.storyteller.processUserMessage(userMessage);
        } catch (error) {
            console.error("Error al procesar mensaje:", error);
        }
        
        // Habilitar input para siguiente mensaje
        this.sendButton.disabled = false;
        this.userInput.focus();
    }
}
