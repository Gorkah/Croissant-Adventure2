document.addEventListener('DOMContentLoaded', function() {
    const backgroundAnimation = document.querySelector('.background-animation');
    
    // Create 15 moving croissants
    for (let i = 0; i < 15; i++) {
        createMovingCroissant(backgroundAnimation);
    }
    
    // Create a new croissant every 3 seconds
    setInterval(() => {
        if (document.querySelectorAll('.moving-croissant').length < 25) {
            createMovingCroissant(backgroundAnimation);
        }
    }, 3000);
});

function createMovingCroissant(container) {
    const croissant = document.createElement('div');
    croissant.classList.add('moving-croissant');
    
    // Random size between 30px and 80px
    const size = Math.random() * 50 + 30;
    croissant.style.width = `${size}px`;
    croissant.style.height = `${size}px`;
    
    // Random horizontal position
    croissant.style.left = `${Math.random() * 100}%`;
    
    // Random duration between 15 and 30 seconds
    const duration = Math.random() * 15 + 15;
    croissant.style.animationDuration = `${duration}s`;
    
    // Random delay
    croissant.style.animationDelay = `${Math.random() * 5}s`;
    
    // Add to container with a small delay for the appear animation
    croissant.style.opacity = '0';
    container.appendChild(croissant);
    
    setTimeout(() => {
        croissant.style.opacity = '0.1';
    }, 100);
    
    // Remove when animation ends to prevent memory leaks
    setTimeout(() => {
        croissant.remove();
    }, (duration + 5) * 1000);
}
