import React, { useMemo } from 'react';
import { Calendar, Pill, FileText, User, Activity, Clock, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { useStore } from '../store/useStore';
import { format, addDays } from 'date-fns';

export const PatientPortal = () => {
  const { user } = useStore();

  const patientData = useMemo(() => {
    // Generate deterministic mock data for the portal based on the user's name
    const seed = user?.name.length || 5;
    
    return {
      upcomingAppointments: [
        {
          id: 'app-1',
          date: addDays(new Date(), 2),
          doctor: 'Dr. Jane Smith',
          department: 'General Medicine',
          type: 'Follow-up',
          status: 'Confirmed'
        },
        {
          id: 'app-2',
          date: addDays(new Date(), 14),
          doctor: 'Dr. David Chen',
          department: 'Cardiology',
          type: 'Routine Checkup',
          status: 'Pending'
        }
      ],
      medications: [
        {
          id: 'med-1',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          instructions: 'Take in the morning with water',
          refillsLeft: 2,
          prescribingDoctor: 'Dr. Jane Smith'
        },
        {
          id: 'med-2',
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily',
          instructions: 'Take at bedtime',
          refillsLeft: 0,
          prescribingDoctor: 'Dr. David Chen'
        }
      ],
      healthSummary: {
        bloodGroup: 'O+',
        genotype: 'AA',
        allergies: ['Penicillin', 'Peanuts'],
        conditions: ['Hypertension', 'Hyperlipidemia'],
        lastVisit: '2 weeks ago',
        vitals: {
          bloodPressure: '120/80',
          heartRate: '72 bpm',
          weight: '75 kg',
          height: '175 cm'
        }
      }
    };
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your health records and upcoming appointments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            Account Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary & Appointments */}
        <div className="md:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientData.upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 shrink-0">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {format(apt.date, 'dd')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{apt.type}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {apt.doctor} • {apt.department}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {format(apt.date, 'MMM dd, yyyy - h:mm a')}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Badge className={
                        apt.status === 'Confirmed' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-500" />
                Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patientData.medications.map((med) => (
                  <div key={med.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{med.name}</h4>
                      <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {med.dosage}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                      {med.frequency}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                      {med.instructions}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Refills: {med.refillsLeft}</span>
                      <span className="text-slate-500 truncate pl-2">{med.prescribingDoctor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Health Profile */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500" />
                Health Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Vitals snapshot */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500 block mb-1">Blood Pressure</span>
                    <span className="font-bold text-slate-900 dark:text-white">{patientData.healthSummary.vitals.bloodPressure}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500 block mb-1">Heart Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white">{patientData.healthSummary.vitals.heartRate}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500 block mb-1">Weight</span>
                    <span className="font-bold text-slate-900 dark:text-white">{patientData.healthSummary.vitals.weight}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500 block mb-1">Height</span>
                    <span className="font-bold text-slate-900 dark:text-white">{patientData.healthSummary.vitals.height}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Basic Info</h5>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-xs text-slate-400 block">Blood Group</span>
                        <span className="font-medium text-slate-900 dark:text-white">{patientData.healthSummary.bloodGroup}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Genotype</span>
                        <span className="font-medium text-slate-900 dark:text-white">{patientData.healthSummary.genotype}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Conditions</h5>
                    <div className="flex flex-wrap gap-2">
                      {patientData.healthSummary.conditions.map(cond => (
                        <span key={cond} className="px-2 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded text-xs font-medium">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Allergies</h5>
                    <div className="flex flex-wrap gap-2">
                      {patientData.healthSummary.allergies.map(allergy => (
                        <span key={allergy} className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded text-xs font-medium">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
