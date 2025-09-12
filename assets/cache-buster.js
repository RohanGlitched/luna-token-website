/**
 * Luna Launch Cache Buster
 * Forces browser to reload fresh content when needed
 */

class LunaCacheBuster {
    constructor() {
        this.version = '20250130-003';
        this.init();
    }

    init() {
        // Check if we need to clear cache for updates
        this.checkForUpdates();
        
        // Add version info for debugging
        console.log(`Luna Launch Cache Version: ${this.version}`);
        
        // Force reload of live chat if version mismatch
        this.ensureLiveChatFresh();
    }

    checkForUpdates() {
        const lastVersion = localStorage.getItem('luna_cache_version');
        
        if (!lastVersion || lastVersion !== this.version) {
            console.log('New version detected, clearing cache...');
            this.clearBrowserCache();
            localStorage.setItem('luna_cache_version', this.version);
        }
    }

    clearBrowserCache() {
        try {
            // Clear localStorage for chat
            localStorage.removeItem('luna_chat_messages');
            
            // Clear service worker cache if available
            if ('serviceWorker' in navigator && 'caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                        if (cacheName.includes('luna')) {
                            caches.delete(cacheName);
                            console.log(`Cleared cache: ${cacheName}`);
                        }
                    });
                });
            }

            // Force reload stylesheets
            this.reloadStylesheets();
            
        } catch (e) {
            console.warn('Cache clearing failed:', e);
        }
    }

    reloadStylesheets() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(link => {
            if (link.href.includes('live-chat') || link.href.includes('?v=')) {
                const href = link.href;
                const newHref = href.includes('?') 
                    ? href.split('?')[0] + `?v=${this.version}&t=${Date.now()}`
                    : href + `?v=${this.version}&t=${Date.now()}`;
                
                // Create new link element
                const newLink = link.cloneNode();
                newLink.href = newHref;
                newLink.onload = () => link.remove();
                link.parentNode.insertBefore(newLink, link.nextSibling);
            }
        });
    }

    ensureLiveChatFresh() {
        // Ensure live chat assets are fresh
        const chatCSS = document.querySelector('link[href*="live-chat.css"]');
        const chatJS = document.querySelector('script[src*="live-chat.js"]');
        
        if (chatCSS && !chatCSS.href.includes(`v=${this.version}`)) {
            console.log('Updating live chat CSS...');
            chatCSS.href = chatCSS.href.split('?')[0] + `?v=${this.version}`;
        }
        
        if (chatJS && !chatJS.src.includes(`v=${this.version}`)) {
            console.log('Live chat JS needs refresh on next page load');
        }
    }

    // Manual cache clear function for debugging
    forceClear() {
        console.log('Force clearing all caches...');
        this.clearBrowserCache();
        
        // Reload page after clearing
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.lunaCacheBuster = new LunaCacheBuster();
});

// Add manual clear function to window for debugging
window.clearLunaCache = () => {
    if (window.lunaCacheBuster) {
        window.lunaCacheBuster.forceClear();
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LunaCacheBuster;
}