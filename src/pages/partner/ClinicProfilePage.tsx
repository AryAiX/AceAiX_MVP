import { ShieldCheck, CheckCircle2, MapPin, Phone, Mail, Globe, FileText, Award, Clock } from 'lucide-react';

const TEST_CATALOG = [
  { name: 'Physical Assessment',       duration: '90 min', fee: 'AED 1,800', category: 'General' },
  { name: 'Cardiac Screening (ECG)',   duration: '45 min', fee: 'AED 2,400', category: 'Cardiac'  },
  { name: 'Cardiac Screening (Echo)',  duration: '60 min', fee: 'AED 3,500', category: 'Cardiac'  },
  { name: 'Blood Panel (Full)',        duration: '30 min', fee: 'AED 850',   category: 'Lab'      },
  { name: 'Drug Test (WADA panel)',    duration: '30 min', fee: 'AED 1,100', category: 'Lab'      },
  { name: 'MRI — Single Joint',        duration: '45 min', fee: 'AED 4,200', category: 'Imaging'  },
  { name: 'X-Ray',                     duration: '20 min', fee: 'AED 600',   category: 'Imaging'  },
  { name: 'Nutritional Assessment',    duration: '60 min', fee: 'AED 950',   category: 'Nutrition'},
  { name: 'Psychological Assessment',  duration: '90 min', fee: 'AED 1,400', category: 'Mental'   },
  { name: 'Medical Clearance Report',  duration: '30 min', fee: 'AED 2,200', category: 'General'  },
];

const ACCREDITATIONS = [
  { name: 'UAE Sports Medicine Federation',   ref: 'UAESMF-2024-0047', expires: 'Dec 2026', verified: true },
  { name: 'FIFA Medical Centre of Excellence', ref: 'FIFA-MCE-AE-003',  expires: 'Mar 2027', verified: true },
  { name: 'WADA Anti-Doping Accreditation',   ref: 'WADA-LAB-AE-01',  expires: 'Sep 2026', verified: true },
  { name: 'Dubai Health Authority License',   ref: 'DHA-MED-18827',    expires: 'Jan 2027', verified: true },
];

const CATEGORY_COLOR: Record<string, string> = {
  General:  '#2F80ED', Cardiac: '#EF5350', Lab: '#1FB57A',
  Imaging:  '#F5A623', Nutrition: '#B8F135', Mental: '#E056A0',
};

export default function ClinicProfilePage() {
  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes stampIn{0%{opacity:0;transform:scale(0.65)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}`}</style>

      {/* Hero */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D1C2E 0%, #0a1f2d 100%)', border: '1px solid rgba(31,181,122,0.3)', animation: 'fadeSlideUp 0.35s ease both' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(31,181,122,0.1), transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(31,181,122,0.15)', border: '2px solid rgba(31,181,122,0.4)', boxShadow: '0 0 24px rgba(31,181,122,0.2)' }}>
            <ShieldCheck size={28} style={{ color: '#1FB57A' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1.5">
              <h1 className="text-xl font-black text-white">Dubai Sports Medicine Centre</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(31,181,122,0.15)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.35)', animation: 'stampIn 0.5s 0.3s ease both' }}>
                Verified Partner
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs mb-4" style={{ color: '#7C8DA6' }}>
              <span className="flex items-center gap-1.5"><MapPin size={11} /> Dubai Healthcare City, UAE</span>
              <span className="flex items-center gap-1.5"><Phone size={11} /> +971 4 362 0000</span>
              <span className="flex items-center gap-1.5"><Mail size={11} /> clinic@dsmc.ae</span>
              <span className="flex items-center gap-1.5"><Globe size={11} /> dsmc.ae</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { label: 'Partner Since',    value: 'Jan 2024' },
                { label: 'Tests Delivered',  value: '312' },
                { label: 'Avg Turnaround',   value: '24h' },
                { label: 'Commission Rate',  value: '15%' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-2.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-sm font-black text-white">{item.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#7C8DA6' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accreditations */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.35s 0.08s ease both' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-bold text-white">Accreditations & Licences</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {ACCREDITATIONS.map((acc, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: acc.verified ? 'rgba(31,181,122,0.1)' : 'rgba(245,166,35,0.1)', border: `1px solid ${acc.verified ? 'rgba(31,181,122,0.25)' : 'rgba(245,166,35,0.25)'}` }}>
                <Award size={15} style={{ color: acc.verified ? '#1FB57A' : '#F5A623' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{acc.name}</p>
                <p className="text-[11px]" style={{ color: '#7C8DA6' }}>Ref: {acc.ref}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5 justify-end mb-0.5">
                  {acc.verified && <CheckCircle2 size={11} style={{ color: '#1FB57A' }} />}
                  <span className="text-[11px] font-bold" style={{ color: acc.verified ? '#1FB57A' : '#F5A623' }}>
                    {acc.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p className="text-[10px] flex items-center gap-1 justify-end" style={{ color: '#7C8DA6' }}>
                  <Clock size={9} /> Expires {acc.expires}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission terms */}
      <div className="rounded-2xl p-5" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.35s 0.12s ease both' }}>
        <p className="text-sm font-bold text-white mb-4">Commission Terms</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Standard Rate',  value: '15%',      color: '#1FB57A' },
            { label: 'Urgent Booking', value: '12%',      color: '#2F80ED' },
            { label: 'Payout Cycle',   value: 'Monthly',  color: '#7C8DA6' },
            { label: 'Min Payout',     value: 'AED 500',  color: '#7C8DA6' },
          ].map(t => (
            <div key={t.label} className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-black" style={{ color: t.color }}>{t.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#7C8DA6' }}>{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Test catalog */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.35s 0.16s ease both' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-bold text-white">Test Catalog & Pricing</p>
          <span className="text-xs" style={{ color: '#7C8DA6' }}>{TEST_CATALOG.length} accredited tests</span>
        </div>

        <div className="hidden sm:grid px-5 py-2.5 text-[10px] font-black uppercase tracking-wider"
          style={{ gridTemplateColumns: '1fr auto auto auto', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#7C8DA6' }}>
          <span>Test Name</span>
          <span className="w-20 text-left">Category</span>
          <span className="w-20 text-right">Duration</span>
          <span className="w-24 text-right">Fee</span>
        </div>

        {TEST_CATALOG.map((t, i) => {
          const cc = CATEGORY_COLOR[t.category] ?? '#7C8DA6';
          return (
            <div key={i} className="flex sm:grid items-center gap-3 px-5 py-3"
              style={{ gridTemplateColumns: '1fr auto auto auto', borderBottom: i < TEST_CATALOG.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cc}12`, border: `1px solid ${cc}20` }}>
                  <FileText size={10} style={{ color: cc }} />
                </div>
                <p className="text-xs font-semibold text-white truncate">{t.name}</p>
              </div>
              <div className="w-20 hidden sm:block">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: `${cc}12`, color: cc }}>{t.category}</span>
              </div>
              <p className="w-20 text-right text-[11px] hidden sm:block" style={{ color: '#7C8DA6' }}>{t.duration}</p>
              <p className="w-24 text-right text-xs font-bold" style={{ color: '#1FB57A' }}>{t.fee}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
