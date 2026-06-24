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
            patients: patients || [],
            pharmacyItems: pharmacyItems || [],
            invoices: invoices || [],
            staff: staff || [],
            pendingRegistrations: pendingRegistrations || []
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addPatient: async (patient) => {
        const { data, error } = await supabase.from('patients').insert([patient]).select().single();
        if (!error && data) {
          set((state) => ({ patients: [data, ...state.patients] }));
        }
      },

      addPharmacyItem: async (item) => {
        const { data, error } = await supabase.from('pharmacy_items').insert([item]).select().single();
        if (!error && data) {
          set((state) => ({ pharmacyItems: [data, ...state.pharmacyItems] }));
        }
      },

      addInvoice: async (invoice) => {
        const { data, error } = await supabase.from('invoices').insert([invoice]).select().single();
        if (!error && data) {
          set((state) => ({ invoices: [data, ...state.invoices] }));
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
        const { data, error } = await supabase.from('clinical_notes').insert([{ ...note, patient_id: patientId }]).select().single();
        if (!error && data) {
          set((state) => ({
            patients: state.patients.map(p => 
              p.id === patientId 
                ? { ...p, clinicalNotes: [data, ...(p.clinicalNotes || [])] }
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
