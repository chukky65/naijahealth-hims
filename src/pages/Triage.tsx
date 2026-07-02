import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/core';
import { Badge } from '../components/ui/core';
import { Skeleton } from '../components/ui/Skeleton';
import { Clock, UserCircle2, Activity } from 'lucide-react';
import { usePatients } from '../lib/queries';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

type StatusType = 'Outpatient' | 'Inpatient' | 'Discharged';

const COLUMNS: { id: StatusType; title: string; color: string }[] = [
  { id: 'Outpatient', title: 'Waiting / Outpatient', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  { id: 'Inpatient', title: 'Admitted / Inpatient', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { id: 'Discharged', title: 'Discharged', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
];

import { PatientRecord } from '../types';

export const Triage = () => {
  // Fetch a larger page of patients just for the triage board demonstration
  const { data: patientData, isLoading, refetch } = usePatients(1, 100, '');
  const [patients, setPatients] = useState<PatientRecord[]>([]);

  useEffect(() => {
    if (patientData?.data) {
      setPatients(patientData.data);
    }
  }, [patientData]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a column or in the same place
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Find the moved patient
    const patientIndex = patients.findIndex(p => p.id === draggableId);
    if (patientIndex === -1) return;

    const patient = patients[patientIndex];
    const newStatus = destination.droppableId as StatusType;

    // Optimistic UI Update
    const newPatients = [...patients];
    const [movedPatient] = newPatients.splice(source.index, 1);
    movedPatient.status = newStatus;
    newPatients.splice(destination.index, 0, movedPatient);
    setPatients(newPatients);

    // Update in Supabase Database
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: newStatus })
        .eq('id', draggableId);

      if (error) throw error;
      toast.success(`Moved ${patient.name} to ${newStatus}`);
    } catch (err: any) {
      toast.error('Failed to update patient status', { description: err.message });
      refetch(); // Revert UI
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Patient Triage Board</h1>
          <p className="text-slate-500">Loading live patient flow...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-none">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
          Patient Triage Board
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Drag and drop patients to seamlessly update their clinical status in real-time.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className={`p-4 border-b dark:border-slate-800 font-semibold flex items-center justify-between ${column.color} bg-white dark:bg-transparent`}>
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {column.title}
                </span>
                <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
                  {patients.filter(p => p.status === column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 overflow-y-auto transition-colors ${
                      snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/50' : ''
                    }`}
                  >
                    {patients
                      .filter(p => p.status === column.id)
                      .map((patient, index) => (
                        // @ts-ignore - React 18 types mismatch with hello-pangea key prop
                        <Draggable key={patient.id} draggableId={patient.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                              style={{ ...provided.draggableProps.style }}
                            >
                              <Card className={`shadow-sm border-l-4 transition-all ${
                                snapshot.isDragging ? 'shadow-lg scale-105 rotate-2 z-50' : 'hover:-translate-y-1 hover:shadow-md'
                              } ${
                                patient.status === 'Outpatient' ? 'border-l-yellow-500' :
                                patient.status === 'Inpatient' ? 'border-l-blue-500' :
                                'border-l-emerald-500'
                              }`}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 font-medium text-sm">
                                      <UserCircle2 className="w-4 h-4 text-slate-400" />
                                      {patient.name}
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">{patient.id}</span>
                                  </div>
                                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                      <Clock className="w-3 h-3" />
                                      {new Date(patient.admissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-normal">
                                      {patient.department}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
