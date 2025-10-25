# Proposal: Implement Modern Landing Page

## Why

The current homepage is a placeholder showing only tech stack information. Users visiting the site need immediate access to:
- Championship registration status (open/closed)
- Upcoming race information
- Championship calendar with all stages
- Rankings and results
- Clear path to the dashboard

A modern, well-designed landing page will serve as the public face of the application, providing essential information to athletes, societies, and visitors while driving them to register or access the dashboard.

## What Changes

### New Components
- **Hero Section** with registration status indicator and primary CTA
- **Next Event Section** displaying upcoming championship stage with countdown timer
- **Calendar Section** showing all championship stages in an interactive timeline
- **Rankings Section** for viewing/downloading championship rankings PDFs
- **Landing Page Layout** with responsive design and smooth scrolling

### Data Fetching
- Fetch active championship data from Supabase
- Fetch upcoming and all championship stages (events)
- Determine registration status based on current date and event registration windows
- Fetch championship rankings from storage/database

### Routing Updates
- Replace placeholder homepage (`app/page.tsx`) with new landing page
- Add navigation to dashboard from CTA buttons
- Ensure proper public access (no authentication required)

### UI/UX Features
- Responsive design (mobile-first approach)
- Smooth scroll animations between sections
- Interactive calendar with clickable stages
- PDF viewer/download for posters and rankings
- Modern, minimal design following brand guidelines
- Accessibility compliance (WCAG AA)

## Impact

### Affected Specs
- **NEW**: `landing-page` - Complete landing page specification

### Affected Code
- `app/page.tsx` - Replace with new landing page implementation
- `components/landing/` - New directory with all landing components:
  - `HeroSection.tsx`
  - `NextEventSection.tsx`
  - `CalendarSection.tsx`
  - `RankingsSection.tsx`
  - `LandingNav.tsx` (optional navigation bar)
- `lib/api/` - Potential new data fetching utilities for public data
- `lib/constants/routes.ts` - May need to add landing section anchors

### Database Impact
- **No schema changes required** - Uses existing tables:
  - `championships` (read-only, public access via RLS)
  - `events` (read-only, public access via RLS)
  - Existing RLS policies already allow public read access to active championships

### Dependencies
- May need to add:
  - `date-fns` or similar for date formatting and countdown (check if already installed)
  - `react-pdf` or similar for PDF viewing (optional, can use browser native)
  - `framer-motion` for animations (check if already installed)

### Breaking Changes
- None - This is a new feature replacing a placeholder page

### Migration Path
- No migration needed
- Existing users can continue using dashboard
- New users get improved first impression

## Success Criteria

1. Landing page loads in <2 seconds on 3G connection
2. All sections are fully responsive (mobile, tablet, desktop)
3. Registration status accurately reflects current state
4. Next event information updates automatically
5. Calendar shows all championship stages with correct dates
6. PDF posters and rankings are accessible
7. CTA buttons successfully navigate to dashboard
8. Accessibility score of 90+ on Lighthouse
9. No authentication required to view landing page
10. Smooth scroll animations enhance UX without causing motion sickness

## Timeline Estimate

- **Planning & Design**: 1 hour
- **Component Development**: 4-6 hours
- **Data Integration**: 2-3 hours
- **Responsive Design & Polish**: 2-3 hours
- **Testing & Accessibility**: 1-2 hours

**Total**: 10-15 hours of development time

## Open Questions

1. Should we add a newsletter signup section?
2. Do we need a sponsors/partners section?
3. Should rankings be embedded or download-only?
4. Do we want to show historical championships or only current?
5. Should we add social media links/feeds?

## Notes

- Design should follow existing brand colors and typography
- Must work without JavaScript for core content (progressive enhancement)
- Consider adding structured data (JSON-LD) for SEO
- May want to add Open Graph tags for social sharing

