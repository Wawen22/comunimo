# ComUniMo - Next.js Application

Sistema di gestione modernizzato per il Comitato Unitario Modena, costruito con Next.js 14, TypeScript e Supabase.

## 🚀 Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: shadcn/ui (Radix UI)
- **Form Management**: React Hook Form + Zod
- **Data Fetching**: TanStack Query v5
- **Backend**: Supabase (PostgreSQL + Auth)
- **Package Manager**: npm

## 📁 Struttura del Progetto

```
comunimo-next/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group: authentication
│   ├── (dashboard)/       # Route group: protected dashboard
│   ├── (admin)/           # Route group: admin area
│   ├── (public)/          # Route group: public pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── loading.tsx        # Global loading
│   ├── error.tsx          # Global error
│   ├── not-found.tsx      # 404 page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   ├── dashboard/         # Dashboard widgets
│   ├── tables/            # Data tables
│   └── shared/            # Shared components
├── lib/
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── api/               # API clients
│   └── constants/         # Constants
├── types/                 # TypeScript types
├── actions/               # Server Actions
└── public/                # Static assets
```

## 🎨 Design System

### Brand Colors
- **Blue Dark**: `#223f4a` - Primary brand color
- **Blue**: `#1e88e5` - Accent color
- **Red**: `#ff5252` - Error/destructive actions

### Typography
- **Font Family**: Inter (Google Fonts)

### Breakpoints
- **Mobile**: 640px
- **Tablet**: 768px
- **Desktop**: 1024px
- **Wide**: 1280px

### Spacing
- Base unit: 4px
- Tailwind default spacing scale

## 🛠️ Setup

### Prerequisites
- Node.js 18+ LTS
- npm

### Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env.local`
   - Update with your Supabase credentials (already configured)

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Important Note for WSL Users

If you're running this project in WSL and encounter UNC path issues, you have two options:

**Option 1: Use WSL terminal directly**
```bash
# Navigate to the project directory in WSL
cd ~/Progetti/NEB/www.comitatounitariomodena.eu/refactoring-nextjs/comunimo-next

# Run commands
npm run dev
npm run build
```

**Option 2: Map WSL path to Windows drive**
```powershell
# In PowerShell (as Administrator)
net use Z: \\wsl.localhost\Ubuntu-24.04\home\rnebili\Progetti\NEB\www.comitatounitariomodena.eu\refactoring-nextjs\comunimo-next

# Then navigate to Z: drive
cd Z:\
npm run dev
```

## 📜 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build cache

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration with design tokens
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `components.json` - shadcn/ui configuration

## 📦 Path Aliases

The following path aliases are configured in `tsconfig.json`:

- `@/*` - Root directory
- `@components/*` - Components directory
- `@lib/*` - Library directory
- `@types/*` - Types directory
- `@actions/*` - Server Actions directory

Example usage:
```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/lib/constants/routes';
```

## 🎯 Next Steps

1. **Install shadcn/ui components**:
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add form
   # ... add other components as needed
   ```

2. **Configure Supabase client** (lib/api/supabase.ts)

3. **Set up authentication** (app/(auth)/login/page.tsx)

4. **Create database schema** in Supabase

5. **Implement core features** according to migration plan

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

## 🔐 Environment Variables

Required environment variables (already configured in `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://rlhzsztbkfjpryhlojee.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🚨 Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear Next.js cache: `npm run clean`
- Check TypeScript errors: `npm run type-check`

### UNC Path Issues (Windows/WSL)
- Use WSL terminal directly instead of PowerShell
- Or map the WSL path to a Windows drive letter (see Setup section)

### Port Already in Use
- Change the port: `PORT=3001 npm run dev`
- Or kill the process using port 3000

## 📄 License

Private project for Comitato Unitario Modena

## 👥 Contributors

- Development Team - Initial setup and migration

---

**Project Status**: Phase 1 - Foundation Setup ✅
**Next Phase**: Phase 2 - Core Features Implementation

