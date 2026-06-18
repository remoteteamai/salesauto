# Melioro AI - Web Application

AI-native revenue workforce platform for modern sales teams.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn UI
- **State Management**: Zustand
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/        # Dashboard pages
│   │   ├── dashboard/
│   │   ├── prospects/
│   │   ├── campaigns/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── admin/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── layout/             # Layout components (sidebar, header)
│   └── dashboard/          # Dashboard-specific components
├── lib/                    # Utilities and API client
├── stores/                 # Zustand stores
└── styles/                 # Global styles
```

## Features

- **Landing Page**: Hero, features, testimonials, pricing sections
- **Authentication**: Login and signup with form validation
- **Dashboard**: KPI cards, pipeline overview, activity feed
- **Prospects**: List view with filters and CRUD operations
- **Campaigns**: Multi-channel campaign management
- **Analytics**: Revenue analytics, team performance, funnel visualization
- **Settings**: Profile, notifications, appearance, security, integrations
- **Admin Portal**: User management, subscriptions, audit log

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:e2e` - Run Playwright e2e tests

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
