'use client';

import { useState } from 'react';
import { Member } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, X, CheckSquare } from 'lucide-react';

interface MemberSelectionListProps {
  members: Member[];
  selectedMemberIds: string[];
  onSelectionChange: (memberIds: string[]) => void;
  alreadyRegisteredIds?: string[];
}

export default function MemberSelectionList({
  members,
  selectedMemberIds,
  onSelectionChange,
  alreadyRegisteredIds = [],
}: MemberSelectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members by search query only
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || member.fiscal_code?.toLowerCase().includes(query);
    return matchesSearch;
  });

  const handleToggleMember = (memberId: string) => {
    if (alreadyRegisteredIds.includes(memberId)) {
      return; // Cannot select already registered members
    }

    if (selectedMemberIds.includes(memberId)) {
      onSelectionChange(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      onSelectionChange([...selectedMemberIds, memberId]);
    }
  };

  const handleSelectAll = () => {
    const availableMembers = filteredMembers.filter(
      (m) => !alreadyRegisteredIds.includes(m.id)
    );
    const availableIds = availableMembers.map((m) => m.id);
    const allSelected = availableIds.every((id) => selectedMemberIds.includes(id));

    if (allSelected) {
      // Deselect all filtered members
      onSelectionChange(selectedMemberIds.filter((id) => !availableIds.includes(id)));
    } else {
      // Select all filtered members
      const newSelection = [...new Set([...selectedMemberIds, ...availableIds])];
      onSelectionChange(newSelection);
    }
  };

  const handleResetAll = () => {
    onSelectionChange([]);
  };

  // Calculate available members (not already registered)
  const availableMembers = members.filter((m) => !alreadyRegisteredIds.includes(m.id));
  const availableFilteredMembers = filteredMembers.filter(
    (m) => !alreadyRegisteredIds.includes(m.id)
  );
  const allFilteredSelected = availableFilteredMembers.length > 0 &&
    availableFilteredMembers.every((m) => selectedMemberIds.includes(m.id));

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-blue h-4 w-4" />
        <Input
          placeholder="Cerca atleta per nome o codice fiscale..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-brand-blue focus:ring-brand-blue/20"
        />
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-4">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">
              {selectedMemberIds.length} atleti selezionati
            </p>
            <p className="text-sm text-blue-700">
              {availableMembers.length} atleti disponibili
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {availableFilteredMembers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              {allFilteredSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
            </Button>
          )}
          {selectedMemberIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
              title="Resetta tutte le selezioni"
            >
              <X className="h-4 w-4" />
              Resetta
            </Button>
          )}
        </div>
      </div>

      {/* Members Display */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-white">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery
              ? 'Nessun atleta trovato con questi criteri'
              : 'Nessun atleta disponibile'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table (≥768px) */}
          <div className="hidden md:block rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={availableFilteredMembers.length === 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Data Nascita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tessera
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stato
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredMembers.map((member) => {
                  const isRegistered = alreadyRegisteredIds.includes(member.id);
                  const isSelected = selectedMemberIds.includes(member.id);

                  return (
                    <tr
                      key={member.id}
                      className={`${
                        isRegistered
                          ? 'bg-gray-50 opacity-60'
                          : isSelected
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      } ${!isRegistered ? 'cursor-pointer' : ''}`}
                      onClick={() => !isRegistered && handleToggleMember(member.id)}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          disabled={isRegistered}
                          onCheckedChange={() => handleToggleMember(member.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">
                        {member.birth_date
                          ? new Date(member.birth_date).toLocaleDateString('it-IT')
                          : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <Badge
                          variant={
                            member.organization === 'FIDAL'
                              ? 'default'
                              : member.organization === 'UISP'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {member.organization || '-'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">
                        {member.category || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">
                        {member.membership_number || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        {isRegistered && (
                          <Badge variant="secondary" className="text-xs">Già iscritto</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Layout (<768px) */}
        <div className="md:hidden space-y-3">
          {filteredMembers.map((member) => {
            const isRegistered = alreadyRegisteredIds.includes(member.id);
            const isSelected = selectedMemberIds.includes(member.id);

            return (
              <div
                key={member.id}
                onClick={() => !isRegistered && handleToggleMember(member.id)}
                className={`relative rounded-xl border-2 p-4 transition-all ${
                  isRegistered
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-md'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm active:scale-[0.98]'
                } ${!isRegistered ? 'cursor-pointer' : ''}`}
              >
                {/* Checkbox - Top Right */}
                <div className="absolute top-3 right-3">
                  <Checkbox
                    checked={isSelected}
                    disabled={isRegistered}
                    onCheckedChange={() => handleToggleMember(member.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6"
                  />
                </div>

                {/* Member Info */}
                <div className="pr-10 space-y-2">
                  {/* Name */}
                  <div className="font-semibold text-gray-900 text-base">
                    {member.first_name} {member.last_name}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {/* Birth Date */}
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Data Nascita</div>
                      <div className="text-gray-700">
                        {member.birth_date
                          ? new Date(member.birth_date).toLocaleDateString('it-IT')
                          : '-'}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Categoria</div>
                      <div className="text-gray-700">{member.category || '-'}</div>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Organization Badge */}
                    <Badge
                      variant={
                        member.organization === 'FIDAL'
                          ? 'default'
                          : member.organization === 'UISP'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {member.organization || '-'}
                    </Badge>

                    {/* Membership Number */}
                    {member.membership_number && (
                      <span className="text-xs text-gray-500">
                        Tessera: {member.membership_number}
                      </span>
                    )}

                    {/* Already Registered Badge */}
                    {isRegistered && (
                      <Badge variant="secondary" className="text-xs">
                        Già iscritto
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
      )}
    </div>
  );
}

