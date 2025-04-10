/**
 * Tower Defense Minigame
 * A strategic defense game where the player places towers to defend against waves of enemies
 */
class TowerDefenseMinigame extends Minigame {
    constructor(game) {
        super(game);
        this.reset();
    }
    
    reset() {
        // Game state
        this.money = 150;
        this.lives = 10;
        this.score = 0;
        this.gameOver = false;
        this.victory = false;
        this.waveNumber = 0;
        this.waveInProgress = false;
        this.enemiesRemaining = 0;
        this.waveDelay = 5; // Seconds between waves
        this.waveTimer = this.waveDelay;
        
        // Map properties
        this.gridSize = 40; // Size of each grid cell
        this.gridWidth = Math.floor(this.game.width / this.gridSize);
        this.gridHeight = Math.floor(this.game.height / this.gridSize);
        
        // Game elements
        this.path = this.generatePath();
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        
        // Tower placement
        this.selectedTowerType = null;
        this.canPlaceTower = false;
        this.placementX = 0;
        this.placementY = 0;
        
        // Tower types definition - Mejorados para enfrentar a enemigos más difíciles
        this.towerTypes = {
            basic: {
                name: 'Basic Tower',
                description: 'Torre balanceada con buena relación coste/daño',
                cost: 50, // Mismo coste para que siga siendo accesible
                damage: 25, // Ligero aumento de daño
                range: 3.2, // Ligero aumento de alcance
                fireRate: 1.2, // Más velocidad de disparo
                projectileSpeed: 350, // Proyectiles más rápidos
                color: '#4444ff',
                projectileColor: '#8888ff',
                specialEffect: null,
                upgradeCost: 40,
                armorPierce: 0.1 // 10% de penetración de armadura
            },
            fire: {
                name: 'Fire Tower',
                description: 'Daño en área a todos los enemigos en rango',
                cost: 100,
                damage: 14, // Más daño
                range: 2.2, // Más alcance
                fireRate: 0.6, // Ligeramente más rápido
                projectileSpeed: 0, // Efecto instantáneo
                color: '#ff4400',
                projectileColor: '#ff8844',
                specialEffect: 'area',
                upgradeCost: 80,
                aoeRadius: 2.0, // Radio del área de efecto
                armorPierce: 0.15 // 15% de penetración de armadura
            },
            ice: {
                name: 'Ice Tower',
                description: 'Ralentiza a los enemigos y anula la regeneración',
                cost: 75,
                damage: 8, // Más daño
                range: 2.7, // Más alcance
                fireRate: 0.8, // Más rápido
                projectileSpeed: 300, // Proyectiles más rápidos
                color: '#00ccff',
                projectileColor: '#88ddff',
                specialEffect: 'slow',
                upgradeCost: 60,
                slowAmount: 0.5, // 50% de ralentización
                slowDuration: 3, // 3 segundos de duración
                regenerationBlock: true // Bloquea la regeneración de enemigos
            },
            sniper: {
                name: 'Sniper Tower',
                description: 'Gran alcance y daño, ignora armadura y evasión',
                cost: 150,
                damage: 70, // Mucho más daño
                range: 6, // Mayor alcance
                fireRate: 0.4, // Ligeramente más rápido
                projectileSpeed: 600, // Proyectiles más rápidos
                color: '#ff0000',
                projectileColor: '#ff8888',
                specialEffect: null,
                upgradeCost: 120,
                armorPierce: 0.8, // 80% de penetración de armadura
                ignoreEvasion: true // Ignora la evasión de enemigos rápidos
            },
            // Nueva torre para más opciones estratégicas
            lightning: {
                name: 'Lightning Tower',
                description: 'Ataca múltiples enemigos con rayos en cadena',
                cost: 200, // Coste alto
                damage: 30, // Daño medio
                range: 4, // Buen alcance
                fireRate: 0.7, // Velocidad media
                projectileSpeed: 700, // Muy rápido (rayos)
                color: '#aa00ff', // Púrpura
                projectileColor: '#dd88ff',
                specialEffect: 'chain', // Nuevo efecto: daño en cadena
                upgradeCost: 160,
                chainCount: 3, // Número de objetivos alcanzados
                chainDamageReduction: 0.3 // 30% reducción de daño por cada salto
            }
        };
        
        // Enemy types definition - Enemigos brutalmente desafiantes
        this.enemyTypes = {
            normal: {
                name: 'Normal',
                speed: 65, // Más rápido
                health: 150, // Mucho más resistente
                reward: 15, 
                color: '#888888',
                size: 0.6,
                armor: 0.05, // Ahora incluso los normales tienen algo de armadura
                adaptiveDamage: true // Se vuelven más resistentes a ataques repetidos
            },
            fast: {
                name: 'Fast',
                speed: 140, // Extremadamente rápido
                health: 100, 
                reward: 22,
                color: '#55cc55',
                size: 0.5,
                armor: 0.05, 
                evasion: 0.25, // Alta probabilidad de evasión
                doubleAttack: true // Puede quitar 2 vidas al llegar al final
            },
            tank: {
                name: 'Tank',
                speed: 40, 
                health: 500, 
                reward: 35,
                color: '#cc5555',
                size: 0.7,
                armor: 0.35, // Gran resistencia al daño
                evasion: 0.05, // Ahora tienen algo de evasión
                damageThreshold: 15, // Ignora daño por debajo de este valor
                regeneration: 2 // Ahora regeneran vida
            },
            boss: {
                name: 'Boss',
                speed: 50,
                health: 1800, 
                reward: 150,
                color: '#cc00cc',
                size: 0.9,
                armor: 0.4, 
                evasion: 0.1, 
                regeneration: 10, // Regeneración agresiva
                lifeDrain: 2, // Al ser atacados, quitan vida a las torres
                immunities: ['slow'], // Ahora son inmunes a ralentización
                spawnMinions: { // Generan enemigos al recibir daño
                    type: 'normal',
                    chance: 0.2,
                    count: 2
                }
            },
            elite: {
                name: 'Elite',
                speed: 85,
                health: 900,
                reward: 100,
                color: '#ffaa00', // Naranja dorado
                size: 0.75,
                armor: 0.25,
                evasion: 0.15,
                adaptiveDamage: true, // Se adaptan y reducen daño recibido
                immunities: ['slow', 'stun'],
                auraEffect: { // Fortalecen a enemigos cercanos
                    radius: 120,
                    armorBonus: 0.1,
                    speedBonus: 1.2
                }
            },
            // Nuevos tipos de enemigos ultra desafiantes
            stealth: {
                name: 'Stealth',
                speed: 100,
                health: 200,
                reward: 40,
                color: '#445566', // Gris azulado
                size: 0.55,
                armor: 0.1,
                evasion: 0.3,
                stealthAbility: true, // Se vuelven temporalmente invisibles
                targetDisruption: 0.5, // Probabilidad de hacer que las torres pierdan su objetivo
                immunities: ['area'] // Inmunes a daño en área
            },
            healer: {
                name: 'Healer',
                speed: 60,
                health: 300,
                reward: 60,
                color: '#22cc88', // Verde turquesa
                size: 0.65,
                armor: 0.15,
                healRadius: 150, // Radio de curación
                healAmount: 15, // Cantidad de curación por segundo
                selfHealing: 5, // Auto-curación
                priority: 'high' // Las torres deberían priorizar a estos enemigos
            },
            titan: {
                name: 'Titan',
                speed: 30, // Muy lento
                health: 5000, // Extremadamente resistente
                reward: 300,
                color: '#ddaa33', // Dorado
                size: 1.2, // Más grande que un jefe
                armor: 0.6, // Armadura extrema
                evasion: 0, // No evade, pero no lo necesita
                damageThreshold: 30, // Ignora daño bajo
                regeneration: 20,
                areaAttack: true, // Al morir, daña todas las torres cercanas
                livesLost: 5, // Quita 5 vidas si llega al final
                spawnMinions: {
                    type: 'elite',
                    chance: 0.3,
                    count: 1
                },
                doubleReward: true, // Duplica todas las recompensas durante 10 segundos
                immunities: ['slow', 'stun', 'debuff']
            },
            phantom: {
                name: 'Phantom',
                speed: 120,
                health: 400,
                reward: 80,
                color: '#aaaaff', // Azul fantasmal
                size: 0.6,
                armor: 0.2,
                evasion: 0.5, // Extremadamente evasivo
                phaseShift: true, // Atraviesa torres y defensas periódicamente
                cloneOnDeath: { // Al morir tiene probabilidad de crear un clon
                    chance: 0.4,
                    healthPercent: 0.5
                },
                splitDamage: 0.5, // Recibe sólo la mitad del daño
                immunities: ['direct'] // Inmune a ataques directos (solo daño en área)
            }
        };
        
        // Wave definitions - OLEADAS EXTREMAS
        this.waves = [
            // Wave 1 - No más introducción amable
            [
                { type: 'normal', count: 20, delay: 0.8 },
                { type: 'fast', count: 8, delay: 0.7 },
                { type: 'stealth', count: 2, delay: 1.0 } // Enemigos sigilosos desde el principio
            ],
            // Wave 2 - Asalto temprano
            [
                { type: 'normal', count: 15, delay: 0.7 },
                { type: 'fast', count: 12, delay: 0.5 },
                { type: 'tank', count: 3, delay: 1.0 },
                { type: 'stealth', count: 5, delay: 1.2 }
            ],
            // Wave 3 - Primer reto serio
            [
                { type: 'normal', count: 20, delay: 0.7 },
                { type: 'fast', count: 15, delay: 0.4 },
                { type: 'tank', count: 8, delay: 0.9 },
                { type: 'healer', count: 2, delay: 3.0 } // Introducimos healers
            ],
            // Wave 4 - Barrera defensiva
            [
                { type: 'tank', count: 12, delay: 0.6 },
                { type: 'normal', count: 25, delay: 0.3 },
                { type: 'healer', count: 4, delay: 2.0 },
                { type: 'elite', count: 1, delay: 5.0 } // Primer elite
            ],
            // Wave 5 - Jefes tempranos
            [
                { type: 'fast', count: 30, delay: 0.3 },
                { type: 'stealth', count: 10, delay: 0.6 },
                { type: 'healer', count: 5, delay: 1.0 },
                { type: 'boss', count: 2, delay: 3.0 },
                { type: 'phantom', count: 1, delay: 2.0 } // Primer fantasma
            ],
            // Wave 6 - Enjambre mixto
            [
                { type: 'normal', count: 35, delay: 0.2 },
                { type: 'fast', count: 30, delay: 0.2 },
                { type: 'tank', count: 15, delay: 0.4 },
                { type: 'healer', count: 8, delay: 0.8 },
                { type: 'elite', count: 3, delay: 2.0 }
            ],
            // Wave 7 - Asalto fantasma
            [
                { type: 'phantom', count: 6, delay: 1.0 },
                { type: 'stealth', count: 15, delay: 0.5 },
                { type: 'tank', count: 20, delay: 0.3 },
                { type: 'boss', count: 3, delay: 2.0 }
            ],
            // Wave 8 - Primera horda titánica
            [
                { type: 'tank', count: 25, delay: 0.3 },
                { type: 'healer', count: 12, delay: 0.6 },
                { type: 'elite', count: 5, delay: 1.0 },
                { type: 'phantom', count: 8, delay: 0.8 },
                { type: 'titan', count: 1, delay: 10.0 } // ¡Primer titán!
            ],
            // Wave 9 - Asalto coordinado
            [
                // Primera oleada - preparación
                { type: 'stealth', count: 20, delay: 0.3 },
                { type: 'fast', count: 40, delay: 0.2 },
                // Segunda oleada - ataque principal
                { type: 'tank', count: 25, delay: 0.4, startDelay: 10 },
                { type: 'healer', count: 15, delay: 0.5, startDelay: 10 },
                { type: 'elite', count: 8, delay: 0.8, startDelay: 10 },
                // Tercera oleada - jefes
                { type: 'boss', count: 5, delay: 1.0, startDelay: 20 },
                { type: 'phantom', count: 10, delay: 0.7, startDelay: 20 }
            ],
            // Wave 10 - Pesadilla Imparable
            [
                // Oleada preliminar
                { type: 'fast', count: 50, delay: 0.15 },
                { type: 'stealth', count: 25, delay: 0.2 },
                // Fuerza de asalto principal
                { type: 'tank', count: 30, delay: 0.3, startDelay: 8 },
                { type: 'healer', count: 20, delay: 0.4, startDelay: 8 },
                { type: 'elite', count: 12, delay: 0.6, startDelay: 8 },
                // Unidades especiales
                { type: 'phantom', count: 15, delay: 0.5, startDelay: 15 },
                { type: 'boss', count: 8, delay: 0.8, startDelay: 15 },
                // Unidades finales
                { type: 'titan', count: 3, delay: 3.0, startDelay: 25 }
            ],
            // Wave 11 - DESAFÍO IMPOSIBLE (NUEVA)
            [
                // Oleada 1: Enjambre inicial
                { type: 'fast', count: 60, delay: 0.1 },
                { type: 'stealth', count: 30, delay: 0.2 },
                { type: 'normal', count: 50, delay: 0.15 },
                // Oleada 2: Fuerza blindada (10s después)
                { type: 'tank', count: 40, delay: 0.25, startDelay: 10 },
                { type: 'healer', count: 25, delay: 0.3, startDelay: 10 },
                // Oleada 3: Unidades de élite (20s después)
                { type: 'elite', count: 15, delay: 0.5, startDelay: 20 },
                { type: 'phantom', count: 20, delay: 0.4, startDelay: 20 },
                { type: 'boss', count: 10, delay: 0.7, startDelay: 20 },
                // Oleada 4: Apocalipsis (40s después)
                { type: 'titan', count: 5, delay: 2.0, startDelay: 40 },
                // Jefe Final Especial (60s después)
                { type: 'titan', count: 1, delay: 0, startDelay: 60, health: 3.0, armor: 0.8, special: 'megaboss' }
            ],
            // Wave 12 - MODO PESADILLA (NUEVA - SECRETA)
            [
                // Esta oleada solo aparece si el jugador ha superado todas las anteriores
                // y tiene más de 5 vidas restantes
                
                // Fase Inicial: Asalto Masivo Simultáneo
                { type: 'normal', count: 100, delay: 0.1, multiSpawn: 5 },
                { type: 'fast', count: 80, delay: 0.1, multiSpawn: 4 },
                { type: 'stealth', count: 50, delay: 0.2, multiSpawn: 3 },
                { type: 'tank', count: 60, delay: 0.15, startDelay: 5, multiSpawn: 3 },
                
                // Fase Media: Unidades Especiales y Soporte
                { type: 'healer', count: 40, delay: 0.3, startDelay: 15, multiSpawn: 2 },
                { type: 'phantom', count: 30, delay: 0.25, startDelay: 15, multiSpawn: 2 },
                { type: 'elite', count: 25, delay: 0.4, startDelay: 20, multiSpawn: 2 },
                
                // Fase Avanzada: Jefes y Titánes
                { type: 'boss', count: 15, delay: 0.6, startDelay: 30, multiSpawn: 1 },
                { type: 'titan', count: 8, delay: 1.5, startDelay: 45, multiSpawn: 1 },
                
                // Jefe Final Definitivo
                { type: 'titan', count: 1, delay: 0, startDelay: 90, health: 10.0, armor: 0.9, regeneration: 100, special: 'finalBoss' }
            ]
        ];
        
        // EVENTOS ALEATORIOS - Ocurren durante la partida para hacerla más difícil
        this.randomEvents = [
            {
                name: "Tormenta EMP",
                description: "Todas las torres se desactivan temporalmente",
                duration: 5, // segundos
                effect: "disableTowers",
                minWave: 3 // Aparece a partir de la oleada 3
            },
            {
                name: "Regeneración Masiva",
                description: "Todos los enemigos regeneran vida rápidamente",
                duration: 8, 
                effect: "enhanceRegeneration",
                factor: 5, // Multiplicador de regeneración
                minWave: 4
            },
            {
                name: "Oscuridad",
                description: "Visibilidad reducida, torres tienen menos alcance",
                duration: 10,
                effect: "reduceTowerRange",
                factor: 0.6, // 60% del alcance normal
                minWave: 2
            },
            {
                name: "Armadura Reforzada",
                description: "Los enemigos obtienen +30% de armadura",
                duration: 15,
                effect: "enhanceArmor",
                bonus: 0.3,
                minWave: 5
            },
            {
                name: "Emboscada",
                description: "Aparición repentina de enemigos en puntos aleatorios del camino",
                effect: "spawnAmbush",
                enemyTypes: ["fast", "stealth", "phantom"],
                count: {min: 5, max: 15},
                minWave: 4
            },
            {
                name: "Tormenta de Furia",
                description: "Todos los enemigos se mueven un 50% más rápido",
                duration: 12,
                effect: "enhanceSpeed",
                factor: 1.5,
                minWave: 3
            },
            {
                name: "Corrupción Arcana",
                description: "Una torre aleatoria se vuelve contra ti",
                duration: 8,
                effect: "corruptTower",
                minWave: 6
            }
        ];
        
        // Sistema de eventos aleatorios
        this.activeEvents = [];
        this.eventChance = 0.005; // 0.5% de probabilidad por segundo
        
        // Definición de eventos aleatorios
        this.randomEvents = [
            {
                name: "Tormenta EMP",
                description: "¡Todas las torres han sido desactivadas temporalmente!",
                effect: "disableTowers",
                duration: 10, // 10 segundos
                minWave: 3 // No aparece antes de la oleada 3
            },
            {
                name: "Regeneración Masiva",
                description: "¡Todos los enemigos regeneran salud más rápido!",
                effect: "enhanceRegeneration",
                factor: 3, // Triplica la regeneración
                duration: 15,
                minWave: 4
            },
            {
                name: "Oscuridad",
                description: "¡Las torres han reducido su alcance!",
                effect: "reduceTowerRange",
                factor: 0.6, // Reduce el alcance al 60%
                duration: 12,
                minWave: 2
            },
            {
                name: "Armadura Reforzada",
                description: "¡Los enemigos han aumentado su resistencia a los ataques!",
                effect: "enhanceArmor",
                bonus: 2, // +2 de armadura
                duration: 15,
                minWave: 5,
                affectsNewEnemies: true
            },
            {
                name: "¡Emboscada!",
                description: "¡Un grupo de enemigos ha aparecido en el camino!",
                effect: "spawnAmbush",
                count: { min: 3, max: 8 }, // Número de enemigos
                enemyTypes: ["basic", "fast", "armored", "stealth"],
                minWave: 4
            },
            {
                name: "Corrupción Arcana",
                description: "¡Una torre ha sido corrompida y ataca a otras torres!",
                effect: "corruptTower",
                duration: 10,
                minWave: 7
            },
            {
                name: "Aceleración Temporal",
                description: "¡Los enemigos se mueven mucho más rápido!",
                effect: "enhanceSpeed",
                factor: 1.5, // 50% más velocidad
                duration: 8,
                minWave: 3,
                affectsNewEnemies: true
            },
            {
                name: "Oscuridad",
                description: "¡Las torres han reducido su alcance!",
                effect: "reduceTowerRange",
                factor: 0.6, // Reduce el alcance al 60%
                duration: 12,
                minWave: 2
            },
            {
                name: "Armadura Reforzada",
                description: "¡Los enemigos han aumentado su resistencia a los ataques!",
                effect: "enhanceArmor",
                bonus: 2, // +2 de armadura
                duration: 15,
                minWave: 4
            }
        ];
    }

    processEnemySpecialAbilities(enemy, deltaTime) {
        // Procesar habilidades especiales basadas en propiedades
        
        // Si el enemigo está muerto, no procesar habilidades
        if (enemy.health <= 0) return;
        
        // Habilidades especiales basadas en el tipo
        if (enemy.special === 'megaboss') {
            // Verificar si el megaboss necesita regeneración
            if (enemy.health < enemy.maxHealth && !enemy.isRegenerating) {
                // Activar regeneración cuando está por debajo del 30% de salud
                if (enemy.health < enemy.maxHealth * 0.3) {
                    enemy.isRegenerating = true;
                    enemy.regenRate = enemy.maxHealth * 0.02; // 2% de salud máxima por segundo
                    
                    // Efecto visual para la regeneración
                    this.effects.push({
                        x: enemy.x,
                        y: enemy.y,
                        text: "¡REGENERANDO!",
                        color: "#00ff00",
                        duration: 2,
                        size: 16,
                        velocity: { x: 0, y: -20 }
                    });
                }
            }
            
            // Aplicar regeneración si está activa
            if (enemy.isRegenerating) {
                enemy.health += enemy.regenRate * deltaTime;
                
                // Limitar a la salud máxima y desactivar si está lleno
                if (enemy.health >= enemy.maxHealth) {
                    enemy.health = enemy.maxHealth;
                    enemy.isRegenerating = false;
                }
            }
        }
    }
    
    processEnemySpecialAbilities(enemy, deltaTime) {
        // Si el enemigo está muerto, no procesar habilidades
        if (enemy.health <= 0) return;
        
        // Capacidad de invisibilidad
        if (enemy.stealthAbility && !enemy.stealthCooldown) {
            // Probabilidad de activarse si la salud baja del 50%
            if (enemy.health < enemy.maxHealth * 0.5 && Math.random() < enemy.stealthAbility.chance) {
                enemy.stealth = true;
                enemy.stealthDuration = enemy.stealthAbility.duration;
                enemy.stealthCooldown = enemy.stealthAbility.cooldown;
                
                // Efecto visual
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    text: "¡INVISIBLE!",
                    color: "rgba(150, 150, 250, 0.8)",
                    duration: 1.5,
                    size: 14,
                    velocity: { x: 0, y: -15 }
                });
            }
        }
        
        // Actualizar efectos de invisibilidad
        if (enemy.stealth) {
            enemy.stealthDuration -= deltaTime;
            if (enemy.stealthDuration <= 0) {
                enemy.stealth = false;
            }
        }
        
        // Actualizar cooldown de invisibilidad
        if (enemy.stealthCooldown) {
            enemy.stealthCooldown -= deltaTime;
            if (enemy.stealthCooldown <= 0) {
                enemy.stealthCooldown = 0;
            }
        }
        
        // Habilidades especiales basadas en el tipo
        if (enemy.special === 'megaboss') {
            // Verificar si el megaboss necesita regeneración
            if (enemy.health < enemy.maxHealth * 0.5 && !enemy.isRegenerating) {
                enemy.isRegenerating = true;
                enemy.regenRate = enemy.maxHealth * 0.03; // 3% por segundo
                
                // Efecto visual
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    text: "¡REGENERANDO!",
                    color: "#ff4500",
                    duration: 2,
                    size: 18,
                    velocity: { x: 0, y: -20 }
                });
            }
            
            // Aplicar regeneración
            if (enemy.isRegenerating) {
                enemy.health += enemy.regenRate * deltaTime;
                if (enemy.health >= enemy.maxHealth) {
                    enemy.health = enemy.maxHealth;
                    enemy.isRegenerating = false;
                }
            }
            
            // Posibilidad de invocar minions
            if (!enemy.lastMinionSpawn || this.game.currentTime - enemy.lastMinionSpawn > 8) {
                if (Math.random() < 0.2 * deltaTime) { // 20% chance por segundo
                    enemy.lastMinionSpawn = this.game.currentTime;
                    
                    // Invocar 2-3 minions
                    const count = 2 + Math.floor(Math.random() * 2);
                    for (let i = 0; i < count; i++) {
                        this.spawnEnemy("fast", {
                            x: enemy.x,
                            y: enemy.y,
                            pathIndex: enemy.pathIndex
                        });
                    }
                    
                    // Efecto visual
                    this.effects.push({
                        x: enemy.x,
                        y: enemy.y,
                        text: "¡INVOCANDO MINIONS!",
                        color: "#ff00ff",
                        duration: 2,
                        size: 16,
                        velocity: { x: 0, y: -25 }
                    });
                }
            }
        } else if (enemy.special === 'finalBoss') {
            // Comportamiento del jefe final
            // Aumentar velocidad gradualmente a medida que pierde salud
            const healthPercent = enemy.health / enemy.maxHealth;
            enemy.speedMultiplier = 1 + (1 - healthPercent) * 0.5; // Hasta 50% más rápido cuando está bajo de salud
            enemy.speed = enemy.baseSpeed * enemy.speedMultiplier;
            
            // Posibilidad de teletransporte
            if (!enemy.lastTeleport || this.game.currentTime - enemy.lastTeleport > 5) {
                if (Math.random() < 0.1 * deltaTime && enemy.health < enemy.maxHealth * 0.7) {
                    enemy.lastTeleport = this.game.currentTime;
                    
                    // Avanzar en el camino
                    const jumpAmount = Math.floor(Math.random() * 2) + 1;
                    if (enemy.pathIndex + jumpAmount < this.path.length - 3) {
                        enemy.pathIndex += jumpAmount;
                        const newPoint = this.path[enemy.pathIndex];
                        enemy.x = newPoint.x * this.gridSize;
                        enemy.y = newPoint.y * this.gridSize;
                        
                        // Efecto visual
                        this.effects.push({
                            x: enemy.x,
                            y: enemy.y,
                            text: "¡TELETRANSPORTE!",
                            color: "#00ffff",
                            duration: 1.5,
                            size: 16,
                            velocity: { x: 0, y: -20 }
                        });
                        
                        // Efecto de partículas de teletransporte
                        for (let i = 0; i < 15; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const speed = 40 + Math.random() * 60;
                            this.effects.push({
                                x: enemy.x,
                                y: enemy.y,
                                radius: 3,
                                color: "#00ffff",
                                duration: 0.5 + Math.random() * 0.5,
                                velocity: {
                                    x: Math.cos(angle) * speed,
                                    y: Math.sin(angle) * speed
                                },
                                decay: true
                            });
                        }
                    }
                }
            }
        }
        
        // Procesar habilidades de curación
        if (enemy.healingAbility && !enemy.healCooldown) {
            if (enemy.health < enemy.maxHealth * 0.7 && Math.random() < enemy.healingAbility.chance * deltaTime) {
                // Activar curación
                const healAmount = enemy.maxHealth * enemy.healingAbility.amount;
                enemy.health += healAmount;
                if (enemy.health > enemy.maxHealth) enemy.health = enemy.maxHealth;
                enemy.healCooldown = enemy.healingAbility.cooldown;
                
                // Efecto visual
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    text: `+${Math.floor(healAmount)}`,
                    color: "#00ff00",
                    duration: 1.5,
                    size: 14,
                    velocity: { x: 0, y: -15 }
                });
            }
        }
        
        // Actualizar cooldown de curación
        if (enemy.healCooldown) {
            enemy.healCooldown -= deltaTime;
            if (enemy.healCooldown <= 0) enemy.healCooldown = 0;
        }
        
        // Adaptación al daño
        if (enemy.damageAdaptation && enemy.lastHealth && enemy.lastHealth > enemy.health) {
            const damageTaken = enemy.lastHealth - enemy.health;
            if (damageTaken > 0) {
                if (!enemy.adaptationStacks) enemy.adaptationStacks = 0;
                if (enemy.adaptationStacks < enemy.damageAdaptation.maxStacks) {
                    enemy.adaptationStacks++;
                    enemy.armor += enemy.damageAdaptation.armorPerStack;
                    
                    // Efecto visual si aumenta la resistencia significativamente
                    if (enemy.adaptationStacks % 3 === 0) {
                        this.effects.push({
                            x: enemy.x,
                            y: enemy.y,
                            text: "¡ADAPTANDO!",
                            color: "#aaaaff",
                            duration: 1.5,
                            size: 14,
                            velocity: { x: 0, y: -15 }
                        });
                    }
                }
            }
        }
        
        // Guarda la salud actual para la comparación en el próximo frame
        enemy.lastHealth = enemy.health;
        
        // UI
        this.showInstructions = true;
        this.instructionTimer = 5; // Show instructions for 5 seconds
        this.selectedTowerInfo = null;
    }
    
    processEnemySpecialAbilities(enemy, deltaTime) {
        // Procesar habilidades especiales basadas en propiedades
        
        // Capacidad de invisibilidad
        if (enemy.stealthAbility && !enemy.stealthCooldown) {
            // 1% de probabilidad por segundo de volverse invisible
            if (Math.random() < 0.01 * deltaTime) {
                enemy.invisible = true;
                enemy.invisibilityDuration = 3.0; // 3 segundos de invisibilidad
                enemy.stealthCooldown = 8.0; // 8 segundos de cooldown
                
                // Efecto visual
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    text: "STEALTH MODE",
                    color: '#aaaaff',
                    life: 1.0,
                    velocity: -20
                });
            }
        }
        
        // Actualizar duración de invisibilidad
        if (enemy.invisible) {
            enemy.invisibilityDuration -= deltaTime;
            
            if (enemy.invisibilityDuration <= 0) {
                enemy.invisible = false;
                
                // Efecto visual
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    text: "REVEALED",
                    color: '#ffffff',
                    life: 0.8,
                    velocity: -20
                });
            }
        }
        
        // Actualizar cooldown de invisibilidad
        if (enemy.stealthCooldown) {
            enemy.stealthCooldown -= deltaTime;
            if (enemy.stealthCooldown <= 0) {
                enemy.stealthCooldown = 0;
            }
        }
        
        // Enemies con vida máxima pueden tener efecto especial
        if (enemy.health === enemy.maxHealth && enemy.type === 'titan' && !enemy.shieldActive) {
            enemy.shieldActive = true;
            
            // Efecto visual
            this.effects.push({
                x: enemy.x,
                y: enemy.y,
                radius: enemy.size,
                color: '#ffff00aa',
                life: 1.0
            });
            
            this.effects.push({
                x: enemy.x,
                y: enemy.y - enemy.size / 2 - 10,
                text: "SHIELD ACTIVE",
                color: '#ffff00',
                life: 1.0,
                velocity: -20
            });
        }
        
        // Enemigos curativos
        if (enemy.healRadius && enemy.healAmount) {
            // Curar a otros enemigos cercanos
            for (const otherEnemy of this.enemies) {
                if (otherEnemy !== enemy && otherEnemy.health < otherEnemy.maxHealth) {
                    const distance = this.getDistance(enemy, otherEnemy);
                    if (distance <= enemy.healRadius) {
                        // Aplicar curación
                        otherEnemy.health += enemy.healAmount * deltaTime;
                        if (otherEnemy.health > otherEnemy.maxHealth) {
                            otherEnemy.health = otherEnemy.maxHealth;
                        }
                        
                        // Efecto visual (ocasional)
                        if (Math.random() < 0.1) {
                            // Línea de curación entre el curador y el objetivo
                            this.effects.push({
                                x1: enemy.x,
                                y1: enemy.y,
                                x2: otherEnemy.x,
                                y2: otherEnemy.y,
                                color: '#00ff88',
                                life: 0.3,
                                lineEffect: true
                            });
                        }
                    }
                }
            }
            
            // Auto-curación si tiene la habilidad
            if (enemy.selfHealing && enemy.health < enemy.maxHealth) {
                enemy.health += enemy.selfHealing * deltaTime;
                if (enemy.health > enemy.maxHealth) {
                    enemy.health = enemy.maxHealth;
                }
            }
        }
        
        // Genera minions al recibir daño
        if (enemy.spawnMinions && enemy.lastHealth && enemy.lastHealth > enemy.health) {
            const damageTaken = enemy.lastHealth - enemy.health;
            const threshold = enemy.maxHealth * 0.05; // 5% de vida máxima como umbral
            
            if (damageTaken > threshold && Math.random() < enemy.spawnMinions.chance) {
                for (let i = 0; i < enemy.spawnMinions.count; i++) {
                    const spawnedEnemy = this.spawnEnemy(enemy.spawnMinions.type);
                    
                    // Mover al punto del camino más cercano
                    const pathIndex = enemy.pathIndex > 0 ? enemy.pathIndex - 1 : 0;
                    spawnedEnemy.pathIndex = pathIndex;
                    spawnedEnemy.x = enemy.x + (Math.random() * 40 - 20);
                    spawnedEnemy.y = enemy.y + (Math.random() * 40 - 20);
                    
                    // Efecto visual
                    this.effects.push({
                        x: spawnedEnemy.x,
                        y: spawnedEnemy.y,
                        text: "SPAWNED!",
                        color: enemy.color,
                        life: 0.8,
                        velocity: -15
                    });
                }
            }
        }
        
        // Guardar la vida actual para la próxima actualización
        enemy.lastHealth = enemy.health;
        
        // Habilidad de daño adaptativo - aumenta resistencia tras recibir daño repetido
        if (enemy.adaptiveDamage && enemy.damageCounter) {
            if (!enemy.adaptiveResistance) {
                enemy.adaptiveResistance = 0;
            }
            
            // Aumentar resistencia basada en daño recibido
            if (enemy.damageCounter > 3) { // Tras recibir 3 golpes
                const resistanceGain = 0.05;
                enemy.adaptiveResistance += resistanceGain;
                enemy.damageCounter = 0;
                
                // Limitar resistencia adaptativa
                if (enemy.adaptiveResistance > 0.5) {
                    enemy.adaptiveResistance = 0.5;
                }
                
                // Efecto visual
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    text: "ADAPTED",
                    color: '#ffaa00',
                    duration: 0.8,
                    size: 14,
                    velocity: { x: 0, y: -15 }
                });
            }
        }
        
        // Procesar auras de enemigos élite
        if (enemy.auraEffect && enemy.health > 0) {
            this.processEnemyAura(enemy, deltaTime);
        }
    }
    
    processEnemyAura(enemy, deltaTime) {
        // Procesar auras de efecto para otros enemigos cercanos
        if (!enemy.auraEffect || enemy.health <= 0) return;
        
        // Mostrar aura visualmente de forma ocasional
        if (Math.random() < deltaTime * 2) {
            this.effects.push({
                x: enemy.x,
                y: enemy.y,
                radius: enemy.auraEffect.radius,
                color: enemy.color + '33', // Muy transparente
                life: 0.5
            });
        }
        
        // Aplicar efecto a enemigos cercanos
        for (const otherEnemy of this.enemies) {
            if (otherEnemy !== enemy && otherEnemy.health > 0) {
                const distance = this.getDistance(enemy, otherEnemy);
                if (distance <= enemy.auraEffect.radius) {
                    // Aplicar bonificación de armadura
                    if (enemy.auraEffect.armorBonus && !otherEnemy.auraArmorBonus) {
                        otherEnemy.auraArmorBonus = enemy.auraEffect.armorBonus;
                        otherEnemy.armor = (otherEnemy.armor || 0) + enemy.auraEffect.armorBonus;
                    }
                    
                    // Aplicar bonificación de velocidad
                    if (enemy.auraEffect.speedBonus && !otherEnemy.auraSpeedBonus) {
                        otherEnemy.auraSpeedBonus = true;
                        otherEnemy.originalSpeed = otherEnemy.speed;
                        otherEnemy.speed *= enemy.auraEffect.speedBonus;
                        
                        // Efecto visual
                        if (Math.random() < deltaTime * 3) {
                            this.effects.push({
                                x: otherEnemy.x,
                                y: otherEnemy.y,
                                radius: otherEnemy.size / 2,
                                color: '#ffaa0044',
                                life: 0.3
                            });
                        }
                    }
                } else {
                    // Fuera del rango, quitar efectos si estaban activos
                    if (otherEnemy.auraArmorBonus) {
                        otherEnemy.armor -= otherEnemy.auraArmorBonus;
                        if (otherEnemy.armor < 0) otherEnemy.armor = 0;
                        delete otherEnemy.auraArmorBonus;
                    }
                    
                    if (otherEnemy.auraSpeedBonus && otherEnemy.originalSpeed) {
                        otherEnemy.speed = otherEnemy.originalSpeed;
                        delete otherEnemy.auraSpeedBonus;
                        delete otherEnemy.originalSpeed;
                    }
                }
            }
        }
    }
    
    generatePath() {
        // Define a path through the grid for enemies to follow
        // Format: Array of {x, y} coordinates representing grid cells
        const path = [];
        
        // Starting point (left side)
        const startX = 0;
        const startY = Math.floor(this.gridHeight / 2);
        
        path.push({ x: startX, y: startY });
        
        // Create a path with some turns
        let currentX = startX;
        let currentY = startY;
        
        // Go right
        while (currentX < Math.floor(this.gridWidth / 4)) {
            currentX++;
            path.push({ x: currentX, y: currentY });
        }
        
        // Go down
        while (currentY < Math.floor(this.gridHeight * 3 / 4)) {
            currentY++;
            path.push({ x: currentX, y: currentY });
        }
        
        // Go right
        while (currentX < Math.floor(this.gridWidth / 2)) {
            currentX++;
            path.push({ x: currentX, y: currentY });
        }
        
        // Go up
        while (currentY > Math.floor(this.gridHeight / 4)) {
            currentY--;
            path.push({ x: currentX, y: currentY });
        }
        
        // Go right
        while (currentX < Math.floor(this.gridWidth * 3 / 4)) {
            currentX++;
            path.push({ x: currentX, y: currentY });
        }
        
        // Go down
        while (currentY < Math.floor(this.gridHeight * 2 / 3)) {
            currentY++;
            path.push({ x: currentX, y: currentY });
        }
        
        // Go right to the end
        while (currentX < this.gridWidth - 1) {
            currentX++;
            path.push({ x: currentX, y: currentY });
        }
        
        return path;
    }
    
    isOnPath(gridX, gridY) {
        // Check if a grid position is on the path
        return this.path.some(point => point.x === gridX && point.y === gridY);
    }
    
    isOccupiedByTower(gridX, gridY) {
        // Check if a grid position is already occupied by a tower
        return this.towers.some(tower => tower.gridX === gridX && tower.gridY === gridY);
    }
    
    canBuildTower(gridX, gridY) {
        // Check if we can build a tower at this position
        return !this.isOnPath(gridX, gridY) && !this.isOccupiedByTower(gridX, gridY);
    }
    
    enter() {
        console.log("Entering Tower Defense minigame");
        this.reset();
    }
    
    exit() {
        console.log("Exiting Tower Defense minigame");
    }
    
    startWave() {
        if (this.waveInProgress || this.gameOver || this.victory) return;
        
        this.waveNumber++;
        if (this.waveNumber > this.waves.length) {
            // Player has completed all waves!
            this.victory = true;
            // Calculate final score based on remaining lives and money
            const finalScore = this.score + this.lives * 50 + this.money;
            this.game.addPoints(finalScore, 'towerDefense');
            
            // Mensaje de victoria
            this.effects.push({
                x: this.game.width / 2,
                y: this.game.height / 2,
                text: "¡VICTORIA ÉPICA!",
                color: '#ffdd00',
                life: 5.0,
                size: 48
            });
            
            // Mensaje de puntuación
            this.effects.push({
                x: this.game.width / 2,
                y: this.game.height / 2 + 60,
                text: `Score: ${finalScore}`,
                color: '#ffffff',
                life: 5.0,
                size: 36
            });
            
            return;
        }
        
        this.waveInProgress = true;
        this.enemyQueue = [];
        
        // Queue up all enemies for this wave
        const wave = this.waves[this.waveNumber - 1];
        let delay = 0;
        
        // Mensaje de inicio de oleada
        this.effects.push({
            x: this.game.width / 2,
            y: this.game.height / 2 - 50,
            text: `WAVE ${this.waveNumber}`,
            color: '#ff0000',
            duration: 2.0,
            size: 42,
            velocity: { x: 0, y: 0 }
        });
        
        // Si es una oleada muy alta, mostrar mensaje especial
        if (this.waveNumber >= 10) {
            this.effects.push({
                x: this.game.width / 2,
                y: this.game.height / 2,
                text: "¡DIFICULTAD EXTREMA!",
                color: '#ff0000',
                duration: 3.0,
                size: 36,
                velocity: { x: 0, y: 0 }
            });
        }
        
        // Procesar cada grupo de enemigos en la oleada
        for (const enemyGroup of wave) {
            // Calcular retraso inicial si existe
            const startDelay = enemyGroup.startDelay || 0;
            const groupDelay = delay + startDelay;
            
            // Limitar el multiSpawn para que sea más regulado
            // Si multiSpawn es mayor a 2, lo reducimos para evitar que muchos enemigos aparezcan a la vez
            const multiSpawn = Math.min(enemyGroup.multiSpawn || 1, 2);
            
            // Procesar propiedades personalizadas del grupo
            const customProps = {};
            for (const prop in enemyGroup) {
                if (['type', 'count', 'delay', 'startDelay', 'multiSpawn'].indexOf(prop) === -1) {
                    customProps[prop] = enemyGroup[prop];
                }
            }
            
            // Distribuir los enemigos de forma más regular a lo largo del tiempo
            const baseDelay = enemyGroup.delay || 1.0;
            const totalDuration = baseDelay * (enemyGroup.count / multiSpawn);
            const distributionFactor = totalDuration / enemyGroup.count;
            
            // Poner en cola los enemigos con una distribución más uniforme
            for (let i = 0; i < enemyGroup.count; i += multiSpawn) {
                // Calcular cuántos enemigos quedan por generar en este grupo
                const remainingCount = Math.min(multiSpawn, enemyGroup.count - i);
                
                // Calcular un retraso más distribuido para este enemigo o grupo
                const enemyDelay = groupDelay + i * distributionFactor;
                
                // Añadir una pequeña variación aleatoria para hacerlo más natural (±10%)
                const randomVariation = (Math.random() * 0.2 - 0.1) * distributionFactor;
                const finalDelay = enemyDelay + randomVariation;
                
                this.enemyQueue.push({
                    type: enemyGroup.type,
                    count: remainingCount,
                    delay: finalDelay,
                    ...customProps
                });
            }
        }
        
        // Ordenar la cola por tiempo de retraso
        this.enemyQueue.sort((a, b) => a.delay - b.delay);
        
        this.enemiesRemaining = this.waves[this.waveNumber - 1].reduce(
            (total, group) => total + group.count, 0
        );
        
        this.enemySpawnTimer = 0;
        
        // Chance de activar un evento aleatorio al inicio de la oleada
        this.tryTriggerRandomEvent();
    }
    
    spawnEnemy(type, customProperties = {}) {
        const enemyType = this.enemyTypes[type];
        if (!enemyType) return;
        
        // Start at the beginning of the path
        const startPoint = this.path[0];
        
        // Calcular salud base o personalizada
        let baseHealth = enemyType.health;
        if (customProperties.health) {
            // Si se especificó un modificador personalizado de salud (como multiplicador)
            if (typeof customProperties.health === 'number') {
                baseHealth = Math.floor(baseHealth * customProperties.health);
            }
        }
        
        // Create the enemy with all properties from enemyType
        const enemy = {
            type: type,
            x: startPoint.x * this.gridSize,
            y: startPoint.y * this.gridSize,
            health: baseHealth,
            maxHealth: baseHealth,
            speed: enemyType.speed,
            size: this.gridSize * enemyType.size,
            color: enemyType.color,
            reward: enemyType.reward,
            pathIndex: 0,
            slowEffect: 1, // 1 = normal speed, < 1 = slowed
            slowTimer: 0
        };
        
        // Copiar propiedades especiales desde el tipo de enemigo
        if (enemyType.armor !== undefined) enemy.armor = enemyType.armor;
        if (enemyType.evasion !== undefined) enemy.evasion = enemyType.evasion;
        if (enemyType.regeneration !== undefined) enemy.regeneration = enemyType.regeneration;
        if (enemyType.immunities !== undefined) enemy.immunities = [...enemyType.immunities];
        
        // Aplicar propiedades personalizadas adicionales (para enemigos especiales)
        for (const prop in customProperties) {
            if (prop !== 'health') { // La salud ya se procesó antes
                enemy[prop] = customProperties[prop];
            }
        }
        
        // Si es un jefe, mostrar un mensaje de advertencia
        if (type === 'boss') {
            this.effects.push({
                x: this.game.width / 2,
                y: this.game.height / 2 - 50,
                text: "¡BOSS INCOMING!",
                color: '#ff0000',
                life: 2.0,
                size: 36 // Tamaño grande para texto importante
            });
        } else if (type === 'elite') {
            this.effects.push({
                x: this.game.width / 2,
                y: this.game.height / 2 - 50,
                text: "¡ELITE ENEMY!",
                color: '#ffaa00',
                life: 1.5,
                size: 30
            });
        }
        
        this.enemies.push(enemy);
        return enemy; // Devolver la referencia por si se quiere manipular
    }
    
    buildTower(gridX, gridY, type) {
        if (!this.canBuildTower(gridX, gridY)) return false;
        
        const towerType = this.towerTypes[type];
        if (!towerType) return false;
        
        // Check if player has enough money
        if (this.money < towerType.cost) return false;
        
        // Deduct the cost
        this.money -= towerType.cost;
        
        // Create the tower
        const tower = {
            type: type,
            gridX: gridX,
            gridY: gridY,
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2,
            damage: towerType.damage,
            range: towerType.range * this.gridSize,
            fireRate: towerType.fireRate,
            fireTimer: 0,
            target: null,
            projectileSpeed: towerType.projectileSpeed,
            projectileColor: towerType.projectileColor,
            color: towerType.color,
            specialEffect: towerType.specialEffect,
            upgradeLevel: 0,
            upgradeCost: towerType.upgradeCost
        };
        
        this.towers.push(tower);
        return true;
    }
    
    upgradeTower(tower) {
        if (!tower) return false;
        
        // Get the base tower type
        const towerType = this.towerTypes[tower.type];
        if (!towerType) return false;
        
        // Calculate upgrade cost based on current level
        const cost = Math.floor(tower.upgradeCost * (1 + tower.upgradeLevel * 0.5));
        
        // Check if player has enough money
        if (this.money < cost) return false;
        
        // Deduct the cost
        this.money -= cost;
        
        // Upgrade the tower stats
        tower.damage = Math.floor(towerType.damage * (1 + 0.3 * (tower.upgradeLevel + 1)));
        tower.range = towerType.range * this.gridSize * (1 + 0.15 * (tower.upgradeLevel + 1));
        tower.fireRate = towerType.fireRate * (1 + 0.2 * (tower.upgradeLevel + 1));
        tower.upgradeLevel++;
        
        return true;
    }
    
    updateRandomEvents(deltaTime) {
        // Actualizar la duración de eventos activos y eliminar los expirados
        for (let i = this.activeEvents.length - 1; i >= 0; i--) {
            const event = this.activeEvents[i];
            if (event.duration) {
                event.timeLeft -= deltaTime;
                
                // Mostrar contador de tiempo para eventos activos
                if (Math.floor(event.timeLeft) !== Math.floor(event.timeLeft + deltaTime)) {
                    this.effects.push({
                        x: this.game.width - 100,
                        y: 50 + i * 25,
                        text: `${event.name}: ${Math.ceil(event.timeLeft)}s`,
                        color: '#ffcc00',
                        life: 1.0,
                        size: 14
                    });
                }
                
                if (event.timeLeft <= 0) {
                    // El evento ha terminado
                    this.endRandomEvent(event);
                    this.activeEvents.splice(i, 1);
                    
                    // Notificar al jugador
                    this.effects.push({
                        x: this.game.width / 2,
                        y: this.game.height / 2 + 50,
                        text: `¡${event.name} ha terminado!`,
                        color: '#00ff00',
                        life: 2.0,
                        size: 24
                    });
                }
            } else if (event.completed) {
                // Eventos de un solo uso (como emboscada) que ya se completaron
                this.activeEvents.splice(i, 1);
            }
        }
    }
    
    tryTriggerRandomEvent() {
        // No activar eventos durante las dos primeras oleadas
        if (this.waveNumber < 3 || this.gameOver || this.victory) return;
        
        // Filtrar eventos disponibles según el número de oleada actual
        const availableEvents = this.randomEvents.filter(event => 
            (!event.minWave || this.waveNumber >= event.minWave));
        
        if (availableEvents.length === 0) return;
        
        // Seleccionar un evento aleatorio
        const randomIndex = Math.floor(Math.random() * availableEvents.length);
        const selectedEvent = availableEvents[randomIndex];
        
        // Crear una copia del evento para no modificar el original
        const activeEvent = { ...selectedEvent };
        
        // Añadir tiempo restante si tiene duración
        if (activeEvent.duration) {
            activeEvent.timeLeft = activeEvent.duration;
        }
        
        // Iniciar el efecto del evento
        this.startRandomEvent(activeEvent);
        
        // Añadir a los eventos activos
        this.activeEvents.push(activeEvent);
        
        // Notificar al jugador
        this.effects.push({
            x: this.game.width / 2,
            y: this.game.height / 2,
            text: activeEvent.name,
            color: '#ff0000',
            life: 3.0,
            size: 36
        });
        
        this.effects.push({
            x: this.game.width / 2,
            y: this.game.height / 2 + 40,
            text: activeEvent.description,
            color: '#ffffff',
            life: 3.0,
            size: 20
        });
    }
    
    startRandomEvent(event) {
        switch (event.effect) {
            case 'disableTowers':
                // Desactivar todas las torres temporalmente
                for (const tower of this.towers) {
                    tower.disabled = true;
                    
                    // Efecto visual
                    this.effects.push({
                        x: tower.x,
                        y: tower.y,
                        radius: tower.size,
                        color: '#5555ff55',
                        life: 1.0
                    });
                }
                break;
                
            case 'enhanceRegeneration':
                // No necesita código aquí, se maneja en la actualización de enemigos
                break;
                
            case 'reduceTowerRange':
                // Guardar el alcance original de cada torre
                for (const tower of this.towers) {
                    tower.originalRange = tower.range;
                    tower.range *= event.factor;
                    
                    // Efecto visual
                    this.effects.push({
                        x: tower.x,
                        y: tower.y,
                        radius: tower.range,
                        color: '#333333aa',
                        life: 1.0
                    });
                }
                break;
                
            case 'enhanceArmor':
                // Añadir el bonus de armadura a todos los enemigos activos
                for (const enemy of this.enemies) {
                    enemy.originalArmor = enemy.armor || 0;
                    enemy.armor = (enemy.armor || 0) + event.bonus;
                    
                    // Efecto visual
                    this.effects.push({
                        x: enemy.x,
                        y: enemy.y,
                        radius: enemy.size / 2 * 1.5,
                        color: '#888888aa',
                        life: 0.8
                    });
                }
                // Marcar este evento para que afecte también a los nuevos enemigos
                event.affectsNewEnemies = true;
                break;
                
            case 'spawnAmbush':
                // Generar una emboscada de enemigos en puntos aleatorios del camino
                const count = Math.floor(Math.random() * (event.count.max - event.count.min + 1)) + event.count.min;
                const pathIndices = [];
                
                // Seleccionar puntos aleatorios en el camino (evitando el inicio y el final)
                const startIndex = Math.floor(this.path.length * 0.2); // Evitar el 20% inicial
                const endIndex = Math.floor(this.path.length * 0.8); // Evitar el 20% final
                
                for (let i = 0; i < count; i++) {
                    const pathIndex = Math.floor(Math.random() * (endIndex - startIndex)) + startIndex;
                    pathIndices.push(pathIndex);
                }
                
                // Generar enemigos en los puntos seleccionados
                for (let i = 0; i < count; i++) {
                    const enemyTypeIndex = Math.floor(Math.random() * event.enemyTypes.length);
                    const enemyType = event.enemyTypes[enemyTypeIndex];
                    const pathPoint = this.path[pathIndices[i]];
                    
                    // Crear el enemigo directamente
                    const enemy = this.createEnemyAtPathPoint(enemyType, pathIndices[i]);
                    
                    // Efecto visual de teletransporte
                    for (let j = 0; j < 8; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        this.effects.push({
                            x: enemy.x,
                            y: enemy.y,
                            vx: Math.cos(angle) * 60,
                            vy: Math.sin(angle) * 60,
                            radius: 3 + Math.random() * 3,
                            color: '#5500ff',
                            life: 0.6 + Math.random() * 0.4
                        });
                    }
                }
                
                // Marcar el evento como completado
                event.completed = true;
                break;
                
            case 'enhanceSpeed':
                // Aumentar la velocidad de todos los enemigos
                for (const enemy of this.enemies) {
                    enemy.originalSpeed = enemy.speed;
                    enemy.speed *= event.factor;
                    
                    // Efecto visual
                    this.effects.push({
                        x: enemy.x,
                        y: enemy.y,
                        text: "SPEED UP!",
                        color: '#ffaa00',
                        life: 0.8,
                        velocity: -20
                    });
                }
                // Marcar este evento para que afecte también a los nuevos enemigos
                event.affectsNewEnemies = true;
                break;
                
            case 'corruptTower':
                // Seleccionar una torre aleatoria para corromper
                if (this.towers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.towers.length);
                    const tower = this.towers[randomIndex];
                    tower.corrupted = true;
                    
                    // Guardar referencia a la torre corrupta
                    event.corruptedTower = tower;
                    
                    // Efecto visual
                    this.effects.push({
                        x: tower.x,
                        y: tower.y,
                        radius: tower.size * 2,
                        color: '#ff00ffaa',
                        life: 2.0
                    });
                    
                    this.effects.push({
                        x: tower.x,
                        y: tower.y - 20,
                        text: "CORRUPTED!",
                        color: '#ff00ff',
                        life: 2.0,
                        size: 16
                    });
                }
                break;
        }
    }
    
    endRandomEvent(event) {
        switch (event.effect) {
            case 'disableTowers':
                // Reactivar todas las torres
                for (const tower of this.towers) {
                    tower.disabled = false;
                    
                    // Efecto visual
                    this.effects.push({
                        x: tower.x,
                        y: tower.y,
                        radius: tower.size,
                        color: '#00ff00aa',
                        life: 0.5
                    });
                }
                break;
                
            case 'reduceTowerRange':
                // Restaurar el alcance original de cada torre
                for (const tower of this.towers) {
                    if (tower.originalRange) {
                        tower.range = tower.originalRange;
                        delete tower.originalRange;
                    }
                }
                break;
                
            case 'enhanceArmor':
                // Restaurar la armadura original de todos los enemigos
                for (const enemy of this.enemies) {
                    if (enemy.originalArmor !== undefined) {
                        enemy.armor = enemy.originalArmor;
                        delete enemy.originalArmor;
                    }
                }
                break;
                
            case 'enhanceSpeed':
                // Restaurar la velocidad original de todos los enemigos
                for (const enemy of this.enemies) {
                    if (enemy.originalSpeed) {
                        enemy.speed = enemy.originalSpeed;
                        delete enemy.originalSpeed;
                    }
                }
                break;
                
            case 'corruptTower':
                // Restaurar la torre corrupta
                if (event.corruptedTower) {
                    event.corruptedTower.corrupted = false;
                    
                    // Efecto visual
                    this.effects.push({
                        x: event.corruptedTower.x,
                        y: event.corruptedTower.y,
                        radius: event.corruptedTower.size * 2,
                        color: '#00ff00aa',
                        life: 0.8
                    });
                }
                break;
        }
    }
    
    createEnemyAtPathPoint(type, pathIndex) {
        const enemyType = this.enemyTypes[type];
        if (!enemyType) return null;
        
        // Obtener el punto del camino
        const pathPoint = this.path[pathIndex];
        if (!pathPoint) return null;
        
        // Calculamos las coordenadas
        const x = pathPoint.x * this.gridSize + this.gridSize / 2;
        const y = pathPoint.y * this.gridSize + this.gridSize / 2;
        
        // Crear el enemigo
        const enemy = {
            type: type,
            x: x,
            y: y,
            health: enemyType.health,
            maxHealth: enemyType.health,
            speed: enemyType.speed,
            size: this.gridSize * enemyType.size,
            color: enemyType.color,
            reward: enemyType.reward,
            pathIndex: pathIndex,
            slowEffect: 1,
            slowTimer: 0
        };
        
        // Copiar propiedades especiales desde el tipo de enemigo
        for (const prop in enemyType) {
            if (!['name', 'health', 'maxHealth', 'speed', 'color', 'size', 'reward'].includes(prop)) {
                if (typeof enemyType[prop] === 'object' && !Array.isArray(enemyType[prop])) {
                    // Para objetos anidados, hacer una copia profunda simple
                    enemy[prop] = JSON.parse(JSON.stringify(enemyType[prop]));
                } else {
                    enemy[prop] = enemyType[prop];
                }
            }
        }
        
        // Aplicar efectos de eventos activos
        for (const event of this.activeEvents) {
            if (event.affectsNewEnemies) {
                if (event.effect === 'enhanceArmor' && event.bonus) {
                    enemy.originalArmor = enemy.armor || 0;
                    enemy.armor = (enemy.armor || 0) + event.bonus;
                } else if (event.effect === 'enhanceSpeed' && event.factor) {
                    enemy.originalSpeed = enemy.speed;
                    enemy.speed *= event.factor;
                }
            }
        }
        
        this.enemies.push(enemy);
        return enemy;
    }
    
    update(deltaTime) {
        // Call parent update method to handle exit button
        super.update(deltaTime);
        
        // Actualizar eventos aleatorios activos
        this.updateRandomEvents(deltaTime);
        
        // Update instruction timer
        if (this.showInstructions) {
            this.instructionTimer -= deltaTime;
            if (this.instructionTimer <= 0) {
                this.showInstructions = false;
            }
            return;
        }
        
        // Skip updates if game is over
        if (this.gameOver || this.victory) {
            // Check for restart button
            if (this.game.mouseDown) {
                const buttonX = this.game.width / 2;
                const buttonY = this.game.height - 100;
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
        
        // Handle wave timing
        if (!this.waveInProgress) {
            this.waveTimer -= deltaTime;
            if (this.waveTimer <= 0) {
                this.waveTimer = 0;
                // Player can start the wave now
            }
        } else {
            // Spawn enemies from queue con soporte para propiedades personalizadas
            if (this.enemyQueue.length > 0) {
                this.enemySpawnTimer += deltaTime;
                while (this.enemyQueue.length > 0 && this.enemySpawnTimer >= this.enemyQueue[0].delay) {
                    const enemy = this.enemyQueue.shift();
                    
                    // Procesar propiedades personalizadas si existen
                    let customProps = {};
                    for (const prop in enemy) {
                        if (prop !== 'type' && prop !== 'delay') {
                            customProps[prop] = enemy[prop];
                        }
                    }
                    
                    // Generar múltiples enemigos simultáneos si está configurado
                    const count = enemy.count || 1;
                    for (let i = 0; i < count; i++) {
                        this.spawnEnemy(enemy.type, customProps);
                    }
                    this.enemySpawnTimer -= enemy.delay;
                }
            }
            
            // Intentar activar evento aleatorio durante la oleada (si no hay ninguno activo)
            if (this.activeEvents.length === 0 && Math.random() < this.eventChance * deltaTime) {
                this.tryTriggerRandomEvent();
            }
            
            // Check if wave is complete
            if (this.enemyQueue.length === 0 && this.enemies.length === 0) {
                this.waveInProgress = false;
                this.waveTimer = this.waveDelay;
            }
        }
        
        // Update towers
        for (const tower of this.towers) {
            // Increment fire timer
            tower.fireTimer += deltaTime * tower.fireRate;
            
            // Find target if don't have one or if current target is out of range
            if (!tower.target || this.getDistance(tower, tower.target) > tower.range) {
                tower.target = this.findTarget(tower);
            }
            
            // Fire at target if available and timer is ready
            if (tower.target && tower.fireTimer >= 1) {
                this.towerFire(tower);
                tower.fireTimer = 0;
            }
        }
        
        // Update enemies con regeneración y efectos avanzados
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Habilidades especiales basadas en el tipo de enemigo
            this.processEnemySpecialAbilities(enemy, deltaTime);
            
            // Regeneración de salud para enemigos con esta habilidad
            if (enemy.regeneration && enemy.health < enemy.maxHealth) {
                // Verificar bloqueo de regeneración (por torres de hielo)
                if (!enemy.regenerationBlocked) {
                    // Aplicar factor de regeneración de eventos activos
                    let regenFactor = 1;
                    for (const event of this.activeEvents) {
                        if (event.effect === 'enhanceRegeneration') {
                            regenFactor *= event.factor || 1;
                        }
                    }
                    
                    enemy.health += enemy.regeneration * regenFactor * deltaTime;
                    
                    // Limitar a la salud máxima
                    if (enemy.health > enemy.maxHealth) {
                        enemy.health = enemy.maxHealth;
                    }
                    
                    // Mostrar efecto visual de regeneración ocasionalmente
                    if (Math.random() < deltaTime * 3) {
                        this.effects.push({
                            x: enemy.x,
                            y: enemy.y,
                            radius: enemy.size / 3,
                            color: '#00ff00', // Verde para regeneración
                            life: 0.5 + Math.random() * 0.3
                        });
                    }
                } else {
                    // Efecto de regeneración bloqueada
                    if (Math.random() < deltaTime * 2) {
                        this.effects.push({
                            x: enemy.x,
                            y: enemy.y,
                            text: "REGEN BLOCKED",
                            color: '#00aaff',
                            life: 0.4,
                            velocity: -15
                        });
                    }
                }
            }
            
            // Procesar auras de enemigos élite
            if (enemy.auraEffect && enemy.health > 0) {
                this.processEnemyAura(enemy, deltaTime);
            }
            
            // Update slow effect
            if (enemy.slowTimer > 0) {
                // Comprobar inmunidades antes de aplicar ralentización
                if (enemy.immunities && enemy.immunities.includes('slow')) {
                    // Este enemigo es inmune a ralentización
                    enemy.slowEffect = 1;
                    enemy.slowTimer = 0;
                    
                    // Mostrar efecto de inmunidad
                    if (Math.random() < deltaTime * 2) {
                        this.effects.push({
                            x: enemy.x,
                            y: enemy.y,
                            text: "IMMUNE",
                            color: '#ffaa00',
                            life: 0.5,
                            velocity: -20
                        });
                    }
                } else {
                    enemy.slowTimer -= deltaTime;
                    if (enemy.slowTimer <= 0) {
                        enemy.slowEffect = 1; // Remove slow effect
                    }
                    
                    // Efectos de hielo para enemigos ralentizados
                    if (Math.random() < deltaTime * 4) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = enemy.size * 0.6;
                        this.effects.push({
                            x: enemy.x + Math.cos(angle) * distance,
                            y: enemy.y + Math.sin(angle) * distance,
                            radius: 2 + Math.random() * 2,
                            color: '#aaddff', // Azul claro para hielo
                            life: 0.3 + Math.random() * 0.3
                        });
                    }
                }
            }
            
            // Move enemy along path
            this.moveEnemy(enemy, deltaTime);
            
            // Check if enemy reached the end
            if (enemy.pathIndex >= this.path.length) {
                // Enemy reached the end - lose a life
                // Diferentes tipos de enemigos quitan diferente cantidad de vidas
                let livesCost = 1; // Enemigo normal: -1 vida
                
                if (enemy.type === 'boss') {
                    livesCost = 3; // Jefe: -3 vidas
                } else if (enemy.type === 'elite') {
                    livesCost = 2; // Elite: -2 vidas
                }
                
                // Efecto visual para pérdida de vidas
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    text: `-${livesCost} LIVES!`,
                    color: '#ff0000',
                    life: 1.2,
                    velocity: -20
                });
                
                this.lives -= livesCost;
                this.enemies.splice(i, 1);
                
                // Check for game over
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.lives = 0; // Evitar número negativo
                    
                    // Efecto de game over
                    this.effects.push({
                        x: this.game.width / 2,
                        y: this.game.height / 2,
                        text: "GAME OVER",
                        color: '#ff0000',
                        life: 5.0,
                        size: 48
                    });
                }
                continue;
            }
            
            // Check if enemy is dead
            if (enemy.health <= 0) {
                // Gain money and score for killing enemy
                this.money += enemy.reward;
                this.score += enemy.reward;
                
                // Bonificación adicional por enemigos especiales
                if (enemy.type === 'boss' || enemy.type === 'elite') {
                    // Más dinero por enemigos especiales en oleadas finales
                    const bonusReward = Math.floor(enemy.reward * 0.5);
                    this.money += bonusReward;
                    this.score += bonusReward * 2;
                    
                    // Mostrar bonificación
                    this.effects.push({
                        x: enemy.x,
                        y: enemy.y + 30,
                        text: `BONUS: +${bonusReward}$`,
                        color: '#ffff00',
                        life: 1.2,
                        velocity: -15
                    });
                }
                
                // Quitar enemigo de la lista
                this.enemies.splice(i, 1);
                this.enemiesRemaining--;
                continue;
            }
        }
        
        // Update projectiles - Sistema mejorado de física y colisiones
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Crear efectos de estela si está habilitado
            if (projectile.trailEffect && Math.random() < 0.3) {
                this.effects.push({
                    x: projectile.x,
                    y: projectile.y,
                    radius: projectile.size * 0.7,
                    color: projectile.color + '88', // Semi-transparente
                    life: 0.3 + Math.random() * 0.2
                });
            }
            
            // Move projectile
            projectile.x += projectile.vx * deltaTime;
            projectile.y += projectile.vy * deltaTime;
            
            // Para proyectiles con objetivo específico
            if (projectile.target) {
                // Verificar si el objetivo sigue vivo
                if (projectile.target.health <= 0) {
                    // El objetivo ha muerto, buscar otro objetivo cercano
                    let closestEnemy = null;
                    let closestDist = projectile.size * 10; // Radio de búsqueda
                    
                    for (const enemy of this.enemies) {
                        if (enemy.health > 0) {
                            const dist = this.getDistance(projectile, enemy);
                            if (dist < closestDist) {
                                closestDist = dist;
                                closestEnemy = enemy;
                            }
                        }
                    }
                    
                    if (closestEnemy) {
                        // Redirigir el proyectil hacia el nuevo objetivo
                        projectile.target = closestEnemy;
                    } else {
                        // No hay objetivos cercanos, mantener la trayectoria actual
                        projectile.target = null;
                    }
                }
                
                // Si todavía tiene un objetivo válido, verificar colisión
                if (projectile.target) {
                    const distance = this.getDistance(projectile, projectile.target);
                    
                    // Mejorar el sistema de colisiones usando la predicción
                    const hitRadius = projectile.target.size / 2 + projectile.size / 2;
                    
                    if (distance < hitRadius) {
                        // ¡Impacto!
                        this.hitEnemy(projectile.target, projectile.damage, projectile.effect);
                        
                        // Efectos visuales de impacto mejorados
                        for (let j = 0; j < 5; j++) {
                            const angle = Math.random() * Math.PI * 2;
                            const speed = 30 + Math.random() * 30;
                            const size = 2 + Math.random() * 3;
                            
                            this.effects.push({
                                x: projectile.x,
                                y: projectile.y,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed,
                                radius: size,
                                color: projectile.color,
                                life: 0.3 + Math.random() * 0.3
                            });
                        }
                        
                        this.projectiles.splice(i, 1);
                        continue;
                    }
                    
                    // Sistema de guiado suave para algunos proyectiles
                    if (projectile.effect === 'slow') {
                        // Las torres de hielo tienen proyectiles con capacidad de seguimiento leve
                        const targetDx = projectile.target.x - projectile.x;
                        const targetDy = projectile.target.y - projectile.y;
                        const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
                        
                        if (targetDist > 0) {
                            // Calcular vector normal hacia el objetivo
                            const nvx = targetDx / targetDist;
                            const nvy = targetDy / targetDist;
                            
                            // Calcular magnitud actual de velocidad
                            const currentSpeed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
                            
                            // Interpolar ligeramente la dirección actual con la dirección hacia el objetivo
                            const trackingFactor = 0.1; // 10% de corrección por frame
                            projectile.vx = projectile.vx * (1 - trackingFactor) + nvx * currentSpeed * trackingFactor;
                            projectile.vy = projectile.vy * (1 - trackingFactor) + nvy * currentSpeed * trackingFactor;
                            
                            // Renormalizar la velocidad
                            const newSpeed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
                            if (newSpeed > 0) {
                                projectile.vx = (projectile.vx / newSpeed) * currentSpeed;
                                projectile.vy = (projectile.vy / newSpeed) * currentSpeed;
                            }
                        }
                    }
                }
            } else {
                // Para proyectiles sin objetivo específico, verificar colisiones con cualquier enemigo
                for (const enemy of this.enemies) {
                    if (enemy.health > 0) {
                        const distance = this.getDistance(projectile, enemy);
                        const hitRadius = enemy.size / 2 + projectile.size / 2;
                        
                        if (distance < hitRadius) {
                            // ¡Impacto!
                            this.hitEnemy(enemy, projectile.damage, projectile.effect);
                            
                            // Efectos visuales de impacto
                            for (let j = 0; j < 5; j++) {
                                const angle = Math.random() * Math.PI * 2;
                                const speed = 30 + Math.random() * 30;
                                
                                this.effects.push({
                                    x: projectile.x,
                                    y: projectile.y,
                                    vx: Math.cos(angle) * speed,
                                    vy: Math.sin(angle) * speed,
                                    radius: 2 + Math.random() * 3,
                                    color: projectile.color,
                                    life: 0.3 + Math.random() * 0.3
                                });
                            }
                            
                            this.projectiles.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            
            // Verificar límites de pantalla
            if (projectile && (
                projectile.x < -projectile.size ||
                projectile.x > this.game.width + projectile.size ||
                projectile.y < -projectile.size ||
                projectile.y > this.game.height + projectile.size
            )) {
                this.projectiles.splice(i, 1);
            }
            
            // Verificar tiempo de vida (máximo 3 segundos para evitar proyectiles perdidos)
            if (projectile && !projectile.lifeTime) {
                projectile.lifeTime = 3.0;
            } else if (projectile) {
                projectile.lifeTime -= deltaTime;
                if (projectile.lifeTime <= 0) {
                    this.projectiles.splice(i, 1);
                }
            }
        }
        
        // Update visual effects con mejoras visuales avanzadas
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life -= deltaTime;
            
            // Actualizar posición si tiene velocidad
            if (effect.vx !== undefined && effect.vy !== undefined) {
                effect.x += effect.vx * deltaTime;
                effect.y += effect.vy * deltaTime;
                
                // Aplicar gravedad para efectos de partículas
                effect.vy += 100 * deltaTime; // Gravedad suave
                
                // Reducir velocidad por fricción
                const friction = 0.95;
                effect.vx *= Math.pow(friction, deltaTime * 60);
                effect.vy *= Math.pow(friction, deltaTime * 60);
            }
            
            // Movimiento vertical para textos flotantes
            if (effect.velocity !== undefined) {
                effect.y += effect.velocity * deltaTime;
                
                // Desaceleración gradual
                effect.velocity *= 0.95;
            }
            
            // Escalar el tamaño del efecto con el tiempo de vida
            if (effect.radius) {
                const lifeRatio = effect.life / effect.originalLife;
                if (!effect.originalLife) {
                    effect.originalLife = effect.life;
                    effect.originalRadius = effect.radius;
                } else if (lifeRatio < 0.5) {
                    // Solo escalar en la segunda mitad de la vida
                    effect.radius = effect.originalRadius * (0.2 + lifeRatio * 1.6);
                }
            }
            
            // Efectos especiales de desvanecimiento
            if (effect.fadeOut === undefined) {
                effect.fadeOut = true; // Por defecto, todos los efectos se desvanecen
            }
            
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
        
        // Handle mouse input for tower placement
        const mouseGridX = Math.floor(this.game.mouseX / this.gridSize);
        const mouseGridY = Math.floor(this.game.mouseY / this.gridSize);
        
        // Update placement position
        this.placementX = mouseGridX;
        this.placementY = mouseGridY;
        this.canPlaceTower = this.canBuildTower(mouseGridX, mouseGridY);
        
        // Handle tower building
        if (this.game.mouseDown) {
            // Check if clicking in the tower selection area
            if (this.game.mouseY > this.game.height - 100) {
                const buttonWidth = 80;
                const buttonSpacing = 20;
                const startX = (this.game.width - (Object.keys(this.towerTypes).length * (buttonWidth + buttonSpacing) - buttonSpacing)) / 2;
                
                let i = 0;
                for (const type in this.towerTypes) {
                    const x = startX + i * (buttonWidth + buttonSpacing);
                    const y = this.game.height - 70;
                    
                    if (
                        this.game.mouseX >= x &&
                        this.game.mouseX <= x + buttonWidth &&
                        this.game.mouseY >= y - 20 &&
                        this.game.mouseY <= y + 20
                    ) {
                        // Select tower type
                        this.selectedTowerType = type;
                        this.game.mouseDown = false;
                        break;
                    }
                    i++;
                }
                
                // Check if clicked on wave start button
                const waveButtonX = this.game.width - 100;
                const waveButtonY = this.game.height - 70;
                if (
                    !this.waveInProgress &&
                    this.waveTimer === 0 &&
                    this.game.mouseX >= waveButtonX - 50 &&
                    this.game.mouseX <= waveButtonX + 50 &&
                    this.game.mouseY >= waveButtonY - 20 &&
                    this.game.mouseY <= waveButtonY + 20
                ) {
                    this.startWave();
                    this.game.mouseDown = false;
                }
            } else {
                // Check if clicking on an existing tower (for info or upgrades)
                const clickedTower = this.towers.find(tower => 
                    tower.gridX === mouseGridX && tower.gridY === mouseGridY
                );
                
                if (clickedTower) {
                    // Show tower info and upgrade option
                    this.selectedTowerInfo = clickedTower;
                    
                    // Check if clicking on upgrade button
                    if (
                        this.selectedTowerInfo &&
                        this.game.mouseX >= this.game.width - 120 &&
                        this.game.mouseX <= this.game.width - 20 &&
                        this.game.mouseY >= 150 &&
                        this.game.mouseY <= 190
                    ) {
                        this.upgradeTower(this.selectedTowerInfo);
                    }
                } 
                // Otherwise try to build a tower if one is selected
                else if (this.selectedTowerType && this.canPlaceTower) {
                    if (this.buildTower(mouseGridX, mouseGridY, this.selectedTowerType)) {
                        // Tower was built
                        this.selectedTowerType = null;
                    }
                }
                this.game.mouseDown = false;
            }
        }
    }
    
    findTarget(tower) {
        // Sistema mejorado para encontrar el objetivo más adecuado según el tipo de torre
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const enemy of this.enemies) {
            const distance = this.getDistance(tower, enemy);
            
            // Solo considera enemigos dentro del rango
            if (distance <= tower.range) {
                // Calcular una puntuación de prioridad basada en varios factores
                let score = 0;
                
                // Priorizar enemigos más avanzados en el camino (más cerca del final)
                score += enemy.pathIndex * 10;
                
                // Ajustar basado en la salud del enemigo y su tipo
                if (tower.type === 'sniper') {
                    // El francotirador prioriza enemigos con más vida (tanques, jefes)
                    score += (enemy.health / enemy.maxHealth) * 15;
                    // Bonificación adicional para jefes y tanques
                    if (enemy.type === 'boss') score += 30;
                    if (enemy.type === 'tank') score += 20;
                } else if (tower.type === 'fire') {
                    // Torres de fuego priorizan grupos de enemigos (esto se maneja en towerFire)
                    // Pero también son buenas contra grupos de enemigos normales y rápidos
                    if (enemy.type === 'normal' || enemy.type === 'fast') score += 15;
                } else if (tower.type === 'ice') {
                    // Torres de hielo priorizan enemigos rápidos que aún no están ralentizados
                    if (enemy.type === 'fast' && enemy.slowEffect === 1) score += 25;
                    // Menos prioridad para enemigos ya ralentizados
                    if (enemy.slowEffect < 1) score -= 10;
                } else { // Torre básica
                    // Balance general - prioriza enemigos débiles para eliminarlos rápido
                    score += (1 - enemy.health / enemy.maxHealth) * 10;
                }
                
                // Más prioridad a enemigos cercanos para básica, fuego e hielo
                if (tower.type !== 'sniper') {
                    score += (tower.range - distance) / tower.range * 5;
                }
                
                // Considerar velocidad del enemigo (prioridad a enemigos rápidos)
                score += enemy.speed * 0.1;
                
                // Pequeña aleatoriedad para evitar que todas las torres se fijen en el mismo objetivo
                score += Math.random() * 3;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = enemy;
                }
            }
        }
        
        return bestTarget;
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    moveEnemy(enemy, deltaTime) {
        if (enemy.pathIndex >= this.path.length) return;
        
        // Get current and next points on the path
        const currentPoint = this.path[enemy.pathIndex];
        const targetX = currentPoint.x * this.gridSize + this.gridSize / 2;
        const targetY = currentPoint.y * this.gridSize + this.gridSize / 2;
        
        // Calculate direction to target
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move towards the target
        if (distance > 1) {
            const adjustedSpeed = enemy.speed * enemy.slowEffect;
            const vx = dx / distance * adjustedSpeed;
            const vy = dy / distance * adjustedSpeed;
            
            enemy.x += vx * deltaTime;
            enemy.y += vy * deltaTime;
        } else {
            // Reached the current path point, move to next one
            enemy.pathIndex++;
        }
    }
    
    towerFire(tower) {
        if (!tower.target) return;
        
        // Verificar si el objetivo sigue vivo y en rango
        if (tower.target.health <= 0 || this.getDistance(tower, tower.target) > tower.range) {
            tower.target = null;
            return;
        }
        
        // Sistema predictivo: calcular donde estará el enemigo cuando el proyectil llegue
        let targetX = tower.target.x;
        let targetY = tower.target.y;
        
        // Si el enemigo se está moviendo y el proyectil tiene velocidad, predecir su posición
        if (tower.projectileSpeed > 0 && tower.target.speed > 0) {
            // Estimar tiempo que tardará el proyectil en alcanzar la posición actual
            const dx = tower.target.x - tower.x;
            const dy = tower.target.y - tower.y;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            const timeToTarget = currentDistance / tower.projectileSpeed;
            
            // Predecir la posición futura del enemigo basada en su movimiento actual
            if (tower.target.pathIndex < this.path.length) {
                // Obtener el punto de destino actual del enemigo
                const currentPoint = this.path[tower.target.pathIndex];
                const targetPointX = currentPoint.x * this.gridSize + this.gridSize / 2;
                const targetPointY = currentPoint.y * this.gridSize + this.gridSize / 2;
                
                // Calcular dirección de movimiento del enemigo
                const enemyDx = targetPointX - tower.target.x;
                const enemyDy = targetPointY - tower.target.y;
                const enemyDist = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);
                
                if (enemyDist > 0) {
                    // Calcular componentes normalizados de velocidad del enemigo
                    const enemyVx = enemyDx / enemyDist * tower.target.speed * tower.target.slowEffect;
                    const enemyVy = enemyDy / enemyDist * tower.target.speed * tower.target.slowEffect;
                    
                    // Proyectar la posición futura basada en la velocidad actual
                    targetX = tower.target.x + enemyVx * timeToTarget;
                    targetY = tower.target.y + enemyVy * timeToTarget;
                    
                    // Ajustar si la predicción sobrepasa el punto de destino
                    const newDx = targetPointX - targetX;
                    const newDy = targetPointY - targetY;
                    // Si el vector de la posición predicha al punto objetivo tiene dirección opuesta
                    // al vector original, significa que la predicción sobrepasó el punto
                    if ((enemyDx * newDx + enemyDy * newDy) < 0) {
                        targetX = targetPointX;
                        targetY = targetPointY;
                    }
                }
            }
        }
        
        // Calcular la dirección hacia la posición predicha
        const dx = targetX - tower.x;
        const dy = targetY - tower.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Guardar la dirección de apuntado (para animación/visualización)
        tower.aimX = targetX;
        tower.aimY = targetY;
        
        // Procesar efectos especiales y crear proyectiles
        if (tower.specialEffect === 'area') {
            // Fire tower: Damage all enemies in range
            let enemiesHit = 0;
            let damageTotal = 0;
            
            for (const enemy of this.enemies) {
                const distToEnemy = this.getDistance(tower, enemy);
                if (distToEnemy <= tower.range) {
                    // El daño disminuye con la distancia al centro
                    const damageFactor = 1 - (distToEnemy / tower.range) * 0.5;
                    const actualDamage = Math.floor(tower.damage * damageFactor);
                    
                    this.hitEnemy(enemy, actualDamage, tower.specialEffect);
                    damageTotal += actualDamage;
                    enemiesHit++;
                    
                    // Create effect
                    this.effects.push({
                        x: enemy.x,
                        y: enemy.y,
                        radius: enemy.size / 2,
                        color: tower.projectileColor,
                        life: 0.3
                    });
                }
            }
            
            // Crear texto para mostrar el total de daño
            if (enemiesHit > 0) {
                this.effects.push({
                    x: tower.x,
                    y: tower.y - 20,
                    text: `${damageTotal} (x${enemiesHit})`,
                    color: tower.projectileColor,
                    life: 0.8,
                    velocity: -20
                });
            }
            
            // Create area effect visualization
            this.effects.push({
                x: tower.x,
                y: tower.y,
                radius: tower.range,
                color: tower.projectileColor + '44', // Semi-transparent
                life: 0.5
            });
        } else if (tower.specialEffect === 'slow') {
            // Ice tower: Create a projectile that slows enemies
            if (tower.projectileSpeed > 0) {
                // Create a projectile with improved physics
                const vx = dx / distance * tower.projectileSpeed;
                const vy = dy / distance * tower.projectileSpeed;
                
                this.projectiles.push({
                    x: tower.x,
                    y: tower.y,
                    vx: vx,
                    vy: vy,
                    damage: tower.damage,
                    effect: 'slow',
                    target: tower.target,
                    predictedX: targetX,
                    predictedY: targetY,
                    color: tower.projectileColor,
                    size: 5,
                    trailEffect: true
                });
            } else {
                // Instant effect
                this.hitEnemy(tower.target, tower.damage, 'slow');
            }
        } else {
            // Regular tower: Create a projectile
            if (tower.projectileSpeed > 0) {
                // Calculate velocity with small random variation for visual interest
                const spread = tower.type === 'sniper' ? 0 : 0.05; // Francotirador es 100% preciso
                const randomAngle = (Math.random() - 0.5) * spread;
                const vxBase = dx / distance;
                const vyBase = dy / distance;
                
                // Aplicar rotación al vector de velocidad
                const cos = Math.cos(randomAngle);
                const sin = Math.sin(randomAngle);
                const vx = (vxBase * cos - vyBase * sin) * tower.projectileSpeed;
                const vy = (vxBase * sin + vyBase * cos) * tower.projectileSpeed;
                
                // Create projectile with improved physics
                this.projectiles.push({
                    x: tower.x,
                    y: tower.y,
                    vx: vx,
                    vy: vy,
                    damage: tower.damage,
                    effect: null,
                    target: tower.target,
                    predictedX: targetX,
                    predictedY: targetY,
                    color: tower.projectileColor,
                    size: tower.type === 'sniper' ? 7 : 5, // Proyectiles más grandes para francotirador
                    trailEffect: tower.type === 'sniper' // Solo francotirador deja estela
                });
            } else {
                // Instant hit
                this.hitEnemy(tower.target, tower.damage, null);
            }
        }
    }
    
    hitEnemy(enemy, damage, effect, sourceType = null, armorPierce = 0, ignoreEvasion = false) {
        // Comprobar evasión (si el enemigo tiene esta propiedad y el ataque no la ignora)
        if (!ignoreEvasion && enemy.evasion && Math.random() < enemy.evasion) {
            // El enemigo evadió el ataque
            this.effects.push({
                x: enemy.x,
                y: enemy.y - enemy.size / 2,
                text: 'EVADED!',
                color: '#ffffff',
                life: 0.8,
                velocity: -30
            });
            return; // No aplicar daño ni efectos
        }
        
        // Si el ataque ignora la evasión y el enemigo tenía evasión, mostrar un efecto especial
        if (ignoreEvasion && enemy.evasion && enemy.evasion > 0) {
            this.effects.push({
                x: enemy.x,
                y: enemy.y - enemy.size / 2,
                text: 'PIERCED!',
                color: '#ff5500',
                life: 0.8,
                velocity: -30
            });
        }
        
        // Calcular daño reducido por armadura (si tiene), teniendo en cuenta la penetración
        let actualDamage = damage;
        if (enemy.armor && enemy.armor > 0) {
            // Calcular armadura efectiva después de penetración
            const effectiveArmor = Math.max(0, enemy.armor - armorPierce);
            
            // Reducir el daño según el porcentaje de armadura efectiva
            if (effectiveArmor > 0) {
                actualDamage = Math.max(1, Math.floor(damage * (1 - effectiveArmor)));
                
                // Efecto visual de absorción de daño por armadura
                if (damage > actualDamage) {
                    this.effects.push({
                        x: enemy.x,
                        y: enemy.y,
                        radius: enemy.size / 2 * 1.2,
                        color: '#c0c0c0', // Efecto plateado de armadura
                        life: 0.3
                    });
                }
            } else if (armorPierce > 0 && enemy.armor > 0) {
                // La armadura fue completamente penetrada
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    radius: enemy.size / 2 * 1.2,
                    color: '#ff0000', // Efecto rojo para penetración de armadura
                    life: 0.3
                });
            }
        }
        
        // Verificar inmunidades (para efectos especiales)
        let effectApplied = true;
        if (effect && enemy.immunities && enemy.immunities.includes(effect)) {
            effectApplied = false;
            
            // Efecto visual de resistencia
            this.effects.push({
                x: enemy.x,
                y: enemy.y - enemy.size / 2,
                text: 'IMMUNE!',
                color: '#ffaa00',
                life: 0.8,
                velocity: -30
            });
        }
        
        // Aplicar daño
        enemy.health -= actualDamage;
        
        // Aplicar efectos especiales si no es inmune
        if (effect === 'slow' && enemy.slowEffect === 1 && effectApplied) {
            enemy.slowEffect = 0.5; // 50% más lento
            enemy.slowTimer = 3; // Durante 3 segundos
            
            // Efecto visual de ralentización
            this.effects.push({
                x: enemy.x,
                y: enemy.y,
                radius: enemy.size / 2 * 1.3,
                color: '#00ccff80', // Color hielo semi-transparente
                life: 0.5
            });
        }
        
        // Crear efecto de impacto
        this.effects.push({
            x: enemy.x,
            y: enemy.y,
            radius: enemy.size / 2,
            color: '#ffffff',
            life: 0.2
        });
        
        // Crear efecto numérico de daño con diferentes colores según el tipo
        let damageColor = '#ff0000'; // Rojo por defecto
        
        if (damage > actualDamage) {
            // Daño reducido por armadura
            damageColor = '#ff8800';
        }
        
        // Mostrar daño efectivo con texto indicando si fue reducido
        let damageText = actualDamage.toString();
        if (damage > actualDamage) {
            const reduction = Math.floor((damage - actualDamage) / damage * 100);
            damageText += ` (-${reduction}%)`;
        }
        
        this.effects.push({
            x: enemy.x,
            y: enemy.y - enemy.size / 2,
            text: damageText,
            color: damageColor,
            life: 0.8,
            velocity: -30 // Mover hacia arriba
        });
        
        // Si el enemigo murió, crear efecto de muerte y dar recompensa
        if (enemy.health <= 0) {
            // Más efectos de partículas para una muerte más vistosa
            for (let i = 0; i < 12; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 60 + Math.random() * 80;
                
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: 3 + Math.random() * 4,
                    color: enemy.color,
                    life: 0.6 + Math.random() * 0.7
                });
            }
            
            // Crear efecto de texto con la recompensa
            this.effects.push({
                x: enemy.x,
                y: enemy.y,
                text: `+${enemy.reward}$`,
                color: '#ffff00', // Amarillo para el dinero
                life: 1.0,
                velocity: -25
            });
            
            // Mostrar el nombre del enemigo derrotado para tipos especiales
            if (enemy.type === 'boss' || enemy.type === 'elite') {
                this.effects.push({
                    x: enemy.x,
                    y: enemy.y + enemy.size / 2,
                    text: `${this.enemyTypes[enemy.type].name} defeated!`,
                    color: '#ffffff',
                    life: 1.2,
                    velocity: 20 // Mover hacia abajo
                });
            }
        }
    }
    
    render(ctx) {
        // Draw background grid
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw grid
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                ctx.strokeRect(
                    x * this.gridSize,
                    y * this.gridSize,
                    this.gridSize,
                    this.gridSize
                );
            }
        }
        
        // Draw path
        ctx.fillStyle = '#554433';
        for (const point of this.path) {
            ctx.fillRect(
                point.x * this.gridSize,
                point.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
        }
        
        // Draw path border
        ctx.strokeStyle = '#665544';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.path.length; i++) {
            const point = this.path[i];
            const x = point.x * this.gridSize + this.gridSize / 2;
            const y = point.y * this.gridSize + this.gridSize / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Draw start and end points
        const startPoint = this.path[0];
        const endPoint = this.path[this.path.length - 1];
        
        // Start
        ctx.fillStyle = '#33aa33';
        ctx.beginPath();
        ctx.arc(
            startPoint.x * this.gridSize + this.gridSize / 2,
            startPoint.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 3,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // End
        ctx.fillStyle = '#aa3333';
        ctx.beginPath();
        ctx.arc(
            endPoint.x * this.gridSize + this.gridSize / 2,
            endPoint.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 3,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw tower placement preview
        if (this.selectedTowerType) {
            // Get tower type properties
            const towerType = this.towerTypes[this.selectedTowerType];
            
            // Draw placement indicator
            ctx.fillStyle = this.canPlaceTower ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(
                this.placementX * this.gridSize,
                this.placementY * this.gridSize,
                this.gridSize,
                this.gridSize
            );
            
            // Draw range indicator
            ctx.strokeStyle = this.canPlaceTower ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(
                this.placementX * this.gridSize + this.gridSize / 2,
                this.placementY * this.gridSize + this.gridSize / 2,
                towerType.range * this.gridSize,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
        
        // Draw towers
        for (const tower of this.towers) {
            // Draw tower base
            ctx.fillStyle = tower.color;
            ctx.fillRect(
                tower.gridX * this.gridSize + this.gridSize * 0.15,
                tower.gridY * this.gridSize + this.gridSize * 0.15,
                this.gridSize * 0.7,
                this.gridSize * 0.7
            );
            
            // Draw tower top
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(
                tower.x,
                tower.y,
                this.gridSize * 0.25,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw upgrade level indicators
            for (let i = 0; i < tower.upgradeLevel; i++) {
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(
                    tower.gridX * this.gridSize + this.gridSize * 0.25 + i * this.gridSize * 0.2,
                    tower.gridY * this.gridSize + this.gridSize * 0.85,
                    this.gridSize * 0.08,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            
            // Draw range indicator if this tower is selected
            if (this.selectedTowerInfo === tower) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(
                    tower.x,
                    tower.y,
                    tower.range,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }
            
            // Draw line to target
            if (tower.target) {
                ctx.strokeStyle = tower.projectileColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(tower.x, tower.y);
                ctx.lineTo(tower.target.x, tower.target.y);
                ctx.stroke();
            }
        }
        
        // Draw projectiles con efectos visuales mejorados
        for (const projectile of this.projectiles) {
            // Dibujar estela para proyectiles rápidos o con efecto de estela
            if (projectile.trailEffect) {
                const speed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
                const trailLength = speed / 50; // Longitud proporcional a velocidad
                
                // Calcular dirección normalizada inversa
                const trailDirX = -projectile.vx / speed;
                const trailDirY = -projectile.vy / speed;
                
                // Dibujar estela con gradiente
                const gradient = ctx.createLinearGradient(
                    projectile.x, 
                    projectile.y,
                    projectile.x + trailDirX * projectile.size * 10,
                    projectile.y + trailDirY * projectile.size * 10
                );
                
                gradient.addColorStop(0, projectile.color);
                gradient.addColorStop(1, projectile.color + '00'); // Transparente al final
                
                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = projectile.size * 1.5;
                ctx.moveTo(projectile.x, projectile.y);
                ctx.lineTo(
                    projectile.x + trailDirX * projectile.size * 10,
                    projectile.y + trailDirY * projectile.size * 10
                );
                ctx.stroke();
            }
            
            // Dibujar el proyectil principal con brillo
            ctx.fillStyle = projectile.color;
            ctx.beginPath();
            ctx.arc(
                projectile.x,
                projectile.y,
                projectile.size,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Centro brillante para efecto de resplandor
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(
                projectile.x,
                projectile.y,
                projectile.size / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw enemies con formas distintivas según el tipo
        for (const enemy of this.enemies) {
            // Guardar la posición previa para la animación de movimiento
            if (!enemy.lastX) {
                enemy.lastX = enemy.x;
                enemy.lastY = enemy.y;
            }
            
            // Efecto visual para enemigos ralentizados (hielo)
            if (enemy.slowEffect < 1) {
                ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(
                    enemy.x,
                    enemy.y,
                    enemy.size / 2 * 1.4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Cristales de hielo alrededor
                const crystalCount = 5;
                ctx.fillStyle = 'rgba(150, 220, 255, 0.6)';
                
                for (let i = 0; i < crystalCount; i++) {
                    const angle = (i / crystalCount) * Math.PI * 2 + this.game.currentTime * 2;
                    const x = enemy.x + Math.cos(angle) * (enemy.size / 2 * 1.2);
                    const y = enemy.y + Math.sin(angle) * (enemy.size / 2 * 1.2);
                    
                    ctx.beginPath();
                    ctx.arc(x, y, enemy.size / 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Color base del enemigo
            ctx.fillStyle = enemy.color;
            
            // Dibujar forma distintiva según el tipo de enemigo
            if (enemy.type === 'fast') {
                // Enemigo rápido: triángulo apuntando en dirección del movimiento
                const dx = enemy.x - enemy.lastX;
                const dy = enemy.y - enemy.lastY;
                let angle = 0;
                
                if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                    angle = Math.atan2(dy, dx);
                }
                
                ctx.save();
                ctx.translate(enemy.x, enemy.y);
                ctx.rotate(angle);
                
                ctx.beginPath();
                ctx.moveTo(enemy.size / 2, 0);
                ctx.lineTo(-enemy.size / 2, -enemy.size / 3);
                ctx.lineTo(-enemy.size / 2, enemy.size / 3);
                ctx.closePath();
                ctx.fill();
                
                // Detalle interior
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.moveTo(enemy.size / 4, 0);
                ctx.lineTo(-enemy.size / 4, -enemy.size / 6);
                ctx.lineTo(-enemy.size / 4, enemy.size / 6);
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
            } else if (enemy.type === 'tank') {
                // Enemigo tanque: hexágono resistente
                ctx.beginPath();
                const sides = 6;
                const size = enemy.size / 2;
                
                ctx.save();
                ctx.translate(enemy.x, enemy.y);
                ctx.rotate(this.game.currentTime * 0.2); // Rotación lenta
                
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    const x = Math.cos(angle) * size;
                    const y = Math.sin(angle) * size;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                
                // Detalle interior
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    const x = Math.cos(angle) * (size * 0.6);
                    const y = Math.sin(angle) * (size * 0.6);
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
            } else if (enemy.type === 'boss') {
                // Enemigo jefe: estrella grande y amenazante
                ctx.save();
                ctx.translate(enemy.x, enemy.y);
                ctx.rotate(this.game.currentTime * 0.5); // Rotación
                
                // Dibujar estrella de 5 puntas
                ctx.beginPath();
                const spikes = 5;
                const outerRadius = enemy.size / 2;
                const innerRadius = enemy.size / 4;
                
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i / (spikes * 2)) * Math.PI * 2;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                
                // Círculo interior para detalle
                ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
                ctx.beginPath();
                ctx.arc(0, 0, innerRadius * 0.8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                
                // Efecto de aura pulsante para el jefe
                const pulseSize = 1 + Math.sin(this.game.currentTime * 3) * 0.1;
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.size / 2 * pulseSize * 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            } else {
                // Enemigo normal: círculo simple
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Detalle interior
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.size / 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Actualizar posición previa
            enemy.lastX = enemy.x;
            enemy.lastY = enemy.y;
            
            // Health bar con diseño mejorado
            const healthBarWidth = enemy.size * 0.8;
            const healthPercent = enemy.health / enemy.maxHealth;
            const healthBarHeight = 6;
            const barY = enemy.y - enemy.size / 2 - 12;
            
            // Fondo de la barra de salud
            ctx.fillStyle = 'rgba(40, 40, 40, 0.6)';
            ctx.fillRect(
                enemy.x - healthBarWidth / 2,
                barY,
                healthBarWidth,
                healthBarHeight
            );
            
            // Gradiente de color para la barra de salud
            let healthColor;
            if (healthPercent > 0.6) {
                healthColor = '#22cc22'; // Verde para salud alta
            } else if (healthPercent > 0.3) {
                healthColor = '#ffcc00'; // Amarillo para salud media
            } else {
                healthColor = '#ff3333'; // Rojo para salud baja
            }
            
            // Barra de salud
            ctx.fillStyle = healthColor;
            ctx.fillRect(
                enemy.x - healthBarWidth / 2,
                barY,
                healthBarWidth * healthPercent,
                healthBarHeight
            );
            
            // Borde de la barra de salud
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                enemy.x - healthBarWidth / 2,
                barY,
                healthBarWidth,
                healthBarHeight
            );
        }
        
        // Draw effects
        for (const effect of this.effects) {
            if (effect.radius) {
                // Circle effect
                ctx.fillStyle = effect.color;
                ctx.beginPath();
                ctx.arc(
                    effect.x,
                    effect.y,
                    effect.radius,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else if (effect.text) {
                // Text effect
                ctx.fillStyle = effect.color;
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Move text effect upward
                const yOffset = effect.velocity ? effect.velocity * (1 - effect.life) : 0;
                
                ctx.fillText(
                    effect.text,
                    effect.x,
                    effect.y + yOffset
                );
            } else {
                // Particle effect
                ctx.fillStyle = effect.color;
                ctx.beginPath();
                
                // Move particle
                if (effect.vx && effect.vy) {
                    effect.x += effect.vx * (1 - effect.life) * 0.1;
                    effect.y += effect.vy * (1 - effect.life) * 0.1;
                }
                
                ctx.arc(
                    effect.x,
                    effect.y,
                    effect.radius * effect.life, // Shrink as life decreases
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        // Draw UI panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, this.game.height - 100, this.game.width, 100);
        
        // Draw tower selection buttons
        const buttonWidth = 80;
        const buttonSpacing = 20;
        const startX = (this.game.width - (Object.keys(this.towerTypes).length * (buttonWidth + buttonSpacing) - buttonSpacing)) / 2;
        
        let i = 0;
        for (const type in this.towerTypes) {
            const towerType = this.towerTypes[type];
            const x = startX + i * (buttonWidth + buttonSpacing);
            const y = this.game.height - 70;
            
            // Button background
            ctx.fillStyle = this.selectedTowerType === type ? towerType.color : '#444444';
            ctx.fillRect(x - buttonWidth / 2, y - 20, buttonWidth, 40);
            
            // Tower icon
            ctx.fillStyle = towerType.color;
            ctx.fillRect(x - 15, y - 15, 30, 30);
            
            // Tower cost
            ctx.fillStyle = this.money >= towerType.cost ? '#ffffff' : '#ff4444';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$' + towerType.cost, x, y + 25);
            
            i++;
        }
        
        // Draw game stats
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Money: $${this.money}`, 20, this.game.height - 70);
        ctx.fillText(`Lives: ${this.lives}`, 20, this.game.height - 40);
        
        // Draw wave info
        ctx.textAlign = 'center';
        let waveText = '';
        if (this.waveInProgress) {
            waveText = `Wave ${this.waveNumber} - Enemies: ${this.enemiesRemaining}`;
        } else if (this.waveTimer > 0) {
            waveText = `Next wave in ${Math.ceil(this.waveTimer)}s`;
        } else {
            waveText = 'Ready for next wave!';
        }
        ctx.fillText(waveText, this.game.width / 2, this.game.height - 55);
        
        // Draw start wave button
        if (!this.waveInProgress && this.waveTimer === 0) {
            ctx.fillStyle = '#55aa55';
            ctx.fillRect(this.game.width - 150, this.game.height - 90, 100, 40);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('Start Wave', this.game.width - 100, this.game.height - 70);
        }
        
        // Draw selected tower info panel
        if (this.selectedTowerInfo) {
            const tower = this.selectedTowerInfo;
            const towerType = this.towerTypes[tower.type];
            const panelX = this.game.width - 220;
            const panelY = 80;
            const panelWidth = 200;
            const panelHeight = 160;
            
            // Panel background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            
            // Tower name
            ctx.fillStyle = tower.color;
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(towerType.name, panelX + panelWidth / 2, panelY + 20);
            
            // Tower stats
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Damage: ${tower.damage}`, panelX + 10, panelY + 50);
            ctx.fillText(`Range: ${Math.floor(tower.range / this.gridSize * 10) / 10}`, panelX + 10, panelY + 70);
            ctx.fillText(`Fire Rate: ${tower.fireRate.toFixed(1)}`, panelX + 10, panelY + 90);
            ctx.fillText(`Level: ${tower.upgradeLevel}`, panelX + 10, panelY + 110);
            
            // Upgrade button
            const upgradeCost = Math.floor(tower.upgradeCost * (1 + tower.upgradeLevel * 0.5));
            ctx.fillStyle = this.money >= upgradeCost ? '#55aa55' : '#aa5555';
            ctx.fillRect(panelX + 80, panelY + 130, 100, 20);
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(`Upgrade: $${upgradeCost}`, panelX + 130, panelY + 140);
        }
        
        // Draw exit button using parent method
        super.render(ctx);
        
        // Draw game over or victory screen
        if (this.gameOver || this.victory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (this.victory) {
                ctx.fillStyle = '#ffcc00';
                ctx.fillText('Victory!', this.game.width / 2, this.game.height / 3);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px Arial';
                ctx.fillText(`All waves completed!`, this.game.width / 2, this.game.height / 2 - 40);
                ctx.fillText(`Score: ${this.score}`, this.game.width / 2, this.game.height / 2);
                ctx.fillText(`Lives Remaining: ${this.lives}`, this.game.width / 2, this.game.height / 2 + 30);
                ctx.fillText(`Money Remaining: $${this.money}`, this.game.width / 2, this.game.height / 2 + 60);
                
                // Calculate final score for display
                const finalScore = this.score + this.lives * 50 + this.money;
                ctx.fillStyle = '#ffcc00';
                ctx.fillText(`Final Score: ${finalScore}`, this.game.width / 2, this.game.height / 2 + 100);
            } else {
                ctx.fillStyle = '#ff5555';
                ctx.fillText('Game Over', this.game.width / 2, this.game.height / 3);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px Arial';
                ctx.fillText(`You were defeated on wave ${this.waveNumber}`, this.game.width / 2, this.game.height / 2 - 20);
                ctx.fillText(`Score: ${this.score}`, this.game.width / 2, this.game.height / 2 + 20);
            }
            
            // Restart button
            ctx.fillStyle = '#4CAF50';
            const buttonX = this.game.width / 2;
            const buttonY = this.game.height - 100;
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
        
        // Draw instructions
        if (this.showInstructions) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Tower Defense', this.game.width / 2, this.game.height / 4 - 30);
            
            ctx.font = '20px Arial';
            ctx.fillText('Defend your base against waves of enemies!', this.game.width / 2, this.game.height / 4 + 20);
            ctx.fillText('1. Select towers from the bottom panel', this.game.width / 2, this.game.height / 4 + 60);
            ctx.fillText('2. Click on the grid to place towers (not on the path)', this.game.width / 2, this.game.height / 4 + 90);
            ctx.fillText('3. Click on towers to see stats and upgrade options', this.game.width / 2, this.game.height / 4 + 120);
            ctx.fillText('4. Click Start Wave when ready', this.game.width / 2, this.game.height / 4 + 150);
            
            // Tower types info
            ctx.font = '24px Arial';
            ctx.fillText('Tower Types:', this.game.width / 2, this.game.height / 2 + 20);
            
            let i = 0;
            const typeSpacing = 200;
            const startX = this.game.width / 2 - ((Object.keys(this.towerTypes).length - 1) * typeSpacing) / 2;
            
            for (const type in this.towerTypes) {
                const towerType = this.towerTypes[type];
                const x = startX + i * typeSpacing;
                const y = this.game.height / 2 + 80;
                
                // Tower color box
                ctx.fillStyle = towerType.color;
                ctx.fillRect(x - 15, y - 15, 30, 30);
                
                // Tower name and info
                ctx.fillStyle = '#ffffff';
                ctx.font = '18px Arial';
                ctx.fillText(towerType.name, x, y + 30);
                ctx.font = '14px Arial';
                ctx.fillText(`$${towerType.cost}`, x, y + 50);
                
                i++;
            }
        }
    }
}
