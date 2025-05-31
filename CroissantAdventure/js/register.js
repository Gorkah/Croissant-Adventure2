import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

async function writeUserData(username, email, age, password) {
  try {
    // Verificar si el username ya existe en la base de datos
    const snapshot = await get(child(ref(db), `users/${username}`));
    if (snapshot.exists()) {
      throw new Error("El nombre de usuario ya existe. Por favor, elige otro.");
    }

    // Registrar usuario en Firebase Authentication (si tiene 13 años o más)
    let authUser = null;
    if (age >= 13) {
      try {
        // Intentar crear una cuenta en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        authUser = userCredential.user;
        console.log("Usuario creado en Firebase Auth:", authUser.uid);
      } catch (authError) {
        console.error("Error al crear cuenta en Firebase Auth:", authError);
        // Si hay un error específico con el email, lo manejamos
        if (authError.code === 'auth/email-already-in-use') {
          throw new Error("Este correo electrónico ya está registrado. Prueba con otro o inicia sesión.");
        }
        // Para otros errores, seguimos con el registro en la base de datos solamente
      }
    }

    // Registrar usuario en la base de datos de Firebase
    const reference = ref(db, 'users/' + username);
    await set(reference, {
      username: username,
      email: email,
      age: age,
      password: password, // En una app real, no guardaríamos la contraseña en la base de datos
      coins: 0,
      minigamesPlayed: 0,
      createdAt: new Date().toISOString(),
      authId: authUser ? authUser.uid : null
    });

    return { success: true, message: "¡Registro exitoso! Bienvenido a Croissant Adventure." };
  } catch (error) {
    console.error("Error en el registro:", error);
    return { success: false, message: error.message };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const registerButton = document.getElementById('register-button');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const ageInput = document.getElementById('age');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error-message');

  // Función para mostrar mensajes de error
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    // Agitar el mensaje de error
    errorMessage.classList.add('shake');
    setTimeout(() => {
      errorMessage.classList.remove('shake');
    }, 500);
  }

  // Función para validar email
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Función para validar contraseña
  function isValidPassword(password) {
    return password.length >= 6;
  }

  // Activar/desactivar contraseña basado en la edad
  ageInput.addEventListener('input', () => {
    const age = parseInt(ageInput.value);
    if (age >= 10) {
      passwordInput.disabled = false;
      errorMessage.style.display = 'none';
    } else {
      passwordInput.disabled = true;
      showError('¡Oh no! Solo un adulto puede escribir la contraseña mágica.');
    }
  });

  // Efecto de animación y validación en tiempo real
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.style.transform = 'scale(1.02)';
      errorMessage.style.display = 'none';
    });
      
    input.addEventListener('blur', function() {
      this.style.transform = 'scale(1)';
      // Validación básica al perder el foco
      if (this.id === 'email' && this.value.trim() !== '' && !isValidEmail(this.value.trim())) {
        this.style.borderColor = 'var(--accent-color)';
        showError('Por favor, introduce un correo electrónico válido.');
      } else if (this.id === 'password' && this.value.trim() !== '' && !isValidPassword(this.value.trim())) {
        this.style.borderColor = 'var(--accent-color)';
        showError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        this.style.borderColor = '';
      }
    });
  });

  registerButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const age = parseInt(ageInput.value);
    const password = passwordInput.value.trim();

    // Validaciones básicas
    if (!username || !email || isNaN(age) || !password) {
      showError('Por favor, completa todos los campos.');
      return;
    }

    if (age < 10) {
      showError('¡Oh no! Necesitas la ayuda de un adulto para registrarte.');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Por favor, introduce un correo electrónico válido.');
      return;
    }

    if (!isValidPassword(password)) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Cambiar estado del botón durante el registro
    registerButton.innerHTML = '<span class="loading">Registrando</span>';
    registerButton.disabled = true;

    // Intentar registrar al usuario en Firebase
    const result = await writeUserData(username, email, age, password);

    if (result.success) {
      // Guardar datos en localStorage para compatibilidad con el sistema actual
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      userData[username] = { email, age, password, coins: 0, minigamesPlayed: 0 };
      localStorage.setItem('userData', JSON.stringify(userData));

      // Mostrar mensaje de éxito
      registerButton.innerHTML = '¡Registro exitoso! 🎉';
      registerButton.style.backgroundColor = 'var(--success-color)';

      // Redirigir a la página de inicio de sesión
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      // Mostrar el error y restaurar el botón
      showError(result.message);
      registerButton.innerHTML = '¡Registrarse!';
      registerButton.disabled = false;
    }
  });
});
