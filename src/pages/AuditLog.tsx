import React, { useState } from 'react';
import { Search, Filter, Download, Clock, User, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

interface AuditEvent {
  id: string;
  user: string;
  role: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

// Mock data to use until the backend is fully connected
const mockAuditLogs: AuditEvent[] = [
  {
    id: 'evt_1',
    user: 'Dr. Sarah Jenkins',
    role: 'Doctor',
    action: 'UPDATE',
    resourceType: 'Patient Record',
    resourceId: 'PAT-1045',
    details: 'Updated patient allergies and medical history.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    ipAddress: '192.168.1.104'
  },
  {
    id: 'evt_2',
    user: 'Admin User',
    role: 'Admin',
    action: 'DELETE',
    resourceType: 'Billing Record',
    resourceId: 'INV-2099',
    details: 'Voided duplicate invoice.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    ipAddress: '192.168.1.101'
  },
  {
    id: 'evt_3',
    user: 'James Anderson',
    role: 'Receptionist',
    action: 'CREATE',
    resourceType: 'Appointment',
    resourceId: 'APT-5012',
    details: 'Scheduled new consultation appointment.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    ipAddress: '192.168.1.112'
  },
  {
    id: 'evt_4',
    user: 'Dr. Emily Chen',
    role: 'Doctor',
    action: 'VIEW',
    resourceType: 'Patient Record',
    resourceId: 'PAT-1092',
    details: 'Accessed sensitive patient medical records.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    ipAddress: '192.168.1.105'
  },
  {
    id: 'evt_5',
    user: 'Michael Chang',
    role: 'Pharmacist',
    action: 'UPDATE',
    resourceType: 'Inventory',
    resourceId: 'MED-771',
    details: 'Adjusted stock levels for Amoxicillin.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    ipAddress: '192.168.1.120'
  }
];

export const AuditLog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Use react-query to fetch logs, falling back to mock data
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<AuditEvent[]>('/audit-logs');
        return response.data;
      } catch (error) {
        console.warn('Failed to fetch audit logs, using mock data.');
        return mockAuditLogs;
      }
    },
    initialData: mockAuditLogs,
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDateRange = true;
    const logDate = new Date(log.timestamp);
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (logDate < start) matchesDateRange = false;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (logDate > end) matchesDateRange = false;
    }

    return matchesSearch && matchesDateRange;
  });

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
      case 'UPDATE': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
      case 'DELETE': return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
      case 'VIEW': return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20';
      default: return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Audit Log</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and monitor all system events, actions, and data modifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by user, action, resource, or details..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
             <div className="flex items-center gap-2">
               <input
                 type="date"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white dark:[color-scheme:dark]"
               />
               <span className="text-slate-500 dark:text-slate-400 text-sm">to</span>
               <input
                 type="date"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white dark:[color-scheme:dark]"
               />
             </div>
             <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No audit logs found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{log.user}</div>
                          <div className="text-xs text-slate-500">{log.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="font-medium">{log.resourceType}</span>
                          {log.resourceId && <span className="text-slate-500 ml-1">({log.resourceId})</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
