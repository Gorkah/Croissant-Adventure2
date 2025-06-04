/**
 * Sistema de Control Parental para Croissant Adventure
 * Proporciona funcionalidades de límite de tiempo y tareas educativas adaptativas
 */
class ParentalControl {
    constructor() {
        console.log('Construyendo ParentalControl');
        this.enabled = localStorage.getItem('parentalControlEnabled') === 'true';
        console.log('Control parental habilitado:', this.enabled);
        
        this.playTimeLimit = parseInt(localStorage.getItem('playTimeLimit')) || 30; // Minutos
        this.taskDescription = localStorage.getItem('taskDescription') || 'Completar una actividad educativa';
        this.playTimeEnd = parseInt(localStorage.getItem('playTimeEnd')) || 0;
        this.childAge = parseInt(localStorage.getItem('childAge')) || 8; // Edad por defecto
        this.customTasks = JSON.parse(localStorage.getItem('customTasks')) || []; // Tareas extra añadidas en el login
        this.timerInterval = null;
        this.timerElement = null;
        this.containerElement = null;
        this.currentTask = null;
        this.taskResult = null;
        
        // Forzar inicialización después de un breve retraso para asegurar que el DOM esté listo
        setTimeout(() => {
            if (this.enabled) {
                console.log('Inicializando control parental con retraso...');
                this.initialize();
            }
        }, 500);
    }
    
    /**
     * Inicializa el sistema de control parental
     */
    initialize() {
        console.log("Inicializando sistema de control parental...");
        
        // Siempre crear la interfaz primero
        this.createTimerInterface();
        
        // Si el tiempo ya expiró, mostrar pantalla de tarea inmediatamente
        const currentTime = new Date().getTime();
        if (currentTime >= this.playTimeEnd) {
            console.log("Tiempo expirado, mostrando pantalla de tareas");
            // Primero mostrar el temporizador en 0:00
            if (this.timerElement) {
                this.timerElement.textContent = "0:00";
                this.timerElement.style.color = '#ef476f';
            }
            // Luego mostrar la pantalla de tareas
            setTimeout(() => {
                this.showTaskScreen();
            }, 500);
            return;
        }
        
        // Iniciar el temporizador
        this.startTimer();
        
        console.log(`Control parental inicializado. Tiempo restante: ${this.formatTimeRemaining()}`);
    }
    
    /**
     * Crea la interfaz del temporizador
     */
    createTimerInterface() {
        console.log('Creando interfaz de temporizador...');
        
        // Eliminar el contenedor anterior si existe
        if (this.containerElement) {
            try {
                document.body.removeChild(this.containerElement);
            } catch (e) {
                console.log('No se pudo eliminar el contenedor anterior:', e);
            }
            this.containerElement = null;
            this.timerElement = null;
        }
        
        // Crear contenedor principal con estilo destacado
        this.containerElement = document.createElement('div');
        this.containerElement.className = 'parental-timer-container';
        this.containerElement.style.position = 'fixed';
        this.containerElement.style.top = '10px';
        this.containerElement.style.right = '10px';
        this.containerElement.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        this.containerElement.style.padding = '10px 15px';
        this.containerElement.style.borderRadius = '20px';
        this.containerElement.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        this.containerElement.style.zIndex = '9999'; // Valor más alto para asegurar que esté encima
        this.containerElement.style.fontFamily = "'Baloo 2', cursive";
        this.containerElement.style.display = 'flex';
        this.containerElement.style.alignItems = 'center';
        this.containerElement.style.transition = 'all 0.3s ease';
        this.containerElement.style.border = '2px solid #ffd166';
        
        // Icono de reloj más visible
        const clockIcon = document.createElement('div');
        clockIcon.innerHTML = '⏰';
        clockIcon.style.marginRight = '8px';
        clockIcon.style.fontSize = '24px';
        
        // Elemento para mostrar el tiempo con estilo más visible
        this.timerElement = document.createElement('div');
        this.timerElement.className = 'parental-timer';
        this.timerElement.style.color = '#5c4a38';
        this.timerElement.style.fontWeight = 'bold';
        this.timerElement.style.fontSize = '16px';
        this.timerElement.textContent = this.formatTimeRemaining();
        
        // Añadir elementos al contenedor
        this.containerElement.appendChild(clockIcon);
        this.containerElement.appendChild(this.timerElement);
        
        // Añadir contenedor al cuerpo del documento
        document.body.appendChild(this.containerElement);
        
        console.log('Interfaz de temporizador creada:', this.timerElement.textContent);
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
     * Genera una actividad de caligrafía adaptada a la edad
     * @returns {Object} Actividad generada
     */
    generateWritingActivity() {
        const age = this.childAge;
        let activity = {
            type: 'writing',
            icon: '✏️',
            title: 'Práctica de Caligrafía',
            instruction: '',
            content: '',
            difficulty: 'media'
        };
        
        if (age <= 6) {
            // Niños pequeños: letras simples
            activity.instruction = 'Escribe las siguientes letras en el recuadro:';
            activity.content = 'A B C D E F G H I';
            activity.difficulty = 'fácil';
        } else if (age <= 9) {
            // Niños medianos: palabras cortas
            activity.instruction = 'Escribe las siguientes palabras en el recuadro:';
            activity.content = 'Sol, Casa, Amigo, Juego, Dulce';
            activity.difficulty = 'media';
        } else if (age <= 12) {
            // Pre-adolescentes: frases cortas
            activity.instruction = 'Escribe la siguiente frase en el recuadro:';
            activity.content = 'La aventura es divertida cuando aprendemos cosas nuevas cada día.';
            activity.difficulty = 'media';
        } else {
            // Adolescentes: párrafos
            activity.instruction = 'Escribe el siguiente párrafo en el recuadro:';
            activity.content = 'La educación es el arma más poderosa que puedes usar para cambiar el mundo. Un buen libro y una buena pluma pueden llevarte a lugares increíbles.';
            activity.difficulty = 'avanzada';
        }
        
        return activity;
    }
    
    /**
     * Genera una actividad matemática adaptada a la edad
     * @returns {Object} Actividad generada
     */
    generateMathActivity() {
        const age = this.childAge;
        let activity = {
            type: 'math',
            icon: '📓',
            title: 'Desafío Matemático',
            instruction: '',
            questions: [],
            answers: [],
            difficulty: 'media'
        };
        
        if (age <= 6) {
            // Niños pequeños: sumas y restas simples
            activity.instruction = 'Resuelve estas operaciones:';
            activity.questions = ['2 + 3 = ?', '5 - 2 = ?', '1 + 4 = ?', '6 - 3 = ?'];
            activity.answers = ['5', '3', '5', '3'];
            activity.difficulty = 'fácil';
        } else if (age <= 9) {
            // Niños medianos: multiplicación y división básica
            activity.instruction = 'Resuelve estas operaciones:';
            activity.questions = ['4 × 3 = ?', '10 ÷ 2 = ?', '5 × 6 = ?', '12 ÷ 4 = ?'];
            activity.answers = ['12', '5', '30', '3'];
            activity.difficulty = 'media';
        } else if (age <= 12) {
            // Pre-adolescentes: ecuaciones simples
            activity.instruction = 'Resuelve estas ecuaciones:';
            activity.questions = ['x + 5 = 12', '15 - y = 7', '3z = 18', '20 ÷ w = 4'];
            activity.answers = ['7', '8', '6', '5'];
            activity.difficulty = 'media';
        } else {
            // Adolescentes: problemas matemáticos
            activity.instruction = 'Resuelve estos problemas:';
            activity.questions = [
                'Si tienes 15 croissants y das 2/5 del total, ¿cuántos te quedan?',
                'Un tren viaja a 60 km/h. ¿Cuánto tardará en recorrer 150 km?',
                'Si 3x + 7 = 22, ¿cuál es el valor de x?'
            ];
            activity.answers = ['9', '2.5', '5'];
            activity.difficulty = 'avanzada';
        }
        
        return activity;
    }
    
    /**
     * Genera una actividad de puzzle mental adaptada a la edad
     * @returns {Object} Actividad generada
     */
    generatePuzzleActivity() {
        const age = this.childAge;
        let activity = {
            type: 'puzzle',
            icon: '🧩',
            title: 'Desafío Mental',
            instruction: '',
            content: '',
            options: [],
            answer: '',
            difficulty: 'media'
        };
        
        if (age <= 6) {
            // Niños pequeños: patrones simples
            activity.instruction = '¿Qué figura sigue en la secuencia?';
            activity.content = '⬛ ⬜ ⬛ ⬜ ⬛ ?';
            activity.options = ['⬛', '⬜'];
            activity.answer = '⬜';
            activity.difficulty = 'fácil';
        } else if (age <= 9) {
            // Niños medianos: secuencias numéricas
            activity.instruction = '¿Qué número sigue en la secuencia?';
            activity.content = '2, 4, 6, 8, ?';
            activity.options = ['9', '10', '12'];
            activity.answer = '10';
            activity.difficulty = 'media';
        } else if (age <= 12) {
            // Pre-adolescentes: acertijos simples
            activity.instruction = 'Resuelve este acertijo:';
            activity.content = 'Soy un número. Si me sumas 2, obtienes el doble de 5. ¿Qué número soy?';
            activity.options = ['3', '8', '10'];
            activity.answer = '8';
            activity.difficulty = 'media';
        } else {
            // Adolescentes: problemas de lógica
            activity.instruction = 'Resuelve este problema de lógica:';
            activity.content = 'Ana es más alta que María pero más baja que Sofía. Elena es más alta que Sofía. ¿Quién es la más alta de todas?';
            activity.options = ['Ana', 'María', 'Sofía', 'Elena'];
            activity.answer = 'Elena';
            activity.difficulty = 'avanzada';
        }
        
        return activity;
    }
    
    /**
     * Muestra la pantalla de selección de actividades educativas
     */
    showTaskScreen() {
        console.log("Tiempo agotado. Mostrando pantalla de actividades educativas.");
        
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
        
        // Descripción
        const taskDesc = document.createElement('p');
        taskDesc.textContent = 'Para seguir jugando, selecciona una actividad educativa:';
        taskDesc.style.marginBottom = '20px';
        
        // Contenedor de actividades
        const activitiesContainer = document.createElement('div');
        activitiesContainer.style.display = 'flex';
        activitiesContainer.style.justifyContent = 'center';
        activitiesContainer.style.gap = '15px';
        activitiesContainer.style.marginBottom = '30px';
        activitiesContainer.style.flexWrap = 'wrap';
        
        // Generar las tres actividades
        const writingActivity = this.generateWritingActivity();
        const mathActivity = this.generateMathActivity();
        const puzzleActivity = this.generatePuzzleActivity();
        
        // Array de actividades que incluye las predefinidas
        let activities = [writingActivity, mathActivity, puzzleActivity];
        
        // Añadir tareas personalizadas si existen
        if (this.customTasks && this.customTasks.length > 0) {
            for (const customTask of this.customTasks) {
                // Solo añadir si la descripción de tarea no está vacía
                if (customTask && customTask.description && customTask.description.trim() !== '') {
                    activities.push({
                        type: 'custom',
                        icon: '📝',
                        title: 'Tarea extra',
                        instruction: customTask.description || 'Completa la tarea extra',
                        content: '',
                        difficulty: 'personalizada'
                    });
                }
            }
        }
        
        // Crear tarjetas para cada actividad
        activities.forEach(activity => {
            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            activityCard.style.width = '120px';
            activityCard.style.height = '150px';
            activityCard.style.backgroundColor = '#f8f9fa';
            activityCard.style.borderRadius = '15px';
            activityCard.style.padding = '15px';
            activityCard.style.display = 'flex';
            activityCard.style.flexDirection = 'column';
            activityCard.style.alignItems = 'center';
            activityCard.style.justifyContent = 'center';
            activityCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            activityCard.style.cursor = 'pointer';
            activityCard.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            activityCard.setAttribute('data-activity-type', activity.type);
            
            // Icono
            const icon = document.createElement('div');
            icon.style.fontSize = '40px';
            icon.style.marginBottom = '10px';
            icon.textContent = activity.icon;
            
            // Nombre
            const name = document.createElement('div');
            name.style.fontWeight = 'bold';
            name.style.fontSize = '14px';
            name.textContent = activity.title;
            
            // Dificultad
            const difficulty = document.createElement('div');
            difficulty.style.fontSize = '12px';
            difficulty.style.color = '#6c757d';
            difficulty.textContent = `Dificultad: ${activity.difficulty}`;
            
            // Efecto hover
            activityCard.addEventListener('mouseover', () => {
                activityCard.style.transform = 'translateY(-5px)';
                activityCard.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
            });
            
            activityCard.addEventListener('mouseout', () => {
                activityCard.style.transform = 'translateY(0)';
                activityCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            });
            
            // Añadir evento de clic
            activityCard.addEventListener('click', () => {
                this.showSpecificActivity(activity, overlay, content);
            });
            
            // Añadir elementos a la tarjeta
            activityCard.appendChild(icon);
            activityCard.appendChild(name);
            activityCard.appendChild(difficulty);
            
            // Añadir tarjeta al contenedor
            activitiesContainer.appendChild(activityCard);
        });
        
        // Añadir opción de usar contraseña parental (para padres)
        const passwordOption = document.createElement('div');
        passwordOption.style.marginTop = '20px';
        passwordOption.style.fontSize = '14px';
        passwordOption.style.color = '#6c757d';
        passwordOption.style.cursor = 'pointer';
        passwordOption.style.textDecoration = 'underline';
        passwordOption.textContent = '¿Eres el padre/madre? Usar contraseña parental';
        
        passwordOption.addEventListener('click', () => {
            this.showPasswordVerification(overlay, content);
        });
        
        // Añadir elementos al contenido
        content.appendChild(title);
        content.appendChild(taskDesc);
        content.appendChild(activitiesContainer);
        content.appendChild(passwordOption);
        
        // Añadir contenido al overlay
        overlay.appendChild(content);
        
        // Añadir overlay al cuerpo del documento
        document.body.appendChild(overlay);
    }
    
    /**
     * Muestra la pantalla de verificación de contraseña parental
     */
    showPasswordVerification(overlay, content) {
        // Crear elementos de la pantalla de verificación
        const passwordVerification = document.createElement('div');
        passwordVerification.className = 'password-verification';
        passwordVerification.style.width = '100%';
        passwordVerification.style.height = '100%';
        passwordVerification.style.display = 'flex';
        passwordVerification.style.justifyContent = 'center';
        passwordVerification.style.alignItems = 'center';
        passwordVerification.style.flexDirection = 'column';
        
        // Título
        const title = document.createElement('h2');
        title.textContent = 'Verificación de Contraseña Parental';
        title.style.color = '#ef476f';
        title.style.marginBottom = '20px';
        
        // Campo de contraseña
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
        verifyButton.textContent = 'Verificar';
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
                // Comprobar si hay una tarea personalizada en curso
                // Buscar tanto por tarjetas de actividad como por contenido de actividad
                const customActivityCard = overlay.querySelector('[data-activity-type="custom"]');
                const customActivityContent = overlay.querySelector('div[data-activity-type="custom"]');
                
                if (customActivityCard || customActivityContent) {
                    console.log('Desbloqueando tarea personalizada con contraseña parental');
                    
                    // Si hay una tarea personalizada en curso, marcarla como completada
                    if (customActivityContent) {
                        const resultMessage = overlay.querySelector('div[style*="margin-top: 15px"]');
                        if (resultMessage) {
                            resultMessage.textContent = '¡Desbloqueado con contraseña parental!';
                            resultMessage.style.backgroundColor = 'rgba(119, 221, 119, 0.3)';
                            resultMessage.style.color = '#2b9348';
                            resultMessage.style.display = 'block';
                            
                            const submitButton = overlay.querySelector('button[style*="margin-top: 20px"]');
                            if (submitButton) {
                                submitButton.disabled = true;
                                submitButton.style.backgroundColor = '#cccccc';
                            }
                            
                            // Extender el tiempo y cerrar después de un segundo
                            setTimeout(() => {
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
                                
                                console.log(`Tarea personalizada desbloqueada. Tiempo extendido por ${playTimeInMinutes} minutos más.`);
                            }, 1000);
                            return;
                        }
                    }
                }
                
                // Si no hay tarea personalizada o no se pudo desbloquear, proceder normalmente
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
        
        // Añadir elementos a la pantalla de verificación
        passwordVerification.appendChild(title);
        passwordVerification.appendChild(passwordInput);
        passwordVerification.appendChild(verifyButton);
        passwordVerification.appendChild(errorMessage);
        
        // Reemplazar contenido con pantalla de verificación
        content.innerHTML = '';
        content.appendChild(passwordVerification);
    }
    
    /**
     * Muestra la pantalla de una actividad específica
     */
    showSpecificActivity(activity, overlay, content) {
        // Crear elementos de la pantalla de la actividad
        const activityScreen = document.createElement('div');
        activityScreen.className = 'activity-screen';
        activityScreen.style.width = '100%';
        activityScreen.style.height = '100%';
        activityScreen.style.display = 'flex';
        activityScreen.style.justifyContent = 'center';
        activityScreen.style.alignItems = 'center';
        activityScreen.style.flexDirection = 'column';
        
        // Título
        const title = document.createElement('h2');
        title.textContent = activity.title;
        title.style.color = '#ef476f';
        title.style.marginBottom = '20px';
        
        // Instrucción
        const instruction = document.createElement('p');
        instruction.textContent = activity.instruction;
        instruction.style.marginBottom = '20px';
        
        // Contenido de la actividad
        let activityContent;
        if (activity.type === 'writing' || activity.type === 'custom') { // Tratar las tareas personalizadas como actividades de escritura
            activityContent = document.createElement('div');
            activityContent.style.width = '100%';
            activityContent.style.marginBottom = '20px';
            
            // Texto a escribir
            const contentToWrite = document.createElement('div');
            contentToWrite.textContent = activity.content;
            contentToWrite.style.backgroundColor = 'rgba(255, 217, 102, 0.3)';
            contentToWrite.style.padding = '10px';
            contentToWrite.style.borderRadius = '10px';
            contentToWrite.style.marginBottom = '15px';
            
            // Área de texto para escribir
            const textarea = document.createElement('textarea');
            textarea.style.width = '100%';
            textarea.style.height = '150px';
            textarea.style.padding = '10px';
            textarea.style.borderRadius = '10px';
            textarea.style.border = '1px solid #ddd';
            textarea.placeholder = 'Escribe aquí...';
            
            activityContent.appendChild(contentToWrite);
            activityContent.appendChild(textarea);
        } else if (activity.type === 'math') {
            activityContent = document.createElement('div');
            activityContent.style.display = 'flex';
            activityContent.style.flexDirection = 'column';
            activityContent.style.alignItems = 'center';
            activityContent.style.justifyContent = 'center';
            activityContent.style.width = '100%';
            
            activity.questions.forEach((question, index) => {
                const questionContainer = document.createElement('div');
                questionContainer.style.width = '100%';
                questionContainer.style.marginBottom = '15px';
                
                const questionElement = document.createElement('div');
                questionElement.textContent = question;
                questionElement.style.marginBottom = '5px';
                questionElement.style.fontWeight = 'bold';
                
                const answerInput = document.createElement('input');
                answerInput.type = 'text';
                answerInput.style.width = '100%';
                answerInput.style.padding = '10px';
                answerInput.style.borderRadius = '10px';
                answerInput.style.border = '1px solid #ddd';
                answerInput.setAttribute('data-index', index);
                answerInput.placeholder = 'Tu respuesta...';
                
                questionContainer.appendChild(questionElement);
                questionContainer.appendChild(answerInput);
                activityContent.appendChild(questionContainer);
            });
        } else if (activity.type === 'puzzle') {
            activityContent = document.createElement('div');
            activityContent.style.display = 'flex';
            activityContent.style.flexDirection = 'column';
            activityContent.style.alignItems = 'center';
            activityContent.style.justifyContent = 'center';
            activityContent.style.width = '100%';
            
            // Contenido del puzzle
            const puzzleContent = document.createElement('div');
            puzzleContent.textContent = activity.content;
            puzzleContent.style.fontSize = '20px';
            puzzleContent.style.fontWeight = 'bold';
            puzzleContent.style.padding = '15px';
            puzzleContent.style.backgroundColor = 'rgba(255, 217, 102, 0.3)';
            puzzleContent.style.borderRadius = '10px';
            puzzleContent.style.marginBottom = '20px';
            puzzleContent.style.textAlign = 'center';
            
            // Opciones
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'puzzle-options-container'; // Añadir clase para identificarla fácilmente
            optionsContainer.style.display = 'flex';
            optionsContainer.style.flexWrap = 'wrap';
            optionsContainer.style.justifyContent = 'center';
            optionsContainer.style.gap = '10px';
            
            activity.options.forEach(option => {
                const optionButton = document.createElement('button');
                optionButton.textContent = option;
                optionButton.style.backgroundColor = '#ffd166';
                optionButton.style.border = 'none';
                optionButton.style.padding = '10px 20px';
                optionButton.style.borderRadius = '10px';
                optionButton.style.fontFamily = "'Baloo 2', cursive";
                optionButton.style.fontSize = '16px';
                optionButton.style.cursor = 'pointer';
                optionButton.style.transition = 'all 0.3s ease';
                
                // Evento de selección
                optionButton.addEventListener('click', () => {
                    // Deseleccionar todos los botones
                    optionsContainer.querySelectorAll('button').forEach(btn => {
                        btn.style.backgroundColor = '#ffd166';
                        btn.classList.remove('selected');
                    });
                    
                    // Seleccionar este botón
                    optionButton.style.backgroundColor = '#ef476f';
                    optionButton.classList.add('selected');
                });
                
                optionsContainer.appendChild(optionButton);
            });
            
            activityContent.appendChild(puzzleContent);
            activityContent.appendChild(optionsContainer);
            activityContent.setAttribute('data-activity-type', 'puzzle'); // Atributo para identificar el tipo
        }
        
        // Botón de enviar
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Enviar respuesta';
        submitButton.style.backgroundColor = '#ffd166';
        submitButton.style.border = 'none';
        submitButton.style.padding = '10px 20px';
        submitButton.style.borderRadius = '10px';
        submitButton.style.fontFamily = "'Baloo 2', cursive";
        submitButton.style.fontSize = '16px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.transition = 'all 0.3s ease';
        submitButton.style.marginTop = '20px';
        
        // Mensaje de resultado
        const resultMessage = document.createElement('div');
        resultMessage.style.marginTop = '15px';
        resultMessage.style.padding = '10px';
        resultMessage.style.borderRadius = '10px';
        resultMessage.style.display = 'none';
        
        // Evento del botón
        submitButton.addEventListener('click', () => {
            // Verificar la respuesta
            let correct = false;
            
            if (activity.type === 'writing') {
                const answer = activityContent.querySelector('textarea').value.trim();
                // Verificación básica: al menos ha escrito algo similar en longitud
                correct = answer.length >= activity.content.length * 0.5;
            } else if (activity.type === 'custom') {
                const answer = activityContent.querySelector('textarea').value.trim();
                // Para tareas personalizadas, cualquier texto se considera correcto
                correct = answer.length > 0;
                
                // También verificar si es la contraseña parental para desbloqueo inmediato
                if (answer === 'admin') {
                    correct = true;
                }
            } else if (activity.type === 'math') {
                const answers = activityContent.querySelectorAll('input');
                correct = Array.from(answers).every((answer, index) => {
                    // Normalizar respuesta (quitar espacios y convertir a minúsculas)
                    const userAnswer = answer.value.trim().toLowerCase();
                    const expectedAnswer = activity.answers[index].toLowerCase();
                    return userAnswer === expectedAnswer;
                });
            } else if (activity.type === 'puzzle') {
                const puzzleOptionsContainer = activityContent.querySelector('.puzzle-options-container');
                const selectedOption = puzzleOptionsContainer ? puzzleOptionsContainer.querySelector('button.selected') : null;
                correct = selectedOption && selectedOption.textContent === activity.answer;
            }
            
            if (correct) {
                // Mostrar mensaje de éxito
                resultMessage.textContent = '¡Correcto! ¡Muy bien!';
                resultMessage.style.backgroundColor = 'rgba(119, 221, 119, 0.3)';
                resultMessage.style.color = '#2b9348';
                resultMessage.style.display = 'block';
                
                // Deshabilitar el botón
                submitButton.disabled = true;
                submitButton.style.backgroundColor = '#cccccc';
                
                // Extender el tiempo de juego después de 2 segundos
                setTimeout(() => {
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
                    
                    console.log(`Tarea educativa completada. Tiempo extendido por ${playTimeInMinutes} minutos más.`);
                }, 2000);
            } else {
                // Mostrar mensaje de error
                resultMessage.textContent = 'Respuesta incorrecta. Inténtalo de nuevo.';
                resultMessage.style.backgroundColor = 'rgba(239, 71, 111, 0.2)';
                resultMessage.style.color = '#ef476f';
                resultMessage.style.display = 'block';
                
                // Animar botón para indicar error
                submitButton.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    submitButton.style.animation = 'none';
                }, 500);
            }
        });
        
        // Añadir elementos a la pantalla de la actividad
        activityScreen.appendChild(title);
        activityScreen.appendChild(instruction);
        activityScreen.appendChild(activityContent);
        activityScreen.appendChild(submitButton);
        activityScreen.appendChild(resultMessage);
        
        // Reemplazar contenido con pantalla de la actividad
        content.innerHTML = '';
        content.appendChild(activityScreen);
        
        // Definir la animación de sacudida si no existe
        if (!document.querySelector('style#shake-animation')) {
            const style = document.createElement('style');
            style.id = 'shake-animation';
            style.innerHTML = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-10px); }
                    40%, 80% { transform: translateX(10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Inicializar el sistema de control parental cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando control parental...');
    
    // Comprobación de si el control parental está activado
    const isEnabled = localStorage.getItem('parentalControlEnabled') === 'true';
    console.log('Control parental activado:', isEnabled);
    
    if (isEnabled) {
        // Tiempo de juego restante
        const endTime = parseInt(localStorage.getItem('playTimeEnd')) || 0;
        const currentTime = new Date().getTime();
        const remainingTime = Math.max(0, endTime - currentTime);
        console.log('Tiempo restante:', remainingTime / 1000, 'segundos');
    }
    
    window.parentalControl = new ParentalControl();
});
