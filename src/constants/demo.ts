import { UserRole } from '@/types/database';

// Demo credentials — pre-seeded in Supabase with verified auth records
export const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; name: string }> = {
  asha: {
    email: 'asha.demo@gmail.com',
    pass: 'Password123!',
    name: 'Sunita Devi',
  },
  supervisor: {
    email: 'supervisor.demo@gmail.com',
    pass: 'Password123!',
    name: 'Dr. Anita Roy',
  },
  manager: {
    email: 'manager.demo@gmail.com',
    pass: 'Password123!',
    name: 'Rajesh Sharma',
  },
};
