# RAILFLOW

An original railway journey-planning prototype for Malaysian routes. RAILFLOW is an independent project and is not affiliated with KTMB or any railway operator.

## Prototype status

The repository is being initialized. All journeys, timetables, durations, and fares in the first release will be illustrative sample data, not live schedules, ticket inventory, or booking services.

## Planned stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- GSAP for restrained, lifecycle-safe motion
- Lenis only where smooth scrolling improves the experience
- Lucide React icons

## Planned routes

- `/` — Home and journey search
- `/journeys` — Search results, filters, and sorting
- `/journeys/:journeyId` — Journey details and route timeline
- `/my-trips` — Locally saved journeys
- `/profile` — Local interface preferences

## Local development

The setup instructions will be completed alongside the application scaffold. The prototype will not request passwords or store sensitive credentials in localStorage.

## Limitations

- Sample journeys and fares are illustrative.
- No live operator data, ticket availability, booking, or payment integration.
- Saved journeys and preferences are stored only in the current browser.
