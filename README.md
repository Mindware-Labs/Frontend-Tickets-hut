# Call Center Dashboard

A professional admin dashboard for Call Center Ticket Management System built with Next.js 16, TypeScript, Bootstrap 5, and Clerk authentication.

## Features

- **Authentication**: Clerk-based authentication system
- **Dashboard**: KPI cards, charts, and real-time statistics
- **Tickets Management**: Create, view, update, and delete tickets
- **Campaigns**: Manage and track campaigns
- **Reports**: Generate detailed reports with filters
- **Users**: User management with role-based access
- **Responsive**: Mobile-friendly Bootstrap 5 UI

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Bootstrap 5
- **Authentication**: Clerk
- **Styling**: Bootstrap 5, Bootstrap Icons
- **Backend**: Next.js API Routes (BFF pattern)

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up Clerk**:
   - Create a Clerk account at [clerk.com](https://clerk.com)
   - Get your API keys
   - Add them to your environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── tickets/         # Tickets management
│   │   ├── campaigns/       # Campaigns management
│   │   ├── reports/         # Reports & analytics
│   │   ├── users/           # User management
│   │   └── settings/        # Settings page
│   ├── api/                 # Next.js API routes (BFF)
│   │   ├── tickets/
│   │   ├── campaigns/
│   │   ├── users/
│   │   └── dashboard/
│   ├── layout.tsx           # Root layout with Clerk provider
│   └── globals.css          # Global styles
├── components/
│   ├── layout/              # Layout components
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── dashboard-layout.tsx
│   ├── dashboard/           # Dashboard components
│   │   ├── kpi-card.tsx
│   │   ├── chart-card.tsx
│   │   ├── bar-chart.tsx
│   │   └── line-chart.tsx
│   ├── tickets/             # Ticket components
│   │   ├── ticket-filters.tsx
│   │   ├── ticket-table.tsx
│   │   └── pagination.tsx
│   └── common/              # Reusable components
│       ├── status-badge.tsx
│       ├── loading-spinner.tsx
│       ├── empty-state.tsx
│       ├── modal.tsx
│       └── breadcrumb.tsx
├── lib/
│   └── mock-data.ts         # Mock data (replace with API calls)
└── middleware.ts            # Clerk authentication middleware
```

## API Routes

All API routes are located in `app/api/` and follow the BFF (Backend for Frontend) pattern. They currently use mock data but are structured to easily connect to your NestJS backend.

### Available Endpoints:

- `GET /api/tickets` - Get all tickets (with filters)
- `GET /api/tickets/[id]` - Get single ticket
- `POST /api/tickets` - Create ticket
- `PATCH /api/tickets/[id]` - Update ticket
- `DELETE /api/tickets/[id]` - Delete ticket
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/dashboard/stats` - Get dashboard statistics

## Connecting to NestJS Backend

To connect to your NestJS backend:

1. Update the API route handlers in `app/api/*` to make HTTP requests to your NestJS backend
2. Replace mock data imports with actual API calls
3. Example:

```typescript
// app/api/tickets/route.ts
export async function GET(request: Request) {
  const response = await fetch(`${process.env.BACKEND_API_URL}/tickets`);
  const data = await response.json();
  return NextResponse.json(data);
}
```

## Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# NestJS Backend (add when ready)
BACKEND_API_URL=http://localhost:3001/api
```

## Pages

- **Dashboard** (`/dashboard`) - Overview with KPIs and charts
- **Tickets** (`/tickets`) - List and manage tickets
- **Ticket Detail** (`/tickets/[id]`) - View ticket details
- **Campaigns** (`/campaigns`) - Manage campaigns
- **Reports** (`/reports`) - Generate reports
- **Users** (`/users`) - User management
- **Settings** (`/settings`) - Application settings

## License

MIT
