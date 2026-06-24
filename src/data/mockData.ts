import { DepartmentStats, NigerianContextStatus, SystemAlert } from '../types';

export const mockNigerianContext: NigerianContextStatus = {
  powerStatus: 'Grid',
  generatorFuelLevel: 85,
  internetStatus: 'Stable',
  waterSupply: 'Adequate',
};

export const mockDepartments: DepartmentStats[] = [
  { name: 'Emergency', patientVolume: 45, averageWaitTime: 12, bedOccupancy: 95, staffAvailability: 80, revenue: 1250000 },
  { name: 'Outpatient', patientVolume: 120, averageWaitTime: 45, bedOccupancy: 0, staffAvailability: 90, revenue: 3400000 },
  { name: 'Pediatrics', patientVolume: 35, averageWaitTime: 25, bedOccupancy: 85, staffAvailability: 75, revenue: 850000 },
  { name: 'Surgery', patientVolume: 15, averageWaitTime: 0, bedOccupancy: 90, staffAvailability: 100, revenue: 5600000 },
  { name: 'Maternity', patientVolume: 28, averageWaitTime: 15, bedOccupancy: 80, staffAvailability: 85, revenue: 2100000 },
  { name: 'Dental', patientVolume: 22, averageWaitTime: 30, bedOccupancy: 0, staffAvailability: 100, revenue: 950000 },
];

export const mockSystemAlerts: SystemAlert[] = [
  {
    id: '1',
    type: 'Prediction',
    title: 'Surge in Malaria Cases Expected',
    description: 'Based on recent weather patterns (heavy rainfall) and historical data, expect a 40% increase in outpatient malaria cases over the next 10 days.',
    department: 'Outpatient / Pharmacy',
    confidence: 89,
  },
  {
    id: '2',
    type: 'Alert',
    title: 'Critical Stock: Artemether-Lumefantrine',
    description: 'Current dispensing rate exceeds resupply schedule. Stockout likely in 4 days if the upcoming surge materializes.',
    department: 'Pharmacy',
    confidence: 95,
  },
  {
    id: '3',
    type: 'Opportunity',
    title: 'Optimize Nursing Shifts',
    description: 'Pediatrics ward shows lower activity between 2 AM and 6 AM. Reallocating one nurse to Emergency during these hours will reduce wait times by 15%.',
    department: 'Human Resources',
    confidence: 78,
  },
  {
    id: '4',
    type: 'Risk',
    title: 'Generator Maintenance Overdue',
    description: 'Backup Generator B has exceeded 500 runtime hours without routine servicing. Risk of failure during next grid outage is high.',
    department: 'Facilities',
    confidence: 92,
  }
];
