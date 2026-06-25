export type UserRole =
  | 'Executive'
  | 'MedicalDirector'
  | 'Doctor'
  | 'Nurse'
  | 'Pharmacist'
  | 'Admin'
  | 'Receptionist'
  | 'Patient';

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  licenseNumber?: string;
  requestReason?: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface DepartmentStats {
  name: string;
  patientVolume: number;
  averageWaitTime: number; // minutes
  bedOccupancy: number; // percentage
  staffAvailability: number; // percentage
  revenue: number;
}

export interface NigerianContextStatus {
  powerStatus: 'Grid' | 'Generator' | 'Outage';
  generatorFuelLevel: number; // percentage
  internetStatus: 'Stable' | 'Unstable' | 'Offline';
  waterSupply: 'Adequate' | 'Limited';
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number; // packs
  reorderLevel: number;
  expiryDate: string;
  unitPrice: number;
  isNHIACovered: boolean;
  supplier: string;
}

export interface ClinicalNote {
  id: string;
  date: string;
  note: string;
  author: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorName: string;
  pharmacyItemId: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  status: 'Pending' | 'Dispensed' | 'Cancelled';
  date: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  bloodGroup: string;
  genotype: string;
  paymentMethod: 'Out of Pocket' | 'NHIA' | 'Private Insurance';
  diagnosis: string;
  status: 'Inpatient' | 'Outpatient' | 'Discharged';
  department: string;
  admissionDate: string;
  contactInfo?: string;
  medicalHistory?: string;
  insuranceDetails?: string;
  clinicalNotes?: ClinicalNote[];
}

export interface Invoice {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Settled' | 'Overdue';
  type: 'Out of Pocket' | 'NHIA' | 'Private Insurance';
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Off Duty';
}

export interface SystemAlert {
  id: string;
  type: 'Risk' | 'Opportunity' | 'Alert' | 'Prediction';
  title: string;
  description: string;
  department: string;
  confidence: number;
}
