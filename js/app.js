/**
 * Main Application Logic
 * Handles page initialization, screen transitions, and PWA registration
 */

class App {
    constructor() {
        this.scanner = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initDarkMode();
        this.registerServiceWorker();
        this.checkInstallPrompt();
    }
    
    setupEventListeners() {
        // Index page - scanner controls
        const startScannerBtn = document.getElementById('startScanner');
        const stopScannerBtn = document.getElementById('stopScanner');
        
        if (startScannerBtn) {
            startScannerBtn.addEventListener('click', () => this.showScanner());
        }
        
        if (stopScannerBtn) {
            stopScannerBtn.addEventListener('click', () => this.hideScanner());
        }
        
        // Tour page - modal scanner
        const scanNextBtn = document.getElementById('scanNextBtn');
        if (scanNextBtn) {
            scanNextBtn.addEventListener('click', () => this.showScanner());
        }
        
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
    }
    
    initDarkMode() {
        // Check localStorage for saved preference
        const savedMode = localStorage.getItem('darkMode');
        
        if (savedMode === 'enabled') {
            document.body.classList.add('dark-mode');
            this.updateDarkModeIcon(true);
        } else {
            document.body.classList.remove('dark-mode');
            this.updateDarkModeIcon(false);
        }
    }
    
    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        
        // Save preference
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        
        // Update icon
        this.updateDarkModeIcon(isDark);
        
        // Update theme-color meta tag
        const themeColor = isDark ? '#16213e' : '#1a5f7a';
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    }
    
    updateDarkModeIcon(isDark) {
        const icon = document.querySelector('.dark-mode-toggle .toggle-icon');
        if (icon) {
            // Ensure MDI classes are toggled rather than inserting text
            icon.classList.remove('mdi-weather-night', 'mdi-white-balance-sunny');
            icon.classList.add(isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night');
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
    
    async showScanner() {
        // Open modal scanner if available, otherwise fallback to scanner section
        const modal = document.getElementById('modalScanner');
        if (modal) {
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            const readerId = 'modalQrReader';
            if (!this.scanner) {
                this.scanner = new QRScanner(readerId, {
                    onScanSuccess: (text, result) => {
                        this.handleScanResult(text, result);
                        this.hideScanner();
                    }
                });
            } else if (this.scanner.scanner && this.scanner.scanner.clear) {
                // if previously used with different element, recreate
                await this.scanner.stop();
                this.scanner = new QRScanner(readerId, {
                    onScanSuccess: (text, result) => {
                        this.handleScanResult(text, result);
                        this.hideScanner();
                    }
                });
            }

            // start scanner
            await this.scanner.start();

            // hook modal close buttons
            document.getElementById('modalClose')?.addEventListener('click', () => this.hideScanner());
            document.getElementById('modalCancel')?.addEventListener('click', () => this.hideScanner());
            document.getElementById('modalBackdrop')?.addEventListener('click', () => this.hideScanner());
            return;
        }

        // fallback to in-page scanner
        this.showScreen('scanner');
        
        if (!this.scanner) {
            this.scanner = new QRScanner('qr-reader', {
                onScanSuccess: (text, result) => this.handleScanResult(text, result)
            });
        }
        
        await this.scanner.start();
    }
    
    async hideScanner() {
        // Close modal if present
        const modal = document.getElementById('modalScanner');
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        if (this.scanner) {
            await this.scanner.stop();
            this.scanner = null;
        }

        // fallback: show welcome screen (if using in-page scanner)
        this.showScreen('welcome');
    }
    
    async toggleInlineScanner() {
        const readerEl = document.getElementById('inlineQrReader');
        const btn = document.getElementById('scanNextBtn');
        
        if (!readerEl) return;
        
        if (readerEl.style.display === 'none') {
            readerEl.style.display = 'block';
            btn.querySelector('.btn-text').textContent = 'Scanner sluiten';
            
            if (!this.inlineScanner) {
                this.inlineScanner = new QRScanner('inlineQrReader', {
                    onScanSuccess: (text, result) => this.handleScanResult(text, result)
                });
            }
            
            await this.inlineScanner.start();
        } else {
            readerEl.style.display = 'none';
            btn.querySelector('.btn-text').textContent = 'Scan volgende QR-code';
            
            if (this.inlineScanner) {
                await this.inlineScanner.stop();
            }
        }
    }
    
    handleScanResult(decodedText, decodedResult) {
        console.log('Scanned:', decodedText);
        
        // Try to parse the URL or code
        let url = decodedText;
        
        // If it's a simple tour code like "A" or "A/3"
        const simpleMatch = decodedText.match(/^([AB])(?:\/(\d+))?$/i);
        if (simpleMatch) {
            const tour = simpleMatch[1].toUpperCase();
            const track = simpleMatch[2] || 1;
            url = `tour.html?tour=${tour}&track=${track}&autoplay=1`;
        }
        
        // If it's a relative URL
        if (!url.startsWith('http') && url.includes('tour')) {
            window.location.href = url;
            return;
        }
        
        // If it's a full URL
        try {
            const parsed = new URL(url);
            if (parsed.searchParams.has('tour') || parsed.pathname.includes('tour')) {
                window.location.href = url;
                return;
            }
        } catch {
            // Not a valid URL
        }
        
        // Invalid QR code
        alert('Deze QR-code hoort niet bij de audiotour. Probeer een andere QR-code.');
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
    
    showUpdateAvailable() {
        // Could show a toast or banner asking user to refresh
        console.log('New version available!');
    }
    
    checkInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button/prompt if desired
            this.showInstallPrompt(deferredPrompt);
        });
    }
    
    showInstallPrompt(deferredPrompt) {
        // Create install prompt UI if it doesn't exist
        let prompt = document.querySelector('.install-prompt');
        
        if (!prompt) {
            prompt = document.createElement('div');
            prompt.className = 'install-prompt';
            prompt.innerHTML = `
                <p>Installeer de app voor offline toegang</p>
                <button class="btn btn-primary" id="installBtn">Installeren</button>
                <button class="btn btn-secondary" id="dismissInstall">Later</button>
            `;
            document.body.appendChild(prompt);
        }
        
        // Check if user hasn't dismissed recently
        const dismissed = localStorage.getItem('installDismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 86400000) {
            return; // Don't show for 24 hours after dismissal
        }
        
        prompt.classList.add('show');
        
        document.getElementById('installBtn')?.addEventListener('click', async () => {
            prompt.classList.remove('show');
            deferredPrompt.prompt();
            
            const { outcome } = await deferredPrompt.userChoice;
            console.log('Install outcome:', outcome);
            deferredPrompt = null;
        });
        
        document.getElementById('dismissInstall')?.addEventListener('click', () => {
            prompt.classList.remove('show');
            localStorage.setItem('installDismissed', Date.now().toString());
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
