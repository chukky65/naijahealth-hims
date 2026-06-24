import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';
import { format, addDays, startOfWeek } from 'date-fns';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Fetch Function utilizing React Query convention
const fetchAppointments = async () => {
  await delay(1000); // Simulate network latency
  return [
    { id: 1, patientName: 'Ahmed Ali', time: '09:00 AM', status: 'Confirmed', doctor: 'Dr. Sarah Okafor', type: 'Consultation' },
    { id: 2, patientName: 'Victoria Osas', time: '10:30 AM', status: 'Checked In', doctor: 'Dr. Musa Adebayo', type: 'Follow-up' },
    { id: 3, patientName: 'Nnamdi Kalu', time: '11:15 AM', status: 'Pending', doctor: 'Dr. Sarah Okafor', type: 'Routine Check' },
    { id: 4, patientName: 'Fatima Umar', time: '01:00 PM', status: 'Confirmed', doctor: 'Dr. Musa Adebayo', type: 'Consultation' },
    { id: 5, patientName: 'Chinedu Eze', time: '02:45 PM', status: 'Cancelled', doctor: 'Dr. Sarah Okafor', type: 'Lab Review' }
  ];
};

export const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useStore();
  const { t } = useTranslation();
  
  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments', selectedDate.toISOString()],
    queryFn: fetchAppointments,
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed': return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800';
      case 'Checked In': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const canMakeAppointment = user?.role === 'Admin' || user?.role === 'Receptionist' || user?.role === 'MedicalDirector';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('appointments.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('appointments.subtitle')}</p>
        </div>
        {canMakeAppointment && (
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            {t('appointments.newAppointment')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('appointments.calendar')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  {format(selectedDate, 'MMMM yyyy')}
                </div>
                <button 
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                  <div key={day} className="text-xs font-semibold text-slate-500">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((date, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square sm:aspect-auto sm:h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${
                      format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                        ? 'bg-sky-600 text-white font-medium'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {format(date, 'd')}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle>{t('appointments.scheduleFor')} {format(selectedDate, 'EEEE, MMMM do')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  {t('appointments.failedToLoad')}
                </div>
              ) : appointments?.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <CalendarIcon className="w-12 h-12 mb-4 text-slate-300" />
                  <p>{t('appointments.noAppointments')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appointments?.map(app => (
                    <div key={app.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl shrink-0">
                          <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {app.patientName}
                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                          </h4>
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <User className="w-3.5 h-3.5" /> {app.doctor}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>{app.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white text-lg shrink-0 sm:text-right pl-14 sm:pl-0">
                        {app.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
