# Changelog: Member Stats per Amministratore Società

**Data**: 2025-10-26  
**Autore**: AI Assistant  
**Ticket/Issue**: Modifica sezione ATLETI per Amministratore Società

## Problema

L'utente **Amministratore Società** (`society_admin`) vedeva il numero totale di TUTTI gli atleti nel sistema, invece di vedere solo gli atleti delle società che gestisce.

## Soluzione Implementata

### 1. Aggiornamento Funzione RPC `get_member_stats`

**File modificati**:
- `supabase/migrations/20251026_update_member_stats_rls.sql` (nuova migration)
- `supabase/schema.sql` (aggiunta funzione)

**Modifiche**:
- Rimosso `SECURITY DEFINER` dalla funzione per rispettare le RLS policies
- Aggiunta logica per filtrare gli atleti in base al ruolo dell'utente:
  - **Admin/Super Admin**: Vedono TUTTI gli atleti attivi
  - **Society Admin**: Vedono SOLO gli atleti delle società assegnate (tramite `user_societies`)
  - **Altri ruoli**: Nessun dato
- **Fix**: Usato prefisso `v_` per le variabili locali per evitare ambiguità con i nomi delle colonne

**Codice**:
```sql
CREATE OR REPLACE FUNCTION public.get_member_stats()
RETURNS TABLE(total_count bigint, organization text, org_count bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_role text;  -- v_ prefix to avoid ambiguity
  v_user_id uuid;    -- v_ prefix to avoid ambiguity
BEGIN
  v_user_id := auth.uid();

  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_user_role IN ('admin', 'super_admin') THEN
    -- Return all members
    RETURN QUERY
    SELECT COUNT(*), m.organization, COUNT(*)
    FROM public.members m
    WHERE m.is_active = true
    GROUP BY m.organization;

  ELSIF v_user_role = 'society_admin' THEN
    -- Return only members from assigned societies
    RETURN QUERY
    SELECT COUNT(*), m.organization, COUNT(*)
    FROM public.members m
    WHERE m.is_active = true
      AND EXISTS (
        SELECT 1 FROM public.user_societies us
        WHERE us.user_id = v_user_id  -- Use v_user_id variable
          AND us.society_id = m.society_id
      )
    GROUP BY m.organization;

  ELSE
    -- Return empty result
    RETURN QUERY
    SELECT 0::bigint, ''::text, 0::bigint
    WHERE false;
  END IF;
END;
$$;
```

### 2. Aggiornamento Componente `MemberStats`

**File modificato**:
- `components/members/MemberStats.tsx`

**Modifiche**:
- Importato hook `useUser` per ottenere il profilo dell'utente corrente
- Aggiunta logica per mostrare testo diverso in base al ruolo:
  - **Society Admin**: "Atleti Gestiti" / "atleti gestiti"
  - **Admin/Super Admin**: "Atleti Registrati" / "atleti totali"

**Codice**:
```typescript
export function MemberStats() {
  const { profile } = useUser();
  // ... existing code ...

  // Determine title based on user role
  const isSocietyAdmin = profile?.role === 'society_admin';
  const title = isSocietyAdmin ? 'Atleti Gestiti' : 'Atleti Registrati';
  const subtitle = isSocietyAdmin
    ? (stats.total === 1 ? 'atleta gestito' : 'atleti gestiti')
    : (stats.total === 1 ? 'atleta totale' : 'atleti totali');

  return (
    <div>
      <h3>{title}</h3>
      <p>{stats.total}</p>
      <p>{subtitle}</p>
      {/* ... rest of component ... */}
    </div>
  );
}
```

## Risultato

### Prima delle modifiche:
- **Amministratore Società** vedeva: "Atleti Registrati: 150 atleti totali" (TUTTI gli atleti del sistema)

### Dopo le modifiche:
- **Amministratore Società** vede: "Atleti Gestiti: 25 atleti gestiti" (SOLO gli atleti delle sue società)
- **Admin/Super Admin** vede: "Atleti Registrati: 150 atleti totali" (TUTTI gli atleti del sistema)

## Testing

Per testare le modifiche:

1. **Come Amministratore Società**:
   - Login con un utente `society_admin`
   - Navigare a `/dashboard/members`
   - Verificare che il titolo sia "Atleti Gestiti"
   - Verificare che il numero mostrato corrisponda solo agli atleti delle società assegnate

2. **Come Admin/Super Admin**:
   - Login con un utente `admin` o `super_admin`
   - Navigare a `/dashboard/members`
   - Verificare che il titolo sia "Atleti Registrati"
   - Verificare che il numero mostrato corrisponda a TUTTI gli atleti attivi

## Note Tecniche

- La funzione RPC ora rispetta le RLS policies esistenti sulla tabella `members`
- Il filtro avviene a livello di database, garantendo sicurezza e performance
- Il componente React è ora "role-aware" e mostra il testo appropriato
- Le modifiche sono retrocompatibili con gli altri ruoli

## Bug Fix: Ambiguous Column Reference

### Problema Riscontrato
Dopo la prima implementazione, si verificava l'errore:
```
Error code: 42702
Message: "column reference 'user_id' is ambiguous"
Details: "It could refer to either a PL/pgSQL variable or a table column."
```

### Causa
La variabile locale `user_id` aveva lo stesso nome della colonna `user_id` nella tabella `user_societies`, causando ambiguità nella subquery EXISTS.

### Soluzione
Rinominato le variabili locali con prefisso `v_`:
- `user_id` → `v_user_id`
- `user_role` → `v_user_role`

Questo è una best practice in PL/pgSQL per evitare conflitti tra nomi di variabili e nomi di colonne.

## Migration

La migration è stata applicata al database Supabase:
- **File**: `supabase/migrations/20251026_update_member_stats_rls.sql`
- **Stato**: ✅ Applicata e corretta
- **Schema**: ✅ Aggiornato in `supabase/schema.sql`

