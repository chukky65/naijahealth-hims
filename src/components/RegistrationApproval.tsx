import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from './ui/core';
import { Check, X, UserCog, Mail, Calendar, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const RegistrationApproval = () => {
  const { pendingRegistrations, approveRegistration, rejectRegistration } = useStore();
  const { t } = useTranslation();

  const handleApprove = (id: string, name: string) => {
    approveRegistration(id);
    toast.success(`Registration for ${name} has been approved.`);
  };

  const handleReject = (id: string, name: string) => {
    rejectRegistration(id);
    toast.error(`Registration for ${name} has been rejected.`);
  };

  if (pendingRegistrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-slate-500" />
            Pending Registrations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <Check className="w-6 h-6 text-slate-400" />
          </div>
          <p className="font-medium text-slate-600 dark:text-slate-400">All caught up!</p>
          <p className="text-sm">No pending registration requests to review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Pending Registrations
          <Badge variant="warning" className="ml-2">
            {pendingRegistrations.length} Pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {pendingRegistrations.map((reg) => (
            <div key={reg.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                        {reg.name}
                      </h4>
                      <Badge variant="default" className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-none">
                        {reg.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {reg.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(reg.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3 text-sm border border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {reg.licenseNumber && (
                        <div>
                          <span className="block text-xs font-medium text-slate-400 uppercase mb-0.5">License / ID</span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{reg.licenseNumber}</span>
                        </div>
                      )}
                      {reg.requestReason && (
                        <div className="sm:col-span-2">
                          <span className="block text-xs font-medium text-slate-400 uppercase mb-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Reason for Request
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{reg.requestReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => handleApprove(reg.id, reg.name)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400 rounded-md text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(reg.id, reg.name)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-md text-sm font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
