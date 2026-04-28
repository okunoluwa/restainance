// Dark mode toggle
function initDarkMode() {
    if (document.querySelector('.dark-mode-toggle')) return;
    
    const btn = document.createElement('button');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    btn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
    btn.className = 'dark-mode-toggle';
    btn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
    };
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    document.body.appendChild(btn);
}

// Forgot password form submission
document.addEventListener("DOMContentLoaded", function() {
    initDarkMode();
    
    const forgotForm = document.getElementById("forgotForm");
    if (forgotForm) {
        forgotForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const emailInput = document.querySelector("input[type='email']");
            const email = emailInput ? emailInput.value.trim() : "";
            
            if (!email) {
                alert('Please enter your email address.');
                return;
            }
            
            // Store reset email for demo
            localStorage.setItem('resetEmail', email);
            
            alert(`Password reset link sent to ${email}\n(Simulated - Check console for demo)`);
            console.log(`📧 Reset link sent to: ${email}`);
            
            // Redirect to reset password page
            window.location.href = "reset-password.html";
        });
    }
});
