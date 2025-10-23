'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Society {
  id: string;
  name: string;
  society_code: string | null;
}

interface SocietyMultiSelectProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  societies: Society[];
}

export function SocietyMultiSelect({
  selectedIds,
  onSelectionChange,
  societies,
}: SocietyMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter societies based on search query
  const filteredSocieties = societies.filter((society) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = society.name.toLowerCase().includes(searchLower);
    const codeMatch = society.society_code?.toLowerCase().includes(searchLower);
    return nameMatch || codeMatch;
  });

  const handleToggle = (societyId: string) => {
    const newSelection = selectedIds.includes(societyId)
      ? selectedIds.filter((id) => id !== societyId)
      : [...selectedIds, societyId];
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getSelectedSocieties = () => {
    return societies.filter((s) => selectedIds.includes(s.id));
  };

  const formatSocietyLabel = (society: Society) => {
    return society.society_code
      ? `${society.name} (${society.society_code})`
      : society.name;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {selectedIds.length === 0 ? (
            <span className="text-gray-500">Seleziona società...</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {getSelectedSocieties().slice(0, 2).map((society) => (
                <Badge
                  key={society.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {society.society_code || society.name}
                </Badge>
              ))}
              {selectedIds.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedIds.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="rounded-sm p-1 hover:bg-gray-200"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {/* Search Input */}
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Cerca società..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Header with count and clear button */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-xs font-medium text-gray-700">
              {selectedIds.length} selezionate
            </span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Deseleziona tutto
              </button>
            )}
          </div>

          {/* Society List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredSocieties.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Nessuna società trovata
              </div>
            ) : (
              <div className="p-1">
                {filteredSocieties.map((society) => {
                  const isSelected = selectedIds.includes(society.id);
                  return (
                    <button
                      key={society.id}
                      type="button"
                      onClick={() => handleToggle(society.id)}
                      className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="flex-1 truncate">
                        {formatSocietyLabel(society)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

