/**
 * Tutorial Minigame - Introducción a Croissant Adventure
 * Este minijuego explica las mecánicas básicas del juego y cómo interactuar con el mundo
 */
window.TutorialMinigame = class TutorialMinigame extends Minigame {
    constructor(game) {
        super(game);
        
        // Propiedades del tutorial
        this.currentStep = 0;
        this.totalSteps = 5;
        this.autoAdvanceTimer = 0;
        this.autoAdvanceDelay = 15; // segundos para avanzar automáticamente
        this.lastClickTime = 0; // Para evitar clics accidentales múltiples
        this.transitionActive = false; // Controla si hay una transición en curso
        this.transitionTimer = 0; // Temporizador para transiciones
        this.transitionDuration = 0.5; // Duración de transiciones en segundos
        this.fadeAlpha = 0; // Transparencia para efectos de transición
        
        // Precarga de la imagen de Croiso
        this.croisoImage = null; // Se cargará bajo demanda en renderDemoCharacter
        
        // Personaje de ejemplo (Croiso) para mostrar movimientos
        this.demoCharacter = {
            x: this.game.width / 2,
            y: this.game.height / 2,
            width: 60,
            height: 80,
            spriteX: 0,
            spriteY: 0,
            speed: 3,
            direction: 'down',
            moving: false,
            animFrame: 0,
            animDelay: 0.1,
            animTimer: 0,
            type: 'croiso', // Usar Croiso como personaje de demostración
            scale: 1.2 // Escala para hacer el personaje más visible
        };
        
        // Objetos de demostración
        this.demoObjects = [
            {
                type: 'croissant',
                x: this.game.width / 2 - 200,
                y: this.game.height / 2,
                width: 40,
                height: 40,
                collected: false
            },
            {
                type: 'coin',
                x: this.game.width / 2 + 200,
                y: this.game.height / 2,
                width: 30,
                height: 30,
                collected: false,
                animFrame: 0,
                animTimer: 0
            }
        ];
        
        // Minijuego de demostración simplificado
        this.demoMinigame = {
            active: false,
            x: this.game.width / 2,
            y: this.game.height / 2 - 150,
            width: 200,
            height: 150,
            name: 'Mini Croissant Race'
        };
        
        // Mensajes de tutorial para cada paso
        this.tutorialMessages = [
            {
                title: "¡Bienvenido a Croissant Adventure!",
                text: "Soy Croiso, tu guía en esta deliciosa aventura. ¡Acompáñame en este tutorial para aprender a jugar! Pulsa ESPACIO o el botón SIGUIENTE para continuar.",
                image: null,
                tipText: "Puedes saltar este tutorial en cualquier momento pulsando el botón SALIR"
            },
            {
                title: "Movimiento en el Mundo",
                text: "Usa las teclas WASD o las FLECHAS para moverte por Migalandia. ¡Intenta probar ahora las teclas para ver cómo me muevo!",
                image: "movement",
                tipText: "Mantén pulsada la tecla SHIFT mientras te mueves para correr más rápido"
            },
            {
                title: "Objetos y Coleccionables",
                text: "En tu aventura encontrarás deliciosos croissants que te dan puntos y monedas para desbloquear nuevas áreas. ¡Muévete cerca de ellos para recogerlos!",
                image: "collectibles",
                tipText: "Algunos objetos están ocultos, explora bien cada área para encontrarlos todos"
            },
            {
                title: "Minijuegos y Desafíos",
                text: "Explora el mapa para encontrar divertidos minijuegos. Interactúa con ellos pulsando E cuando estés cerca o haciendo clic en ellos.",
                image: "minigames",
                tipText: "Cada minijuego tiene recompensas únicas que te ayudarán en tu aventura"
            },
            {
                title: "¡Listo para tu Aventura!",
                text: "¡Ya sabes lo básico para comenzar nuestra aventura! Explora Migalandia, recoge croissants y diviértete. ¡Pulsa SIGUIENTE para empezar a jugar!",
                image: null,
                tipText: "Recuerda que puedes volver a ver este tutorial desde el menú principal"
            }
        ];
        
        // Controles de demostración
        this.demoControls = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Imágenes y sprites (simulados con canvas)
        this.sprites = {
            loaded: true
        };
        
        // Inicializar interfaz
        this.buttonNext = {
            x: this.game.width / 2 + 150,
            y: this.game.height - 100,
            width: 120,
            height: 40,
            text: 'Siguiente'
        };
        
        this.buttonPrev = {
            x: this.game.width / 2 - 150,
            y: this.game.height - 100,
            width: 120,
            height: 40,
            text: 'Anterior'
        };
        
        // Botón de salida personalizado
        this.exitButton = {
            x: this.game.width - 60,
            y: 30,
            width: 50,
            height: 30
        };
    }
    
    /**
     * Actualiza el estado del tutorial
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame en segundos
     */
    update(deltaTime) {
        // Actualizar transiciones si están activas
        if (this.transitionActive) {
            this.updateTransition(deltaTime);
            return; // No actualizar nada más durante transiciones
        }
        
        // Actualizar temporizador de avance automático
        if (this.currentStep < this.totalSteps - 1) {
            this.autoAdvanceTimer += deltaTime;
            if (this.autoAdvanceTimer >= this.autoAdvanceDelay) {
                this.nextStep();
                this.autoAdvanceTimer = 0;
            }
        }
        
        // Actualizar animación del personaje de demostración
        this.updateDemoCharacter(deltaTime);
        
        // Actualizar animación de objetos
        this.updateDemoObjects(deltaTime);
        
        // Comprobar colisiones con objetos de demostración
        this.checkDemoCollisions();
    }
    
    /**
     * Renderiza el efecto de transición entre pasos o escenas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderTransition(ctx) {
        if (!this.transitionActive) return;
        
        // Crear efecto de desvanecimiento
        ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Mostrar mensaje de carga si la transición está avanzada
        if (this.fadeAlpha > 0.7) {
            const loadingProgress = (this.fadeAlpha - 0.7) / 0.3;
            
            // Texto de carga
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Cargando...', this.game.width / 2, this.game.height / 2 - 15);
            
            // Barra de progreso
            const barWidth = 200;
            const barHeight = 10;
            const barX = this.game.width / 2 - barWidth / 2;
            const barY = this.game.height / 2 + 15;
            
            // Fondo de la barra
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barWidth, barHeight, barHeight / 2);
            ctx.fill();
            
            // Progreso
            ctx.fillStyle = '#FFC107';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barWidth * loadingProgress, barHeight, barHeight / 2);
            ctx.fill();
        }
    }
    
    /**
     * Actualiza el personaje de demostración
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame
     */
    updateDemoCharacter(deltaTime) {
        // Solo mover el personaje en el paso 1 (movimiento)
        if (this.currentStep === 1) {
            // Simular movimiento automático para demostración
            if (Math.random() < 0.01) {
                const directions = ['up', 'down', 'left', 'right'];
                this.demoCharacter.direction = directions[Math.floor(Math.random() * directions.length)];
                this.demoCharacter.moving = true;
            }
            
            if (Math.random() < 0.005) {
                this.demoCharacter.moving = false;
            }
            
            // Mover el personaje según la dirección
            if (this.demoCharacter.moving) {
                switch (this.demoCharacter.direction) {
                    case 'up':
                        this.demoCharacter.y -= this.demoCharacter.speed;
                        break;
                    case 'down':
                        this.demoCharacter.y += this.demoCharacter.speed;
                        break;
                    case 'left':
                        this.demoCharacter.x -= this.demoCharacter.speed;
                        break;
                    case 'right':
                        this.demoCharacter.x += this.demoCharacter.speed;
                        break;
                }
                
                // Limitar el personaje a los bordes del canvas
                this.demoCharacter.x = Math.max(50, Math.min(this.demoCharacter.x, this.game.width - 50));
                this.demoCharacter.y = Math.max(100, Math.min(this.demoCharacter.y, this.game.height - 150));
                
                // Actualizar animación
                this.demoCharacter.animTimer += deltaTime;
                if (this.demoCharacter.animTimer >= this.demoCharacter.animDelay) {
                    this.demoCharacter.animFrame = (this.demoCharacter.animFrame + 1) % 4;
                    this.demoCharacter.animTimer = 0;
                }
            } else {
                this.demoCharacter.animFrame = 0;
            }
        }
        
        // Responder a controles del usuario en el paso de movimiento
        if (this.currentStep === 1 && (this.game.isKeyPressed('w') || this.game.isKeyPressed('ArrowUp'))) {
            this.demoCharacter.y -= this.demoCharacter.speed;
            this.demoCharacter.direction = 'up';
            this.demoCharacter.moving = true;
        }
        if (this.currentStep === 1 && (this.game.isKeyPressed('s') || this.game.isKeyPressed('ArrowDown'))) {
            this.demoCharacter.y += this.demoCharacter.speed;
            this.demoCharacter.direction = 'down';
            this.demoCharacter.moving = true;
        }
        if (this.currentStep === 1 && (this.game.isKeyPressed('a') || this.game.isKeyPressed('ArrowLeft'))) {
            this.demoCharacter.x -= this.demoCharacter.speed;
            this.demoCharacter.direction = 'left';
            this.demoCharacter.moving = true;
        }
        if (this.currentStep === 1 && (this.game.isKeyPressed('d') || this.game.isKeyPressed('ArrowRight'))) {
            this.demoCharacter.x += this.demoCharacter.speed;
            this.demoCharacter.direction = 'right';
            this.demoCharacter.moving = true;
        }
    }
    
    /**
     * Actualiza los objetos de demostración
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame
     */
    updateDemoObjects(deltaTime) {
        // Animación de moneda
        for (const obj of this.demoObjects) {
            if (obj.type === 'coin' && !obj.collected) {
                obj.animTimer += deltaTime;
                if (obj.animTimer >= 0.1) {
                    obj.animFrame = (obj.animFrame + 1) % 8;
                    obj.animTimer = 0;
                }
            }
        }
    }
    
    /**
     * Comprueba colisiones con objetos de demostración
     */
    checkDemoCollisions() {
        if (this.currentStep === 2) { // Paso de coleccionables
            for (const obj of this.demoObjects) {
                if (!obj.collected) {
                    // Comprobar colisión simple con rectángulos
                    if (this.rectIntersect(
                        this.demoCharacter.x - this.demoCharacter.width/2,
                        this.demoCharacter.y - this.demoCharacter.height/2,
                        this.demoCharacter.width,
                        this.demoCharacter.height,
                        obj.x - obj.width/2,
                        obj.y - obj.width/2,
                        obj.width,
                        obj.height
                    )) {
                        obj.collected = true;
                        this.playSound(obj.type === 'coin' ? 'coin' : 'item');
                    }
                }
            }
        }
    }
    
    /**
     * Comprueba si dos rectángulos se intersectan
     */
    rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    
    /**
     * Renderiza el tutorial
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        // Fondo con gradiente
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.game.height - 150);
        skyGradient.addColorStop(0, '#64B5F6'); // Azul cielo más moderno
        skyGradient.addColorStop(1, '#BBDEFB'); // Azul más claro hacia el horizonte
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Añadir nubes decorativas
        this.renderClouds(ctx);
        
        // Dibujar montañas de fondo
        this.renderMountains(ctx);
        
        // Dibujar suelo con gradiente
        const groundGradient = ctx.createLinearGradient(0, this.game.height - 150, 0, this.game.height);
        groundGradient.addColorStop(0, '#8D6E63'); // Marrón claro
        groundGradient.addColorStop(1, '#5D4037'); // Marrón oscuro
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.game.height - 150, this.game.width, 150);
        
        // Dibujar hierba con textura
        const grassGradient = ctx.createLinearGradient(0, this.game.height - 150, 0, this.game.height - 130);
        grassGradient.addColorStop(0, '#66BB6A'); // Verde claro
        grassGradient.addColorStop(1, '#43A047'); // Verde oscuro
        ctx.fillStyle = grassGradient;
        ctx.fillRect(0, this.game.height - 150, this.game.width, 20);
        
        // Añadir textura a la hierba (puntitos)
        ctx.fillStyle = 'rgba(100, 200, 100, 0.5)';
        for (let x = 0; x < this.game.width; x += 10) {
            const height = 2 + Math.random() * 6;
            ctx.fillRect(x, this.game.height - 150, 2, height);
        }
        
        // Dibujar elementos según el paso actual
        switch (this.currentStep) {
            case 1: // Movimiento
                this.renderDemoCharacter(ctx);
                break;
            case 2: // Coleccionables
                this.renderDemoCharacter(ctx);
                this.renderDemoObjects(ctx);
                break;
            case 3: // Minijuegos
                this.renderDemoMinigame(ctx);
                this.renderDemoCharacter(ctx);
                break;
        }
        
        // Renderizar panel de información
        this.renderInfoPanel(ctx);
        
        // Renderizar botones de navegación
        this.renderNavButtons(ctx);
        
        // Renderizar botón de salida
        this.drawExitButton(ctx);
    }
    
    /**
     * Renderiza nubes decorativas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderClouds(ctx) {
        // Crear nubes si no existen
        if (!this.clouds) {
            this.clouds = [];
            const numClouds = 6;
            
            for (let i = 0; i < numClouds; i++) {
                this.clouds.push({
                    x: Math.random() * this.game.width,
                    y: 50 + Math.random() * 100,
                    width: 80 + Math.random() * 120,
                    height: 40 + Math.random() * 30,
                    speed: 0.2 + Math.random() * 0.3
                });
            }
        }
        
        // Dibujar y actualizar nubes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (const cloud of this.clouds) {
            // Dibujar nube con formas redondeadas
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.height/2, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width/3, cloud.y - cloud.height/4, cloud.height/2.5, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width/1.5, cloud.y, cloud.height/2.2, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width/1.1, cloud.y - cloud.height/6, cloud.height/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Mover nube
            cloud.x += cloud.speed;
            if (cloud.x > this.game.width + cloud.width) {
                cloud.x = -cloud.width;
            }
        }
    }
    
    /**
     * Renderiza montañas de fondo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderMountains(ctx) {
        // Crear montañas si no existen
        if (!this.mountains) {
            this.mountains = [];
            const numMountains = 5;
            
            for (let i = 0; i < numMountains; i++) {
                this.mountains.push({
                    x: (this.game.width / (numMountains - 1)) * i - 100,
                    width: 300 + Math.random() * 200,
                    height: 150 + Math.random() * 100
                });
            }
        }
        
        // Dibujar montañas
        for (const mountain of this.mountains) {
            const gradient = ctx.createLinearGradient(
                mountain.x, 
                this.game.height - 150 - mountain.height, 
                mountain.x + mountain.width/2, 
                this.game.height - 150
            );
            gradient.addColorStop(0, '#78909C'); // Gris azulado
            gradient.addColorStop(1, '#546E7A'); // Gris más oscuro
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(mountain.x, this.game.height - 150);
            ctx.lineTo(mountain.x + mountain.width/2, this.game.height - 150 - mountain.height);
            ctx.lineTo(mountain.x + mountain.width, this.game.height - 150);
            ctx.closePath();
            ctx.fill();
            
            // Añadir nieve en la cima
            ctx.fillStyle = '#ECEFF1';
            ctx.beginPath();
            ctx.moveTo(mountain.x + mountain.width/4, this.game.height - 150 - mountain.height * 0.7);
            ctx.lineTo(mountain.x + mountain.width/2, this.game.height - 150 - mountain.height);
            ctx.lineTo(mountain.x + mountain.width * 3/4, this.game.height - 150 - mountain.height * 0.7);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    /**
     * Renderiza el personaje de demostración
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderDemoCharacter(ctx) {
        if (!this.demoCharacter) return;
        
        ctx.save();
        
        // Cargar la imagen de Croiso si no está cargada
        if (!this.croisoImage) {
            this.croisoImage = new Image();
            this.croisoImage.src = 'croiso.png';
            // Imagen de respaldo en caso de error al cargar
            this.croisoImage.onerror = () => {
                console.error('Error al cargar la imagen de Croiso');
                this.croisoImage = null;
            };
        }
        
        // Sombra bajo el personaje
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(
            this.demoCharacter.x,
            this.demoCharacter.y + this.demoCharacter.height/2,
            this.demoCharacter.width/2.5,
            this.demoCharacter.width/6,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Aplicar movimiento de bamboleo
        if (this.demoCharacter.moving) {
            const swayAngle = Math.sin(this.demoCharacter.animFrame * Math.PI) * 0.05;
            ctx.translate(this.demoCharacter.x, this.demoCharacter.y);
            ctx.rotate(swayAngle);
            ctx.translate(-this.demoCharacter.x, -this.demoCharacter.y);
        }
        
        if (this.croisoImage && this.croisoImage.complete) {
            // Dibujar la imagen de Croiso
            const width = this.demoCharacter.width * 1.5;
            const height = this.demoCharacter.height * 1.5;
            
            // Añadir efecto de rebote en Y durante el movimiento
            const bounceOffset = this.demoCharacter.moving ? Math.abs(Math.sin(this.demoCharacter.animFrame * Math.PI)) * 5 : 0;
            
            // Dibujar la imagen con un brillo dorado alrededor
            ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
            ctx.shadowBlur = 10;
            
            ctx.drawImage(
                this.croisoImage,
                this.demoCharacter.x - width/2,
                this.demoCharacter.y - height/2 - bounceOffset,
                width,
                height
            );
            
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        } else {
            // Si la imagen no está disponible, dibujar un círculo amarillo como respaldo
            ctx.fillStyle = '#FFC107';
            ctx.beginPath();
            ctx.arc(
                this.demoCharacter.x,
                this.demoCharacter.y,
                this.demoCharacter.width/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Dibujar una cara simple
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.demoCharacter.x - 10, this.demoCharacter.y - 10, 3, 0, Math.PI * 2);
            ctx.arc(this.demoCharacter.x + 10, this.demoCharacter.y - 10, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.demoCharacter.x, this.demoCharacter.y + 5, 8, 0, Math.PI, false);
            ctx.stroke();
        }
        
        // Restaurar el contexto
        ctx.restore();
    }
    
    /**
     * Renderiza los objetos de demostración
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderDemoObjects(ctx) {
        for (const obj of this.demoObjects) {
            if (obj.collected) {
                // Mostrar efecto de recogida (partículas subiendo)
                this.renderCollectionEffect(ctx, obj);
                continue;
            }
            
            // Aplicar efecto de flotación
            const floatY = Math.sin(Date.now() / 500) * 5;
            
            if (obj.type === 'croissant') {
                // Efecto de brillo alrededor
                const glowSize = 5 + Math.sin(Date.now() / 300) * 2;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
                ctx.shadowBlur = glowSize;
                
                // Dibujar croissant mejorado
                ctx.save();
                ctx.translate(obj.x, obj.y + floatY);
                
                // Forma principal del croissant
                const gradient = ctx.createRadialGradient(0, 0, obj.width/5, 0, 0, obj.width/1.5);
                gradient.addColorStop(0, '#FFC107'); // Ámbar más claro en el centro
                gradient.addColorStop(0.7, '#FF9800'); // Naranja en medio
                gradient.addColorStop(1, '#F57C00'); // Naranja más oscuro en bordes
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, obj.width/2, 0, Math.PI, false); // Media luna superior
                ctx.fill();
                
                // Contorno
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, obj.width/2, 0, Math.PI, false);
                ctx.stroke();
                
                // Detalles (marcas del croissant)
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 1;
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(-obj.width/2.5, i * obj.height/10);
                    ctx.lineTo(obj.width/2.5, i * obj.height/10);
                    ctx.stroke();
                }
                
                // Brillo
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(-obj.width/4, -obj.height/8, obj.width/10, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                ctx.shadowBlur = 0;
            } else if (obj.type === 'coin') {
                // Efecto de rotación 3D
                const rotationAngle = Date.now() / 800;
                const perspective = Math.abs(Math.sin(rotationAngle));
                
                // Efecto de brillo dorado
                ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
                ctx.shadowBlur = 8;
                
                // Dibujar moneda con perspectiva
                ctx.save();
                ctx.translate(obj.x, obj.y + floatY);
                
                // Elíptica que simula rotación 3D
                const gradient = ctx.createLinearGradient(-obj.width/2, 0, obj.width/2, 0);
                gradient.addColorStop(0, '#FFD700'); // Dorado
                gradient.addColorStop(0.5, '#FFF9C4'); // Brillo central
                gradient.addColorStop(1, '#FFC107'); // Ámbar
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.ellipse(0, 0, obj.width/2, obj.width/2 * perspective, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Borde
                ctx.strokeStyle = '#B8860B';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, obj.width/2, obj.width/2 * perspective, 0, 0, Math.PI * 2);
                ctx.stroke();
                
                // Símbolo $ (visible solo cuando la moneda está de frente)
                if (perspective > 0.7) {
                    const opacity = (perspective - 0.7) / 0.3;
                    ctx.fillStyle = `rgba(139, 69, 19, ${opacity})`;
                    ctx.font = `bold ${obj.width/2}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('$', 0, 0);
                }
                
                ctx.restore();
                ctx.shadowBlur = 0;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'alphabetic';
            }
        }
    }
    
    /**
     * Renderiza el efecto de recogida de un objeto
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} obj - Objeto recogido
     */
    renderCollectionEffect(ctx, obj) {
        // Crear partículas si no existen
        if (!obj.particles) {
            obj.particles = [];
            obj.collectedTime = Date.now();
            
            // Crear partículas de brillo
            for (let i = 0; i < 15; i++) {
                obj.particles.push({
                    x: obj.x,
                    y: obj.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -Math.random() * 5 - 2,
                    size: 3 + Math.random() * 5,
                    color: obj.type === 'croissant' ? '#FFC107' : '#FFD700',
                    alpha: 1,
                    rotation: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Actualizar y dibujar partículas
        const lifespan = 1500; // 1.5 segundos de duración
        const elapsed = Date.now() - obj.collectedTime;
        const progress = Math.min(1, elapsed / lifespan);
        
        if (progress < 1) {
            for (const particle of obj.particles) {
                // Actualizar posición
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.05; // Gravedad
                particle.alpha = 1 - progress;
                particle.rotation += 0.05;
                
                // Dibujar partícula
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                ctx.fillStyle = `rgba(${particle.color.startsWith('#FF') ? '255,215,0' : '255,193,7'}, ${particle.alpha})`;
                ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                ctx.restore();
            }
            
            // Texto de puntos
            ctx.font = '20px Arial';
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
            ctx.textAlign = 'center';
            ctx.fillText(obj.type === 'croissant' ? '+10' : '+5', obj.x, obj.y - 20 - progress * 30);
            ctx.textAlign = 'left';
        }
    }
    
    /**
     * Renderiza el minijuego de demostración
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderDemoMinigame(ctx) {
        // Renderizar cabina de minijuego
        ctx.fillStyle = '#8B4513'; // Marrón
        ctx.fillRect(
            this.demoMinigame.x - this.demoMinigame.width/2,
            this.demoMinigame.y - this.demoMinigame.height/2,
            this.demoMinigame.width,
            this.demoMinigame.height
        );
        
        // Letrero
        ctx.fillStyle = '#FFD700'; // Dorado
        ctx.fillRect(
            this.demoMinigame.x - this.demoMinigame.width/2.5,
            this.demoMinigame.y - this.demoMinigame.height/1.5,
            this.demoMinigame.width/1.25,
            this.demoMinigame.height/4
        );
        
        // Nombre del minijuego
        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.demoMinigame.name,
            this.demoMinigame.x,
            this.demoMinigame.y - this.demoMinigame.height/1.5 + this.demoMinigame.height/8
        );
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        
        // Dibujar señal de "Presiona E"
        if (Math.sin(Date.now() / 300) > 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                'Presiona E',
                this.demoMinigame.x,
                this.demoMinigame.y + this.demoMinigame.height/2 + 30
            );
            ctx.textAlign = 'left';
        }
    }
    
    /**
     * Renderiza el panel de información
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderInfoPanel(ctx) {
        const currentMessage = this.tutorialMessages[this.currentStep];
        
        // Calcular efecto de aparecer/desaparecer durante transiciones
        let panelAlpha = 1;
        if (this.transitionActive) {
            panelAlpha = 1 - this.fadeAlpha;
        }
        
        // Panel con fondo degradado y bordes redondeados
        const panelX = 50;
        const panelY = 50;
        const panelWidth = this.game.width - 100;
        const panelHeight = 150; // Incrementado para incluir consejos
        const cornerRadius = 15;
        
        // Dibujar fondo con degradado
        const panelGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
        panelGradient.addColorStop(0, `rgba(30, 30, 50, ${0.85 * panelAlpha})`);
        panelGradient.addColorStop(1, `rgba(20, 20, 40, ${0.9 * panelAlpha})`);
        
        // Dibujar panel redondeado
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(panelX + cornerRadius, panelY);
        ctx.lineTo(panelX + panelWidth - cornerRadius, panelY);
        ctx.quadraticCurveTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + cornerRadius);
        ctx.lineTo(panelX + panelWidth, panelY + panelHeight - cornerRadius);
        ctx.quadraticCurveTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - cornerRadius, panelY + panelHeight);
        ctx.lineTo(panelX + cornerRadius, panelY + panelHeight);
        ctx.quadraticCurveTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - cornerRadius);
        ctx.lineTo(panelX, panelY + cornerRadius);
        ctx.quadraticCurveTo(panelX, panelY, panelX + cornerRadius, panelY);
        ctx.closePath();
        
        // Añadir sombra al panel
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        ctx.fillStyle = panelGradient;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        
        // Borde decorativo
        const borderGradient = ctx.createLinearGradient(panelX, panelY, panelX + panelWidth, panelY + panelHeight);
        borderGradient.addColorStop(0, '#FFD700'); // Dorado
        borderGradient.addColorStop(0.5, '#FFC107'); // Ámbar
        borderGradient.addColorStop(1, '#FF9800'); // Naranja
        
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Icono decorativo (basado en el paso actual)
        let iconType = '';
        switch (this.currentStep) {
            case 0: iconType = '✨'; break; // Estrella brillante
            case 1: iconType = '➡️'; break; // Flecha
            case 2: iconType = '🍬'; break; // Caramelo
            case 3: iconType = '🎮'; break; // Videojuego
            case 4: iconType = '🎉'; break; // Fiesta
        }
        
        ctx.font = '32px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(iconType, panelX + 30, panelY + 45);
        
        // Título con efecto de texto
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        
        // Sombra de texto
        ctx.fillStyle = `rgba(150, 100, 0, ${0.5 * panelAlpha})`;
        ctx.fillText(currentMessage.title, this.game.width / 2 + 2, 85 + 2);
        
        // Texto principal
        const titleGradient = ctx.createLinearGradient(
            this.game.width / 2 - 150, 85,
            this.game.width / 2 + 150, 85
        );
        titleGradient.addColorStop(0, '#FFC107');
        titleGradient.addColorStop(0.5, '#FFFFFF');
        titleGradient.addColorStop(1, '#FFC107');
        
        ctx.fillStyle = titleGradient;
        ctx.fillText(currentMessage.title, this.game.width / 2, 85);
        
        // Texto descriptivo
        ctx.fillStyle = `rgba(255, 255, 255, ${panelAlpha})`;
        ctx.font = '18px Arial';
        
        // Dividir el texto en líneas si es demasiado largo
        const maxWidth = panelWidth - 60;
        const words = currentMessage.text.split(' ');
        let line = '';
        let y = 125;
        
        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, this.game.width / 2, y);
                line = word + ' ';
                y += 25;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, this.game.width / 2, y);
        
        // Texto de consejo (tip)
        if (currentMessage.tipText) {
            ctx.font = 'italic 14px Arial';
            ctx.fillStyle = `rgba(255, 255, 200, ${0.8 * panelAlpha})`;
            ctx.fillText(`Consejo: ${currentMessage.tipText}`, this.game.width / 2, panelY + panelHeight - 20);
        }
        
        // Barra de progreso estilizada
        const progressBarY = panelY + panelHeight + 20;
        const progressBarHeight = 10;
        const progressBarWidth = this.game.width - 200;
        const progressWidth = progressBarWidth * (this.currentStep / (this.totalSteps - 1));
        
        // Fondo de la barra
        ctx.fillStyle = `rgba(50, 50, 70, ${0.5 * panelAlpha})`;
        ctx.beginPath();
        ctx.roundRect(100, progressBarY, progressBarWidth, progressBarHeight, progressBarHeight / 2);
        ctx.fill();
        
        // Progreso
        if (progressWidth > 0) {
            const progressGradient = ctx.createLinearGradient(100, progressBarY, 100 + progressBarWidth, progressBarY);
            progressGradient.addColorStop(0, '#4CAF50'); // Verde
            progressGradient.addColorStop(0.5, '#8BC34A'); // Verde claro
            progressGradient.addColorStop(1, '#CDDC39'); // Lima
            
            ctx.fillStyle = progressGradient;
            ctx.beginPath();
            ctx.roundRect(100, progressBarY, progressWidth, progressBarHeight, progressBarHeight / 2);
            ctx.fill();
            
            // Brillo en la barra de progreso
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * panelAlpha})`;
            ctx.beginPath();
            ctx.roundRect(100, progressBarY, progressWidth, progressBarHeight / 3, progressBarHeight / 4);
            ctx.fill();
        }
        
        // Texto de progreso
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * panelAlpha})`;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Paso ${this.currentStep + 1} de ${this.totalSteps}`, this.game.width / 2, progressBarY + progressBarHeight + 15);
        
        ctx.textAlign = 'left';
        ctx.restore();
    }
    
    /**
     * Renderiza los botones de navegación
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderNavButtons(ctx) {
        // No mostrar botones durante transiciones
        if (this.transitionActive) return;
        
        // Efecto de hover para los botones
        const nextHovered = this.isPointInRect(
            this.game.mouseX, this.game.mouseY,
            this.buttonNext.x - this.buttonNext.width/2,
            this.buttonNext.y - this.buttonNext.height/2,
            this.buttonNext.width, this.buttonNext.height
        );
        
        const prevHovered = this.isPointInRect(
            this.game.mouseX, this.game.mouseY,
            this.buttonPrev.x - this.buttonPrev.width/2,
            this.buttonPrev.y - this.buttonPrev.height/2,
            this.buttonPrev.width, this.buttonPrev.height
        );
        
        // Factor de escala para efecto hover
        const nextScale = nextHovered ? 1.1 : 1.0;
        const prevScale = prevHovered ? 1.1 : 1.0;
        
        ctx.save();
        
        // Botón SIGUIENTE
        ctx.translate(this.buttonNext.x, this.buttonNext.y);
        ctx.scale(nextScale, nextScale);
        
        const isNextActive = this.currentStep < this.totalSteps - 1;
        const nextGradient = ctx.createLinearGradient(-this.buttonNext.width/2, -this.buttonNext.height/2, 
                                                    this.buttonNext.width/2, this.buttonNext.height/2);
        
        if (isNextActive) {
            nextGradient.addColorStop(0, nextHovered ? '#66BB6A' : '#4CAF50'); // Verde
            nextGradient.addColorStop(1, nextHovered ? '#43A047' : '#388E3C'); // Verde más oscuro
        } else {
            nextGradient.addColorStop(0, '#9E9E9E'); // Gris
            nextGradient.addColorStop(1, '#757575'); // Gris más oscuro
        }
        
        // Botón con esquinas redondeadas
        ctx.fillStyle = nextGradient;
        ctx.beginPath();
        ctx.roundRect(-this.buttonNext.width/2, -this.buttonNext.height/2, 
                     this.buttonNext.width, this.buttonNext.height, 10);
        ctx.fill();
        
        // Efecto de brillo en la parte superior
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(-this.buttonNext.width/2, -this.buttonNext.height/2, 
                     this.buttonNext.width, this.buttonNext.height/3, 10);
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = isNextActive ? '#2E7D32' : '#616161';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-this.buttonNext.width/2, -this.buttonNext.height/2, 
                     this.buttonNext.width, this.buttonNext.height, 10);
        ctx.stroke();
        
        // Texto con sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.buttonNext.text, 2, 2);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.buttonNext.text, 0, 0);
        
        ctx.restore();
        
        // Botón ANTERIOR
        ctx.save();
        ctx.translate(this.buttonPrev.x, this.buttonPrev.y);
        ctx.scale(prevScale, prevScale);
        
        const isPrevActive = this.currentStep > 0;
        const prevGradient = ctx.createLinearGradient(-this.buttonPrev.width/2, -this.buttonPrev.height/2, 
                                                    this.buttonPrev.width/2, this.buttonPrev.height/2);
        
        if (isPrevActive) {
            prevGradient.addColorStop(0, prevHovered ? '#5C6BC0' : '#3F51B5'); // Azul indigo
            prevGradient.addColorStop(1, prevHovered ? '#3949AB' : '#303F9F'); // Azul indigo más oscuro
        } else {
            prevGradient.addColorStop(0, '#9E9E9E'); // Gris
            prevGradient.addColorStop(1, '#757575'); // Gris más oscuro
        }
        
        // Botón con esquinas redondeadas
        ctx.fillStyle = prevGradient;
        ctx.beginPath();
        ctx.roundRect(-this.buttonPrev.width/2, -this.buttonPrev.height/2, 
                     this.buttonPrev.width, this.buttonPrev.height, 10);
        ctx.fill();
        
        // Efecto de brillo en la parte superior
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(-this.buttonPrev.width/2, -this.buttonPrev.height/2, 
                     this.buttonPrev.width, this.buttonPrev.height/3, 10);
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = isPrevActive ? '#283593' : '#616161';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-this.buttonPrev.width/2, -this.buttonPrev.height/2, 
                     this.buttonPrev.width, this.buttonPrev.height, 10);
        ctx.stroke();
        
        // Texto con sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.buttonPrev.text, 2, 2);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.buttonPrev.text, 0, 0);
        
        ctx.restore();
    }
    
    /**
     * Dibuja el botón de salida
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    drawExitButton(ctx) {
        // No mostrar botón durante transiciones
        if (this.transitionActive) return;
        
        // Comprobar si el ratón está sobre el botón
        const isHovered = this.isPointInRect(
            this.game.mouseX, this.game.mouseY,
            this.exitButton.x, this.exitButton.y,
            this.exitButton.width, this.exitButton.height
        );
        
        // Factor de escala para efecto hover
        const scale = isHovered ? 1.1 : 1.0;
        
        ctx.save();
        ctx.translate(
            this.exitButton.x + this.exitButton.width / 2,
            this.exitButton.y + this.exitButton.height / 2
        );
        ctx.scale(scale, scale);
        
        // Gradiente para el fondo del botón
        const gradient = ctx.createLinearGradient(
            -this.exitButton.width / 2, -this.exitButton.height / 2,
            this.exitButton.width / 2, this.exitButton.height / 2
        );
        gradient.addColorStop(0, isHovered ? '#F44336' : '#E53935'); // Rojo
        gradient.addColorStop(1, isHovered ? '#D32F2F' : '#C62828'); // Rojo más oscuro
        
        // Dibujar botón con esquinas redondeadas
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
            -this.exitButton.width / 2, -this.exitButton.height / 2,
            this.exitButton.width, this.exitButton.height,
            8 // Radio de las esquinas
        );
        ctx.fill();
        
        // Efecto de brillo en la parte superior
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(
            -this.exitButton.width / 2, -this.exitButton.height / 2,
            this.exitButton.width, this.exitButton.height / 3,
            8 // Radio de las esquinas
        );
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = '#B71C1C'; // Rojo oscuro
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            -this.exitButton.width / 2, -this.exitButton.height / 2,
            this.exitButton.width, this.exitButton.height,
            8 // Radio de las esquinas
        );
        ctx.stroke();
        
        // Texto con sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Salir', 2, 2);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Salir', 0, 0);
        
        ctx.restore();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    /**
     * Maneja la entrada del usuario
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame
     */
    handleInput(deltaTime) {
        // Si hay una transición activa, no procesar inputs
        if (this.transitionActive) {
            return;
        }
        
        // Avanzar con espacio o interactuar con minijuego con E
        if (this.game.isKeyPressed(' ')) {
            if (this.currentStep < this.totalSteps - 1) {
                this.nextStep();
            } else {
                this.game.switchScene('worldMap');
            }
            this.game.keyReleased(' ');
        }
        
        // Interactuar con minijuego con E
        if (this.currentStep === 3 && this.game.isKeyPressed('e')) {
            // Calcular distancia al minijuego
            const dx = this.demoMinigame.x - this.demoCharacter.x;
            const dy = this.demoMinigame.y - this.demoCharacter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                this.playSound('success');
                this.demoMinigame.active = !this.demoMinigame.active;
            }
            
            this.game.keyReleased('e');
        }
    }
    
    /**
     * Método que se ejecuta cuando el usuario hace clic en el canvas
     * Este método es llamado automáticamente por el motor del juego
     */
    onMouseDown() {
        // Si hay una transición activa, no procesar inputs
        if (this.transitionActive) return;
        
        // Prevenir clics múltiples rápidos
        const currentTime = Date.now();
        const clickCooldown = 300; // milisegundos entre clics válidos
        
        if (currentTime - this.lastClickTime <= clickCooldown) return;
        this.lastClickTime = currentTime;
        
        console.log('onMouseDown en tutorial:', this.game.mouseX, this.game.mouseY);
        
        // Comprobar botón siguiente
        if (this.currentStep < this.totalSteps - 1 && 
            this.isPointInRect(
                this.game.mouseX, 
                this.game.mouseY,
                this.buttonNext.x - this.buttonNext.width/2,
                this.buttonNext.y - this.buttonNext.height/2,
                this.buttonNext.width,
                this.buttonNext.height
            )) {
            console.log('Botón siguiente clickeado');
            this.nextStep();
            this.playSound('click');
            return;
        }
        
        // Comprobar botón anterior
        if (this.currentStep > 0 && 
            this.isPointInRect(
                this.game.mouseX, 
                this.game.mouseY,
                this.buttonPrev.x - this.buttonPrev.width/2,
                this.buttonPrev.y - this.buttonPrev.height/2,
                this.buttonPrev.width,
                this.buttonPrev.height
            )) {
            console.log('Botón anterior clickeado');
            this.prevStep();
            this.playSound('click');
            return;
        }
        
        // Comprobar botón de salida
        if (this.isPointInRect(
                this.game.mouseX, 
                this.game.mouseY,
                this.exitButton.x,
                this.exitButton.y,
                this.exitButton.width,
                this.exitButton.height
            )) {
            console.log('Botón salir clickeado');
            this.playSound('click');
            this.startTransition('worldMap');
            return;
        }
        
        // Comprobar interacción con minijuego demo
        if (this.currentStep === 3 &&
            this.game.mouseX >= this.demoMinigame.x - this.demoMinigame.width/2 &&
            this.game.mouseX <= this.demoMinigame.x + this.demoMinigame.width/2 &&
            this.game.mouseY >= this.demoMinigame.y - this.demoMinigame.height/2 &&
            this.game.mouseY <= this.demoMinigame.y + this.demoMinigame.height/2) {
            
            this.playSound('success');
            this.demoMinigame.active = !this.demoMinigame.active;
        }
    }
    
    /**
     * Método que se ejecuta cuando el usuario suelta el clic del ratón
     * Este método es llamado automáticamente por el motor del juego
     */
    onMouseUp() {
        // Por ahora no necesitamos hacer nada especial aquí
        // pero es bueno tenerlo para compatibilidad con el motor
    }
    
    /**
     * Comprueba si un punto está dentro de un rectángulo
     * @param {number} px - Coordenada x del punto
     * @param {number} py - Coordenada y del punto
     * @param {number} rx - Coordenada x del rectángulo
     * @param {number} ry - Coordenada y del rectángulo
     * @param {number} rw - Ancho del rectángulo
     * @param {number} rh - Alto del rectángulo
     * @returns {boolean} - true si el punto está dentro del rectángulo
     */
    isPointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
    
    /**
     * Inicia una transición hacia otra escena
     * @param {string} targetScene - Escena de destino
     */
    startTransition(targetScene) {
        this.transitionActive = true;
        this.transitionTimer = 0;
        this.targetScene = targetScene;
    }
    
    /**
     * Actualiza la transición entre escenas
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame
     */
    updateTransition(deltaTime) {
        if (!this.transitionActive) return;
        
        this.transitionTimer += deltaTime;
        this.fadeAlpha = Math.min(1, this.transitionTimer / this.transitionDuration);
        
        if (this.transitionTimer >= this.transitionDuration) {
            this.game.switchScene(this.targetScene);
            this.transitionActive = false;
        }
    }
    
    /**
     * Avanza al siguiente paso del tutorial con una transición suave
     */
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            // Efecto de transición entre pasos
            this.transitionActive = true;
            this.transitionTimer = 0;
            
            // Usamos setTimeout para dar tiempo a la animación
            setTimeout(() => {
                this.currentStep++;
                this.autoAdvanceTimer = 0;
                
                // Resetear estados según el paso
                if (this.currentStep === 2) {
                    // Resetear posición de objetos
                    for (const obj of this.demoObjects) {
                        obj.collected = false;
                    }
                }
                
                this.transitionActive = false;
            }, this.transitionDuration * 500);
        } else if (this.currentStep === this.totalSteps - 1) {
            // En el último paso, ir al mapa del mundo
            this.startTransition('worldMap');
        }
    }
    
    /**
     * Retrocede al paso anterior del tutorial con una transición suave
     */
    prevStep() {
        if (this.currentStep > 0) {
            // Efecto de transición entre pasos
            this.transitionActive = true;
            this.transitionTimer = 0;
            
            // Usamos setTimeout para dar tiempo a la animación
            setTimeout(() => {
                this.currentStep--;
                this.autoAdvanceTimer = 0;
                this.transitionActive = false;
            }, this.transitionDuration * 500);
        }
    }
    
    /**
     * Reproduce un sonido
     * @param {string} soundName - Nombre del sonido a reproducir
     */
    playSound(soundName) {
        try {
            if (this.game && this.game.audioSystem && this.game.audioSystem.sfxEnabled) {
                // Simulamos la reproducción de sonido (se usaría el sistema de sonido del juego)
                console.log(`Reproduciendo sonido: ${soundName}`);
            }
        } catch (e) {
            console.warn(`Error al reproducir sonido ${soundName}:`, e);
        }
    }
    
    /**
     * Método que se ejecuta cuando se entra en la escena
     */
    enter() {
        console.log("Iniciando tutorial de Croissant Adventure");
        this.currentStep = 0;
        this.autoAdvanceTimer = 0;
        
        // Reproducir música de fondo alegre
        if (this.game.audioSystem && this.game.audioSystem.musicEnabled) {
            this.game.playMusic('tutorial');
        }
    }
    
    /**
     * Método que se ejecuta cuando se sale de la escena
     */
    exit() {
        console.log("Saliendo del tutorial");
        
        // Detener la música si está sonando
        if (this.game.audioSystem && this.game.audioSystem.currentMusic) {
            this.game.stopMusic();
        }
    }
}
