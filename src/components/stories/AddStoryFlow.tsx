import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, Type, Globe, Users, Star, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AddStoryFlowProps {
  onClose: () => void;
  onPublished?: () => void;
}

type Step = 'pick' | 'edit' | 'options';
type Visibility = 'public' | 'connections';

export default function AddStoryFlow({ onClose, onPublished }: AddStoryFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('pick');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [isHighlight, setIsHighlight] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith('video') ? 'video' : 'image';
    setMediaType(type);
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setStep('edit');
  }

  async function publish() {
    setPublishing(true);
    await new Promise(r => setTimeout(r, 1400)); /* simulate upload */
    setPublishing(false);
    setDone(true);
    setTimeout(() => { onPublished?.(); onClose(); }, 800);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="relative w-full sm:max-w-sm overflow-hidden"
          style={{
            background: '#0E1F33',
            border: '1px solid rgba(255,255,255,0.11)',
            borderRadius: '24px 24px 0 0',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            maxHeight: '92dvh',
          }}
        >
          {/* sm+ rounded all corners */}
          <style>{`@media(min-width:640px){.story-modal{border-radius:24px!important}}`}</style>
          <div className="story-modal">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="font-semibold text-white text-base font-display">
                {step === 'pick' ? 'Add to Story' : step === 'edit' ? 'Edit Story' : 'Story Options'}
              </h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/50">
                <X size={17} />
              </button>
            </div>

            {/* Step: pick */}
            {step === 'pick' && (
              <div className="p-5">
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={pickFile} className="hidden" />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all"
                    style={{
                      background: 'rgba(47,128,237,0.10)',
                      border: '1.5px dashed rgba(47,128,237,0.4)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(47,128,237,0.18)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(47,128,237,0.10)')}
                  >
                    <ImageIcon size={24} className="text-azure" />
                    <span className="text-sm font-medium text-azure">Photo</span>
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all"
                    style={{
                      background: 'rgba(184,241,53,0.08)',
                      border: '1.5px dashed rgba(184,241,53,0.35)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,241,53,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(184,241,53,0.08)')}
                  >
                    <Video size={24} style={{ color: '#B8F135' }} />
                    <span className="text-sm font-medium" style={{ color: '#B8F135' }}>Video</span>
                  </button>
                </div>

                <p className="text-xs text-center" style={{ color: '#7C8DA6' }}>
                  Photos and videos up to 60s · Visible for 24 hours
                </p>
              </div>
            )}

            {/* Step: edit */}
            {step === 'edit' && mediaPreview && (
              <div className="p-5">
                {/* Preview */}
                <div className="relative rounded-2xl overflow-hidden mb-4" style={{ height: 300, background: '#080F1C' }}>
                  {mediaType === 'image' ? (
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={mediaPreview} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                  )}
                  {/* Caption overlay preview */}
                  {caption && (
                    <div className="absolute bottom-0 inset-x-0 px-4 pb-4 pt-8" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                      <p className="text-sm text-white text-center" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{caption}</p>
                    </div>
                  )}
                </div>

                {/* Caption input */}
                <div className="flex items-center gap-2 mb-4">
                  <Type size={16} className="text-white/40 flex-shrink-0" />
                  <input
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Add a caption…"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30 py-2"
                    maxLength={150}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('options')}
                    className="flex-1 btn-outline text-sm justify-center"
                  >
                    Options
                  </button>
                  <button
                    onClick={publish}
                    disabled={publishing || done}
                    className="flex-1 btn-primary text-sm justify-center"
                  >
                    {done ? (
                      <><Check size={15} /> Shared!</>
                    ) : publishing ? (
                      <><Loader2 size={15} className="animate-spin" /> Uploading…</>
                    ) : (
                      'Share Story'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step: options */}
            {step === 'options' && (
              <div className="p-5 space-y-3">
                {/* Visibility */}
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Who can see this</p>
                {(['public', 'connections'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: visibility === v ? 'rgba(47,128,237,0.12)' : 'rgba(255,255,255,0.04)',
                      border: visibility === v ? '1px solid rgba(47,128,237,0.35)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {v === 'public' ? <Globe size={17} className="text-azure" /> : <Users size={17} className="text-azure" />}
                    <span className="text-sm font-medium text-white capitalize">{v === 'connections' ? 'Connections only' : 'Everyone'}</span>
                    {visibility === v && <Check size={15} className="text-azure ml-auto" />}
                  </button>
                ))}

                {/* Pin to highlights */}
                <button
                  onClick={() => setIsHighlight(h => !h)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mt-2 transition-all"
                  style={{
                    background: isHighlight ? 'rgba(184,241,53,0.10)' : 'rgba(255,255,255,0.04)',
                    border: isHighlight ? '1px solid rgba(184,241,53,0.30)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Star size={17} style={{ color: isHighlight ? '#B8F135' : 'rgba(255,255,255,0.35)' }} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Pin to highlights</p>
                    <p className="text-xs" style={{ color: '#7C8DA6' }}>Stays on your profile after 24 hours</p>
                  </div>
                  {isHighlight && <Check size={15} style={{ color: '#B8F135', marginLeft: 'auto' }} />}
                </button>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setStep('edit')} className="flex-1 btn-outline text-sm justify-center">Back</button>
                  <button onClick={publish} disabled={publishing} className="flex-1 btn-primary text-sm justify-center">
                    {publishing ? <Loader2 size={15} className="animate-spin" /> : 'Share Story'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
