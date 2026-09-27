import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9+ -]{10,15}$/, 'Invalid phone number format').optional().or(z.literal('')),
  role: z.enum(['asha', 'supervisor', 'manager']),
  preferredLanguage: z.enum(['en', 'hi', 'mr', 'cg']),
});

export const householdSchema = z.object({
  householdCode: z.string().min(1, 'Household code is required'),
  headOfFamily: z.string().min(2, 'Head of family name is required'),
  address: z.string().min(3, 'Address is required'),
  village: z.string().min(2, 'Village is required'),
  ward: z.string().optional(),
});

export const patientSchema = z.object({
  householdId: z.string().uuid('Invalid household ID'),
  patientCode: z.string().min(1, 'Patient code is required'),
  fullName: z.string().min(2, 'Patient full name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional().nullable(),
  gender: z.enum(['female', 'male', 'other']),
  phone: z.string().optional().nullable(),
  relationshipToHead: z.string().optional().nullable(),
  status: z.enum(['active', 'migrated', 'deceased']).default('active'),
});

export const visitSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Visit date must be YYYY-MM-DD'),
  visitType: z.enum(['routine_anc', 'pnc', 'immunization', 'general_checkup', 'communicable_disease']),
  notes: z.string().max(1000).optional().nullable(),
  followUpRequired: z.boolean().default(false),
  nextFollowUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
});

export const medicineOrderSchema = z.object({
  medicineId: z.string().uuid('Invalid medicine ID'),
  requestedQuantity: z.number().int().positive('Quantity must be greater than 0'),
  notes: z.string().max(300).optional().nullable(),
});
