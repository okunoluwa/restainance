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

// ========== NEW: Export single request to PDF ==========
function exportSingleToPDF(requestId) {
    const requests = getRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
        alert('Request not found!');
        return;
    }
    
    let html = `<html><head><title>Request Details - Restainance</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #af954c; }
        .header h1 { color: #af954c; margin: 0; }
        .header p { color: #666; margin: 5px 0; }
        .details { margin-top: 20px; }
        .detail-row { margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 10px; }
        .detail-row strong { display: inline-block; width: 150px; color: #af954c; }
        .status { display: inline-block; padding: 5px 12px; border-radius: 20px; font-weight: bold; }
        .status-pending { background: #ff9800; color: white; }
        .status-inprogress { background: #2196f3; color: white; }
        .status-completed { background: #4caf50; color: white; }
        .image-box { margin-top: 15px; text-align: center; }
        .image-box img { max-width: 100%; max-height: 300px; border-radius: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
    </head><body>
        <div class="header">
            <h1><i class="fas fa-wrench"></i> Maintenance Request Details</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        <div class="details">
            <div class="detail-row"><strong>Request ID:</strong> ${request.id}</div>
            <div class="detail-row"><strong>Title:</strong> ${escapeHtml(request.title)}</div>
            <div class="detail-row"><strong>Category:</strong> ${escapeHtml(request.category) || 'General'}</div>
            <div class="detail-row"><strong>Room:</strong> ${escapeHtml(request.room)}</div>
            <div class="detail-row"><strong>Student Number:</strong> ${escapeHtml(request.studentNumber)}</div>
            <div class="detail-row"><strong>Student Name:</strong> ${escapeHtml(request.studentName || currentStudentName || request.studentNumber)}</div>
            <div class="detail-row"><strong>Priority:</strong> ${request.priority || 'Medium'}</div>
            <div class="detail-row"><strong>Status:</strong> <span class="status status-${request.status}">${request.status.toUpperCase()}</span></div>
            <div class="detail-row"><strong>Submitted:</strong> ${request.date}</div>
            <div class="detail-row"><strong>Description:</strong><br>${escapeHtml(request.description)}</div>
        </div>
        ${request.image && request.image.length > 0 ? `
        <div class="image-box">
            <strong>Attached Image:</strong><br>
            <img src="${request.image}" alt="Request Image">
        </div>
        ` : ''}
        <div class="footer">
            <p>Restainance - Student Residence Maintenance App</p>
        </div>
    </body></html>`;
    
    const blob = new Blob([html], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `request-${request.id}.pdf`;
    link.click();
    alert('PDF exported for this request!');
}

// ========== Export all requests to PDF ==========
function exportToPDF() {
    const requests = getRequests();
    const myRequests = requests.filter(req => req.studentNumber === currentStudentNumber);
    
    if (myRequests.length === 0) {
        alert('No requests to export!');
        return;
    }
    
    let html = `<html><head><title>My Requests</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #af954c; }
        .header h1 { color: #af954c; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
    </style>
    </head><body>
        <div class="header">
            <h1>My Maintenance Requests</h1>
            <p>Student: ${escapeHtml(currentStudentName || currentStudentNumber)}</p>
            <p>Student Number: ${escapeHtml(currentStudentNumber)}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table border="1" cellpadding="5">
            <tr><th>Title</th><th>Room</th><th>Status</th><th>Date</th></tr>
            ${myRequests.map(r => `<tr><td style="border:1px solid #ddd; padding:8px">${escapeHtml(r.title)}</td><td style="border:1px solid #ddd; padding:8px">${escapeHtml(r.room)}</td><td style="border:1px solid #ddd; padding:8px">${r.status}</td><td style="border:1px solid #ddd; padding:8px">${r.date}</td>`).join('')}
        </table>
        <div class="footer">Restainance - Student Residence Maintenance App</div>
    </body></html>`;
    
    const blob = new Blob([html], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `my-requests-${currentStudentNumber}.pdf`;
    link.click();
    alert('All requests exported to PDF!');
}

function updateStats(requests) {
    const myRequests = requests.filter(req => req.studentNumber === currentStudentNumber);
    const totalEl = document.getElementById('totalCount');
    const pendingEl = document.getElementById('pendingCount');
    const completedEl = document.getElementById('completedCount');
    
    if (totalEl) totalEl.innerHTML = myRequests.length;
    if (pendingEl) pendingEl.innerHTML = myRequests.filter(r => r.status === 'pending').length;
    if (completedEl) completedEl.innerHTML = myRequests.filter(r => r.status === 'completed').length;
}

// ========== VIEW DETAILS MODAL FUNCTION (with Export PDF button inside) ==========
function showRequestDetails(requestId) {
    const requests = getRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
        alert('Request not found!');
        return;
    }
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const statusColor = request.status === 'completed' ? '#4caf50' : (request.status === 'inprogress' ? '#2196f3' : '#ff9800');
    
    let statusIcon = '<i class="fas fa-hourglass-half"></i>';
    if (request.status === 'inprogress') statusIcon = '<i class="fas fa-spinner fa-pulse"></i>';
    if (request.status === 'completed') statusIcon = '<i class="fas fa-check-circle"></i>';
    
    const priorityColor = request.priority === 'High' ? '#dc3545' : (request.priority === 'Low' ? '#4caf50' : '#ff9800');
    
    const modalHtml = `
        <div id="detailModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; display:flex; justify-content:center; align-items:center; overflow:auto;">
            <div style="background:${isDarkMode ? '#1e1e2e' : 'white'}; margin:20px; padding:0; border-radius:20px; max-width:500px; width:100%; max-height:85vh; overflow-y:auto; box-shadow:0 5px 20px rgba(0,0,0,0.3);">
                <div style="padding:15px 20px; border-bottom:1px solid ${isDarkMode ? '#333' : '#eee'}; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:${isDarkMode ? '#eee' : '#333'};"><i class="fas fa-clipboard-list"></i> Request Details</h3>
                    <button onclick="closeModal()" style="background:none; border:none; font-size:24px; cursor:pointer; color:${isDarkMode ? '#aaa' : '#888'};">&times;</button>
                </div>
                <div style="padding:20px;">
                    <div style="margin-bottom:15px;">
                        <h4 style="margin:0 0 5px 0; color:${isDarkMode ? '#eee' : '#333'};">${escapeHtml(request.title)}</h4>
                        <span style="background:${priorityColor}; color:white; padding:2px 10px; border-radius:20px; font-size:11px; display:inline-block;">${request.priority || 'Medium'} Priority</span>
                    </div>
                    <p><strong><i class="fas fa-door-open"></i> Room:</strong> ${escapeHtml(request.room)}</p>
                    <p><strong><i class="fas fa-tag"></i> Category:</strong> ${escapeHtml(request.category) || 'General'}</p>
                    <p><strong><i class="fas fa-id-card"></i> Student Number:</strong> ${escapeHtml(request.studentNumber)}</p>
                    <p><strong><i class="fas fa-calendar-alt"></i> Submitted:</strong> ${request.date}</p>
                    <p><strong><i class="fas fa-chart-line"></i> Status:</strong> <span style="color:${statusColor};">${statusIcon} ${request.status.toUpperCase()}</span></p>
                    <p><strong><i class="fas fa-align-left"></i> Description:</strong><br><span style="line-height:1.5;">${escapeHtml(request.description)}</span></p>
                    ${request.image && request.image.length > 0 ? `<p><strong><i class="fas fa-image"></i> Image:</strong><br><img src="${request.image}" style="max-width:100%; max-height:200px; margin-top:10px; border-radius:10px;"></p>` : '<p><em><i class="fas fa-image"></i> No image attached</em></p>'}
                </div>
                <div style="padding:15px 20px; border-top:1px solid ${isDarkMode ? '#333' : '#eee'}; display:flex; gap:10px; justify-content:flex-end;">
                    <button onclick="exportSingleToPDF(${request.id})" style="background:#4caf50; color:white; border:none; padding:8px 20px; border-radius:20px; cursor:pointer;"><i class="fas fa-file-pdf"></i> Export PDF</button>
                    <button onclick="closeModal()" style="background:#af954c; color:white; border:none; padding:8px 20px; border-radius:20px; cursor:pointer;"><i class="fas fa-times"></i> Close</button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('detailModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

// ========== UPDATED: loadRequests with Export PDF button inside each card ==========
function loadRequests() {
    const requests = getRequests();
    const myRequests = requests.filter(req => req.studentNumber === currentStudentNumber);
    const requestsList = document.getElementById('requestsList');
    
    if (!requestsList) return;
    
    requestsList.innerHTML = '';
    
    if (myRequests.length === 0) {
        requestsList.innerHTML = '<div class="request-card" style="text-align:center;"><i class="fas fa-inbox"></i> No requests yet. <a href="report.html">Report an issue</a></div>';
    } else {
        myRequests.slice().reverse().forEach(request => {
            const priorityColor = request.priority === 'High' ? '#dc3545' : (request.priority === 'Low' ? '#4caf50' : '#ff9800');
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <h3><i class="fas fa-wrench"></i> ${escapeHtml(request.title)} ${request.priority ? `<span style="background:${priorityColor}; color:white; padding:2px 10px; border-radius:20px; font-size:10px; margin-left:8px;">${request.priority}</span>` : ''}</h3>
                <p><i class="fas fa-door-open"></i> Room: ${escapeHtml(request.room)}</p>
                <p><i class="fas fa-tag"></i> Category: ${escapeHtml(request.category) || 'General'}</p>
                <p><i class="fas fa-calendar-alt"></i> Submitted: ${request.date}</p>
                <span class="status ${request.status}">${request.status.toUpperCase()}</span>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <button onclick="showRequestDetails(${request.id})" style="background:#af954c; color:white; border:none; border-radius:30px; padding:10px 15px; cursor:pointer; flex:1;"><i class="fas fa-eye"></i> View Details</button>
                    <button onclick="exportSingleToPDF(${request.id})" style="background:#4caf50; color:white; border:none; border-radius:30px; padding:10px 15px; cursor:pointer; flex:1;"><i class="fas fa-file-pdf"></i> Export PDF</button>
                </div>
            `;
            requestsList.appendChild(card);
        });
    }
    
    updateStats(requests);
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterRequests);
    }
}

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
    
    const studentNameSpan = document.getElementById('studentName');
    if (studentNameSpan) {
        const displayName = currentStudentName || (user && user.fullname) || currentStudentNumber;
        studentNameSpan.innerHTML = escapeHtml(displayName);
    }
    
    initSearch();
    loadRequests();
    
    setInterval(loadRequests, 10000);
});

// Make functions global
window.exportSingleToPDF = exportSingleToPDF;
window.exportToPDF = exportToPDF;
window.showRequestDetails = showRequestDetails;
window.closeModal = closeModal;
