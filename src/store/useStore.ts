import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatientRecord, PharmacyItem, User, Invoice, StaffMember, ClinicalNote, PendingRegistration, Prescription, LabTest, LabOrder, Appointment } from '../types';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PatientStats {
  total: number;
  inpatient: number;
  outpatient: number;
  emergency: number;
}

interface AppState {
  patients: PatientRecord[];
  patientStats: PatientStats;
  lastFetchPatientsParams: { page: number, searchQuery: string, limit: number, sortBy?: keyof PatientRecord, sortAsc?: boolean } | null;
  fetchPatients: (page: number, searchQuery: string, limit: number, sortBy?: keyof PatientRecord, sortAsc?: boolean) => Promise<void>;
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
  prescriptions: Prescription[];
  addPrescription: (prescription: Omit<Prescription, 'id' | 'date' | 'status'>) => Promise<void>;
  dispensePrescription: (id: string) => Promise<void>;
  labTests: LabTest[];
  labOrders: LabOrder[];
  addLabOrder: (order: Omit<LabOrder, 'id' | 'date' | 'status' | 'resultValue' | 'notes' | 'completedAt'>) => Promise<void>;
  updateLabOrderStatus: (id: string, status: 'In Progress') => Promise<void>;
  completeLabOrder: (id: string, resultValue: string, notes: string) => Promise<void>;
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'date' | 'status' | 'durationMinutes'>) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isMobileMenuOpen: boolean;
  setIsLoading: (loading: boolean) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  user: User | null;
  isAuthenticated: boolean;
  realtimeChannel: RealtimeChannel | null;
  setupRealtimeSubscription: () => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      patients: [],
      patientStats: { total: 0, inpatient: 0, outpatient: 0, emergency: 0 },
      lastFetchPatientsParams: null,
      pharmacyItems: [],
      invoices: [],
      staff: [],
      pendingRegistrations: [],
      prescriptions: [],
      labTests: [],
      labOrders: [],
      appointments: [],
      theme: 'light',
      isLoading: false,
      isMobileMenuOpen: false,
      user: null,
      isAuthenticated: false,
      realtimeChannel: null,
      
      setTheme: (theme) => set({ theme }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
      
      setupRealtimeSubscription: () => {
        const state = get();
        if (state.realtimeChannel) return; // Already subscribed

        const channel = supabase.channel('hims-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public' },
            (payload) => {
              console.log('Realtime event received:', payload);
              // Simply refresh all data when any change happens in the database.
              get().fetchData();
              // Also refresh current page of patients if applicable
              const params = get().lastFetchPatientsParams;
              if (params) {
                get().fetchPatients(params.page, params.searchQuery, params.limit, params.sortBy, params.sortAsc);
              }
            }
          )
          .subscribe();

        set({ realtimeChannel: channel });
      },

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const [
            { data: pharmacyItems },
            { data: invoices },
            { data: staff },
            { data: pendingRegistrations },
            { data: prescriptions },
            { data: labTests },
            { data: labOrders },
            { data: appointments },
            
            // Patient Stats
            { count: total },
            { count: inpatient },
            { count: outpatient },
            { count: emergency }
          ] = await Promise.all([
            supabase.from('pharmacy_items').select('*'),
            supabase.from('invoices').select('*'),
            supabase.from('staff').select('*'),
            supabase.from('pending_registrations').select('*'),
            supabase.from('prescriptions').select('*'),
            supabase.from('lab_tests').select('*'),
            supabase.from('lab_orders').select('*'),
            supabase.from('appointments').select('*'),
            
            supabase.from('patients').select('id', { count: 'exact', head: true }),
            supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'Inpatient'),
            supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'Outpatient'),
            supabase.from('patients').select('id', { count: 'exact', head: true }).eq('department', 'Emergency'),
          ]);

          set({
            patientStats: {
              total: total || 0,
              inpatient: inpatient || 0,
              outpatient: outpatient || 0,
              emergency: emergency || 0
            },
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
            })),
            prescriptions: (prescriptions || []).map((p: any) => ({
              id: p.id, patientId: p.patient_id, doctorName: p.doctor_name, pharmacyItemId: p.pharmacy_item_id,
              dosage: p.dosage, frequency: p.frequency, durationDays: p.duration_days, status: p.status, date: p.created_at
            })),
            labTests: (labTests || []).map((t: any) => ({
              id: t.id, name: t.name, category: t.category, turnaroundTimeMinutes: t.turnaround_time_minutes, price: t.price
            })),
            labOrders: (labOrders || []).map((o: any) => ({
              id: o.id, patientId: o.patient_id, doctorName: o.doctor_name, testId: o.test_id,
              status: o.status, resultValue: o.result_value, notes: o.notes, date: o.created_at, completedAt: o.completed_at
            })),
            appointments: (appointments || []).map((a: any) => ({
              id: a.id, patientName: a.patient_name, doctorName: a.doctor_name, appointmentDate: a.appointment_date,
              appointmentTime: a.appointment_time, durationMinutes: a.duration_minutes, type: a.type, status: a.status, date: a.created_at
            }))
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPatients: async (page, searchQuery, limit, sortBy, sortAsc = true) => {
        set({ isLoading: true, lastFetchPatientsParams: { page, searchQuery, limit, sortBy, sortAsc } });
        try {
          const from = (page - 1) * limit;
          const to = from + limit - 1;

          let query = supabase.from('patients').select('*, clinical_notes(*)', { count: 'exact' });

          if (searchQuery) {
             query = query.or(`name.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%,diagnosis.ilike.%${searchQuery}%`);
          }

          if (sortBy) {
            // Need to map frontend keys to DB columns
            const columnMap: Record<string, string> = {
              bloodGroup: 'blood_group', paymentMethod: 'payment_method', admissionDate: 'admission_date',
              contactInfo: 'contact_info', medicalHistory: 'medical_history', insuranceDetails: 'insurance_details'
            };
            const col = columnMap[sortBy] || sortBy;
            query = query.order(col, { ascending: sortAsc });
          } else {
             query = query.order('created_at', { ascending: false });
          }

          query = query.range(from, to);
          
          const { data: patients, count, error } = await query;
          
          if (!error && patients) {
            set((state) => ({
              patients: patients.map((p: any) => ({
                id: p.id, name: p.name, age: p.age, gender: p.gender, bloodGroup: p.blood_group,
                genotype: p.genotype, paymentMethod: p.payment_method, diagnosis: p.diagnosis,
                status: p.status, department: p.department, admissionDate: p.admission_date,
                contactInfo: p.contact_info, medicalHistory: p.medical_history, insuranceDetails: p.insurance_details,
                clinicalNotes: p.clinical_notes ? p.clinical_notes.map((n: any) => ({
                  id: n.id, date: n.date, note: n.note, author: n.author
                })) : []
              })),
              // Update total for pagination, but keep other stats intact if no search
              patientStats: searchQuery 
                ? { ...state.patientStats, total: count || 0 }
                : { ...state.patientStats, total: count || state.patientStats.total }
            }));
          }
        } catch (error) {
           console.error("Error fetching patients:", error);
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

      addPrescription: async (prescription) => {
        const dbPrescription = {
          patient_id: prescription.patientId,
          doctor_name: prescription.doctorName,
          pharmacy_item_id: prescription.pharmacyItemId,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration_days: prescription.durationDays,
          status: 'Pending'
        };
        const { data, error } = await supabase.from('prescriptions').insert([dbPrescription]).select().single();
        if (!error && data) {
          const newPrescription: Prescription = {
            id: data.id, patientId: data.patient_id, doctorName: data.doctor_name,
            pharmacyItemId: data.pharmacy_item_id, dosage: data.dosage, frequency: data.frequency,
            durationDays: data.duration_days, status: data.status, date: data.created_at
          };
          set((state) => ({ prescriptions: [newPrescription, ...state.prescriptions] }));
        }
      },

      dispensePrescription: async (id) => {
        const { error } = await supabase.rpc('dispense_prescription', { p_id: id });
        if (!error) {
          // Re-fetch data to sync new stock level, invoice, and prescription status
          get().fetchData();
        } else {
          console.error("Failed to dispense prescription:", error);
          throw error;
        }
      },

      addLabOrder: async (order) => {
        const dbOrder = {
          patient_id: order.patientId,
          doctor_name: order.doctorName,
          test_id: order.testId,
          status: 'Pending'
        };
        const { data, error } = await supabase.from('lab_orders').insert([dbOrder]).select().single();
        if (!error && data) {
          const newOrder: LabOrder = {
            id: data.id, patientId: data.patient_id, doctorName: data.doctor_name, testId: data.test_id,
            status: data.status, date: data.created_at
          };
          set((state) => ({ labOrders: [newOrder, ...state.labOrders] }));
        }
      },

      updateLabOrderStatus: async (id, status) => {
        const { error } = await supabase.from('lab_orders').update({ status }).eq('id', id);
        if (!error) {
          set((state) => ({
            labOrders: state.labOrders.map(o => o.id === id ? { ...o, status } : o)
          }));
        }
      },

      completeLabOrder: async (id, resultValue, notes) => {
        const { error } = await supabase.rpc('complete_lab_order', { 
          p_order_id: id, 
          p_result_value: resultValue, 
          p_notes: notes 
        });
        if (!error) {
          get().fetchData();
        } else {
          console.error("Failed to complete lab order:", error);
          throw error;
        }
      },

      addAppointment: async (appointment) => {
        const { data, error } = await supabase.rpc('book_appointment', {
          p_patient_name: appointment.patientName,
          p_doctor_name: appointment.doctorName,
          p_date: appointment.appointmentDate,
          p_time: appointment.appointmentTime,
          p_type: appointment.type
        });

        if (error) {
          console.error("RPC Error:", error);
          return { success: false, error: error.message };
        }

        if (data && data.success) {
          get().fetchData(); // Refresh to get the new appointment
          return { success: true };
        } else {
          return { success: false, error: data?.error || 'Double booking conflict detected' };
        }
      },
      
      login: (user) => {
        set({ user, isAuthenticated: true });
        // Fetch data upon successful login
        get().fetchData();
        get().setupRealtimeSubscription();
      },
      
      logout: () => {
        const state = get();
        if (state.isAuthenticated) {
          supabase.auth.signOut();
        }
        if (state.realtimeChannel) {
          state.realtimeChannel.unsubscribe();
        }
        set({ user: null, isAuthenticated: false, patients: [], pharmacyItems: [], invoices: [], staff: [], pendingRegistrations: [], prescriptions: [], labTests: [], labOrders: [], appointments: [], realtimeChannel: null });
      },
    }),
    {
      name: 'hims-storage',
      // Only persist theme and user if we want, but since we use Supabase Auth state, we don't need to persist data
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
