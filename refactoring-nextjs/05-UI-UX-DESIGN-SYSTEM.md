# UI/UX Design System - ComUniMo

## 🎨 Brand Identity

### Logo & Visual Identity
- **Nome**: ComUniMo (Comitato Unitario Modena)
- **Tagline**: "Insieme per lo sport modenese"
- **Settore**: Sport, gestione atleti e gare
- **Valori**: Professionalità, Trasparenza, Comunità, Innovazione

## 🌈 Palette Colori

### Colori Primari
```css
/* Primary - Blue Dark (istituzionale) */
--primary-50: #e8eef2;
--primary-100: #d1dce5;
--primary-200: #a3b9cb;
--primary-300: #7596b1;
--primary-400: #477397;
--primary-500: #223f4a;  /* Brand primary */
--primary-600: #1b323b;
--primary-700: #14262c;
--primary-800: #0d191e;
--primary-900: #060d0f;

/* Accent - Blue Bright (azioni) */
--accent-50: #e3f2fd;
--accent-100: #bbdefb;
--accent-200: #90caf9;
--accent-300: #64b5f6;
--accent-400: #42a5f5;
--accent-500: #1e88e5;  /* Brand accent */
--accent-600: #1976d2;
--accent-700: #1565c0;
--accent-800: #0d47a1;
--accent-900: #082f6b;

/* Secondary - Red/Orange (alerts, highlights) */
--secondary-50: #ffebee;
--secondary-100: #ffcdd2;
--secondary-200: #ef9a9a;
--secondary-300: #e57373;
--secondary-400: #ef5350;
--secondary-500: #ff5252;  /* Brand secondary */
--secondary-600: #e53935;
--secondary-700: #d32f2f;
--secondary-800: #c62828;
--secondary-900: #b71c1c;
```

### Colori Semantici
```css
/* Success */
--success-50: #e8f5e9;
--success-500: #4caf50;
--success-700: #388e3c;

/* Warning */
--warning-50: #fff8e1;
--warning-500: #ffb300;
--warning-700: #f57c00;

/* Error */
--error-50: #ffebee;
--error-500: #f44336;
--error-700: #d32f2f;

/* Info */
--info-50: #e3f2fd;
--info-500: #2196f3;
--info-700: #1976d2;
```

### Colori Neutri
```css
/* Grayscale */
--gray-50: #fafafa;
--gray-100: #f5f5f5;
--gray-200: #eeeeee;
--gray-300: #e0e0e0;
--gray-400: #bdbdbd;
--gray-500: #9e9e9e;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;

/* Black & White */
--black: #000000;
--white: #ffffff;
```

## 📏 Typography

### Font Families
```css
/* Sans-serif - UI principale */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;

/* Monospace - Codici, numeri */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Type Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */

/* Font Weights */
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Utilizzo
```css
/* Headings */
h1 { font-size: var(--text-4xl); font-weight: var(--font-bold); }
h2 { font-size: var(--text-3xl); font-weight: var(--font-bold); }
h3 { font-size: var(--text-2xl); font-weight: var(--font-semibold); }
h4 { font-size: var(--text-xl); font-weight: var(--font-semibold); }
h5 { font-size: var(--text-lg); font-weight: var(--font-medium); }
h6 { font-size: var(--text-base); font-weight: var(--font-medium); }

/* Body */
body { font-size: var(--text-base); line-height: var(--leading-normal); }
small { font-size: var(--text-sm); }
```

## 📐 Spacing System

### Scale (4px base)
```css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### Utilizzo
- **Padding**: Cards, Buttons, Inputs
- **Margin**: Section spacing, Component spacing
- **Gap**: Flexbox/Grid gaps

## 🔲 Breakpoints

```css
/* Mobile First Approach */
--screen-sm: 640px;    /* Small devices (phones) */
--screen-md: 768px;    /* Medium devices (tablets) */
--screen-lg: 1024px;   /* Large devices (desktops) */
--screen-xl: 1280px;   /* Extra large devices */
--screen-2xl: 1536px;  /* Ultra wide screens */
```

### Media Queries
```css
/* Mobile: default */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## 🎯 Component Styles

### Buttons

#### Variants
```tsx
// Primary Button
<Button variant="primary">
  Salva
</Button>
/* Style: bg-primary-500, text-white, hover:bg-primary-600 */

// Secondary Button
<Button variant="secondary">
  Annulla
</Button>
/* Style: bg-gray-200, text-gray-900, hover:bg-gray-300 */

// Outline Button
<Button variant="outline">
  Dettagli
</Button>
/* Style: border-primary-500, text-primary-500, hover:bg-primary-50 */

// Ghost Button
<Button variant="ghost">
  Modifica
</Button>
/* Style: transparent, hover:bg-gray-100 */

// Destructive Button
<Button variant="destructive">
  Elimina
</Button>
/* Style: bg-error-500, text-white, hover:bg-error-600 */
```

#### Sizes
```tsx
<Button size="sm">Small</Button>     /* px-3 py-1.5 text-sm */
<Button size="md">Medium</Button>    /* px-4 py-2 text-base (default) */
<Button size="lg">Large</Button>     /* px-6 py-3 text-lg */
<Button size="xl">Extra Large</Button> /* px-8 py-4 text-xl */
```

### Cards

```tsx
<Card className="shadow-md">
  <CardHeader>
    <CardTitle>Titolo</CardTitle>
    <CardDescription>Descrizione</CardDescription>
  </CardHeader>
  <CardContent>
    Contenuto
  </CardContent>
  <CardFooter>
    Footer con azioni
  </CardFooter>
</Card>

/* Style:
 * bg-white, rounded-lg, border
 * shadow-sm default, shadow-md hover
 * p-6 content
 */
```

### Inputs

```tsx
<Input 
  type="text" 
  placeholder="Nome atleta"
  error={errors.nome}
/>

/* Style:
 * border-gray-300, rounded-md
 * focus:ring-primary-500, focus:border-primary-500
 * error: border-error-500, text-error-500
 * disabled: bg-gray-100, cursor-not-allowed
 */
```

### Tables

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Cognome</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Mario</TableCell>
      <TableCell>Rossi</TableCell>
    </TableRow>
  </TableBody>
</Table>

/* Style:
 * border-collapse, border-gray-200
 * thead: bg-gray-50, font-semibold
 * tbody: hover:bg-gray-50
 * td/th: px-4 py-3
 * Responsive: overflow-x-auto
 */
```

## 🎭 Animations & Transitions

### Timing Functions
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Durations
```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### Common Transitions
```css
/* Hover effects */
.button {
  transition: all 150ms ease-in-out;
}

/* Page transitions */
.page-enter {
  animation: fadeIn 200ms ease-out;
}

/* Loading skeletons */
.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Keyframes
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## 🔍 States

### Interactive States
```css
/* Default */
.element { /* base styles */ }

/* Hover */
.element:hover { 
  background-color: var(--primary-600);
  transform: translateY(-1px);
}

/* Focus */
.element:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Active */
.element:active {
  transform: scale(0.98);
}

/* Disabled */
.element:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Visual States
```tsx
// Loading
<Button loading>
  <Spinner className="mr-2" />
  Caricamento...
</Button>

// Success
<Alert variant="success">
  <CheckIcon />
  Operazione completata!
</Alert>

// Error
<Alert variant="error">
  <XIcon />
  Si è verificato un errore
</Alert>

// Warning
<Alert variant="warning">
  <AlertIcon />
  Attenzione ai campi obbligatori
</Alert>
```

## 📱 Mobile-First Design

### Principles
1. **Touch Targets**: Minimo 44x44px
2. **Spacing**: Maggiore su mobile per facilità tap
3. **Font Size**: Minimo 16px per evitare zoom iOS
4. **Navigation**: Bottom nav su mobile, sidebar su desktop

### Mobile Patterns

#### Bottom Navigation
```tsx
<MobileBottomNav>
  <NavItem icon={<HomeIcon />} label="Home" />
  <NavItem icon={<UsersIcon />} label="Atleti" />
  <NavItem icon={<CalendarIcon />} label="Gare" />
  <NavItem icon={<UserIcon />} label="Profilo" />
</MobileBottomNav>
/* Fixed bottom, show on scroll up, hide on scroll down */
```

#### Hamburger Menu
```tsx
<MobileMenu>
  <MenuButton /> {/* Opens drawer */}
  <Drawer side="left">
    <Navigation />
  </Drawer>
</MobileMenu>
```

#### Swipe Gestures
- Swipe right: Back navigation
- Swipe left on list item: Quick actions (delete, edit)
- Pull to refresh: Refresh data

## 🎨 Dark Mode

### Color Tokens (Dark)
```css
:root[data-theme="dark"] {
  --bg-primary: #0f1419;
  --bg-secondary: #192028;
  --text-primary: #e1e8ed;
  --text-secondary: #8899a6;
  --border: #38444d;
  
  /* Adjust all color variables for dark mode */
}
```

### Implementation
```tsx
// Toggle component
<ThemeToggle />

// Usage in components
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">Text</p>
</div>
```

## ♿ Accessibility

### WCAG 2.1 AA Requirements

#### Color Contrast
- **Normal text**: Minimum 4.5:1
- **Large text** (18pt+): Minimum 3:1
- **UI components**: Minimum 3:1

#### Focus Indicators
```css
*:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

#### ARIA Labels
```tsx
<button aria-label="Chiudi dialog">
  <XIcon />
</button>

<input aria-describedby="error-message" />
<span id="error-message" role="alert">Campo obbligatorio</span>
```

#### Semantic HTML
```tsx
<main>
  <h1>Titolo Pagina</h1>
  <nav aria-label="Breadcrumb">...</nav>
  <section>
    <h2>Sezione</h2>
  </section>
</main>
```

## 📊 Data Visualization

### Charts Palette
```css
--chart-1: #1e88e5; /* Blue */
--chart-2: #4caf50; /* Green */
--chart-3: #ff5252; /* Red */
--chart-4: #ffb300; /* Orange */
--chart-5: #9c27b0; /* Purple */
--chart-6: #00bcd4; /* Cyan */
```

### Chart Styling
- **Grid lines**: Subtle gray (--gray-200)
- **Tooltips**: White bg, shadow, border
- **Legend**: Horizontal on desktop, vertical on mobile
- **Responsive**: Width 100%, height auto

## 🎭 Loading States

### Skeletons
```tsx
<Skeleton className="h-4 w-full" />
<Skeleton className="h-10 w-32 rounded-full" />
<Skeleton className="h-64 w-full rounded-lg" />
```

### Spinners
```tsx
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
```

### Progress Bars
```tsx
<Progress value={60} max={100} />
/* Indeterminate animation for unknown duration */
```

## 🎯 Empty States

```tsx
<EmptyState
  icon={<InboxIcon />}
  title="Nessun atleta trovato"
  description="Inizia aggiungendo il tuo primo atleta"
  action={
    <Button onClick={goToAddAtleta}>
      Aggiungi Atleta
    </Button>
  }
/>
```

## 📋 Forms Best Practices

1. **Label above input** (mobile-friendly)
2. **Required fields** marked with asterisk
3. **Inline validation** on blur
4. **Error messages** below field
5. **Disabled submit** until valid
6. **Loading state** during submit
7. **Success feedback** after submit

## 🎨 Tailwind Config

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { /* primary palette */ },
        accent: { /* accent palette */ },
        // ... other colors
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        // Custom spacing if needed
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

**Status**: ✅ Design System Completo
**Prossimo Step**: Features Mapping
