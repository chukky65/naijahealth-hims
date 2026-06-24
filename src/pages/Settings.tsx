import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/core';
import { Save, User, Building, Shield, Bell, Key } from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-slate-500">Manage your profile, hospital configuration, and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-1 shrink-0">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'hospital', label: 'Hospital Details', icon: Building },
            { id: 'security', label: 'Security & MFA', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'api', label: 'API Keys (NHIA)', icon: Key },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 py-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-500">
                    MA
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="text-xs font-semibold text-slate-500 uppercase">First Name</label>
                    <input id="firstName" type="text" defaultValue="Musa" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lastName" className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
                    <input id="lastName" type="text" defaultValue="Adebayo" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="emailAddress" className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                  <input id="emailAddress" type="email" defaultValue="dr.adebayo@nhims.ng" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="role" className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                  <input id="role" type="text" disabled defaultValue="Chief Medical Director" className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-500 cursor-not-allowed" />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab !== 'profile' && (
            <Card>
              <CardContent className="h-64 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-medium text-slate-600 dark:text-slate-300">Configuration panel under construction</p>
                <p className="text-sm mt-1 text-center max-w-md">The {activeTab} settings modules are scheduled for the next deployment phase.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
