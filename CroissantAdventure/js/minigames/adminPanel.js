/**
 * Admin Panel Minigame
 * Panel de administración con controles parentales y configuración del juego
 */
class AdminPanel extends Minigame {
    constructor(game) {
        super(game);
        
        this.name = "Panel de Control Parental";
        this.description = "Control de uso y configuración del juego";
        
        // Aumentar el tamaño y modificar la posición del botón de salida
        this.exitButton = {
            text: 'Salir',
            x: this.game.canvas.width - 70,
            y: 30,
            width: 100,
            height: 40,
            action: () => game.switchScene('worldMap')
        };
        
        // Botones del menú de administración
        this.adminTabs = [
            { id: 'stats', text: 'Estadísticas de Uso', selected: true },
            { id: 'audio', text: 'Control de Audio', selected: false },
            { id: 'limits', text: 'Límites de Juego', selected: false }
        ];
        
        // Tab actual
        this.currentTab = 'stats';
        
        // Elementos interactivos de la UI
        this.uiElements = {
            volumeSlider: {
                x: 300,
                y: 250,
                width: 300,
                height: 20,
                value: this.game.audioSystem.volume,
                min: 0,
                max: 1,
                dragging: false
            },
            timeLimitSlider: {
                x: 300,
                y: 250,
                width: 300,
                height: 20,
                value: this.game.parentalControl.timeTracking.dailyLimitMinutes / 120, // Normalizado entre 0-1 (máximo 2 horas)
                min: 0,
                max: 1,
                dragging: false
            },
            toggleMusicButton: {
                x: 300,
                y: 320,
                width: 200,
                height: 40,
                text: this.game.audioSystem.musicEnabled ? 'Desactivar Música' : 'Activar Música'
            },
            resetStatsButton: {
                x: 300,
                y: 500,
                width: 200,
                height: 40,
                text: 'Reiniciar Estadísticas'
            },
            saveSettingsButton: {
                x: 550,
                y: 500,
                width: 200,
                height: 40,
                text: 'Guardar Ajustes'
            }
        };
        
        // Actualizar estadísticas al iniciar
        this.game.updatePlayTime();
        
        // Variables para controlar el estado del mouse
        this.mouseWasDown = false;
        this.draggedElement = null;
    }
    
    /**
     * Initialize the admin panel
     */
    init() {
        // Actualizar estadísticas
        this.game.updatePlayTime();
        this.game.saveParentalControls();
        
        // Reset de variables de control de mouse
        this.mouseWasDown = false;
        this.draggedElement = null;
    }
    
    /**
     * Update method
     */
    update(deltaTime) {
        // Update the exit button position based on canvas size (in case of resize)
        this.exitButton.x = this.game.canvas.width - 70;
        
        // Actualizar texto del botón de música
        this.uiElements.toggleMusicButton.text = this.game.audioSystem.musicEnabled ? 'Desactivar Música' : 'Activar Música';
        
        // Actualizar la posición de los elementos UI según la pestaña activa
        const centerX = this.game.canvas.width / 2;
        
        // Posicionar los sliders y botones según la pestaña seleccionada
        if (this.currentTab === 'audio') {
            this.uiElements.volumeSlider.x = centerX - (this.uiElements.volumeSlider.width / 2);
            this.uiElements.volumeSlider.y = 250;
            
            this.uiElements.toggleMusicButton.x = centerX - (this.uiElements.toggleMusicButton.width / 2);
            this.uiElements.toggleMusicButton.y = 320;
            
            this.uiElements.saveSettingsButton.x = centerX - (this.uiElements.saveSettingsButton.width / 2);
            this.uiElements.saveSettingsButton.y = 400;
        } else if (this.currentTab === 'limits') {
            this.uiElements.timeLimitSlider.x = centerX - (this.uiElements.timeLimitSlider.width / 2);
            this.uiElements.timeLimitSlider.y = 250;
            
            this.uiElements.saveSettingsButton.x = centerX - (this.uiElements.saveSettingsButton.width / 2);
            this.uiElements.saveSettingsButton.y = 400;
        } else if (this.currentTab === 'stats') {
            this.uiElements.resetStatsButton.x = centerX - (this.uiElements.resetStatsButton.width / 2);
            this.uiElements.resetStatsButton.y = 500;
        }
        
        // ----- MANEJO DE EVENTOS DEL MOUSE -----
        const mouseX = this.game.mouseX;
        const mouseY = this.game.mouseY;
        
        // Si el mouse fue presionado (detecta el clic inicial)
        if (this.game.mouseDown && !this.mouseWasDown) {
            this.mouseWasDown = true;
            
            // Comprobar clics en las pestañas
            let tabChanged = false;
            this.adminTabs.forEach(tab => {
                if (this.isPointInRect(mouseX, mouseY, tab)) {
                    console.log('Tab clicked:', tab.id);
                    this.currentTab = tab.id;
                    tabChanged = true;
                    
                    // Actualizar el estado 'selected' de todas las pestañas
                    this.adminTabs.forEach(t => {
                        t.selected = (t.id === tab.id);
                    });
                }
            });
            
            // Si cambió de pestaña, no procesar otros clics
            if (!tabChanged) {
                // Comprobar interacción con elementos de UI según la pestaña actual
                if (this.currentTab === 'audio') {
                    // Slider de volumen
                    if (this.isPointInRect(mouseX, mouseY, this.uiElements.volumeSlider)) {
                        this.draggedElement = 'volumeSlider';
                        // Calcular el nuevo valor basado en la posición del ratón
                        const sliderValue = this.calculateSliderValue(mouseX, this.uiElements.volumeSlider);
                        this.uiElements.volumeSlider.value = sliderValue;
                        this.game.setMusicVolume(sliderValue);
                    }
                    
                    // Botón de música
                    else if (this.isPointInRect(mouseX, mouseY, this.uiElements.toggleMusicButton)) {
                        console.log('Toggle music button clicked');
                        this.game.toggleBackgroundMusic();
                    }
                    
                    // Botón de guardar
                    else if (this.isPointInRect(mouseX, mouseY, this.uiElements.saveSettingsButton)) {
                        console.log('Save settings button clicked');
                        this.game.saveAudioSettings();
                        alert('Configuración de audio guardada correctamente');
                    }
                } 
                else if (this.currentTab === 'limits') {
                    // Slider de límite de tiempo
                    if (this.isPointInRect(mouseX, mouseY, this.uiElements.timeLimitSlider)) {
                        this.draggedElement = 'timeLimitSlider';
                        // Calcular el nuevo valor
                        const sliderValue = this.calculateSliderValue(mouseX, this.uiElements.timeLimitSlider);
                        this.uiElements.timeLimitSlider.value = sliderValue;
                        // Actualizar límite de tiempo
                        this.game.parentalControl.timeTracking.dailyLimitMinutes = Math.round(sliderValue * 120);
                    }
                    
                    // Botón de guardar
                    else if (this.isPointInRect(mouseX, mouseY, this.uiElements.saveSettingsButton)) {
                        console.log('Save limits button clicked');
                        this.game.saveParentalControls();
                        alert('Límite de tiempo guardado correctamente');
                    }
                } 
                else if (this.currentTab === 'stats') {
                    // Botón de resetear estadísticas
                    if (this.isPointInRect(mouseX, mouseY, this.uiElements.resetStatsButton)) {
                        console.log('Reset stats button clicked');
                        if (confirm('¿Estás seguro de que quieres reiniciar todas las estadísticas?')) {
                            this.resetStatistics();
                            alert('Estadísticas reiniciadas correctamente');
                        }
                    }
                }
            }
        }
        // Si el mouse está presionado y ya estaba presionado (arrastre)
        else if (this.game.mouseDown && this.mouseWasDown) {
            // Manejar arrastre de sliders
            if (this.draggedElement === 'volumeSlider') {
                const sliderValue = this.calculateSliderValue(mouseX, this.uiElements.volumeSlider);
                this.uiElements.volumeSlider.value = sliderValue;
                this.game.setMusicVolume(sliderValue);
            }
            else if (this.draggedElement === 'timeLimitSlider') {
                const sliderValue = this.calculateSliderValue(mouseX, this.uiElements.timeLimitSlider);
                this.uiElements.timeLimitSlider.value = sliderValue;
                this.game.parentalControl.timeTracking.dailyLimitMinutes = Math.round(sliderValue * 120);
            }
        }
        // Si el mouse fue liberado
        else if (!this.game.mouseDown && this.mouseWasDown) {
            this.mouseWasDown = false;
            this.draggedElement = null;
        }
        
        // Check for exit button clicks (llamada a la clase padre)
        super.update(deltaTime);
    }
    
    /**
     * Render method
     */
    render(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Draw background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Draw header
        ctx.fillStyle = '#4a6c2a';
        ctx.fillRect(0, 0, this.game.canvas.width, 60);
        
        // Draw title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Panel de Control Parental', this.game.canvas.width / 2, 40);
        
        // Dibujar pestañas de navegación
        this.renderTabs(ctx);
        
        // Renderizar contenido según la pestaña seleccionada
        if (this.currentTab === 'stats') {
            this.renderStatsTab(ctx);
        } else if (this.currentTab === 'audio') {
            this.renderAudioTab(ctx);
        } else if (this.currentTab === 'limits') {
            this.renderLimitsTab(ctx);
        }
        
        // Draw exit button
        super.render(ctx);
    }
    
    /**
     * Renderizar pestañas de navegación
     */
    renderTabs(ctx) {
        const tabWidth = 200;
        const tabHeight = 40;
        const startX = (this.game.canvas.width - (tabWidth * this.adminTabs.length)) / 2;
        const tabY = 80;
        
        this.adminTabs.forEach((tab, index) => {
            const tabX = startX + (index * tabWidth);
            
            // Guardar posición para interacción
            tab.x = tabX;
            tab.y = tabY;
            tab.width = tabWidth;
            tab.height = tabHeight;
            
            // Dibujar fondo de pestaña
            ctx.fillStyle = tab.id === this.currentTab ? '#8a5cbd' : '#d0d0d0';
            ctx.fillRect(tabX, tabY, tabWidth, tabHeight);
            
            // Borde
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.strokeRect(tabX, tabY, tabWidth, tabHeight);
            
            // Texto
            ctx.fillStyle = tab.id === this.currentTab ? '#ffffff' : '#333333';
            ctx.font = tab.id === this.currentTab ? 'bold 16px Arial' : '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tab.text, tabX + tabWidth/2, tabY + tabHeight/2);
        });
    }
    
    /**
     * Renderizar pestaña de estadísticas
     */
    renderStatsTab(ctx) {
        const startY = 150;
        const lineHeight = 30;
        const padding = 50;
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('Estadísticas de Uso del Juego', padding, startY);
        
        ctx.font = '16px Arial';
        
        // Datos de tiempo de juego
        const timeData = this.game.parentalControl.timeTracking;
        const totalPlayTimeHours = (timeData.totalPlayTime / 60).toFixed(2);
        const formattedDate = new Date(timeData.lastSaved).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statsList = [
            `Tiempo total de juego: ${totalPlayTimeHours} horas (${timeData.totalPlayTime.toFixed(0)} minutos)`,
            `Sesiones jugadas: ${timeData.sessionsPlayed}`,
            `Última sesión: ${formattedDate}`,
            `Límite diario: ${timeData.dailyLimitMinutes} minutos`,
            `Minijuegos iniciados: ${this.game.achievements.minigamesPlayed}`
        ];
        
        // Agregar estadísticas por minijuego
        ctx.fillText('Desglose por minijuegos:', padding, startY + (lineHeight * (statsList.length + 1)));
        
        let minigameStats = [];
        for (const game in this.game.parentalControl.minigamesPlayed) {
            const stats = this.game.parentalControl.minigamesPlayed[game];
            minigameStats.push(`${game}: ${stats.timesPlayed} veces jugado (última vez: ${new Date(stats.lastPlayed).toLocaleDateString('es-ES')})`);
        }
        
        // Si no hay datos de minijuegos, mostrar mensaje
        if (minigameStats.length === 0) {
            minigameStats.push('No hay datos de minijuegos todavía');
        }
        
        // Mostrar todas las estadísticas
        statsList.forEach((stat, index) => {
            ctx.fillText(stat, padding, startY + (lineHeight * (index + 1)));
        });
        
        minigameStats.forEach((stat, index) => {
            ctx.fillText(stat, padding + 20, startY + (lineHeight * (statsList.length + 2 + index)));
        });
        
        // Dibujar botón de reinicio
        this.drawButton(ctx, this.uiElements.resetStatsButton);
    }
    
    /**
     * Renderizar pestaña de audio
     */
    renderAudioTab(ctx) {
        const startY = 150;
        const padding = 50;
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('Control de Audio', padding, startY);
        
        ctx.font = '16px Arial';
        ctx.fillText(`Volumen de Música: ${Math.round(this.game.audioSystem.volume * 100)}%`, padding, startY + 40);
        
        // Dibujar slider de volumen
        this.drawSlider(ctx, this.uiElements.volumeSlider);
        
        // Dibujar botón de activar/desactivar música
        this.drawButton(ctx, this.uiElements.toggleMusicButton);
        
        // Botón de guardar
        this.drawButton(ctx, this.uiElements.saveSettingsButton);
    }
    
    /**
     * Renderizar pestaña de límites
     */
    renderLimitsTab(ctx) {
        const startY = 150;
        const padding = 50;
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('Límites de Juego', padding, startY);
        
        // Calcular el límite en minutos y horas
        const limitMinutes = Math.round(this.uiElements.timeLimitSlider.value * 120);
        const limitHours = (limitMinutes / 60).toFixed(1);
        
        ctx.font = '16px Arial';
        ctx.fillText(`Límite diario de juego: ${limitMinutes} minutos (${limitHours} horas)`, padding, startY + 40);
        
        // Dibujar slider del límite de tiempo
        this.drawSlider(ctx, this.uiElements.timeLimitSlider);
        
        // Información adicional
        ctx.fillText('Ajusta el límite diario de tiempo que el niño puede jugar.', padding, startY + 100);
        ctx.fillText('El juego mostrará una notificación cuando se alcance este límite.', padding, startY + 130);
        
        // Botón de guardar
        this.drawButton(ctx, this.uiElements.saveSettingsButton);
    }
    
    /**
     * Dibujar un slider
     */
    drawSlider(ctx, slider) {
        // Fondo del slider
        ctx.fillStyle = '#ddd';
        ctx.fillRect(slider.x, slider.y, slider.width, slider.height);
        
        // Borde
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(slider.x, slider.y, slider.width, slider.height);
        
        // Valor actual
        const valueWidth = slider.width * (slider.value - slider.min) / (slider.max - slider.min);
        ctx.fillStyle = '#8a5cbd';
        ctx.fillRect(slider.x, slider.y, valueWidth, slider.height);
        
        // Mango del slider
        ctx.fillStyle = '#333';
        const handleX = slider.x + valueWidth - 5;
        ctx.fillRect(handleX, slider.y - 5, 10, slider.height + 10);
    }
    
    /**
     * Dibujar un botón
     */
    drawButton(ctx, button) {
        // Fondo del botón
        ctx.fillStyle = '#4a6c2a';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Borde
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // Texto
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.text, button.x + button.width/2, button.y + button.height/2);
    }
    
    /**
     * Manejar evento de mouse down
     */
    onMouseDown(event) {
        const mouseX = event.clientX - this.game.canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - this.game.canvas.getBoundingClientRect().top;
        
        // Comprobar clics en el botón de salida (funcionalidad heredada)
        const exitButtonClicked = this.isPointInRect(mouseX, mouseY, this.exitButton);
        if (exitButtonClicked && this.exitButton.action) {
            this.exitButton.action();
            return;
        }
        
        // Comprobar clics en las pestañas
        let tabChanged = false;
        this.adminTabs.forEach(tab => {
            if (this.isPointInRect(mouseX, mouseY, tab)) {
                this.currentTab = tab.id;
                tabChanged = true;
                
                // Actualizar el estado 'selected' de todas las pestañas
                this.adminTabs.forEach(t => {
                    t.selected = (t.id === tab.id);
                });
            }
        });
        
        // Si se cambió de pestaña, no procesar otros clics
        if (tabChanged) return;
        
        // Comprobar interacción con elementos de UI según la pestaña actual
        if (this.currentTab === 'audio') {
            // Slider de volumen
            if (this.isPointInRect(mouseX, mouseY, this.uiElements.volumeSlider)) {
                this.uiElements.volumeSlider.dragging = true;
                // Calcular el nuevo valor basado en la posición del ratón
                const sliderValue = this.calculateSliderValue(mouseX, this.uiElements.volumeSlider);
                this.uiElements.volumeSlider.value = sliderValue;
                this.game.setMusicVolume(sliderValue);
            }
            
            // Botón de música
            if (this.isPointInRect(mouseX, mouseY, this.uiElements.toggleMusicButton)) {
                this.game.toggleBackgroundMusic();
            }
            
            // Botón de guardar
            if (this.isPointInRect(mouseX, mouseY, this.uiElements.saveSettingsButton)) {
                this.game.saveAudioSettings();
                alert('Configuración de audio guardada correctamente');
            }
        } else if (this.currentTab === 'limits') {
            // Slider de límite de tiempo
            if (this.isPointInRect(mouseX, mouseY, this.uiElements.timeLimitSlider)) {
                this.uiElements.timeLimitSlider.dragging = true;
                // Calcular el nuevo valor
                const sliderValue = this.calculateSliderValue(mouseX, this.uiElements.timeLimitSlider);
                this.uiElements.timeLimitSlider.value = sliderValue;
                // Actualizar límite de tiempo
                this.game.parentalControl.timeTracking.dailyLimitMinutes = Math.round(sliderValue * 120);
            }
            
            // Botón de guardar
            if (this.isPointInRect(mouseX, mouseY, this.uiElements.saveSettingsButton)) {
                this.game.saveParentalControls();
                alert('Límite de tiempo guardado correctamente');
            }
        } else if (this.currentTab === 'stats') {
            // Botón de resetear estadísticas
            if (this.isPointInRect(mouseX, mouseY, this.uiElements.resetStatsButton)) {
                if (confirm('¿Estás seguro de que quieres reiniciar todas las estadísticas?')) {
                    this.resetStatistics();
                    alert('Estadísticas reiniciadas correctamente');
                }
            }
        }
    }
    
    /**
     * Manejar evento de mouse move
     */
    onMouseMove(event) {
        const mouseX = event.clientX - this.game.canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - this.game.canvas.getBoundingClientRect().top;
        
        // Actualizar sliders si se están arrastrando
        if (this.uiElements.volumeSlider.dragging) {
            const sliderValue = this.calculateSliderValue(mouseX, this.uiElements.volumeSlider);
            this.uiElements.volumeSlider.value = sliderValue;
            this.game.setMusicVolume(sliderValue);
        }
        
        if (this.uiElements.timeLimitSlider.dragging) {
            const sliderValue = this.calculateSliderValue(mouseX, this.uiElements.timeLimitSlider);
            this.uiElements.timeLimitSlider.value = sliderValue;
            this.game.parentalControl.timeTracking.dailyLimitMinutes = Math.round(sliderValue * 120);
        }
    }
    
    /**
     * Manejar evento de mouse up
     */
    onMouseUp() {
        // Detener arrastre de sliders
        this.uiElements.volumeSlider.dragging = false;
        this.uiElements.timeLimitSlider.dragging = false;
    }
    
    /**
     * Calcular el valor de un slider basado en la posición del ratón
     */
    calculateSliderValue(mouseX, slider) {
        let relativeX = mouseX - slider.x;
        relativeX = Math.max(0, Math.min(relativeX, slider.width));
        return slider.min + (relativeX / slider.width) * (slider.max - slider.min);
    }
    
    /**
     * Comprobar si un punto está dentro de un rectángulo
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width && 
               y >= rect.y && y <= rect.y + rect.height;
    }
    
    /**
     * Reiniciar estadísticas
     */
    resetStatistics() {
        // Reiniciar tiempo de juego
        this.game.parentalControl.timeTracking.totalPlayTime = 0;
        this.game.parentalControl.timeTracking.sessionsPlayed = 1; // La sesión actual
        
        // Reiniciar minijuegos jugados
        this.game.parentalControl.minigamesPlayed = {};
        
        // Reiniciar logros
        this.game.achievements.minigamesPlayed = 0;
        
        // Guardar cambios
        this.game.saveParentalControls();
    }
    
    /**
     * Clean up when leaving this scene
     */
    cleanup() {
        // Guardar datos antes de salir
        this.game.updatePlayTime();
        this.game.saveParentalControls();
        this.game.saveAudioSettings();
        
        // Reset variables de mouse
        this.mouseWasDown = false;
        this.draggedElement = null;
    }
}
