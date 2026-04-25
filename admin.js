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

function getRequests() {
    return JSON.parse(localStorage.getItem("requests")) || [];
}

function saveRequests(requests) {
    localStorage.setItem("requests", JSON.stringify(requests));
}

function updateStatus(id, newStatus) {
    let requests = getRequests();
    requests = requests.map(req => req.id === id ? { ...req, status: newStatus } : req);
    saveRequests(requests);
    renderRequests();
}

function renderRequests() {
    const container = document.getElementById("requestsContainer");
    const requests = getRequests();
    if (!container) return;
    if (requests.length === 0) {
        container.innerHTML = '<div class="no-requests"><i class="fas fa-inbox"></i> No requests</div>';
        return;
    }
    container.innerHTML = '';
    [...requests].reverse().forEach(req => {
        const card = document.createElement("div");
        card.className = "request-card";
        card.innerHTML = `
            <h3><i class="fas fa-wrench"></i> ${escapeHtml(req.title)}</h3>
            <p><i class="fas fa-door-open"></i> <strong>Room:</strong> ${escapeHtml(req.room)}</p>
            <p><i class="fas fa-id-card"></i> <strong>Student:</strong> ${escapeHtml(req.studentNumber)}</p>
            <p><i class="fas fa-align-left"></i> <strong>Description:</strong> ${escapeHtml(req.description)}</p>
            <span class="status ${req.status}"><i class="fas ${req.status === 'pending' ? 'fa-hourglass-half' : (req.status === 'inprogress' ? 'fa-spinner fa-pulse' : 'fa-check-circle')}"></i> ${req.status.toUpperCase()}</span>
            <select onchange="updateStatus(${req.id}, this.value)">
                <option ${req.status === 'pending' ? 'selected' : ''} value="pending"><i class="fas fa-hourglass-half"></i> Pending</option>
                <option ${req.status === 'inprogress' ? 'selected' : ''} value="inprogress"><i class="fas fa-spinner"></i> In Progress</option>
                <option ${req.status === 'completed' ? 'selected' : ''} value="completed"><i class="fas fa-check-circle"></i> Completed</option>
            </select>
        `;
        container.appendChild(card);
    });
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

window.updateStatus = updateStatus;

document.addEventListener("DOMContentLoaded", function() {
    initDarkMode();
    renderRequests();
    
    (function displayAdminName() {
        const userData = localStorage.getItem('user');
        let welcomeDiv = document.getElementById('adminWelcome');
        if (!welcomeDiv) {
            const main = document.querySelector('.main');
            const h1 = main?.querySelector('h1');
            if (main && h1) {
                const div = document.createElement('div');
                div.id = 'adminWelcome';
                div.style.cssText = 'margin-bottom: 20px; padding: 15px 20px; background: #e8f5e9; border-radius: 15px; color: #2e7d32; font-weight: 500;';
                div.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Loading...';
                h1.insertAdjacentElement('afterend', div);
                welcomeDiv = div;
            }
        }
        
        if (userData && welcomeDiv) {
            try {
                const user = JSON.parse(userData);
                if (user && user.fullname) {
                    welcomeDiv.innerHTML = '<i class="fas fa-hand-peace"></i> Welcome back, <strong style="color: #af954c;">' + user.fullname + '</strong>! You have full admin access.';
                } else {
                    welcomeDiv.innerHTML = '<i class="fas fa-user-shield"></i> Welcome, Admin!';
                }
            } catch(e) {
                welcomeDiv.innerHTML = '<i class="fas fa-user-shield"></i> Welcome, Admin!';
            }
        } else if (welcomeDiv) {
            welcomeDiv.innerHTML = '<i class="fas fa-user-shield"></i> Welcome, Admin!';
        }
    })();
});