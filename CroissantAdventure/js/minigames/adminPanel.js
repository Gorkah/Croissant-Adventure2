/**
 * Admin Panel Minigame
 * This minigame displays a Miro board within an iframe
 */
class AdminPanel extends Minigame {
    constructor(game) {
        super(game);
        
        this.name = "Admin Panel";
        this.description = "Panel de administración con tablero de planificación";
        
        // Aumentar el tamaño y modificar la posición del botón de salida
        this.exitButton = {
            text: 'Salir',
            x: this.game.canvas.width - 70,
            y: 30,
            width: 100,
            height: 40,
            action: () => game.switchScene('worldMap')
        };
        
        // Crear el iframe para el tablero de Miro
        this.iframe = document.createElement('iframe');
        this.iframe.width = "768";
        this.iframe.height = "432";
        this.iframe.src = "https://miro.com/app/live-embed/uXjVI6c1dS8=/?moveToViewport=-207,-351,2756,1211&embedId=63064072295";
        this.iframe.frameBorder = "0";
        this.iframe.scrolling = "no";
        this.iframe.allow = "fullscreen; clipboard-read; clipboard-write";
        this.iframe.allowFullscreen = true;
        this.iframe.style.position = "absolute";
        this.iframe.style.top = "50%";
        this.iframe.style.left = "50%";
        this.iframe.style.transform = "translate(-50%, -50%)";
        this.iframe.style.zIndex = "1000";
        
        this.iframeAdded = false;
    }
    
    /**
     * Initialize the admin panel
     */
    init() {
        // Add iframe to the game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer && !this.iframeAdded) {
            gameContainer.appendChild(this.iframe);
            this.iframeAdded = true;
        }
    }
    
    /**
     * Update method
     */
    update(deltaTime) {
        // Update the exit button position based on canvas size (in case of resize)
        this.exitButton.x = this.game.canvas.width - 70;
        
        // Check for exit button clicks
        super.update(deltaTime);
    }
    
    /**
     * Render method
     */
    render(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Draw background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Draw title
        ctx.fillStyle = '#333';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Panel de Administración', this.game.canvas.width / 2, 30);
        
        // Draw exit button
        super.render(ctx);
    }
    
    /**
     * Clean up when leaving this scene
     */
    cleanup() {
        // Remove iframe when exiting the game
        if (this.iframeAdded && this.iframe) {
            this.iframe.remove();
            this.iframeAdded = false;
        }
    }
}
