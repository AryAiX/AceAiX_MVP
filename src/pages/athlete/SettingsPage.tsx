import React, { useState } from 'react';
import { User, Bell, Shield, CreditCard, Smartphone, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  ] as const;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-900 p-1 rounded-xl border border-slate-700/50">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-navy-700 text-white shadow-card' : 'text-slate-400 hover:text-white'}`}
          >
            {t.icon} <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card space-y-5">
          <h2 className="text-base font-semibold text-white">Profile Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input defaultValue={profile?.full_name ?? ''} className="input-field" />
            </div>
            <div>
              <label className="label">Email</label>
              <input defaultValue={profile?.email ?? ''} className="input-field" type="email" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input placeholder="+971 50 000 0000" className="input-field" />
            </div>
            <div>
              <label className="label">City</label>
              <input defaultValue={profile?.city ?? ''} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea rows={3} defaultValue={profile?.bio ?? ''} className="input-field resize-none" placeholder="Tell scouts about yourself..." />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary">
              <Save size={15} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card space-y-4">
          <h2 className="text-base font-semibold text-white">Notification Preferences</h2>
          {[
            { label: 'Scout views your profile', desc: 'Get notified when a recruiter visits your profile', defaultOn: true },
            { label: 'New contact request', desc: 'Receive alerts for incoming scout messages', defaultOn: true },
            { label: 'AI score updated', desc: 'When your AI performance score changes significantly', defaultOn: true },
            { label: 'Medical record verified', desc: 'Confirmation when a partner verifies your records', defaultOn: true },
            { label: 'New opportunities', desc: 'Trials, contracts, and scholarships matching your profile', defaultOn: false },
            { label: 'Weekly digest', desc: 'A summary of your profile activity each week', defaultOn: false },
          ].map((item) => (
            <NotifRow key={item.label} {...item} />
          ))}
        </div>
      )}

      {tab === 'privacy' && (
        <div className="card space-y-4">
          <h2 className="text-base font-semibold text-white">Privacy Controls</h2>
          {[
            { label: 'Show profile in public discovery', desc: 'Allow your profile to appear in the public Discover page', defaultOn: true },
            { label: 'Show AI score publicly', desc: 'Display your AI performance score on your public profile', defaultOn: true },
            { label: 'Allow contact from verified scouts', desc: 'Let verified platform scouts send you messages', defaultOn: true },
            { label: 'Show medical clearance status', desc: 'Display your verified clearance badge on your profile', defaultOn: false },
            { label: 'Show club affiliation', desc: 'Display your current club on your public profile', defaultOn: true },
          ].map((item) => (
            <NotifRow key={item.label} {...item} />
          ))}
        </div>
      )}

      {tab === 'security' && (
        <div className="card space-y-5">
          <h2 className="text-base font-semibold text-white">Security</h2>
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter current password" className="input-field pr-10" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" placeholder="Minimum 8 characters" className="input-field" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" placeholder="Confirm new password" className="input-field" />
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} className="btn-primary">
              <Shield size={15} />
              Update Password
            </button>
          </div>
          <div className="border-t border-slate-700/50 pt-5">
            <h3 className="text-sm font-semibold text-white mb-3">Danger Zone</h3>
            <button className="text-rose-400 text-sm hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/60 px-4 py-2 rounded-lg transition-all">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotifRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <div
        onClick={() => setOn(!on)}
        className={`w-10 h-6 rounded-full cursor-pointer transition-colors flex items-center px-0.5 flex-shrink-0 ml-4 ${on ? 'bg-blue-600' : 'bg-slate-700'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${on ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}
