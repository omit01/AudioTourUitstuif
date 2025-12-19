/**
 * QR Code Scanner
 * Handles camera-based QR code scanning using html5-qrcode library
 */

class QRScanner {
    constructor(elementId, options = {}) {
        this.elementId = elementId;
        this.scanner = null;
        this.isScanning = false;
        
        this.options = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            ...options
        };
        
        this.onScanSuccess = options.onScanSuccess || this.defaultOnSuccess.bind(this);
        this.onScanError = options.onScanError || this.defaultOnError.bind(this);
    }
    
    async start() {
        if (this.isScanning) return;
        
        const element = document.getElementById(this.elementId);
        if (!element) {
            console.error(`Element #${this.elementId} not found`);
            return;
        }
        
        try {
            // Check if html5QrcodeScanner is available
            if (typeof Html5Qrcode === 'undefined') {
                throw new Error('html5-qrcode library not loaded');
            }
            
            this.scanner = new Html5Qrcode(this.elementId);
            
            await this.scanner.start(
                { facingMode: "environment" }, // Use back camera
                {
                    fps: this.options.fps,
                    qrbox: this.options.qrbox,
                    aspectRatio: this.options.aspectRatio
                },
                this.onScanSuccess,
                this.onScanError
            );
            
            this.isScanning = true;
            console.log('QR Scanner started');
            
        } catch (error) {
            console.error('Failed to start QR scanner:', error);
            this.handleStartError(error);
        }
    }
    
    async stop() {
        if (!this.isScanning || !this.scanner) return;
        
        try {
            await this.scanner.stop();
            this.scanner.clear();
            this.isScanning = false;
            console.log('QR Scanner stopped');
        } catch (error) {
            console.error('Error stopping scanner:', error);
        }
    }
    
    defaultOnSuccess(decodedText, decodedResult) {
        console.log('QR Code scanned:', decodedText);
        
        // Stop scanning after successful read
        this.stop();
        
        // Check if it's a valid URL for this site
        if (this.isValidTourUrl(decodedText)) {
            window.location.href = decodedText;
        } else {
            // Try to parse as tour code (e.g., "A" or "B/3")
            const tourMatch = decodedText.match(/^([AB])(?:\/(\d+))?$/i);
            if (tourMatch) {
                const tour = tourMatch[1].toUpperCase();
                const track = tourMatch[2] || 1;
                window.location.href = `tour.html?tour=${tour}&track=${track}&autoplay=1`;
            } else {
                alert('Ongeldige QR-code. Probeer opnieuw.');
                this.start(); // Restart scanning
            }
        }
    }
    
    defaultOnError(errorMessage) {
        // Silent errors during scanning are normal (no QR found in frame)
        // Only log actual errors
        if (!errorMessage.includes('No QR code found')) {
            console.warn('QR scan error:', errorMessage);
        }
    }
    
    isValidTourUrl(url) {
        try {
            const parsed = new URL(url);
            // Check if URL contains tour.html or tour parameter
            return parsed.pathname.includes('tour') || 
                   parsed.searchParams.has('tour');
        } catch {
            return false;
        }
    }
    
    handleStartError(error) {
        let message = 'Kan QR-scanner niet starten.';
        
        if (error.name === 'NotAllowedError') {
            message = 'Camera toegang geweigerd. Geef toestemming in je browser instellingen.';
        } else if (error.name === 'NotFoundError') {
            message = 'Geen camera gevonden op dit apparaat.';
        } else if (error.name === 'NotReadableError') {
            message = 'Camera is in gebruik door een andere app.';
        } else if (error.name === 'OverconstrainedError') {
            message = 'Geen geschikte camera beschikbaar.';
        }
        
        alert(message);
    }
}

// Export for use in other scripts
window.QRScanner = QRScanner;
