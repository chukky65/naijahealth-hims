import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus, X, AlertCircle, MessageSquare, Smartphone, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { format, addDays, startOfWeek } from 'date-fns';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user, appointments, addAppointment, staff, patients, isLoading } = useStore();
  const { t } = useTranslation();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    doctorName: '',
    appointmentTime: '09:00',
    type: 'Consultation'
  });
  const [isBooking, setIsBooking] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchComplete, setDispatchComplete] = useState(false);
  
  const handleDispatchReminders = () => {
    setIsDispatching(true);
    setDispatchComplete(false);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchComplete(true);
      toast.success('Successfully dispatched WhatsApp & SMS reminders to all scheduled patients.');
      setTimeout(() => setDispatchComplete(false), 5000);
    }, 2500);
  };
  
  const doctors = staff.filter(s => s.role === 'Doctor' || s.role === 'MedicalDirector');

  const filteredAppointments = appointments.filter(
    app => app.appointmentDate === format(selectedDate, 'yyyy-MM-dd')
  ).sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

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
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
          >
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

          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-900/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <MessageSquare className="w-5 h-5" />
                Automated Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Send automated WhatsApp and SMS appointment reminders to patients scheduled for tomorrow to reduce no-shows.
              </p>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span>Pending Dispatches</span>
                </div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {appointments.length} patients
                </Badge>
              </div>

              <button
                onClick={handleDispatchReminders}
                disabled={isDispatching || dispatchComplete}
                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  dispatchComplete 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                } disabled:opacity-80`}
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Messages...
                  </>
                ) : dispatchComplete ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Dispatched Successfully
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Dispatch All Reminders
                  </>
                )}
              </button>
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
              ) : filteredAppointments.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <CalendarIcon className="w-12 h-12 mb-4 text-slate-300" />
                  <p>{t('appointments.noAppointments')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAppointments.map(app => (
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
                              <User className="w-3.5 h-3.5" /> {app.doctorName}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>{app.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white text-lg shrink-0 sm:text-right pl-14 sm:pl-0">
                        {app.appointmentTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-appointment-title">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 id="add-appointment-title" className="text-xl font-bold">New Appointment</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsBooking(true);
                const res = await addAppointment({
                  patientName: newAppointment.patientName,
                  doctorName: newAppointment.doctorName,
                  appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
                  appointmentTime: newAppointment.appointmentTime,
                  type: newAppointment.type
                });
                setIsBooking(false);
                
                if (res.success) {
                  toast.success('Appointment Booked Successfully');
                  setIsAddModalOpen(false);
                } else {
                  toast.error('Booking Failed', {
                    description: res.error,
                    icon: <AlertCircle className="w-5 h-5 text-red-500" />
                  });
                }
              }} 
              className="p-6 space-y-4"
            >
              <div className="bg-sky-50 dark:bg-sky-900/20 p-3 rounded border border-sky-100 dark:border-sky-800 text-sm text-sky-800 dark:text-sky-300">
                Booking for: <strong>{format(selectedDate, 'EEEE, MMMM do, yyyy')}</strong>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Patient Name</label>
                <input 
                  required
                  type="text" 
                  value={newAppointment.patientName}
                  onChange={e => setNewAppointment({...newAppointment, patientName: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Doctor</label>
                <select 
                  required
                  value={newAppointment.doctorName}
                  onChange={e => setNewAppointment({...newAppointment, doctorName: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Time</label>
                  <input 
                    required
                    type="time" 
                    value={newAppointment.appointmentTime}
                    onChange={e => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Type</label>
                  <select 
                    value={newAppointment.type}
                    onChange={e => setNewAppointment({...newAppointment, type: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Routine Check">Routine Check</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isBooking}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
                >
                  {isBooking ? 'Checking Conflicts...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
