import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { UserCheck, Clock, ShieldAlert, Plus, Search, X, ArrowUpDown, Download, ChevronLeft, ChevronRight, Pill, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';
import { PatientRecord } from '../types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useStore } from '../store/useStore';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';

import { PatientVitals } from '../components/PatientVitals';

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(0, "Age must be positive"),
  gender: z.enum(['M', 'F']),
  bloodGroup: z.string().min(1, "Blood group required"),
  genotype: z.string().min(1, "Genotype required"),
  contactInfo: z.string().min(5, "Contact info required"),
  diagnosis: z.string().min(2, "Diagnosis required"),
  department: z.string().min(1, "Department required"),
  status: z.enum(['Inpatient', 'Outpatient', 'Discharged']),
  paymentMethod: z.enum(['Out of Pocket', 'NHIA', 'Private Insurance']),
  insuranceDetails: z.string().optional(),
  medicalHistory: z.string().optional(),
}).superRefine((data, ctx) => {
  if (
    (data.paymentMethod === 'NHIA' || data.paymentMethod === 'Private Insurance') && 
    (!data.insuranceDetails || data.insuranceDetails.trim() === '')
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Insurance ID / Provider Details required for this payment method",
      path: ["insuranceDetails"],
    });
  }
});
type PatientFormValues = z.infer<typeof patientSchema>;

export const Patients = () => {
  const { patients, patientStats, fetchPatients, addPatient, addClinicalNote, isLoading, setIsLoading, user, pharmacyItems, prescriptions, addPrescription, labTests, labOrders, addLabOrder } = useStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [newNote, setNewNote] = useState('');
  
  // E-Prescription State
  const [newPrescription, setNewPrescription] = useState({
    pharmacyItemId: '',
    dosage: '',
    frequency: '',
    durationDays: 1,
  });

  const handleAddPrescription = () => {
    if (!newPrescription.pharmacyItemId || !newPrescription.dosage || !newPrescription.frequency || !selectedPatient || !user) return;
    
    // CLINICAL SAFETY CHECK: ALLERGY ALERT
    const drug = pharmacyItems.find(item => item.id === newPrescription.pharmacyItemId);
    if (drug && selectedPatient.medicalHistory) {
      const historyLower = selectedPatient.medicalHistory.toLowerCase();
      const drugLower = drug.name.toLowerCase();
      const categoryLower = drug.category.toLowerCase();
      
      // If the history mentions the drug name or its category, trigger a warning.
      if (historyLower.includes(drugLower) || historyLower.includes(categoryLower)) {
        const proceed = window.confirm(`⚠️ CLINICAL SAFETY ALERT ⚠️\n\nThis patient's medical history mentions "${drug.name}" or "${drug.category}". They may have an allergy or adverse reaction to this medication.\n\nAre you absolutely sure you want to proceed with this prescription?`);
        if (!proceed) {
          return; // Halt prescription
        }
      }
    }

    addPrescription({
      patientId: selectedPatient.id,
      doctorName: user.name,
      pharmacyItemId: newPrescription.pharmacyItemId,
      dosage: newPrescription.dosage,
      frequency: newPrescription.frequency,
      durationDays: newPrescription.durationDays,
    });

    setNewPrescription({ pharmacyItemId: '', dosage: '', frequency: '', durationDays: 1 });
    toast.success('Prescription sent to pharmacy successfully');
  };

  // Lab Order State
  const [selectedLabTestId, setSelectedLabTestId] = useState('');

  const handleAddLabOrder = () => {
    if (!selectedLabTestId || !selectedPatient || !user) return;
    
    addLabOrder({
      patientId: selectedPatient.id,
      doctorName: user.name,
      testId: selectedLabTestId
    });

    setSelectedLabTestId('');
    toast.success('Lab test ordered successfully');
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedPatient || !user) return;
    
    const note = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      note: newNote,
      author: user.name,
    };
    
    addClinicalNote(selectedPatient.id, note);
    // Update local selectedPatient state to show the new note immediately
    setSelectedPatient(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        clinicalNotes: [note, ...(prev.clinicalNotes || [])]
      }
    });
    setNewNote('');
    toast.success('Clinical note added successfully');
  };

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [setIsLoading]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setSelectedPatient(null);
      }
    };
    if (isAddModalOpen || selectedPatient) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, selectedPatient]);

  const [sortConfig, setSortConfig] = useState<{ key: keyof PatientRecord; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch paginated patients
  React.useEffect(() => {
    fetchPatients(currentPage, debouncedSearchQuery, itemsPerPage, sortConfig?.key, sortConfig?.direction === 'asc');
  }, [currentPage, debouncedSearchQuery, sortConfig, fetchPatients]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      gender: 'M',
      bloodGroup: 'O+',
      genotype: 'AA',
      department: 'Emergency',
      status: 'Outpatient',
      paymentMethod: 'Out of Pocket'
    }
  });

  const onSubmit = (data: PatientFormValues) => {
    const newPatient: PatientRecord = {
      id: `PAT-${10000 + patients.length + 1}`,
      ...data,
      clinicalNotes: [],
      admissionDate: new Date().toISOString(),
    };
    addPatient(newPatient);
    setIsAddModalOpen(false);
    reset();
    toast.success('Patient Registration Successful', {
      description: `${newPatient.name} has been added to the registry.`,
    });
  };

  const handleSort = (key: keyof PatientRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(patientStats.total / itemsPerPage);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Patient Registry Report (Current Page)', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['ID', 'Name', 'Age/Gender', 'Diagnosis', 'Department', 'Status']],
      body: patients.map(p => [
        p.id, p.name, `${p.age}/${p.gender}`, p.diagnosis, p.department, p.status
      ]),
    });
    doc.save('patient-registry.pdf');
    toast.success('Report exported as PDF');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6 flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="p-4">
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const canAddPatient = user?.role === 'Admin' || user?.role === 'Receptionist' || user?.role === 'MedicalDirector';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('patients.title')}</h1>
          <p className="text-slate-500">{t('patients.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" /> {t('patients.export')}
          </button>
          {canAddPatient && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('patients.addPatient')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('patients.activeInpatients')}</p>
              <h3 className="text-2xl font-bold">{patientStats.inpatient}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('patients.outpatientQueue')}</p>
              <h3 className="text-2xl font-bold">{patientStats.outpatient}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('patients.criticalEmergency')}</p>
              <h3 className="text-2xl font-bold">{patientStats.emergency}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>{t('patients.recentRegistry')}</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('patients.searchPlaceholder')}
              aria-label="Search patients"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="p-0">
                  <button 
                    className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 uppercase"
                    onClick={() => handleSort('name')}
                    aria-label="Sort by Patient Name"
                  >
                    Patient Details <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-3 font-medium">Demographics</th>
                <th className="p-0">
                  <button 
                    className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 uppercase"
                    onClick={() => handleSort('diagnosis')}
                    aria-label="Sort by Diagnosis"
                  >
                    Diagnosis <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button 
                    className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 uppercase"
                    onClick={() => handleSort('department')}
                    aria-label="Sort by Department"
                  >
                    Department <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-3 font-medium">Payment Route</th>
                <th className="p-0">
                  <button 
                    className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 uppercase"
                    onClick={() => handleSort('admissionDate')}
                    aria-label="Sort by Status and Date"
                  >
                    Status & Date <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr 
                  key={patient.id} 
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for patient ${patient.name}`}
                  onClick={() => setSelectedPatient(patient)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPatient(patient);
                    }
                  }}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 cursor-pointer focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800/50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{patient.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p>{patient.age}yrs • {patient.gender}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{patient.bloodGroup} • {patient.genotype}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                    {patient.diagnosis}
                  </td>
                  <td className="px-6 py-4">{patient.department}</td>
                  <td className="px-6 py-4">
                    <Badge variant={patient.paymentMethod === 'Out of Pocket' ? 'warning' : 'success'}>
                      {patient.paymentMethod}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p>
                      <Badge variant={patient.status === 'Inpatient' ? 'danger' : 'default'}>
                        {patient.status}
                      </Badge>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{format(new Date(patient.admissionDate), 'MMM d, yyyy')}</p>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No patients found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, patientStats.total)} to {Math.min(currentPage * itemsPerPage, patientStats.total)} of {patientStats.total} patients
          </p>
          <div className="flex items-center gap-1 text-sm">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-2 font-medium">{currentPage} / {Math.max(1, totalPages)}</span>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-patient-title">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
              <h2 id="add-patient-title" className="text-xl font-bold">Register New Patient</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Close add patient modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                  <input {...register("name")} type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Age</label>
                    <input {...register("age")} type="number" min="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                    {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
                    <select {...register("gender")} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50">
                      <option value="M">Male (M)</option>
                      <option value="F">Female (F)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Blood Group</label>
                    <select {...register("bloodGroup")} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50">
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Genotype</label>
                    <select {...register("genotype")} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50">
                      <option value="AA">AA</option>
                      <option value="AS">AS</option>
                      <option value="SS">SS</option>
                      <option value="AC">AC</option>
                      <option value="SC">SC</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Contact Info</label>
                  <input {...register("contactInfo")} type="text" placeholder="Phone or email" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  {errors.contactInfo && <p className="text-xs text-red-500">{errors.contactInfo.message}</p>}
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Primary Diagnosis</label>
                  <input {...register("diagnosis")} type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  {errors.diagnosis && <p className="text-xs text-red-500">{errors.diagnosis.message}</p>}
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                  <select {...register("department")} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50">
                    <option value="Emergency">Emergency</option>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Maternity">Maternity</option>
                    <option value="Surgical">Surgical</option>
                    <option value="Intensive Care Unit">Intensive Care Unit</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select {...register("status")} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50">
                    <option value="Outpatient">Outpatient</option>
                    <option value="Inpatient">Inpatient</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Payment Method</label>
                  <select {...register("paymentMethod")} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50">
                    <option value="Out of Pocket">Out of Pocket</option>
                    <option value="NHIA">NHIA</option>
                    <option value="Private Insurance">Private Insurance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Insurance Details</label>
                  <input {...register("insuranceDetails")} type="text" placeholder="NHIA No. or Provider" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  {errors.insuranceDetails && <p className="text-xs text-red-500">{errors.insuranceDetails.message}</p>}
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Medical History Notes</label>
                  <textarea {...register("medicalHistory")} rows={3} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 transition-colors">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="view-patient-title">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-500">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 id="view-patient-title" className="text-xl font-bold">{selectedPatient.name}</h2>
                  <p className="text-xs font-mono text-slate-500">{selectedPatient.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Close patient details modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Age / Gender</p>
                  <p className="font-medium mt-1">{selectedPatient.age} / {selectedPatient.gender}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Blood / Genotype</p>
                  <p className="font-medium mt-1">{selectedPatient.bloodGroup} / {selectedPatient.genotype}</p>
                </div>
                 <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                  <p className="font-medium mt-1">{selectedPatient.status}</p>
                </div>
                 <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Admission Date</p>
                  <p className="font-medium mt-1">{format(new Date(selectedPatient.admissionDate), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Clinical Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Primary Diagnosis</p>
                    <p className="text-sm font-medium">{selectedPatient.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Assigned Department</p>
                    <p className="text-sm">{selectedPatient.department}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Medical History Notes</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-md border border-slate-100 dark:border-slate-800 min-h-[60px]">
                      {selectedPatient.medicalHistory || 'No medical history recorded.'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Vitals History (Last 7 Days)</h3>
                <PatientVitals patientId={selectedPatient.id} />
              </div>

              <div>
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Clinical Notes (Progress)</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <textarea 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a new dated progress note..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50 min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {selectedPatient.clinicalNotes && selectedPatient.clinicalNotes.length > 0 ? (
                      selectedPatient.clinicalNotes.map(note => (
                        <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-center mb-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{note.author}</span>
                            <span>{format(new Date(note.date), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.note}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">No progress notes recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-sky-500" /> E-Prescriptions
                </h3>
                <div className="space-y-4">
                  {(user?.role === 'Doctor' || user?.role === 'MedicalDirector') && (
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase">New Prescription</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                          value={newPrescription.pharmacyItemId}
                          onChange={(e) => setNewPrescription({...newPrescription, pharmacyItemId: e.target.value})}
                        >
                          <option value="">Select Medication...</option>
                          {pharmacyItems.filter(item => item.stockLevel > 0).map(item => (
                            <option key={item.id} value={item.id}>{item.name} ({item.stockLevel} in stock)</option>
                          ))}
                        </select>
                        <input 
                          type="text" placeholder="Dosage (e.g., 500mg)" 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                          value={newPrescription.dosage}
                          onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                        />
                        <input 
                          type="text" placeholder="Frequency (e.g., 1x Daily)" 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                          value={newPrescription.frequency}
                          onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                        />
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" min="1" placeholder="Days" 
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                            value={newPrescription.durationDays}
                            onChange={(e) => setNewPrescription({...newPrescription, durationDays: parseInt(e.target.value) || 1})}
                          />
                          <button 
                            onClick={handleAddPrescription}
                            disabled={!newPrescription.pharmacyItemId || !newPrescription.dosage || !newPrescription.frequency}
                            className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 disabled:opacity-50 whitespace-nowrap"
                          >
                            Send to Pharmacy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {prescriptions.filter(p => p.patientId === selectedPatient.id).length > 0 ? (
                      prescriptions.filter(p => p.patientId === selectedPatient.id).map(p => {
                        const drug = pharmacyItems.find(i => i.id === p.pharmacyItemId);
                        return (
                          <div key={p.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{drug?.name || 'Unknown Drug'}</p>
                              <p className="text-xs text-slate-500">{p.dosage} • {p.frequency} for {p.durationDays} days</p>
                              <p className="text-[10px] text-slate-400 mt-1">Prescribed by {p.doctorName} on {format(new Date(p.date), 'MMM d, yyyy')}</p>
                            </div>
                            <Badge variant={p.status === 'Dispensed' ? 'success' : p.status === 'Pending' ? 'warning' : 'danger'}>
                              {p.status}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500 italic">No prescriptions found.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mb-3 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-indigo-500" /> Laboratory & Radiology
                </h3>
                <div className="space-y-4">
                  {(user?.role === 'Doctor' || user?.role === 'MedicalDirector') && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">Order New Test</h4>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                          value={selectedLabTestId}
                          onChange={(e) => setSelectedLabTestId(e.target.value)}
                        >
                          <option value="">Select Lab or Radiology Test...</option>
                          {labTests.map(test => (
                            <option key={test.id} value={test.id}>{test.name} - ₦{test.price.toLocaleString()}</option>
                          ))}
                        </select>
                        <button 
                          onClick={handleAddLabOrder}
                          disabled={!selectedLabTestId}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          Order Test
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {labOrders.filter(o => o.patientId === selectedPatient.id).length > 0 ? (
                      labOrders.filter(o => o.patientId === selectedPatient.id).map(order => {
                        const test = labTests.find(t => t.id === order.testId);
                        return (
                          <div key={order.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{test?.name || 'Unknown Test'}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Ordered by {order.doctorName} on {format(new Date(order.date), 'MMM d, yyyy')}</p>
                              
                              {order.status === 'Completed' && (
                                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Result: <span className="font-normal">{order.resultValue}</span></p>
                                  {order.notes && <p className="text-xs text-slate-500 mt-1 italic">{order.notes}</p>}
                                </div>
                              )}
                            </div>
                            <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'In Progress' ? 'info' : 'warning'}>
                              {order.status}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500 italic">No lab or radiology orders found.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Administrative & Finance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Contact Information</p>
                    <p className="text-sm">{selectedPatient.contactInfo || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Payment Method</p>
                    <p className="text-sm">
                      <Badge variant={selectedPatient.paymentMethod === 'Out of Pocket' ? 'warning' : 'success'}>
                        {selectedPatient.paymentMethod}
                      </Badge>
                    </p>
                  </div>
                  {selectedPatient.insuranceDetails && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Insurance Details</p>
                      <p className="text-sm font-mono">{selectedPatient.insuranceDetails}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
               <button onClick={() => setSelectedPatient(null)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
