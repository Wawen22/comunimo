# Setup Guide

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Git Hooks (Husky)

To enable pre-commit hooks with Husky, run:

```bash
npm run prepare
npx husky add .husky/pre-commit "npx lint-staged"
```

This will:
- Initialize Husky
- Create a pre-commit hook that runs lint-staged
- Automatically format and lint your code before each commit

### 3. Environment Variables

The `.env.local` file is already configured with Supabase credentials. If you need to update them:

1. Copy `.env.example` to `.env.local`
2. Update the values with your Supabase project credentials

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## WSL/Windows Users

If you're using WSL and encounter UNC path issues:

### Option 1: Use WSL Terminal Directly

```bash
# Open WSL terminal
wsl

# Navigate to project
cd ~/Progetti/NEB/www.comitatounitariomodena.eu/refactoring-nextjs/comunimo-next

# Run commands
npm install
npm run dev
```

### Option 2: Map to Windows Drive

```powershell
# In PowerShell (as Administrator)
net use Z: \\wsl.localhost\Ubuntu-24.04\home\rnebili\Progetti\NEB\www.comitatounitariomodena.eu\refactoring-nextjs\comunimo-next

# Navigate to drive
cd Z:\
npm run dev
```

## Next Steps

1. **Install additional shadcn/ui components** as needed:
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

2. **Set up Supabase database schema** in your Supabase project

3. **Configure authentication** in Supabase dashboard

4. **Start building features** according to the migration plan

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
npm run clean
npm run build
```

### Type Errors

```bash
# Check TypeScript errors
npm run type-check
```

### Linting Issues

```bash
# Auto-fix linting issues
npm run lint:fix
```

### Format Code

```bash
# Format all files
npm run format
```

## Development Workflow

1. Create a new branch for your feature
2. Make changes
3. Run `npm run type-check` to check for TypeScript errors
4. Run `npm run lint:fix` to fix linting issues
5. Commit your changes (pre-commit hooks will run automatically)
6. Push to remote
7. Create a pull request

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |
| `npm run clean` | Clean build cache |
| `npm run prepare` | Initialize Husky |

