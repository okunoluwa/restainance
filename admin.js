// Dark mode
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
        container.innerHTML = '<div class="no-requests">📭 No requests</div>';
        return;
    }
    container.innerHTML = '';
    [...requests].reverse().forEach(req => {
        const card = document.createElement("div");
        card.className = "request-card";
        card.innerHTML = `
            <h3>🔧 ${escapeHtml(req.title)}</h3>
            <p><strong>Room:</strong> ${escapeHtml(req.room)}</p>
            <p><strong>Student:</strong> ${escapeHtml(req.studentNumber)}</p>
            <p><strong>Description:</strong> ${escapeHtml(req.description)}</p>
            <span class="status ${req.status}">${req.status.toUpperCase()}</span>
            <select onchange="updateStatus(${req.id}, this.value)">
                <option ${req.status === 'pending' ? 'selected' : ''} value="pending">Pending</option>
                <option ${req.status === 'inprogress' ? 'selected' : ''} value="inprogress">In Progress</option>
                <option ${req.status === 'completed' ? 'selected' : ''} value="completed">Completed</option>
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
});