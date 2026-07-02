import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { mockDepartments } from '../data/mockData';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Download, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';

export const Departments = () => {
  const { isLoading, setIsLoading } = useStore();
  const [sortConfig, setSortConfig] = useState<{ key: keyof typeof mockDepartments[0]; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [setIsLoading]);

  const handleSort = (key: keyof typeof mockDepartments[0]) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedDepartments = useMemo(() => {
    let result = [...mockDepartments];
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [sortConfig]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedDepartments.slice(start, start + itemsPerPage);
  }, [sortedDepartments, currentPage]);

  const totalPages = Math.ceil(sortedDepartments.length / itemsPerPage);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Departmental Performance Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Department', 'Volume', 'Wait Time (m)', 'Bed Occ. (%)', 'Staff Avail. (%)', 'Revenue']],
      body: sortedDepartments.map(d => [
        d.name, d.patientVolume, d.averageWaitTime, d.bedOccupancy, d.staffAvailability, d.revenue
      ]),
    });
    doc.save('department-report.pdf');
    toast.success('Report exported as PDF');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="p-4">
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departmental Comparison</h1>
          <p className="text-slate-500">Analyze operational efficiency and bottlenecks across units.</p>
        </div>
        <button 
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockDepartments}>
                  <PolarGrid stroke="#334155" opacity={0.2}/>
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }}/>
                  <Radar name="Staff Availability" dataKey="staffAvailability" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                  <Radar name="Bed Occupancy" dataKey="bedOccupancy" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wait Time Analysis (Mins)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...mockDepartments].sort((a,b) => b.averageWaitTime - a.averageWaitTime).map(dept => (
                <div key={dept.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-slate-500">{dept.averageWaitTime}m</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${dept.averageWaitTime > 60 ? 'bg-red-500' : dept.averageWaitTime > 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min((dept.averageWaitTime / 150) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              Smart Ward Occupancy Heatmap
            </CardTitle>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500"></div> Available</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500"></div> Assigned</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500"></div> Critical/Maintenance</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockDepartments.filter(d => d.name !== 'Outpatient' && d.name !== 'Dental').map(dept => {
              // Simulate bed layout based on occupancy percentage
              const totalBeds = dept.name === 'Emergency' ? 24 : dept.name === 'Surgery' ? 16 : 30;
              const occupied = Math.round((dept.bedOccupancy / 100) * totalBeds);
              const maintenance = dept.name === 'Emergency' ? 2 : 0;
              
              const beds = Array.from({ length: totalBeds }).map((_, i) => {
                if (i < maintenance) return 'maintenance';
                if (i < occupied + maintenance) return 'occupied';
                return 'available';
              });

              return (
                <div key={dept.name} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{dept.name} Ward</span>
                    <Badge variant={dept.bedOccupancy > 90 ? 'danger' : dept.bedOccupancy > 75 ? 'warning' : 'success'}>
                      {dept.bedOccupancy}% Full
                    </Badge>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {beds.map((status, i) => (
                      <div 
                        key={i} 
                        className={`
                          aspect-square rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-all hover:scale-110 cursor-pointer
                          ${status === 'maintenance' ? 'bg-red-500' : status === 'occupied' ? 'bg-amber-500' : 'bg-emerald-500'}
                        `}
                        title={`Bed ${i + 1} - ${status}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Department Metrics</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="p-0">
                  <button onClick={() => handleSort('name')} aria-label="Sort by Department" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Department <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('patientVolume')} aria-label="Sort by Patient Volume" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Patient Volume <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('averageWaitTime')} aria-label="Sort by Wait Time" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Wait Time <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('bedOccupancy')} aria-label="Sort by Bed Occupancy" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Bed Occupancy <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('staffAvailability')} aria-label="Sort by Staff Availability" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Staff Avail. <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('revenue')} aria-label="Sort by Revenue" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-end gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-right uppercase">
                    <ArrowUpDown className="w-3 h-3" /> Daily Revenue (₦)
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((dept, idx) => (
                <tr key={dept.name} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{dept.name}</td>
                  <td className="px-6 py-4">{dept.patientVolume}</td>
                  <td className="px-6 py-4">
                    <Badge variant={dept.averageWaitTime > 60 ? 'danger' : 'success'}>
                      {dept.averageWaitTime}m
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{dept.bedOccupancy}%</td>
                  <td className="px-6 py-4">{dept.staffAvailability}%</td>
                  <td className="px-6 py-4 text-right font-mono text-sky-600 dark:text-sky-400">
                    {dept.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedDepartments.length)} of {sortedDepartments.length} departments
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
    </div>
  );
};