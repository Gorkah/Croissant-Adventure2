/**
 * Main Menu Scene
 * The starting point of the game
 */
class MainMenuScene extends Scene {
    constructor(game) {
        super(game);
        this.buttons = [
            {
                text: 'Iniciar Juego',
                x: game.width / 2,
                y: game.height / 2 - 90,
                width: 200,
                height: 50,
                action: () => game.switchScene('worldMap')
            },
            {
                text: 'Coin Collector',
                x: game.width / 2,
                y: game.height / 2 - 30,
                width: 200,
                height: 50,
                action: () => game.switchScene('coinCollector')
            },
            {
                text: 'Roulette',
                x: game.width / 2,
                y: game.height / 2 + 30,
                width: 200,
                height: 50,
                action: () => game.switchScene('roulette')
            },
            {
                text: 'Chess',
                x: game.width / 2,
                y: game.height / 2 + 90,
                width: 200,
                height: 50,
                action: () => game.switchScene('chess')
            },
            {
                text: 'Instrucciones',
                x: game.width / 2,
                y: game.height / 2 + 150,
                width: 200,
                height: 50,
                action: () => {
                    alert('Instrucciones:\n\n' +
                        '- En el mapa, usa WASD o las flechas para moverte\n' +
                        '- También puedes hacer clic en los controles de las esquinas\n' +
                        '- Acércate a las zonas de colores y presiona E para entrar a los minijuegos\n' +
                        '- En cada minijuego, hay un botón para regresar al mapa principal');
                }
            }
        ];
    }
    
    enter() {
        // Nothing specific needed here
    }
    
    exit() {
        // Nothing specific needed here
    }
    
    update(deltaTime) {
        // Check for button clicks
        if (this.game.mouseDown) {
            console.log('Menu mouseDown, checking buttons');
            for (const button of this.buttons) {
                if (
                    this.game.mouseX >= button.x - button.width / 2 &&
                    this.game.mouseX <= button.x + button.width / 2 &&
                    this.game.mouseY >= button.y - button.height / 2 &&
                    this.game.mouseY <= button.y + button.height / 2
                ) {
                    console.log('Button clicked:', button.text);
                    button.action();
                    this.game.mouseDown = false;
                    break;
                }
            }
        }
        
        // Also support keyboard navigation
        if (this.game.isKeyPressed('enter')) {
            // Start the game with Enter key
            this.game.switchScene('worldMap');
        }
        
        // Numeric keys for minigames
        if (this.game.isKeyPressed('1')) {
            this.game.switchScene('coinCollector');
        } else if (this.game.isKeyPressed('2')) {
            this.game.switchScene('roulette');
        } else if (this.game.isKeyPressed('3')) {
            this.game.switchScene('chess');
        }
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Croissant Adventure', this.game.width / 2, 150);
        
        // Draw buttons
        for (const button of this.buttons) {
            // Button background
            ctx.fillStyle = '#ff9900';
            ctx.fillRect(
                button.x - button.width / 2,
                button.y - button.height / 2,
                button.width,
                button.height
            );
            
            // Button text
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(button.text, button.x, button.y);
        }
        
        // Draw croissant decoration
        const croissantSize = 100;
        ctx.drawImage(
            this.game.croissantImage,
            this.game.width / 2 - croissantSize / 2,
            50,
            croissantSize,
            croissantSize
        );
    }
}
