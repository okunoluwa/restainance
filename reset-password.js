// Dark mode toggle
function initDarkMode() {
    if (document.querySelector('.dark-mode-toggle')) return;
    
    const btn = document.createElement('button');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    btn.innerHTML = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    btn.className = 'dark-mode-toggle';
    btn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        btn.innerHTML = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    };
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    document.body.appendChild(btn);
}

// Password visibility toggle
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        if (field.type === "password") {
            field.type = "text";
        } else {
            field.type = "password";
        }
    }
}

// Make function global
window.togglePassword = togglePassword;

// Reset password form submission
document.addEventListener("DOMContentLoaded", function() {
    initDarkMode();
    
    const resetForm = document.getElementById("resetForm");
    if (resetForm) {
        resetForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const newPassword = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (newPassword !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            if (newPassword.length < 6) {
                alert("Password must be at least 6 characters long!");
                return;
            }

            // Get stored user and update password
            const storedUser = JSON.parse(localStorage.getItem("user"));
            
            if (storedUser) {
                storedUser.password = newPassword;
                localStorage.setItem("user", JSON.stringify(storedUser));
                alert("Password reset successful! Please login with your new password.");
            } else {
                alert("Password reset successful! (Demo mode)");
            }

            // Redirect to login page
            window.location.href = "login.html";
        });
    }
});