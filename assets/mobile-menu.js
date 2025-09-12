// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create hamburger menu button
    function createMobileMenu() {
        const nav = document.querySelector('.navigation-wrapper');
        const primaryNav = document.querySelector('.primary-navigation');
        
        if (!nav || !primaryNav) return;
        
        // Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.className = 'mobile-menu-toggle';
        hamburger.setAttribute('aria-label', 'Toggle mobile menu');
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        // Insert hamburger button before wallet interface
        const walletInterface = document.querySelector('.wallet-interface');
        if (walletInterface) {
            nav.insertBefore(hamburger, walletInterface);
        } else {
            nav.appendChild(hamburger);
        }
        
        // Toggle menu functionality
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            hamburger.classList.toggle('active');
            primaryNav.classList.toggle('mobile-menu-open');
            document.body.classList.toggle('mobile-menu-open');
            
            // Prevent body scrolling when menu is open
            if (primaryNav.classList.contains('mobile-menu-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking on navigation links
        const navLinks = primaryNav.querySelectorAll('.navigation-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                primaryNav.classList.remove('mobile-menu-open');
                document.body.classList.remove('mobile-menu-open');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && primaryNav.classList.contains('mobile-menu-open')) {
                hamburger.classList.remove('active');
                primaryNav.classList.remove('mobile-menu-open');
                document.body.classList.remove('mobile-menu-open');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 1000) {
                hamburger.classList.remove('active');
                primaryNav.classList.remove('mobile-menu-open');
                document.body.classList.remove('mobile-menu-open');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Initialize mobile menu
    createMobileMenu();
    
    // Ensure proper mobile viewport handling
    function setMobileViewport() {
        // Add viewport meta tag if it doesn't exist
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
    
    setMobileViewport();
    
    // Fix iOS viewport issues
    function fixiOSViewport() {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const viewportHeight = window.innerHeight;
            document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
            
            window.addEventListener('resize', function() {
                const newViewportHeight = window.innerHeight;
                document.documentElement.style.setProperty('--viewport-height', `${newViewportHeight}px`);
            });
        }
    }
    
    fixiOSViewport();
});