import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { mockSystemAlerts, mockRevenueData, mockPharmacyData, mockWaitTimeData, mockDepartments } from '../data/mockData';
import { BrainCircuit, TrendingUp, ShieldAlert, Activity, DollarSign, Users, Clock, Pill } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Skeleton } from '../components/ui/Skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Analytics = () => {
  const { isLoading, setIsLoading, theme } = useStore();

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [setIsLoading]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
            System Analytics
          </h1>
          <p className="text-slate-500 mt-1">Real-time hospital performance and predictive insights.</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 flex items-center gap-2 text-sm bg-white dark:bg-slate-900 shadow-sm">
          <Activity className="w-4 h-4 text-emerald-500" />
          Live Data Stream Active
        </Badge>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Health Area Chart */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Financial Health (YTD)
              </CardTitle>
              <p className="text-xs text-slate-500">Revenue vs Operating Expenses</p>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${(val / 1000000).toFixed(1)}M`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', borderRadius: '8px' }}
                  itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                  formatter={(value: number) => `₦${(value / 1000000).toFixed(2)}M`}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patient Volume Bar Chart */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Department Admissions
              </CardTitle>
              <p className="text-xs text-slate-500">Current Patient Volume by Department</p>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDepartments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="patientVolume" name="Patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pharmacy Dispensation Pie Chart */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-500" />
                Pharmacy Dispensation
              </CardTitle>
              <p className="text-xs text-slate-500">Medication volume by category (Last 30 Days)</p>
            </div>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPharmacyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockPharmacyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">100%</span>
              <span className="text-xs text-slate-500">Total Supply</span>
            </div>
          </CardContent>
        </Card>

        {/* Wait Times Line Chart */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Average Wait Times
              </CardTitle>
              <p className="text-xs text-slate-500">Trailing 7-day average across all departments</p>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockWaitTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="day" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}m`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value} mins`, 'Wait Time']}
                />
                <Line type="monotone" dataKey="waitTime" name="Wait Time (mins)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: theme === 'dark' ? '#0f172a' : '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-indigo-500" />
          AI Predictive Alerts
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockSystemAlerts.map(insight => (
            <div key={insight.id} className="relative overflow-hidden group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {insight.type === 'Alert' || insight.type === 'Risk' ? (
                  <ShieldAlert className="w-32 h-32 text-red-500" />
                ) : insight.type === 'Prediction' ? (
                  <TrendingUp className="w-32 h-32 text-amber-500" />
                ) : (
                  <BrainCircuit className="w-32 h-32 text-green-500" />
                )}
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={
                    insight.type === 'Risk' || insight.type === 'Alert' ? 'danger' : 
                    insight.type === 'Prediction' ? 'warning' : 'success'
                  }>
                    {insight.type}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {insight.confidence}% Confidence
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{insight.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
                  <span className="text-xs font-mono text-slate-400">{insight.department}</span>
                  <button className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
                    Action Plan &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

