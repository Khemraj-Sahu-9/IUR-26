import React, { useEffect, useState } from 'react';
import { Referral } from '@/types/database';
import { dataService } from '@/services/dataService';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowUpRight, Calendar, Building, CheckCircle2 } from 'lucide-react';

interface ReferralsSectionProps {
  patientId: string;
}

export const ReferralsSection: React.FC<ReferralsSectionProps> = ({ patientId }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await dataService.getReferralsByPatient(patientId);
      setReferrals(data);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, [patientId]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await dataService.updateReferral(id, { status: newStatus });
      await loadReferrals();
    } catch (err) {
      console.error('Failed to update referral status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visited':
      case 'admitted':
        return <Badge variant="blue" size="sm">{status}</Badge>;
      case 'discharged':
        return <Badge variant="emerald" size="sm">discharged</Badge>;
      case 'referred':
      case 'created':
        return <Badge variant="amber" size="sm">referred</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="p-4 border-slate-200">
        <LoadingSpinner label="Loading referral records..." size="sm" />
      </Card>
    );
  }

  if (referrals.length === 0) {
    return (
      <Card className="p-4 border-slate-200 text-center text-slate-500 text-sm">
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-700">No active or prior referrals</p>
          <p className="text-xs text-slate-400 max-w-xs">
            Refer this patient to PHC or CHC if higher-level medical attention is needed.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {referrals.map((ref) => (
        <Card key={ref.id} className="p-3.5 border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {ref.referred_to}
                  </span>
                  {getStatusBadge(ref.status)}
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date: {ref.referral_date}
                </p>

                <p className="text-xs text-slate-700 bg-purple-50/50 border border-purple-100 p-2 rounded-lg mt-1">
                  <strong className="text-slate-800">Reason: </strong>
                  {ref.reason}
                </p>

                {ref.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1">
                    {ref.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Status Action */}
            {ref.status === 'referred' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 text-xs font-semibold gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                disabled={updatingId === ref.id}
                onClick={() => handleUpdateStatus(ref.id, 'visited')}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{updatingId === ref.id ? '...' : 'Mark Visited'}</span>
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
