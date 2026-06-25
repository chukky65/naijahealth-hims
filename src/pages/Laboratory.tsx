import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { FlaskConical, Search, CheckCircle, Clock, FileText, ChevronRight, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const Laboratory = () => {
  const { labOrders, labTests, patients, updateLabOrderStatus, completeLabOrder, user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [notes, setNotes] = useState('');

  const filteredOrders = labOrders
    .filter(o => o.status !== 'Completed')
    .filter(o => {
      const patient = patients.find(p => p.id === o.patientId);
      const test = labTests.find(t => t.id === o.testId);
      const searchStr = `${patient?.name} ${test?.name}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleStartTest = async (id: string) => {
    try {
      await updateLabOrderStatus(id, 'In Progress');
      toast.success('Test started');
    } catch (error) {
      toast.error('Failed to start test');
    }
  };

  const handleCompleteTest = async () => {
    if (!selectedOrder || !resultValue) return;
    try {
      await completeLabOrder(selectedOrder, resultValue, notes);
      toast.success('Results uploaded and patient billed successfully');
      setSelectedOrder(null);
      setResultValue('');
      setNotes('');
    } catch (error) {
      toast.error('Failed to complete test');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laboratory & Radiology</h1>
          <p className="text-slate-500">Manage pending tests, upload results, and track turnaround times.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Pending Orders</p>
                <h3 className="text-2xl font-bold mt-1 text-amber-500">{labOrders.filter(o => o.status === 'Pending').length}</h3>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">In Progress</p>
                <h3 className="text-2xl font-bold mt-1 text-sky-500">{labOrders.filter(o => o.status === 'In Progress').length}</h3>
              </div>
              <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Completed Today</p>
                <h3 className="text-2xl font-bold mt-1 text-green-500">
                  {labOrders.filter(o => o.status === 'Completed' && new Date(o.completedAt!).toDateString() === new Date().toDateString()).length}
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <FlaskConical className="w-5 h-5 text-indigo-500" /> Active Test Queue
              </CardTitle>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search patients or tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </CardHeader>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
              {filteredOrders.length > 0 ? filteredOrders.map(order => {
                const patient = patients.find(p => p.id === order.patientId);
                const test = labTests.find(t => t.id === order.testId);
                const isSelected = selectedOrder === order.id;

                return (
                  <div 
                    key={order.id} 
                    className={`p-4 transition-colors cursor-pointer border-l-4 ${
                      isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' 
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => {
                      if (order.status === 'In Progress') {
                        setSelectedOrder(order.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {test?.name || 'Unknown Test'}
                          <Badge variant={order.status === 'In Progress' ? 'info' : 'warning'}>{order.status}</Badge>
                        </h4>
                        <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                          <p>Patient: <span className="font-medium text-slate-800 dark:text-slate-200">{patient?.name}</span></p>
                          <p>Doctor: <span className="font-medium text-slate-800 dark:text-slate-200">{order.doctorName}</span></p>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Ordered {format(new Date(order.date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div className="text-right">
                        {order.status === 'Pending' ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStartTest(order.id); }}
                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                          >
                            Start Test
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-indigo-600 font-medium text-sm">
                            Enter Results <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <div className="p-8 text-center text-slate-500">
                  No pending tests found.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          {selectedOrder ? (
            <Card className="sticky top-6 border-indigo-200 dark:border-indigo-900 shadow-md">
              <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30">
                <CardTitle className="text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Primary Result / Value</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Positive, 14 g/dL" 
                    value={resultValue}
                    onChange={e => setResultValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Detailed Notes (Optional)</label>
                  <textarea 
                    rows={6}
                    placeholder="Enter any additional clinical findings..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>
                <button 
                  onClick={handleCompleteTest}
                  disabled={!resultValue}
                  className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Save & Finalize
                </button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-2">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center text-slate-400">
                <FlaskConical className="w-12 h-12 mb-4 opacity-50" />
                <p>Select an "In Progress" test from the queue to upload results.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
