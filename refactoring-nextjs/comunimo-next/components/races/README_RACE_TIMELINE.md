# RaceTimeline Component - Documentazione UI/UX

## 📋 Panoramica

Il componente `RaceTimeline` è una visualizzazione moderna e interattiva delle tappe di un campionato, progettata per offrire un'esperienza utente superiore rispetto alla lista tradizionale.

## ✨ Caratteristiche Principali

### 1. **Timeline Visuale**
- **Linea temporale verticale** che connette tutte le tappe
- **Icone di stato** dinamiche per ogni tappa:
  - ✅ **Completata**: CheckCircle verde
  - 🔥 **In corso/Aperta**: Flag animato con pulse
  - ⭕ **Futura**: Circle grigio
- **Badge numerici** che mostrano il numero della tappa

### 2. **Stati Visivi Differenziati**

#### Tappa Completata
- Sfondo: Gradiente verde chiaro → bianco
- Bordo: Verde
- Icona: CheckCircle verde con ombra
- Testo giorni: "Completata" su sfondo verde

#### Tappa con Iscrizioni Aperte (Corrente)
- Sfondo: Gradiente blu → bianco → rosso
- Bordo: Blu con ring animato
- Icona: Flag bianco su sfondo gradiente blu-rosso con pulse
- Badge speciale: "🔥 Iscrizioni Aperte" con animazione pulse
- Ombra elevata per maggiore enfasi

#### Tappa con Iscrizioni Chiuse
- Sfondo: Gradiente giallo chiaro → bianco
- Bordo: Giallo
- Icona: Circle su sfondo giallo-arancio

#### Tappa Futura
- Sfondo: Bianco
- Bordo: Grigio
- Icona: Circle grigio

### 3. **Informazioni Dettagliate**

Ogni card della tappa mostra:

- **Header**:
  - Badge numero tappa
  - Badge stato (Prossima/Aperta/Chiusa/Completata)
  - Badge speciale per iscrizioni aperte
  - Titolo della tappa
  - Countdown giorni mancanti

- **Descrizione**: Testo descrittivo con line-clamp (max 2 righe)

- **Info Grid** (layout responsive):
  - 📅 **Data**: Con icona calendario
  - ⏰ **Orario**: Con icona orologio
  - 📍 **Luogo**: Con icona mappa
  - 👥 **Iscritti**: Conteggio partecipanti (se disponibile)

- **Quick Actions**:
  - Pulsante "Locandina" (se disponibile)
  - Pulsante "Risultati" (se disponibile)
  - Pulsante "Dettagli" con chevron animato

### 4. **Animazioni e Micro-interazioni**

- **Hover Effects**:
  - Scale up della card (1.02x)
  - Ombra più pronunciata
  - Icona timeline ingrandita (1.1x)
  - Chevron che si sposta a destra
  - Cambio colore del titolo

- **Gradient Overlay**: Effetto shimmer al passaggio del mouse

- **Smooth Transitions**: Tutte le transizioni sono fluide (300ms)

- **Pulse Animation**: Per le tappe con iscrizioni aperte

### 5. **Countdown Intelligente**

Il sistema mostra automaticamente:
- "Completata" - per tappe passate
- "Oggi!" - per tappe in corso
- "Domani" - per tappe del giorno successivo
- "Tra X giorni" - per tappe entro 7 giorni
- "Tra X settimane" - per tappe entro 30 giorni
- "Tra X mesi" - per tappe oltre 30 giorni

### 6. **Design Responsive**

- **Mobile** (< 768px):
  - Info grid a 1 colonna
  - Card full-width
  - Timeline compatta

- **Tablet** (768px - 1024px):
  - Info grid a 2 colonne
  - Spaziatura ottimizzata

- **Desktop** (> 1024px):
  - Info grid a 3 colonne
  - Layout completo con tutti i dettagli

## 🎨 Palette Colori

### Stati
- **Completata**: Verde (#10b981, #059669)
- **Aperta**: Blu-Rosso gradiente (#1e88e5, #ff5252)
- **Chiusa**: Giallo-Arancio (#eab308, #f97316)
- **Futura**: Grigio (#9ca3af, #6b7280)

### Accenti
- **Brand Blue**: #1e88e5
- **Brand Red**: #ff5252
- **Brand Blue Dark**: #223f4a

## 🔧 Utilizzo

```tsx
import { RaceTimeline } from '@/components/races/RaceTimeline';

<RaceTimeline 
  races={championship.races} 
  championshipId={championship.id}
  registrationCounts={raceRegistrationCounts}
/>
```

### Props

- `races`: Array di oggetti Race (Event)
- `championshipId`: ID del campionato (per i link)
- `registrationCounts`: Oggetto con conteggi iscrizioni per race_id (opzionale)

## 📊 Vantaggi UX

1. **Orientamento Temporale**: La timeline verticale aiuta a comprendere immediatamente la sequenza delle tappe
2. **Gerarchia Visiva**: Le tappe importanti (aperte/correnti) sono immediatamente riconoscibili
3. **Feedback Visivo**: Ogni interazione ha un feedback chiaro e immediato
4. **Accessibilità**: Uso di icone + colori + testo per garantire comprensione
5. **Scansionabilità**: Layout strutturato che facilita la lettura rapida
6. **Azioni Rapide**: Accesso diretto a locandine e risultati senza navigare

## 🚀 Performance

- **Animazioni GPU-accelerated**: Uso di transform e opacity
- **Lazy rendering**: Solo le card visibili vengono renderizzate
- **Ottimizzazione immagini**: Nessuna immagine pesante, solo icone SVG
- **Minimal re-renders**: Uso di hover state locale

## 🎯 Accessibilità

- Contrasto colori conforme WCAG 2.1 AA
- Icone con significato semantico
- Testi leggibili (min 14px)
- Focus states chiari per navigazione da tastiera
- Supporto per prefers-reduced-motion

## 📱 Compatibilità Browser

- Chrome/Edge: ✅ Completo
- Firefox: ✅ Completo
- Safari: ✅ Completo
- Mobile browsers: ✅ Completo

## 🔄 Aggiornamenti Futuri

Possibili miglioramenti:
- [ ] Filtri per stato (mostra solo aperte/future)
- [ ] Vista calendario alternativa
- [ ] Export PDF della timeline
- [ ] Notifiche per scadenze iscrizioni
- [ ] Integrazione mappa per visualizzare locations
- [ ] Statistiche aggregate (totale iscritti, media per tappa)

