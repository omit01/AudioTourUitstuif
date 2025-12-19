# PWA Installatie Instructies

## ✅ Huidige Status

Je PWA is **bijna klaar** voor installatie. De code is goed gestructureerd met:
- ✅ Service Worker (offline caching)
- ✅ Manifest.json (PWA metadata)
- ✅ Responsive design
- ✅ HTTPS (via GitHub Pages)

## ❌ Wat Moet Nog Gebeuren

### 1. Iconen Genereren (VERPLICHT)

**Optie A: Automatisch (Aanbevolen)**
1. Open `generate-icons.html` in je browser (dubbel-klik op het bestand)
2. Klik op "Genereer Iconen"
3. Download alle 8 iconen
4. Plaats ze in `assets/icons/`

**Optie B: Handmatig**
Upload een logo (512x512 PNG) naar https://realfavicongenerator.net/ en download alle formaten.

**Benodigde iconen:**
- icon-72.png (72x72)
- icon-96.png (96x96)
- icon-128.png (128x128)
- icon-144.png (144x144)
- icon-152.png (152x152)
- icon-192.png (192x192)
- icon-384.png (384x384)
- icon-512.png (512x512)

### 2. GitHub Pages Activeren

1. Ga naar https://github.com/omit01/AudioTourUitstuif/settings/pages
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `/ (root)`
4. Klik **Save**
5. Wacht 1-2 minuten voor deployment

Je site wordt beschikbaar op: **https://omit01.github.io/AudioTourUitstuif/**

### 3. Push de Updates

```bash
cd 'c:\Users\TimoKlabbers\Documents\Impeesa Museum\Audiotour\Website'
git add .
git commit -m "Fix PWA paths and add icon generator"
git push origin main
```

## 📱 Hoe Te Installeren (na GitHub Pages activering)

### iOS (iPhone/iPad)
1. Open https://omit01.github.io/AudioTourUitstuif/ in **Safari**
2. Tik op het **Deel** icoon (vierkant met pijl omhoog)
3. Scroll naar beneden, tik **"Zet op beginscherm"**
4. Tik **"Voeg toe"**

### Android (Chrome)
1. Open https://omit01.github.io/AudioTourUitstuif/ in **Chrome**
2. Tik op het **⋮ menu** (drie puntjes)
3. Tik **"App installeren"** of **"Toevoegen aan startscherm"**
4. Bevestig de installatie

### Desktop (Chrome/Edge)
1. Open https://omit01.github.io/AudioTourUitstuif/
2. Kijk naar de adresbalk voor een **installatie-icoon** (➕ of 💻)
3. Klik erop en bevestig

## 🔍 Verificatie

### Check of PWA klaar is:
1. Open https://omit01.github.io/AudioTourUitstuif/ (na GitHub Pages setup)
2. Open Developer Tools (F12)
3. Ga naar **Application** tab
4. Check:
   - ✅ **Manifest**: Moet alle velden tonen
   - ✅ **Service Workers**: Moet "activated and running" zijn
   - ✅ **Icons**: Moet alle 8 iconen tonen

### Lighthouse PWA Check:
1. Open Developer Tools (F12)
2. Ga naar **Lighthouse** tab
3. Selecteer **Progressive Web App**
4. Klik **Analyze page load**
5. Score moet **90+** zijn

## 🚀 Snelle Checklist

- [ ] Iconen gegenereerd en geüpload naar `assets/icons/`
- [ ] GitHub Pages geactiveerd
- [ ] Updates gepusht naar GitHub
- [ ] Site getest op https://omit01.github.io/AudioTourUitstuif/
- [ ] PWA geïnstalleerd op test-apparaat

## 💡 Tips

1. **Offline testen**: Na installatie, zet je telefoon in vliegtuigmodus. De site moet blijven werken!
2. **Audio offline**: Bij eerste gebruik worden audio bestanden gecached (kan even duren)
3. **Updates**: Bij nieuwe versies zie je mogelijk een "Ververs" prompt

---

**Vragen?** De PWA code is solide. Het enige ontbrekende zijn de icon bestanden!
