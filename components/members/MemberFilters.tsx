'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MemberFiltersProps {
  filters: {
    search: string;
    societyIds: string[]; // Changed from societyId to societyIds (array)
    category: string;
    status: string;
    showExpiring: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

interface Category {
  code: string;
  description: string;
}

export function MemberFilters({ filters, onFiltersChange }: MemberFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // Fetch categories
      const { data: catsData } = await supabase
        .from('categories')
        .select('code, description')
        .eq('is_active', true)
        .order('code');

      if (catsData) setCategories(catsData);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleReset = () => {
    onFiltersChange({
      search: '',
      societyIds: [],
      category: '',
      status: '',
      showExpiring: false,
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.status ||
    filters.showExpiring;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Altri Filtri</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
          >
            <X className="mr-1 h-4 w-4" />
            Resetta
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Category Filter */}
        <div>
          <Label htmlFor="category-filter">Categoria</Label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Tutte le categorie</option>
            {categories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.code} - {cat.description}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <Label htmlFor="status-filter">Stato</Label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Tutti gli stati</option>
            <option value="active">Attivo</option>
            <option value="suspended">Sospeso</option>
            <option value="expired">Scaduto</option>
            <option value="cancelled">Annullato</option>
          </select>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="mt-4 flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.showExpiring}
            onChange={(e) => onFiltersChange({ ...filters, showExpiring: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-sm text-gray-700">
            Mostra solo tessere in scadenza (30 giorni)
          </span>
        </label>
      </div>
    </div>
  );
}

