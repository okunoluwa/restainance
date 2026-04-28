// my-requests.js - COMPLETE WORKING VERSION WITH IMAGE DISPLAY

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

// ---------- STUDENT NUMBER HANDLING ----------
function getCurrentStudentNumber() {
    let studentNum = localStorage.getItem('currentStudentNumber') ||
                     localStorage.getItem('reportStudentNumber') ||
                     localStorage.getItem('studentNumber');
    
    console.log('🔍 Found stored student number:', studentNum);
    
    if (!studentNum) {
        studentNum = prompt('🔐 Enter your student number to view your requests:');
        if (studentNum && studentNum.trim()) {
            studentNum = studentNum.trim();
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

// ---------- Export to PDF (with images) ----------
function exportToPDF() {
    const allRequests = getRequests();
    const currentStudent = getCurrentStudentNumber();
    if (!currentStudent) return;
    const myRequests = allRequests.filter(req => req.studentNumber === currentStudent);
    
    let html = `<html><head><title>My Requests</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
        .request-image { max-width: 200px; max-height: 200px; }
    </style>
    </head><body>
        <h1>My Maintenance Requests</h1>
        <p>Student: ${escapeHtml(currentStudent)}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table>
            <tr><th>Title</th><th>Room</th><th>Category</th><th>Description</th><th>Status</th><th>Date</th><th>Image</th></tr>
            ${myRequests.map(r => `
                <tr>
                    <td>${escapeHtml(r.title)}</td>
                    <td>${escapeHtml(r.room)}</td>
                    <td>${escapeHtml(r.category) || 'General'}</td>
                    <td>${escapeHtml(r.description)}</td>
                    <td>${r.status}</td>
                    <td>${r.date}</td>
                    <td>${r.image ? '<img src="' + r.image + '" style="max-width:150px; max-height:150px;" />' : 'No image'}</td>
                </tr>
            `).join('')}
        </table>
    </body></html>`;
    
    const blob = new Blob([html], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `my-requests-${currentStudent}.pdf`;
    link.click();
    alert('✅ PDF exported!');
}

// ---------- Add Export Button at Bottom ----------
function addExportButtonAtBottom() {
    const container = document.getElementById('requestsContainer');
    if (!container) return;
    
    const existingBtn = document.querySelector('.export-btn-bottom');
    if (existingBtn) existingBtn.remove();
    
    const currentStudent = getCurrentStudentNumber();
    if (!currentStudent) return;
    
    const allRequests = getRequests();
    const myRequests = allRequests.filter(req => req.studentNumber === currentStudent);
    
    if (myRequests.length === 0) return;
    
    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export PDF';
    exportBtn.className = 'export-btn-bottom';
    exportBtn.style.cssText = 'background:#4caf50; color:white; border:none; border-radius:30px; padding:12px 20px; margin-top:20px; width:100%; cursor:pointer; font-weight:600;';
    exportBtn.onclick = exportToPDF;
    
    container.appendChild(exportBtn);
}

// ---------- Add UI Controls (Search Bar Only) ----------
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

    if (!document.getElementById('searchInput')) {
        const searchDiv = document.createElement('div');
        searchDiv.className = 'search-bar';
        searchDiv.style.margin = '15px 0';
        searchDiv.innerHTML = '<input type="text" id="searchInput" placeholder="🔍 Search your requests..." style="width:100%; padding:12px; border-radius:30px; border:1px solid #ddd;">';
        h1.insertAdjacentElement('afterend', searchDiv);
        document.getElementById('searchInput').addEventListener('keyup', filterRequests);
        console.log('✅ Search bar added');
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

// ---------- Function to toggle image visibility ----------
function toggleImage(imageId) {
    const img = document.getElementById(imageId);
    if (img) {
        if (img.style.display === 'none') {
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    }
}

// ---------- MAIN RENDER FUNCTION (WITH IMAGE DISPLAY) ----------
function renderRequests() {
    const container = document.getElementById('requestsContainer');
    if (!container) {
        console.error('❌ Container #requestsContainer not found!');
        return;
    }

    const currentStudent = getCurrentStudentNumber();
    console.log('👤 Current student number:', currentStudent);
    
    if (!currentStudent) {
        container.innerHTML = '<div class="empty" style="text-align:center; padding:50px;"><i class="fas fa-exclamation-triangle"></i> Student number required. Please refresh and enter your number.</div>';
        return;
    }

    const allRequests = getRequests();
    console.log('📋 All requests:', allRequests);
    
    const myRequests = allRequests.filter(req => req.studentNumber === currentStudent);
    console.log(`🎯 Found ${myRequests.length} requests for student ${currentStudent}`);
    
    if (myRequests.length === 0) {
        container.innerHTML = '<div class="empty" style="text-align:center; padding:50px;"><i class="fas fa-inbox"></i> No requests found. <a href="report.html"><i class="fas fa-plus-circle"></i> Report an issue</a></div>';
        return;
    }

    container.innerHTML = '';
    myRequests.sort((a, b) => b.id - a.id).forEach(request => {
        const priorityColor = request.priority === 'High' ? '#dc3545' : (request.priority === 'Low' ? '#4caf50' : '#ff9800');
        const rating = getRating(request.id);
        const comments = getCommentsForRequest(request.id);
        
        let priorityIcon = '<i class="fas fa-minus"></i>';
        if (request.priority === 'High') priorityIcon = '<i class="fas fa-arrow-up"></i>';
        if (request.priority === 'Low') priorityIcon = '<i class="fas fa-arrow-down"></i>';
        
        let statusIcon = '<i class="fas fa-hourglass-half"></i>';
        if (request.status === 'inprogress') statusIcon = '<i class="fas fa-spinner fa-pulse"></i>';
        if (request.status === 'completed') statusIcon = '<i class="fas fa-check-circle"></i>';

        // Generate unique image ID for this request
        const imageId = `request_image_${request.id}`;
        
        // Check if there's an image
        const hasImage = request.image && request.image.length > 0;
        
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <h3><i class="fas fa-wrench"></i> ${escapeHtml(request.title)} 
                <span style="background:${priorityColor}; color:white; padding:2px 10px; border-radius:20px; font-size:10px;">${priorityIcon} ${request.priority || 'Medium'}</span>
            </h3>
            <p><i class="fas fa-door-open"></i> <strong>Room:</strong> ${escapeHtml(request.room)}</p>
            <p><i class="fas fa-tag"></i> <strong>Category:</strong> ${escapeHtml(request.category) || 'General'}</p>
            <p><i class="fas fa-align-left"></i> <strong>Description:</strong> ${escapeHtml(request.description)}</p>
            <p><i class="fas fa-calendar-alt"></i> <strong>Submitted:</strong> ${request.date}</p>
            ${hasImage ? `
                <div class="image-section" style="margin: 10px 0;">
                    <button onclick="toggleImage('${imageId}')" style="background:#af954c; color:white; border:none; border-radius:20px; padding:5px 12px; cursor:pointer; font-size:12px;">
                        <i class="fas fa-image"></i> ${document.getElementById(imageId)?.style.display !== 'none' ? 'Hide Image' : 'Show Image'}
                    </button>
                    <div id="${imageId}" style="margin-top:10px; ${hasImage && request.image ? 'display:block' : 'display:none'}">
                        <img src="${request.image}" alt="Request Image" style="max-width:100%; max-height:250px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    </div>
                </div>
            ` : ''}
            <span class="status ${request.status}">${statusIcon} ${request.status.toUpperCase()}</span>
            ${request.status === 'completed' && !rating ? `
                <div class="rating"><strong><i class="fas fa-star"></i> Rate: </strong>
                    ${[1,2,3,4,5].map(s => `<span class="star" onclick="addRating(${request.id}, ${s})" style="font-size:22px; cursor:pointer;"><i class="far fa-star"></i></span>`).join('')}
                </div>
            ` : rating ? `
                <div class="rating"><i class="fas fa-star"></i> Rating: ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>
            ` : ''}
            <div class="comments-section">
                <strong><i class="fas fa-comments"></i> Comments (${comments.length})</strong>
                ${comments.slice(-3).map(c => `<div class="comment"><strong><i class="fas ${c.userType === 'staff' ? 'fa-user-tie' : 'fa-user-graduate'}"></i> ${c.userType === 'staff' ? 'Staff' : 'Student'}:</strong> ${escapeHtml(c.comment)}<br><small><i class="far fa-clock"></i> ${c.date}</small></div>`).join('')}
                <div class="add-comment" style="display:flex; gap:8px; margin-top:10px;">
                    <input type="text" id="comment_${request.id}" placeholder="Add a comment...">
                    <button onclick="addComment(${request.id}, document.getElementById('comment_${request.id}').value, 'student')"><i class="fas fa-paper-plane"></i> Post</button>
                </div>
            </div>
            <div class="actions" style="display:flex; gap:10px; margin-top:15px;">
                ${request.status === 'pending' ? `<button class="edit-btn" onclick="editRequest(${request.id})" style="background:#2196f3; color:white; border:none; border-radius:25px; padding:10px; cursor:pointer;"><i class="fas fa-edit"></i> Edit</button>` : ''}
                <button class="delete-btn" onclick="deleteRequest(${request.id})" style="background:#dc3545; color:white; border:none; border-radius:25px; padding:10px; cursor:pointer;"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Add export button at the bottom
    addExportButtonAtBottom();
}

// ---------- Expose global functions ----------
window.addRating = addRating;
window.addComment = addComment;
window.editRequest = editRequest;
window.deleteRequest = deleteRequest;
window.exportToPDF = exportToPDF;
window.toggleImage = toggleImage;

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 my-requests.js loaded');
    initDarkMode();
    addControls();
    renderRequests();
});