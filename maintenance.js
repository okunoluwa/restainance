const container = document.getElementById("requestsContainer");

function getRequests() {
    return JSON.parse(localStorage.getItem("requests")) || [];
}

function saveRequests(requests) {
    localStorage.setItem("requests", JSON.stringify(requests));
}

// Dark mode
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
    if (isDarkMode) document.body.classList.add('dark-mode');
    document.body.appendChild(btn);
}

// Rating
function addRating(requestId, rating) {
    let ratings = JSON.parse(localStorage.getItem('ratings')) || [];
    ratings = ratings.filter(r => r.requestId !== requestId);
    ratings.push({ requestId, rating, timestamp: Date.now() });
    localStorage.setItem('ratings', JSON.stringify(ratings));
    renderRequests();
}

function getRating(requestId) {
    let ratings = JSON.parse(localStorage.getItem('ratings')) || [];
    const rating = ratings.find(r => r.requestId === requestId);
    return rating ? rating.rating : null;
}

// Comments
function addComment(requestId, comment, userType) {
    if (!comment || !comment.trim()) return;
    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments.push({ requestId, comment: comment.trim(), userType, date: new Date().toLocaleString(), timestamp: Date.now() });
    localStorage.setItem('comments', JSON.stringify(comments));
    renderRequests();
}

function getComments(requestId) {
    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    return comments.filter(c => c.requestId === requestId);
}

// Update status
function updateStatus(id, newStatus) {
    let requests = getRequests();
    const request = requests.find(r => r.id === id);
    if (!request) return;
    requests = requests.map(req => req.id === id ? { ...req, status: newStatus } : req);
    saveRequests(requests);
    if (Notification.permission === "granted") {
        new Notification("Status Updated", { body: `${request.title} is now ${newStatus}` });
    }
    renderRequests();
}

function updatePriority(id, priority) {
    let requests = getRequests();
    requests = requests.map(req => req.id === id ? { ...req, priority: priority } : req);
    saveRequests(requests);
    renderRequests();
}

// Search
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
    const h1 = main.querySelector('h1');
    if (!h1 || document.getElementById('searchInput')) return;
    const searchDiv = document.createElement('div');
    searchDiv.className = 'search-bar';
    searchDiv.innerHTML = '<input type="text" id="searchInput" placeholder="🔍 Search requests...">';
    h1.insertAdjacentElement('afterend', searchDiv);
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('keyup', filterRequests);
}

// Export
function exportToPDF() {
    const requests = getRequests();
    let html = `<html><head><title>All Requests</title></head><body>
        <h1>All Maintenance Requests</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table border="1" cellpadding="5" cellspacing="0">
            <tr><th>ID</th><th>Title</th><th>Student</th><th>Room</th><th>Status</th><th>Priority</th><th>Date</th></tr>
            ${requests.map(r => `<tr><td>${r.id}</td><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.studentNumber)}</td><td>${escapeHtml(r.room)}</td><td>${r.status}</td><td>${r.priority || 'Medium'}</td><td>${r.date}</td>`).join('')}
        </table></body></html>`;
    const blob = new Blob([html], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `all-requests-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    alert('<i class="fas fa-check"></i> PDF exported!');
}

function addExportButton() {
    const main = document.querySelector('.main');
    if (!main) return;
    const h1 = main.querySelector('h1');
    if (!h1 || document.querySelector('.export-btn')) return;
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-file-pdf"></i> Export PDF';
    btn.className = 'export-btn';
    btn.style.cssText = 'background:#4caf50; color:white; border:none; border-radius:30px; padding:10px 20px; margin-bottom:15px; cursor:pointer;';
    btn.onclick = exportToPDF;
    h1.insertAdjacentElement('afterend', btn);
}

// Calendar
let calendarActive = false;
function toggleCalendar() {
    calendarActive = !calendarActive;
    let calendarDiv = document.getElementById('calendarView');
    if (calendarActive) {
        if (!calendarDiv) {
            const requests = getRequests();
            const dates = {};
            requests.forEach(r => {
                if (r.date) {
                    const date = new Date(r.date).toDateString();
                    dates[date] = (dates[date] || 0) + 1;
                }
            });
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            let calHtml = '<div id="calendarView" class="calendar-view active"><div class="calendar-header"><button onclick="toggleCalendar()"><i class="fas fa-times"></i> Close</button></div><div class="calendar-grid">';
            calHtml += ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div style="font-weight:bold">${d}</div>`).join('');
            for (let i = 0; i < firstDay.getDay(); i++) calHtml += '<div></div>';
            for (let d = 1; d <= lastDay.getDate(); d++) {
                const dateStr = new Date(today.getFullYear(), today.getMonth(), d).toDateString();
                const hasRequests = dates[dateStr];
                calHtml += `<div class="calendar-day ${hasRequests ? 'has-request' : ''}" onclick="alert('${dateStr}: ${hasRequests || 0} requests')">${d}</div>`;
            }
            calHtml += '</div></div>';
            const container = document.getElementById('requestsContainer');
            if (container) container.insertAdjacentHTML('beforebegin', calHtml);
        } else {
            calendarDiv.classList.add('active');
        }
    } else if (calendarDiv) {
        calendarDiv.classList.remove('active');
    }
}

function addCalendarButton() {
    const main = document.querySelector('.main');
    if (!main) return;
    const h1 = main.querySelector('h1');
    if (!h1 || document.querySelector('.calendar-btn')) return;
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-calendar-alt"></i> Calendar';
    btn.className = 'calendar-btn';
    btn.style.cssText = 'background:#2196f3; color:white; border:none; border-radius:30px; padding:10px 20px; margin-bottom:15px; margin-right:10px; cursor:pointer;';
    btn.onclick = toggleCalendar;
    h1.insertAdjacentElement('afterend', btn);
}

window.toggleCalendar = toggleCalendar;

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderRequests() {
    let requests = getRequests();
    const searchTerm = document.getElementById('searchInput')?.value;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        requests = requests.filter(r => (r.title && r.title.toLowerCase().includes(term)) || 
            (r.studentNumber && r.studentNumber.includes(term)) || 
            (r.room && r.room.toLowerCase().includes(term)));
    }
    if (!container) return;
    if (requests.length === 0) {
        container.innerHTML = '<div class="no-requests"><i class="fas fa-inbox"></i> No requests</div>';
        return;
    }
    container.innerHTML = '';
    [...requests].reverse().forEach(req => {
        const priorityColor = req.priority === 'High' ? '#dc3545' : (req.priority === 'Low' ? '#4caf50' : '#ff9800');
        const rating = getRating(req.id);
        const comments = getComments(req.id);
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <h3><i class="fas fa-wrench"></i> ${escapeHtml(req.title)} <span style="background:${priorityColor}; color:white; padding:3px 12px; border-radius:20px; font-size:10px;"><i class="fas fa-flag"></i> ${req.priority || 'Medium'}</span></h3>
            <p><i class="fas fa-door-open"></i> <strong>Room:</strong> ${escapeHtml(req.room)}</p>
            <p><i class="fas fa-id-card"></i> <strong>Student:</strong> ${escapeHtml(req.studentNumber)}</p>
            <p><i class="fas fa-align-left"></i> <strong>Description:</strong> ${escapeHtml(req.description)}</p>
            <span class="status ${req.status}"><i class="fas ${req.status === 'pending' ? 'fa-hourglass-half' : (req.status === 'inprogress' ? 'fa-spinner fa-pulse' : 'fa-check-circle')}"></i> ${req.status.toUpperCase()}</span>
            ${req.status === 'completed' && !rating ? `<div class="rating"><strong><i class="fas fa-star"></i> Rate: </strong>${[1,2,3,4,5].map(s => `<span class="star" onclick="addRating(${req.id}, ${s})"><i class="far fa-star"></i></span>`).join('')}</div>` : rating ? `<div class="rating"><i class="fas fa-star"></i> Rating: ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>` : ''}
            <div class="comments-section"><strong><i class="fas fa-comments"></i> Comments (${comments.length})</strong>${comments.slice(-3).map(c => `<div class="comment"><strong><i class="fas ${c.userType === 'staff' ? 'fa-user-tie' : 'fa-user-graduate'}"></i> ${c.userType === 'staff' ? 'Staff' : 'Student'}:</strong> ${escapeHtml(c.comment)}<br><small>${c.date}</small></div>`).join('')}<div class="add-comment"><input type="text" id="comment_${req.id}" placeholder="Add comment..."><button onclick="addComment(${req.id}, document.getElementById('comment_${req.id}').value, 'staff')"><i class="fas fa-paper-plane"></i> Post</button></div></div>
            <div class="actions"><select onchange="updatePriority(${req.id}, this.value)"><option ${req.priority === 'Low' ? 'selected' : ''}><i class="fas fa-arrow-down"></i> Low</option><option ${!req.priority || req.priority === 'Medium' ? 'selected' : ''}><i class="fas fa-minus"></i> Medium</option><option ${req.priority === 'High' ? 'selected' : ''}><i class="fas fa-arrow-up"></i> High</option></select>${req.status !== 'inprogress' && req.status !== 'completed' ? `<button class="start" onclick="updateStatus(${req.id}, 'inprogress')"><i class="fas fa-play"></i> Start</button>` : ''}${req.status !== 'completed' ? `<button class="done" onclick="updateStatus(${req.id}, 'completed')"><i class="fas fa-check"></i> Complete</button>` : ''}</div>
        `;
        container.appendChild(card);
    });
}

// Make functions global
window.addRating = addRating;
window.addComment = addComment;
window.updateStatus = updateStatus;
window.updatePriority = updatePriority;

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    initDarkMode();
    addSearchBar();
    addExportButton();
    addCalendarButton();
    renderRequests();
    
    (function displayStaffName() {
        const userData = localStorage.getItem('user');
        let welcomeDiv = document.getElementById('staffWelcome');
        if (!welcomeDiv) {
            const main = document.querySelector('.main');
            const h1 = main?.querySelector('h1');
            if (main && h1) {
                const div = document.createElement('div');
                div.id = 'staffWelcome';
                div.style.cssText = 'margin-bottom: 20px; padding: 15px 20px; background: #e3f2fd; border-radius: 15px; color: #1565c0; font-weight: 500;';
                div.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Loading...';
                h1.insertAdjacentElement('afterend', div);
                welcomeDiv = div;
            }
        }
        
        if (userData && welcomeDiv) {
            try {
                const user = JSON.parse(userData);
                if (user && user.fullname) {
                    welcomeDiv.innerHTML = '<i class="fas fa-hand-peace"></i> Welcome back, <strong style="color: #af954c;">' + user.fullname + '</strong>! You can manage maintenance requests here.';
                } else {
                    welcomeDiv.innerHTML = '<i class="fas fa-user-tie"></i> Welcome, Staff Member!';
                }
            } catch(e) {
                welcomeDiv.innerHTML = '<i class="fas fa-user-tie"></i> Welcome, Staff Member!';
            }
        } else if (welcomeDiv) {
            welcomeDiv.innerHTML = '<i class="fas fa-user-tie"></i> Welcome, Staff Member!';
        }
    })();
});