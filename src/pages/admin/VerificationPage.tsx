import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, X, FileText, Clock } from 'lucide-react';

const QUEUE = [
  {
    id: '1', name: 'Al Nasr Football Club', type: 'Club', submitted: '2026-06-05', docs: 3, status: 'pending',
    contact: 'Mohammed Al-Rashidi', email: 'admin@alnasr.ae',
    documents: ['Trade License', 'Board Resolution', 'Club Charter'],
  },
  {
    id: '2', name: 'Dubai Sports Medicine', type: 'Medical Partner', submitted: '2026-06-04', docs: 5, status: 'pending',
    contact: 'Dr. Sarah Williams', email: 'sarah@dubaismed.ae',
    documents: ['Medical License', 'Facility Certification', 'ISO Certificate', 'Staff Credentials', 'Insurance Policy'],
  },
  {
    id: '3', name: 'UAE Football Federation', type: 'Federation', submitted: '2026-06-03', docs: 7, status: 'in_review',
    contact: 'Khalil Hassan', email: 'khalil@uaeff.ae',
    documents: ['FIFA Affiliation', 'Articles of Association', 'Board Members', 'Financial Audit', 'Stadium Docs', 'Insurance', 'Registration'],
  },
];

export default function AdminVerificationPage() {
  const [selected, setSelected] = useState<typeof QUEUE[0] | null>(null);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="section-title">Verification Queue</h1>
        <p className="section-subtitle">Review and approve organizations and medical partners</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue */}
        <div className="space-y-3">
          {QUEUE.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
              className={`card cursor-pointer transition-all ${selected?.id === item.id ? 'border-blue-600/50 bg-blue-600/5' : 'hover:border-slate-600'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.status === 'in_review' ? 'bg-blue-600/15' : 'bg-amber-500/15'}`}>
                  {item.status === 'in_review' ? <Clock size={18} className="text-blue-400" /> : <AlertCircle size={18} className="text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <span className={`badge text-xs flex-shrink-0 ${item.status === 'in_review' ? 'badge-blue' : 'badge-amber'}`}>{item.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.type} · {item.docs} documents · {item.submitted}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.contact} · {item.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-white">{selected.name}</h2>
                <p className="text-xs text-slate-400">{selected.type} · Submitted {selected.submitted}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Submitted Documents</p>
              <div className="space-y-2">
                {selected.documents.map((doc) => (
                  <div key={doc} className="flex items-center gap-3 p-3 bg-navy-800 rounded-lg">
                    <FileText size={14} className="text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-300 flex-1">{doc}</p>
                    <button className="text-blue-400 text-xs hover:underline">View</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="label">Review Notes</label>
              <textarea rows={3} className="input-field resize-none text-sm" placeholder="Add notes for this verification..." />
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex-1 justify-center">
                <CheckCircle size={15} /> Approve
              </button>
              <button className="flex-1 py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-sm font-semibold text-rose-400 transition-all flex items-center justify-center gap-2">
                <X size={15} /> Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="card flex items-center justify-center text-center h-64">
            <div>
              <ShieldCheck size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Select an item to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
