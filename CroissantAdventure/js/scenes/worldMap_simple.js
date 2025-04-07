/**
 * Simplified World Map Scene
 * A basic version that should work better when loaded directly from a file
 */
class WorldMapScene extends Scene {
    constructor(game) {
        super(game);
        console.log("Creating world map scene");
        
        // Player properties
        this.player = {
            x: game.width / 2,
            y: game.height / 2,
            width: 40,
            height: 40,
            speed: 200, // pixels per second
            direction: 'right', // for animation
            animFrame: 0,
            animTimer: 0
        };
        
        // Minigame zones
        this.minigameZones = [
            // Original games - reorganized for larger map
            {
                x: 200,
                y: 150,
                width: 70,
                height: 70,
                name: 'Coin Collector',
                scene: 'coinCollector',
                color: '#ffcc00',
                points: 10,
                icon: '🪙'
            },
            {
                x: 900,
                y: 180,
                width: 70,
                height: 70,
                name: 'Roulette',
                scene: 'roulette',
                color: '#ff5500',
                points: 15,
                icon: '🎰'
            },
            {
                x: 600,
                y: 650,
                width: 70,
                height: 70,
                name: 'Chess',
                scene: 'chess',
                color: '#5555ff',
                points: 20,
                icon: '♞'
            },
            {
                x: 150,
                y: 450,
                width: 70,
                height: 70,
                name: 'Maze',
                scene: 'maze',
                color: '#66cc66',
                points: 25,
                icon: '🧩'
            },
            {
                x: 950,
                y: 350,
                width: 70,
                height: 70,
                name: 'Shooter',
                scene: 'shooter',
                color: '#ff6666',
                points: 30,
                icon: '🔫'
            },
            
            // New games
            {
                x: 300,
                y: 350,
                width: 70,
                height: 70,
                name: 'Platform Jump',
                scene: 'platform',
                color: '#66aaff',
                points: 35,
                icon: '🏃'
            },
            {
                x: 550,
                y: 250,
                width: 70,
                height: 70,
                name: 'Memory Match',
                scene: 'memory',
                color: '#cc66ff',
                points: 40,
                icon: '🃏'
            },
            {
                x: 800,
                y: 500,
                width: 70,
                height: 70,
                name: 'Snake',
                scene: 'snake',
                color: '#44cc44',
                points: 45,
                icon: '🐍'
            },
            {
                x: 400,
                y: 550,
                width: 70,
                height: 70,
                name: 'Puzzle Slide',
                scene: 'puzzle',
                color: '#ff9966',
                points: 50,
                icon: '🧠'
            },
            {
                x: 700,
                y: 130,
                width: 70,
                height: 70,
                name: 'Rhythm Game',
                scene: 'rhythm',
                color: '#ff66cc',
                points: 55,
                icon: '🎵'
            },
            {
                x: 450,
                y: 400,
                width: 80,
                height: 80,
                name: 'Tower Defense',
                scene: 'towerDefense',
                color: '#9966ff',
                points: 70,
                icon: '🏰'
            }
        ];
        
        // Collectible coins on the map
        this.coins = [];
        this.generateCoins(10);
        
        // Decorative elements
        this.decorations = [
            { x: 100, y: 100, type: 'tree' },
            { x: 700, y: 200, type: 'tree' },
            { x: 300, y: 500, type: 'tree' },
            { x: 500, y: 100, type: 'rock' },
            { x: 200, y: 400, type: 'rock' },
            { x: 600, y: 500, type: 'rock' }
        ];
        
        // UI
        this.interactionPrompt = null;
        this.showScoreUI = true;
        this.showMinimap = true;
    }
    
    enter() {
        console.log("Entering world map scene");
        
        // Check if player is in a minigame zone and move them away if needed
        let isInMinigameZone = false;
        let closestZone = null;
        let shortestDistance = Infinity;
        
        // Get player center position
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        // Find if player is in any minigame zone
        for (const zone of this.minigameZones) {
            const zoneCenterX = zone.x + zone.width / 2;
            const zoneCenterY = zone.y + zone.height / 2;
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < zone.width / 2 + 20) { // Added 20px buffer
                isInMinigameZone = true;
            }
            
            // Track the closest zone for reference
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestZone = zone;
            }
        }
        
        // If player is in a minigame zone, move them out
        if (isInMinigameZone && closestZone) {
            console.log("Player is in minigame zone on return, repositioning");
            const zoneCenterX = closestZone.x + closestZone.width / 2;
            const zoneCenterY = closestZone.y + closestZone.height / 2;
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            
            // Determine direction away from zone (normalize vector)
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance === 0) distance = 1; // Avoid division by zero
            
            // Move the player away by 100 pixels in the direction away from the zone
            const moveDistance = closestZone.width / 2 + 60; // 60px buffer
            this.player.x = zoneCenterX + (dx / distance) * moveDistance - this.player.width / 2;
            this.player.y = zoneCenterY + (dy / distance) * moveDistance - this.player.height / 2;
            
            // Keep player inside boundaries
            this.player.x = Math.max(0, Math.min(this.player.x, this.game.width - this.player.width));
            this.player.y = Math.max(0, Math.min(this.player.y, this.game.height - this.player.height));
        }
    }
    
    exit() {
        // Nothing specific needed here
    }
    
    update(deltaTime) {
        // Handle player movement
        let dx = 0;
        let dy = 0;
        
        // Check for keyboard movement
        if (this.game.isKeyPressed('w') || this.game.isKeyPressed('arrowup')) {
            dy -= this.player.speed * deltaTime;
            this.player.direction = 'up';
        }
        if (this.game.isKeyPressed('s') || this.game.isKeyPressed('arrowdown')) {
            dy += this.player.speed * deltaTime;
            this.player.direction = 'down';
        }
        if (this.game.isKeyPressed('a') || this.game.isKeyPressed('arrowleft')) {
            dx -= this.player.speed * deltaTime;
            this.player.direction = 'left';
        }
        if (this.game.isKeyPressed('d') || this.game.isKeyPressed('arrowright')) {
            dx += this.player.speed * deltaTime;
            this.player.direction = 'right';
        }
        
        // Toggle UI elements
        if (this.game.isKeyPressed('m') && !this.mPressed) {
            this.showMinimap = !this.showMinimap;
            this.mPressed = true;
        } else if (!this.game.isKeyPressed('m')) {
            this.mPressed = false;
        }
        
        if (this.game.isKeyPressed('tab') && !this.tabPressed) {
            this.showScoreUI = !this.showScoreUI;
            this.tabPressed = true;
        } else if (!this.game.isKeyPressed('tab')) {
            this.tabPressed = false;
        }
        
        // Add click-to-move functionality
        if (this.game.mouseDown) {
            const targetX = this.game.mouseX;
            const targetY = this.game.mouseY;
            
            // Calculate direction to target
            const dirX = targetX - (this.player.x + this.player.width/2);
            const dirY = targetY - (this.player.y + this.player.height/2);
            
            // Set player direction based on movement
            if (Math.abs(dirX) > Math.abs(dirY)) {
                this.player.direction = dirX > 0 ? 'right' : 'left';
            } else {
                this.player.direction = dirY > 0 ? 'down' : 'up';
            }
            
            // Normalize and scale by speed
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            if (length > 5) { // Only move if clicked some distance away
                dx = dirX / length * this.player.speed * deltaTime;
                dy = dirY / length * this.player.speed * deltaTime;
            }
        }
        
        // Move player with boundary checking and collision detection
        if (dx !== 0 || dy !== 0) {
            // Update animation
            this.player.animTimer += deltaTime;
            if (this.player.animTimer > 0.2) { // Frame change every 0.2 seconds
                this.player.animFrame = (this.player.animFrame + 1) % 2; // Toggle between 0 and 1
                this.player.animTimer = 0;
            }
            
            // Move with boundary checking
            this.player.x = Math.max(0, Math.min(this.player.x + dx, this.game.width - this.player.width));
            this.player.y = Math.max(0, Math.min(this.player.y + dy, this.game.height - this.player.height));
        }
        
        // Check coin collection
        this.checkCoinCollection();
        
        // Check for minigame zones
        for (const zone of this.minigameZones) {
            // Check if player center is inside zone
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            
            // Calculate distance to zone center
            const zoneCenterX = zone.x + zone.width / 2;
            const zoneCenterY = zone.y + zone.height / 2;
            const dx = playerCenterX - zoneCenterX;
            const dy = playerCenterY - zoneCenterY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < zone.width / 2) {
                // Player is in a minigame zone - enter the minigame
                console.log(`Entering minigame: ${zone.name}`);
                this.game.addPoints(zone.points, 'minigame');
                this.game.switchScene(zone.scene);
                break;
            }
        }
    }
    
    // New method to generate coins on the map
    generateCoins(count) {
        for (let i = 0; i < count; i++) {
            // Find position not overlapping with zones
            let valid = false;
            let x, y;
            while (!valid) {
                x = 50 + Math.random() * (this.game.width - 100);
                y = 50 + Math.random() * (this.game.height - 100);
                valid = true;
                
                // Check no collision with minigame zones
                for (const zone of this.minigameZones) {
                    const dx = x - (zone.x + zone.width/2);
                    const dy = y - (zone.y + zone.height/2);
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < 80) {
                        valid = false;
                        break;
                    }
                }
            }
            
            this.coins.push({
                x: x,
                y: y,
                size: 20,
                collected: false,
                animOffset: Math.random() * Math.PI * 2 // For floating animation
            });
        }
    }
    
    // Check for coin collection
    checkCoinCollection() {
        const playerCenterX = this.player.x + this.player.width/2;
        const playerCenterY = this.player.y + this.player.height/2;
        
        for (const coin of this.coins) {
            if (!coin.collected) {
                const dx = playerCenterX - coin.x;
                const dy = playerCenterY - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 30) { // Collection radius
                    coin.collected = true;
                    this.game.addPoints(5, 'coin');
                    // Create a visual feedback text
                    console.log('Coin collected! +5 points');
                }
            }
        }
    }
    
    render(ctx) {
        // Draw background with nicer grass pattern
        const grassPattern = ctx.createPattern(this.game.tilesetImage, 'repeat');
        ctx.fillStyle = grassPattern || '#4a6c2a';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw minigame zones
        for (const zone of this.minigameZones) {
            // Draw zone
            ctx.fillStyle = zone.color;
            ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
            
            // Draw zone label
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(zone.name, zone.x + zone.width / 2, zone.y + zone.height / 2);
        }
        
        // Draw decorations
        for (const decoration of this.decorations) {
            if (decoration.type === 'tree') {
                // Draw tree
                ctx.fillStyle = '#225522';
                ctx.beginPath();
                ctx.moveTo(decoration.x, decoration.y - 40);
                ctx.lineTo(decoration.x + 30, decoration.y);
                ctx.lineTo(decoration.x - 30, decoration.y);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(decoration.x - 5, decoration.y, 10, 20);
            } else if (decoration.type === 'rock') {
                // Draw rock
                ctx.fillStyle = '#999999';
                ctx.beginPath();
                ctx.ellipse(decoration.x, decoration.y, 20, 15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#777777';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        
        // Draw minigame zones with improved visuals
        for (const zone of this.minigameZones) {
            // Draw zone background
            ctx.fillStyle = zone.color;
            ctx.beginPath();
            ctx.arc(zone.x + zone.width/2, zone.y + zone.height/2, zone.width/2 + 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw zone inner circle
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(zone.x + zone.width/2, zone.y + zone.height/2, zone.width/2 - 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw zone icon
            ctx.fillStyle = zone.color;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(zone.icon, zone.x + zone.width/2, zone.y + zone.height/2);
            
            // Draw zone name
            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial';
            ctx.fillText(zone.name, zone.x + zone.width/2, zone.y + zone.height + 15);
        }
        
        // Draw coins
        const now = Date.now() / 1000;
        for (const coin of this.coins) {
            if (!coin.collected) {
                // Floating animation
                const yOffset = Math.sin(now + coin.animOffset) * 3;
                
                // Draw coin
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(coin.x, coin.y + yOffset, coin.size/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#cc9900';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw coin inner detail
                ctx.fillStyle = '#cc9900';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', coin.x, coin.y + yOffset);
            }
        }
        
        // Draw player using croissant image
        if (this.game.croissantImage.complete && this.game.croissantImage.naturalHeight !== 0) {
            // Use the croissant image
            ctx.drawImage(
                this.game.croissantImage,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
        } else {
            // Fallback to a nice croissant shape
            ctx.fillStyle = '#e6b266'; // Croissant color
            ctx.beginPath();
            ctx.ellipse(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 
                       this.player.width/2, this.player.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#966f33'; // Darker outline
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Draw score UI
        if (this.showScoreUI) {
            const padding = 10;
            const uiWidth = 180;
            const uiHeight = 90;
            
            // Draw UI panel
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(padding, padding, uiWidth, uiHeight);
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 2;
            ctx.strokeRect(padding, padding, uiWidth, uiHeight);
            
            // Draw score text
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Puntos: ${this.game.playerScore}`, padding + 10, padding + 10);
            ctx.fillText(`Monedas: ${this.game.playerCoins}`, padding + 10, padding + 35);
            ctx.fillText(`Minijuegos: ${this.game.achievements.minigamesPlayed}`, padding + 10, padding + 60);
        }
        
        // Draw minimap
        if (this.showMinimap) {
            const mapSize = 120;
            const mapX = this.game.width - mapSize - 10;
            const mapY = 10;
            
            // Draw map background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(mapX, mapY, mapSize, mapSize);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(mapX, mapY, mapSize, mapSize);
            
            // Draw minigame zones on minimap
            const scaleX = mapSize / this.game.width;
            const scaleY = mapSize / this.game.height;
            
            for (const zone of this.minigameZones) {
                const miniX = mapX + zone.x * scaleX;
                const miniY = mapY + zone.y * scaleY;
                const miniSize = zone.width * scaleX;
                
                ctx.fillStyle = zone.color;
                ctx.beginPath();
                ctx.arc(miniX + miniSize/2, miniY + miniSize/2, miniSize/2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw player on minimap
            const miniPlayerX = mapX + this.player.x * scaleX;
            const miniPlayerY = mapY + this.player.y * scaleY;
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(miniPlayerX + this.player.width * scaleX / 2, 
                    miniPlayerY + this.player.height * scaleY / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw instructions with better UI
        const instructions = [
            'WASD o flechas para moverte',
            'Clic para moverte a un punto',
            'Recoge monedas para ganar puntos',
            'Entra en las zonas para jugar minijuegos'
        ];
        
        const instructionsY = this.game.height - 25 * instructions.length - 10;
        
        // Background panel for instructions
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, instructionsY - 10, this.game.width, 25 * instructions.length + 20);
        
        // Instruction text
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        instructions.forEach((text, i) => {
            ctx.fillText(text, this.game.width / 2, instructionsY + i * 25);
        });
    }
}
