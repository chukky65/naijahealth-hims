import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { Search, Plus, Filter, UserCog, Mail, Phone, Clock, Check, X, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UserRole, StaffMember } from '../types';
import { toast } from 'sonner';



export const StaffDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'requests'>('directory');
  const { user, staff, pendingRegistrations, isLoading, approveRegistration, rejectRegistration } = useStore();
  const staffList = staff;
  const requests = pendingRegistrations;

  const filteredStaff = staffList?.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'On Leave': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'Off Duty': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      await approveRegistration(id);
      toast.success(`Account approved for ${name}. They will receive an email notification.`);
    } catch (e) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await rejectRegistration(id);
      toast.success(`Account request rejected for ${name}.`);
    } catch (e) {
      toast.error('Failed to reject request');
    }
  };

  const canManageStaff = user?.role === 'Admin' || user?.role === 'MedicalDirector';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage hospital personnel, roles, and access requests.</p>
        </div>
        {canManageStaff && activeTab === 'directory' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Personnel
          </button>
        )}
      </div>

      {canManageStaff && (
        <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'directory'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Access Requests
            {requests.length > 0 && (
              <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 py-0.5 px-2 rounded-full text-xs">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'directory' ? (
        <Card>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or department..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-900 dark:text-slate-100"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Filter className="w-4 h-4" /> Filter Roles
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Personnel</th>
                  <th className="px-6 py-4">Role / Department</th>
                  <th className="px-6 py-4">Contact Information</th>
                  <th className="px-6 py-4">Current Status</th>
                  {canManageStaff && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={canManageStaff ? 5 : 4} className="px-6 py-8 text-center text-slate-500 mb-2">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin flex items-center justify-center mb-2" />
                        Loading personnel data...
                      </div>
                    </td>
                  </tr>
                ) : filteredStaff?.map(staff => (
                  <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-700 dark:text-sky-400 font-bold shrink-0">
                          {staff.name.substring(0, 2).replace('.', '').trim().toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{staff.name}</div>
                          <div className="text-xs text-slate-500">{staff.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{staff.role}</span>
                        <span className="text-slate-500 text-xs">{staff.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {staff.email}</span>
                        <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {staff.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(staff.status)}>
                        <Clock className="w-3 h-3 mr-1" />
                        {staff.status}
                      </Badge>
                    </td>
                    {canManageStaff && (
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30">
                          <UserCog className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No pending requests</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">All staff access requests have been processed.</p>
            </div>
          ) : (
            requests.map(request => (
              <Card key={request.id}>
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{request.name}</h3>
                      <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        Requested: {request.role}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" /> {request.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">License/ID:</span> {request.licenseNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">Requested On:</span> {request.date}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Reason/Department:</span> {request.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                    <button 
                      onClick={() => handleApprove(request.id, request.name)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(request.id, request.name)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg font-medium transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

