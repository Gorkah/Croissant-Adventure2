/**
 * Rhythm Game Minigame
 * A music rhythm game where the player has to press keys when notes hit the target zone
 */
class RhythmMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    reset() {
        // Game properties
        this.totalDuration = 60; // 60 seconds of gameplay
        this.timeLeft = this.totalDuration;
        this.lanes = 4; // Number of lanes (keys)
        this.laneWidth = 80;
        this.totalWidth = this.lanes * this.laneWidth;
        this.noteHeight = 30;
        this.noteSpeed = 300; // pixels per second
        
        // Lane positions
        this.laneX = (this.game.width - this.totalWidth) / 2;
        this.targetY = this.game.height - 100;
        
        // Keys for each lane
        this.laneKeys = ['a', 's', 'd', 'f'];
        this.laneColors = ['#ff5555', '#55ff55', '#5555ff', '#ffff55'];
        
        // Game state
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.accuracy = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.gameOver = false;
        
        // Note tracking
        this.notes = [];
        this.noteCooldown = 0;
        this.noteSpawnRate = 0.7; // seconds between notes
        this.difficulty = 1; // multiplier for spawn rate
        
        // Hit effects
        this.hitEffects = [];
        
        // Key tracking for preventing continuous hits
        this.laneActive = new Array(this.lanes).fill(false);
        
        // Song beat tracking
        this.beatInterval = 0.5; // 120 BPM (0.5 seconds per beat)
        this.beatTimer = 0;
        this.onBeat = false;
        
        // Instructions
        this.showInstructions = true;
        this.instructionTimer = 3;
    }
    
    spawnNote() {
        const lane = Math.floor(Math.random() * this.lanes);
        this.notes.push({
            lane: lane,
            y: 0,
            hit: false,
            missed: false
        });
        this.totalNotes++;
    }
    
    enter() {
        console.log("Entering Rhythm Game minigame");
        this.reset();
    }
    
    exit() {
        console.log("Exiting Rhythm Game minigame");
    }
    
    update(deltaTime) {
        // Call parent update method to handle exit button
        super.update(deltaTime);
        
        // Update instruction timer
        if (this.showInstructions) {
            this.instructionTimer -= deltaTime;
            if (this.instructionTimer <= 0) {
                this.showInstructions = false;
            }
            return;
        }
        
        // Skip game logic if game is over
        if (this.gameOver) {
            if (this.game.mouseDown) {
                const buttonX = this.game.width / 2;
                const buttonY = this.game.height / 2 + 100;
                const buttonWidth = 150;
                const buttonHeight = 40;
                
                if (
                    this.game.mouseX >= buttonX - buttonWidth / 2 &&
                    this.game.mouseX <= buttonX + buttonWidth / 2 &&
                    this.game.mouseY >= buttonY - buttonHeight / 2 &&
                    this.game.mouseY <= buttonY + buttonHeight / 2
                ) {
                    this.reset();
                    this.game.mouseDown = false;
                }
            }
            return;
        }
        
        // Update time
        this.timeLeft -= deltaTime;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.gameOver = true;
            
            // Calculate final score
            this.accuracy = this.totalNotes > 0 ? (this.hitNotes / this.totalNotes) * 100 : 0;
            const finalScore = Math.floor(this.score + this.maxCombo * 5 + this.accuracy * 10);
            
            // Add to main game score
            this.game.addPoints(finalScore, 'rhythm');
            return;
        }
        
        // Update beat timer for visual effects
        this.beatTimer += deltaTime;
        if (this.beatTimer >= this.beatInterval) {
            this.beatTimer -= this.beatInterval;
            this.onBeat = true;
            
            // Increase difficulty over time
            this.difficulty = Math.min(2, 1 + (this.totalDuration - this.timeLeft) / this.totalDuration);
        } else {
            this.onBeat = false;
        }
        
        // Spawn notes
        this.noteCooldown -= deltaTime;
        if (this.noteCooldown <= 0) {
            // Adjust spawn rate based on difficulty
            this.noteCooldown = this.noteSpawnRate / this.difficulty;
            this.spawnNote();
        }
        
        // Update notes
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            
            // Move note down
            note.y += this.noteSpeed * deltaTime;
            
            // Check if note reached target zone
            if (!note.hit && !note.missed && note.y >= this.targetY - this.noteHeight && note.y <= this.targetY + this.noteHeight) {
                // Check if the corresponding key is pressed
                if (this.game.keys[this.laneKeys[note.lane]] && !this.laneActive[note.lane]) {
                    // Note hit
                    note.hit = true;
                    this.laneActive[note.lane] = true;
                    
                    // Calculate score based on accuracy
                    const hitAccuracy = 1 - Math.abs(note.y - this.targetY) / this.noteHeight;
                    let hitScore = 0;
                    let hitText = '';
                    
                    if (hitAccuracy > 0.9) {
                        hitScore = 100;
                        hitText = 'Perfect!';
                        this.combo++;
                    } else if (hitAccuracy > 0.7) {
                        hitScore = 75;
                        hitText = 'Great!';
                        this.combo++;
                    } else if (hitAccuracy > 0.4) {
                        hitScore = 50;
                        hitText = 'Good';
                        this.combo++;
                    } else {
                        hitScore = 25;
                        hitText = 'OK';
                        this.combo = 0;
                    }
                    
                    // Apply combo multiplier
                    const comboMultiplier = 1 + Math.min(1, this.combo / 10);
                    hitScore = Math.floor(hitScore * comboMultiplier);
                    
                    this.score += hitScore;
                    this.hitNotes++;
                    this.maxCombo = Math.max(this.maxCombo, this.combo);
                    
                    // Create hit effect
                    this.hitEffects.push({
                        x: this.laneX + note.lane * this.laneWidth + this.laneWidth / 2,
                        y: this.targetY,
                        text: hitText,
                        score: `+${hitScore}`,
                        life: 1, // 1 second life
                        color: this.laneColors[note.lane]
                    });
                }
            } else if (note.y > this.targetY + this.noteHeight && !note.hit) {
                // Note missed
                note.missed = true;
                this.combo = 0;
                
                // Create miss effect
                this.hitEffects.push({
                    x: this.laneX + note.lane * this.laneWidth + this.laneWidth / 2,
                    y: this.targetY,
                    text: 'Miss',
                    score: '',
                    life: 1,
                    color: '#ff0000'
                });
            }
            
            // Remove notes that are far past the target or have been hit
            if (note.y > this.game.height || (note.hit && note.y > this.targetY + 50)) {
                this.notes.splice(i, 1);
            }
        }
        
        // Reset lane active state when key is released
        for (let i = 0; i < this.lanes; i++) {
            if (!this.game.keys[this.laneKeys[i]]) {
                this.laneActive[i] = false;
            }
        }
        
        // Update hit effects
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            const effect = this.hitEffects[i];
            effect.life -= deltaTime;
            if (effect.life <= 0) {
                this.hitEffects.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
        gradient.addColorStop(0, '#220033');
        gradient.addColorStop(1, '#330066');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw beat visualization
        if (this.onBeat) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }
        
        // Draw decorative music notes in the background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(i * 0.3 + Date.now() / 2000) * 0.5 + 0.5) * this.game.width;
            const y = (i / 20 * this.game.height + Date.now() / 50) % this.game.height;
            const size = 10 + i % 10;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw lane backgrounds
        for (let i = 0; i < this.lanes; i++) {
            ctx.fillStyle = `rgba(${i * 50}, ${i * 40}, ${150 - i * 20}, 0.3)`;
            ctx.fillRect(
                this.laneX + i * this.laneWidth,
                0,
                this.laneWidth,
                this.game.height
            );
            
            // Draw lane dividers
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.laneX + i * this.laneWidth, 0);
            ctx.lineTo(this.laneX + i * this.laneWidth, this.game.height);
            ctx.stroke();
        }
        
        // Draw target zone
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.laneX, this.targetY);
        ctx.lineTo(this.laneX + this.totalWidth, this.targetY);
        ctx.stroke();
        
        // Draw key indicators
        for (let i = 0; i < this.lanes; i++) {
            const isActive = this.laneActive[i];
            ctx.fillStyle = isActive ? this.laneColors[i] : 'rgba(255, 255, 255, 0.8)';
            
            // Draw key circle
            ctx.beginPath();
            ctx.arc(
                this.laneX + i * this.laneWidth + this.laneWidth / 2,
                this.targetY,
                this.laneWidth / 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw key letter
            ctx.fillStyle = '#000000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.laneKeys[i].toUpperCase(),
                this.laneX + i * this.laneWidth + this.laneWidth / 2,
                this.targetY
            );
        }
        
        // Draw notes
        for (const note of this.notes) {
            if (note.hit || note.missed) continue;
            
            ctx.fillStyle = this.laneColors[note.lane];
            ctx.fillRect(
                this.laneX + note.lane * this.laneWidth + 5,
                note.y,
                this.laneWidth - 10,
                this.noteHeight
            );
            
            // Draw note border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.laneX + note.lane * this.laneWidth + 5,
                note.y,
                this.laneWidth - 10,
                this.noteHeight
            );
        }
        
        // Draw hit effects
        for (const effect of this.hitEffects) {
            const alpha = effect.life;
            ctx.fillStyle = effect.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(effect.text, effect.x, effect.y - 20 * (1 - effect.life));
            
            ctx.font = '18px Arial';
            ctx.fillText(effect.score, effect.x, effect.y + 20 - 10 * (1 - effect.life));
        }
        
        // Draw UI
        super.render(ctx); // Draw exit button
        
        // Draw score and combo
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${this.score}`, 20, 80);
        ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, 20, 110);
        
        ctx.textAlign = 'right';
        ctx.fillText(`Combo: ${this.combo}x`, this.game.width - 20, 80);
        ctx.fillText(`Max Combo: ${this.maxCombo}x`, this.game.width - 20, 110);
        
        // Calculate and display current accuracy
        const currentAccuracy = this.totalNotes > 0 ? (this.hitNotes / this.totalNotes) * 100 : 0;
        ctx.textAlign = 'center';
        ctx.fillText(`Accuracy: ${currentAccuracy.toFixed(1)}%`, this.game.width / 2, 30);
        
        // Draw instructions
        if (this.showInstructions) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Rhythm Game', this.game.width / 2, this.game.height / 3 - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText('Press A, S, D, F keys when notes reach the circles', this.game.width / 2, this.game.height / 3);
            ctx.fillText('Perfect timing gives more points', this.game.width / 2, this.game.height / 3 + 35);
            ctx.fillText('Build combos for higher scores', this.game.width / 2, this.game.height / 3 + 70);
        }
        
        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffcc00';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Song Complete!', this.game.width / 2, this.game.height / 3);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.fillText(`Score: ${this.score}`, this.game.width / 2, this.game.height / 2 - 60);
            ctx.fillText(`Max Combo: ${this.maxCombo}x`, this.game.width / 2, this.game.height / 2 - 30);
            ctx.fillText(`Accuracy: ${this.accuracy.toFixed(1)}%`, this.game.width / 2, this.game.height / 2);
            
            // Calculate final score
            const finalScore = Math.floor(this.score + this.maxCombo * 5 + this.accuracy * 10);
            ctx.fillText(`Final Score: ${finalScore}`, this.game.width / 2, this.game.height / 2 + 30);
            
            // Play again button
            ctx.fillStyle = '#4CAF50';
            const buttonX = this.game.width / 2;
            const buttonY = this.game.height / 2 + 100;
            const buttonWidth = 150;
            const buttonHeight = 40;
            
            ctx.fillRect(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight
            );
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText('Play Again', buttonX, buttonY);
        }
    }
}
