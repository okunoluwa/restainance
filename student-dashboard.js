let currentStudentNumber = null;
let currentStudentName = null;

// ========== DARK MODE FUNCTION (SIDEBAR BUTTON) ==========
function initDarkMode() {
    const darkModeBtn = document.getElementById('darkModeSidebarBtn');
    if (!darkModeBtn) return;
    
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
    
    darkModeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        darkModeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
    });
}

function getRequests() {
    return JSON.parse(localStorage.getItem("requests")) || [];
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getCurrentUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            return user;
        } catch(e) {
            return null;
        }
    }
    return null;
}

function getCurrentStudent() {
    const user = getCurrentUser();
    
    if (user && user.role === 'student') {
        if (user.studentNumber) {
            currentStudentNumber = user.studentNumber;
        }
        if (user.fullname) {
            currentStudentName = user.fullname;
        }
        localStorage.setItem('studentNumber', currentStudentNumber);
        localStorage.setItem('studentName', currentStudentName);
        return currentStudentNumber;
    }
    
    let studentNumber = localStorage.getItem('studentNumber');
    if (!studentNumber) {
        studentNumber = prompt('Enter your student number:');
        if (studentNumber) {
            studentNumber = studentNumber.trim();
            localStorage.setItem('studentNumber', studentNumber);
        }
    }
    
    const storedName = localStorage.getItem('studentName');
    if (storedName) {
        currentStudentName = storedName;
    } else if (user && user.fullname) {
        currentStudentName = user.fullname;
        localStorage.setItem('studentName', currentStudentName);
    } else {
        currentStudentName = currentStudentNumber;
    }
    
    return studentNumber;
}

function filterRequests() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.request-card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

function addSearchBar() {
    const main = document.querySelector('.main');
    if (!main) return;
    const topBar = document.querySelector('.top-bar');
    if (!topBar || document.getElementById('searchInput')) return;
    
    const searchDiv = document.createElement('div');
    searchDiv.style.margin = '15px 0';
    searchDiv.innerHTML = '<input type="text" id="searchInput" placeholder="🔍 Search your requests..." style="width:100%; padding:12px; border-radius:30px; border:1px solid #ddd; font-size:16px;">';
    topBar.insertAdjacentElement('afterend', searchDiv);
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('keyup', filterRequests);
}

function exportToPDF() {
    const requests = getRequests();
    const myRequests = requests.filter(req => req.studentNumber === currentStudentNumber);
    
    let html = `<html><head><title>My Requests</title></head><body>
        <h1>My Maintenance Requests</h1>
        <p>Student Name: ${escapeHtml(currentStudentName || currentStudentNumber)}</p>
        <p>Student Number: ${escapeHtml(currentStudentNumber)}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table border="1" cellpadding="5">
            <tr><th>Title</th><th>Room</th><th>Status</th><th>Date</th></tr>
            ${myRequests.map(r => `<tr><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.room)}</td><td>${r.status}</td><td>${r.date}</td></tr>`).join('')}
        </table></body></html>`;
    
    const blob = new Blob([html], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `my-requests-${currentStudentNumber}.pdf`;
    link.click();
    alert('PDF exported!');
}

function addExportButtonAtBottom() {
    const requestsSection = document.querySelector('.requests');
    if (!requestsSection) return;
    
    const existingBtn = document.querySelector('.export-btn-bottom');
    if (existingBtn) existingBtn.remove();
    
    // Check if there are requests before adding button
    const requests = getRequests();
    const myRequests = requests.filter(req => req.studentNumber === currentStudentNumber);
    
    if (myRequests.length === 0) return;
    
    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export PDF';
    exportBtn.className = 'export-btn-bottom';
    exportBtn.style.cssText = 'background:#4caf50; color:white; border:none; border-radius:30px; padding:12px 20px; margin-top:20px; width:100%; cursor:pointer; font-weight:600;';
    exportBtn.onclick = exportToPDF;
    
    requestsSection.appendChild(exportBtn);
}

function updateStats(requests) {
    const myRequests = requests.filter(req => req.studentNumber === currentStudentNumber);
    const totalEl = document.querySelector('.card:first-child p');
    const pendingEl = document.querySelector('.card:nth-child(2) p');
    const completedEl = document.querySelector('.card:nth-child(3) p');
    if (totalEl) totalEl.innerHTML = myRequests.length;
    if (pendingEl) pendingEl.innerHTML = myRequests.filter(r => r.status === 'pending').length;
    if (completedEl) completedEl.innerHTML = myRequests.filter(r => r.status === 'completed').length;
}

function loadRecentRequests() {
    const requests = getRequests();
    const myRequests = requests.filter(req => req.studentNumber === currentStudentNumber);
    const recentRequests = [...myRequests].reverse().slice(0, 5);
    
    const requestsSection = document.querySelector('.requests');
    if (!requestsSection) return;
    
    const oldCards = requestsSection.querySelectorAll('.request-card:not(.no-requests-card)');
    oldCards.forEach(card => card.remove());
    
    const oldExportBtn = document.querySelector('.export-btn-bottom');
    if (oldExportBtn) oldExportBtn.remove();
    
    if (recentRequests.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'request-card no-requests-card';
        emptyDiv.style.textAlign = 'center';
        emptyDiv.innerHTML = '<i class="fas fa-inbox"></i> No requests yet. <a href="report.html">Report an issue</a>';
        requestsSection.appendChild(emptyDiv);
    } else {
        recentRequests.forEach(request => {
            const priorityColor = request.priority === 'High' ? '#dc3545' : (request.priority === 'Low' ? '#4caf50' : '#ff9800');
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <h3><i class="fas fa-wrench"></i> ${escapeHtml(request.title)} ${request.priority ? `<span style="background:${priorityColor}; color:white; padding:2px 10px; border-radius:20px; font-size:10px;">${request.priority}</span>` : ''}</h3>
                <p><i class="fas fa-door-open"></i> Room: ${escapeHtml(request.room)}</p>
                <p><i class="fas fa-tag"></i> Category: ${escapeHtml(request.category) || 'General'}</p>
                <p><i class="fas fa-calendar-alt"></i> Submitted: ${request.date}</p>
                <span class="status ${request.status}">${request.status.toUpperCase()}</span>
                <div style="margin-top:10px"><button onclick="location.href='my-requests.html'" style="background:#af954c; color:white; border:none; border-radius:30px; padding:10px 15px; cursor:pointer;"><i class="fas fa-eye"></i> View Details</button></div>
            `;
            requestsSection.appendChild(card);
        });
    }
    
    addExportButtonAtBottom();
    updateStats(requests);
}

function goToReport() {
    window.location.href = 'report.html';
}

window.goToReport = goToReport;

document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    
    const user = getCurrentUser();
    
    currentStudentNumber = getCurrentStudent();
    
    if (!currentStudentNumber) {
        const main = document.querySelector('.main');
        if (main) {
            main.innerHTML = '<h1>Access Denied</h1><p>Student number required.</p><a href="login.html" class="btn-primary">Login</a>';
        }
        return;
    }
    
    const welcomeHeader = document.querySelector('.top-bar h1');
    if (welcomeHeader) {
        const displayName = currentStudentName || (user && user.fullname) || currentStudentNumber;
        welcomeHeader.innerHTML = `<i class="fas fa-user-graduate"></i> Welcome ${escapeHtml(displayName)}`;
    }
    
    addSearchBar();
    loadRecentRequests();
    setInterval(loadRecentRequests, 10000);
});