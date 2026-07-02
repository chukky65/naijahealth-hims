import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatientRecord, PharmacyItem, User, Invoice, StaffMember, ClinicalNote, PendingRegistration, Prescription, LabTest, LabOrder, Appointment, HospitalSettings } from '../types';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PatientStats {
  total: number;
  inpatient: number;
  outpatient: number;
  emergency: number;
}

interface AppState {
  patients: PatientRecord[]; // To be completely removed soon, keeping for Dashboard temporarily if needed, but we should remove it.
  patientStats: PatientStats;
  pharmacyItems: PharmacyItem[];
  invoices: Invoice[];
  staff: StaffMember[];
  pendingRegistrations: PendingRegistration[];
  auditLogs: any[];
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fetchData: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  logEvent: (action: string, resourceType: string, details: string, resourceId?: string) => Promise<void>;
  addPatient: (patient: Omit<PatientRecord, 'id' | 'created_at'>) => Promise<void>;
  addPharmacyItem: (item: Omit<PharmacyItem, 'id' | 'created_at'>) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => Promise<void>;
  updateInvoiceStatus: (id: string, newStatus: 'Pending' | 'Settled' | 'Overdue') => Promise<void>;
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
  updateProfile: (name: string) => Promise<{success: boolean; error?: string}>;
  hospitalSettings: HospitalSettings | null;
  updateHospitalSettings: (settings: Partial<HospitalSettings>) => Promise<{success: boolean; error?: string}>;
  updatePassword: (password: string) => Promise<{success: boolean; error?: string}>;
  updateNotificationPreferences: (preferences: Partial<User['notificationPreferences']>) => Promise<{success: boolean; error?: string}>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      patients: [],
      patientStats: { total: 0, inpatient: 0, outpatient: 0, emergency: 0 },
      lastFetchPatientsParams: null,
      hospitalSettings: null,
      pharmacyItems: [],
      invoices: [],
      staff: [],
      pendingRegistrations: [],
      auditLogs: [],
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

            }
          )
          .subscribe();

        set({ realtimeChannel: channel });
      },

      fetchData: async () => {
        set({ isLoading: true });
        try {
          // If Admin/MedicalDirector, fetch audit logs as well
          const userRole = get().user?.role;
          if (userRole === 'Admin' || userRole === 'MedicalDirector') {
            get().fetchAuditLogs();
          }

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
            { count: emergency },
            { data: hospitalSettings }
          ] = await Promise.all([
            supabase.from('pharmacy_items').select('*'),
            supabase.from('invoices').select('*'),
            supabase.from('staff').select('*'),
            supabase.from('pending_registrations').select('*'),
            supabase.from('prescriptions').select('*'),
            supabase.from('lab_tests').select('*'),
            supabase.from('lab_orders').select('*'),
            supabase.from('appointments').select('*'),
            
            // Still fetching stats globally for dashboard initially
            supabase.from('patients').select('id', { count: 'exact', head: true }),
            supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'Inpatient'),
            supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'Outpatient'),
            supabase.from('patients').select('id', { count: 'exact', head: true }).eq('department', 'Emergency'),
            supabase.from('hospital_settings').select('*').eq('id', 1).single(),
          ]);

          set({
            hospitalSettings: hospitalSettings || null,
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
              dosage: p.dosage, frequency: p.frequency, durationDays: p.duration_days, quantity: p.quantity, status: p.status, date: p.created_at
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

      // fetchPatients removed in favor of React Query usePatients

      fetchAuditLogs: async () => {
        const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
        if (!error && data) {
          set({ auditLogs: data.map(log => ({
            id: log.id, user: log.user_name, role: log.user_role, action: log.action,
            resourceType: log.resource_type, resourceId: log.resource_id, details: log.details,
            timestamp: log.created_at, ipAddress: log.ip_address || 'Unknown'
          }))});
        }
      },

      logEvent: async (action, resourceType, details, resourceId) => {
        const user = get().user;
        if (!user) return;
        
        await supabase.from('audit_logs').insert([{
          user_name: user.name,
          user_role: user.role,
          action: action,
          resource_type: resourceType,
          resource_id: resourceId || null,
          details: details,
          ip_address: '127.0.0.1' // Mocked IP as actual IP is tricky without server-side context
        }]);
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
          get().logEvent('CREATE', 'Patient Record', `Registered new patient: ${patient.name}`, data.id);
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
          get().logEvent('CREATE', 'Inventory', `Added new pharmacy item: ${item.name}`, data.id);
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
          get().logEvent('CREATE', 'Billing Record', `Generated invoice for ${invoice.patientName} (${invoice.type})`, data.id);
        }
      },

      updateInvoiceStatus: async (id, newStatus) => {
        const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
        if (!error) {
          set((state) => ({
            invoices: state.invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv)
          }));
          get().logEvent('UPDATE', 'Billing Record', `Updated invoice status to ${newStatus}`, id);
        }
      },

      addStaffMember: async (member) => {
        const { data, error } = await supabase.from('staff').insert([member]).select().single();
        if (!error && data) {
          set((state) => ({ staff: [data, ...state.staff] }));
          get().logEvent('CREATE', 'Staff Record', `Added new staff member: ${member.name}`, data.id);
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
          get().logEvent('CREATE', 'Staff Record', `Approved registration for ${newStaff.name}`, data.id);
        }
      },

      rejectRegistration: async (id) => {
        const state = get();
        const reg = state.pendingRegistrations.find(r => r.id === id);
        
        const { error } = await supabase.from('pending_registrations').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            pendingRegistrations: state.pendingRegistrations.filter(r => r.id !== id)
          }));
          if (reg) {
            get().logEvent('DELETE', 'Registration Request', `Rejected registration for ${reg.name}`, id);
          }
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
          get().logEvent('CREATE', 'Clinical Note', `Added clinical note for patient`, data.id);
        }
      },

      addPrescription: async (prescription) => {
        const { data, error } = await supabase.rpc('prescribe_medication', {
          p_patient_id: prescription.patientId,
          p_doctor_name: prescription.doctorName,
          p_pharmacy_item_id: prescription.pharmacyItemId,
          p_dosage: prescription.dosage,
          p_frequency: prescription.frequency,
          p_duration_days: prescription.durationDays,
          p_quantity: prescription.quantity
        });

        if (!error && data && data.success) {
          // Re-fetch data to sync new prescription and invoice
          get().fetchData();
        } else {
          console.error("Failed to prescribe medication:", error);
          throw error;
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

      updateProfile: async (name: string) => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not logged in' };
        
        try {
          const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id);
          if (error) throw error;
          
          set({ user: { ...user, name } });
          get().logEvent('UPDATE', 'Profile', 'Updated personal profile information', user.id);
          return { success: true };
        } catch (error: any) {
          console.error("Error updating profile:", error);
          return { success: false, error: error.message };
        }
      },

      updateHospitalSettings: async (settings: Partial<HospitalSettings>) => {
        try {
          const { data, error } = await supabase
            .from('hospital_settings')
            .update(settings)
            .eq('id', 1)
            .select()
            .single();
            
          if (error) throw error;
          
          set({ hospitalSettings: data });
          get().logEvent('UPDATE', 'System Settings', 'Updated hospital configuration');
          return { success: true };
        } catch (error: any) {
          console.error("Error updating hospital settings:", error);
          return { success: false, error: error.message };
        }
      },

      updatePassword: async (password: string) => {
        try {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;
          get().logEvent('UPDATE', 'Security', 'User updated their password', get().user?.id);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      updateNotificationPreferences: async (preferences: Partial<User['notificationPreferences']>) => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not logged in' };
        
        try {
          const newPrefs = { ...(user.notificationPreferences || {}), ...preferences };
          const { error } = await supabase.from('profiles').update({ notification_preferences: newPrefs }).eq('id', user.id);
          if (error) throw error;
          
          set({ user: { ...user, notificationPreferences: newPrefs as any } });
          get().logEvent('UPDATE', 'Settings', 'Updated notification preferences', user.id);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
    }),
    {
      name: 'hims-storage',
      // Only persist theme and user if we want, but since we use Supabase Auth state, we don't need to persist data
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
