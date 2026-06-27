import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/core';
import { Save, User, Building, Shield, Bell, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateProfile, hospitalSettings, updateHospitalSettings, updatePassword, updateNotificationPreferences } = useStore();
  
  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Hospital Settings State
  const [hospitalForm, setHospitalForm] = useState({
    name: '', address: '', phone: '', email: '', currency: ''
  });
  const [isSavingHospital, setIsSavingHospital] = useState(false);

  // Security State
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Notifications State
  const [notifPrefs, setNotifPrefs] = useState({
    emailNewAppointments: true,
    emailLowStock: true,
    emailDailySummary: false
  });
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  useEffect(() => {
    if (user && user.name) {
      const parts = user.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (user && user.notificationPreferences) {
      setNotifPrefs({
        emailNewAppointments: user.notificationPreferences.emailNewAppointments ?? true,
        emailLowStock: user.notificationPreferences.emailLowStock ?? true,
        emailDailySummary: user.notificationPreferences.emailDailySummary ?? false,
      });
    }
  }, [user]);

  useEffect(() => {
    if (hospitalSettings) {
      setHospitalForm({
        name: hospitalSettings.name || '',
        address: hospitalSettings.address || '',
        phone: hospitalSettings.phone || '',
        email: hospitalSettings.email || '',
        currency: hospitalSettings.currency || '₦'
      });
    }
  }, [hospitalSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const res = await updateProfile(fullName);
    setIsSaving(false);
    
    if (res.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error('Failed to update profile', { description: res.error });
    }
  };

  const getInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSaveHospital = async () => {
    setIsSavingHospital(true);
    const res = await updateHospitalSettings(hospitalForm);
    setIsSavingHospital(false);
    
    if (res.success) {
      toast.success('Hospital settings updated successfully');
    } else {
      toast.error('Failed to update hospital settings', { description: res.error });
    }
  };

  const handleSaveSecurity = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSavingSecurity(true);
    const res = await updatePassword(passwordForm.newPassword);
    setIsSavingSecurity(false);
    if (res.success) {
      toast.success('Password updated successfully');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } else {
      toast.error('Failed to update password', { description: res.error });
    }
  };

  const handleSaveNotifs = async () => {
    setIsSavingNotifs(true);
    const res = await updateNotificationPreferences(notifPrefs);
    setIsSavingNotifs(false);
    if (res.success) {
      toast.success('Notification preferences updated');
    } else {
      toast.error('Failed to update notifications', { description: res.error });
    }
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
                    {getInitials()}
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
                    <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lastName" className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
                    <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="emailAddress" className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                  <input id="emailAddress" type="email" disabled value={user?.email || ''} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-500 cursor-not-allowed" />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="role" className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                  <input id="role" type="text" disabled value={user?.role || ''} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-500 cursor-not-allowed" />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                  <button onClick={handleSave} disabled={isSaving || !firstName} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 flex items-center gap-2 disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    Save Changes
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'hospital' && (
            <Card>
              <CardHeader>
                <CardTitle>Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Hospital Name</label>
                  <input 
                    type="text" 
                    value={hospitalForm.name} 
                    onChange={e => setHospitalForm({...hospitalForm, name: e.target.value})} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                  <input 
                    type="text" 
                    value={hospitalForm.address} 
                    onChange={e => setHospitalForm({...hospitalForm, address: e.target.value})} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                    <input 
                      type="text" 
                      value={hospitalForm.phone} 
                      onChange={e => setHospitalForm({...hospitalForm, phone: e.target.value})} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      value={hospitalForm.email} 
                      onChange={e => setHospitalForm({...hospitalForm, email: e.target.value})} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                    />
                  </div>
                </div>
                <div className="space-y-1 w-1/2 pr-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Default Currency Symbol</label>
                  <input 
                    type="text" 
                    value={hospitalForm.currency} 
                    onChange={e => setHospitalForm({...hospitalForm, currency: e.target.value})} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                  <button onClick={handleSaveHospital} disabled={isSavingHospital || !hospitalForm.name} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 flex items-center gap-2 disabled:opacity-50">
                    {isSavingHospital ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    Save Configuration
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security & Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-800 border-b border-slate-100 pb-2">Change Password</h3>
                  <div className="space-y-3 max-w-md">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">New Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.newPassword} 
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Confirm Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.confirmPassword} 
                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-medium text-slate-800 border-b border-slate-100 pb-2">Multi-Factor Authentication (MFA)</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Require MFA for this account</p>
                      <p className="text-xs text-slate-500 mt-1">Adds an extra layer of security using a TOTP authenticator app.</p>
                    </div>
                    <div className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Enterprise Feature
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                  <button onClick={handleSaveSecurity} disabled={isSavingSecurity || !passwordForm.newPassword} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 flex items-center gap-2 disabled:opacity-50">
                    {isSavingSecurity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} 
                    Update Security
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-700">New Appointment Alerts</p>
                      <p className="text-xs text-slate-500 mt-1">Receive an email when a new appointment is booked.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifPrefs.emailNewAppointments} onChange={e => setNotifPrefs({...notifPrefs, emailNewAppointments: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Low Stock Warnings</p>
                      <p className="text-xs text-slate-500 mt-1">Receive an email when pharmacy inventory drops below reorder levels.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifPrefs.emailLowStock} onChange={e => setNotifPrefs({...notifPrefs, emailLowStock: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Daily Summary Reports</p>
                      <p className="text-xs text-slate-500 mt-1">Receive a daily digest of hospital activities and revenue.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifPrefs.emailDailySummary} onChange={e => setNotifPrefs({...notifPrefs, emailDailySummary: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={handleSaveNotifs} disabled={isSavingNotifs} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 flex items-center gap-2 disabled:opacity-50">
                    {isSavingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    Save Preferences
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab !== 'profile' && activeTab !== 'hospital' && activeTab !== 'security' && activeTab !== 'notifications' && (
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
