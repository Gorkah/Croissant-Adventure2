import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function writeUserData(username, email, age, password) {
  const db = getDatabase(app);
  const reference = ref(db, 'users/' + username);
  set(reference, {
    username: username,
    email: email,
    age: age,
    password: password,
    coins: 0,
    minigamesPlayed: 0
  })
  .then(() => {
    alert("Usuario guardado en Firebase");
  })
  .catch((error) => {
    console.error("Error guardando usuario en Firebase:", error);
    alert("Error guardando usuario en Firebase: " + error.message);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const registerButton = document.getElementById('register-button');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const ageInput = document.getElementById('age');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error-message');

  ageInput.addEventListener('input', () => {
    const age = parseInt(ageInput.value);
    if (age >= 10) {
      passwordInput.disabled = false;
      errorMessage.style.display = 'none';
    } else {
      passwordInput.disabled = true;
      errorMessage.textContent = '¡Oh no! Solo un adulto puede escribir la contraseña mágica.';
      errorMessage.style.display = 'block';
    }
  });

  registerButton.addEventListener('click', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const age = parseInt(ageInput.value);
    const password = passwordInput.value.trim();

    if (!username || !email || isNaN(age) || !password) {
      errorMessage.textContent = 'Por favor, completa todos los campos.';
      errorMessage.style.display = 'block';
      return;
    }

    if (age < 10) {
      alert('¡Oh no! Necesitas la ayuda de un adulto para registrarte.');
      return;
    }

    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    if (userData[username]) {
      alert('El usuario ya existe.');
      return;
    }

    userData[username] = { email, age, password, coins: 0, minigamesPlayed: 0 };
    localStorage.setItem('userData', JSON.stringify(userData));
  
    writeUserData(username, email, age, password);

    alert('¡Registro exitoso! Bienvenido a Croissant Adventure.');
    window.location.href = 'login.html';
  });
});
