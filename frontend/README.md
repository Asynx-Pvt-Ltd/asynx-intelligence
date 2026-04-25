# Advanced Template (SaaS)

This template is designed for **real SaaS products, multi-feature applications, and long-term scalable codebases**.

## Architecture

This template follows a **domain-driven, feature-based architecture** for maximum scalability.

```
src/
├── app/
│   ├── auth/                  # Auth feature routes
│   │   ├── login/
│   │   └── signup/
│   ├── app/                   # Main app shell (authenticated)
│   │   ├── billing/
│   │   ├── settings/
│   │   ├── layout.tsx         # App shell layout
│   │   └── page.tsx           # Dashboard
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css
├── features/                  # Feature modules (domains)
│   ├── app-shell/             # Core navigation & layout
│   │   └── components/
│   ├── auth/                  # Authentication domain
│   │   └── lib/
│   ├── billing/               # Billing & subscriptions
│   │   └── lib/
│   └── analytics/             # Analytics tracking
│       └── lib/
├── lib/                       # Shared infrastructure
│   ├── api/                   # API client
│   │   └── client.ts
│   └── config/                # App configuration
│       ├── app.ts
│       └── constants.ts
├── types/                     # Shared TypeScript types
│   └── index.ts
└── utils/                     # Utility functions
```

## Key Principles

### 1. Feature-Based Organization
Each major feature/domain gets its own folder in \`features/\`:
- Contains all feature-specific logic, components, and services
- Self-contained and independently testable
- Easy to extract into microservices later

### 2. Server/Client Boundary
- Services in \`lib/\` folders handle business logic
- Components handle presentation
- Clear separation prevents vendor lock-in

### 3. Shared Infrastructure
The \`lib/\` folder contains code shared across features:
- API client
- Configuration
- Auth utilities
- Database helpers (when added)

### 4. Scalability Patterns
This structure supports:
- Multi-tenant architectures
- Role-based access control
- Feature flags
- Background jobs
- Webhooks and integrations

## Getting Started

### 1. Configure Your App
Edit \`lib/config/app.ts\` with your app details and environment variables.

### 2. Set Up Authentication
Implement real auth in \`features/auth/lib/auth-service.ts\`:
- Add your auth provider (Supabase, Clerk, Auth.js, etc.)
- Update login/signup logic
- Add middleware for route protection

### 3. Add Billing
Implement billing in \`features/billing/lib/billing-service.ts\`:
- Integrate Stripe, Paddle, or your payment provider
- Set up webhooks in \`app/api/webhooks/\`
- Configure subscription plans

### 4. Build Features
Create new feature modules in \`features/\`:
```
features/
  your-feature/
    components/
    lib/
    types/
```

## Best Practices

### Service Layer Pattern
Keep business logic in service files:
```typescript
// features/your-feature/lib/your-service.ts
export class YourService {
  async doSomething() {
    // Business logic here
  }
}
```

### API Routes
Create API routes in \`app/api/\`:
```typescript
// app/api/your-feature/route.ts
export async function POST(request: Request) {
  // Handle request
}
```

### Type Safety
Define shared types in \`types/\`:
```typescript
// types/your-feature.ts
export type YourType = {
  // ...
}
```

## Scaling Considerations

This template is ready for:
- **Multi-tenancy**: Add tenant ID to database queries
- **RBAC**: Extend User type with permissions
- **Feature flags**: Add feature detection to \`lib/config\`
- **Background jobs**: Add \`lib/jobs/\` folder
- **Webhooks**: Create \`app/api/webhooks/\` routes
- **Monitoring**: Integrate Sentry, LogRocket, etc. in \`lib/monitoring\`

## No Vendor Lock-In

This template provides **structure without coupling**:
- Auth service can use any provider
- Billing service works with any payment platform
- Analytics service integrates with any tool
- Database can be added without rewriting

Simply implement the service interfaces with your chosen providers.
```
