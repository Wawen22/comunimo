# Landing Page Implementation Plan

## 📋 Executive Summary

This document provides a comprehensive plan for implementing a modern, accessible landing page for the ComUniMo web application. The landing page will serve as the public face of the application, providing essential championship information and driving user engagement.

## 🎯 Objectives

1. **Inform**: Display championship information, registration status, and upcoming events
2. **Engage**: Provide interactive calendar and access to posters/rankings
3. **Convert**: Drive users to register or access the dashboard
4. **Perform**: Load quickly (<2s) and work on all devices
5. **Accessible**: Meet WCAG AA standards for accessibility

## 🏗️ Architecture Decision: Single-Page Design

**Decision**: Implement as a single scrollable page with multiple sections.

**Rationale**:
- ✅ Better UX - continuous scroll, no navigation friction
- ✅ Faster - single page load vs multiple navigations
- ✅ Modern - follows contemporary landing page patterns
- ✅ Mobile-friendly - easier to consume on small screens
- ✅ Simpler - no routing complexity

**Page Structure**:
```
┌─────────────────────────────────────┐
│  Hero Section                       │
│  - Registration Status Badge        │
│  - Championship Name & Season       │
│  - Primary CTA Button               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Next Event Section                 │
│  - Event Title, Date, Location      │
│  - Countdown Timer                  │
│  - Poster Link (if available)       │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Calendar Section                   │
│  - All Championship Stages          │
│  - Timeline/Grid Layout             │
│  - Clickable Posters                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Rankings Section                   │
│  - Championship Rankings PDFs       │
│  - Download/View Links              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Footer                             │
│  - Links, Copyright, Social         │
└─────────────────────────────────────┘
```

## 📊 Data Model

### Existing Database Tables (No Changes Required)

**championships**:
- `id`, `name`, `slug`, `year`, `season`
- `description`, `start_date`, `end_date`
- `championship_type`, `is_active`
- RLS: Public can read active championships

**events** (championship stages):
- `id`, `championship_id`, `title`, `event_date`
- `location`, `event_number`
- `registration_start_date`, `registration_end_date`
- `poster_url`, `results_url`
- RLS: Public can read events of active championships

### Data Fetching Strategy

**Client-Side Fetching** (matches existing pattern):
```typescript
// Custom hooks
useActiveChampionship() → Championship | null
useChampionshipStages(championshipId) → Event[]
useRegistrationStatus(events) → 'open' | 'closed'
```

**Registration Status Logic**:
```typescript
function isRegistrationOpen(events: Event[]): boolean {
  const now = new Date();
  return events.some(event => {
    const start = new Date(event.registration_start_date);
    const end = new Date(event.registration_end_date);
    return now >= start && now <= end;
  });
}
```

## 🎨 Component Architecture

### Component Hierarchy

```
app/page.tsx (Landing Page)
├── components/landing/HeroSection.tsx
│   ├── RegistrationStatusBadge.tsx
│   └── (uses Button from ui/)
├── components/landing/NextEventSection.tsx
│   ├── CountdownTimer.tsx
│   └── PosterLink.tsx
├── components/landing/CalendarSection.tsx
│   └── StageCard.tsx (multiple)
│       └── PosterLink.tsx
├── components/landing/RankingsSection.tsx
│   └── RankingCard.tsx (multiple)
└── components/landing/LandingFooter.tsx
```

### Key Components

#### 1. HeroSection
**Purpose**: First impression, registration status, primary CTA

**Props**:
```typescript
interface HeroSectionProps {
  championship: Championship | null;
  registrationStatus: 'open' | 'closed';
  loading: boolean;
}
```

**Features**:
- Large, bold championship name
- Prominent registration status badge (green/red)
- Primary CTA button ("Iscriviti Ora" or "Vai alla Dashboard")
- Responsive layout (stacks on mobile)

#### 2. NextEventSection
**Purpose**: Highlight upcoming race, create urgency

**Props**:
```typescript
interface NextEventSectionProps {
  nextEvent: Event | null;
  loading: boolean;
}
```

**Features**:
- Event title, date, location
- Countdown timer (updates every minute)
- Poster link (if available)
- "No upcoming events" state

#### 3. CalendarSection
**Purpose**: Show all championship stages, provide access to posters

**Props**:
```typescript
interface CalendarSectionProps {
  stages: Event[];
  loading: boolean;
}
```

**Features**:
- Chronological display of all stages
- Visual distinction: past (muted), current (highlighted), future (normal)
- Clickable posters (opens in new tab)
- Responsive layout: list (mobile) → grid (tablet) → timeline (desktop)

#### 4. RankingsSection
**Purpose**: Provide access to championship rankings

**Props**:
```typescript
interface RankingsSectionProps {
  rankings: RankingFile[];
  loading: boolean;
}
```

**Features**:
- List of ranking PDFs
- Download/view buttons
- "Not available" state
- Category organization (if multiple rankings)

## 🎨 Design System

### Brand Colors
- **Primary**: `#1e88e5` (brand-blue) - CTAs, highlights, active states
- **Dark**: `#223f4a` (brand-blue-dark) - headings, navigation
- **Accent**: `#ff5252` (brand-red) - closed status, warnings
- **Success**: `#4caf50` - open status, success states

### Typography
- **Font**: Inter (already configured)
- **Headings**: 
  - H1: 3xl (mobile) → 5xl (desktop), bold, brand-blue-dark
  - H2: 2xl (mobile) → 4xl (desktop), bold, brand-blue-dark
  - H3: xl (mobile) → 2xl (desktop), semibold
- **Body**: base (mobile) → lg (desktop), regular

### Spacing
- **Section Padding**: py-12 (mobile) → py-16 (tablet) → py-20 (desktop)
- **Container Max Width**: max-w-7xl
- **Grid Gaps**: gap-4 (mobile) → gap-6 (tablet) → gap-8 (desktop)

### Responsive Breakpoints
- **Mobile**: <768px (vertical stack, full-width)
- **Tablet**: 768-1023px (2-column grid)
- **Desktop**: ≥1024px (3-column grid, timeline)

## 🚀 Implementation Phases

### Phase 1: Setup & Infrastructure (2-3 hours)
- [ ] Check/install dependencies (date-fns, lucide-react)
- [ ] Create `components/landing/` directory
- [ ] Create data fetching hooks (`lib/hooks/useLandingData.ts`)
- [ ] Create utility functions (`lib/utils/registrationUtils.ts`)

### Phase 2: Core Components (4-6 hours)
- [ ] HeroSection + RegistrationStatusBadge
- [ ] NextEventSection + CountdownTimer
- [ ] CalendarSection + StageCard
- [ ] RankingsSection + RankingCard
- [ ] LandingFooter

### Phase 3: Main Landing Page (2-3 hours)
- [ ] Update `app/page.tsx`
- [ ] Implement data fetching
- [ ] Compose all sections
- [ ] Add loading states
- [ ] Add error handling

### Phase 4: Responsive Design (2-3 hours)
- [ ] Test on mobile (<768px)
- [ ] Test on tablet (768-1023px)
- [ ] Test on desktop (≥1024px)
- [ ] Fix layout issues
- [ ] Add animations (respect reduced motion)

### Phase 5: Accessibility & Testing (2-3 hours)
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast verification
- [ ] Lighthouse audit (target: 90+)
- [ ] Cross-browser testing

### Phase 6: SEO & Polish (1-2 hours)
- [ ] Meta tags (title, description, OG, Twitter)
- [ ] Structured data (JSON-LD)
- [ ] Final visual polish
- [ ] Performance optimization

### Phase 7: Deployment (1 hour)
- [ ] Final review
- [ ] Deploy to production
- [ ] Monitor for issues

**Total Estimated Time**: 14-21 hours

## 📱 Responsive Design Strategy

### Mobile (<768px)
```
┌─────────────────┐
│   Hero          │
│   [Full Width]  │
├─────────────────┤
│   Next Event    │
│   [Full Width]  │
├─────────────────┤
│   Calendar      │
│   [Vertical     │
│    List]        │
├─────────────────┤
│   Rankings      │
│   [Vertical     │
│    List]        │
└─────────────────┘
```

### Tablet (768-1023px)
```
┌─────────────────────────┐
│   Hero [Full Width]     │
├─────────────────────────┤
│   Next Event [Full]     │
├───────────┬─────────────┤
│  Stage 1  │  Stage 2    │
├───────────┼─────────────┤
│  Stage 3  │  Stage 4    │
├───────────┴─────────────┤
│   Rankings [2-col]      │
└─────────────────────────┘
```

### Desktop (≥1024px)
```
┌─────────────────────────────────┐
│   Hero [Centered, Max Width]    │
├─────────────────────────────────┤
│   Next Event [Centered]         │
├───────────┬─────────┬───────────┤
│  Stage 1  │ Stage 2 │  Stage 3  │
├───────────┴─────────┴───────────┤
│   Rankings [3-col Grid]         │
└─────────────────────────────────┘
```

## ♿ Accessibility Requirements

### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order (top to bottom, left to right)
- Visible focus indicators (2px outline, brand-blue)
- No keyboard traps

### Screen Reader Support
- Semantic HTML (header, main, section, footer)
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels for interactive elements
- Alt text for all images
- Live regions for countdown timer

### Color Contrast
- All text: ≥4.5:1 (WCAG AA)
- Large text (≥18pt): ≥3:1
- Interactive elements: ≥3:1
- Status indicators: icon + text (not color alone)

### Motion Preferences
```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Disable animations if true
```

## 🔍 SEO Strategy

### Meta Tags
```html
<title>ComUniMo - Campionato Provinciale Corsa Campestre 2025</title>
<meta name="description" content="..." />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta name="twitter:card" content="summary_large_image" />
```

### Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "31° Campionato Provinciale di Corsa Campestre 2025",
  "startDate": "2025-02-10",
  "endDate": "2025-04-30",
  "location": { ... },
  "organizer": { ... }
}
```

## ⚡ Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

### Lighthouse Scores
- **Performance**: ≥90
- **Accessibility**: ≥90
- **Best Practices**: ≥90
- **SEO**: ≥90

### Optimization Strategies
- Lazy load below-fold images
- Use Next.js Image component
- Implement loading skeletons
- Cache API responses (5-10 min TTL)
- Code splitting (dynamic imports)
- Minimize bundle size

## 🧪 Testing Checklist

### Functional Testing
- [ ] Registration status displays correctly (open/closed)
- [ ] Next event shows correct upcoming race
- [ ] Countdown timer updates every minute
- [ ] Calendar shows all stages in order
- [ ] Past/future stages visually distinguished
- [ ] Poster links open PDFs in new tab
- [ ] Rankings download/view works
- [ ] CTA buttons navigate to dashboard
- [ ] Loading states display correctly
- [ ] Error states display user-friendly messages

### Responsive Testing
- [ ] Mobile (iPhone SE, iPhone 12, Pixel 5)
- [ ] Tablet (iPad, iPad Pro)
- [ ] Desktop (1920x1080, 2560x1440)
- [ ] All breakpoints (768px, 1024px)

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader (NVDA, JAWS, VoiceOver)
- [ ] Color contrast (WebAIM checker)
- [ ] Lighthouse accessibility audit
- [ ] axe DevTools scan

### Performance Testing
- [ ] Lighthouse audit (all categories)
- [ ] 3G throttling test
- [ ] Bundle size analysis
- [ ] Image optimization verification

## 📦 Deliverables

### Code
- [ ] `app/page.tsx` (updated landing page)
- [ ] `components/landing/HeroSection.tsx`
- [ ] `components/landing/NextEventSection.tsx`
- [ ] `components/landing/CalendarSection.tsx`
- [ ] `components/landing/RankingsSection.tsx`
- [ ] `components/landing/LandingFooter.tsx`
- [ ] `components/landing/RegistrationStatusBadge.tsx`
- [ ] `components/landing/CountdownTimer.tsx`
- [ ] `components/landing/StageCard.tsx`
- [ ] `components/landing/RankingCard.tsx`
- [ ] `lib/hooks/useLandingData.ts`
- [ ] `lib/utils/registrationUtils.ts`

### Documentation
- [ ] Component JSDoc comments
- [ ] README updates (if needed)
- [ ] OpenSpec documentation (this file)

### Testing
- [ ] Manual test results
- [ ] Lighthouse audit results
- [ ] Accessibility audit results

## 🎉 Success Criteria

1. ✅ Landing page loads in <2 seconds on 3G
2. ✅ All sections fully responsive (mobile, tablet, desktop)
3. ✅ Registration status accurately reflects current state
4. ✅ Next event information updates automatically
5. ✅ Calendar shows all stages with correct dates
6. ✅ PDF posters and rankings accessible
7. ✅ CTA buttons navigate to dashboard
8. ✅ Lighthouse accessibility score ≥90
9. ✅ No authentication required to view
10. ✅ Smooth animations (respecting reduced motion)

## 📝 Notes

- No database schema changes required
- Uses existing RLS policies (public read access)
- Follows existing codebase patterns (client-side fetching)
- Maintains design system consistency
- Progressive enhancement (works without JS for core content)

