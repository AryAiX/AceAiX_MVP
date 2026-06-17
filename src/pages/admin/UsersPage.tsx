import React, { useState } from 'react';
import { Users, Search, ShieldCheck, Filter, MoreVertical, Ban, CheckCircle, Clock } from 'lucide-react';

const USERS = [
  { id: '1', name: 'Khalid Al-Rashidi', email: 'khalid@demo.com', role: 'athlete', status: 'active', joined: '2026-06-08', verified: true },
  { id: '2', name: 'Ahmed Al-Muhairi', email: 'ahmed@demo.com', role: 'scout', status: 'active', joined: '2026-06-07', verified: true },
  { id: '3', name: 'Dr. Sarah Williams', email: 'sarah@demo.com', role: 'medical_partner', status: 'active', joined: '2026-06-06', verified: true },
  { id: '4', name: 'Tariq Hassan', email: 'tariq@demo.com', role: 'athlete', status: 'active', joined: '2026-06-06', verified: false },
  { id: '5', name: 'Noura Al-Mansoori', email: 'noura@demo.com', role: 'athlete', status: 'active', joined: '2026-06-05', verified: true },
  { id: '6', name: 'Rayan Benali', email: 'rayan@demo.com', role: 'athlete', status: 'suspended', joined: '2026-06-04', verified: false },
  { id: '7', name: 'Amir Karimi', email: 'amir@demo.com', role: 'athlete', status: 'active', joined: '2026-06-03', verified: true },
  { id: '8', name: 'Yusuf Al-Kaabi', email: 'yusuf@demo.com', role: 'athlete', status: 'pending', joined: '2026-06-02', verified: false },
];

const ROLE_BADGE: Record<string, string> = {
  athlete: 'badge-blue',
  scout: 'badge-amber',
  club: 'badge-green',
  medical_partner: 'badge-green',
  admin: 'badge-rose',
};

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All');

  const filtered = USERS.filter((u) => {
    if (query && !u.name.toLowerCase().includes(query.toLowerCase()) && !u.email.toLowerCase().includes(query.toLowerCase())) return false;
    if (role !== 'All' && u.role !== role) return false;
    return true;
  });

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="section-title">User Management</h1>
        <p className="section-subtitle">Browse, search, and manage all platform users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="input-field pl-8 text-sm" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field text-sm sm:w-48">
          <option>All</option>
          <option value="athlete">Athletes</option>
          <option value="scout">Scouts</option>
          <option value="club">Clubs</option>
          <option value="medical_partner">Medical Partners</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">User</th>
              <th className="table-header hidden md:table-cell">Role</th>
              <th className="table-header hidden lg:table-cell">Joined</th>
              <th className="table-header">Status</th>
              <th className="table-header">Verified</th>
              <th className="table-header w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t border-slate-700/30 hover:bg-navy-800/50 transition-colors">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell hidden md:table-cell">
                  <span className={`badge ${ROLE_BADGE[user.role] ?? 'badge-slate'} text-xs capitalize`}>{user.role.replace('_', ' ')}</span>
                </td>
                <td className="table-cell hidden lg:table-cell text-xs text-slate-400">{user.joined}</td>
                <td className="table-cell">
                  <span className={`badge text-xs ${user.status === 'active' ? 'badge-green' : user.status === 'suspended' ? 'badge-rose' : 'badge-amber'}`}>{user.status}</span>
                </td>
                <td className="table-cell">
                  {user.verified
                    ? <ShieldCheck size={15} className="text-emerald-400" />
                    : <Clock size={15} className="text-slate-500" />}
                </td>
                <td className="table-cell">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <MoreVertical size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">{filtered.length} users shown</p>
    </div>
  );
}
