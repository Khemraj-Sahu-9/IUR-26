import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { Household, Patient } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { HouseholdCard } from '@/components/households/HouseholdCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { Home, Plus } from 'lucide-react';

interface HouseholdsListViewProps {
  onSelectHousehold: (household: Household) => void;
  onAddHousehold: () => void;
}

export const HouseholdsListView: React.FC<HouseholdsListViewProps> = ({
  onSelectHousehold,
  onAddHousehold,
}) => {
  const { t } = useLanguage();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hhData, ptData] = await Promise.all([
        dataService.getHouseholds(),
        dataService.getPatients(),
      ]);
      setHouseholds(hhData);
      setPatients(ptData);
    } catch (err: unknown) {
      console.error('Failed to load households:', err);
      setError(err instanceof Error ? err.message : 'Database error loading households');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute patient count per household
  const patientCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    patients.forEach((p) => {
      map[p.household_id] = (map[p.household_id] || 0) + 1;
    });
    return map;
  }, [patients]);

  // Client-side debounce/filter
  const filteredHouseholds = useMemo(() => {
    if (!searchQuery.trim()) return households;
    const q = searchQuery.toLowerCase();
    return households.filter(
      (h) =>
        h.household_code.toLowerCase().includes(q) ||
        h.head_of_family.toLowerCase().includes(q) ||
        h.village.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        (h.ward && h.ward.toLowerCase().includes(q))
    );
  }, [households, searchQuery]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t.householdsTitle}
        subtitle={`${households.length} registered in assigned area`}
        rightAction={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAddHousehold}
            className="gap-1 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addHousehold}</span>
          </Button>
        }
      />

      <OfflineBanner />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t.searchHouseholdsPlaceholder}
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner label="Loading assigned households..." size="md" />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load households"
          message={error}
          onRetry={loadData}
          retryLabel={t.retry}
        />
      ) : filteredHouseholds.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={<Home className="w-6 h-6" />}
            title={t.noHouseholdsFound}
            description={`No households match "${searchQuery}". Check spelling or add a new family.`}
            actionLabel={t.addHousehold}
            onAction={onAddHousehold}
          />
        ) : (
          <EmptyState
            icon={<Home className="w-6 h-6" />}
            title={t.noHouseholdsYet}
            description={t.addFirstHouseholdPrompt}
            actionLabel={t.addHousehold}
            onAction={onAddHousehold}
          />
        )
      ) : (
        <div className="space-y-3">
          {filteredHouseholds.map((hh) => (
            <HouseholdCard
              key={hh.id}
              household={hh}
              patientCount={patientCountMap[hh.id] || 0}
              onClick={() => onSelectHousehold(hh)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
