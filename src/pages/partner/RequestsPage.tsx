import React, { useState } from 'react';
import { Plus, Upload, CheckCircle, Clock, AlertCircle, ShieldCheck, FileText, X } from 'lucide-react';

const REQUEST_TYPES = ['Physical Assessment', 'Medical Clearance', 'Blood Test', 'Cardiac Screening', 'MRI / Imaging', 'Drug Test'];

export default function PartnerRequestsPage() {
  const [showNew, setShowNew] = useState(false);
  const [type, setType] = useState('');
  const [athlete, setAthlete] = useState('');

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Verification Requests</h1>
          <p className="section-subtitle">Manage athlete medical assessments and uploads</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={16} />
          New Request
        </button>
      </div>

      {showNew && (
        <div className="card border-blue-600/40">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Create Verification Request</h2>
            <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Athlete Name</label>
              <input value={athlete} onChange={(e) => setAthlete(e.target.value)} placeholder="Search athlete..." className="input-field" />
            </div>
            <div>
              <label className="label">Assessment Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
                <option value="">Select type...</option>
                {REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="label">Notes</label>
            <textarea rows={2} className="input-field resize-none" placeholder="Any specific requirements or context..." />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" disabled={!athlete || !type}>Create Request</button>
            <button onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div className="card border-dashed border-slate-600 hover:border-blue-600/50 transition-colors cursor-pointer text-center py-8">
        <Upload size={28} className="text-slate-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-white mb-1">Upload Medical Records</p>
        <p className="text-xs text-slate-500">PDF, JPG, PNG — up to 20MB per file</p>
        <button className="btn-secondary mt-4 text-sm">Browse Files</button>
      </div>

      {/* Active requests */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-400">Active Requests</p>
        {[
          { athlete: 'Khalid Al-Rashidi', type: 'Physical Assessment', requested: '2026-06-01', status: 'pending', priority: 'high' },
          { athlete: 'Yusuf Al-Kaabi', type: 'Medical Clearance', requested: '2026-05-28', status: 'in_progress', priority: 'medium' },
          { athlete: 'Sara Al-Hashemi', type: 'Blood Test', requested: '2026-05-25', status: 'in_progress', priority: 'low' },
        ].map((req) => (
          <div key={req.athlete} className="flex items-center gap-4 p-4 bg-navy-700 border border-slate-700/50 rounded-xl hover:border-blue-600/30 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${req.status === 'in_progress' ? 'bg-blue-600/15' : 'bg-amber-500/15'}`}>
              {req.status === 'in_progress' ? <Clock size={18} className="text-blue-400" /> : <AlertCircle size={18} className="text-amber-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{req.athlete}</p>
              <p className="text-xs text-slate-400">{req.type} · Requested {req.requested}</p>
            </div>
            <span className={`badge text-xs ${req.status === 'in_progress' ? 'badge-blue' : 'badge-amber'}`}>{req.status.replace('_', ' ')}</span>
            <button className="btn-primary text-xs py-1.5 px-3 ml-2">
              <Upload size={12} /> Upload
            </button>
          </div>
        ))}

        <p className="text-sm font-medium text-slate-400 mt-6">Completed</p>
        {[
          { athlete: 'Fatima Hassan', type: 'Blood Test', completed: '2026-05-20', verified: true },
          { athlete: 'Omar Al-Farsi', type: 'Cardiac Screening', completed: '2026-05-15', verified: true },
        ].map((req) => (
          <div key={req.athlete} className="flex items-center gap-4 p-4 bg-navy-700 border border-slate-700/50 rounded-xl opacity-70">
            <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{req.athlete}</p>
              <p className="text-xs text-slate-400">{req.type} · Completed {req.completed}</p>
            </div>
            {req.verified && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <ShieldCheck size={13} /> Verified
              </div>
            )}
            <span className="badge badge-green text-xs">completed</span>
          </div>
        ))}
      </div>
    </div>
  );
}
