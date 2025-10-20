# Spec Delta: Project Setup

## ADDED Requirements

### Requirement: Next.js 14 Project Initialization
The system SHALL create a new Next.js 14 project with App Router, TypeScript, and Tailwind CSS configured.

#### Scenario: Create project with create-next-app
- **WHEN** running `npx create-next-app@latest comunimo-next --typescript --app --tailwind --eslint`
- **THEN** a new Next.js 14 project is created
- **AND** TypeScript is configured
- **AND** Tailwind CSS is configured
- **AND** ESLint is configured
- **AND** App Router is enabled

#### Scenario: Verify project structure
- **WHEN** project is created
- **THEN** the following directories exist: `app/`, `public/`, `node_modules/`
- **AND** the following files exist: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`

### Requirement: TypeScript Strict Mode Configuration
The system SHALL configure TypeScript in strict mode with appropriate compiler options.

#### Scenario: Configure strict mode
- **WHEN** editing `tsconfig.json`
- **THEN** `"strict": true` is set
- **AND** `"noUncheckedIndexedAccess": true` is set
- **AND** `"noImplicitReturns": true` is set
- **AND** `"forceConsistentCasingInFileNames": true` is set

#### Scenario: Configure path aliases
- **WHEN** editing `tsconfig.json`
- **THEN** path aliases are configured:
  - `@/*` → `./*`
  - `@components/*` → `./components/*`
  - `@lib/*` → `./lib/*`
  - `@types/*` → `./types/*`
  - `@actions/*` → `./actions/*`

### Requirement: Next.js Configuration Optimization
The system SHALL configure Next.js with optimizations for production.

#### Scenario: Configure next.config.js
- **WHEN** editing `next.config.js`
- **THEN** the following options are set:
  - `reactStrictMode: true`
  - `swcMinify: true`
  - Image optimization configured
  - Environment variables exposed correctly

#### Scenario: Configure experimental features
- **WHEN** using App Router features
- **THEN** Server Actions are enabled
- **AND** Server Components are used by default

### Requirement: Dependency Management
The system SHALL install and manage all required dependencies with specific versions.

#### Scenario: Install core dependencies
- **WHEN** running `npm install`
- **THEN** the following packages are installed:
  - `next@^14.2.0`
  - `react@^18.3.0`
  - `react-dom@^18.3.0`
  - `typescript@^5.3.0`

#### Scenario: Install UI dependencies
- **WHEN** installing UI libraries
- **THEN** the following packages are installed:
  - `tailwindcss@^3.4.0`
  - `@radix-ui/react-*` (various components)
  - `framer-motion@^11.0.0`
  - `lucide-react@latest`

#### Scenario: Install form dependencies
- **WHEN** installing form libraries
- **THEN** the following packages are installed:
  - `react-hook-form@^7.50.0`
  - `zod@^3.22.0`
  - `@hookform/resolvers@^3.3.0`

#### Scenario: Install data management dependencies
- **WHEN** installing data libraries
- **THEN** the following packages are installed:
  - `@tanstack/react-query@^5.0.0`
  - `date-fns@^3.0.0`
  - `recharts@^2.10.0`

### Requirement: Folder Structure Creation
The system SHALL create an enterprise-ready folder structure following Next.js best practices.

#### Scenario: Create app directory structure
- **WHEN** setting up the project
- **THEN** the following directories are created under `app/`:
  - `(auth)/` - route group for authentication
  - `(dashboard)/` - route group for protected dashboard
  - `(admin)/` - route group for admin area
  - `(public)/` - route group for public pages
  - `api/` - API routes

#### Scenario: Create components directory structure
- **WHEN** setting up the project
- **THEN** the following directories are created under `components/`:
  - `ui/` - shadcn/ui components
  - `layout/` - layout components
  - `forms/` - form components
  - `dashboard/` - dashboard widgets
  - `tables/` - data tables
  - `shared/` - shared components

#### Scenario: Create lib directory structure
- **WHEN** setting up the project
- **THEN** the following directories are created under `lib/`:
  - `utils/` - utility functions
  - `hooks/` - custom React hooks
  - `api/` - API clients
  - `constants/` - constants

#### Scenario: Create additional directories
- **WHEN** setting up the project
- **THEN** the following directories are created:
  - `types/` - TypeScript types
  - `actions/` - Server Actions
  - `public/` - static assets

### Requirement: Environment Variables Setup
The system SHALL configure environment variables for different environments.

#### Scenario: Create .env.example
- **WHEN** setting up environment variables
- **THEN** a `.env.example` file is created
- **AND** it contains placeholders for all required variables
- **AND** it includes comments explaining each variable

#### Scenario: Configure .gitignore
- **WHEN** setting up git
- **THEN** `.env.local` is added to `.gitignore`
- **AND** `.env*.local` files are ignored
- **AND** sensitive files are not committed

### Requirement: Package Scripts Configuration
The system SHALL configure npm scripts for common development tasks.

#### Scenario: Configure development scripts
- **WHEN** editing `package.json`
- **THEN** the following scripts are defined:
  - `dev` - start development server
  - `build` - build for production
  - `start` - start production server
  - `lint` - run ESLint
  - `lint:fix` - run ESLint with auto-fix
  - `format` - run Prettier
  - `type-check` - run TypeScript compiler check

#### Scenario: Run development server
- **WHEN** running `npm run dev`
- **THEN** the development server starts on port 3000
- **AND** hot reload is enabled
- **AND** Fast Refresh works correctly

### Requirement: Build Verification
The system SHALL build successfully without errors or warnings.

#### Scenario: Production build
- **WHEN** running `npm run build`
- **THEN** the build completes successfully
- **AND** no TypeScript errors are reported
- **AND** no ESLint errors are reported
- **AND** bundle size is optimized

#### Scenario: Type checking
- **WHEN** running `npm run type-check`
- **THEN** TypeScript compilation succeeds
- **AND** no type errors are found
- **AND** strict mode checks pass

