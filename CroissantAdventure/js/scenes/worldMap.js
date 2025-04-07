/**
 * World Map Scene
 * The main game world where the player can navigate and discover minigames
 */
class WorldMapScene extends Scene {
    constructor(game) {
        super(game);
        
        // Player properties
        this.player = {
            x: game.width / 2,
            y: game.height / 2,
            width: 40,
            height: 40,
            speed: 150 // pixels per second
        };
        
        // Minigame zones
        this.minigameZones = [
            {
                x: 200,
                y: 150,
                width: 60,
                height: 60,
                name: 'Coin Collector',
                scene: 'coinCollector',
                color: '#ffcc00'
            },
            {
                x: 600,
                y: 150,
                width: 60,
                height: 60,
                name: 'Roulette',
                scene: 'roulette',
                color: '#ff5500'
            },
            {
                x: 400,
                y: 450,
                width: 60,
                height: 60,
                name: 'Chess',
                scene: 'chess',
                color: '#5555ff'
            }
        ];
        
        // Map properties
        this.map = {
            width: 800,
            height: 600,
            tileSize: 40,
            walls: [
                // Top wall
                { x: 0, y: 0, width: 800, height: 40 },
                // Bottom wall
                { x: 0, y: 560, width: 800, height: 40 },
                // Left wall
                { x: 0, y: 0, width: 40, height: 600 },
                // Right wall
                { x: 760, y: 0, width: 40, height: 600 },
                // Center obstacle
                { x: 360, y: 260, width: 80, height: 80 }
            ]
        };
        
        // UI
        this.interactionPrompt = null;
    }
    
    enter() {
        // Reset player position if coming back from a minigame
        // (keeping the position when first entering from the main menu)
    }
    
    exit() {
        // Nothing specific needed here
    }
    
    /**
     * Check if a rectangle collides with any wall
     */
    checkWallCollision(rect) {
        for (const wall of this.map.walls) {
            if (
                rect.x < wall.x + wall.width &&
                rect.x + rect.width > wall.x &&
                rect.y < wall.y + wall.height &&
                rect.y + rect.height > wall.y
            ) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if the player is close to a minigame zone
     */
    getNearbyMinigameZone() {
        const interactionDistance = 60;
        
        for (const zone of this.minigameZones) {
            const dx = this.player.x + this.player.width / 2 - (zone.x + zone.width / 2);
            const dy = this.player.y + this.player.height / 2 - (zone.y + zone.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < interactionDistance) {
                return zone;
            }
        }
        
        return null;
    }
    
    update(deltaTime) {
        // Debugging output
        console.log('World Map Update:', this.player.x, this.player.y);
        console.log('Keys pressed:', this.game.keys);
        
        // Handle player movement
        let dx = 0;
        let dy = 0;
        
        // Check for keyboard movement with flexible key detection
        if (this.game.isKeyPressed('w') || this.game.isKeyPressed('arrowup')) {
            dy -= this.player.speed * deltaTime;
            console.log('Moving UP');
        }
        if (this.game.isKeyPressed('s') || this.game.isKeyPressed('arrowdown')) {
            dy += this.player.speed * deltaTime;
            console.log('Moving DOWN');
        }
        if (this.game.isKeyPressed('a') || this.game.isKeyPressed('arrowleft')) {
            dx -= this.player.speed * deltaTime;
            console.log('Moving LEFT');
        }
        if (this.game.isKeyPressed('d') || this.game.isKeyPressed('arrowright')) {
            dx += this.player.speed * deltaTime;
            console.log('Moving RIGHT');
        }
        
        // Add manual movement buttons for mobile/touchscreen users
        // Check if user clicked in the bottom corner movement controls
        if (this.game.mouseDown) {
            const mx = this.game.mouseX;
            const my = this.game.mouseY;
            
            // Simple directional buttons in the corners
            if (mx < 50 && my > this.game.height - 50) {
                // Left button
                dx -= this.player.speed * deltaTime * 2;
            } else if (mx > this.game.width - 50 && my > this.game.height - 50) {
                // Right button
                dx += this.player.speed * deltaTime * 2;
            } else if (mx < 50 && my < 50) {
                // Up button
                dy -= this.player.speed * deltaTime * 2;
            } else if (mx > this.game.width - 50 && my < 50) {
                // Down button
                dy += this.player.speed * deltaTime * 2;
            }
        }
        
        // Move player and handle collision
        if (dx !== 0) {
            const newX = this.player.x + dx;
            const newRect = {
                x: newX,
                y: this.player.y,
                width: this.player.width,
                height: this.player.height
            };
            
            if (!this.checkWallCollision(newRect)) {
                this.player.x = newX;
            }
        }
        
        if (dy !== 0) {
            const newY = this.player.y + dy;
            const newRect = {
                x: this.player.x,
                y: newY,
                width: this.player.width,
                height: this.player.height
            };
            
            if (!this.checkWallCollision(newRect)) {
                this.player.y = newY;
            }
        }
        
        // Check for nearby minigame zones
        const nearbyZone = this.getNearbyMinigameZone();
        if (nearbyZone) {
            this.interactionPrompt = {
                text: `Press E to play ${nearbyZone.name}`,
                zone: nearbyZone
            };
            
            // Handle interaction
            if (this.game.isKeyPressed('e')) {
                this.game.switchScene(nearbyZone.scene);
            }
        } else {
            this.interactionPrompt = null;
        }
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#557733';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw grass tiles - simplified to improve performance
        ctx.fillStyle = '#4a6c2a';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Add a grid pattern for visual reference
        ctx.strokeStyle = '#5a7c3a';
        ctx.lineWidth = 1;
        for (let y = 0; y < this.map.height; y += this.map.tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.game.width, y);
            ctx.stroke();
        }
        
        for (let x = 0; x < this.map.width; x += this.map.tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.game.height);
            ctx.stroke();
        }
        
        // Draw walls
        for (const wall of this.map.walls) {
            // Use stone wall tile (second tile in tileset)
            for (let y = wall.y; y < wall.y + wall.height; y += this.map.tileSize) {
                for (let x = wall.x; x < wall.x + wall.width; x += this.map.tileSize) {
                    ctx.drawImage(
                        this.game.tilesetImage,
                        40, 0, 40, 40,
                        x, y, this.map.tileSize, this.map.tileSize
                    );
                }
            }
        }
        
        // Draw minigame zones
        for (const zone of this.minigameZones) {
            ctx.fillStyle = zone.color;
            ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
            
            // Draw zone label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(zone.name, zone.x + zone.width / 2, zone.y + zone.height + 15);
        }
        
        // Draw player - with fallback if image isn't loaded
        if (this.game.croissantImage.complete && this.game.croissantImage.naturalHeight !== 0) {
            ctx.drawImage(
                this.game.croissantImage,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
            console.log('Drew player with image');
        } else {
            // Fallback if image isn't loaded
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.moveTo(this.player.x + this.player.width/2, this.player.y);
            ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
            ctx.lineTo(this.player.x, this.player.y + this.player.height);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'brown';
            ctx.lineWidth = 2;
            ctx.stroke();
            console.log('Drew fallback player triangle');
        }
        
        // Draw on-screen controls for mobile/touch
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(30, this.game.height - 30, 20, 0, Math.PI * 2); // Left
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.game.width - 30, this.game.height - 30, 20, 0, Math.PI * 2); // Right
        ctx.fill();
        ctx.beginPath();
        ctx.arc(30, 30, 20, 0, Math.PI * 2); // Up
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.game.width - 30, 30, 20, 0, Math.PI * 2); // Down
        ctx.fill();
        
        // Add directional arrows
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('←', 30, this.game.height - 30); // Left
        ctx.fillText('→', this.game.width - 30, this.game.height - 30); // Right
        ctx.fillText('↑', 30, 30); // Up
        ctx.fillText('↓', this.game.width - 30, 30); // Down
        
        // Draw interaction prompt
        if (this.interactionPrompt) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
                this.game.width / 2 - 150,
                this.game.height - 60,
                300,
                40
            );
            
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.interactionPrompt.text,
                this.game.width / 2,
                this.game.height - 40
            );
        }
    }
}
