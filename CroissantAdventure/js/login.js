import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getDatabase, ref, get, child, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD8JQ2a7CcR2nmyGLwLc1DM9inHB5HDd1w",
  authDomain: "croissant-adventures2.firebaseapp.com",
  databaseURL: "https://croissant-adventures2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "croissant-adventures2",
  storageBucket: "croissant-adventures2.firebasestorage.app",
  messagingSenderId: "1080436575270",
  appId: "1:1080436575270:web:30cbfed22929b24f80aae7",
  measurementId: "G-HSRQ1R6M2F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const characterOptions = document.querySelectorAll('.character-option');
    const parentalControlToggle = document.getElementById('parental-control-toggle');
    const playTimeInput = document.getElementById('play-time');
    const childAgeInput = document.getElementById('child-age');
    const taskDescriptionInput = document.getElementById('task-description');
    const outfitSelection = document.getElementById('outfit-selection');
    const outfitViewer = document.getElementById('outfit-viewer');
    const outfitPrev = document.getElementById('outfit-prev');
    const outfitNext = document.getElementById('outfit-next');
    const outfitCharacterName = document.getElementById('outfit-character-name');
    const errorMessage = document.getElementById('error-message');
    
    let selectedCharacter = 'croiso'; // Por defecto es Croiso
    let currentOutfit = 1;
    const totalOutfits = 6;

    // Nombres personalizados para cada outfit
    const outfitNames = {
        croiso: [
            "Croiso",
            "Croiso Universitario",
            "Croiso Surfista",
            "Croiso Encantador de Serpientes",
            "Croiso Pescador",
            "Croiso Pianista"
        ],
        croisa: [
            "Croisa Exploradora",
            "Croisa Pastelera",
            "Croisa Sirena",
            "Croisa Hada",
            "Croisa Deportista",
            "Croisa Artista"
        ]
    };
    
    // Manejo de selección de personaje
    characterOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Quitar clase selected de todas las opciones
            characterOptions.forEach(op => op.classList.remove('selected'));
            
            // Añadir clase selected a la opción clicada
            this.classList.add('selected');
            
            // Guardar el personaje seleccionado
            selectedCharacter = this.getAttribute('data-character');
            console.log('Personaje seleccionado:', selectedCharacter);
            
            // Actualizar la imagen principal con el personaje seleccionado
            document.querySelector('.croissant').style.backgroundImage = `url('${selectedCharacter}.png')`;
                            
            // Mostrar selección de outfit
            showOutfitSelection(selectedCharacter);
        });
    });
    
    // Mostrar visor de outfits con flechas y nombre personalizado
    function showOutfitSelection(character) {
        outfitSelection.style.display = 'block';
        currentOutfit = 1;
        updateOutfitViewer(character, currentOutfit);
    }
    
    function updateOutfitViewer(character, outfitNum) {
        outfitViewer.src = `${character}_outfit${outfitNum}.png`;
        outfitViewer.alt = `Outfit ${outfitNum}`;
        // Mostrar nombre personalizado del outfit
        const namesArr = outfitNames[character] || [];
        outfitCharacterName.textContent = namesArr[outfitNum - 1] || '';
        // Guardar selección en localStorage
        localStorage.setItem('selectedOutfit', outfitNum);
    }
    
    outfitPrev.addEventListener('click', function() {
        currentOutfit = currentOutfit === 1 ? totalOutfits : currentOutfit - 1;
        updateOutfitViewer(selectedCharacter, currentOutfit);
    });
    
    outfitNext.addEventListener('click', function() {
        currentOutfit = currentOutfit === totalOutfits ? 1 : currentOutfit + 1;
        updateOutfitViewer(selectedCharacter, currentOutfit);
    });
    
    // Control parental - Toggle
    parentalControlToggle.addEventListener('change', function() {
        const parentalControls = document.querySelectorAll('.parental-controls input, .parental-controls textarea');
        
        // Habilitar/deshabilitar inputs excepto el toggle mismo
        parentalControls.forEach(control => {
            if (control !== parentalControlToggle) {
                control.disabled = !this.checked;
            }
        });
        
        // Efecto visual
        if (this.checked) {
            document.querySelector('.parental-controls').style.opacity = '1';
            playTimeInput.focus();
        } else {
            document.querySelector('.parental-controls').style.opacity = '0.7';
        }
    });
    
    // Inicializar estado de los controles parentales
    document.querySelectorAll('.parental-controls input, .parental-controls textarea').forEach(control => {
        if (control !== parentalControlToggle) {
            control.disabled = !parentalControlToggle.checked;
        }
    });
    document.querySelector('.parental-controls').style.opacity = parentalControlToggle.checked ? '1' : '0.7';
    
    // Efectos visuales en los campos
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.05)';
            errorMessage.style.display = 'none';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
        
        // Al presionar Enter en el campo de contraseña, intentar iniciar sesión
        if (input.id === 'password') {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    loginButton.click();
                }
            });
        }
    });
    
    // Definir la animación de sacudida
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);

    // Función de login con Firebase
    loginButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const childAge = childAgeInput.value.trim();
        
        if (username === '' || password === '') {
            errorMessage.textContent = 'Por favor, completa todos los campos.';
            errorMessage.style.display = 'block';
            return;
        }

        // Animación de procesamiento
        loginButton.innerHTML = '<span class="loading">Procesando...</span>';
        loginButton.disabled = true;

        // Casos especiales de inicio de sesión
        const correctUsername = 'admin';
        const correctPassword = 'admin';
        
        try {
            if (username === correctUsername && password === correctPassword) {
                // Iniciar sesión anónima para admin
                await signInAnonymously(auth);
                handleSuccessfulLogin('admin', selectedCharacter, childAge, parentalControlToggle.checked);
                
            } else if (username === 'manage' && password === 'manage') {
                await signInAnonymously(auth);
                window.location.href = 'manage.html';
                
            } else if (username === 'demo' && password === 'demo') {
                // Iniciar sesión anónima para demo
                await signInAnonymously(auth);
                
                // Guardar indicador de modo demo
                localStorage.setItem('demoMode', 'true');
                localStorage.setItem('selectedCharacter', 'croiso'); // Forzar Croiso para la demo
                localStorage.setItem('playerName', 'Demo');
                
                // Redirigir a la página de demostración
                window.location.href = 'demo.html';
                
            } else {
                // Consultar usuario en la base de datos de Firebase
                const userSnapshot = await get(child(ref(db), `users/${username}`));
                
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    
                    if (userData.password === password) {
                        // Iniciar sesión con Firebase Auth si el usuario tiene email
                        if (userData.email) {
                            try {
                                await signInWithEmailAndPassword(auth, userData.email, password);
                            } catch (authError) {
                                console.log("Error de autenticación, usando inicio de sesión anónimo", authError);
                                await signInAnonymously(auth);
                            }
                        } else {
                            await signInAnonymously(auth);
                        }
                        
                        // Actualizar datos de último inicio de sesión
                        const userRef = ref(db, `users/${username}`);
                        await update(userRef, {
                            lastLogin: new Date().toISOString()
                        });
                        
                        // Procesar el inicio de sesión exitoso
                        handleSuccessfulLogin(username, selectedCharacter, childAge, parentalControlToggle.checked);
                        
                    } else {
                        handleLoginError('¡Contraseña incorrecta!');
                    }
                } else {
                    handleLoginError('¡Usuario no encontrado!');
                }
            }
        } catch (error) {
            console.error("Error en inicio de sesión:", error);
            handleLoginError('Error de conexión. Inténtalo de nuevo.');
        }
    });
    
    // Función para manejar el inicio de sesión exitoso
    function handleSuccessfulLogin(username, character, childAge, parentalControlEnabled) {
        // Guardar el personaje seleccionado en localStorage
        localStorage.setItem('selectedCharacter', character);
        localStorage.setItem('selectedOutfit', currentOutfit);
        localStorage.setItem('playerName', username);
        
        // Guardar configuración de control parental si está activado
        if (parentalControlEnabled) {
            const playTime = parseInt(playTimeInput.value) || 30; // Valor por defecto: 30 minutos
            const taskDescription = taskDescriptionInput.value.trim() || 'Completar una actividad educativa';
            
            // Guardar configuración en localStorage
            localStorage.setItem('parentalControlEnabled', 'true');
            localStorage.setItem('playTimeLimit', playTime.toString());
            localStorage.setItem('taskDescription', taskDescription);
            
            // Configurar tiempo inicial (en milisegundos)
            const currentTime = new Date().getTime();
            const endTime = currentTime + (playTime * 60 * 1000);
            localStorage.setItem('playTimeEnd', endTime.toString());
            console.log(`Control parental activado: ${playTime} minutos, hasta ${new Date(endTime).toLocaleTimeString()}`);
            
            // Guardar la edad del niño para las actividades adaptativas
            localStorage.setItem('childAge', childAge || '8');
        } else {
            // Desactivar control parental
            localStorage.removeItem('parentalControlEnabled');
            localStorage.removeItem('playTimeLimit');
            localStorage.removeItem('taskDescription');
            localStorage.removeItem('playTimeEnd');
            console.log('Control parental desactivado');
        }
        
        // Iniciar sesión exitoso - Animación de transición
        loginButton.innerHTML = '¡Aquí vamos! 🚀';
        loginButton.style.backgroundColor = 'var(--success-color)';
        
        // Iniciar sesión correctamente y pasar el personaje como parámetro
        setTimeout(function() {
            window.location.href = `juego_nuevo.html?character=${character}`;
        }, 1000);
    }
    
    // Función para manejar errores de inicio de sesión
    function handleLoginError(errorText) {
        // Restablecer botón
        loginButton.innerHTML = '¡Comenzar Aventura!';
        loginButton.disabled = false;
        
        // Mostrar error
        errorMessage.textContent = errorText;
        errorMessage.style.display = 'block';
        
        // Animar el mensaje de error
        errorMessage.classList.add('shake');
        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 500);
        
        // Agitar los campos
        const inputs = [usernameInput, passwordInput];
        inputs.forEach(input => {
            input.style.borderColor = 'var(--accent-color)';
            input.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        });
    }
    
    // Para fines de demostración, colocar sugerencias sutiles
    const hintElement = document.createElement('div');
    hintElement.style.position = 'fixed';
    hintElement.style.bottom = '10px';
    hintElement.style.right = '10px';
    hintElement.style.fontSize = '10px';
    hintElement.style.color = 'rgba(92, 74, 56, 0.5)';
    hintElement.innerHTML = 'Pista: admin / admin';
    document.body.appendChild(hintElement);
});
