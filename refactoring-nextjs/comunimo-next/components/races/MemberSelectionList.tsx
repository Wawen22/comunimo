'use client';

import { useState, useEffect } from 'react';
import { Member } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Filter members by search query
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || member.fiscal_code?.toLowerCase().includes(query);
  });

  // Group members by organization
  const fidalMembers = filteredMembers.filter((m) => m.organization === 'FIDAL');
  const uispMembers = filteredMembers.filter((m) => m.organization === 'UISP');
  const otherMembers = filteredMembers.filter(
    (m) => m.organization !== 'FIDAL' && m.organization !== 'UISP'
  );

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

  const handleSelectAll = (memberIds: string[]) => {
    const availableIds = memberIds.filter((id) => !alreadyRegisteredIds.includes(id));
    const allSelected = availableIds.every((id) => selectedMemberIds.includes(id));

    if (allSelected) {
      // Deselect all
      onSelectionChange(selectedMemberIds.filter((id) => !availableIds.includes(id)));
    } else {
      // Select all
      const newSelection = [...new Set([...selectedMemberIds, ...availableIds])];
      onSelectionChange(newSelection);
    }
  };

  const renderMemberGroup = (
    title: string,
    groupMembers: Member[],
    color: 'blue' | 'green' | 'gray'
  ) => {
    if (groupMembers.length === 0) return null;

    const availableMembers = groupMembers.filter(
      (m) => !alreadyRegisteredIds.includes(m.id)
    );
    const allSelected = availableMembers.every((m) => selectedMemberIds.includes(m.id));
    const someSelected = availableMembers.some((m) => selectedMemberIds.includes(m.id));

    return (
      <Card key={title}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>
                {groupMembers.length} atleti
                {availableMembers.length < groupMembers.length &&
                  ` (${groupMembers.length - availableMembers.length} già iscritti)`}
              </CardDescription>
            </div>
            {availableMembers.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(availableMembers.map((m) => m.id))}
              >
                {allSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {groupMembers.map((member) => {
              const isRegistered = alreadyRegisteredIds.includes(member.id);
              const isSelected = selectedMemberIds.includes(member.id);

              return (
                <div
                  key={member.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    isRegistered
                      ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    id={member.id}
                    checked={isSelected}
                    disabled={isRegistered}
                    onCheckedChange={() => handleToggleMember(member.id)}
                  />
                  <label
                    htmlFor={member.id}
                    className={`flex-1 cursor-pointer ${
                      isRegistered ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {member.category && (
                            <Badge variant="outline" className="text-xs">
                              {member.category}
                            </Badge>
                          )}
                          {member.membership_number && (
                            <span className="text-xs text-gray-500">
                              Tessera: {member.membership_number}
                            </span>
                          )}
                        </div>
                      </div>
                      {isRegistered && (
                        <Badge variant="secondary">Già iscritto</Badge>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate available members (not already registered)
  const availableMembers = members.filter((m) => !alreadyRegisteredIds.includes(m.id));

  return (
    <div className="space-y-6">
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
      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
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

      {/* Member Groups */}
      <div className="space-y-4">
        {renderMemberGroup('ATLETI FIDAL', fidalMembers, 'blue')}
        {renderMemberGroup('ATLETI UISP', uispMembers, 'green')}
        {otherMembers.length > 0 &&
          renderMemberGroup('ALTRI ATLETI', otherMembers, 'gray')}
      </div>

      {/* No results */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery
              ? 'Nessun atleta trovato con questi criteri'
              : 'Nessun atleta disponibile'}
          </p>
        </div>
      )}
    </div>
  );
}

