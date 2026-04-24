// register.js - Fully standalone, no conflicts

// Dark mode toggle
function initDarkMode() {
    // Only add if not already present
    if (document.querySelector('.dark-mode-toggle')) return;
    
    const btn = document.createElement('button');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    btn.innerHTML = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    btn.className = 'dark-mode-toggle';
    btn.style.cssText = 'position:fixed; top:20px; right:20px; background:rgba(255,255,255,0.9); color:#333; border:none; border-radius:50px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; z-index:200; box-shadow:0 2px 10px rgba(0,0,0,0.1);';
    
    btn.onclick = function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        btn.innerHTML = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        // Update button style for dark mode
        if (isDark) {
            btn.style.background = '#1e1e2e';
            btn.style.color = '#eee';
        } else {
            btn.style.background = 'rgba(255,255,255,0.9)';
            btn.style.color = '#333';
        }
    };
    
    // Apply dark mode if previously enabled
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        btn.style.background = '#1e1e2e';
        btn.style.color = '#eee';
    } else {
        btn.style.background = 'rgba(255,255,255,0.9)';
        btn.style.color = '#333';
    }
    
    document.body.appendChild(btn);
}

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initDarkMode();
    
    // Get the form element
    const form = document.querySelector('form');
    if (!form) {
        console.error('Registration form not found!');
        alert('Form not found. Please check your HTML.');
        return;
    }
    
    // Get all input fields by their IDs
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const residenceInput = document.getElementById('residence');
    const roomInput = document.getElementById('room');
    const studentNumberInput = document.getElementById('studentNumber');
    
    // Validate required fields exist
    if (!fullnameInput || !emailInput || !passwordInput || !roleSelect || !studentNumberInput) {
        console.error('Missing required form fields. Check IDs: fullname, email, password, role, studentNumber');
        alert('Form is missing required fields. Please check the HTML.');
        return;
    }
    
    // Add submit event listener
    form.addEventListener('submit', function(event) {
        event.preventDefault();  // Stop page refresh
        
        // Get values
        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const role = roleSelect.value;
        const residence = residenceInput ? residenceInput.value.trim() : '';
        const room = roomInput ? roomInput.value.trim() : '';
        const studentNumber = studentNumberInput.value.trim();
        
        // Validation
        if (!fullname) {
            alert('Please enter your full name.');
            fullnameInput.focus();
            return;
        }
        
        if (!email) {
            alert('Please enter your email.');
            emailInput.focus();
            return;
        }
        
        // Basic email validation
        if (!email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address (e.g., name@example.com).');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            alert('Please enter a password.');
            passwordInput.focus();
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            passwordInput.focus();
            return;
        }
        
        if (!studentNumber) {
            alert('Please enter your student number.');
            studentNumberInput.focus();
            return;
        }
        
        // Create user object
        const user = {
            fullname: fullname,
            email: email,
            password: password,
            role: role,
            residence: residence,
            room: room,
            studentNumber: studentNumber,
            registeredDate: new Date().toLocaleString()
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Also store student number for later use (consistency with other pages)
        localStorage.setItem('studentNumber', studentNumber);
        localStorage.setItem('currentStudentNumber', studentNumber);
        localStorage.setItem('reportStudentNumber', studentNumber);
        
        alert('Registration successful!');
        
        // Redirect based on role
        if (role === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (role === 'staff') {
            window.location.href = 'staff-dashboard.html';
        } else {
            window.location.href = 'admin-dashboard.html';
        }
    });
    
    console.log('Registration form ready.');
});