/**
 * Roulette Minigame
 * A wheel of fortune that spins when clicked and gives random rewards
 */
class RouletteMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
        this.particles = [];
        this.lightAngle = 0;
        this.pulseEffect = 0;
    }
    
    /**
     * Reset the minigame state
     */
    reset() {
        // Roulette properties
        this.centerX = this.game.width / 2;
        this.centerY = this.game.height / 2;
        this.radius = 150;
        
        // Game state
        this.spinning = false;
        this.rotationSpeed = 0;
        this.currentRotation = 0;
        this.spinTime = 0;
        this.spinDuration = 3; // seconds
        this.result = null;
        this.particles = [];
        this.lightAngle = 0;
        this.pulseEffect = 0;
        
        // Segments of the wheel
        this.segments = [
            { label: '🎁 10 Points', color: '#FF6B6B', shadowColor: '#CC5555', value: 10 },
            { label: '💎 20 Points', color: '#4ECDC4', shadowColor: '#3BA39C', value: 20 },
            { label: '⭐ 30 Points', color: '#45B7D1', shadowColor: '#3691B8', value: 30 },
            { label: '🏆 40 Points', color: '#FFA07A', shadowColor: '#E6916B', value: 40 },
            { label: '💰 50 Points', color: '#98D8C8', shadowColor: '#7BB8A8', value: 50 },
            { label: '💔 0 Points', color: '#6C7B7F', shadowColor: '#545E62', value: 0 },
            { label: '🌟 5 Points', color: '#F7DC6F', shadowColor: '#E4C65A', value: 5 },
            { label: '💫 15 Points', color: '#BB8FCE', shadowColor: '#A374B5', value: 15 }
        ];
    }
    
    enter() {
        this.reset();
    }
    
    exit() {
        // Nothing specific needed
    }
    
    /**
     * Start spinning the wheel
     */
    startSpin() {
        if (!this.spinning) {
            this.spinning = true;
            this.spinTime = 0;
            this.rotationSpeed = 5 + Math.random() * 10; // Random speed between 5 and 15 radians per second
            this.result = null;
            this.createSparkles();
        }
    }

    /**
    * Create sparkle particles
    */
    createSparkles() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.centerX + (Math.random() - 0.5) * this.radius * 2,
                y: this.centerY + (Math.random() - 0.5) * this.radius * 2,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
    }

    /**
    * Create win particles
    */
    createWinParticles() {
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: this.centerX,
                y: this.centerY,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                decay: Math.random() * 0.015 + 0.008,
                size: Math.random() * 6 + 3,
                color: this.result ? this.result.color : '#FFD700'
            });
        }
    }
    
    update(deltaTime) {
        // Call parent update to handle exit button
        super.update(deltaTime);
        
        // Update wheel rotation
        if (this.spinning) {
            this.spinTime += deltaTime;
            
            // Apply easing to gradually slow down the wheel
            const progress = Math.min(this.spinTime / this.spinDuration, 1);
            const easingFactor = 1 - progress * progress; // Quadratic ease-out
            
            const currentSpeed = this.rotationSpeed * easingFactor;
            this.currentRotation += currentSpeed * deltaTime;
            this.lightAngle += deltaTime * 8; // Rotating lights effect
            
            // Normalize rotation
            if (this.currentRotation > Math.PI * 2) {
                this.currentRotation -= Math.PI * 2;
            }
            
            // Check if spinning is complete
            if (progress === 1) {
                this.spinning = false;
                this.determineResult();
                this.createWinParticles();
            }
            // Update particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle = this.particles[i];
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                particle.life -= particle.decay;
                if (particle.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }

            // Update pulse effect
            this.pulseEffect += deltaTime * 4;
        }
        
        // Check for click to spin
        if (this.game.mouseDown && !this.spinning && !this.result) {
            const dx = this.game.mouseX - this.centerX;
            const dy = this.game.mouseY - this.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.radius) {
                this.startSpin();
                this.game.mouseDown = false;
            }
        }
        
        // Check for click to reset after result
        if (this.game.mouseDown && !this.spinning && this.result) {
            this.reset();
            this.game.mouseDown = false;
        }
    }
    
    /**
     * Determine the result after spinning
     */
    determineResult() {
        // Calculate which segment the wheel landed on
        const segmentAngle = Math.PI * 2 / this.segments.length;
        
        // La aguja está en la parte superior (PI/2), así que necesitamos ajustar la rotación
        // El ajuste es opuesto a la rotación de la rueda, ya que la rueda gira en sentido horario
        // pero queremos calcular qué segmento está en la parte superior
        const adjustedRotation = this.currentRotation + Math.PI / 2;
        const normalizedRotation = (adjustedRotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        
        // Invertimos el índice porque la rueda gira en sentido horario
        const segmentIndex = this.segments.length - 1 - Math.floor(normalizedRotation / segmentAngle);
        this.result = this.segments[segmentIndex % this.segments.length];
        
        // Añadir puntos al juego principal
        this.game.addPoints(this.result.value, 'roulette');
        console.log(`Añadidos ${this.result.value} puntos de la ruleta. Segmento: ${this.result.label}`);
    }
    
    render(ctx) {
    // Draw animated background
    const gradient = ctx.createRadialGradient(
        this.centerX, this.centerY, 0,
        this.centerX, this.centerY, this.game.width
    );
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    // Draw rotating light rings
    for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.lightAngle + i * Math.PI / 3);
        
        const ringGradient = ctx.createRadialGradient(0, 0, this.radius + 20 + i * 15, 0, 0, this.radius + 40 + i * 15);
        ringGradient.addColorStop(0, `rgba(255, 215, 0, ${0.1 + Math.sin(this.pulseEffect) * 0.05})`);
        ringGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = ringGradient;
        ctx.fillRect(-this.radius - 50, -this.radius - 50, (this.radius + 50) * 2, (this.radius + 50) * 2);
        ctx.restore();
    }

    // Draw roulette wheel with 3D effect
    const segmentAngle = Math.PI * 2 / this.segments.length;
    
    for (let i = 0; i < this.segments.length; i++) {
        const segment = this.segments[i];
        const startAngle = i * segmentAngle + this.currentRotation;
        const endAngle = (i + 1) * segmentAngle + this.currentRotation;
        
        // Draw shadow
        ctx.save();
        ctx.translate(3, 3);
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = segment.shadowColor;
        ctx.fill();
        ctx.restore();
        
        // Draw main segment
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
        ctx.closePath();
        
        // Create gradient for 3D effect
        const midAngle = startAngle + segmentAngle / 2;
        const gradientX = this.centerX + Math.cos(midAngle) * this.radius * 0.7;
        const gradientY = this.centerY + Math.sin(midAngle) * this.radius * 0.7;
        
        const segmentGradient = ctx.createRadialGradient(
            gradientX, gradientY, 0,
            this.centerX, this.centerY, this.radius
        );
        segmentGradient.addColorStop(0, segment.color);
        segmentGradient.addColorStop(1, segment.shadowColor);
        
        ctx.fillStyle = segmentGradient;
        ctx.fill();
        
        // Draw border with glow
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw segment label with better styling
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        // Text shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(segment.label, this.radius - 18, 1);
        
        // Main text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(segment.label, this.radius - 19, 0);
        ctx.restore();
    }
    
    // Draw center with metallic effect
    const centerGradient = ctx.createRadialGradient(
        this.centerX - 5, this.centerY - 5, 0,
        this.centerX, this.centerY, 25
    );
    centerGradient.addColorStop(0, '#ffffff');
    centerGradient.addColorStop(0.3, '#cccccc');
    centerGradient.addColorStop(1, '#888888');
    
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, 25, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw animated pointer
    const pointerPulse = 1 + Math.sin(this.pulseEffect * 2) * 0.1;
    ctx.save();
    ctx.translate(this.centerX, this.centerY - this.radius - 25);
    ctx.scale(pointerPulse, pointerPulse);
    
    // Pointer shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(2, 7);
    ctx.lineTo(-8, 22);
    ctx.lineTo(12, 22);
    ctx.closePath();
    ctx.fill();
    
    // Main pointer
    const pointerGradient = ctx.createLinearGradient(0, 0, 0, 25);
    pointerGradient.addColorStop(0, '#ff4444');
    pointerGradient.addColorStop(1, '#cc0000');
    
    ctx.fillStyle = pointerGradient;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(-10, 20);
    ctx.lineTo(10, 20);
    ctx.closePath();
    ctx.fill();
    
    // Pointer highlight
    ctx.fillStyle = '#ff8888';
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(-5, 15);
    ctx.lineTo(0, 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Draw particles
    for (const particle of this.particles) {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    // Draw UI
    super.render(ctx);
    
    // Draw title with glow effect
    ctx.save();
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('🎰 ROULETTE 🎰', this.game.width / 2, 15);
    ctx.restore();
    
    // Draw instruction with animation
    if (!this.spinning && !this.result) {
        const instructionPulse = 0.8 + Math.sin(this.pulseEffect * 3) * 0.2;
        ctx.save();
        ctx.globalAlpha = instructionPulse;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('✨ Click the wheel to spin! ✨', this.game.width / 2, this.game.height - 70);
        ctx.restore();
    }
    
    // Draw result with celebration effect
    if (this.result) {
        // Result background with gradient
        const resultGradient = ctx.createLinearGradient(
            this.game.width / 2 - 200, this.game.height - 120,
            this.game.width / 2 + 200, this.game.height - 40
        );
        resultGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        resultGradient.addColorStop(0.5, 'rgba(50, 50, 50, 0.9)');
        resultGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        
        ctx.fillStyle = resultGradient;
        ctx.fillRect(this.game.width / 2 - 200, this.game.height - 120, 400, 90);
        
        // Result border glow
        ctx.strokeStyle = this.result.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.result.color;
        ctx.shadowBlur = 10;
        ctx.strokeRect(this.game.width / 2 - 200, this.game.height - 120, 400, 90);
        ctx.shadowBlur = 0;
        
        // Win text with animation
        const winPulse = 1 + Math.sin(this.pulseEffect * 4) * 0.1;
        ctx.save();
        ctx.translate(this.game.width / 2, this.game.height - 85);
        ctx.scale(winPulse, winPulse);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🎉 ¡Has ganado: ${this.result.value} puntos! 🎉`, 0, 0);
        ctx.restore();
        
        // Segment label
        ctx.fillStyle = this.result.color;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.result.label}`, this.game.width / 2, this.game.height - 55);
        
        // Continue instruction
        const continuePulse = 0.7 + Math.sin(this.pulseEffect * 2) * 0.3;
        ctx.save();
        ctx.globalAlpha = continuePulse;
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💫 Haz clic para girar de nuevo 💫', this.game.width / 2, this.game.height - 30);
        ctx.restore();
        }
    }
}