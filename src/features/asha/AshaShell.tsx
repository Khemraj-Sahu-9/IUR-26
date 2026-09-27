import React, { useState } from 'react';
import { Household, Patient } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { AshaDashboard } from './AshaDashboard';
import { HouseholdsListView } from '@/features/households/HouseholdsListView';
import { AddHouseholdView } from '@/features/households/AddHouseholdView';
import { HouseholdDetailsView } from '@/features/households/HouseholdDetailsView';
import { PatientsListView } from '@/features/patients/PatientsListView';
import { AddPatientView } from '@/features/patients/AddPatientView';
import { PatientProfileView } from '@/features/patients/PatientProfileView';
import { EditPatientView } from '@/features/patients/EditPatientView';
import { AddVisitView } from '@/features/visits/AddVisitView';
import { AddReferralView } from '@/features/referrals/AddReferralView';
import { AshaProfileView } from '@/features/profile/AshaProfileView';
import { MedicineRequestView } from '@/features/medicines/MedicineRequestView';
import { TasksListView } from '@/features/tasks/TasksListView';
import { NotificationsView } from '@/features/notifications/NotificationsView';
import { BottomNav, AshaTab } from '@/components/navigation/BottomNav';

type AshaView =
  | { name: 'dashboard' }
  | { name: 'households_list' }
  | { name: 'add_household' }
  | { name: 'household_details'; household: Household }
  | { name: 'patients_list' }
  | { name: 'add_patient'; household?: Household }
  | { name: 'patient_profile'; patient: Patient }
  | { name: 'edit_patient'; patient: Patient }
  | { name: 'add_visit'; patient: Patient }
  | { name: 'add_referral'; patient: Patient }
  | { name: 'tasks' }
  | { name: 'notifications' }
  | { name: 'medicine_requests' }
  | { name: 'profile' };


export const AshaShell: React.FC = () => {
  const { user } = useAuth();
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
      case 'add_visit':
      case 'add_referral':
        return 'patients';
      case 'tasks':
        return 'tasks';
      case 'medicine_requests':
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
          onNavigateTasks={() => setCurrentView({ name: 'tasks' })}
          onNavigateMedicines={() => setCurrentView({ name: 'medicine_requests' })}
          onNavigateNotifications={() => setCurrentView({ name: 'notifications' })}
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
          onRecordVisit={(patient) =>
            setCurrentView({ name: 'add_visit', patient })
          }
          onReferPatient={(patient) =>
            setCurrentView({ name: 'add_referral', patient })
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

      {/* 9. Record Visit (Phase 3) */}
      {currentView.name === 'add_visit' && (
        <AddVisitView
          patient={currentView.patient}
          ashaId={user?.id || ''}
          onBack={() =>
            setCurrentView({ name: 'patient_profile', patient: currentView.patient })
          }
          onSuccess={() =>
            setCurrentView({ name: 'patient_profile', patient: currentView.patient })
          }
        />
      )}

      {/* 10. Refer Patient (Phase 3) */}
      {currentView.name === 'add_referral' && (
        <AddReferralView
          patient={currentView.patient}
          ashaId={user?.id || ''}
          onBack={() =>
            setCurrentView({ name: 'patient_profile', patient: currentView.patient })
          }
          onSuccess={() =>
            setCurrentView({ name: 'patient_profile', patient: currentView.patient })
          }
        />
      )}

      {/* 11. Tasks View (Phase 7 Unified Tasks) */}
      {currentView.name === 'tasks' && (
        <TasksListView
          onBack={() => setCurrentView({ name: 'dashboard' })}
        />
      )}

      {/* 12. Notifications View (Phase 7) */}
      {currentView.name === 'notifications' && (
        <NotificationsView
          onBack={() => setCurrentView({ name: 'dashboard' })}
          onNavigateAction={(sourceType) => {
            if (sourceType === 'medicine_order') {
              setCurrentView({ name: 'medicine_requests' });
            } else if (sourceType === 'task' || sourceType === 'follow_up') {
              setCurrentView({ name: 'tasks' });
            } else {
              setCurrentView({ name: 'dashboard' });
            }
          }}
        />
      )}

      {/* 13. Medicine Requests / Drug Kit (Phase 4) */}
      {currentView.name === 'medicine_requests' && (
        <MedicineRequestView
          onBack={() => setCurrentView({ name: 'dashboard' })}
        />
      )}

      {/* 12. ASHA Profile Tab */}
      {currentView.name === 'profile' && <AshaProfileView />}

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
      />
    </div>
  );
};
