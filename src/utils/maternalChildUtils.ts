/**
 * Clinical date helper utilities (non-diagnostic)
 * Safely calculates Expected Due Date (EDD) from Last Menstrual Period (LMP)
 * using standard Naegele's rule: LMP + 280 days (40 weeks)
 */

export function calculateEDDFromLMP(lmpDateString: string): string | null {
  if (!lmpDateString) return null;
  const lmp = new Date(lmpDateString);
  if (isNaN(lmp.getTime())) return null;

  // Add 280 days
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return edd.toISOString().split('T')[0];
}

/**
 * Calculates gestational age in weeks + days
 */
export function calculateGestationalAge(lmpDateString: string | null): string | null {
  if (!lmpDateString) return null;
  const lmp = new Date(lmpDateString);
  if (isNaN(lmp.getTime())) return null;

  const now = new Date();
  const diffTime = now.getTime() - lmp.getTime();
  if (diffTime < 0) return null;

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;

  if (weeks > 45) return '>42 weeks';
  return `${weeks}w ${remainingDays}d`;
}

/**
 * Returns whether a patient is a child (age < 5 years, or date_of_birth <= 5 years ago)
 */
export function isChildPatient(dob: string | null | undefined): boolean {
  if (!dob) return false;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return false;

  const now = new Date();
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  return birth >= fiveYearsAgo;
}

/**
 * Formats a child's age in months or years
 */
export function formatChildAge(dob: string | null | undefined): string {
  if (!dob) return 'Age unknown';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return 'Age unknown';

  const now = new Date();
  const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  
  if (diffMonths < 1) {
    const diffDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${Math.max(0, diffDays)} days`;
  }
  if (diffMonths < 24) {
    return `${diffMonths} months`;
  }
  const years = Math.floor(diffMonths / 12);
  const remMonths = diffMonths % 12;
  return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} years`;
}
