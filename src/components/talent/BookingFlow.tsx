import React, { useState, useEffect } from 'react';
import {
  MapPin, Calendar, Clock, ChevronLeft, ChevronRight,
  CheckCircle, Loader2, X, AlertTriangle,
} from 'lucide-react';

interface Slot {
  slot_id: string;
  location: string;
  start: string;
  end: string;
  capacity: number;
  booked: number;
}

interface BookingFlowProps {
  slots: Slot[];
  loadingSlots: boolean;
  isMinor: boolean;
  guardianApproved: boolean;
  onBook: (slot: Slot) => Promise<void>;
  onClose: () => void;
}

const LOCATIONS = ['All', 'Dubai Sports City', 'Abu Dhabi Academy', 'Sharjah Sportify Hub'];

function groupByDate(slots: Slot[]): Record<string, Slot[]> {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const date = slot.start.slice(0, 10);
    (acc[date] = acc[date] ?? []).push(slot);
    return acc;
  }, {});
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function BookingFlow({ slots, loadingSlots, isMinor, guardianApproved, onBook, onClose }: BookingFlowProps) {
  const [location, setLocation]   = useState('All');
  const [selected, setSelected]   = useState<Slot | null>(null);
  const [step, setStep]           = useState<'pick' | 'confirm' | 'booked'>('pick');
  const [booking, setBooking]     = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [dateOffset, setDateOffset] = useState(0);

  const filtered = slots.filter(s => location === 'All' || s.location === location);
  const byDate   = groupByDate(filtered);
  const dates    = Object.keys(byDate).sort();
  const pageSize = 5;
  const visibleDates = dates.slice(dateOffset, dateOffset + pageSize);

  async function handleBook() {
    if (!selected) return;
    setBooking(true);
    setBookingError(null);
    try {
      await onBook(selected);
      setStep('booked');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes flowIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bookedStamp {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.09)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            {step === 'confirm' && (
              <button onClick={() => setStep('pick')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}>
                <ChevronLeft size={14} />
              </button>
            )}
            <Calendar size={14} color="#2F80ED" />
            <span className="text-sm font-bold text-white">
              {step === 'pick' ? 'Choose a slot' : step === 'confirm' ? 'Confirm booking' : 'Booking confirmed'}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        {step === 'booked' ? (
          <div className="flex flex-col items-center py-12 px-6 text-center" style={{ animation: 'bookedStamp 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(31,181,122,0.15)', border: '2px solid rgba(31,181,122,0.4)', boxShadow: '0 0 30px rgba(31,181,122,0.2)' }}>
              <CheckCircle size={30} color="#1FB57A" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">You're booked!</h3>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: '#9DB0C6' }}>
              Your in-person assessment at <strong className="text-white">{selected?.location}</strong> is confirmed for{' '}
              <strong className="text-white">{selected ? fmtDate(selected.start.slice(0, 10)) : ''}</strong> at{' '}
              <strong className="text-white">{selected ? fmtTime(selected.start) : ''}</strong>.<br /><br />
              Results will sync automatically to your AceAiX profile after your visit.
            </p>
            {isMinor && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)' }}>
                <AlertTriangle size={12} color="#F5A623" />
                <p className="text-[11px]" style={{ color: '#F5A623' }}>A confirmation email has been sent to the guardian on file.</p>
              </div>
            )}
            <button onClick={onClose} className="mt-6 px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.03]"
              style={{ background: '#1FB57A', color: '#fff', boxShadow: '0 0 16px rgba(31,181,122,0.3)' }}>
              Done
            </button>
          </div>
        ) : step === 'confirm' && selected ? (
          <div className="p-5 space-y-4" style={{ animation: 'flowIn 0.25s ease' }}>
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(47,128,237,0.07)', border: '1px solid rgba(47,128,237,0.2)' }}>
              {[
                { icon: MapPin,   label: 'Location', value: selected.location },
                { icon: Calendar, label: 'Date',     value: fmtDate(selected.start.slice(0, 10)) },
                { icon: Clock,    label: 'Time',     value: `${fmtTime(selected.start)} – ${fmtTime(selected.end)}` },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3">
                  <r.icon size={13} style={{ color: '#2F80ED', flexShrink: 0 }} />
                  <span className="text-xs text-white font-medium w-16 flex-shrink-0">{r.label}</span>
                  <span className="text-xs" style={{ color: '#9DB0C6' }}>{r.value}</span>
                </div>
              ))}
            </div>
            {isMinor && !guardianApproved && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)' }}>
                <AlertTriangle size={12} style={{ color: '#F5A623', flexShrink: 0, marginTop: 1 }} />
                <p className="text-[11px]" style={{ color: '#F5A623' }}>Guardian must approve before the booking is finalised.</p>
              </div>
            )}
            {bookingError && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.25)' }}>
                <AlertTriangle size={12} style={{ color: '#EF5350', flexShrink: 0, marginTop: 1 }} />
                <p className="text-[11px]" style={{ color: '#EF5350' }}>{bookingError}</p>
              </div>
            )}
            <button
              disabled={booking}
              onClick={handleBook}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ background: '#2F80ED', color: '#fff', boxShadow: '0 0 20px rgba(47,128,237,0.3)', opacity: booking ? 0.7 : 1 }}
            >
              {booking ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {booking ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4" style={{ animation: 'flowIn 0.25s ease' }}>
            {/* Location filter */}
            <div className="flex gap-1 flex-wrap">
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: location === loc ? 'rgba(47,128,237,0.15)' : 'rgba(255,255,255,0.04)',
                    color: location === loc ? '#2F80ED' : '#9DB0C6',
                    border: location === loc ? '1px solid rgba(47,128,237,0.35)' : '1px solid rgba(255,255,255,0.07)',
                    transform: location === loc ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-10 gap-2" style={{ color: '#9DB0C6' }}>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading available slots…</span>
              </div>
            ) : dates.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: '#9DB0C6' }}>No available slots for this location.</p>
              </div>
            ) : (
              <>
                {/* Date navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setDateOffset(Math.max(0, dateOffset - pageSize))}
                    disabled={dateOffset === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                    style={{ color: '#9DB0C6' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[11px]" style={{ color: '#9DB0C6' }}>
                    {visibleDates[0] ? fmtDate(visibleDates[0]) : ''} — {visibleDates[visibleDates.length - 1] ? fmtDate(visibleDates[visibleDates.length - 1]) : ''}
                  </span>
                  <button
                    onClick={() => setDateOffset(dateOffset + pageSize)}
                    disabled={dateOffset + pageSize >= dates.length}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                    style={{ color: '#9DB0C6' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Slots */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {visibleDates.map(date => (
                    <div key={date}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9DB0C6' }}>{fmtDate(date)}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(byDate[date] ?? []).map(slot => {
                          const available = slot.capacity - slot.booked;
                          const isFull    = available <= 0;
                          const isSelected = selected?.slot_id === slot.slot_id;
                          return (
                            <button
                              key={slot.slot_id}
                              disabled={isFull}
                              onClick={() => setSelected(slot)}
                              className="rounded-xl px-3 py-2.5 text-left transition-all"
                              style={{
                                background: isSelected
                                  ? 'rgba(47,128,237,0.2)'
                                  : isFull
                                  ? 'rgba(255,255,255,0.02)'
                                  : 'rgba(255,255,255,0.05)',
                                border: isSelected
                                  ? '1px solid rgba(47,128,237,0.5)'
                                  : '1px solid rgba(255,255,255,0.08)',
                                opacity: isFull ? 0.4 : 1,
                                boxShadow: isSelected ? '0 0 12px rgba(47,128,237,0.2)' : 'none',
                              }}
                            >
                              <p className="text-xs font-semibold" style={{ color: isSelected ? '#2F80ED' : 'white' }}>
                                {fmtTime(slot.start)}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin size={9} style={{ color: '#9DB0C6', flexShrink: 0 }} />
                                <p className="text-[9px] truncate" style={{ color: '#9DB0C6' }}>{slot.location.split(' ')[0]}</p>
                              </div>
                              <p className="text-[9px] mt-0.5" style={{ color: isFull ? '#EF5350' : '#1FB57A' }}>
                                {isFull ? 'Full' : `${available} spot${available !== 1 ? 's' : ''}`}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  disabled={!selected}
                  onClick={() => setStep('confirm')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: selected ? '#2F80ED' : 'rgba(255,255,255,0.07)',
                    color: selected ? '#fff' : '#9DB0C6',
                    cursor: selected ? 'pointer' : 'not-allowed',
                    boxShadow: selected ? '0 0 20px rgba(47,128,237,0.3)' : 'none',
                  }}
                >
                  {selected ? (
                    <>Continue — {fmtDate(selected.start.slice(0, 10))} at {fmtTime(selected.start)} <ChevronRight size={14} /></>
                  ) : 'Select a slot to continue'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
