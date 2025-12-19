# Audiotour - Impeesa Museum

Een eenvoudige, offline-capable audiotour website voor het Impeesa Museum.

## 🎯 Kenmerken

- **2 audiotours** (Tour A en Tour B) met meerdere tracks
- **QR-code scanner** voor snelle navigatie in het museum
- **Mega-simpele bediening**: Play, Pause, Stop
- **PWA (Progressive Web App)**: werkt offline na eerste bezoek
- **Mobile-first design**: geoptimaliseerd voor smartphones
- **GitHub Pages ready**: makkelijk te hosten

## 📁 Bestandsstructuur

```
Website/
├── index.html          # Startpagina met tour keuze + QR scanner
├── tour.html           # Audio speler pagina
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker voor offline caching
├── css/
│   └── style.css       # Alle styling
├── js/
│   ├── app.js          # Hoofdlogica en PWA registratie
│   ├── player.js       # Audio speler besturing
│   └── qr.js           # QR scanner logica
└── assets/
    ├── audio/
    │   ├── tourA/      # Audio bestanden Tour A
    │   │   ├── track01.mp3
    │   │   ├── track02.mp3
    │   │   └── ...
    │   └── tourB/      # Audio bestanden Tour B
    │       ├── track01.mp3
    │       ├── track02.mp3
    │       └── ...
    └── icons/          # PWA iconen (zie hieronder)
```

## 🎵 Audio bestanden toevoegen

1. Plaats je MP3 bestanden in de juiste mappen:
   - `assets/audio/tourA/` voor Tour A
   - `assets/audio/tourB/` voor Tour B

2. Benoem ze als `track01.mp3`, `track02.mp3`, etc.

3. Pas de track informatie aan in `js/player.js` (regel ~70):
   ```javascript
   getTourData() {
       return {
           'A': {
               name: 'Tour A - Jouw Tour Naam',
               tracks: [
                   { id: 1, title: 'Welkom', description: 'Introductie', file: 'assets/audio/tourA/track01.mp3' },
                   // ... meer tracks
               ]
           },
           // ...
       };
   }
   ```

4. Update ook de audio lijst in `sw.js` voor offline caching.

## 🖼️ PWA Iconen maken

Maak iconen in de volgende formaten en plaats ze in `assets/icons/`:
- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

**Tip**: Gebruik een tool zoals https://realfavicongenerator.net/

## 📱 QR-codes genereren

Maak QR-codes voor de volgende URLs:

### Tour start URLs:
- **Tour A**: `https://jouwsite.github.io/audiotour/tour.html?tour=A&autoplay=1`
- **Tour B**: `https://jouwsite.github.io/audiotour/tour.html?tour=B&autoplay=1`

### Per locatie/track:
- Tour A, Track 3: `https://jouwsite.github.io/audiotour/tour.html?tour=A&track=3&autoplay=1`

**QR Generator**: https://www.qr-code-generator.com/

## 🚀 Deployen naar GitHub Pages

### Stap 1: Maak een GitHub repository
1. Ga naar https://github.com/new
2. Noem de repository bijv. `audiotour`
3. Maak hem **Public**

### Stap 2: Upload de bestanden
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/JOUW-USERNAME/audiotour.git
git push -u origin main
```

### Stap 3: Activeer GitHub Pages
1. Ga naar repository **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)`
4. Klik **Save**

Je site is nu live op: `https://JOUW-USERNAME.github.io/audiotour/`

## 🔧 Lokaal testen

Start een lokale server (vereist voor PWA):

```bash
# Met Python 3
python -m http.server 8000

# Of met Node.js (npx)
npx serve

# Of met VS Code Live Server extensie
```

Open dan: http://localhost:8000

## ⚙️ Aanpassen

### Tour namen wijzigen
Bewerk in `js/player.js` de `getTourData()` functie.

### Styling aanpassen
Alle kleuren en stijlen staan in `css/style.css` met CSS variabelen:
```css
:root {
    --color-primary: #1a5f7a;
    --color-secondary: #57837b;
    /* ... */
}
```

### Extra tracks toevoegen
1. Voeg MP3 toe aan `assets/audio/tourX/`
2. Update track lijst in `js/player.js`
3. Update cache lijst in `sw.js`

## 📋 Audio aanbevelingen

- **Formaat**: MP3 (beste compatibiliteit)
- **Bitrate**: 64-96 kbps (mono) voor spraak
- **Sample rate**: 44.1 kHz
- **Houd tracks kort**: max 2-3 minuten per locatie

## 🔒 Privacy

Deze website:
- Verzamelt **geen** persoonlijke gegevens
- Gebruikt **geen** analytics
- Vraagt alleen camera toestemming voor QR scanning
- Slaat niets op behalve de app cache voor offline gebruik

---

Gemaakt voor het Impeesa Museum 🏛️
