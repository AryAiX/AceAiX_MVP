import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import { Check, Zap, Shield, Users, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    id: 'athlete_free',
    name: 'Athlete Free',
    target: 'Athletes',
    price: 0,
    currency: 'AED',
    period: 'month',
    description: 'Start your digital career profile. Free forever.',
    color: 'slate',
    features: [
      'Basic athlete profile',
      'Upload up to 3 highlight clips',
      'AI performance summary',
      'Public discovery listing',
      'Community network access',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'athlete_pro',
    name: 'Athlete Pro',
    target: 'Athletes',
    price: 49,
    currency: 'AED',
    period: 'month',
    description: 'Everything you need to get scouted and grow your career.',
    color: 'blue',
    features: [
      'Everything in Free',
      'Unlimited highlight uploads',
      'AI career coach (unlimited sessions)',
      'Verified medical record display',
      'Priority scout visibility',
      'AI trajectory & projections',
      'Direct messaging (20/month)',
      'Career opportunity alerts',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    id: 'scout',
    name: 'Scout & Club',
    target: 'Recruiters',
    price: 299,
    currency: 'AED',
    period: 'month',
    description: 'Advanced talent discovery for serious recruiters.',
    color: 'slate',
    features: [
      'Full athlete database access',
      'AI natural language search',
      'Unlimited watchlists',
      'Verified record access',
      'Direct contact (unlimited)',
      'Comparison tools',
      'Analytics dashboard',
      'Priority support',
    ],
    cta: 'Start Scouting',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    target: 'Clubs & Federations',
    price: null,
    currency: 'AED',
    period: 'month',
    description: 'Custom solutions for large clubs, federations, and academies.',
    color: 'amber',
    features: [
      'Everything in Scout & Club',
      'Dedicated account manager',
      'Custom AI models',
      'API access',
      'White-label options',
      'SLA guarantee',
      'Multi-seat team access',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const FAQS = [
  { q: 'Can I switch plans?', a: 'Yes. You can upgrade or downgrade anytime. Upgrades take effect immediately; downgrades at the end of your billing period.' },
  { q: 'Is there a free trial?', a: 'Athlete Pro comes with a 14-day free trial. Scout & Club plans include a 7-day trial. No credit card required.' },
  { q: 'How are payments processed?', a: 'We accept all major credit/debit cards and UAE NAPS. Enterprise invoicing available.' },
  { q: 'What currencies are supported?', a: 'Prices are listed in AED. We also accept USD, EUR, and SAR at current exchange rates.' },
];

export default function PlansPage() {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-navy-800">
      <PublicHeader />

      <div className="border-b border-slate-700/50 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Plans for Every Stage</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">From grassroots athlete to professional club — AceAiX has a plan built for your goals.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-navy-800 border border-slate-700 rounded-full px-4 py-2">
            <span className={`text-sm ${!billingAnnual ? 'text-white font-medium' : 'text-slate-400'}`}>Monthly</span>
            <div
              onClick={() => setBillingAnnual(!billingAnnual)}
              className={`w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center px-0.5 ${billingAnnual ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${billingAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className={`text-sm ${billingAnnual ? 'text-white font-medium' : 'text-slate-400'}`}>
              Annual <span className="text-emerald-400 text-xs ml-1">Save 20%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative flex flex-col rounded-2xl border p-6 ${plan.popular ? 'bg-blue-600/10 border-blue-600/50 shadow-blue-glow' : 'bg-navy-700 border-slate-700/50'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={10} fill="white" /> Most Popular
                </div>
              )}
              <div className="mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{plan.target}</p>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              </div>
              <div className="mb-4">
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      {billingAnnual ? Math.round(plan.price * 0.8) : plan.price}
                    </span>
                    <span className="text-slate-400 text-sm">{plan.currency}/{plan.period}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">Custom</p>
                )}
              </div>
              <p className="text-sm text-slate-400 mb-5">{plan.description}</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.id === 'enterprise' ? '/contact' : '/auth/register'}
                className={`w-full text-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-navy-800 hover:bg-navy-700 border border-slate-700 text-white hover:border-slate-500'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{faq.q}</p>
                  <ChevronRight size={16} className={`text-slate-400 transition-transform flex-shrink-0 ml-3 ${openFaq === i ? 'rotate-90' : ''}`} />
                </div>
                {openFaq === i && (
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
