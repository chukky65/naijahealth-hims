import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { mockAIInsights } from '../data/mockData';
import { BrainCircuit, Sparkles, TrendingUp, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Skeleton } from '../components/ui/Skeleton';

export const Analytics = () => {
  const { isLoading, setIsLoading } = useStore();

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Insights & Predictive Analytics</h1>
          <p className="text-slate-500">Machine learning models forecasting admission rates, drug demands, and system risks.</p>
        </div>
        <Badge variant="success" className="px-3 py-1.5 text-sm"><Sparkles className="w-4 h-4 mr-2"/> Antigravity Engine Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAIInsights.map(insight => (
          <Card key={insight.id} className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {insight.type === 'Alert' || insight.type === 'Risk' ? (
                <ShieldAlert className="w-24 h-24 text-red-500" />
              ) : insight.type === 'Prediction' ? (
                <TrendingUp className="w-24 h-24 text-amber-500" />
              ) : (
                <BrainCircuit className="w-24 h-24 text-green-500" />
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <Badge variant={
                  insight.type === 'Risk' || insight.type === 'Alert' ? 'danger' : 
                  insight.type === 'Prediction' ? 'warning' : 'success'
                }>
                  {insight.type}
                </Badge>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold">{insight.confidence}%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Confidence</span>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{insight.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-mono text-slate-500">Target: {insight.department}</span>
                  <button className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline">
                    View Mitigation Plan â
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Forecasted Malaria vs Output over 4 Weeks</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="h-64 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50">
             [Interactive D3/Recharts Visualization Target - ML Output Simulation]
           </div>
        </CardContent>
      </Card>
    </div>
  );
};
