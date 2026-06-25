import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatientRecord, PharmacyItem, User, Invoice, StaffMember, ClinicalNote, PendingRegistration } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  patients: PatientRecord[];
  pharmacyItems: PharmacyItem[];
  invoices: Invoice[];
  staff: StaffMember[];
  pendingRegistrations: PendingRegistration[];
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fetchData: () => Promise<void>;
  addPatient: (patient: Omit<PatientRecord, 'id' | 'created_at'>) => Promise<void>;
  addPharmacyItem: (item: Omit<PharmacyItem, 'id' | 'created_at'>) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => Promise<void>;
  addStaffMember: (member: Omit<StaffMember, 'id' | 'created_at'>) => Promise<void>;
  approveRegistration: (id: string) => Promise<void>;
  rejectRegistration: (id: string) => Promise<void>;
  addClinicalNote: (patientId: string, note: Omit<ClinicalNote, 'id' | 'created_at'>) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      patients: [],
      pharmacyItems: [],
      invoices: [],
      staff: [],
      pendingRegistrations: [],
      theme: 'light',
      isLoading: false,
      user: null,
      isAuthenticated: false,
      setTheme: (theme) => set({ theme }),
      
      fetchData: async () => {
        set({ isLoading: true });
        try {
          const [
            { data: patients },
            { data: pharmacyItems },
            { data: invoices },
            { data: staff },
            { data: pendingRegistrations }
          ] = await Promise.all([
            supabase.from('patients').select('*, clinical_notes(*)'),
            supabase.from('pharmacy_items').select('*'),
            supabase.from('invoices').select('*'),
            supabase.from('staff').select('*'),
            supabase.from('pending_registrations').select('*'),
          ]);

          set({
            patients: (patients || []).map((p: any) => ({
              id: p.id, name: p.name, age: p.age, gender: p.gender, bloodGroup: p.blood_group,
              genotype: p.genotype, paymentMethod: p.payment_method, diagnosis: p.diagnosis,
              status: p.status, department: p.department, admissionDate: p.admission_date,
              contactInfo: p.contact_info, medicalHistory: p.medical_history, insuranceDetails: p.insurance_details,
              clinicalNotes: p.clinical_notes ? p.clinical_notes.map((n: any) => ({
                id: n.id, date: n.date, note: n.note, author: n.author
              })) : []
            })),
            pharmacyItems: (pharmacyItems || []).map((i: any) => ({
              id: i.id, name: i.name, category: i.category, stockLevel: i.stock_level,
              reorderLevel: i.reorder_level, expiryDate: i.expiry_date, unitPrice: i.unit_price,
              isNHIACovered: i.is_nhia_covered, supplier: i.supplier
            })),
            invoices: (invoices || []).map((i: any) => ({
              id: i.id, patientName: i.patient_name, amount: i.amount, date: i.date, status: i.status, type: i.type
            })),
            staff: staff || [],
            pendingRegistrations: (pendingRegistrations || []).map((r: any) => ({
              id: r.id, name: r.name, email: r.email, role: r.role,
              licenseNumber: r.license_number, requestReason: r.request_reason, date: r.date
            }))
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addPatient: async (patient) => {
        const dbPatient = {
          name: patient.name, age: patient.age, gender: patient.gender,
          blood_group: patient.bloodGroup, genotype: patient.genotype,
          payment_method: patient.paymentMethod, diagnosis: patient.diagnosis,
          status: patient.status, department: patient.department,
          admission_date: patient.admissionDate, contact_info: patient.contactInfo,
          medical_history: patient.medicalHistory, insurance_details: patient.insuranceDetails
        };
        const { data, error } = await supabase.from('patients').insert([dbPatient]).select().single();
        if (!error && data) {
          set((state) => ({ patients: [{...patient, id: data.id, clinicalNotes: []}, ...state.patients] }));
        }
      },

      addPharmacyItem: async (item) => {
        const dbItem = {
          name: item.name, category: item.category, stock_level: item.stockLevel,
          reorder_level: item.reorderLevel, expiry_date: item.expiryDate,
          unit_price: item.unitPrice, is_nhia_covered: item.isNHIACovered, supplier: item.supplier
        };
        const { data, error } = await supabase.from('pharmacy_items').insert([dbItem]).select().single();
        if (!error && data) {
          set((state) => ({ pharmacyItems: [{...item, id: data.id}, ...state.pharmacyItems] }));
        }
      },

      addInvoice: async (invoice) => {
        const dbInvoice = {
          patient_name: invoice.patientName, amount: invoice.amount,
          date: invoice.date, status: invoice.status, type: invoice.type
        };
        const { data, error } = await supabase.from('invoices').insert([dbInvoice]).select().single();
        if (!error && data) {
          set((state) => ({ invoices: [{...invoice, id: data.id}, ...state.invoices] }));
        }
      },

      addStaffMember: async (member) => {
        const { data, error } = await supabase.from('staff').insert([member]).select().single();
        if (!error && data) {
          set((state) => ({ staff: [data, ...state.staff] }));
        }
      },

      approveRegistration: async (id) => {
        const state = get();
        const reg = state.pendingRegistrations.find(r => r.id === id);
        if (!reg) return;

        const newStaff = {
          name: reg.name,
          email: reg.email,
          role: reg.role,
          department: reg.requestReason || 'General',
          phone: '',
          status: 'Active'
        };

        const { data, error } = await supabase.from('staff').insert([newStaff]).select().single();
        if (!error && data) {
          await supabase.from('pending_registrations').delete().eq('id', id);
          set((state) => ({
            pendingRegistrations: state.pendingRegistrations.filter(r => r.id !== id),
            staff: [data, ...state.staff]
          }));
        }
      },

      rejectRegistration: async (id) => {
        const { error } = await supabase.from('pending_registrations').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            pendingRegistrations: state.pendingRegistrations.filter(r => r.id !== id)
          }));
        }
      },

      addClinicalNote: async (patientId, note) => {
        const { data, error } = await supabase.from('clinical_notes').insert([{ date: note.date, note: note.note, author: note.author, patient_id: patientId }]).select().single();
        if (!error && data) {
          set((state) => ({
            patients: state.patients.map(p => 
              p.id === patientId 
                ? { ...p, clinicalNotes: [{id: data.id, date: data.date, note: data.note, author: data.author}, ...(p.clinicalNotes || [])] }
                : p
            )
          }));
        }
      },

      setIsLoading: (isLoading) => set({ isLoading }),
      
      login: (user) => {
        set({ user, isAuthenticated: true });
        // Fetch data upon successful login
        get().fetchData();
      },
      
      logout: () => {
        const state = get();
        if (state.isAuthenticated) {
          supabase.auth.signOut();
        }
        set({ user: null, isAuthenticated: false, patients: [], pharmacyItems: [], invoices: [], staff: [], pendingRegistrations: [] });
      },
    }),
    {
      name: 'hims-storage',
      // Only persist theme and user if we want, but since we use Supabase Auth state, we don't need to persist data
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
