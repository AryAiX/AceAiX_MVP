import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Hash, FileText, ChevronRight, Clock } from 'lucide-react';

const ATHLETES = [
  { id: 'a1', name: 'Khalid Al-Rashidi', pos: 'ST',  age: 21, nat: 'UAE',    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80', records: 3, lastUpdated: '17 Jun 2026', clearance: 'cleared' },
  { id: 'a2', name: 'Yusuf Al-Kaabi',    pos: 'LB',  age: 20, nat: 'UAE',    avatar: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=80', records: 1, lastUpdated: '16 Jun 2026', clearance: 'pending' },
  { id: 'a3', name: 'Omar Al-Farsi',      pos: 'CAM', age: 24, nat: 'UAE',    avatar: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=80',  records: 5, lastUpdated: '15 Jun 2026', clearance: 'cleared' },
  { id: 'a4', name: 'Sara Al-Hashemi',    pos: 'CM',  age: 22, nat: 'UAE',    avatar: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=80', records: 2, lastUpdated: '14 Jun 2026', clearance: 'restricted' },
  { id: 'a5', name: 'James Crawford',     pos: 'CB',  age: 30, nat: 'ENG',    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=80',  records: 4, lastUpdated: '13 Jun 2026', clearance: 'cleared' },
  { id: 'a6', name: 'Fabrizio Moretti',   pos: 'CM',  age: 27, nat: 'ITA',    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=80', records: 2, lastUpdated: '12 Jun 2026', clearance: 'not_cleared' },
];

const ATHLETE_RECORDS: Record<string, Array<{ id: string; type: string; date: string; version: string; hash: string; author: string; result: string }>> = {
  a1: [
    { id: 'rec1', type: 'Physical Assessment', date: '17 Jun 2026', version: 'v2', hash: '0x4f7e…b2a1', author: 'Dr. Aisha Rahman', result: 'All parameters within normal range' },
    { id: 'rec2', type: 'Cardiac Screening',   date: '10 Jun 2026', version: 'v1', hash: '0x9c3a…f811', author: 'Dr. Aisha Rahman', result: 'No abnormalities detected' },
    { id: 'rec3', type: 'Blood / Lab',          date: '01 Jun 2026', version: 'v1', hash: '0x2d8b…c540', author: 'Dr. Tariq Zayed',   result: 'Haemoglobin 15.2 g/dL — within range' },
  ],
};

const CLEARANCE_COLOR: Record<string, { color: string; label: string }> = {
  cleared:     { color: '#1FB57A', label: 'Cleared'      },
  pending:     { color: '#F5A623', label: 'Pending'       },
  restricted:  { color: '#F5A623', label: 'Restricted'    },
  not_cleared: { color: '#EF5350', label: 'Not Cleared'   },
};

export default function PartnerAthletesPage() {
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<string | null>('a1');

  const filtered = ATHLETES.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const athlete = ATHLETES.find(a => a.id === selected);
  const records = selected ? (ATHLETE_RECORDS[selected] ?? []) : [];

  return (
    <div className="max-w-5xl space-y-5 pb-10">
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
        <h1 className="text-xl font-black text-white">Athlete Records</h1>
        <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>{ATHLETES.length} athletes with records · All records are append-only & provenance-anchored</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Athlete list */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7C8DA6' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search athlete..."
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
            {filtered.map((a, i) => {
              const cl = CLEARANCE_COLOR[a.clearance];
              const isActive = selected === a.id;
              return (
                <button key={a.id} onClick={() => setSelected(a.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isActive ? 'rgba(31,181,122,0.07)' : 'transparent',
                    borderLeft: isActive ? '2px solid #1FB57A' : '2px solid transparent',
                    animation: `fadeSlideUp 0.3s ease ${i * 0.04}s both`,
                  }}>
                  <div className="relative flex-shrink-0">
                    <img src={a.avatar} alt={a.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: cl.color, borderColor: '#0D1C2E' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{a.name}</p>
                    <p className="text-[10px]" style={{ color: '#7C8DA6' }}>{a.pos} · {a.nat} · {a.records} records</p>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${cl.color}15`, color: cl.color, border: `1px solid ${cl.color}25` }}>
                    {cl.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Record detail */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)' }}>
          {!athlete ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm" style={{ color: '#7C8DA6' }}>Select an athlete to view records</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={athlete.avatar} alt={athlete.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <p className="text-sm font-bold text-white">{athlete.name}</p>
                  <p className="text-[10px]" style={{ color: '#7C8DA6' }}>Last updated {athlete.lastUpdated} · {records.length} records</p>
                </div>
                <Link to={`/partner/inbox/r1`}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'rgba(31,181,122,0.1)', border: '1px solid rgba(31,181,122,0.25)', color: '#1FB57A' }}>
                  + New Record
                </Link>
              </div>

              <div className="p-4 space-y-2.5">
                {records.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm" style={{ color: '#7C8DA6' }}>No records yet.</p>
                  </div>
                ) : records.map((rec, i) => (
                  <div key={rec.id}
                    className="rounded-xl p-4 transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', animation: `fadeSlideUp 0.3s ease ${i * 0.06}s both` }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={13} style={{ color: '#2F80ED', flexShrink: 0 }} />
                        <p className="text-xs font-bold text-white">{rec.type}</p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>{rec.version}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ShieldCheck size={11} style={{ color: '#1FB57A' }} />
                        <span className="text-[10px] font-bold" style={{ color: '#1FB57A' }}>Anchored</span>
                      </div>
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'rgba(244,248,252,0.6)' }}>{rec.result}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: '#7C8DA6' }}>
                        <Clock size={9} /> {rec.date}
                      </span>
                      <span className="text-[10px]" style={{ color: '#7C8DA6' }}>{rec.author}</span>
                      <code className="flex items-center gap-1 text-[10px]" style={{ color: '#7C8DA6' }}>
                        <Hash size={9} /> {rec.hash}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
