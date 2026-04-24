// my-requests.js - COMPLETE WORKING VERSION WITH DEBUG LOGS

// ---------- Helper Functions ----------
function getRequests() {
    const data = localStorage.getItem('requests');
    const requests = data ? JSON.parse(data) : [];
    console.log('📦 Total requests in storage:', requests.length);
    return requests;
}

function saveRequests(requests) {
    localStorage.setItem('requests', JSON.stringify(requests));
    console.log('💾 Requests saved, total:', requests.length);
}

function getRatings() {
    return JSON.parse(localStorage.getItem('ratings') || '[]');
}

function saveRatings(ratings) {
    localStorage.setItem('ratings', JSON.stringify(ratings));
}

function getComments() {
    return JSON.parse(localStorage.getItem('comments') || '[]');
}

function saveComments(comments) {
    localStorage.setItem('comments', JSON.stringify(comments));
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

// ---------- Dark Mode ----------
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

// ---------- Rating Functions ----------
function addRating(requestId, rating) {
    let ratings = getRatings();
    ratings = ratings.filter(r => r.requestId !== requestId);
    ratings.push({ requestId, rating, timestamp: Date.now() });
    saveRatings(ratings);
    alert(`Thank you for rating ${rating} stars!`);
    renderRequests();
}

function getRating(requestId) {
    const ratings = getRatings();
    const rating = ratings.find(r => r.requestId === requestId);
    return rating ? rating.rating : null;
}

// ---------- Comment Functions ----------
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

// ---------- STUDENT NUMBER HANDLING (CRITICAL FIX) ----------
function getCurrentStudentNumber() {
    // Try to get from multiple possible keys
    let studentNum = localStorage.getItem('currentStudentNumber') ||
                     localStorage.getItem('reportStudentNumber') ||
                     localStorage.getItem('studentNumber');
    
    console.log('🔍 Found stored student number:', studentNum);
    
    if (!studentNum) {
        studentNum = prompt('🔐 Enter your student number to view your requests:');
        if (studentNum && studentNum.trim()) {
            studentNum = studentNum.trim();
            // Save to ALL keys for consistency across pages
            localStorage.setItem('currentStudentNumber', studentNum);
            localStorage.setItem('reportStudentNumber', studentNum);
            localStorage.setItem('studentNumber', studentNum);
            console.log('✅ Saved student number to all keys:', studentNum);
        } else {
            console.warn('❌ No student number entered');
            return null;
        }
    }
    return studentNum;
}

// ---------- Search ----------
function filterRequests() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.request-card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// ---------- Export to PDF ----------
function exportToPDF() {
    const allRequests = getRequests();
    const currentStudent = getCurrentStudentNumber();
    if (!currentStudent) return;
    const myRequests = allRequests.filter(req => req.studentNumber === currentStudent);
    
    let html = `<html><head><title>My Requests</title></head><body>
        <h1>My Maintenance Requests</h1>
        <p>Student: ${escapeHtml(currentStudent)}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table border="1" cellpadding="5">
            <tr><th>Title</th><th>Room</th><th>Status</th><th>Date</th></tr>
            ${myRequests.map(r => `<tr><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.room)}</td><td>${r.status}</td><td>${r.date}</td></tr>`).join('')}
        </table></body></html>`;
    
    const blob = new Blob([html], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `my-requests-${currentStudent}.pdf`;
    link.click();
    alert('✅ PDF exported!');
}

// ---------- Add UI Controls ----------
function addControls() {
    const main = document.querySelector('.main');
    if (!main) {
        console.error('❌ .main element not found');
        return;
    }
    const h1 = main.querySelector('h1');
    if (!h1) {
        console.error('❌ h1 element not found');
        return;
    }

    // Search bar
    if (!document.getElementById('searchInput')) {
        const searchDiv = document.createElement('div');
        searchDiv.className = 'search-bar';
        searchDiv.style.margin = '15px 0';
        searchDiv.innerHTML = '<input type="text" id="searchInput" placeholder="🔍 Search your requests..." style="width:100%; padding:12px; border-radius:30px; border:1px solid #ddd;">';
        h1.insertAdjacentElement('afterend', searchDiv);
        document.getElementById('searchInput').addEventListener('keyup', filterRequests);
        console.log('✅ Search bar added');
    }

    // Export button
    if (!document.querySelector('.export-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.innerHTML = '📄 Export PDF';
        exportBtn.className = 'export-btn';
        exportBtn.style.cssText = 'background:#4caf50; color:white; border:none; border-radius:30px; padding:10px 18px; margin:10px 0; cursor:pointer;';
        exportBtn.onclick = exportToPDF;
        const searchDiv = document.querySelector('.search-bar');
        if (searchDiv) searchDiv.insertAdjacentElement('afterend', exportBtn);
        else h1.insertAdjacentElement('afterend', exportBtn);
        console.log('✅ Export button added');
    }
}

// ---------- Edit & Delete ----------
function editRequest(id) {
    const requests = getRequests();
    const request = requests.find(r => r.id === id);
    if (!request) return;
    const newTitle = prompt('Edit title:', request.title);
    if (newTitle && newTitle.trim()) request.title = newTitle.trim();
    const newDesc = prompt('Edit description:', request.description);
    if (newDesc && newDesc.trim()) request.description = newDesc.trim();
    saveRequests(requests);
    renderRequests();
    alert('Request updated!');
}

function deleteRequest(id) {
    if (confirm('Are you sure you want to delete this request?')) {
        let requests = getRequests();
        requests = requests.filter(r => r.id !== id);
        saveRequests(requests);
        renderRequests();
        alert('Request deleted.');
    }
}

// ---------- MAIN RENDER FUNCTION ----------
function renderRequests() {
    const container = document.getElementById('requestsContainer');
    if (!container) {
        console.error('❌ Container #requestsContainer not found!');
        return;
    }

    const currentStudent = getCurrentStudentNumber();
    console.log('👤 Current student number:', currentStudent);
    
    if (!currentStudent) {
        container.innerHTML = '<div class="empty" style="text-align:center; padding:50px;">❌ Student number required. Please refresh and enter your number.</div>';
        return;
    }

    const allRequests = getRequests();
    console.log('📋 All requests:', allRequests);
    
    // Filter requests by student number
    const myRequests = allRequests.filter(req => req.studentNumber === currentStudent);
    console.log(`🎯 Found ${myRequests.length} requests for student ${currentStudent}`);
    
    if (myRequests.length === 0) {
        container.innerHTML = '<div class="empty" style="text-align:center; padding:50px;">📭 No requests found. <a href="report.html">Report an issue</a></div>';
        return;
    }

    container.innerHTML = '';
    // Show newest first
    myRequests.sort((a, b) => b.id - a.id).forEach(request => {
        const priorityColor = request.priority === 'High' ? '#dc3545' : (request.priority === 'Low' ? '#4caf50' : '#ff9800');
        const rating = getRating(request.id);
        const comments = getCommentsForRequest(request.id);

        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <h3>🔧 ${escapeHtml(request.title)} 
                <span style="background:${priorityColor}; color:white; padding:2px 10px; border-radius:20px; font-size:10px;">${request.priority || 'Medium'}</span>
            </h3>
            <p><strong>Room:</strong> ${escapeHtml(request.room)}</p>
            <p><strong>Category:</strong> ${escapeHtml(request.category) || 'General'}</p>
            <p><strong>Description:</strong> ${escapeHtml(request.description)}</p>
            <p><strong>Submitted:</strong> ${request.date}</p>
            <span class="status ${request.status}">${request.status.toUpperCase()}</span>
            ${request.status === 'completed' && !rating ? `
                <div class="rating"><strong>Rate: </strong>
                    ${[1,2,3,4,5].map(s => `<span class="star" onclick="addRating(${request.id}, ${s})" style="font-size:22px; cursor:pointer;">☆</span>`).join('')}
                </div>
            ` : rating ? `
                <div class="rating">⭐ Rating: ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>
            ` : ''}
            <div class="comments-section">
                <strong>💬 Comments (${comments.length})</strong>
                ${comments.slice(-3).map(c => `<div class="comment"><strong>${c.userType === 'staff' ? 'Staff' : 'Student'}:</strong> ${escapeHtml(c.comment)}<br><small>${c.date}</small></div>`).join('')}
                <div class="add-comment" style="display:flex; gap:8px; margin-top:10px;">
                    <input type="text" id="comment_${request.id}" placeholder="Add a comment...">
                    <button onclick="addComment(${request.id}, document.getElementById('comment_${request.id}').value, 'student')">Post</button>
                </div>
            </div>
            <div class="actions" style="display:flex; gap:10px; margin-top:15px;">
                ${request.status === 'pending' ? `<button class="edit-btn" onclick="editRequest(${request.id})" style="background:#2196f3; color:white; border:none; border-radius:25px; padding:10px; cursor:pointer;">✏️ Edit</button>` : ''}
                <button class="delete-btn" onclick="deleteRequest(${request.id})" style="background:#dc3545; color:white; border:none; border-radius:25px; padding:10px; cursor:pointer;">🗑️ Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ---------- Expose global functions ----------
window.addRating = addRating;
window.addComment = addComment;
window.editRequest = editRequest;
window.deleteRequest = deleteRequest;
window.exportToPDF = exportToPDF;

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 my-requests.js loaded');
    initDarkMode();
    addControls();
    renderRequests();
});