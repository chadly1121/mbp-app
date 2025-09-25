# Stack Summary

## 🎯 **Frontend Framework & Build Tool**
- **Framework**: React `^18.3.1` (SPA with React Router `^6.30.1`)
- **Build Tool**: Vite `^5.4.19` with SWC plugin (`@vitejs/plugin-react-swc ^3.11.0`)
- **Bundler**: ES modules with Vite's Rollup-based bundler
- **Development Server**: Vite dev server on port 8080
- **Confidence**: 100% ✅ (vite.config.ts, package.json confirmed)

### Key Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "@tanstack/react-query": "^5.83.0"
}
```

## 🖥️ **Backend Runtime & Framework**
- **Runtime**: Deno (Supabase Edge Functions)
- **Framework**: Supabase Edge Functions with TypeScript
- **Architecture**: Serverless functions
- **Authentication**: Supabase Auth with JWT verification
- **Confidence**: 100% ✅ (supabase/functions/, config.toml confirmed)

### Edge Functions Detected
```toml
[functions.qbo-auth]
verify_jwt = true

[functions.qbo-sync] 
verify_jwt = true
```

## 📦 **Package Manager**
- **Primary**: npm (package-lock.json v3 present)
- **Secondary**: Bun (bun.lockb present - dual setup)
- **Scripts**: Standard Vite commands (dev, build, preview, lint)
- **Confidence**: 100% ✅ (Both lockfiles detected)

### Package Scripts
```json
{
  "dev": "vite",
  "build": "vite build", 
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## 🔧 **Type System & Linters/Formatters**
- **Type System**: TypeScript `^5.8.3` (relaxed strict mode)
- **Linter**: ESLint `^9.32.0` with typescript-eslint `^8.38.0`
- **Config**: Flat config with React hooks rules
- **Formatter**: None detected (no Prettier config found)
- **Confidence**: 100% ✅ (tsconfig.json, eslint.config.js confirmed)

### TypeScript Configuration
```json
{
  "strict": false,
  "noImplicitAny": false,
  "skipLibCheck": true,
  "target": "ES2020",
  "module": "ESNext"
}
```

## 🧪 **Test Frameworks**
- **Status**: ❌ No test frameworks detected
- **Searched for**: jest, vitest, cypress, playwright
- **Confidence**: 95% ✅ (No test configs or dependencies found)

## 🗄️ **Database & ORM**
- **Database**: Supabase (PostgreSQL) 
- **Client**: @supabase/supabase-js `^2.57.4`
- **ORM/Query Builder**: Supabase client (built-in PostgrestJS)
- **Migrations**: Supabase migrations system
- **Project ID**: `qdrcpflmnxhkzrlhdhda`
- **Confidence**: 100% ✅ (supabase/config.toml, client usage confirmed)

### Database Tables (Detected from Types)
- action_items, ar_tracker, budget_plans, cash_flow_projections
- chart_of_accounts, companies, habits_tracker, implementation_plan
- income_statements, job_planner, kpis, lead_funnel, marketing_plan
- And 15+ more business-specific tables

## 🚀 **CI/CD Provider**
- **Status**: ❌ No CI/CD detected
- **Searched for**: .github/workflows, .gitlab-ci.yml, .circleci
- **Confidence**: 95% ✅ (No CI/CD configs found)

## 🐳 **Docker/Infrastructure/IaC**
- **Docker**: ❌ No Dockerfile or docker-compose.yml found
- **Infrastructure**: Supabase Cloud (serverless)
- **IaC**: ❌ No Terraform, CloudFormation, or CDK detected
- **Deployment**: Likely using Supabase hosting + static site hosting
- **Confidence**: 90% ✅ (No container/IaC files detected)

## 🎨 **UI/Styling Framework**
- **CSS Framework**: Tailwind CSS `^3.4.17`
- **Component Library**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React `^0.462.0`
- **Animations**: tailwindcss-animate `^1.0.7`
- **Theme**: CSS variables with dark mode support
- **Confidence**: 100% ✅ (components.json, tailwind.config.ts confirmed)

### UI Component Ecosystem
```json
{
  "@radix-ui/react-*": "^1.1.14+",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

## 🔐 **Authentication & Security**
- **Provider**: Supabase Auth
- **Method**: JWT tokens with Row Level Security (RLS)
- **Forms**: React Hook Form `^7.61.1` + Zod validation `^3.25.76`
- **CAPTCHA**: Cloudflare Turnstile (`@marsidev/react-turnstile ^1.3.1`)
- **Confidence**: 100% ✅ (Dependencies and auth patterns confirmed)

## 📈 **Additional Libraries**
- **Charts**: Recharts `^2.15.4`
- **Dates**: date-fns `^3.6.0` + react-day-picker `^8.10.1`
- **Carousel**: Embla Carousel React `^8.6.0`
- **Notifications**: Sonner `^1.7.4`
- **Drawer**: Vaul `^0.9.9`

## 🏗️ **Architecture Pattern**
- **Frontend**: Single Page Application (SPA) with client-side routing
- **Backend**: Serverless functions (Supabase Edge Functions)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: JWT-based with Supabase Auth
- **State Management**: React Query for server state, React hooks for local state
- **Styling**: Utility-first CSS with component library

## 📊 **Project Maturity Indicators**
- ✅ **Type Safety**: TypeScript with custom type definitions
- ✅ **Code Quality**: ESLint with React-specific rules  
- ✅ **UI Consistency**: Comprehensive design system with shadcn/ui
- ✅ **Authentication**: Production-ready auth with RLS
- ✅ **Database**: Structured schema with 30+ business tables
- ❌ **Testing**: No test coverage
- ❌ **CI/CD**: No automation pipelines
- ❌ **Containerization**: No Docker setup

**Overall Confidence Level**: 98% ✅ (Comprehensive analysis of all major stack components)