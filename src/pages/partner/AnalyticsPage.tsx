import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const VOLUME_DATA = [
  { month: 'Jan', tests: 18, clearances: 14 },
  { month: 'Feb', tests: 22, clearances: 17 },
  { month: 'Mar', tests: 28, clearances: 21 },
  { month: 'Apr', tests: 25, clearances: 20 },
  { month: 'May', tests: 31, clearances: 26 },
  { month: 'Jun', tests: 34, clearances: 29 },
];

const TYPE_DATA = [
  { type: 'Physical',  count: 42 },
  { type: 'Clearance', count: 38 },
  { type: 'Cardiac',   count: 24 },
  { type: 'Blood/Lab', count: 31 },
  { type: 'Imaging',   count: 18 },
  { type: 'Drug',      count: 12 },
];

const REVENUE_DATA = [
  { month: 'Jan', revenue: 32400, commission: 4860 },
  { month: 'Feb', revenue: 39600, commission: 5940 },
  { month: 'Mar', revenue: 50400, commission: 7560 },
  { month: 'Apr', revenue: 45000, commission: 6750 },
  { month: 'May', revenue: 55800, commission: 8370 },
  { month: 'Jun', revenue: 61200, commission: 9180 },
];

const AXIS_COLOR = 'rgba(255,255,255,0.25)';
const GRID_COLOR = 'rgba(255,255,255,0.06)';
const LABEL_COLOR = '#7C8DA6';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <p className="text-[11px] font-bold text-white mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[11px]" style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' && p.value > 999 ? `AED ${p.value.toLocaleString()}` : p.value}</strong></p>
      ))}
    </div>
  );
}

const SUMMARY = [
  { label: 'Tests This Year',    value: '158',     color: '#2F80ED' },
  { label: 'Avg Tests / Month',  value: '26.3',    color: '#1FB57A' },
  { label: 'Revenue YTD (AED)', value: '284,400', color: '#1FB57A' },
  { label: 'Commission YTD',    value: '42,660',  color: '#F5A623' },
];

export default function PartnerAnalyticsPage() {
  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
        <h1 className="text-xl font-black text-white">Analytics</h1>
        <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>2026 performance overview</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ animation: 'fadeSlideUp 0.35s 0.05s ease both' }}>
        {SUMMARY.map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: '#0D1C2E', border: `1px solid ${s.color}18` }}>
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Test volume over time */}
      <div className="rounded-2xl p-5" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.35s 0.1s ease both' }}>
        <p className="text-sm font-bold text-white mb-4">Test Volume Over Time</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={VOLUME_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="month" tick={{ fill: LABEL_COLOR, fontSize: 11 }} axisLine={{ stroke: AXIS_COLOR }} tickLine={false} />
            <YAxis tick={{ fill: LABEL_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: LABEL_COLOR }} />
            <Line type="monotone" dataKey="tests" name="Tests" stroke="#2F80ED" strokeWidth={2} dot={{ r: 3, fill: '#2F80ED' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="clearances" name="Clearances" stroke="#1FB57A" strokeWidth={2} dot={{ r: 3, fill: '#1FB57A' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column: tests by type + revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.35s 0.15s ease both' }}>
          <p className="text-sm font-bold text-white mb-4">Tests by Type</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TYPE_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="type" tick={{ fill: LABEL_COLOR, fontSize: 10 }} axisLine={{ stroke: AXIS_COLOR }} tickLine={false} />
              <YAxis tick={{ fill: LABEL_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" fill="#2F80ED" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.35s 0.2s ease both' }}>
          <p className="text-sm font-bold text-white mb-4">Revenue & Commission (AED)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={REVENUE_DATA} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="month" tick={{ fill: LABEL_COLOR, fontSize: 11 }} axisLine={{ stroke: AXIS_COLOR }} tickLine={false} />
              <YAxis tick={{ fill: LABEL_COLOR, fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: LABEL_COLOR }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1FB57A" strokeWidth={2} dot={{ r: 3, fill: '#1FB57A' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="commission" name="Commission" stroke="#F5A623" strokeWidth={2} dot={{ r: 3, fill: '#F5A623' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
