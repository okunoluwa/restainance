// report.js
// Complete working version for student maintenance report submission

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    // Get all form elements by their IDs
    const form = document.getElementById('reportForm');
    const titleInput = document.getElementById('title');
    const categorySelect = document.getElementById('category');
    const roomNumberInput = document.getElementById('roomNumber');
    const studentNumberInput = document.getElementById('studentNumber');
    const descriptionTextarea = document.getElementById('description');
    const imageInput = document.getElementById('image');
    const submitBtn = document.getElementById('submitBtn');
    
    // Check if all form elements exist
    if (!form) {
        console.error('❌ Form with id="reportForm" not found!');
        return;
    }
    
    if (!titleInput) {
        console.error('❌ Input with id="title" not found!');
        alert('Form error: Title field missing. Please check the HTML.');
        return;
    }
    
    if (!categorySelect) {
        console.error('❌ Select with id="category" not found!');
        alert('Form error: Category field missing. Please check the HTML.');
        return;
    }
    
    if (!roomNumberInput) {
        console.error('❌ Input with id="roomNumber" not found!');
        alert('Form error: Room Number field missing. Please check the HTML.');
        return;
    }
    
    if (!studentNumberInput) {
        console.error('❌ Input with id="studentNumber" not found!');
        alert('Form error: Student Number field missing. Please check the HTML.');
        return;
    }
    
    if (!descriptionTextarea) {
        console.error('❌ Textarea with id="description" not found!');
        alert('Form error: Description field missing. Please check the HTML.');
        return;
    }
    
    console.log('✅ All form elements found successfully!');
    
    // Check for stored student number
    let currentStudentNumber = sessionStorage.getItem('reportStudentNumber');
    
    if (!currentStudentNumber) {
        // Ask for student number if not already stored
        currentStudentNumber = prompt('Please enter your student number to report an issue:');
        
        if (currentStudentNumber) {
            currentStudentNumber = currentStudentNumber.trim();
            if (currentStudentNumber === "") {
                alert('Student number cannot be empty. Please refresh and try again.');
                return;
            }
            // Store for this session
            sessionStorage.setItem('reportStudentNumber', currentStudentNumber);
        } else {
            alert('Student number is required to report an issue.');
            return;
        }
    }
    
    // Auto-fill the student number field and make it read-only
    studentNumberInput.value = currentStudentNumber;
    studentNumberInput.readOnly = true;
    studentNumberInput.style.backgroundColor = '#f0f0f0';
    studentNumberInput.style.cursor = 'not-allowed';
    
    // Add a helpful message at the top showing who is reporting
    const mainContainer = document.querySelector('.main');
    if (mainContainer && !document.querySelector('.user-info-banner')) {
        const userBanner = document.createElement('div');
        userBanner.className = 'user-info-banner';
        userBanner.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <i class="fas fa-user-graduate"></i> <strong>Reporting as Student:</strong> ${escapeHtml(currentStudentNumber)}
                </div>
                <div>
                    <a href="my-requests.html" style="color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 5px;"><i class="fas fa-arrow-left"></i> View My Requests</a>
                </div>
            </div>
        `;
        const formElement = document.querySelector('#reportForm');
        if (formElement) {
            mainContainer.insertBefore(userBanner, formElement);
        }
    }
    
    // Helper function to escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get values from form fields
        const title = titleInput.value.trim();
        const category = categorySelect.value;
        const roomNumber = roomNumberInput.value.trim();
        const studentNumber = studentNumberInput.value.trim();
        const description = descriptionTextarea.value.trim();
        const imageFile = imageInput.files[0];
        
        console.log('Form submission started...');
        console.log('Title:', title);
        console.log('Category:', category);
        console.log('Room Number:', roomNumber);
        console.log('Student Number:', studentNumber);
        console.log('Description:', description);
        console.log('Image file:', imageFile ? imageFile.name : 'No image');
        
        // VALIDATION - Check each field
        if (title === "") {
            alert('Please enter an issue title.');
            titleInput.focus();
            return;
        }
        
        if (title.length < 3) {
            alert('Issue title must be at least 3 characters long.');
            titleInput.focus();
            return;
        }
        
        if (category === "" || category === "-- Select Category --") {
            alert('Please select a category.');
            categorySelect.focus();
            return;
        }
        
        if (roomNumber === "") {
            alert('Please enter your room number.');
            roomNumberInput.focus();
            return;
        }
        
        if (studentNumber === "") {
            alert('Student number is missing. Please refresh the page.');
            return;
        }
        
        if (description === "") {
            alert('Please describe the issue.');
            descriptionTextarea.focus();
            return;
        }
        
        if (description.length < 10) {
            alert('Please provide more details (at least 10 characters).');
            descriptionTextarea.focus();
            return;
        }
        
        // Create the request object
        const newRequest = {
            id: Date.now(),
            title: title,
            category: category,
            room: roomNumber,
            roomNumber: roomNumber,
            studentNumber: studentNumber,
            studentName: `Student ${studentNumber}`,
            description: description,
            status: 'pending',
            date: new Date().toLocaleString(),
            dateSubmitted: new Date().toISOString(),
            timestamp: Date.now(),
            image: null
        };
        
        // Function to save request to localStorage
        function saveRequestToLocalStorage(request) {
            try {
                // Get existing requests
                let existingRequests = [];
                const storedData = localStorage.getItem('requests');
                
                if (storedData) {
                    existingRequests = JSON.parse(storedData);
                    console.log('Found existing requests:', existingRequests.length);
                }
                
                // Add new request
                existingRequests.push(request);
                
                // Save back to localStorage
                localStorage.setItem('requests', JSON.stringify(existingRequests));
                
                console.log('✅ Request saved successfully!');
                console.log('Total requests now:', existingRequests.length);
                console.log('Saved request:', request);
                
                return true;
            } catch (error) {
                console.error('❌ Error saving request:', error);
                return false;
            }
        }
        
        // Handle image if uploaded
        if (imageFile) {
            // Check file size (max 2MB)
            if (imageFile.size > 2 * 1024 * 1024) {
                alert('Image size must be less than 2MB. Please choose a smaller image.');
                return;
            }
            
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(imageFile.type)) {
                alert('Please upload a valid image file (JPG, PNG, GIF, or WEBP).');
                return;
            }
            
            // Disable submit button while processing
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Uploading image...';
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                newRequest.image = event.target.result;
                newRequest.imageName = imageFile.name;
                newRequest.imageType = imageFile.type;
                
                const saved = saveRequestToLocalStorage(newRequest);
                
                if (saved) {
                    alert('Request submitted successfully with image!');
                    form.reset();
                    // Restore student number after reset
                    studentNumberInput.value = currentStudentNumber;
                    studentNumberInput.readOnly = true;
                } else {
                    alert('Failed to save request. Please try again.');
                }
                
                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
                }
            };
            
            reader.onerror = function() {
                alert('<i class="fas fa-times-circle"></i> Error reading image file. Please try again.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
                }
            };
            
            reader.readAsDataURL(imageFile);
            
        } else {
            // No image, save directly
            const saved = saveRequestToLocalStorage(newRequest);
            
            if (saved) {
                alert('Request submitted successfully!');
                form.reset();
                // Restore student number after reset
                studentNumberInput.value = currentStudentNumber;
                studentNumberInput.readOnly = true;
            } else {
                alert(' Failed to save request. Please try again.');
            }
        }
    });
    
    console.log('✅ report.js loaded and ready!');
});