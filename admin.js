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

function getStaffList() {
    let staffList = [];
    const users = JSON.parse(localStorage.getItem("users")) || [];
    staffList = users.filter(u => u.role === 'staff');
    
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser && currentUser.role === 'staff' && !staffList.find(s => s.email === currentUser.email)) {
        staffList.push(currentUser);
    }
    
    return staffList;
}

function updateAssignment(id, assignedStaff) {
    let requests = getRequests();
    requests = requests.map(req => req.id === id ? { 
        ...req, 
        assignedTo: assignedStaff, 
        assignedDate: new Date().toLocaleString() 
    } : req);
    saveRequests(requests);
    renderRequests();
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
    const staffList = getStaffList();
    
    if (!container) return;
    if (requests.length === 0) {
        container.innerHTML = '<div class="no-requests"><i class="fas fa-inbox"></i> No requests</div>';
        return;
    }
    
    container.innerHTML = '';
    [...requests].reverse().forEach(req => {
        const card = document.createElement("div");
        card.className = "request-card";
        
        let staffOptions = '<option value="">-- Unassigned --</option>';
        staffList.forEach(staff => {
            const selected = req.assignedTo === staff.fullname ? 'selected' : '';
            staffOptions += `<option value="${escapeHtml(staff.fullname)}" ${selected}>${escapeHtml(staff.fullname)}</option>`;
        });
        
        const assignedBadge = req.assignedTo ? 
            `<span style="display:inline-block; background:#4caf50; color:white; padding:3px 10px; border-radius:20px; font-size:11px; margin-left:10px;"><i class="fas fa-user-check"></i> Assigned to: ${escapeHtml(req.assignedTo)}</span>` : 
            `<span style="display:inline-block; background:#ff9800; color:white; padding:3px 10px; border-radius:20px; font-size:11px; margin-left:10px;"><i class="fas fa-user-clock"></i> Unassigned</span>`;
        
        card.innerHTML = `
            <h3><i class="fas fa-wrench"></i> ${escapeHtml(req.title)} ${assignedBadge}</h3>
            <p><i class="fas fa-door-open"></i> <strong>Room:</strong> ${escapeHtml(req.room)}</p>
            <p><i class="fas fa-id-card"></i> <strong>Student Number:</strong> ${escapeHtml(req.studentNumber)}</p>
            <p><i class="fas fa-user"></i> <strong>Student Name:</strong> ${escapeHtml(req.studentName || req.studentNumber)}</p>
            <p><i class="fas fa-align-left"></i> <strong>Description:</strong> ${escapeHtml(req.description)}</p>
            <p><i class="fas fa-calendar-alt"></i> <strong>Submitted:</strong> ${req.date}</p>
            ${req.assignedDate ? `<p><i class="fas fa-clock"></i> <strong>Assigned:</strong> ${req.assignedDate}</p>` : ''}
            <span class="status ${req.status}"><i class="fas ${req.status === 'pending' ? 'fa-hourglass-half' : (req.status === 'inprogress' ? 'fa-spinner fa-pulse' : 'fa-check-circle')}"></i> ${req.status.toUpperCase()}</span>
            <div style="margin-top: 15px;">
                <label style="display:block; margin-bottom:5px; font-weight:bold;"><i class="fas fa-user-tie"></i> Assign to Staff:</label>
                <select onchange="updateAssignment(${req.id}, this.value)" style="width:100%; padding:10px; border-radius:25px; border:1px solid #ddd;">
                    ${staffOptions}
                </select>
            </div>
            <div style="margin-top: 15px;">
                <select onchange="updateStatus(${req.id}, this.value)" style="width:100%; padding:10px; border-radius:25px; border:1px solid #ddd;">
                    <option ${req.status === 'pending' ? 'selected' : ''} value="pending"><i class="fas fa-hourglass-half"></i> Pending</option>
                    <option ${req.status === 'inprogress' ? 'selected' : ''} value="inprogress"><i class="fas fa-spinner"></i> In Progress</option>
                    <option ${req.status === 'completed' ? 'selected' : ''} value="completed"><i class="fas fa-check-circle"></i> Completed</option>
                </select>
            </div>
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

window.updateAssignment = updateAssignment;
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
                    welcomeDiv.innerHTML = '<i class="fas fa-hand-peace"></i> Welcome back, <strong style="color: #af954c;">' + user.fullname + '</strong>! You can assign tasks to maintenance staff.';
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