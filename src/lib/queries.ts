import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { PatientRecord } from '../types';

// Fetch paginated patients
export const usePatients = (page: number, limit: number, searchQuery: string) => {
  return useQuery({
    queryKey: ['patients', page, limit, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*, clinical_notes(*)', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%,diagnosis.ilike.%${searchQuery}%`);
      }

      // Supabase range is inclusive, e.g., 0-9 is 10 items
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      const patients: PatientRecord[] = (data || []).map((p: any) => ({
        id: p.id, name: p.name, age: p.age, gender: p.gender, bloodGroup: p.blood_group,
        genotype: p.genotype, paymentMethod: p.payment_method, diagnosis: p.diagnosis,
        status: p.status, department: p.department, admissionDate: p.admission_date,
        contactInfo: p.contact_info, medicalHistory: p.medical_history, insuranceDetails: p.insurance_details,
        clinicalNotes: p.clinical_notes ? p.clinical_notes.map((n: any) => ({
          id: n.id, date: n.date, note: n.note, author: n.author
        })) : []
      }));

      return {
        data: patients,
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      };
    },
  });
};

// Fetch patient statistics securely
export const usePatientStats = () => {
  return useQuery({
    queryKey: ['patientStats'],
    queryFn: async () => {
      const [
        { count: total },
        { count: inpatient },
        { count: outpatient },
        { count: emergency }
      ] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'Inpatient'),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'Outpatient'),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('department', 'Emergency'),
      ]);

      return {
        total: total || 0,
        inpatient: inpatient || 0,
        outpatient: outpatient || 0,
        emergency: emergency || 0
      };
    },
  });
};