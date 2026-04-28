// register.js - Only STUDENTS need Student Number, Residence, and Room Number
// Staff and Admin can register without those fields

// Dark mode toggle
function initDarkMode() {
    // Only add if not already present
    if (document.querySelector('.dark-mode-toggle')) return;
    
    const btn = document.createElement('button');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    btn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
    btn.className = 'dark-mode-toggle';
    btn.style.cssText = 'position:fixed; top:20px; right:20px; background:rgba(255,255,255,0.9); color:#333; border:none; border-radius:50px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; z-index:200; box-shadow:0 2px 10px rgba(0,0,0,0.1);';
    
    btn.onclick = function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
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
        alert('>Form not found. Please check your HTML.');
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
    if (!fullnameInput || !emailInput || !passwordInput || !roleSelect) {
        console.error('Missing required form fields. Check IDs: fullname, email, password, role');
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
        const studentNumber = studentNumberInput ? studentNumberInput.value.trim() : '';
        
        // ========== VALIDATION ==========
        
        // 1. Full Name validation (ALL roles)
        if (!fullname) {
            alert('Please enter your full name.');
            fullnameInput.focus();
            return;
        }
        
        // 2. Email validation (ALL roles)
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
        
        // 3. Password validation (ALL roles)
        if (!password) {
            alert(' Please enter a password.');
            passwordInput.focus();
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            passwordInput.focus();
            return;
        }
        
        // 4. STUDENT-SPECIFIC VALIDATIONS (Student Number, Residence, Room)
        // These are ONLY required if role is 'student'
        if (role === 'student') {
            // Student Number is required for students only
            if (!studentNumber) {
                alert('Student Number is required for student registration.');
                if (studentNumberInput) studentNumberInput.focus();
                return;
            }
            
            // Residence is required for students only
            if (!residence) {
                alert('Residence is required for student registration. Please enter your residence.');
                if (residenceInput) residenceInput.focus();
                return;
            }
            
            // Room number is required for students only
            if (!room) {
                alert('Room number is required for student registration. Please enter your room number.');
                if (roomInput) roomInput.focus();
                return;
            }
        }
        
        // Staff and Admin do NOT need Student Number, Residence, or Room validation
        // They can leave those fields empty
        
        // ========== CREATE USER OBJECT ==========
        const user = {
            fullname: fullname,
            email: email,
            password: password,
            role: role,
            residence: (role === 'student') ? residence : '',
            room: (role === 'student') ? room : '',
            studentNumber: (role === 'student') ? studentNumber : '',
            registeredDate: new Date().toLocaleString()
        };
        
        // ========== SAVE TO LOCALSTORAGE ==========
        localStorage.setItem('user', JSON.stringify(user));
        
        // Only store student number in separate fields if user is a student
        if (role === 'student') {
            localStorage.setItem('studentNumber', studentNumber);
            localStorage.setItem('currentStudentNumber', studentNumber);
            localStorage.setItem('reportStudentNumber', studentNumber);
        } else {
            // Clear any existing student number data for staff/admin
            localStorage.removeItem('studentNumber');
            localStorage.removeItem('currentStudentNumber');
            localStorage.removeItem('reportStudentNumber');
        }
        
        // Store role for quick access
        localStorage.setItem('userRole', role);
        
        // ========== SUCCESS & REDIRECT ==========
        alert('Registration successful!');
        
        // Redirect based on role
        if (role === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (role === 'staff') {
            window.location.href = 'staff-dashboard.html';
        } else if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
    });
    
    console.log('Registration form ready. Only students need Student Number, Residence, and Room Number.');
});
