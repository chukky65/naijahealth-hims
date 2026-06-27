import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, FileText, UserPlus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

export const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addPatient, addAppointment, addPrescription } = useStore();

  const [patientForm, setPatientForm] = useState({ firstName: '', lastName: '', dob: '', email: '', phone: '' });
  const [aptForm, setAptForm] = useState({ patientName: '', datetime: '', reason: '' });
  const [rxForm, setRxForm] = useState({ patientId: '', medicationName: '', dosage: '', instructions: '' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreate = async () => {
    try {
      if (activeModal === 'patient') {
        if (!patientForm.firstName || !patientForm.lastName) {
          toast.error("Please provide at least a first and last name.");
          return;
        }
        const age = patientForm.dob ? new Date().getFullYear() - new Date(patientForm.dob).getFullYear() : 30;
        await addPatient({
          name: `${patientForm.firstName} ${patientForm.lastName}`,
          age: age,
          gender: 'M',
          bloodGroup: 'Unknown',
          genotype: 'Unknown',
          paymentMethod: 'Out of Pocket',
          diagnosis: 'Pending Assessment',
          status: 'Outpatient',
          department: 'General',
          admissionDate: new Date().toISOString().split('T')[0],
          contactInfo: `${patientForm.phone} | ${patientForm.email}`,
          medicalHistory: '',
          insuranceDetails: 'N/A'
        });
        toast.success('Patient created successfully!');
      } else if (activeModal === 'appointment') {
        if (!aptForm.patientName || !aptForm.datetime) {
          toast.error("Please provide patient name and time.");
          return;
        }
        const dt = new Date(aptForm.datetime);
        await addAppointment({
          patientName: aptForm.patientName,
          doctorName: 'Unassigned',
          appointmentDate: dt.toISOString().split('T')[0],
          appointmentTime: dt.toTimeString().substring(0, 5),
          type: 'Consultation'
        });
        toast.success('Appointment booked successfully!');
      } else if (activeModal === 'prescription') {
        if (!rxForm.patientId || !rxForm.medicationName) {
          toast.error("Please provide patient ID and medication name.");
          return;
        }
        await addPrescription({
          patientId: rxForm.patientId,
          doctorName: 'Current User', // Normally pulled from session
          pharmacyItemId: 'P-GEN-1', // Default generic item
          dosage: rxForm.dosage || 'Standard',
          frequency: rxForm.instructions || 'As directed',
          durationDays: 7,
          quantity: 1
        });
        toast.success('Prescription created successfully!');
      }
      
      setActiveModal(null);
      // Reset forms
      setPatientForm({ firstName: '', lastName: '', dob: '', email: '', phone: '' });
      setAptForm({ patientName: '', datetime: '', reason: '' });
      setRxForm({ patientId: '', medicationName: '', dosage: '', instructions: '' });
      
    } catch (error) {
      toast.error('An error occurred during creation.');
    }
  };

  const actions = [
    {
      id: 'appointment',
      label: 'New Appointment',
      icon: Calendar,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      id: 'prescription',
      label: 'New Prescription',
      icon: FileText,
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
    },
    {
      id: 'patient',
      label: 'New Patient Record',
      icon: UserPlus,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
  ];

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40" ref={menuRef}>
        {/* Menu Items */}
        <div
          className={`absolute bottom-16 right-0 mb-4 flex flex-col items-end space-y-3 transition-all duration-200 ease-in-out ${
            isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'
          }`}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className={`flex items-center gap-3 transition-all duration-200`}
                style={{ transitionDelay: `${isOpen ? (actions.length - index) * 50 : 0}ms` }}
              >
                <span className="bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    setActiveModal(action.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-95 ${action.color} ${action.hoverColor}`}
                  title={action.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-200 ease-in-out ${
            isOpen ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-500 hover:bg-sky-600'
          } text-white hover:scale-105 active:scale-95`}
          aria-label="Quick actions"
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-135' : 'rotate-0'}`}>
            <Plus className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold">
                {actions.find(a => a.id === activeModal)?.label}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please fill in the details for the {actions.find(a => a.id === activeModal)?.label.toLowerCase()}.
              </p>
              
              {activeModal === 'appointment' && (
                <div className="space-y-3">
                  <input type="text" placeholder="Patient Name" value={aptForm.patientName} onChange={e => setAptForm({...aptForm, patientName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm" />
                  <input type="datetime-local" value={aptForm.datetime} onChange={e => setAptForm({...aptForm, datetime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm dark:[color-scheme:dark]" />
                  <textarea placeholder="Reason for visit" value={aptForm.reason} onChange={e => setAptForm({...aptForm, reason: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm h-20"></textarea>
                </div>
              )}

              {activeModal === 'prescription' && (
                <div className="space-y-3">
                  <input type="text" placeholder="Patient ID" value={rxForm.patientId} onChange={e => setRxForm({...rxForm, patientId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm" />
                  <input type="text" placeholder="Medication Name" value={rxForm.medicationName} onChange={e => setRxForm({...rxForm, medicationName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm" />
                  <input type="text" placeholder="Dosage" value={rxForm.dosage} onChange={e => setRxForm({...rxForm, dosage: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm" />
                  <textarea placeholder="Instructions" value={rxForm.instructions} onChange={e => setRxForm({...rxForm, instructions: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm h-20"></textarea>
                </div>
              )}

              {activeModal === 'patient' && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input type="text" placeholder="First Name" value={patientForm.firstName} onChange={e => setPatientForm({...patientForm, firstName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm" />
                    <input type="text" placeholder="Last Name" value={patientForm.lastName} onChange={e => setPatientForm({...patientForm, lastName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm" />
                  </div>
                  <input type="date" placeholder="Date of Birth" value={patientForm.dob} onChange={e => setPatientForm({...patientForm, dob: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm text-slate-500 dark:[color-scheme:dark]" />
                  <input type="email" placeholder="Email Address" value={patientForm.email} onChange={e => setPatientForm({...patientForm, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm" />
                  <input type="tel" placeholder="Phone Number" value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm" />
                </div>
              )}

            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
