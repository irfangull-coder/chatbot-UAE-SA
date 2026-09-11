'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = n => (n ?? 0).toLocaleString();
const timeAgo = d => {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const COUNTRIES = ['UAE', 'Saudi Arabia'];
const CITIES = {
  UAE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Al Khobar', 'Makkah', 'Madinah', 'Tabuk'],
};
const PROP_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Duplex', 'Compound', 'Studio'];

export default function GulfSuperAdmin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propTotal, setPropTotal] = useState(0);
  const [propPage, setPropPage] = useState(1);
  const [propFilter, setPropFilter] = useState({ country: '', city: '', type: '' });
  const [cache, setCache] = useState([]);
  const [users, setUsers] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [addPropModal, setAddPropModal] = useState(false);
  const [delPropId, setDelPropId] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userBots, setUserBots] = useState({});
  const [search, setSearch] = useState('');

  // blank property form
  const emptyProp = { country: 'UAE', city: 'Dubai', area_district: '', property_type: 'Apartment', bedrooms: 2, bathrooms: 2, area_sqft: 1200, price: '', currency: 'AED', source_url: '', agent_name: '', images: [] };
  const [propForm, setPropForm] = useState(emptyProp);

  // toast helper
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  // ── fetch stats ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoad('stats', true);
    const r = await fetch('/api/gulf-admin/stats');
    if (r.ok) setStats(await r.json());
    setLoad('stats', false);
  }, []);

  // ── fetch properties ─────────────────────────────────────────────────────────
  const fetchProperties = useCallback(async (page = 1, filter = propFilter) => {
    setLoad('props', true);
    const p = new URLSearchParams({ page, ...filter });
    const r = await fetch(`/api/gulf-admin/properties?${p}`);
    if (r.ok) {
      const d = await r.json();
      setProperties(d.properties);
      setPropTotal(d.total);
    }
    setLoad('props', false);
  }, [propFilter]);

  // ── fetch cache ──────────────────────────────────────────────────────────────
  const fetchCache = useCallback(async () => {
    setLoad('cache', true);
    const r = await fetch('/api/gulf-admin/cache');
    if (r.ok) setCache((await r.json()).cache);
    setLoad('cache', false);
  }, []);

  // ── fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoad('users', true);
    const { data } = await supabase.from('users_subscription').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoad('users', false);
  }, []);

  // ── fetch bots for user ──────────────────────────────────────────────────────
  const fetchUserBots = async userId => {
    const { data } = await supabase.from('bots').select('*').eq('user_id', userId);
    setUserBots(p => ({ ...p, [userId]: data || [] }));
  };

  // initial load
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === 'properties') fetchProperties(1); }, [tab, fetchProperties]);
  useEffect(() => { if (tab === 'cache') fetchCache(); }, [tab, fetchCache]);
  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, fetchUsers]);

  // ── add property ─────────────────────────────────────────────────────────────
  const addProperty = async () => {
    setLoad('addProp', true);
    const r = await fetch('/api/gulf-admin/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...propForm, images: propForm.images || [] }),
    });
    if (r.ok) {
      showToast('Property added ✅');
      setAddPropModal(false);
      setPropForm(emptyProp);
      fetchProperties(propPage);
      fetchStats();
    } else {
      const e = await r.json();
      showToast(e.error || 'Failed', false);
    }
    setLoad('addProp', false);
  };

  // ── delete property ──────────────────────────────────────────────────────────
  const deleteProperty = async id => {
    setDelPropId(id);
    const r = await fetch('/api/gulf-admin/properties', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (r.ok) { showToast('Deleted ✅'); fetchProperties(propPage); fetchStats(); }
    else showToast('Delete failed', false);
    setDelPropId(null);
  };

  // ── clear cache ───────────────────────────────────────────────────────────────
  const clearCache = async (city_key = null) => {
    const confirmed = window.confirm(city_key ? `Clear cache for "${city_key}"?` : 'Clear ALL city cache?');
    if (!confirmed) return;
    setLoad('clearCache', true);
    const r = await fetch('/api/gulf-admin/cache', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(city_key ? { city_key } : { clearAll: true }),
    });
    if (r.ok) { showToast(city_key ? 'Cache cleared ✅' : 'All cache cleared ✅'); fetchCache(); }
    else showToast('Failed to clear', false);
    setLoad('clearCache', false);
  };

  // ── reset trial ───────────────────────────────────────────────────────────────
  const resetTrial = async userId => {
    const r = await fetch('/api/superadmin/reset-trial', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, days: 15 }),
    });
    if ((await r.json()).success) { showToast('Trial reset to 15 days ✅'); fetchUsers(); }
    else showToast('Reset failed', false);
  };

  // ── toggle user status ────────────────────────────────────────────────────────
  const toggleUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await fetch('/api/superadmin/toggle-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: newStatus }),
    });
    fetchUsers();
  };

  // ── delete user ───────────────────────────────────────────────────────────────
  const deleteUser = async (userId, email) => {
    if (!window.confirm(`Delete "${email}"? This cannot be undone!`)) return;
    const r = await fetch('/api/superadmin/delete-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (r.ok) { showToast('User deleted ✅'); fetchUsers(); }
    else showToast('Delete failed', false);
  };

  const trialDays = user => {
    if (!user.trial_ends_at) return null;
    const d = Math.ceil((new Date(user.trial_ends_at) - Date.now()) / 86400000);
    return d;
  };

  const filteredUsers = users.filter(u =>
    !search || (u.email || '').toLowerCase().includes(search.toLowerCase()) || (u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  // ═══════════════════════ RENDER ═══════════════════════════════════════════════
  return (
    <div style={S.page}>
      {/* ── Toast ── */}
      {toast && (
        <div style={{ ...S.toast, background: toast.ok ? '#22c55e' : '#ef4444' }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo}>
            <span style={S.logoIcon}>🌴</span>
            <div>
              <div style={S.logoTitle}>Gulf Real Estate</div>
              <div style={S.logoSub}>Super Admin Dashboard</div>
            </div>
          </div>
          <div style={S.headerFlags}>🇦🇪 UAE &nbsp;&nbsp; 🇸🇦 Saudi Arabia</div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav style={S.nav}>
        {[
          { id: 'overview', label: '📊 Overview', },
          { id: 'properties', label: '🏘️ Properties' },
          { id: 'cache', label: '🗄️ City Cache' },
          { id: 'users', label: '👥 Users' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </nav>

      <main style={S.main}>

        {/* ══════════════ OVERVIEW ══════════════ */}
        {tab === 'overview' && (
          <div>
            <div style={S.sectionTitle}>Overview</div>
            {loading.stats ? <div style={S.loader}>Loading stats…</div> : (
              <div style={S.statsGrid}>
                {[
                  { icon: '🏠', label: 'Gulf Properties', value: fmt(stats?.totalProperties), color: '#D4A843' },
                  { icon: '🏙️', label: 'Cities Covered', value: fmt(stats?.uniqueCities), color: '#60a5fa' },
                  { icon: '⚡', label: 'Cached Cities', value: fmt(stats?.cachedCities), color: '#34d399' },
                  { icon: '👤', label: 'Total Users', value: fmt(stats?.totalUsers), color: '#a78bfa' },
                  { icon: '🤖', label: 'Active Bots', value: fmt(stats?.activeBots), color: '#f97316' },
                ].map(c => (
                  <div key={c.label} style={S.statCard}>
                    <div style={{ fontSize: 32 }}>{c.icon}</div>
                    <div style={{ ...S.statValue, color: c.color }}>{c.value}</div>
                    <div style={S.statLabel}>{c.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={S.quickActions}>
              <div style={S.sectionTitle}>Quick Actions</div>
              <div style={S.actionRow}>
                <button style={S.btnGold} onClick={() => { setTab('properties'); setAddPropModal(true); }}>+ Add Property</button>
                <button style={S.btnBlue} onClick={() => setTab('cache')}>🗄️ Manage Cache</button>
                <button style={S.btnPurple} onClick={() => setTab('users')}>👥 Manage Users</button>
                <button style={S.btnGreen} onClick={() => { fetchStats(); showToast('Stats refreshed ✅'); }}>🔄 Refresh Stats</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ PROPERTIES ══════════════ */}
        {tab === 'properties' && (
          <div>
            <div style={S.rowBetween}>
              <div style={S.sectionTitle}>Gulf Properties <span style={S.badge}>{fmt(propTotal)}</span></div>
              <button style={S.btnGold} onClick={() => setAddPropModal(true)}>+ Add Property</button>
            </div>

            {/* Filters */}
            <div style={S.filterRow}>
              <select style={S.select} value={propFilter.country} onChange={e => { const v = { ...propFilter, country: e.target.value, city: '' }; setPropFilter(v); fetchProperties(1, v); }}>
                <option value="">All Countries</option>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={S.select} value={propFilter.city} onChange={e => { const v = { ...propFilter, city: e.target.value }; setPropFilter(v); fetchProperties(1, v); }}>
                <option value="">All Cities</option>
                {(propFilter.country ? CITIES[propFilter.country] : Object.values(CITIES).flat()).map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={S.select} value={propFilter.type} onChange={e => { const v = { ...propFilter, type: e.target.value }; setPropFilter(v); fetchProperties(1, v); }}>
                <option value="">All Types</option>
                {PROP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <button style={S.btnGhost} onClick={() => { const v = { country: '', city: '', type: '' }; setPropFilter(v); fetchProperties(1, v); }}>Clear</button>
            </div>

            {loading.props ? <div style={S.loader}>Loading…</div> : (
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['Country', 'City', 'Area', 'Type', 'Beds', 'Price', 'Currency', 'Actions'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {properties.length === 0 ? (
                      <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', color: '#64748b' }}>No properties found</td></tr>
                    ) : properties.map(p => (
                      <tr key={p.id} style={S.tr}>
                        <td style={S.td}><span style={{ ...S.countryBadge, background: p.country === 'UAE' ? '#1d4ed833' : '#15803d33', color: p.country === 'UAE' ? '#60a5fa' : '#34d399' }}>{p.country === 'UAE' ? '🇦🇪' : '🇸🇦'} {p.country}</span></td>
                        <td style={S.td}>{p.city}</td>
                        <td style={S.td}>{p.area_district || '—'}</td>
                        <td style={S.td}>{p.property_type}</td>
                        <td style={S.td}>{p.bedrooms} BR / {p.bathrooms} BA</td>
                        <td style={{ ...S.td, color: '#D4A843', fontWeight: 700 }}>{Number(p.price).toLocaleString()}</td>
                        <td style={S.td}>{p.currency}</td>
                        <td style={S.td}>
                          <button style={S.btnDanger} disabled={delPropId === p.id} onClick={() => deleteProperty(p.id)}>
                            {delPropId === p.id ? '…' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div style={S.pagination}>
              <button style={S.btnGhost} disabled={propPage <= 1} onClick={() => { setPropPage(p => p - 1); fetchProperties(propPage - 1); }}>← Prev</button>
              <span style={{ color: '#94a3b8' }}>Page {propPage} / {Math.max(1, Math.ceil(propTotal / 20))}</span>
              <button style={S.btnGhost} disabled={propPage >= Math.ceil(propTotal / 20)} onClick={() => { setPropPage(p => p + 1); fetchProperties(propPage + 1); }}>Next →</button>
            </div>
          </div>
        )}

        {/* ══════════════ CACHE ══════════════ */}
        {tab === 'cache' && (
          <div>
            <div style={S.rowBetween}>
              <div style={S.sectionTitle}>City Cache <span style={S.badge}>{cache.length}</span></div>
              <button style={S.btnDanger} onClick={() => clearCache()} disabled={loading.clearCache}>
                {loading.clearCache ? '…' : '🗑️ Clear All Cache'}
              </button>
            </div>
            {loading.cache ? <div style={S.loader}>Loading…</div> : (
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>{['City Key', 'Country', 'Properties', 'Last Updated', 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {cache.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#64748b' }}>No cache entries</td></tr>
                    ) : cache.map(c => (
                      <tr key={c.city_key} style={S.tr}>
                        <td style={{ ...S.td, fontWeight: 600, color: '#D4A843' }}>{c.city_key}</td>
                        <td style={S.td}>{c.country === 'UAE' ? '🇦🇪 UAE' : c.country === 'Saudi Arabia' ? '🇸🇦 KSA' : c.country || '—'}</td>
                        <td style={S.td}><span style={S.greenBadge}>{c.property_count} props</span></td>
                        <td style={{ ...S.td, color: '#64748b' }}>{timeAgo(c.updated_at)}</td>
                        <td style={S.td}>
                          <button style={S.btnDanger} onClick={() => clearCache(c.city_key)}>🗑️ Clear</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ USERS ══════════════ */}
        {tab === 'users' && (
          <div>
            <div style={S.rowBetween}>
              <div style={S.sectionTitle}>Users <span style={S.badge}>{users.length}</span></div>
              <input style={S.searchInput} placeholder="Search by email or name…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading.users ? <div style={S.loader}>Loading…</div> : (
              <div>
                {filteredUsers.map(u => {
                  const days = trialDays(u);
                  const expanded = expandedUser === u.user_id;
                  return (
                    <div key={u.user_id} style={S.userCard}>
                      <div style={S.userHeader} onClick={() => {
                        setExpandedUser(expanded ? null : u.user_id);
                        if (!userBots[u.user_id]) fetchUserBots(u.user_id);
                      }}>
                        <div style={S.userInfo}>
                          <div style={S.userAvatar}>{(u.email || u.name || '?')[0].toUpperCase()}</div>
                          <div>
                            <div style={S.userName}>{u.name || '—'}</div>
                            <div style={S.userEmail}>{u.email}</div>
                          </div>
                        </div>
                        <div style={S.userMeta}>
                          {u.plan && <span style={{ ...S.planBadge, background: u.plan === 'premium' ? '#D4A84333' : '#60a5fa22', color: u.plan === 'premium' ? '#D4A843' : '#60a5fa' }}>{u.plan}</span>}
                          {days !== null && <span style={{ ...S.planBadge, background: days > 3 ? '#22c55e22' : '#ef444422', color: days > 3 ? '#22c55e' : '#ef4444' }}>{days > 0 ? `${days}d trial` : 'Trial expired'}</span>}
                          <span style={{ ...S.planBadge, background: u.status === 'Active' ? '#22c55e22' : '#ef444422', color: u.status === 'Active' ? '#22c55e' : '#ef4444' }}>{u.status || 'Active'}</span>
                          <span style={{ color: '#64748b', fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {expanded && (
                        <div style={S.userExpanded}>
                          <div style={S.actionRow}>
                            <button style={S.btnBlue} onClick={() => resetTrial(u.user_id)}>🔄 Reset Trial</button>
                            <button style={S.btnGhost} onClick={() => toggleUser(u.user_id, u.status || 'Active')}>
                              {u.status === 'Inactive' ? '✅ Activate' : '⛔ Deactivate'}
                            </button>
                            <button style={S.btnDanger} onClick={() => deleteUser(u.user_id, u.email)}>🗑️ Delete User</button>
                          </div>
                          <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 13 }}>
                            Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                            &nbsp;|&nbsp; Trial ends: {u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString() : '—'}
                          </div>
                          {/* Bots */}
                          <div style={{ marginTop: 14 }}>
                            <div style={{ color: '#D4A843', fontWeight: 600, marginBottom: 8 }}>🤖 Bots</div>
                            {!userBots[u.user_id] ? <div style={{ color: '#64748b' }}>Loading…</div> :
                              userBots[u.user_id].length === 0 ? <div style={{ color: '#64748b' }}>No bots</div> :
                                userBots[u.user_id].map(b => (
                                  <div key={b.id} style={S.botRow}>
                                    <span style={{ color: '#e2e8f0' }}>{b.agent_name || b.id}</span>
                                    <span style={{ ...S.planBadge, background: b.status === 'Active' ? '#22c55e22' : '#ef444422', color: b.status === 'Active' ? '#22c55e' : '#ef4444' }}>{b.status}</span>
                                  </div>
                                ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ══════════════ ADD PROPERTY MODAL ══════════════ */}
      {addPropModal && (
        <div style={S.modalOverlay} onClick={() => setAddPropModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>Add Gulf Property</div>
            <div style={S.formGrid}>
              {[
                { label: 'Country', key: 'country', type: 'select', opts: COUNTRIES },
                { label: 'City', key: 'city', type: 'select', opts: CITIES[propForm.country] || [] },
                { label: 'Area / District', key: 'area_district', type: 'text', placeholder: 'e.g. Palm Jumeirah' },
                { label: 'Property Type', key: 'property_type', type: 'select', opts: PROP_TYPES },
                { label: 'Bedrooms', key: 'bedrooms', type: 'number' },
                { label: 'Bathrooms', key: 'bathrooms', type: 'number' },
                { label: 'Area (sqft)', key: 'area_sqft', type: 'number' },
                { label: 'Price', key: 'price', type: 'number', placeholder: 'e.g. 2500000' },
                { label: 'Currency', key: 'currency', type: 'select', opts: ['AED', 'SAR'] },
                { label: 'Agent Name', key: 'agent_name', type: 'text', placeholder: 'Optional' },
                { label: 'Listing URL', key: 'source_url', type: 'text', placeholder: 'https://…' },
              ].map(f => (
                <div key={f.key} style={S.formField}>
                  <label style={S.label}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select style={S.input} value={propForm[f.key]} onChange={e => setPropForm(p => ({ ...p, [f.key]: e.target.value }))}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input style={S.input} type={f.type} placeholder={f.placeholder || ''} value={propForm[f.key]} onChange={e => setPropForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button style={S.btnGold} onClick={addProperty} disabled={loading.addProp}>
                {loading.addProp ? 'Adding…' : '✅ Add Property'}
              </button>
              <button style={S.btnGhost} onClick={() => setAddPropModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: '100vh', background: '#080e1a', color: '#e2e8f0', fontFamily: "'Inter', -apple-system, sans-serif" },
  toast: { position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 8, color: '#fff', fontWeight: 600, boxShadow: '0 4px 20px #0008', fontSize: 14 },
  header: { background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2540 50%, #0d1b2a 100%)', borderBottom: '1px solid #D4A84333', padding: '0 0' },
  headerInner: { maxWidth: 1280, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: { fontSize: 36, filter: 'drop-shadow(0 0 12px #D4A843)' },
  logoTitle: { fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg, #D4A843, #f5d68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoSub: { fontSize: 12, color: '#64748b', letterSpacing: 1 },
  headerFlags: { fontSize: 20, color: '#94a3b8', letterSpacing: 2 },
  nav: { maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4, borderBottom: '1px solid #1e293b' },
  tab: { padding: '14px 20px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: 500, borderBottom: '3px solid transparent', transition: 'all .2s' },
  tabActive: { color: '#D4A843', borderBottomColor: '#D4A843' },
  main: { maxWidth: 1280, margin: '0 auto', padding: '28px 24px' },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 },
  badge: { background: '#D4A84322', color: '#D4A843', padding: '2px 10px', borderRadius: 20, fontSize: 13 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  statCard: { background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid #1e293b', borderRadius: 16, padding: '24px 20px', textAlign: 'center', transition: 'transform .2s', cursor: 'default' },
  statValue: { fontSize: 36, fontWeight: 800, marginTop: 8 },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  quickActions: { background: '#0f172a', borderRadius: 16, border: '1px solid #1e293b', padding: 24 },
  actionRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  rowBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  filterRow: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  select: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '8px 12px', fontSize: 13 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid #1e293b' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { background: '#0f172a', padding: '12px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #1e293b', transition: 'background .15s' },
  td: { padding: '11px 14px', color: '#e2e8f0', verticalAlign: 'middle' },
  countryBadge: { padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
  greenBadge: { background: '#22c55e22', color: '#22c55e', padding: '3px 10px', borderRadius: 12, fontSize: 12 },
  pagination: { display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  userCard: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  userHeader: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background .2s' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 14 },
  userAvatar: { width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #D4A843, #f5d68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#080e1a', fontSize: 18 },
  userName: { fontWeight: 600, color: '#e2e8f0', fontSize: 15 },
  userEmail: { color: '#64748b', fontSize: 13 },
  userMeta: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  planBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  userExpanded: { padding: '0 20px 18px', borderTop: '1px solid #1e293b' },
  botRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: '#080e1a', borderRadius: 8, marginBottom: 6, fontSize: 13 },
  searchInput: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '8px 16px', fontSize: 13, width: 280 },
  loader: { textAlign: 'center', color: '#64748b', padding: 40, fontSize: 16 },
  // Modals
  modalOverlay: { position: 'fixed', inset: 0, background: '#000a', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#0f172a', border: '1px solid #334155', borderRadius: 20, padding: 28, maxWidth: 680, width: '100%', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#D4A843', marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' },
  formField: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 },
  input: { background: '#080e1a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '9px 12px', fontSize: 14 },
  // Buttons
  btnGold: { background: 'linear-gradient(135deg, #D4A843, #b8891f)', color: '#080e1a', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  btnBlue: { background: '#1d4ed833', color: '#60a5fa', border: '1px solid #1d4ed866', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnPurple: { background: '#7c3aed22', color: '#a78bfa', border: '1px solid #7c3aed44', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnGreen: { background: '#15803d22', color: '#34d399', border: '1px solid #15803d44', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnGhost: { background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnDanger: { background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
};
