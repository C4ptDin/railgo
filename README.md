# RAILFLOW

An original railway journey-planning prototype for Malaysian routes. RAILFLOW is independent and is not affiliated with KTMB or any railway operator.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Setup
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Scripts
- `npm run dev` — local development server
- `npm run typecheck` — TypeScript project checks
- `npm run build` — typecheck and production build
- `npm run preview` — preview the production build

## Architecture
- `src/main.tsx` — React entry and router provider
- `src/App.tsx` — shared navigation, search UI, pages, saved journeys and preferences
- `src/data.ts` — typed station and illustrative journey dataset
- `src/styles.css` — design tokens, responsive styling and reduced-motion rules
- `index.html` — document metadata and font loading

## Routes
- `/` — Home and journey search
- `/journeys` — results, filtering and sorting
- `/journeys/:journeyId` — sample journey details and timeline
- `/my-trips` — saved sample journeys
- `/profile` — interface preferences

## Data and privacy limitations
All schedules, durations, services and fares are illustrative sample data. They do not represent live operator schedules, actual ticket inventory or guaranteed fares. There is no ticket booking, payment or operator API. Saved journey IDs and interface preferences are stored in this browser's localStorage; there is no user account or cross-device sync. Do not store passwords or sensitive credentials here.

## Motion
GSAP is used for a restrained hero entrance and is skipped when `prefers-reduced-motion: reduce` is enabled. Lenis is included in the planned stack but intentionally not activated: native scrolling is simpler and more accessible for this functional, information-dense prototype.

## Production follow-up
Before real-world use, replace sample data with a verified operator API, document freshness and service terms, add robust API/error handling, and verify current station naming, timezones, and fare rules. Review external image licensing and self-host optimized assets if required.
