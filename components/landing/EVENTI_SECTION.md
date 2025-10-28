# 🎯 Sezione Eventi - Documentazione

## 📋 Panoramica

La sezione **Eventi** è una pagina pubblica moderna ed elegante che mostra tutti gli eventi organizzati dal Comitato Unitario Modena. Implementata seguendo lo stesso style system delle altre sezioni del sito, offre un'esperienza utente fluida e coinvolgente.

## 🎨 Design System

### Colori e Gradienti
- **Primary Gradient**: Purple (500) → Pink (600) → Violet (600)
- **Success Gradient**: Emerald (500) → Green (500)
- **Warning Gradient**: Orange (500) → Red (500)
- **Neutral**: Slate palette per testi e backgrounds

### Animazioni
- **Blob Animation**: Background animato con blob che si muovono
- **Float Animation**: Badge e elementi che fluttuano
- **Hover Effects**: Translate Y, shadow, border color transitions
- **Glassmorphism**: Backdrop blur con bordi semi-trasparenti

### Typography
- **Headings**: Font-semibold, tracking-tight
- **Body**: Text-slate-600/700/900
- **Badges**: Uppercase, tracking-wide, font-semibold

## 📁 Struttura File

```
app/(public)/eventi/
└── page.tsx                          # Pagina principale eventi

components/landing/
├── EventsHeroSection.tsx             # Hero con stats e gradient animato
├── EventCard.tsx                     # Card singolo evento
├── EventsGrid.tsx                    # Griglia con filtri e search
└── EVENTI_SECTION.md                 # Questa documentazione

lib/hooks/
└── useEventsData.ts                  # Hook per gestione dati eventi
```

## 🧩 Componenti

### 1. EventsHeroSection
**Posizione**: Top della pagina  
**Funzionalità**:
- Hero section con gradient animato purple/pink
- 4 stats cards con glassmorphism:
  - Totale Eventi
  - Eventi In Arrivo
  - Eventi Questo Mese
  - Eventi Completati
- Animated blobs in background
- Wave divider SVG alla fine
- Responsive design

**Props**:
```typescript
interface EventsHeroSectionProps {
  stats: {
    total: number;
    upcoming: number;
    past: number;
    thisMonth: number;
  };
  loading: boolean;
}
```

### 2. EventCard
**Funzionalità**:
- Card moderna con glassmorphism
- Badge di stato (Completato, In Programma, Tra X giorni)
- Badge iscrizioni (Aperte/Chiuse)
- Numero evento in badge circolare
- Dettagli evento (data, ora, location, deadline)
- Bottoni per locandina e classifiche
- Gradient overlay on hover
- Smooth animations

**Props**:
```typescript
interface EventCardProps {
  event: Event;
}
```

**Stati Badge**:
- **Completato**: Slate (evento passato)
- **Tra X giorni**: Orange → Red gradient (eventi imminenti ≤7 giorni)
- **In Programma**: Purple → Pink gradient (eventi futuri)
- **Iscrizioni Aperte**: Emerald → Green gradient
- **Iscrizioni Chiuse**: Red (border + background)

### 3. EventsGrid
**Funzionalità**:
- Search bar con icona e clear button
- Filtri rapidi (Tutti, In Arrivo, Passati)
- Toggle filtri avanzati (ordinamento)
- Active filters count badge
- Clear all filters button
- Responsive grid (1 col mobile, 2 tablet, 3 desktop)
- Empty state con illustrazione
- Results count

**Props**:
```typescript
interface EventsGridProps {
  events: Event[];
  filters: EventsFilters;
  onFiltersChange: (filters: EventsFilters) => void;
  loading: boolean;
}
```

**Filtri Disponibili**:
- **Search**: Cerca per titolo, descrizione, località
- **Date Filter**: all | upcoming | past
- **Sort By**: date-asc | date-desc | title

## 🔧 Hook: useEventsData

**Funzionalità**:
- Fetch eventi pubblici da Supabase
- Filtraggio real-time (search, date, sort)
- Calcolo statistiche automatico
- Gestione loading e error states

**Return Type**:
```typescript
interface UseEventsDataReturn {
  events: Event[];              // Tutti gli eventi
  filteredEvents: Event[];      // Eventi filtrati
  loading: boolean;
  error: string | null;
  filters: EventsFilters;
  setFilters: (filters: EventsFilters) => void;
  stats: {
    total: number;
    upcoming: number;
    past: number;
    thisMonth: number;
  };
}
```

## 🎯 Features Implementate

### ✅ UI/UX Moderna
- [x] Gradient animati con blob
- [x] Glassmorphism effects
- [x] Smooth hover transitions
- [x] Badge colorati e distintivi
- [x] Responsive design completo
- [x] Loading skeletons
- [x] Empty states

### ✅ Funzionalità
- [x] Search real-time
- [x] Filtri per data (tutti/futuri/passati)
- [x] Ordinamento (data asc/desc, titolo)
- [x] Visualizzazione locandine PDF
- [x] Link a classifiche
- [x] Countdown per eventi imminenti
- [x] Badge stato iscrizioni
- [x] Statistiche aggregate

### ✅ Performance
- [x] Fetch ottimizzato con Supabase
- [x] Filtri client-side per UX fluida
- [x] Lazy loading componenti
- [x] Animazioni con motion-safe

## 🚀 Utilizzo

### Navigazione
La pagina è accessibile all'URL: `/eventi`

### Route Configuration
```typescript
// lib/constants/routes.ts
PUBLIC: {
  EVENTS: '/eventi',
}
```

### Esempio Integrazione
```tsx
import Link from 'next/link';

// In qualsiasi componente
<Link href="/eventi">
  <Button>Scopri gli Eventi</Button>
</Link>
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (1 colonna)
- **Tablet**: 640px - 1024px (2 colonne)
- **Desktop**: > 1024px (3 colonne)

## 🎨 Style Consistency

La sezione Eventi segue lo stesso style system di:
- **HeroSection** (homepage)
- **NextEventSection** (homepage)
- **CalendarSection** (homepage)
- **ChampionshipsList** (dashboard)

### Pattern Comuni
1. **Gradient Backgrounds**: Radial gradients con opacity bassa
2. **Card Hover**: -translate-y-1/2, shadow-lg → shadow-2xl
3. **Badges**: Rounded-full, uppercase, tracking-wide
4. **Borders**: Border-2 con hover color change
5. **Spacing**: Gap-4/6, p-6, rounded-2xl/3xl

## 🔄 Aggiornamenti Futuri

### Possibili Miglioramenti
- [ ] Filtro per tipo evento (gara, manifestazione, etc.)
- [ ] Filtro per località
- [ ] Vista calendario (oltre alla griglia)
- [ ] Esportazione eventi (iCal)
- [ ] Condivisione social
- [ ] Mappa eventi
- [ ] Notifiche eventi preferiti

## 📝 Note Tecniche

### Database Query
```typescript
// Eventi pubblici e attivi
.from('events')
.select('*')
.eq('is_public', true)
.eq('is_active', true)
.order('event_date', { ascending: true })
```

### Calcolo Stato Evento
```typescript
const eventDate = new Date(event.event_date);
const isEventPast = isPast(eventDate);
const isEventUpcoming = isFuture(eventDate);
const daysUntil = differenceInDays(eventDate, new Date());
```

### Stato Iscrizioni
```typescript
const registrationOpen = 
  new Date() >= new Date(event.registration_start_date) && 
  new Date() <= new Date(event.registration_end_date);

const registrationClosed = 
  new Date() > new Date(event.registration_end_date);
```

## 🎯 Best Practices

1. **Sempre mostrare loading states** per UX fluida
2. **Empty states informativi** con CTA chiare
3. **Filtri persistenti** durante la navigazione
4. **Animazioni con motion-safe** per accessibilità
5. **Responsive images** per performance
6. **Error boundaries** per gestione errori

## 📞 Supporto

Per domande o problemi relativi alla sezione Eventi, contattare il team di sviluppo.

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: 2025-10-27  
**Autore**: ComUniMo Dev Team

