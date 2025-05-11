/**
 * Sistema de Control Parental para Croissant Adventure
 * Proporciona funcionalidades de límite de tiempo y tareas educativas
 */
class ParentalControl {
    constructor() {
        this.enabled = localStorage.getItem('parentalControlEnabled') === 'true';
        this.playTimeLimit = parseInt(localStorage.getItem('playTimeLimit')) || 30; // Minutos
        this.taskDescription = localStorage.getItem('taskDescription') || 'Completar una actividad educativa';
        this.playTimeEnd = parseInt(localStorage.getItem('playTimeEnd')) || 0;
        this.timerInterval = null;
        this.timerElement = null;
        this.containerElement = null;
        
        // Inicializar si está habilitado
        if (this.enabled) {
            this.initialize();
        }
    }
    
    /**
     * Inicializa el sistema de control parental
     */
    initialize() {
        console.log("Inicializando sistema de control parental...");
        
        // Si el tiempo ya expiró, mostrar pantalla de tarea inmediatamente
        const currentTime = new Date().getTime();
        if (currentTime >= this.playTimeEnd) {
            this.showTaskScreen();
            return;
        }
        
        // Crear elementos de interfaz
        this.createTimerInterface();
        
        // Iniciar el temporizador
        this.startTimer();
        
        console.log(`Control parental inicializado. Tiempo restante: ${this.formatTimeRemaining()}`);
    }
    
    /**
     * Crea la interfaz del temporizador
     */
    createTimerInterface() {
        // Si ya existe, no crear de nuevo
        if (this.containerElement) return;
        
        // Crear contenedor principal
        this.containerElement = document.createElement('div');
        this.containerElement.className = 'parental-timer-container';
        this.containerElement.style.position = 'fixed';
        this.containerElement.style.top = '10px';
        this.containerElement.style.right = '10px';
        this.containerElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        this.containerElement.style.padding = '10px 15px';
        this.containerElement.style.borderRadius = '20px';
        this.containerElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        this.containerElement.style.zIndex = '1000';
        this.containerElement.style.fontFamily = "'Baloo 2', cursive";
        this.containerElement.style.display = 'flex';
        this.containerElement.style.alignItems = 'center';
        this.containerElement.style.transition = 'all 0.3s ease';
        
        // Icono de reloj
        const clockIcon = document.createElement('div');
        clockIcon.innerHTML = '⏰';
        clockIcon.style.marginRight = '8px';
        clockIcon.style.fontSize = '24px';
        
        // Elemento para mostrar el tiempo
        this.timerElement = document.createElement('div');
        this.timerElement.className = 'parental-timer';
        this.timerElement.style.color = '#5c4a38';
        this.timerElement.style.fontWeight = 'bold';
        this.timerElement.textContent = this.formatTimeRemaining();
        
        // Añadir elementos al contenedor
        this.containerElement.appendChild(clockIcon);
        this.containerElement.appendChild(this.timerElement);
        
        // Añadir contenedor al cuerpo del documento
        document.body.appendChild(this.containerElement);
    }
    
    /**
     * Inicia el temporizador
     */
    startTimer() {
        // Limpiar intervalo anterior si existe
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Actualizar el temporizador cada segundo
        this.timerInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const timeRemaining = this.playTimeEnd - currentTime;
            
            // Si se acabó el tiempo
            if (timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.showTaskScreen();
                return;
            }
            
            // Actualizar el contador de tiempo
            if (this.timerElement) {
                this.timerElement.textContent = this.formatTimeRemaining();
                
                // Cambiar color cuando queda poco tiempo
                if (timeRemaining < 5 * 60 * 1000) { // Menos de 5 minutos
                    this.timerElement.style.color = '#ef476f'; // Color de advertencia
                    this.containerElement.style.backgroundColor = 'rgba(255, 230, 230, 0.95)';
                    
                    // Animación de parpadeo cuando queda poco tiempo
                    if (timeRemaining < 60 * 1000) { // Menos de 1 minuto
                        this.containerElement.style.animation = 'timerBlink 1s infinite';
                        
                        // Añadir CSS de animación si no existe
                        if (!document.getElementById('timer-blink-animation')) {
                            const style = document.createElement('style');
                            style.id = 'timer-blink-animation';
                            style.innerHTML = `
                                @keyframes timerBlink {
                                    0%, 100% { opacity: 1; transform: scale(1); }
                                    50% { opacity: 0.8; transform: scale(1.05); }
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    }
                }
            }
        }, 1000);
    }
    
    /**
     * Formatea el tiempo restante en formato mm:ss
     */
    formatTimeRemaining() {
        const currentTime = new Date().getTime();
        const timeRemaining = Math.max(0, this.playTimeEnd - currentTime);
        
        const minutes = Math.floor(timeRemaining / (60 * 1000));
        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Muestra la pantalla de tarea
     */
    showTaskScreen() {
        console.log("Tiempo agotado. Mostrando pantalla de tarea.");
        
        // Crear elementos de la pantalla de tarea
        const overlay = document.createElement('div');
        overlay.className = 'task-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(255, 250, 240, 0.98)';
        overlay.style.zIndex = '2000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.flexDirection = 'column';
        overlay.style.padding = '20px';
        overlay.style.fontFamily = "'Baloo 2', cursive";
        
        // Contenido de la pantalla
        const content = document.createElement('div');
        content.className = 'task-content';
        content.style.backgroundColor = 'white';
        content.style.borderRadius = '20px';
        content.style.padding = '30px';
        content.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.2)';
        content.style.maxWidth = '600px';
        content.style.width = '90%';
        content.style.textAlign = 'center';
        
        // Título
        const title = document.createElement('h2');
        title.textContent = '¡Tiempo de juego completado!';
        title.style.color = '#ef476f';
        title.style.marginBottom = '20px';
        
        // Imagen decorativa
        const image = document.createElement('div');
        image.style.fontSize = '80px';
        image.style.marginBottom = '20px';
        image.innerHTML = '📚✏️🧩';
        
        // Descripción de la tarea
        const taskDesc = document.createElement('p');
        taskDesc.textContent = 'Antes de seguir jugando, debes completar esta tarea:';
        taskDesc.style.marginBottom = '10px';
        
        // Tarea
        const task = document.createElement('div');
        task.textContent = this.taskDescription;
        task.style.fontWeight = 'bold';
        task.style.fontSize = '18px';
        task.style.padding = '15px';
        task.style.margin = '10px 0 30px';
        task.style.backgroundColor = 'rgba(255, 217, 102, 0.3)';
        task.style.borderRadius = '10px';
        
        // Formulario de verificación
        const form = document.createElement('div');
        
        // Campo de contraseña
        const passwordLabel = document.createElement('label');
        passwordLabel.textContent = 'Contraseña parental:';
        passwordLabel.style.display = 'block';
        passwordLabel.style.marginBottom = '5px';
        
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Ingresa la contraseña parental...';
        passwordInput.style.width = '100%';
        passwordInput.style.padding = '10px';
        passwordInput.style.borderRadius = '10px';
        passwordInput.style.border = '1px solid #ddd';
        passwordInput.style.marginBottom = '20px';
        
        // Botón de verificación
        const verifyButton = document.createElement('button');
        verifyButton.textContent = 'He completado la tarea';
        verifyButton.style.backgroundColor = '#ffd166';
        verifyButton.style.border = 'none';
        verifyButton.style.padding = '10px 20px';
        verifyButton.style.borderRadius = '10px';
        verifyButton.style.fontFamily = "'Baloo 2', cursive";
        verifyButton.style.fontSize = '16px';
        verifyButton.style.cursor = 'pointer';
        verifyButton.style.transition = 'all 0.3s ease';
        
        // Mensaje de error
        const errorMessage = document.createElement('div');
        errorMessage.style.color = '#ef476f';
        errorMessage.style.marginTop = '10px';
        errorMessage.style.display = 'none';
        
        // Evento del botón
        verifyButton.addEventListener('click', () => {
            const password = passwordInput.value.trim();
            // Verificar con la contraseña usada en el login (admin)
            if (password === 'admin') {
                // Extender el tiempo de juego
                const playTimeInMinutes = parseInt(localStorage.getItem('playTimeLimit')) || 30;
                const currentTime = new Date().getTime();
                const newEndTime = currentTime + (playTimeInMinutes * 60 * 1000);
                localStorage.setItem('playTimeEnd', newEndTime.toString());
                
                // Reiniciar el temporizador
                this.playTimeEnd = newEndTime;
                if (this.timerElement) {
                    this.timerElement.textContent = this.formatTimeRemaining();
                    this.timerElement.style.color = '#5c4a38';
                    this.containerElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    this.containerElement.style.animation = 'none';
                }
                
                // Iniciar temporizador
                this.startTimer();
                
                // Eliminar pantalla de tarea
                document.body.removeChild(overlay);
                
                console.log(`Tarea completada. Tiempo extendido por ${playTimeInMinutes} minutos más.`);
            } else {
                // Mostrar error
                errorMessage.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
                errorMessage.style.display = 'block';
                
                // Animar botón de error
                verifyButton.style.backgroundColor = '#ef476f';
                verifyButton.style.transform = 'translateX(0)';
                verifyButton.style.animation = 'shake 0.5s ease-in-out';
                
                setTimeout(() => {
                    verifyButton.style.backgroundColor = '#ffd166';
                    verifyButton.style.animation = 'none';
                }, 500);
            }
        });
        
        // Añadir elementos al formulario
        form.appendChild(passwordLabel);
        form.appendChild(passwordInput);
        form.appendChild(verifyButton);
        form.appendChild(errorMessage);
        
        // Añadir todos los elementos al contenido
        content.appendChild(title);
        content.appendChild(image);
        content.appendChild(taskDesc);
        content.appendChild(task);
        content.appendChild(form);
        
        // Añadir contenido al overlay
        overlay.appendChild(content);
        
        // Añadir overlay al cuerpo del documento
        document.body.appendChild(overlay);
        
        // Definir la animación de sacudida
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-10px); }
                40%, 80% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
        
        // Enfocar el campo de contraseña
        setTimeout(() => {
            passwordInput.focus();
        }, 100);
    }
}

// Inicializar el sistema de control parental cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.parentalControl = new ParentalControl();
});
