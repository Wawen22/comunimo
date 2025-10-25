# Landing Page Components

Modern, minimal, and accessible landing page for the ComUniMo web application.

## 🎯 Overview

The landing page is a single-page scrollable design that showcases:
- **Registration Status**: Real-time indicator showing if registrations are open/closed
- **Next Event**: Countdown timer and details for the upcoming championship stage
- **Calendar**: Horizontal scrolling carousel of all championship stages
- **Rankings**: Placeholder section for future rankings implementation
- **Footer**: Contact information and quick links

## 📁 Component Structure

```
components/landing/
├── HeroSection.tsx              # Hero with registration status and CTA
├── RegistrationStatusBadge.tsx  # Status badge (open/closed)
├── NextEventSection.tsx         # Next event with countdown
├── CountdownTimer.tsx           # Countdown timer component
├── CalendarSection.tsx          # Horizontal scroll calendar
├── StageCard.tsx                # Individual stage card
├── PDFViewerModal.tsx           # PDF viewer modal (iframe-based)
├── RankingsSection.tsx          # Rankings placeholder
├── LandingFooter.tsx            # Footer component
├── index.ts                     # Barrel export
└── README.md                    # This file
```

## 🔧 Data Layer

### Hooks (`lib/hooks/useLandingData.ts`)

- **`useActiveChampionship()`**: Fetches the active championship
- **`useChampionshipStages(championshipId)`**: Fetches all stages for a championship
- **`useRegistrationStatus(events)`**: Determines if registration is currently open
- **`useLandingData()`**: Combined hook that fetches all data needed for the landing page

### Utilities (`lib/utils/registrationUtils.ts`)

- **`isRegistrationOpen(events)`**: Checks if any event has open registration
- **`getNextEvent(events)`**: Returns the next upcoming event
- **`calculateTimeRemaining(targetDate)`**: Calculates time remaining until a date
- **`isPastEvent(event)`**: Checks if an event is in the past
- **`isCurrentEvent(event, events)`**: Checks if an event is the next upcoming one
- **`getRegistrationStatusText(isOpen)`**: Returns localized status text
- **`getRegistrationStatusColor(isOpen)`**: Returns color scheme for status

## 🎨 Design Decisions

### Single-Page Scrollable Layout
- **Why**: Better UX, faster loading, modern feel
- **Implementation**: Vertical scroll for sections, horizontal scroll for calendar

### Horizontal Scroll Calendar
- **Why**: Modern, engaging, space-efficient
- **Implementation**: CSS overflow-x with scroll buttons on desktop, swipe on mobile

### Iframe PDF Viewer
- **Why**: Simple, reliable, no external dependencies
- **Alternative**: react-pdf (more features but complex setup)

### Automatic Registration Status
- **Why**: No manual admin intervention needed
- **Implementation**: Checks if current time is within any event's registration window

### Client-Side Data Fetching
- **Why**: Matches existing codebase pattern
- **Implementation**: Custom hooks with Supabase client

## ♿ Accessibility Features

- **WCAG AA Compliance**: Color contrast ratios meet standards
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Color Independence**: Status uses both color AND icon (not color alone)

## 📱 Responsive Design

- **Mobile-First**: Designed for mobile, enhanced for desktop
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch-Friendly**: Large tap targets, swipe gestures

## 🚀 Usage

### Basic Usage

```tsx
import { useLandingData } from '@/lib/hooks/useLandingData';
import { HeroSection, NextEventSection, CalendarSection, RankingsSection, LandingFooter } from '@/components/landing';

export default function LandingPage() {
  const { championship, stages, registrationStatus, loading, error } = useLandingData();

  return (
    <main>
      <HeroSection championship={championship} registrationStatus={registrationStatus} loading={loading} />
      <NextEventSection events={stages} loading={loading} />
      <CalendarSection stages={stages} loading={loading} />
      <RankingsSection />
      <LandingFooter />
    </main>
  );
}
```

### Individual Components

```tsx
// Registration Status Badge
<RegistrationStatusBadge isOpen={true} />

// Countdown Timer
<CountdownTimer targetDate={new Date('2025-02-10')} />

// Stage Card
<StageCard stage={event} allStages={events} />

// PDF Viewer Modal
<PDFViewerModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  pdfUrl="https://example.com/poster.pdf"
  title="Event Poster"
/>
```

## 🔮 Future Enhancements

### Rankings Database (Planned)
Currently, the rankings section is a placeholder. Future implementation will include:
- Database schema for rankings
- API endpoints for fetching rankings
- PDF generation for downloadable rankings
- Real-time updates after each stage

### Potential Features
- Newsletter signup
- Social media integration
- Historical championships archive
- Photo gallery
- Live results during events
- Push notifications for registration deadlines

## 🧪 Testing

### Manual Testing Checklist

- [ ] Hero section displays correctly with loading state
- [ ] Registration status badge shows correct state (open/closed)
- [ ] Next event section displays countdown timer
- [ ] Countdown timer updates every minute
- [ ] Calendar horizontal scroll works on desktop
- [ ] Calendar swipe works on mobile
- [ ] Stage cards show correct visual state (past/current/future)
- [ ] PDF modal opens and displays PDF
- [ ] PDF modal download button works
- [ ] Rankings section displays placeholder
- [ ] Footer links work correctly
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Reduced motion preference is respected

### Browser Compatibility

Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## 📝 Notes

### PDF Viewing
The PDF viewer uses an iframe for simplicity and reliability. If you need more advanced features (page navigation, zoom, annotations), consider implementing react-pdf with proper CSS imports.

### Registration Logic
Registration is considered "open" if the current time is within ANY event's registration window. This means:
- If Event A registration is closed but Event B is open, status shows "OPEN"
- If all events have closed registration, status shows "CLOSED"

### Performance
- Countdown timer updates every 60 seconds (not every second) to reduce re-renders
- Images and PDFs are lazy-loaded
- Horizontal scroll uses CSS (no JavaScript library)

## 🐛 Known Issues

None at this time.

## 📚 Related Documentation

- [OpenSpec Proposal](../../../openspec/changes/implement-landing-page/proposal.md)
- [Implementation Plan](../../../openspec/changes/implement-landing-page/IMPLEMENTATION-PLAN.md)
- [Design Decisions](../../../openspec/changes/implement-landing-page/design.md)
- [Technical Spec](../../../openspec/changes/implement-landing-page/specs/landing-page/spec.md)

