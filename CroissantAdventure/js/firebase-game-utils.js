/**
 * Utilidades de Firebase para el juego Croissant Adventure
 * Maneja la sincronización de datos entre el juego y Firebase
 */

// Configuración de Firebase (mantener igual que en login.js y register.js)
const firebaseGameConfig = {
  apiKey: "AIzaSyD8JQ2a7CcR2nmyGLwLc1DM9inHB5HDd1w",
  authDomain: "croissant-adventures2.firebaseapp.com",
  databaseURL: "https://croissant-adventures2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "croissant-adventures2",
  storageBucket: "croissant-adventures2.firebasestorage.app",
  messagingSenderId: "1080436575270",
  appId: "1:1080436575270:web:30cbfed22929b24f80aae7",
  measurementId: "G-HSRQ1R6M2F"
};

// Variables globales
let firebaseGameApp;
let firebaseGameDb;
let firebaseGameAuth;
let firebaseCurrentUser = null;
let firebaseUsername = null;

// Inicializar Firebase si no se ha hecho antes
function initializeFirebaseGame() {
  try {
    // Comprobar si Firebase ya está inicializado por login.js o register.js
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
      console.log("Usando instancia existente de Firebase");
      firebaseGameApp = firebase.apps[0];
    } else {
      console.log("Inicializando nueva instancia de Firebase para el juego");
      firebaseGameApp = firebase.initializeApp(firebaseGameConfig);
    }
    
    // Obtener referencias a servicios
    firebaseGameDb = firebase.database();
    firebaseGameAuth = firebase.auth();
    
    // Intentar obtener el nombre de usuario desde localStorage
    firebaseUsername = localStorage.getItem('playerName');
    
    console.log("Firebase inicializado correctamente para el juego");
    return true;
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    return false;
  }
}

/**
 * Verifica si el usuario está autenticado y configura los listeners
 * @returns {Promise<Object>} Información del usuario actual
 */
function initializeFirebaseAuth() {
  return new Promise((resolve) => {
    // Si no hay Firebase inicializado, resolver con null
    if (!firebaseGameAuth) {
      resolve(null);
      return;
    }
    
    firebaseGameAuth.onAuthStateChanged((user) => {
      firebaseCurrentUser = user;
      console.log("Estado de autenticación cambiado:", user ? "Usuario autenticado" : "No autenticado");
      resolve(user);
    });
  });
}

/**
 * Guarda los datos del jugador en Firebase
 * @param {Object} gameData - Datos del juego a guardar
 * @returns {Promise<boolean>} - true si se guardó correctamente
 */
function savePlayerData(gameData) {
  return new Promise((resolve) => {
    if (!firebaseGameDb || !firebaseUsername) {
      console.warn("No se puede guardar en Firebase: falta la base de datos o el nombre de usuario");
      resolve(false);
      return;
    }
    
    try {
      const timestamp = new Date().toISOString();
      const userRef = firebaseGameDb.ref(`users/${firebaseUsername}`);
      
      // Datos a guardar
      const updateData = {
        lastUpdate: timestamp,
        score: gameData.playerScore,
        coins: gameData.playerCoins,
        achievements: gameData.achievements,
        parentalControl: {
          timeTracking: gameData.parentalControl.timeTracking,
          minigamesPlayed: gameData.parentalControl.minigamesPlayed
        }
      };
      
      // Actualizar en Firebase
      userRef.update(updateData, (error) => {
        if (error) {
          console.error("Error al guardar datos del jugador en Firebase:", error);
          resolve(false);
        } else {
          console.log("Datos del jugador guardados en Firebase:", updateData);
          resolve(true);
        }
      });
    } catch (error) {
      console.error("Error al guardar datos del jugador en Firebase:", error);
      resolve(false);
    }
  });
}

/**
 * Carga los datos del jugador desde Firebase
 * @returns {Promise<Object|null>} - Datos del jugador o null si no se pudo cargar
 */
function loadPlayerData() {
  return new Promise((resolve) => {
    if (!firebaseGameDb || !firebaseUsername) {
      console.warn("No se puede cargar desde Firebase: falta la base de datos o el nombre de usuario");
      resolve(null);
      return;
    }
    
    try {
      const userRef = firebaseGameDb.ref(`users/${firebaseUsername}`);
      userRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("Datos del jugador cargados desde Firebase:", userData);
          resolve({
            playerScore: userData.score || 0,
            playerCoins: userData.coins || 0,
            achievements: userData.achievements || {
              minigamesPlayed: 0,
              coinsCollected: 0,
              chessMoves: 0,
              mazeCompleted: false,
              shooterHighscore: 0
            },
            parentalControl: userData.parentalControl || {
              timeTracking: {
                totalPlayTime: 0,
                sessionsPlayed: 0,
                dailyLimitMinutes: 60
              },
              minigamesPlayed: {}
            }
          });
        } else {
          console.log("No existen datos para este usuario en Firebase");
          resolve(null);
        }
      }, (error) => {
        console.error("Error al cargar datos del jugador desde Firebase:", error);
        resolve(null);
      });
    } catch (error) {
      console.error("Error al cargar datos del jugador desde Firebase:", error);
      resolve(null);
    }
  });
}

/**
 * Actualiza la puntuación del jugador en Firebase
 * @param {number} score - Nueva puntuación
 * @param {string} source - Fuente de los puntos (minijuego, etc.)
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
function updatePlayerScore(score, source = "game") {
  return new Promise((resolve) => {
    if (!firebaseGameDb || !firebaseUsername) {
      console.warn("No se puede actualizar puntuación en Firebase: falta la base de datos o el nombre de usuario");
      resolve(false);
      return;
    }
    
    try {
      const userRef = firebaseGameDb.ref(`users/${firebaseUsername}`);
      const timestamp = new Date().toISOString();
      
      // Datos a actualizar
      const updateData = {
        score: score,
        lastScoreUpdate: timestamp,
        lastScoreSource: source
      };
      
      // Actualizar en Firebase
      userRef.update(updateData, (error) => {
        if (error) {
          console.error("Error al actualizar puntuación en Firebase:", error);
          resolve(false);
        } else {
          console.log(`Puntuación actualizada en Firebase: ${score} (fuente: ${source})`);
          resolve(true);
        }
      });
    } catch (error) {
      console.error("Error al actualizar puntuación en Firebase:", error);
      resolve(false);
    }
  });
}

/**
 * Registra un logro o actividad del jugador
 * @param {string} achievementType - Tipo de logro (minigame, coin, etc.)
 * @param {any} value - Valor del logro (número, boolean, etc.)
 * @returns {Promise<boolean>} - true si se registró correctamente
 */
function logPlayerAchievement(achievementType, value) {
  return new Promise((resolve) => {
    if (!firebaseGameDb || !firebaseUsername) {
      console.warn("No se puede registrar logro en Firebase: falta la base de datos o el nombre de usuario");
      resolve(false);
      return;
    }
    
    try {
      const userRef = firebaseGameDb.ref(`users/${firebaseUsername}/achievements/${achievementType}`);
      userRef.set(value, (error) => {
        if (error) {
          console.error("Error al registrar logro en Firebase:", error);
          resolve(false);
        } else {
          console.log(`Logro registrado en Firebase: ${achievementType} = ${value}`);
          resolve(true);
        }
      });
    } catch (error) {
      console.error("Error al registrar logro en Firebase:", error);
      resolve(false);
    }
  });
}

/**
 * Configura el nombre de usuario para las operaciones de Firebase
 * @param {string} newUsername - Nombre de usuario
 */
function setUsername(newUsername) {
  if (newUsername) {
    firebaseUsername = newUsername;
    console.log("Nombre de usuario configurado para Firebase:", firebaseUsername);
    return true;
  }
  return false;
}

// Exponer las funciones al objeto window para que estén disponibles globalmente
window.firebaseGameUtils = {
  initializeFirebaseGame,
  initializeFirebaseAuth,
  savePlayerData,
  loadPlayerData,
  updatePlayerScore,
  logPlayerAchievement,
  setUsername
};
