import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD8JQ2a7CcR2nmyGLwLc1DM9inHB5HDd1w",
  authDomain: "croissant-adventures2.firebaseapp.com",
  databaseURL: "https://croissant-adventures2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "croissant-adventures2",
  storageBucket: "croissant-adventures2.firebasestorage.app",
  messagingSenderId: "1080436575270",
  appId: "1:1080436575270:web:cf2f99424d2e225780aae7",
  measurementId: "G-80WL2TF08X"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error-message');

  loginButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      errorMessage.textContent = 'Por favor, completa todos los campos.';
      errorMessage.style.display = 'block';
      return;
    }
      // --- Casos especiales: admin y manage ---
    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('playerName', username);
        window.location.href = `juego_nuevo.html?character=croiso`;
        return;
    }
    if (username === 'manage' && password === 'manage') {
        window.location.href = 'manage.html';
        return;
    }

    // Leer usuario desde Firebase
    try {
      const snapshot = await get(child(ref(db), `users/${username}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password === password) {
          // Login exitoso
          localStorage.setItem('playerName', username);
          // Puedes guardar más info si quieres
          window.location.href = `juego_nuevo.html?character=croiso`; // Cambia character si tienes selección
        } else {
          errorMessage.textContent = 'Contraseña incorrecta.';
          errorMessage.style.display = 'block';
        }
      } else {
        errorMessage.textContent = 'Usuario no encontrado.';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      errorMessage.textContent = 'Error al conectar con la base de datos.';
      errorMessage.style.display = 'block';
      console.error(error);
    }
  });
});
