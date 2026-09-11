'use client';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const CITIES = [
  { name: 'Dubai', emoji: '🏙️', country: 'UAE', color: '#D4A843' },
  { name: 'Abu Dhabi', emoji: '🕌', country: 'UAE', color: '#60a5fa' },
  { name: 'Riyadh', emoji: '🌆', country: 'KSA', color: '#34d399' },
  { name: 'Jeddah', emoji: '🌊', country: 'KSA', color: '#a78bfa' },
  { name: 'Sharjah', emoji: '🏛️', country: 'UAE', color: '#f97316' },
  { name: 'Dammam', emoji: '⛽', country: 'KSA', color: '#fb7185' },
];

const FEATURES = [
  { icon: '🤖', title: 'AI Property Advisor', desc: 'Chatbot instantly answers property queries in Arabic & English — 24/7, without any human agent.', color: '#D4A843' },
  { icon: '🏠', title: 'Smart Property Matching', desc: 'Qualifies buyer budget, bedroom needs, and preferred area to show the most relevant listings.', color: '#60a5fa' },
  { icon: '📍', title: 'UAE & KSA Listings', desc: 'Live property data for Dubai, Abu Dhabi, Riyadh, Jeddah and more — in AED & SAR.', color: '#34d399' },
  { icon: '📲', title: 'Lead Capture Autopilot', desc: 'Collects name, phone, and budget from every visitor and pushes leads straight to your CRM.', color: '#a78bfa' },
  { icon: '🔄', title: 'Buy & Rent Flows', desc: 'Separate qualification flows for buying and renting — tailored for Gulf real estate standards.', color: '#f97316' },
  { icon: '💬', title: 'Human Takeover', desc: 'Spot a hot lead? Pause the AI and jump into the chat yourself with a single click.', color: '#fb7185' },
];

const TESTIMONIALS = [
  { name: 'Abdullah Al-Rashidi', role: 'Property Broker — Dubai', text: 'Our chatbot qualifies 50+ leads daily. Buyers get instant property info while we sleep.', flag: '🇦🇪' },
  { name: 'Fatimah Al-Zahrani', role: 'Real Estate Manager — Riyadh', text: 'We embedded this on our site in 10 minutes. Lead quality improved dramatically.', flag: '🇸🇦' },
  { name: 'Omar Khalid', role: 'Developer — Abu Dhabi', text: 'Clients love getting instant villa and apartment options without waiting for an agent.', flag: '🇦🇪' },
];

const PROP_TYPES = ['🏙️ Apartments', '🏡 Villas', '🏘️ Townhouses', '💎 Penthouses', '🏢 Compounds', '🛏️ Studios'];

export default function Home() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCity, setActiveCity] = useState(0);

  useEffect(() => {
    const isViewWebsite = window.location.search.includes('view=website');
    if (isViewWebsite) { setAuthChecking(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { window.location.href = '/dashboard'; }
      else { setAuthChecking(false); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) window.location.href = '/dashboard';
      else setAuthChecking(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveCity(c => (c + 1) % CITIES.length), 2500);
    return () => clearInterval(t);
  }, []);

  if (authChecking) return <div style={{ minHeight: '100vh', background: '#080e1a' }} />;

  const city = CITIES[activeCity];

  return (
    <div style={{ minHeight: '100vh', background: '#080e1a', color: '#e2e8f0', fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden' }}>

      {/* ── Ambient Glows ── */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 700, height: 700, background: 'radial-gradient(circle, #D4A84318 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: '-15%', width: 600, height: 600, background: 'radial-gradient(circle, #1d4ed812 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Navbar ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,14,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #D4A84322', padding: '0 6%', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 10px #D4A843)' }}>🌴</span>
          <span style={{ fontSize: 19, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(90deg, #D4A843, #f5d68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GulfProp<span style={{ color: '#D4A843' }}>.</span>AI
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {[['#features', 'Features'], ['#cities', 'Cities'], ['#testimonials', 'Reviews'], ['/contact', 'Contact']].map(([href, label]) => (
            <a key={href} href={href} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = '#D4A843'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #334155', color: '#e2e8f0', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Login</Link>
          <Link href="/login" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #D4A843, #b8891f)', color: '#080e1a', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>Get Started</Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D4A84315', border: '1px solid #D4A84340', borderRadius: 50, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#D4A843', marginBottom: 32 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', display: 'inline-block' }} />
          🇦🇪 UAE &nbsp;·&nbsp; 🇸🇦 Saudi Arabia — AI Real Estate Chatbot
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 28, letterSpacing: '-0.03em', maxWidth: 900, margin: '0 auto 28px' }}>
          Find Your Dream Property in <br />
          <span style={{ background: 'linear-gradient(90deg, #D4A843, #f5d68a, #D4A843)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%', animation: 'shimmer 3s linear infinite' }}>
            {city.emoji} {city.name}
          </span>
          <span style={{ color: '#475569', fontSize: '0.5em', display: 'block', fontWeight: 500, marginTop: 8 }}>{city.country} — in AED & SAR</span>
        </h1>

        <p style={{ fontSize: 19, color: '#94a3b8', maxWidth: 600, margin: '0 auto 44px', lineHeight: 1.75 }}>
          AI-powered chatbot that qualifies buyers & renters, shows <em style={{ color: '#D4A843', fontStyle: 'normal', fontWeight: 600 }}>live Gulf listings</em>, and captures leads — 24/7 in Arabic & English.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" style={{ padding: '15px 34px', borderRadius: 12, background: 'linear-gradient(135deg, #D4A843, #b8891f)', color: '#080e1a', textDecoration: 'none', fontSize: 16, fontWeight: 800, boxShadow: '0 8px 32px #D4A84340', display: 'flex', alignItems: 'center', gap: 8 }}>
            Start for Free — No Credit Card →
          </Link>
          <Link href="/how-it-works" style={{ padding: '15px 28px', borderRadius: 12, border: '1px solid #334155', color: '#e2e8f0', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>
            See How it Works
          </Link>
        </div>

        {/* City pills */}
        <div id="cities" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 52 }}>
          {CITIES.map((c, i) => (
            <div key={c.name} onClick={() => setActiveCity(i)} style={{ padding: '8px 18px', borderRadius: 50, border: `1px solid ${i === activeCity ? c.color : '#1e293b'}`, background: i === activeCity ? `${c.color}15` : 'transparent', color: i === activeCity ? c.color : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .3s' }}>
              {c.emoji} {c.name}
            </div>
          ))}
        </div>

        {/* Property type pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
          {PROP_TYPES.map(t => (
            <span key={t} style={{ padding: '5px 14px', borderRadius: 50, background: '#0f172a', border: '1px solid #1e293b', color: '#64748b', fontSize: 12 }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 6%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ color: '#D4A843', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Why GulfProp.AI</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16 }}>
            The Smartest Way to Sell<br />Gulf Real Estate
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>Built specifically for UAE & Saudi Arabia — with local property types, AED & SAR pricing, and Arabic support.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid #1e293b', borderRadius: 16, padding: '28px 24px', transition: 'transform .2s, border-color .2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = f.color + '44'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#1e293b'; }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e2e8f0', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ padding: '60px 6%', background: 'linear-gradient(135deg, #0d1b2a, #1a2540)', borderTop: '1px solid #D4A84322', borderBottom: '1px solid #D4A84322', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
          {[['🏠', '10,000+', 'Gulf Listings'], ['🌍', '7', 'Cities Covered'], ['⚡', '< 10 min', 'Setup Time'], ['📲', '24/7', 'Lead Capture']].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#D4A843' }}>{val}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: '100px 6%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ color: '#D4A843', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Trusted by Gulf Brokers</div>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Real Results, Real Clients</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: 24, marginBottom: 16 }}>{'⭐'.repeat(5)}</div>
              <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #D4A843, #b8891f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#080e1a', fontSize: 16 }}>{t.flag}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 6%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'linear-gradient(135deg, #0d1b2a, #1a2540)', border: '1px solid #D4A84333', borderRadius: 24, padding: '70px 40px', maxWidth: 800, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, background: 'radial-gradient(circle, #D4A84318 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 52, marginBottom: 20 }}>🌴</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, marginBottom: 16, background: 'linear-gradient(90deg, #D4A843, #f5d68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Launch Your Gulf Chatbot Today
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            UAE & Saudi Arabia properties. AED & SAR pricing. Arabic & English support. Ready in 10 minutes.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '15px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #D4A843, #b8891f)', color: '#080e1a', textDecoration: 'none', fontSize: 16, fontWeight: 800 }}>
              🇦🇪 Start Free — UAE & KSA →
            </Link>
            <Link href="/pricing" style={{ padding: '15px 28px', borderRadius: 12, border: '1px solid #334155', color: '#e2e8f0', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px 6%', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🌴</span>
          <span style={{ fontWeight: 800, fontStyle: 'italic', background: 'linear-gradient(90deg, #D4A843, #f5d68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GulfProp.AI</span>
          <span style={{ color: '#334155', fontSize: 13, marginLeft: 8 }}>🇦🇪 UAE · 🇸🇦 Saudi Arabia</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['/pricing', 'Pricing'], ['/contact', 'Contact'], ['/login', 'Login']].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: '#475569', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>{label}</Link>
          ))}
        </div>
        <div style={{ color: '#334155', fontSize: 12 }}>© 2026 GulfProp.AI — All rights reserved</div>
      </footer>

      <style>{`
        @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
      `}</style>
    </div>
  );
}
