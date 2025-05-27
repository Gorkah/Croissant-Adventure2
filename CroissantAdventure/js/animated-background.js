document.addEventListener('DOMContentLoaded', function() {
  // Eliminamos cualquier contenedor existente para evitar duplicados
  const existingBackground = document.querySelector('.background-animation');
  if (existingBackground) {
    existingBackground.remove();
  }
  
  // Crear nuevo contenedor para la animación
  const backgroundAnimation = document.createElement('div');
  backgroundAnimation.classList.add('background-animation');
  backgroundAnimation.style.position = 'fixed';
  backgroundAnimation.style.top = '0';
  backgroundAnimation.style.left = '0';
  backgroundAnimation.style.width = '100%';
  backgroundAnimation.style.height = '100%';
  backgroundAnimation.style.pointerEvents = 'none';
  backgroundAnimation.style.zIndex = '-1';
  backgroundAnimation.style.overflow = 'hidden';
  
  // Insertarlo como primer hijo del body para evitar problemas de layout
  if (document.body.firstChild) {
    document.body.insertBefore(backgroundAnimation, document.body.firstChild);
  } else {
    document.body.appendChild(backgroundAnimation);
  }
  
  // Lista de personajes para la animación
  const characters = [
    { image: 'croiso.png', name: 'Croiso' },
    { image: 'croisa.png', name: 'Croisa' },
    { image: 'trash.png', name: 'Trash' },
    { image: 'croisa_desde_arriba.png', name: 'Croisa' },
    { image: 'croisa_outfit1.png', name: 'Croisa' },
    { image: 'croisa_outfit2.png', name: 'Croisa' },
    { image: 'croisa_outfit3.png', name: 'Croisa' },
    { image: 'croisa_outfit4.png', name: 'Croisa' },
    { image: 'croiso_enfadado.png', name: 'Croiso' },
    { image: 'croiso_outfit1.png', name: 'Croiso' },
    { image: 'croiso_outfit2.png', name: 'Croiso' },
    { image: 'croiso_outfit3.png', name: 'Croiso' },
    { image: 'croiso_outfit4.png', name: 'Croiso' },
    { image: 'croiso_outfit5.png', name: 'Croiso' },
    { image: 'croiso_outfit6.png', name: 'Croiso' },
  ];
  
  // Crear 15 personajes iniciales usando toda la variedad disponible
  for (let i = 0; i < 25; i++) {
    createMovingCharacter(backgroundAnimation, characters[i % characters.length]);
  }
  
  // Crear un nuevo personaje cada 3 segundos, alternando entre todos los tipos
  let charIndex = 0;
  setInterval(() => {
    if (document.querySelectorAll('.moving-character').length < 50) {
      createMovingCharacter(backgroundAnimation, characters[charIndex]);
      charIndex = (charIndex + 1) % characters.length;
    }
  }, 1500);
});

function createMovingCharacter(container, character) {
  const element = document.createElement('div');
  element.classList.add('moving-character');
  
  // Asignar estilo base
  element.style.position = 'absolute';
  element.style.backgroundImage = `url('${character.image}')`;
  element.style.backgroundSize = 'contain';
  element.style.backgroundRepeat = 'no-repeat';
  element.style.backgroundPosition = 'center';
  element.style.opacity = '0';
  element.style.transition = 'opacity 0.5s ease';
  
  // Random size entre 30px y 80px
  const size = Math.random() * 40 + 30; // Tamaño ligeramente más pequeño
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  
  // Random posición horizontal
  element.style.left = `${Math.random() * 100}%`;
  
  // Random duración entre 15 y 30 segundos
  const duration = Math.random() * 15 + 15;
  
  // Asignar animación
  element.style.animation = `float-character ${duration}s linear infinite`;
  element.style.animationDelay = `${Math.random() * 5}s`;
  
  // Añadir al contenedor con un pequeño retraso para la animación de aparecer
  container.appendChild(element);
  
  // Hacer visible gradualmente
  setTimeout(() => {
    element.style.opacity = '0.6';
  }, 100);
  
  // Eliminar cuando la animación termina para evitar fugas de memoria
  setTimeout(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }, (duration + 5) * 1000);
}

// Añadir las reglas CSS necesarias
function addStyles() {
  // Eliminar estilos anteriores si existen
  const oldStyle = document.getElementById('animated-background-styles');
  if (oldStyle) {
    oldStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = 'animated-background-styles';
  style.innerHTML = `
    .background-animation {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    }
    
    .moving-character {
      position: absolute;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    
    @keyframes float-character {
      0% {
        transform: translateY(100vh) rotate(0deg);
      }
      100% {
        transform: translateY(-150px) rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}

// Asegurar que las reglas CSS existen
addStyles();
