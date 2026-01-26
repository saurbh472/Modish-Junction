// Sale Page JavaScript

// Sale Timer Countdown
function startSaleTimer() {
    // Set end date to 3 days from now
    const now = new Date();
    const endDate = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days in milliseconds
    
    function updateTimer() {
        const currentTime = new Date().getTime();
        const distance = endDate.getTime() - currentTime;
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update DOM elements
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        
        // Check if sale ended
        if (distance < 0) {
            clearInterval(timerInterval);
            const timerEl = document.querySelector('.sale-timer');
            if (timerEl) {
                timerEl.innerHTML = '<h2 style="color: white; margin: 0;">Sale Ended!</h2>';
            }
        }
    }
    
    // Initial call
    updateTimer();
    
    // Update every second
    const timerInterval = setInterval(updateTimer, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSaleTimer);
} else {
    // DOM is already ready
    startSaleTimer();
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 5px 30px rgba(0,0,0,0.2)';
        } else {
            header.style.boxShadow = '0 4px 30px rgba(212, 89, 59, 0.15)';
        }
    }
});

// Debug: Log when timer starts
console.log('Sale timer initialized');