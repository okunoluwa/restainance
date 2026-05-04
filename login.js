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

// Password visibility toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    }
}

// Role field toggle (if needed)
function toggleFields() {
    // Your existing role toggle logic
}

// Make functions global
window.togglePassword = togglePassword;
window.toggleFields = toggleFields;

// Login form submission
document.addEventListener("DOMContentLoaded", function() {
    initDarkMode();
    
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();

            const email = document.querySelector("input[type='email']").value;
            const password = document.getElementById("password").value;
            const roleSelect = document.getElementById("role");
            const role = roleSelect ? roleSelect.value : "student";

            const storedUser = JSON.parse(localStorage.getItem("user"));

            if (!storedUser) {
                alert(" No account found. Please register first.");
                return;
            }

            if (email === storedUser.email && password === storedUser.password) {
                alert(" Login successful!");
                
                // Store user role for chat and other features
                localStorage.setItem('userRole', storedUser.role);
                localStorage.setItem('userEmail', email);

                if (storedUser.role === "student") {
                    window.location.href = "student-dashboard.html";
                } else if (storedUser.role === "staff") {
                    window.location.href = "staff-dashboard.html";
                } else {
                    window.location.href = "admin-dashboard.html";
                }
            } else {
                alert("Invalid email or password!");
            }
        });
    }
});
