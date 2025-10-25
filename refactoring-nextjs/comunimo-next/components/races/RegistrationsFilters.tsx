'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, SlidersHorizontal, Trophy, Flag, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RegistrationsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedOrganizations: string[];
  onOrganizationsChange: (orgs: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (cats: string[]) => void;
  availableCategories: string[];
  totalCount: number;
  filteredCount: number;
}

/**
 * Modern filters component for registrations
 * Features:
 * - Real-time search with icon
 * - Chip-based filter selection
 * - Quick filter buttons
 * - Advanced filters dropdown
 * - Active filters count badge
 * - Clear all filters button
 */
export function RegistrationsFilters({
  searchQuery,
  onSearchChange,
  selectedOrganizations,
  onOrganizationsChange,
  selectedCategories,
  onCategoriesChange,
  availableCategories,
  totalCount,
  filteredCount,
}: RegistrationsFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const organizations = [
    { value: 'FIDAL', label: 'FIDAL', icon: Trophy, color: 'from-green-500 to-green-600' },
    { value: 'UISP', label: 'UISP', icon: Flag, color: 'from-purple-500 to-purple-600' },
    { value: 'CSI', label: 'CSI', icon: Award, color: 'from-blue-500 to-blue-600' },
    { value: 'RUNCARD', label: 'Runcard', icon: Users, color: 'from-orange-500 to-orange-600' },
  ];

  const toggleOrganization = (org: string) => {
    if (selectedOrganizations.includes(org)) {
      onOrganizationsChange(selectedOrganizations.filter(o => o !== org));
    } else {
      onOrganizationsChange([...selectedOrganizations, org]);
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      onCategoriesChange(selectedCategories.filter(c => c !== cat));
    } else {
      onCategoriesChange([...selectedCategories, cat]);
    }
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onOrganizationsChange([]);
    onCategoriesChange([]);
  };

  const activeFiltersCount = selectedOrganizations.length + selectedCategories.length + (searchQuery ? 1 : 0);

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Cerca per nome, cognome, codice fiscale, numero tessera..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-12 text-base border-2 focus:border-brand-blue transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Advanced Filters Button */}
        <DropdownMenu open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-12 px-4 border-2 transition-all',
                activeFiltersCount > 0 && 'border-brand-blue bg-brand-blue/5'
              )}
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filtri
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-brand-blue text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Filtra per Categoria</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableCategories.length > 0 ? (
              availableCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="px-2 py-4 text-sm text-gray-500 text-center">
                Nessuna categoria disponibile
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="h-12 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-5 w-5 mr-2" />
            Cancella
          </Button>
        )}
      </div>

      {/* Quick Organization Filters - Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600 mr-2">Organizzazione:</span>
        {organizations.map((org) => {
          const Icon = org.icon;
          const isSelected = selectedOrganizations.includes(org.value);
          
          return (
            <button
              key={org.value}
              onClick={() => toggleOrganization(org.value)}
              className={cn(
                'group relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
                'border-2 flex items-center gap-2',
                isSelected
                  ? `bg-gradient-to-r ${org.color} text-white border-transparent shadow-lg scale-105`
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-md'
              )}
            >
              <Icon className={cn('h-4 w-4', isSelected ? 'text-white' : 'text-gray-500')} />
              {org.label}
              {isSelected && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Category Filters - Chips */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600 mr-2">Categorie:</span>
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="px-3 py-1.5 text-sm font-semibold bg-brand-blue/10 text-brand-blue border-2 border-brand-blue/20 hover:bg-brand-blue/20 cursor-pointer transition-colors"
              onClick={() => toggleCategory(category)}
            >
              {category}
              <X className="ml-2 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">
            Visualizzati <span className="font-bold text-gray-900">{filteredCount}</span> di{' '}
            <span className="font-bold text-gray-900">{totalCount}</span> iscritti
          </span>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 text-brand-blue">
            <Filter className="h-4 w-4" />
            <span className="font-semibold">{activeFiltersCount} filtri attivi</span>
          </div>
        )}
      </div>
    </div>
  );
}

