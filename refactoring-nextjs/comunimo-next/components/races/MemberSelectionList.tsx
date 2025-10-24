'use client';

import { useState } from 'react';
import { Member } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';

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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Cerca atleta per nome o codice fiscale..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
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
        {availableFilteredMembers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {allFilteredSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
          </Button>
        )}
      </div>

      {/* Members Table */}
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
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
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
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={isSelected}
                          disabled={isRegistered}
                          onCheckedChange={() => handleToggleMember(member.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.fiscal_code || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {member.birth_date
                          ? new Date(member.birth_date).toLocaleDateString('it-IT')
                          : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge
                          variant={
                            member.organization === 'FIDAL'
                              ? 'default'
                              : member.organization === 'UISP'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {member.organization || '-'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {member.category || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {member.membership_number || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isRegistered && (
                          <Badge variant="secondary">Già iscritto</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

