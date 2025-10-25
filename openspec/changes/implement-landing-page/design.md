# Design Document: Landing Page

## Context

The ComUniMo application currently has a placeholder homepage that only displays tech stack information. The application manages athletic championships with multiple stages (races), registrations, and rankings. Users need a public-facing landing page that provides:

1. Immediate visibility of registration status
2. Information about upcoming championship events
3. Access to championship calendar and posters
4. Access to rankings and results
5. Clear path to the dashboard for registered users

**Stakeholders:**
- Athletes looking to register for championships
- Society administrators managing their athletes
- Public visitors seeking championship information
- Committee administrators managing the system

**Constraints:**
- Must use existing database schema (no schema changes)
- Must follow existing design system (shadcn/ui, brand colors)
- Must be accessible without authentication
- Must work on all device sizes
- Must load quickly (<2s on 3G)

## Goals / Non-Goals

### Goals
- Create a modern, attractive landing page that serves as the public face of the application
- Provide immediate access to critical information (registration status, next event)
- Display championship calendar with all stages and posters
- Provide access to rankings and results
- Drive users to register or access the dashboard
- Ensure excellent UX on all devices (mobile-first)
- Meet WCAG AA accessibility standards
- Optimize for SEO and social sharing

### Non-Goals
- User authentication on landing page (redirect to dashboard for that)
- Event registration directly on landing page (use dashboard)
- Real-time updates (polling/websockets) - static data refresh is sufficient
- Historical championship archives (focus on current championship only)
- Multi-language support (Italian only for now)
- Admin functionality on landing page

## Decisions

### Decision 1: Single-Page vs Multi-Page Architecture

**Decision**: Implement as a single-page scrollable experience with multiple sections.

**Rationale**:
- **Better UX**: Users can scroll through all information without navigation friction
- **Faster**: Single page load vs multiple page navigations
- **Modern Pattern**: Contemporary landing pages use scroll-based storytelling
- **Mobile-Friendly**: Easier to consume on mobile devices with continuous scroll
- **Simpler**: No routing complexity, easier state management
- **SEO**: All content on one page is easier to index

**Alternatives Considered**:
- Multi-page with separate routes for calendar, rankings, etc.
  - Rejected: Adds complexity, slower navigation, fragments user experience
- Tabbed interface
  - Rejected: Hides content, requires more clicks, less discoverable

**Implementation**:
```
Landing Page Structure:
├── Hero Section (registration status + CTA)
├── Next Event Section (upcoming race + countdown)
├── Calendar Section (all stages timeline)
├── Rankings Section (PDF downloads)
└── Footer (links, info)
```

### Decision 2: Data Fetching Strategy

**Decision**: Use client-side data fetching with React hooks and Supabase client.

**Rationale**:
- **Consistency**: Matches existing pattern in the application (no Server Actions)
- **Real-time**: Can easily add real-time subscriptions later if needed
- **RLS**: Leverages existing Row Level Security policies
- **Caching**: Can implement client-side caching with React Query or SWR
- **Simple**: No need for API routes or Server Components complexity

**Alternatives Considered**:
- Server-side rendering with Server Components
  - Rejected: Breaks consistency with existing codebase pattern
- Static generation with ISR
  - Rejected: Overkill for data that changes infrequently
- API routes
  - Rejected: Unnecessary abstraction, RLS already handles access control

**Implementation**:
```typescript
// Custom hooks for data fetching
export function useActiveChampionship() {
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchChampionship() {
      const { data, error } = await supabase
        .from('championships')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (!error) setChampionship(data);
      setLoading(false);
    }
    fetchChampionship();
  }, []);
  
  return { championship, loading };
}
```

### Decision 3: Registration Status Logic

**Decision**: Determine registration status based on event registration windows, not championship-level flag.

**Rationale**:
- **Accurate**: Reflects actual registration availability for specific events
- **Flexible**: Different events can have different registration windows
- **No Schema Changes**: Uses existing `registration_start_date` and `registration_end_date` fields
- **User-Centric**: Shows status relevant to what users can actually do

**Logic**:
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

**Alternatives Considered**:
- Add `registration_open` boolean to championships table
  - Rejected: Requires schema change, less flexible
- Manual admin toggle
  - Rejected: Requires admin intervention, prone to human error

### Decision 4: Calendar Layout

**Decision**: Use responsive timeline/grid layout with visual distinction for past/future events.

**Rationale**:
- **Visual Hierarchy**: Timeline shows progression through championship
- **Responsive**: Grid on desktop, list on mobile
- **Scannable**: Users can quickly find upcoming events
- **Interactive**: Clickable stages open posters

**Layouts by Breakpoint**:
- **Mobile (<768px)**: Vertical list with cards
- **Tablet (768-1023px)**: 2-column grid
- **Desktop (≥1024px)**: Horizontal timeline or 3-column grid

**Visual States**:
- **Past events**: Muted colors, checkmark icon
- **Current/next event**: Highlighted with brand blue, pulse animation
- **Future events**: Normal colors, calendar icon

**Alternatives Considered**:
- Full calendar widget (month view)
  - Rejected: Overkill for ~5-10 events, harder to make responsive
- Simple list only
  - Rejected: Less engaging, doesn't show progression

### Decision 5: PDF Handling (Posters & Rankings)

**Decision**: Open PDFs in new browser tab, no embedded viewer.

**Rationale**:
- **Simple**: No additional dependencies (react-pdf, etc.)
- **Native**: Browser PDF viewer is familiar and well-tested
- **Performance**: No large PDF library to download
- **Accessible**: Browser viewers have built-in accessibility features
- **Mobile-Friendly**: Mobile browsers handle PDFs well

**Implementation**:
```tsx
<a 
  href={posterUrl} 
  target="_blank" 
  rel="noopener noreferrer"
  className="..."
>
  Visualizza Locandina
</a>
```

**Alternatives Considered**:
- Embedded PDF viewer (react-pdf)
  - Rejected: Adds 200KB+ to bundle, complex on mobile
- Modal with PDF embed
  - Rejected: Poor mobile experience, accessibility concerns
- Download only (no view)
  - Rejected: Extra step for users, less convenient

### Decision 6: Countdown Timer Implementation

**Decision**: Update countdown every minute, not every second.

**Rationale**:
- **Performance**: Reduces re-renders from 60/min to 1/min
- **Battery**: Less CPU usage on mobile devices
- **UX**: Minute precision is sufficient for event countdowns
- **Accessibility**: Less disruptive for screen readers

**Implementation**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setTimeRemaining(calculateTimeRemaining(eventDate));
  }, 60000); // Update every minute
  
  return () => clearInterval(interval);
}, [eventDate]);
```

**Respect Reduced Motion**:
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Disable animations if true
```

**Alternatives Considered**:
- Update every second
  - Rejected: Unnecessary precision, performance cost
- Static display (no updates)
  - Rejected: Less engaging, requires page refresh

### Decision 7: Component Structure

**Decision**: Create small, focused components with clear responsibilities.

**Component Hierarchy**:
```
LandingPage (app/page.tsx)
├── HeroSection
│   ├── RegistrationStatusBadge
│   └── CTAButton
├── NextEventSection
│   ├── CountdownTimer
│   └── PosterLink
├── CalendarSection
│   └── StageCard (multiple)
│       └── PosterLink
├── RankingsSection
│   └── RankingCard (multiple)
└── LandingFooter
```

**Rationale**:
- **Reusability**: Small components can be reused (e.g., PosterLink)
- **Testability**: Easier to test isolated components
- **Maintainability**: Clear separation of concerns
- **Performance**: Can optimize individual components

### Decision 8: Styling Approach

**Decision**: Use Tailwind CSS with shadcn/ui components, following existing design system.

**Brand Colors**:
- Primary: `#1e88e5` (brand-blue) - CTAs, highlights
- Dark: `#223f4a` (brand-blue-dark) - headings, nav
- Accent: `#ff5252` (brand-red) - closed status, warnings

**Typography**:
- Font: Inter (already configured)
- Headings: Bold, brand-blue-dark
- Body: Regular, foreground color
- Scale: Responsive (smaller on mobile)

**Spacing**:
- Use 4px scale (p-4, p-6, p-8, etc.)
- Consistent section spacing (py-12 on mobile, py-16 on desktop)

**Rationale**:
- **Consistency**: Matches existing application design
- **Efficiency**: Reuse existing components and utilities
- **Performance**: Tailwind purges unused CSS
- **Maintainability**: Single source of truth for design tokens

## Risks / Trade-offs

### Risk 1: Data Freshness
**Risk**: Landing page data may be stale if championship info changes.

**Mitigation**:
- Implement client-side caching with reasonable TTL (5-10 minutes)
- Add manual refresh capability
- Consider adding real-time subscriptions for critical data (registration status)

**Trade-off**: Accepting slight staleness for better performance

### Risk 2: PDF Availability
**Risk**: Posters and rankings may not be uploaded, leading to broken links or empty sections.

**Mitigation**:
- Always check for null/undefined URLs before rendering links
- Show clear "not available" messages
- Provide fallback content
- Add admin reminders to upload PDFs

**Trade-off**: Graceful degradation vs perfect experience

### Risk 3: Performance on Slow Connections
**Risk**: Large images or PDFs may slow down page load on 3G.

**Mitigation**:
- Lazy load all below-fold images
- Use Next.js Image component for optimization
- Implement loading skeletons
- Add retry logic for failed requests
- Consider service worker for offline support

**Trade-off**: Initial load time vs feature richness

### Risk 4: Accessibility Compliance
**Risk**: Complex interactions (countdown, calendar) may have accessibility issues.

**Mitigation**:
- Test with screen readers early and often
- Use semantic HTML and ARIA labels
- Ensure keyboard navigation works
- Respect reduced motion preferences
- Run automated accessibility audits

**Trade-off**: Development time vs accessibility

### Risk 5: SEO for Dynamic Content
**Risk**: Client-side rendered content may not be indexed well by search engines.

**Mitigation**:
- Add proper meta tags and structured data
- Ensure critical content is in initial HTML
- Consider adding static fallback content
- Submit sitemap to search engines

**Trade-off**: SEO optimization vs development simplicity

## Migration Plan

### Phase 1: Development (Week 1)
1. Create all landing components
2. Implement data fetching hooks
3. Build responsive layouts
4. Add accessibility features

### Phase 2: Testing (Week 1-2)
1. Manual testing on all devices
2. Accessibility audit and fixes
3. Performance optimization
4. User acceptance testing

### Phase 3: Deployment (Week 2)
1. Deploy to staging environment
2. Final stakeholder review
3. Deploy to production
4. Monitor for issues

### Rollback Plan
- Keep old placeholder page in git history
- Can quickly revert if critical issues found
- No database changes, so rollback is safe

## Open Questions

1. **Newsletter Signup**: Should we add a newsletter signup section?
   - **Recommendation**: Add in future iteration if email marketing is planned

2. **Sponsors Section**: Should we display sponsors/partners?
   - **Recommendation**: Add if sponsors are confirmed, otherwise skip for now

3. **Historical Championships**: Should we show past championships?
   - **Recommendation**: Focus on current championship only, add archive later

4. **Social Media**: Should we embed social media feeds?
   - **Recommendation**: Add social links in footer, skip embedded feeds (performance)

5. **Live Results**: Should we show live results during races?
   - **Recommendation**: Out of scope for initial implementation, plan for future

6. **Multi-Championship Support**: What if multiple championships are active?
   - **Recommendation**: Show most recent active championship, add selector if needed

## Success Metrics

### Performance Metrics
- Lighthouse Performance Score: ≥90
- Lighthouse Accessibility Score: ≥90
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Cumulative Layout Shift (CLS): <0.1

### User Metrics
- Bounce rate: <40%
- Average time on page: >2 minutes
- CTA click-through rate: >20%
- Mobile traffic: >50% (expected)

### Technical Metrics
- Zero console errors
- Zero accessibility violations (axe)
- 100% keyboard navigable
- Works on all major browsers (Chrome, Firefox, Safari, Edge)

## Future Enhancements

1. **Real-time Updates**: Add Supabase real-time subscriptions for live data
2. **Animations**: Add more sophisticated animations with Framer Motion
3. **Personalization**: Show personalized content for logged-in users
4. **Multi-language**: Add Italian/English language toggle
5. **Progressive Web App**: Add PWA features for offline support
6. **Analytics**: Add detailed analytics tracking
7. **A/B Testing**: Test different CTA copy and layouts
8. **Championship Archive**: Add historical championship browser
9. **Live Results**: Real-time race results during events
10. **Social Integration**: Embed social media feeds and sharing

