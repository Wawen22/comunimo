## Why
- Society admins and volunteers struggle to complete athlete registrations without assistance, leading to support load and inconsistent data quality.
- A guided, in-product onboarding flow will reduce confusion by walking users through the required steps directly inside the dashboard.
- The business wants a polished, modern experience that reflects the brand, rather than relying on external documentation or support.

## Goals
- Deliver an interactive guidance tool that highlights the key areas of the athlete registration journey and reduces the chance of missing steps.
- Provide a consistent overlay experience that feels modern and lightweight, without forcing navigation away from the current dashboard context.
- Make the guidance discoverable but unobtrusive, so experienced users can dismiss or skip it quickly.

## Non-Goals
- Rebuilding the underlying registration flows or backend APIs.
- Handling multilingual content (initial version can launch in Italian only).
- Implementing analytics instrumentation beyond simple tour start/completion counters.

## Open Questions
- Should the tour auto-launch the first time a society admin visits the dashboard, or remain fully manual behind an entry point?
- Do we need role-specific messaging (e.g., different copy for UISP vs. FIDAL societies)?
