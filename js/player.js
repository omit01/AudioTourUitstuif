/**
 * Audio Player Controller
 * Handles all audio playback, controls, and progress tracking
 */

class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.isPlaying = false;
        this.currentTour = null;
        this.currentTrack = 1;
        this.tracks = [];
        
        // DOM elements
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.playPauseLabel = document.getElementById('playPauseLabel');
        this.stopBtn = document.getElementById('stopBtn');
        this.replayBtn = document.getElementById('replayBtn');
        this.progressFill = document.getElementById('progressFill');
        this.progressSlider = document.getElementById('progressSlider');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.trackTitle = document.getElementById('trackTitle');
        this.trackDescription = document.getElementById('trackDescription');
        this.trackIcon = document.getElementById('trackIcon');
        this.tourTitle = document.getElementById('tourTitle');
        this.statusMessage = document.getElementById('statusMessage');
        this.trackNav = document.getElementById('trackNav');
        this.trackCounter = document.getElementById('trackCounter');
        this.prevTrackBtn = document.getElementById('prevTrack');
        this.nextTrackBtn = document.getElementById('nextTrack');
        
        this.init();
    }
    
    init() {
        if (!this.audio) return;
        
        this.bindEvents();
        this.parseUrlParams();
    }
    
    bindEvents() {
        // Play/Pause button
        this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
        
        // Stop button
        this.stopBtn?.addEventListener('click', () => this.stop());
        
        // Replay button
        this.replayBtn?.addEventListener('click', () => this.replay());
        
        // Progress slider
        this.progressSlider?.addEventListener('input', (e) => this.seekTo(e.target.value));
        
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('error', (e) => this.onError(e));
        this.audio.addEventListener('waiting', () => this.showStatus('Laden...', 'info'));
        this.audio.addEventListener('canplay', () => this.hideStatus());
        
        // Track navigation
        this.prevTrackBtn?.addEventListener('click', () => this.previousTrack());
        this.nextTrackBtn?.addEventListener('click', () => this.nextTrack());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const tour = params.get('tour');
        const track = parseInt(params.get('track')) || 1;
        const autoplay = params.get('autoplay') === '1';
        
        if (tour) {
            this.loadTour(tour, track, autoplay);
        }
    }
    
    /**
     * Tour data configuration
     * Customize this object with your actual tour information
     */
    getTourData() {
        return {
            'A': {
            name: 'Scouting Impeesa',
            icon: '⚜️',
            tracks: [
                { id: 1, title: 'Naam', description: 'Introductie van de audiotour en de betekenis van Scouting Impeesa in Amersfoort.', file: 'assets/audio/tourA/track01.mp3' },
                { id: 2, title: 'Troephuizen', description: 'Een kijkje in de troephuizen: het hart van de groep en de plek waar scouts samenkomen.', file: 'assets/audio/tourA/track02.mp3' },
                { id: 3, title: 'Das', description: 'Het verhaal achter de das en waarom deze zo belangrijk is binnen Scouting Impeesa.', file: 'assets/audio/tourA/track03.mp3' },
                { id: 4, title: 'Keukens bouwen', description: 'Hoe scouts samen keukens bouwen en wat dit betekent voor samenwerking en traditie.', file: 'assets/audio/tourA/track04.mp3' },
                { id: 5, title: 'Yakar draaien', description: 'De traditie van het Yakar draaien en andere bijzondere gebruiken binnen de groep.', file: 'assets/audio/tourA/track05.mp3' },
                { id: 6, title: 'Corona', description: 'De impact van corona op Scouting Impeesa en hoe de groep hiermee omging.', file: 'assets/audio/tourA/track06.mp3' }
            ]
            },
            'B': {
            name: 'Roaring Twenties',
            icon: '🎷',
            tracks: [
                { id: 1, title: 'Auto', description: 'De opkomst van de auto in de jaren 20 van de 19e eeuw en de impact op mobiliteit en samenleving.', file: 'assets/audio/tourB/track01.mp3' },
                { id: 2, title: 'Vliegen', description: 'De eerste stappen in de luchtvaart en hoe vliegen het wereldbeeld veranderde in de jaren 20.', file: 'assets/audio/tourB/track02.mp3' },
                { id: 3, title: 'Geluidsfilm en radio', description: 'De introductie van geluidsfilm en radio als nieuwe media in de jaren 20.', file: 'assets/audio/tourB/track03.mp3' },
                { id: 4, title: 'Radio Kootwijk', description: 'Het verhaal van Radio Kootwijk als technisch hoogstandje en communicatiecentrum in de jaren 20.', file: 'assets/audio/tourB/track04.mp3' },
                { id: 5, title: 'Tuschinski', description: 'De bouw van Theater Tuschinski en de culturele bloei in de jaren 20.', file: 'assets/audio/tourB/track05.mp3' },
                { id: 6, title: 'Cultuur en armoede', description: 'De tegenstelling tussen culturele bloei en armoede in de samenleving van de jaren 20.', file: 'assets/audio/tourB/track06.mp3' },
                { id: 7, title: 'Beurskrach', description: 'De gevolgen van de beurskrach van 1929 voor Nederland en de wereld.', file: 'assets/audio/tourB/track07.mp3' },
                { id: 8, title: 'Einde tour', description: 'Afsluiting van de audiotour en een terugblik op de hoogtepunten van de jaren 20 van de 19e eeuw.', file: 'assets/audio/tourB/track08.mp3' }
            ]
            }
        };
    }
    
    loadTour(tourId, trackNum = 1, autoplay = false) {
        const tourData = this.getTourData();
        const tour = tourData[tourId.toUpperCase()];
        
        if (!tour) {
            this.showStatus('Tour niet gevonden', 'error');
            return;
        }
        
        this.currentTour = tour;
        this.tracks = tour.tracks;
        this.currentTrack = Math.min(Math.max(1, trackNum), this.tracks.length);
        
        // Update UI
        if (this.tourTitle) {
            this.tourTitle.textContent = tour.name;
        }
        
        // Show track navigation if multiple tracks
        if (this.tracks.length > 1 && this.trackNav) {
            this.trackNav.style.display = 'flex';
        }
        
        this.loadTrack(this.currentTrack, autoplay);
    }
    
    loadTrack(trackNum, autoplay = false) {
        const track = this.tracks.find(t => t.id === trackNum);
        
        if (!track) {
            this.showStatus('Track niet gevonden', 'error');
            return;
        }
        
        this.currentTrack = trackNum;
        
        // Update track info
        if (this.trackTitle) this.trackTitle.textContent = track.title;
        if (this.trackDescription) this.trackDescription.textContent = track.description;
        if (this.trackIcon && this.currentTour) this.trackIcon.textContent = this.currentTour.icon;
        
        // Update track counter
        if (this.trackCounter) {
            this.trackCounter.textContent = `${trackNum} / ${this.tracks.length}`;
        }
        
        // Update navigation buttons
        this.updateNavButtons();
        
        // Load audio
        this.audio.src = track.file;
        this.audio.load();
        
        // Reset progress
        this.updateProgressUI(0, 0);
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('track', trackNum);
        window.history.replaceState({}, '', url);
        
        if (autoplay) {
            // Slight delay to ensure audio is ready
            setTimeout(() => this.play(), 100);
        }
    }
    
    updateNavButtons() {
        if (this.prevTrackBtn) {
            this.prevTrackBtn.disabled = this.currentTrack <= 1;
        }
        if (this.nextTrackBtn) {
            this.nextTrackBtn.disabled = this.currentTrack >= this.tracks.length;
        }
    }
    
    play() {
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayPauseButton();
                })
                .catch(error => {
                    console.log('Autoplay prevented:', error);
                    this.showStatus('Tik op Afspelen om te starten', 'info');
                });
        }
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayPauseButton();
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.updateProgressUI(0, this.audio.duration || 0);
    }
    
    replay() {
        this.audio.currentTime = 0;
        this.play();
    }
    
    seekTo(percentage) {
        if (this.audio.duration) {
            const time = (percentage / 100) * this.audio.duration;
            this.audio.currentTime = time;
        }
    }
    
    previousTrack() {
        if (this.currentTrack > 1) {
            this.loadTrack(this.currentTrack - 1, this.isPlaying);
        }
    }
    
    nextTrack() {
        if (this.currentTrack < this.tracks.length) {
            this.loadTrack(this.currentTrack + 1, this.isPlaying);
        }
    }
    
    updatePlayPauseButton() {
        if (this.playPauseIcon) {
            this.playPauseIcon.textContent = this.isPlaying ? '⏸' : '▶';
        }
        if (this.playPauseLabel) {
            this.playPauseLabel.textContent = this.isPlaying ? 'Pauze' : 'Afspelen';
        }
        if (this.playPauseBtn) {
            this.playPauseBtn.classList.toggle('playing', this.isPlaying);
            this.playPauseBtn.setAttribute('aria-label', this.isPlaying ? 'Pauze' : 'Afspelen');
        }
    }
    
    updateProgress() {
        const { currentTime, duration } = this.audio;
        if (duration) {
            this.updateProgressUI(currentTime, duration);
        }
    }
    
    updateProgressUI(currentTime, duration) {
        const percentage = duration ? (currentTime / duration) * 100 : 0;
        
        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }
        if (this.progressSlider) {
            this.progressSlider.value = percentage;
        }
        if (this.currentTimeEl) {
            this.currentTimeEl.textContent = this.formatTime(currentTime);
        }
        if (this.durationEl) {
            this.durationEl.textContent = this.formatTime(duration);
        }
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    onMetadataLoaded() {
        this.updateProgressUI(0, this.audio.duration);
    }
    
    onEnded() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        
        // Auto-advance to next track if available
        if (this.currentTrack < this.tracks.length) {
            this.showStatus('Volgende track wordt geladen...', 'info');
            setTimeout(() => {
                this.nextTrack();
            }, 1500);
        } else {
            this.showStatus('Tour voltooid! 🎉', 'success');
        }
    }
    
    onError(e) {
        console.error('Audio error:', e);
        let message = 'Er ging iets mis bij het laden van de audio.';
        
        switch (this.audio.error?.code) {
            case 1:
                message = 'Audio afspelen geannuleerd.';
                break;
            case 2:
                message = 'Netwerkfout bij laden audio.';
                break;
            case 3:
                message = 'Audiobestand kon niet worden gedecodeerd.';
                break;
            case 4:
                message = 'Audiobestand niet gevonden.';
                break;
        }
        
        this.showStatus(message, 'error');
    }
    
    showStatus(message, type = 'info') {
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
            this.statusMessage.className = `status-message show ${type}`;
        }
    }
    
    hideStatus() {
        if (this.statusMessage) {
            this.statusMessage.classList.remove('show');
        }
    }
    
    handleKeyboard(e) {
        // Only handle if not in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.nextTrack();
                break;
        }
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('audioPlayer')) {
        window.audioPlayer = new AudioPlayer();
    }
});
