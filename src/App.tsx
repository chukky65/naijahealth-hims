/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Departments } from './pages/Departments';
import { Pharmacy } from './pages/Pharmacy';
import { Laboratory } from './pages/Laboratory';
import { Patients } from './pages/Patients';
import { Triage } from './pages/Triage';
import { Appointments } from './pages/Appointments';
import { Billing } from './pages/Billing';
import { StaffDirectory } from './pages/Staff';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { AuditLog } from './pages/AuditLog';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { PatientPortal } from './pages/PatientPortal';
import { Telemedicine } from './pages/Telemedicine';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStore } from './store/useStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Optional: Basic Route Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <ErrorBoundary><>{children}</></ErrorBoundary>;
};

const RoleRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user } = useStore();
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const DashboardRoute = () => {
  const { user } = useStore();
  if (user?.role === 'Patient') {
    return <Navigate to="/portal" replace />;
  }
  return <Dashboard />;
};

export default function App() {
  const { login, logout, setIsLoading } = useStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Fetch profile
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile }) => {
            if (profile) {
              login({
                id: profile.id,
                name: profile.name,
                role: profile.role as any,
                email: profile.email,
                notificationPreferences: profile.notification_preferences
              });
            }
          });
      } else {
        logout();
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile }) => {
            if (profile) {
              login({
                id: profile.id,
                name: profile.name,
                role: profile.role as any,
                email: profile.email,
                notificationPreferences: profile.notification_preferences
              });
            }
          });
      } else {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<DashboardRoute />} />
              <Route path="portal" element={
                <RoleRoute allowedRoles={['Patient']}>
                  <PatientPortal />
                </RoleRoute>
              } />
              <Route path="appointments" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Doctor', 'Receptionist', 'Admin']}>
                  <Appointments />
                </RoleRoute>
              } />
              <Route path="billing" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Admin', 'Receptionist']}>
                  <Billing />
                </RoleRoute>
              } />
              <Route path="staff" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Admin']}>
                  <StaffDirectory />
                </RoleRoute>
              } />
              <Route path="departments" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Admin']}>
                  <Departments />
                </RoleRoute>
              } />
              <Route path="telemedicine" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Doctor', 'Admin']}>
                  <Telemedicine />
                </RoleRoute>
              } />
              <Route path="pharmacy" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Pharmacist', 'Admin']}>
                  <Pharmacy />
                </RoleRoute>
              } />
              <Route path="laboratory" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'LabTechnician', 'Admin']}>
                  <Laboratory />
                </RoleRoute>
              } />
              <Route path="patients" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Doctor', 'Receptionist', 'Admin']}>
                  <Patients />
                </RoleRoute>
              } />
              <Route path="triage" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Doctor', 'Nurse', 'Admin']}>
                  <Triage />
                </RoleRoute>
              } />
              <Route path="analytics" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Admin']}>
                  <Analytics />
                </RoleRoute>
              } />
              <Route path="audit-log" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Admin']}>
                  <AuditLog />
                </RoleRoute>
              } />
              <Route path="settings" element={
                <RoleRoute allowedRoles={['MedicalDirector', 'Admin']}>
                  <Settings />
                </RoleRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

