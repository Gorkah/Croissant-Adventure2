/**
 * Roulette Minigame
 * A wheel of fortune that spins when clicked and gives random rewards
 */
class RouletteMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
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
        
        // Segments of the wheel
        this.segments = [
            { label: '10 Points', color: '#ff5555', value: 10 },
            { label: '20 Points', color: '#55ff55', value: 20 },
            { label: '30 Points', color: '#5555ff', value: 30 },
            { label: '40 Points', color: '#ffff55', value: 40 },
            { label: '50 Points', color: '#ff55ff', value: 50 },
            { label: '0 Points', color: '#777777', value: 0 },
            { label: '5 Points', color: '#ff9955', value: 5 },
            { label: '15 Points', color: '#55ffff', value: 15 }
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
            
            // Normalize rotation
            if (this.currentRotation > Math.PI * 2) {
                this.currentRotation -= Math.PI * 2;
            }
            
            // Check if spinning is complete
            if (progress === 1) {
                this.spinning = false;
                this.determineResult();
            }
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
        // Draw background
        ctx.fillStyle = '#333355';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw roulette wheel
        const segmentAngle = Math.PI * 2 / this.segments.length;
        
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const startAngle = i * segmentAngle + this.currentRotation;
            const endAngle = (i + 1) * segmentAngle + this.currentRotation;
            
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = segment.color;
            ctx.fill();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw segment label
            ctx.save();
            ctx.translate(this.centerX, this.centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.fillText(segment.label, this.radius - 20, 0);
            ctx.restore();
        }
        
        // Draw center
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Draw pointer
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY - this.radius - 20);
        ctx.lineTo(this.centerX - 10, this.centerY - this.radius);
        ctx.lineTo(this.centerX + 10, this.centerY - this.radius);
        ctx.closePath();
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        
        // Draw UI
        super.render(ctx);
        
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Roulette', this.game.width / 2, 20);
        
        // Draw instruction
        if (!this.spinning && !this.result) {
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('Click the wheel to spin!', this.game.width / 2, this.game.height - 60);
        }
        
        // Draw result
        if (this.result) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.width / 2 - 150, this.game.height - 100, 300, 70);
            
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`¡Has ganado: ${this.result.value} puntos!`, this.game.width / 2, this.game.height - 75);
            
            // Mostrar el texto del segmento y valor ganado
            ctx.font = '20px Arial';
            ctx.fillText(`${this.result.label}`, this.game.width / 2, this.game.height - 45);
            
            ctx.font = '16px Arial';
            ctx.fillText('Haz clic para girar de nuevo', this.game.width / 2, this.game.height - 20);
        }
    }
}
