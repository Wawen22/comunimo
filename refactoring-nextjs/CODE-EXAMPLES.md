# Code Examples - ComUniMo Next.js

Esempi di codice pronti all'uso per il refactoring.

---

## 🔐 Authentication Examples

### Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Usage in client components
'use client'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  // ...
}
```

```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  })
}

// Usage in server components
import { createServerClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = createServerClient()
  const { data } = await supabase.from('atleti').select('*')
  // ...
}
```

### Login Server Action

```typescript
// actions/auth.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password troppo corta')
})

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }
  
  const parsed = loginSchema.safeParse(rawData)
  
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }
  
  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  
  if (error) {
    return { error: error.message }
  }
  
  redirect('/dashboard')
}
```

### Login Page

```tsx
// app/(auth)/login/page.tsx
'use client'

import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormState, useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Accesso in corso...' : 'Accedi'}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, { error: null })
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8">
        <h1 className="text-3xl font-bold">Accedi</h1>
        
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
            />
          </div>
          
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          
          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
```

---

## 👥 CRUD Atleti Examples

### API with React Query

```typescript
// lib/api/atleti.ts
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Atleta, AtletaInput } from '@/types/atleta'

export function useAtleti(codSocieta: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['atleti', codSocieta],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atleti')
        .select('*')
        .eq('cod_societa', codSocieta)
        .order('cognome', { ascending: true })
      
      if (error) throw error
      return data as Atleta[]
    }
  })
}

export function useCreateAtleta() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: AtletaInput) => {
      const { data: atleta, error } = await supabase
        .from('atleti')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return atleta
    },
    onSuccess: (_, variables) => {
      // Invalidate query per refresh automatico
      queryClient.invalidateQueries({ 
        queryKey: ['atleti', variables.cod_societa] 
      })
    }
  })
}
```

### Atleti List Page

```tsx
// app/(dashboard)/atleti/page.tsx
'use client'

import { useAtleti } from '@/lib/api/atleti'
import { useUser } from '@/lib/hooks/use-user'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

export default function AtletiPage() {
  const { profile } = useUser()
  const { data: atleti, isLoading } = useAtleti(profile.cod_societa)
  
  const columns = [
    {
      accessorKey: 'cognome',
      header: 'Cognome'
    },
    {
      accessorKey: 'nome',
      header: 'Nome'
    },
    {
      accessorKey: 'codice_fiscale',
      header: 'Codice Fiscale'
    },
    {
      accessorKey: 'categoria',
      header: 'Categoria'
    }
  ]
  
  if (isLoading) {
    return <div>Caricamento...</div>
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Atleti</h1>
        <Button asChild>
          <Link href="/atleti/nuovo">
            <PlusIcon className="mr-2 h-4 w-4" />
            Nuovo Atleta
          </Link>
        </Button>
      </div>
      
      <DataTable columns={columns} data={atleti} />
    </div>
  )
}
```

### Atleta Form with Validation

```tsx
// components/atleti/atleta-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateAtleta } from '@/lib/api/atleti'

const atletaSchema = z.object({
  cognome: z.string().min(2, 'Cognome troppo corto'),
  nome: z.string().min(2, 'Nome troppo corto'),
  codice_fiscale: z.string().length(16, 'Codice fiscale non valido'),
  data_nascita: z.string().refine(
    (date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear()
      return age >= 3 && age <= 100
    },
    'Età non valida'
  ),
  sesso: z.enum(['M', 'F']),
  email: z.string().email('Email non valida').optional(),
  telefono: z.string().optional()
})

type AtletaFormData = z.infer<typeof atletaSchema>

export function AtletaForm({ codSocieta }: { codSocieta: string }) {
  const createAtleta = useCreateAtleta()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AtletaFormData>({
    resolver: zodResolver(atletaSchema)
  })
  
  const onSubmit = async (data: AtletaFormData) => {
    try {
      await createAtleta.mutateAsync({
        ...data,
        cod_societa: codSocieta
      })
      // Redirect o mostra success
    } catch (error) {
      console.error(error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cognome">Cognome *</Label>
          <Input id="cognome" {...register('cognome')} />
          {errors.cognome && (
            <p className="text-sm text-red-500">{errors.cognome.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register('nome')} />
          {errors.nome && (
            <p className="text-sm text-red-500">{errors.nome.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="codice_fiscale">Codice Fiscale *</Label>
        <Input 
          id="codice_fiscale" 
          {...register('codice_fiscale')} 
          maxLength={16}
          className="uppercase"
        />
        {errors.codice_fiscale && (
          <p className="text-sm text-red-500">{errors.codice_fiscale.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="data_nascita">Data di Nascita *</Label>
        <Input id="data_nascita" type="date" {...register('data_nascita')} />
        {errors.data_nascita && (
          <p className="text-sm text-red-500">{errors.data_nascita.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={createAtleta.isPending}>
        {createAtleta.isPending ? 'Salvataggio...' : 'Salva Atleta'}
      </Button>
    </form>
  )
}
```

---

## 📊 Dashboard Examples

### Stats Cards

```tsx
// components/dashboard/stats-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  const isPositive = trend && trend.value > 0
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### Chart Example

```tsx
// components/dashboard/iscrizioni-chart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  mese: string
  iscrizioni: number
}

export function IscrizioniChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mese" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="iscrizioni" 
          stroke="#1e88e5" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

## 🔒 Middleware Protection

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session }
  } = await supabase.auth.getSession()
  
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  // Redirect authenticated users from login
  if (req.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login']
}
```

---

## 🎨 UI Components Examples

### Data Table

```tsx
// components/ui/data-table.tsx
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  })
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nessun risultato.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

---

## 📄 PDF Generation

```typescript
// lib/pdf/ricevuta.ts
import jsPDF from 'jspdf'

export function generateRicevutaPDF(payment: Payment, iscrizioni: Iscrizione[]) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('Ricevuta Pagamento', 20, 20)
  
  // Info pagamento
  doc.setFontSize(12)
  doc.text(`Numero: ${payment.id}`, 20, 40)
  doc.text(`Data: ${new Date(payment.created_at).toLocaleDateString()}`, 20, 50)
  
  // Tabella iscrizioni
  let y = 70
  doc.text('Dettaglio Iscrizioni:', 20, y)
  y += 10
  
  iscrizioni.forEach((isc, i) => {
    doc.setFontSize(10)
    doc.text(`${i + 1}. ${isc.atleta.nome} ${isc.atleta.cognome}`, 25, y)
    doc.text(`${isc.gara.nome} - ${isc.specialita.nome}`, 25, y + 5)
    doc.text(`€ ${isc.importo.toFixed(2)}`, 150, y)
    y += 15
  })
  
  // Totale
  y += 10
  doc.setFontSize(14)
  doc.text(`Totale: € ${payment.importo.toFixed(2)}`, 20, y)
  
  // Save
  doc.save(`ricevuta-${payment.id}.pdf`)
}
```

---

## 🔄 Real-time Subscriptions

```typescript
// lib/realtime/notifications.ts
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
  
  return notifications
}
```

---

## 🧪 Testing Examples

### Unit Test

```typescript
// __tests__/lib/utils/validators.test.ts
import { validateCodiceFiscale } from '@/lib/utils/validators'

describe('validateCodiceFiscale', () => {
  it('should validate correct codice fiscale', () => {
    expect(validateCodiceFiscale('RSSMRA80A01H501U')).toBe(true)
  })
  
  it('should reject invalid length', () => {
    expect(validateCodiceFiscale('RSSMRA80A01')).toBe(false)
  })
  
  it('should reject invalid characters', () => {
    expect(validateCodiceFiscale('RSSMRA80A01H501!')).toBe(false)
  })
})
```

### E2E Test

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

---

Questi esempi forniscono una base solida per iniziare lo sviluppo! 🚀

Per più dettagli, consulta i file nella documentazione completa.
