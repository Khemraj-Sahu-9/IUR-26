import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { auditLogger } from '@/services/auditLogger';
import { Household } from '@/types/database';
import { householdSchema } from '@/utils/validation';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PageHeader } from '@/components/common/PageHeader';
import { Alert } from '@/components/common/Alert';
import { Home } from 'lucide-react';

interface AddHouseholdViewProps {
  onBack: () => void;
  onSuccess: (household: Household) => void;
}

export const AddHouseholdView: React.FC<AddHouseholdViewProps> = ({
  onBack,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [householdCode, setHouseholdCode] = useState(() => {
    // Generate clean auto-suggestion: HH-YYYY-XXX
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `HH-2026-${randomSuffix}`;
  });
  const [headOfFamily, setHeadOfFamily] = useState('');
  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('Rampur');
  const [ward, setWard] = useState('Ward 4');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (!user) {
      setServerError('User session not active. Please re-login.');
      return;
    }

    const validationResult = householdSchema.safeParse({
      householdCode,
      headOfFamily,
      address,
      village,
      ward: ward || undefined,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const newHousehold = await dataService.createHousehold({
        household_code: householdCode,
        head_of_family: headOfFamily,
        address,
        village,
        ward,
        assigned_asha_id: user.id,
      });

      await auditLogger.log({
        action: 'HOUSEHOLD_CREATED',
        tableName: 'households',
        recordId: newHousehold.id,
        metadata: {
          code: newHousehold.household_code,
          head: newHousehold.head_of_family,
          village: newHousehold.village,
        },
      });

      onSuccess(newHousehold);
    } catch (err: unknown) {
      console.error('Failed to create household:', err);
      const msg = err instanceof Error ? err.message : 'Database error while saving household.';
      if (msg.includes('unique constraint') || msg.includes('household_code')) {
        setErrors((prev) => ({
          ...prev,
          householdCode: 'This household code is already registered. Please choose another code.',
        }));
      } else {
        setServerError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={t.addHousehold}
        subtitle="Register new family in assigned village"
        onBack={onBack}
        backLabel={t.back}
      />

      {serverError && (
        <Alert variant="danger" title={t.errorTitle}>
          {serverError}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-900 border border-emerald-200 text-xs">
            <Home className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>
              This household will automatically be assigned to your ASHA profile (<strong>{user?.email}</strong>).
            </span>
          </div>

          <Input
            label={`${t.householdCode} *`}
            value={householdCode}
            error={errors.householdCode}
            onChange={(e) => setHouseholdCode(e.target.value)}
            placeholder="e.g. HH-2026-101"
            helperText="Unique reference code used in village register"
            disabled={isSubmitting}
            required
          />

          <Input
            label={`${t.headOfFamily} *`}
            value={headOfFamily}
            error={errors.headOfFamily}
            onChange={(e) => setHeadOfFamily(e.target.value)}
            placeholder="e.g. Ramesh Kumar Sharma"
            helperText="Name of primary householder or family head"
            disabled={isSubmitting}
            required
          />

          <Input
            label={`${t.address} *`}
            value={address}
            error={errors.address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House # / Landmark / Near Temple"
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={`${t.village} *`}
              value={village}
              error={errors.village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Rampur"
              disabled={isSubmitting}
              required
            />

            <Input
              label={t.ward}
              value={ward}
              error={errors.ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g. Ward 4 / Gali No 2"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="flex-1"
            >
              {t.saveHousehold}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
