'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const SUPERADMIN_PASSWORD = 'Superadmin#7795';
const SESSION_KEY = 'superadmin_auth';

export default function SuperAdminLayout({ children }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === 'true') { setAuthed(true); setLoading(false); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; } // Show password form, don't redirect

      const email = session.user.email?.toLowerCase();
      if (email === 'irfangull2288@gmail.com') {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setAuthed(true);
      } else {
        const { data: rows } = await supabase
          .from('users_subscription').select('role')
          .eq('user_id', session.user.id).limit(1);
        if (rows?.[0]?.role === 'superadmin') {
          sessionStorage.setItem(SESSION_KEY, 'true');
          setAuthed(true);
        }
      }
      setLoading(false);
    });
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === SUPERADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthed(true); setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080e1a', color: '#D4A843', fontSize: 18 }}>
      🌴 Loading…
    </div>
  );

  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #080e1a 0%, #0d1b2a 100%)' }}>
      <div style={{ background: '#0f172a', border: '1px solid #D4A84344', borderRadius: 20, padding: '44px 48px', width: '100%', maxWidth: 400, boxShadow: '0 25px 60px #0009' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12, filter: 'drop-shadow(0 0 16px #D4A843)' }}>🌴</div>
          <h1 style={{ color: '#D4A843', fontSize: 22, fontWeight: 800, margin: 0, background: 'linear-gradient(90deg,#D4A843,#f5d68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Gulf Admin Panel
          </h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 13 }}>🇦🇪 UAE &amp; 🇸🇦 Saudi Arabia Real Estate</p>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>Enter password to access dashboard</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Password</label>
          <input
            type="password" value={passwordInput} autoFocus
            onChange={e => setPasswordInput(e.target.value)}
            placeholder="Enter super admin password…"
            style={{ width: '100%', padding: '12px 16px', background: '#080e1a', border: `1px solid ${error ? '#ef4444' : '#334155'}`, borderRadius: 10, color: '#e2e8f0', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{error}</p>}
          <button type="submit" style={{ marginTop: 20, width: '100%', padding: 14, background: 'linear-gradient(135deg, #D4A843, #b8891f)', color: '#080e1a', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            🔓 Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );

  return <>{children}</>;
}
