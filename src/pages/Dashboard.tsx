import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { mockDepartments, mockSystemAlerts } from '../data/mockData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, BedDouble, AlertTriangle, Calendar, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Skeleton } from '../components/ui/Skeleton';
import { QuickActions } from '../components/QuickActions';
import { RegistrationApproval } from '../components/RegistrationApproval';
import { useTranslation } from 'react-i18next';

export const Dashboard = () => {
  const [dateRange, setDateRange] = useState('Today');
  const { isLoading, setIsLoading, user } = useStore();
  const { t } = useTranslation();
  
  // Simulate network fetch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [setIsLoading]);
  
  const totalPatients = mockDepartments.reduce((acc, dep) => acc + dep.patientVolume, 0);
  const avgWaitTime = Math.round(mockDepartments.reduce((acc, dep) => acc + dep.averageWaitTime, 0) / mockDepartments.length);
  const avgBedOccupancy = Math.round(mockDepartments.reduce((acc, dep) => acc + dep.bedOccupancy, 0) / mockDepartments.filter(d => d.bedOccupancy > 0).length);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><Skeleton className="h-96 w-full" /></div>
          <div><Skeleton className="h-96 w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-slate-500">{t('dashboard.subtitle')}</p>
        </div>
        
        {/* Date Range Selector Mockup */}
        <div className="relative shrink-0">
          <label htmlFor="dateRange" className="sr-only">Date Range</label>
          <div className="flex items-center relative">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Custom Range...">Custom Range...</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('dashboard.totalPatients')}</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totalPatients}</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center font-medium">↑ 12% <span className="text-slate-400 dark:text-slate-500 ml-1">vs yesterday</span></p>
            </div>
            <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('dashboard.avgWaitTime')}</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{avgWaitTime} <span className="text-sm text-slate-400">min</span></h3>
              <p className="text-xs text-green-600 mt-1 flex items-center font-medium">-5m improvement</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('dashboard.bedOccupancy')}</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{avgBedOccupancy}%</h3>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 absolute bottom-0 left-0">
                <div className="bg-sky-500 h-full rounded-r-full" style={{ width: `${avgBedOccupancy}%` }}></div>
              </div>
            </div>
            <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400">
              <BedDouble className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('dashboard.criticalAlerts')}</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{mockSystemAlerts.filter(i => i.type === 'Alert' || i.type === 'Risk').length}</h3>
              <p className="text-xs text-red-600 mt-1 flex items-center font-medium">{t('dashboard.requiresImmediate')}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {user?.role === 'Admin' && (
            <RegistrationApproval />
          )}

          {user?.role === 'MedicalDirector' || user?.role === 'Admin' ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.depPatientVol')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockDepartments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="patientVolume" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center text-slate-500 py-12">
               <Activity className="w-12 h-12 mb-4 text-slate-300" />
               <p>{t('dashboard.restricted')}</p>
            </Card>
          )}
        </div>

        {/* AI Insights List */}
        <div className="space-y-6">
          {(user?.role === 'MedicalDirector' || user?.role === 'Admin') ? (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>System Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockSystemAlerts.map(insight => (
                    <div key={insight.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          insight.type === 'Risk' || insight.type === 'Alert' ? 'danger' : 
                          insight.type === 'Prediction' ? 'warning' : 'success'
                        }>
                          {insight.type}
                        </Badge>
                        <span className="text-xs font-mono text-slate-500">{insight.confidence}% Conf.</span>
                      </div>
                      <h4 className="text-sm font-semibold mb-1">{insight.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{insight.description}</p>
                      <div className="mt-3 text-xs text-slate-400 font-medium">Department: {insight.department}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
             <Card className="h-full flex flex-col justify-center items-center text-slate-500 py-12">
               <Activity className="w-12 h-12 mb-4 text-slate-300" />
               <p>AI Insights are restricted to administrators.</p>
             </Card>
          )}
        </div>
      </div>
      
      <QuickActions />
    </div>
  );
};
