import React from 'react';
import PublicHeader from '../components/PublicHeader';
import { ShieldCheck, Zap, Users, Globe, Target, Award, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Mohammed Al-Rashidi', title: 'CEO & Co-Founder', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Dr. Sarah Williams', title: 'Chief Medical Officer', image: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Khalil Hassan', title: 'Head of AI & Data', image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Amira Al-Farsi', title: 'Head of Product', image: 'https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

const VALUES = [
  { icon: <ShieldCheck size={22} />, title: 'Verified Truth', desc: 'Every performance claim is verifiable. We built a trust layer where medical and statistical records are certified by accredited partners.', color: 'emerald' },
  { icon: <Zap size={22} />, title: 'AI-First Intelligence', desc: 'Our models surface genuine talent regardless of an athlete\'s connections or marketing budget. The score speaks for itself.', color: 'blue' },
  { icon: <Globe size={22} />, title: 'Regional Focus', desc: 'Built for the MENA sports ecosystem. We understand the federations, leagues, and talent pathways unique to this region.', color: 'blue' },
  { icon: <Target size={22} />, title: 'Athlete-Centric', desc: 'Athletes own their data. Consent controls, privacy settings, and portability are built into the core — not bolted on.', color: 'amber' },
];

const MILESTONES = [
  { year: '2023', event: 'AceAiX founded in Abu Dhabi. Seed round closed.' },
  { year: '2024', event: 'Platform launched with 500 athletes. First UAE Pro League partnership.' },
  { year: '2025', event: 'Expanded to 8 MENA countries. Medical verification network launched.' },
  { year: '2026', event: '12,000+ athletes, 850+ clubs. Series A funding secured.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy-800">
      <PublicHeader />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #1E6FE8 0%, transparent 60%), radial-gradient(circle at 70% 50%, #1E6FE8 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center border-b border-slate-700/50">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">We Built the Intelligence<br />Layer for MENA Sports</h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">AceAiX was founded with a single belief: talent should be discovered on merit, not connections. We built the platform that makes verified performance data accessible to every athlete, scout, and club in the region.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Mission</p>
            <h2 className="text-3xl font-bold text-white mb-5">Democratizing Elite Talent Discovery</h2>
            <p className="text-slate-400 leading-relaxed mb-4">For too long, gifted athletes in the MENA region were invisible to the global market — not for lack of talent, but for lack of verifiable proof. Meanwhile, scouts spent months on incomplete data and unverified claims.</p>
            <p className="text-slate-400 leading-relaxed mb-6">AceAiX changes this by combining AI-powered analysis with certified medical verification and a connected network that gives every stakeholder — athlete, scout, club, or federation — a single trusted source of truth.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-400 font-medium">Operating across 8 MENA countries</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '12,400+', label: 'Athletes' },
              { value: '850+', label: 'Clubs' },
              { value: '34K+', label: 'Verified Records' },
              { value: '8', label: 'Countries' },
            ].map((s) => (
              <div key={s.label} className="stat-card text-center">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest text-center mb-3">Our Values</p>
          <h2 className="text-3xl font-bold text-white text-center mb-10">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="card flex gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${v.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : v.color === 'amber' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-600/15 text-blue-400'}`}>
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest text-center mb-3">Timeline</p>
          <h2 className="text-3xl font-bold text-white text-center mb-10">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-slate-700/50 transform md:-translate-x-1/2" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? 'pr-10 text-right' : 'pl-10'}`}>
                    <p className="text-sm text-slate-400 leading-relaxed">{m.event}</p>
                  </div>
                  <div className="relative flex items-center justify-center w-16 flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-navy-800 z-10">
                      {m.year.slice(2)}
                    </div>
                  </div>
                  <div className={`flex-1 md:hidden ${i % 2 === 0 ? '' : ''}`}>
                    <p className="text-xs text-blue-400 font-bold mb-1">{m.year}</p>
                    <p className="text-sm text-slate-400">{m.event}</p>
                  </div>
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? 'pl-10' : 'pr-10 text-right'}`}>
                    <p className="text-sm text-blue-400 font-bold">{m.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest text-center mb-3">Team</p>
          <h2 className="text-3xl font-bold text-white text-center mb-10">The People Behind AceAiX</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="card text-center">
                <img src={member.image} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                <p className="text-sm font-semibold text-white">{member.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{member.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="card text-center py-12">
          <Award size={40} className="text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Partner with AceAiX</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-6">Whether you're a federation, a club, or a sports media company — let's explore how AceAiX can power your talent intelligence.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/auth/register" className="btn-primary">Get Started</Link>
            <a href="mailto:partnerships@aceaix.com" className="btn-secondary flex items-center gap-2">
              <Mail size={15} /> Contact Us
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 mt-5 text-sm text-slate-500">
            <MapPin size={13} />
            <span>Abu Dhabi, United Arab Emirates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
