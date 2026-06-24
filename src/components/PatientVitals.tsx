import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';

interface PatientVitalsProps {
  patientId: string;
}

export const PatientVitals: React.FC<PatientVitalsProps> = ({ patientId }) => {
  // Generate deterministic mock data based on patientId
  const data = useMemo(() => {
    const seed = patientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const result = [];
    const now = new Date();
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      
      // Basic deterministic variation
      const sysVariation = Math.sin(seed + i) * 15;
      const diaVariation = Math.cos(seed + i) * 10;
      const hrVariation = Math.sin(seed * i) * 12;

      result.push({
        date: format(date, 'MMM dd'),
        systolic: Math.round(120 + sysVariation),
        diastolic: Math.round(80 + diaVariation),
        heartRate: Math.round(75 + hrVariation),
      });
    }
    return result;
  }, [patientId]);

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--tw-colors-white, #ffffff)', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            dataKey="systolic" 
            name="Systolic BP"
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="diastolic" 
            name="Diastolic BP"
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="heartRate" 
            name="Heart Rate (BPM)"
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
