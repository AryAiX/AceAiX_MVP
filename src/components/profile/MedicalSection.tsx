import { Lock, Stethoscope, ShieldCheck, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import SectionCard from './SectionCard';
import StatusChip from '../ui/StatusChip';

interface MedicalSectionProps {
  isGranted: boolean;
  isOwner?: boolean;
}

export default function MedicalSection({ isGranted, isOwner }: MedicalSectionProps) {
  return (
    <SectionCard title="Medical Intelligence" icon={<Stethoscope size={15} />} isOwner={isOwner}>
      {/* Always-visible clearance strip */}
      <div className="flex items-center gap-3 border border-emerald/20 bg-emerald/[0.06] rounded-xl px-4 py-3 mb-4">
        <ShieldCheck size={16} className="text-emerald flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Full Clearance</p>
          <p className="text-xs text-muted">Issued by Al Wasl Medical · Jan 2025 · Valid until Dec 2025</p>
        </div>
        <StatusChip status="cleared" />
      </div>

      {isGranted || isOwner ? (
        <div className="space-y-3">
          {[
            { label: 'Injury History', value: 'No major injuries. Minor hamstring strain Apr 2023 (14-day absence). Fully recovered.' },
            { label: 'Last Physical', value: 'Jan 2025 — VO₂ max 67.4 ml/kg/min · Lactate threshold 14.8 km/h · Sprint max 34.2 km/h' },
            { label: 'Provenance', value: 'Tamper-evident hash verified. Document signed by Dr. Yousuf Rahimi (UAEFA Registered #4821).' },
          ].map(item => (
            <div key={item.label} className="border border-white/[0.06] rounded-xl px-4 py-3 bg-white/[0.02]">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-sm text-slate-300">{item.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-white/[0.06] rounded-xl bg-white/[0.02]">
          <Lock size={24} className="text-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Restricted Access</p>
          <p className="text-xs text-muted mb-4">Full medical records require athlete consent. Sign in to request access.</p>
          <RouterLink to="/auth/register"
            className="inline-flex items-center gap-2 btn-outline px-5 py-2 text-xs">
            <Link size={12} /> Request Medical Access
          </RouterLink>
        </div>
      )}
    </SectionCard>
  );
}
