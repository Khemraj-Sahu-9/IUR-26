import React, { useState } from 'react';
import { Household, Patient } from '@/types/database';
import { AshaDashboard } from './AshaDashboard';
import { HouseholdsListView } from '@/features/households/HouseholdsListView';
import { AddHouseholdView } from '@/features/households/AddHouseholdView';
import { HouseholdDetailsView } from '@/features/households/HouseholdDetailsView';
import { PatientsListView } from '@/features/patients/PatientsListView';
import { AddPatientView } from '@/features/patients/AddPatientView';
import { PatientProfileView } from '@/features/patients/PatientProfileView';
import { EditPatientView } from '@/features/patients/EditPatientView';
import { AshaProfileView } from '@/features/profile/AshaProfileView';
import { BottomNav, AshaTab } from '@/components/navigation/BottomNav';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { CheckSquare } from 'lucide-react';

type AshaView =
  | { name: 'dashboard' }
  | { name: 'households_list' }
  | { name: 'add_household' }
  | { name: 'household_details'; household: Household }
  | { name: 'patients_list' }
  | { name: 'add_patient'; household?: Household }
  | { name: 'patient_profile'; patient: Patient }
  | { name: 'edit_patient'; patient: Patient }
  | { name: 'tasks' }
  | { name: 'profile' };

export const AshaShell: React.FC = () => {
  const [currentView, setCurrentView] = useState<AshaView>({ name: 'dashboard' });

  // Map view to active bottom navigation tab
  const getActiveTab = (): AshaTab => {
    switch (currentView.name) {
      case 'dashboard':
        return 'home';
      case 'households_list':
      case 'add_household':
      case 'household_details':
        return 'households';
      case 'patients_list':
      case 'add_patient':
      case 'patient_profile':
      case 'edit_patient':
        return 'patients';
      case 'tasks':
        return 'tasks';
      case 'profile':
        return 'profile';
      default:
        return 'home';
    }
  };

  const handleTabChange = (tab: AshaTab) => {
    switch (tab) {
      case 'home':
        setCurrentView({ name: 'dashboard' });
        break;
      case 'households':
        setCurrentView({ name: 'households_list' });
        break;
      case 'patients':
        setCurrentView({ name: 'patients_list' });
        break;
      case 'tasks':
        setCurrentView({ name: 'tasks' });
        break;
      case 'profile':
        setCurrentView({ name: 'profile' });
        break;
    }
  };

  return (
    <div className="pb-20">
      {/* 1. Dashboard View */}
      {currentView.name === 'dashboard' && (
        <AshaDashboard
          onNavigateHouseholds={() => setCurrentView({ name: 'households_list' })}
          onNavigatePatients={() => setCurrentView({ name: 'patients_list' })}
          onAddHousehold={() => setCurrentView({ name: 'add_household' })}
          onAddPatient={() => setCurrentView({ name: 'add_patient' })}
          onSelectPatient={(patient) => setCurrentView({ name: 'patient_profile', patient })}
        />
      )}

      {/* 2. Households List */}
      {currentView.name === 'households_list' && (
        <HouseholdsListView
          onSelectHousehold={(household) =>
            setCurrentView({ name: 'household_details', household })
          }
          onAddHousehold={() => setCurrentView({ name: 'add_household' })}
        />
      )}

      {/* 3. Add Household */}
      {currentView.name === 'add_household' && (
        <AddHouseholdView
          onBack={() => setCurrentView({ name: 'households_list' })}
          onSuccess={(newHousehold) =>
            setCurrentView({ name: 'household_details', household: newHousehold })
          }
        />
      )}

      {/* 4. Household Details */}
      {currentView.name === 'household_details' && (
        <HouseholdDetailsView
          household={currentView.household}
          onBack={() => setCurrentView({ name: 'households_list' })}
          onAddPatient={(household) =>
            setCurrentView({ name: 'add_patient', household })
          }
          onSelectPatient={(patient) =>
            setCurrentView({ name: 'patient_profile', patient })
          }
        />
      )}

      {/* 5. Patients List */}
      {currentView.name === 'patients_list' && (
        <PatientsListView
          onSelectPatient={(patient) =>
            setCurrentView({ name: 'patient_profile', patient })
          }
          onAddPatient={() => setCurrentView({ name: 'add_patient' })}
        />
      )}

      {/* 6. Add Patient (Standalone or from Household) */}
      {currentView.name === 'add_patient' && (
        <AddPatientView
          initialHousehold={currentView.household}
          onBack={() => {
            if (currentView.household) {
              setCurrentView({ name: 'household_details', household: currentView.household });
            } else {
              setCurrentView({ name: 'patients_list' });
            }
          }}
          onSuccess={(newPatient) =>
            setCurrentView({ name: 'patient_profile', patient: newPatient })
          }
        />
      )}

      {/* 7. Patient Profile */}
      {currentView.name === 'patient_profile' && (
        <PatientProfileView
          patient={currentView.patient}
          onBack={() => setCurrentView({ name: 'patients_list' })}
          onEdit={() => setCurrentView({ name: 'edit_patient', patient: currentView.patient })}
          onSelectHousehold={(household) =>
            setCurrentView({ name: 'household_details', household })
          }
        />
      )}

      {/* 8. Edit Patient */}
      {currentView.name === 'edit_patient' && (
        <EditPatientView
          patient={currentView.patient}
          onBack={() =>
            setCurrentView({ name: 'patient_profile', patient: currentView.patient })
          }
          onSuccess={(updatedPatient) =>
            setCurrentView({ name: 'patient_profile', patient: updatedPatient })
          }
        />
      )}

      {/* 9. Tasks Placeholder */}
      {currentView.name === 'tasks' && (
        <div className="space-y-4 text-left">
          <PageHeader
            title="Daily Tasks • दैनिक कार्य"
            subtitle="Scheduled home visits & vaccine reminders"
          />
          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Field Task Checklist</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Automated high-risk pregnancy follow-ups and immunization due lists will appear here in Phase 3.
            </p>
          </Card>
        </div>
      )}

      {/* 10. ASHA Profile Tab */}
      {currentView.name === 'profile' && <AshaProfileView />}

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
      />
    </div>
  );
};
