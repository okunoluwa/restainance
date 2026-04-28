// my-requests.js - PROPER WORKING VERSION WITH COMMENTS

// ========== DARK MODE FUNCTION ==========
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

// Get all requests from localStorage
function getRequests() {
    const data = localStorage.getItem('requests');
    if (!data) return [];
    return JSON.parse(data);
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Get current student number (same as report.js uses)
function getCurrentStudentNumber() {
    let studentNum = localStorage.getItem('studentNumber');
    
    if (!studentNum) {
        studentNum = prompt('Enter your student number to view your requests:');
        if (studentNum && studentNum.trim()) {
            studentNum = studentNum.trim();
            localStorage.setItem('studentNumber', studentNum);
        }
    }
    return studentNum;
}

// ========== COMMENT FUNCTIONS ==========
function getComments() {
    const data = localStorage.getItem('comments');
    if (!data) return [];
    return JSON.parse(data);
}

function saveComments(comments) {
    localStorage.setItem('comments', JSON.stringify(comments));
}

function addComment(requestId, comment, userType) {
    if (!comment || !comment.trim()) {
        alert('Please enter a comment.');
        return;
    }
    let comments = getComments();
    comments.push({
        requestId: requestId,
        comment: comment.trim(),
        userType: userType,
        date: new Date().toLocaleString(),
        timestamp: Date.now()
    });
    saveComments(comments);
    renderRequests();
    const inputField = document.getElementById(`comment_${requestId}`);
    if (inputField) inputField.value = '';
}

function getCommentsForRequest(requestId) {
    const comments = getComments();
    return comments.filter(c => c.requestId === requestId);
}
// ========== END COMMENT FUNCTIONS ==========

// Search filter
function filterRequests() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.request-card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// Export to PDF
function exportToPDF() {
    const allRequests = getRequests();
    const currentStudent = getCurrentStudentNumber();
    if (!currentStudent) return;
    
    const myRequests = allRequests.filter(req => req.studentNumber === currentStudent);
    
    if (myRequests.length === 0) {
        alert('No requests found to export');
        return;
    }
    
    let html = `<html><head><title>My Requests</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
    </head><body>
        <h1>My Maintenance Requests</h1>
        <p><strong>Student Number:</strong> ${escapeHtml(currentStudent)}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <table>
            <tr><th>Title</th><th>Room</th><th>Category</th><th>Status</th><th>Date</th></tr>
            ${myRequests.map(r => `<tr>
                <td>${escapeHtml(r.title)}</td>
                <td>${escapeHtml(r.room)}</td>
                <td>${escapeHtml(r.category) || 'General'}</td>
                <td>${r.status}</td>
                <td>${r.date}</td>
            </tr>`).join('')}
        </table>
    </body></html>`;
    
    const blob = new Blob([html], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `my-requests-${currentStudent}.pdf`;
    link.click();
    alert('PDF exported!');
}

// Delete request
function deleteRequest(id) {
    if (confirm('Are you sure you want to delete this request?')) {
        let requests = getRequests();
        requests = requests.filter(r => r.id !== id);
        localStorage.setItem('requests', JSON.stringify(requests));
        renderRequests();
        alert('Request deleted successfully');
    }
}

// Toggle image visibility
function toggleImage(imgId) {
    const img = document.getElementById(imgId);
    if (img) {
        if (img.style.display === 'none') {
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    }
}

// Main render function WITH COMMENTS
function renderRequests() {
    const container = document.getElementById('requestsContainer');
    if (!container) {
        console.error('requestsContainer not found');
        return;
    }

    const currentStudent = getCurrentStudentNumber();
    
    if (!currentStudent) {
        container.innerHTML = '<div style="text-align:center; padding:50px;">❌ Student number required. Please refresh the page.</div>';
        return;
    }

    const allRequests = getRequests();
    const myRequests = allRequests.filter(req => req.studentNumber === currentStudent);
    
    if (myRequests.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px;">
            <i class="fas fa-inbox" style="font-size:48px; color:#bc9650;"></i>
            <p style="margin-top:15px;">No requests found for student: <strong>${escapeHtml(currentStudent)}</strong></p>
            <p><a href="report.html" style="color:#bc9650; text-decoration:none;">➕ Report an issue</a></p>
        </div>`;
        return;
    }

    container.innerHTML = '';
    
    // Sort by newest first
    myRequests.sort((a, b) => b.id - a.id);
    
    myRequests.forEach(request => {
        const priorityColor = request.priority === 'High' ? '#dc3545' : (request.priority === 'Low' ? '#4caf50' : '#ff9800');
        let priorityIcon = '<i class="fas fa-minus"></i>';
        if (request.priority === 'High') priorityIcon = '<i class="fas fa-arrow-up"></i>';
        if (request.priority === 'Low') priorityIcon = '<i class="fas fa-arrow-down"></i>';
        
        let statusIcon = '<i class="fas fa-hourglass-half"></i>';
        let statusClass = 'pending';
        if (request.status === 'inprogress') {
            statusIcon = '<i class="fas fa-spinner fa-pulse"></i>';
            statusClass = 'inprogress';
        }
        if (request.status === 'completed') {
            statusIcon = '<i class="fas fa-check-circle"></i>';
            statusClass = 'completed';
        }
        
        const hasImage = request.image && request.image.length > 0;
        const imageId = `img_${request.id}`;
        
        const comments = getCommentsForRequest(request.id);
        
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <h3>
                <i class="fas fa-wrench"></i> ${escapeHtml(request.title)}
                <span style="background:${priorityColor}; color:white; padding:2px 10px; border-radius:20px; font-size:10px; margin-left:8px;">
                    ${priorityIcon} ${request.priority || 'Medium'}
                </span>
            </h3>
            <p><i class="fas fa-door-open"></i> <strong>Room:</strong> ${escapeHtml(request.room)}</p>
            <p><i class="fas fa-tag"></i> <strong>Category:</strong> ${escapeHtml(request.category) || 'General'}</p>
            <p><i class="fas fa-align-left"></i> <strong>Description:</strong> ${escapeHtml(request.description)}</p>
            <p><i class="fas fa-calendar-alt"></i> <strong>Submitted:</strong> ${request.date}</p>
            <span class="status ${statusClass}">${statusIcon} ${request.status.toUpperCase()}</span>
            ${hasImage ? `
                <div style="margin:10px 0;">
                    <button onclick="toggleImage('${imageId}')" style="background:#bc9650; color:white; border:none; border-radius:20px; padding:5px 12px; cursor:pointer; font-size:12px;">
                        <i class="fas fa-image"></i> Show/Hide Image
                    </button>
                    <div id="${imageId}" style="margin-top:10px;">
                        <img src="${request.image}" style="max-width:100%; max-height:200px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                    </div>
                </div>
            ` : '<div style="margin:10px 0; color:#999;"><i class="fas fa-image"></i> No image attached</div>'}
            
            <!-- COMMENT SECTION -->
            <div class="comments-section">
                <strong><i class="fas fa-comments"></i> Comments (${comments.length})</strong>
                <div style="margin-top:10px;">
                    ${comments.slice(-3).map(c => `
                        <div class="comment">
                            <strong><i class="fas ${c.userType === 'staff' ? 'fa-user-tie' : 'fa-user-graduate'}"></i> ${c.userType === 'staff' ? 'Staff' : 'Student'}:</strong>
                            <p style="margin:5px 0 0 0;">${escapeHtml(c.comment)}</p>
                            <small><i class="far fa-clock"></i> ${c.date}</small>
                        </div>
                    `).join('')}
                    ${comments.length === 0 ? '<div style="color:#999; padding:10px;">No comments yet.</div>' : ''}
                </div>
                <div class="add-comment">
                    <input type="text" id="comment_${request.id}" placeholder="Add a comment...">
                    <button onclick="addComment(${request.id}, document.getElementById('comment_${request.id}').value, 'student')">
                        <i class="fas fa-paper-plane"></i> Post
                    </button>
                </div>
            </div>
            <!-- END COMMENT SECTION -->
            
            <div class="actions" style="display:flex; gap:10px; margin-top:15px;">
                <button onclick="deleteRequest(${request.id})" style="background:#dc3545; color:white; border:none; border-radius:25px; padding:10px; cursor:pointer; flex:1;">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
                <button onclick="exportToPDF()" style="background:#4caf50; color:white; border:none; border-radius:25px; padding:10px; cursor:pointer; flex:1;">
                    <i class="fas fa-file-pdf"></i> Export PDF
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Add search bar to the page
function addControls() {
    const main = document.querySelector('.main');
    if (!main) return;
    
    const h1 = main.querySelector('h1');
    if (!h1) return;
    
    if (!document.getElementById('searchInput')) {
        const searchDiv = document.createElement('div');
        searchDiv.className = 'search-bar';
        searchDiv.style.margin = '15px 0';
        searchDiv.innerHTML = '<input type="text" id="searchInput" placeholder="🔍 Search your requests..." style="width:100%; padding:12px; border-radius:30px; border:1px solid #ddd; font-size:14px;">';
        h1.insertAdjacentElement('afterend', searchDiv);
        document.getElementById('searchInput').addEventListener('keyup', filterRequests);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('my-requests.js loaded');
    initDarkMode();
    addControls();
    renderRequests();
});

// Make functions global
window.deleteRequest = deleteRequest;
window.exportToPDF = exportToPDF;
window.toggleImage = toggleImage;
window.filterRequests = filterRequests;
window.addComment = addComment;