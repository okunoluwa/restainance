// ============================================
// MAIN.JS - Dark Mode & Hamburger Menu for Landing Page
// Dark mode button is inside navigation (desktop) and inside hamburger menu (mobile)
// Does NOT affect your original CSS or HTML structure
// ============================================

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== DARK MODE FUNCTIONALITY ==========
    
    // Function to apply dark mode
    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', isDark);
        
        // Update all dark mode toggle buttons if they exist
        updateAllDarkModeButtons(isDark);
    }
    
    // Update all dark mode toggle buttons
    function updateAllDarkModeButtons(isDark) {
        const allDarkModeBtns = document.querySelectorAll('.dark-mode-nav-btn');
        allDarkModeBtns.forEach(function(btn) {
            if (isDark) {
                btn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            } else {
                btn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            }
        });
    }
    
    // Toggle dark mode
    function toggleDarkMode() {
        const isDark = !document.body.classList.contains('dark-mode');
        setDarkMode(isDark);
    }
    
    // ========== ADD DARK MODE BUTTON TO NAVIGATION (DESKTOP) ==========
    
    function addDarkModeToNavbar() {
        // Check if dark mode button already exists in nav-links
        if (document.querySelector('.dark-mode-nav-btn')) return;
        
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;
        
        // Create dark mode list item
        const darkModeListItem = document.createElement('li');
        const darkModeLink = document.createElement('a');
        darkModeLink.href = '#';
        darkModeLink.className = 'dark-mode-nav-btn';
        
        // Set initial icon based on current mode
        const isDarkMode = document.body.classList.contains('dark-mode');
        darkModeLink.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
        
        // Add click event
        darkModeLink.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDarkMode();
        });
        
        darkModeListItem.appendChild(darkModeLink);
        navLinks.appendChild(darkModeListItem);
    }
    
    // ========== HAMBURGER MENU FUNCTIONALITY ==========
    
    function setupHamburgerMenu() {
        // Get the navbar and nav-links elements
        const navbar = document.querySelector('.navbar');
        const navLinks = document.querySelector('.nav-links');
        
        // Check if hamburger button already exists
        if (document.querySelector('.hamburger')) return;
        
        // Create hamburger button
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'hamburger';
        hamburgerBtn.innerHTML = '☰';
        hamburgerBtn.setAttribute('aria-label', 'Menu');
        
        // Insert hamburger button after the logo
        const logo = document.querySelector('.logo');
        if (logo && navbar) {
            navbar.insertBefore(hamburgerBtn, logo.nextSibling);
        } else if (navbar) {
            navbar.appendChild(hamburgerBtn);
        }
        
        // Function to add dark mode option inside mobile menu (only visible on mobile)
        function addDarkModeToMobileMenu() {
            // Check if dark mode item already exists in nav-links for mobile
            if (document.querySelector('.mobile-dark-mode-item')) return;
            
            const navLinksList = document.querySelector('.nav-links');
            if (!navLinksList) return;
            
            // Create dark mode menu item for mobile
            const darkModeListItem = document.createElement('li');
            darkModeListItem.className = 'mobile-dark-mode-item';
            
            const darkModeLink = document.createElement('a');
            darkModeLink.href = '#';
            darkModeLink.className = 'dark-mode-nav-btn';
            
            // Set icon based on current mode
            const isDarkMode = document.body.classList.contains('dark-mode');
            darkModeLink.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
            
            // Add click event
            darkModeLink.addEventListener('click', function(e) {
                e.preventDefault();
                toggleDarkMode();
                // Close the mobile menu after clicking
                navLinksList.classList.remove('active');
            });
            
            darkModeListItem.appendChild(darkModeLink);
            navLinksList.appendChild(darkModeListItem);
        }
        
        // Add click event to toggle menu
        if (hamburgerBtn && navLinks) {
            hamburgerBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navLinks.classList.toggle('active');
                // Add dark mode option to mobile menu when it opens (only on mobile)
                if (window.innerWidth <= 768) {
                    addDarkModeToMobileMenu();
                }
            });
            
            // Close menu when clicking on regular links
            const links = navLinks.querySelectorAll('a:not(.dark-mode-nav-btn)');
            links.forEach(function(link) {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        navLinks.classList.remove('active');
                    }
                });
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                if (navbar && !navbar.contains(event.target)) {
                    if (window.innerWidth <= 768) {
                        navLinks.classList.remove('active');
                    }
                }
            });
        }
        
        // Handle window resize - reset menu state
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                // On desktop, ensure mobile menu is closed
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
            }
        });
    }
    
    // ========== ADD DARK MODE STYLES FOR NAVIGATION ITEMS ==========
    
    function addDarkModeNavStyles() {
        if (!document.querySelector('#darkModeNavStyles')) {
            const style = document.createElement('style');
            style.id = 'darkModeNavStyles';
            style.textContent = `
                /* Dark mode button in navigation */
                .dark-mode-nav-btn {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                /* Mobile dark mode item - visible only on mobile */
                .mobile-dark-mode-item {
                    display: none;
                }
                
                /* Hide desktop dark mode button on mobile, show in hamburger */
                @media (max-width: 768px) {
                    .nav-links li:has(.dark-mode-nav-btn) {
                        display: none;
                    }
                    .mobile-dark-mode-item {
                        display: block !important;
                        border-top: 1px solid rgba(0,0,0,0.1);
                        margin-top: 10px;
                        padding-top: 10px;
                    }
                    body.dark-mode .mobile-dark-mode-item {
                        border-top-color: rgba(255,255,255,0.1);
                    }
                }
                
                /* Desktop - hide mobile dark mode item */
                @media (min-width: 769px) {
                    .mobile-dark-mode-item {
                        display: none !important;
                    }
                    .nav-links li:has(.dark-mode-nav-btn) {
                        display: inline-block;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    function fixNavbarStructure() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
    }
    
    function ensureViewportMeta() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
            document.head.appendChild(viewportMeta);
        }
    }
    
    function setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // ========== APPLY SAVED DARK MODE ON LOAD ==========
    
    function applySavedDarkMode() {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        } else if (savedDarkMode === 'false') {
            document.body.classList.remove('dark-mode');
        }
    }
    
    // ========== SYNC DARK MODE BUTTONS ==========
    
    function syncDarkModeButtons() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        updateAllDarkModeButtons(isDarkMode);
    }
    
    function observeDarkModeChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const isDarkMode = document.body.classList.contains('dark-mode');
                    updateAllDarkModeButtons(isDarkMode);
                }
            });
        });
        observer.observe(document.body, { attributes: true });
    }
    
    // ========== INITIALIZE ALL FUNCTIONS ==========
    
    function init() {
        ensureViewportMeta();
        fixNavbarStructure();
        addDarkModeNavStyles();
        applySavedDarkMode();
        addDarkModeToNavbar();      // Adds dark mode button to navigation bar (desktop)
        setupHamburgerMenu();       // Adds hamburger menu with dark mode inside (mobile)
        setupSmoothScroll();
        syncDarkModeButtons();
        observeDarkModeChanges();
        
        console.log('Main.js loaded - Dark mode button in navigation!');
        console.log('- Desktop: Dark mode button in navigation bar');
        console.log('- Mobile: Dark mode option inside hamburger menu');
    }
    
    // Start everything
    init();
});