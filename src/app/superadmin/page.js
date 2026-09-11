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
  const [tab, setTab] = useState('clients'); // Default to Clients & Chatbots as requested
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propTotal, setPropTotal] = useState(0);
  const [propPage, setPropPage] = useState(1);
  const [propFilter, setPropFilter] = useState({ country: '', city: '', type: '' });
  const [cache, setCache] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [addPropModal, setAddPropModal] = useState(false);
  const [delPropId, setDelPropId] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userBots, setUserBots] = useState({});
  const [botsLoading, setBotsLoading] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [search, setSearch] = useState('');
  const [origin, setOrigin] = useState('');

  // Modals
  const [addClientModal, setAddClientModal] = useState(false);
  const [addClientForm, setAddClientForm] = useState({ name: '', email: '', password: '', phone: '', website_url: '' });
  const [codeModal, setCodeModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [assignForm, setAssignForm] = useState({ plan: 'premium', cycle: 'monthly', note: '' });
  const [copied, setCopied] = useState(false);

  // blank property form
  const emptyProp = { country: 'UAE', city: 'Dubai', area_district: '', property_type: 'Apartment', bedrooms: 2, bathrooms: 2, area_sqft: 1200, price: '', currency: 'AED', source_url: '', agent_name: '', images: [] };
  const [propForm, setPropForm] = useState(emptyProp);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // toast helper
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  // ── fetch stats ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoad('stats', true);
    try {
      const r = await fetch('/api/gulf-admin/stats');
      if (r.ok) setStats(await r.json());
    } catch (e) {
      console.error(e);
    }
    setLoad('stats', false);
  }, []);

  // ── fetch properties ─────────────────────────────────────────────────────────
  const fetchProperties = useCallback(async (page = 1, filter = propFilter) => {
    setLoad('props', true);
    const p = new URLSearchParams({ page, ...filter });
    const r = await fetch(`/api/gulf-admin/properties?${p}`);
    if (r.ok) {
      const d = await r.json();
      setProperties(d.properties || []);
      setPropTotal(d.total || 0);
    }
    setLoad('props', false);
  }, [propFilter]);

  // ── fetch cache ──────────────────────────────────────────────────────────────
  const fetchCache = useCallback(async () => {
    setLoad('cache', true);
    const r = await fetch('/api/gulf-admin/cache');
    if (r.ok) setCache((await r.json()).cache || []);
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
    setBotsLoading(p => ({ ...p, [userId]: true }));
    const { data } = await supabase.from('bots').select('*').eq('user_id', userId);
    setUserBots(p => ({ ...p, [userId]: data || [] }));
    setBotsLoading(p => ({ ...p, [userId]: false }));
  };

  // initial load
  useEffect(() => { fetchStats(); fetchUsers(); }, [fetchStats, fetchUsers]);
  useEffect(() => { if (tab === 'properties') fetchProperties(1); }, [tab, fetchProperties]);
  useEffect(() => { if (tab === 'cache') fetchCache(); }, [tab, fetchCache]);
  useEffect(() => { if (tab === 'clients') fetchUsers(); }, [tab, fetchUsers]);

  // ── Add Client & Create Bot ──────────────────────────────────────────────────
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!addClientForm.name || !addClientForm.email || !addClientForm.password || !addClientForm.website_url) {
      showToast('Please fill in Name, Email, Password, and Website URL', false);
      return;
    }
    setLoad('addingClient', true);
    try {
      const r = await fetch('/api/superadmin/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addClientForm),
      });
      const data = await r.json();
      if (r.ok && data.success) {
        showToast('Client & AI Chatbot created successfully! 🎉');
        setAddClientModal(false);
        setAddClientForm({ name: '', email: '', password: '', phone: '', website_url: '' });
        await fetchUsers();
        await fetchStats();
        // Immediately open the embed code modal for the new chatbot
        if (data.bot) {
          setCodeModal(data.bot);
        }
      } else {
        showToast(data.error || 'Failed to create client', false);
      }
    } catch (err) {
      showToast(err.message, false);
    }
    setLoad('addingClient', false);
  };

  // ── Create Bot for Existing Client ───────────────────────────────────────────
  const handleCreateBotForUser = async (userId, userEmail, userWebsite) => {
    setLoad(`createBot_${userId}`, true);
    try {
      const r = await fetch('/api/superadmin/create-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: `${userEmail.split('@')[0]} Assistant`,
          website_url: userWebsite || '',
        }),
      });
      const data = await r.json();
      if (r.ok && data.success) {
        showToast('Chatbot created! ✅');
        await fetchUserBots(userId);
        if (data.bot) setCodeModal(data.bot);
      } else {
        showToast(data.error || 'Failed to create bot', false);
      }
    } catch (err) {
      showToast(err.message, false);
    }
    setLoad(`createBot_${userId}`, false);
  };

  // ── Toggle Bot Status ────────────────────────────────────────────────────────
  const toggleBotStatus = async (bot, userId) => {
    const newStatus = bot.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const r = await fetch('/api/superadmin/toggle-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: bot.id, status: newStatus }),
      });
      if (r.ok) {
        showToast(`Bot ${newStatus === 'Active' ? 'Activated 🟢' : 'Deactivated 🔴'}`);
        fetchUserBots(userId);
      } else {
        showToast('Failed to toggle bot', false);
      }
    } catch (err) {
      showToast(err.message, false);
    }
  };

  // ── Fix Bot Links ────────────────────────────────────────────────────────────
  const handleFixLinks = async () => {
    setLoad('fixingLinks', true);
    try {
      const r = await fetch('/api/superadmin/fix-bot-links', { method: 'POST' });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message || `Fixed ${data.fixed || 0} client-bot links ✅`);
        fetchUsers();
      } else {
        showToast(data.error || 'Failed to fix links', false);
      }
    } catch (err) {
      showToast(err.message, false);
    }
    setLoad('fixingLinks', false);
  };

  // ── Fix All Live Bots (Industry = Real Estate) ────────────────────────────────
  const handleFixAllBots = async () => {
    setLoad('fixingBots', true);
    try {
      const r = await fetch('/api/superadmin/fix-all-bots', { method: 'POST' });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message || `Fixed ${data.fixed || 0} bots to Real Estate ✅`);
        fetchUsers();
      } else {
        showToast(data.error || 'Failed to fix bots', false);
      }
    } catch (err) {
      showToast(err.message, false);
    }
    setLoad('fixingBots', false);
  };

  // ── Assign Plan ──────────────────────────────────────────────────────────────
  const handleAssignPlan = async () => {
    if (!assignModal?.userId) return;
    setLoad('assigning', true);
    try {
      const r = await fetch('/api/superadmin/assign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: assignModal.userId,
          plan: assignForm.plan,
          cycle: assignForm.cycle,
          note: assignForm.note,
        }),
      });
      const data = await r.json();
      if (r.ok && data.success) {
        showToast('Plan updated successfully ✅');
        setAssignModal(null);
        fetchUsers();
      } else {
        showToast(data.error || 'Failed to assign plan', false);
      }
    } catch (err) {
      showToast(err.message, false);
    }
    setLoad('assigning', false);
  };

  // ── Copy Embed Code ──────────────────────────────────────────────────────────
  const getEmbedSnippet = (bot) => {
    const baseUrl = origin || 'https://chatbot-uae-sa.vercel.app';
    return `<!-- AI Chatbot by Gulf Real Estate -->
<script>
  window.CHATBOT_CONFIG = {
    botId: "${bot?.id || ''}",
    welcomeMessage: "${bot?.welcome_message ? bot.welcome_message.replace(/"/g, '\\"') : 'Hi there! 👋 Looking for property in UAE or Saudi Arabia?'}"
  };
</script>
<script src="${baseUrl}/chatbot-embed.js" defer></script>`;
  };

  const copyEmbedCode = (bot) => {
    const code = getEmbedSnippet(bot);
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('Code copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Reset Trial ──────────────────────────────────────────────────────────────
  const resetTrial = async userId => {
    const r = await fetch('/api/superadmin/reset-trial', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, days: 15 }),
    });
    if ((await r.json()).success) { showToast('Trial reset to 15 days ✅'); fetchUsers(); }
    else showToast('Reset failed', false);
  };

  // ── Toggle User Status ───────────────────────────────────────────────────────
  const toggleUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await fetch('/api/superadmin/toggle-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: newStatus }),
    });
    fetchUsers();
  };

  // ── Delete User ──────────────────────────────────────────────────────────────
  const deleteUser = async (userId, email) => {
    if (!window.confirm(`Delete client "${email}" and all their chatbots? This cannot be undone!`)) return;
    const r = await fetch('/api/superadmin/delete-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (r.ok) { showToast('User deleted ✅'); fetchUsers(); fetchStats(); }
    else showToast('Delete failed', false);
  };

  // ── Add Property ─────────────────────────────────────────────────────────────
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

  // ── Delete Property ──────────────────────────────────────────────────────────
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

  // ── Clear Cache ──────────────────────────────────────────────────────────────
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

  const trialDays = user => {
    if (!user.trial_ends_at) return null;
    const d = Math.ceil((new Date(user.trial_ends_at) - Date.now()) / 86400000);
    return d;
  };

  const filteredUsers = users.filter(u =>
    !search ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.website_url || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.plan || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeUsersCount = users.filter(u => (u.status || 'Active') === 'Active').length;
  const premiumUsersCount = users.filter(u => (u.plan || '').toLowerCase() === 'premium' || (u.plan || '').toLowerCase() === 'pro').length;

  return (
    <div style={S.page}>
      {/* ── Toast ── */}
      {toast && (
        <div style={{ ...S.toast, background: toast.ok ? '#10b981' : '#ef4444' }}>
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
              <div style={S.logoSub}>Super Admin Control Center</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={S.headerFlags}>🇦🇪 UAE &nbsp;&nbsp; 🇸🇦 Saudi Arabia</div>
            <button
              onClick={() => {
                sessionStorage.removeItem('superadmin_auth');
                window.location.reload();
              }}
              style={S.btnGhostSmall}
              title="Lock Admin Panel"
            >
              🔒 Lock
            </button>
          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <nav style={S.nav}>
        {[
          { id: 'clients', label: '🤖 Clients & Chatbots', count: users.length },
          { id: 'overview', label: '📊 Overview' },
          { id: 'properties', label: '🏘️ Properties', count: propTotal || stats?.totalProperties },
          { id: 'cache', label: '🗄️ City Cache', count: cache.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}>
            {t.label}
            {t.count !== undefined && <span style={tab === t.id ? S.tabBadgeActive : S.tabBadge}>{t.count}</span>}
          </button>
        ))}
      </nav>

      <main style={S.main}>

        {/* ══════════════════════════════════════════════════════════════════════
            1. CLIENTS & CHATBOTS (Image 2 style with Embed Code Generator)
        ══════════════════════════════════════════════════════════════════════ */}
        {tab === 'clients' && (
          <div>
            {/* Top Title & Primary Actions */}
            <div style={S.clientsHeaderRow}>
              <div>
                <h1 style={S.sectionHeading}>Clients &amp; Chatbots</h1>
                <p style={S.sectionSub}>Manage clients, passwords, active subscriptions, and generate website embed codes.</p>
              </div>
              <div style={S.actionBtnGroup}>
                <button
                  style={S.btnPrimaryGold}
                  onClick={() => setAddClientModal(true)}
                  id="add-client-btn"
                >
                  <span style={{ fontSize: 16 }}>＋</span> Add Client &amp; Bot
                </button>
                <button
                  style={S.btnSecondary}
                  onClick={() => { fetchUsers(); fetchStats(); showToast('Refreshed ✅'); }}
                >
                  🔄 Refresh
                </button>
                <button
                  style={S.btnSecondary}
                  onClick={handleFixLinks}
                  disabled={loading.fixingLinks}
                  title="Link bots without user_subscription bot_id"
                >
                  🔗 {loading.fixingLinks ? 'Fixing…' : 'Fix Links'}
                </button>
                <button
                  style={S.btnSecondaryGreen}
                  onClick={handleFixAllBots}
                  disabled={loading.fixingBots}
                  title="Ensure all bots have industry = Real Estate"
                >
                  ✨ {loading.fixingBots ? 'Fixing…' : 'Fix All Live Bots'}
                </button>
              </div>
            </div>

            {/* 3 Metric Cards Strip (exact matching Image 2) */}
            <div style={S.metricsGrid}>
              <div style={S.metricCard}>
                <div style={S.metricLabel}>TOTAL CLIENTS</div>
                <div style={{ ...S.metricValue, color: '#f8fafc' }}>{users.length}</div>
              </div>
              <div style={S.metricCard}>
                <div style={S.metricLabel}>ACTIVE ACCOUNTS</div>
                <div style={{ ...S.metricValue, color: '#10b981' }}>{activeUsersCount}</div>
              </div>
              <div style={S.metricCard}>
                <div style={S.metricLabel}>PREMIUM SUBSCRIBERS</div>
                <div style={{ ...S.metricValue, color: '#D4A843' }}>{premiumUsersCount}</div>
              </div>
            </div>

            {/* Search Filter Input */}
            <div style={{ marginBottom: 20 }}>
              <div style={S.searchWrap}>
                <span style={{ fontSize: 16, color: '#64748b' }}>🔍</span>
                <input
                  style={S.searchField}
                  placeholder="Search clients by email, website, or plan..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={S.searchClear}>✕</button>
                )}
              </div>
            </div>

            {/* Client List */}
            {loading.users ? (
              <div style={S.loader}>Loading clients and chatbots…</div>
            ) : filteredUsers.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>No clients found</div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Click "+ Add Client &amp; Bot" above to onboard your first client.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredUsers.map(u => {
                  const days = trialDays(u);
                  const expanded = expandedUser === u.user_id;
                  const isPremium = (u.plan || '').toLowerCase() === 'premium' || (u.plan || '').toLowerCase() === 'pro';
                  const bots = userBots[u.user_id] || [];

                  return (
                    <div key={u.user_id} style={{ ...S.clientCard, borderColor: expanded ? '#D4A84366' : '#1e293b' }}>
                      {/* Main Client Row */}
                      <div
                        style={S.clientRow}
                        onClick={() => {
                          const nextState = expanded ? null : u.user_id;
                          setExpandedUser(nextState);
                          if (nextState && !userBots[u.user_id]) {
                            fetchUserBots(u.user_id);
                          }
                        }}
                      >
                        {/* Left: Avatar + Email + Subtitle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={S.clientAvatar}>
                            {(u.email || u.name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={S.clientEmail}>{u.email}</span>
                              <span style={S.clickDetailsText}>
                                {expanded ? '▲ Collapse' : '▼ Click for Details'}
                              </span>
                            </div>
                            <div style={S.clientMetaSub}>
                              <span>Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span>
                              <span style={{ color: '#475569' }}>•</span>
                              <span style={{ color: isPremium ? '#D4A843' : '#94a3b8', fontWeight: 700 }}>
                                {isPremium ? '⭐ Premium' : '📦 Standard'}
                              </span>
                              {days !== null && (
                                <>
                                  <span style={{ color: '#475569' }}>•</span>
                                  <span style={{ color: days > 0 ? '#34d399' : '#f87171' }}>
                                    {days > 0 ? `${days}d trial` : 'Trial ended'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions (Login as Client, Status Toggle, Delete) */}
                        <div style={S.clientActions} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              localStorage.setItem('impersonated_user_id', u.user_id);
                              localStorage.setItem('impersonated_user_email', u.email);
                              window.location.href = '/dashboard';
                            }}
                            style={S.btnLoginClient}
                            title="Log into client's portal"
                          >
                            <span>👤</span> Login as Client
                          </button>

                          <button
                            onClick={() => toggleUser(u.user_id, u.status || 'Active')}
                            style={{
                              ...S.btnStatusToggle,
                              background: u.status === 'Inactive' ? '#ef444422' : '#10b98122',
                              color: u.status === 'Inactive' ? '#f87171' : '#34d399',
                              border: `1px solid ${u.status === 'Inactive' ? '#ef444444' : '#10b98144'}`,
                            }}
                          >
                            {u.status === 'Inactive' ? '🔴 Inactive' : '🟢 Active'}
                          </button>

                          <button
                            onClick={() => deleteUser(u.user_id, u.email)}
                            style={S.btnDeleteUser}
                            title="Delete client"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {/* Expanded Drawer: Client Details & Assigned AI Chatbots */}
                      {expanded && (
                        <div style={S.expandedDrawer}>
                          {/* Top: Credentials & Plan Information Grid */}
                          <div style={S.drawerGrid}>
                            {/* Box 1: Credentials & Contact */}
                            <div style={S.drawerBox}>
                              <div style={S.boxHeading}>🔐 Account &amp; Access Details</div>
                              <div style={S.infoItem}>
                                <span style={S.infoLabel}>Client Name:</span>
                                <span style={S.infoVal}>{u.name || '—'}</span>
                              </div>
                              <div style={S.infoItem}>
                                <span style={S.infoLabel}>Website:</span>
                                <span style={S.infoVal}>
                                  {u.website_url ? (
                                    <a href={u.website_url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                                      {u.website_url} ↗
                                    </a>
                                  ) : '—'}
                                </span>
                              </div>
                              <div style={S.infoItem}>
                                <span style={S.infoLabel}>Plain Password:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontFamily: 'monospace', color: '#D4A843', fontWeight: 700 }}>
                                    {showPassword[u.user_id] ? (u.plain_password || 'Not recorded') : '••••••••'}
                                  </span>
                                  <button
                                    onClick={() => setShowPassword(p => ({ ...p, [u.user_id]: !p[u.user_id] }))}
                                    style={S.btnIconGhost}
                                    title={showPassword[u.user_id] ? 'Hide' : 'Show'}
                                  >
                                    {showPassword[u.user_id] ? '🙈' : '👁️'}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Box 2: Subscription Controls */}
                            <div style={S.drawerBox}>
                              <div style={S.boxHeading}>💳 Subscription Controls</div>
                              <div style={S.infoItem}>
                                <span style={S.infoLabel}>Current Plan:</span>
                                <span style={{ ...S.infoVal, textTransform: 'capitalize', color: '#D4A843', fontWeight: 700 }}>
                                  {u.plan || 'starter'} ({u.billing_cycle || 'monthly'})
                                </span>
                              </div>
                              <div style={S.infoItem}>
                                <span style={S.infoLabel}>Trial Expiry:</span>
                                <span style={S.infoVal}>{u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString() : '—'}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                <button
                                  style={S.btnGoldSmall}
                                  onClick={() => resetTrial(u.user_id)}
                                >
                                  🔄 Reset Trial (15 Days)
                                </button>
                                <button
                                  style={S.btnBlueSmall}
                                  onClick={() => {
                                    setAssignModal({ userId: u.user_id, email: u.email });
                                    setAssignForm({ plan: isPremium ? 'pro' : 'starter', cycle: u.billing_cycle || 'monthly', note: '' });
                                  }}
                                >
                                  💳 Change Plan
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Chatbots Section */}
                          <div style={S.botSectionWrap}>
                            <div style={S.botSectionHeader}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 18 }}>🤖</span>
                                <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: 15 }}>
                                  AI Chatbots Assigned to this Client
                                </span>
                                <span style={S.badge}>{bots.length} Bot(s)</span>
                              </div>
                              <button
                                style={S.btnGoldSmall}
                                onClick={() => handleCreateBotForUser(u.user_id, u.email, u.website_url)}
                                disabled={loading[`createBot_${u.user_id}`]}
                              >
                                {loading[`createBot_${u.user_id}`] ? 'Creating…' : '＋ Create Chatbot'}
                              </button>
                            </div>

                            {botsLoading[u.user_id] ? (
                              <div style={S.loader}>Loading chatbots…</div>
                            ) : bots.length === 0 ? (
                              <div style={S.emptyBotCard}>
                                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>
                                  No chatbots found for this client yet.
                                </div>
                                <button
                                  style={S.btnGoldSmall}
                                  onClick={() => handleCreateBotForUser(u.user_id, u.email, u.website_url)}
                                  disabled={loading[`createBot_${u.user_id}`]}
                                >
                                  ＋ Generate AI Chatbot for this Client
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {bots.map(b => (
                                  <div key={b.id} style={S.botCard}>
                                    {/* Left: Avatar & Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                      <div style={S.botAvatar}>
                                        {b.bot_avatar || '🌴'}
                                      </div>
                                      <div>
                                        <div style={S.botTitle}>{b.name || 'AI Assistant'}</div>
                                        <div style={S.botSubline}>
                                          <span>🌐 {b.website_url || 'No URL'}</span>
                                          <span style={{ color: '#334155' }}>•</span>
                                          <span style={S.industryBadge}>🏡 Real Estate</span>
                                          <span style={{ color: '#334155' }}>•</span>
                                          <span style={{ color: '#64748b', fontSize: 11 }}>ID: {b.id.slice(0, 8)}…</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right: Actions — GET CODE (Main feature), Toggle, Test */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                      <span style={{
                                        ...S.badge,
                                        background: b.status === 'Active' ? '#10b98122' : '#ef444422',
                                        color: b.status === 'Active' ? '#34d399' : '#f87171',
                                      }}>
                                        {b.status === 'Active' ? '🟢 Active' : '🔴 Inactive'}
                                      </span>

                                      {/* PRIMARY ACTION: Get Code */}
                                      <button
                                        onClick={() => setCodeModal(b)}
                                        style={S.btnGetCode}
                                        title="Get Website Embed Code"
                                      >
                                        📋 Get Code
                                      </button>

                                      <button
                                        onClick={() => toggleBotStatus(b, u.user_id)}
                                        style={b.status === 'Active' ? S.btnGhostSmall : S.btnGreenSmall}
                                      >
                                        {b.status === 'Active' ? 'Deactivate' : '✓ Activate'}
                                      </button>

                                      <a
                                        href={`/bot/${b.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={S.btnGhostSmallLink}
                                        title="Test chatbot preview"
                                      >
                                        🚀 Test Live
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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

        {/* ══════════════════════════════════════════════════════════════════════
            2. OVERVIEW
        ══════════════════════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div>
            <div style={S.sectionTitle}>System Overview</div>
            {loading.stats ? <div style={S.loader}>Loading stats…</div> : (
              <div style={S.statsGrid}>
                {[
                  { icon: '🏠', label: 'Gulf Properties', value: fmt(stats?.totalProperties), color: '#D4A843' },
                  { icon: '🏙️', label: 'Cities Covered', value: fmt(stats?.uniqueCities), color: '#60a5fa' },
                  { icon: '⚡', label: 'Cached Cities', value: fmt(stats?.cachedCities), color: '#34d399' },
                  { icon: '👤', label: 'Total Clients', value: fmt(users.length || stats?.totalUsers), color: '#a78bfa' },
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
                <button style={S.btnGold} onClick={() => setAddClientModal(true)}>＋ Add Client &amp; Bot</button>
                <button style={S.btnGold} onClick={() => { setTab('properties'); setAddPropModal(true); }}>＋ Add Gulf Property</button>
                <button style={S.btnBlue} onClick={() => setTab('clients')}>👥 Manage Clients &amp; Bots</button>
                <button style={S.btnPurple} onClick={() => setTab('cache')}>🗄️ Manage Cache</button>
                <button style={S.btnGreen} onClick={() => { fetchStats(); fetchUsers(); showToast('Stats refreshed ✅'); }}>🔄 Refresh Stats</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            3. PROPERTIES
        ══════════════════════════════════════════════════════════════════════ */}
        {tab === 'properties' && (
          <div>
            <div style={S.rowBetween}>
              <div style={S.sectionTitle}>Gulf Properties <span style={S.badge}>{fmt(propTotal)}</span></div>
              <button style={S.btnGold} onClick={() => setAddPropModal(true)}>＋ Add Property</button>
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

            {loading.props ? <div style={S.loader}>Loading properties…</div> : (
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

        {/* ══════════════════════════════════════════════════════════════════════
            4. CACHE
        ══════════════════════════════════════════════════════════════════════ */}
        {tab === 'cache' && (
          <div>
            <div style={S.rowBetween}>
              <div style={S.sectionTitle}>City Cache <span style={S.badge}>{cache.length}</span></div>
              <button style={S.btnDanger} onClick={() => clearCache()} disabled={loading.clearCache}>
                {loading.clearCache ? '…' : '🗑️ Clear All Cache'}
              </button>
            </div>
            {loading.cache ? <div style={S.loader}>Loading cache…</div> : (
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

      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: EMBED CODE (Requested Primary Feature)
      ══════════════════════════════════════════════════════════════════════ */}
      {codeModal && (
        <div style={S.modalOverlay} onClick={() => setCodeModal(null)}>
          <div style={{ ...S.modal, maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>📋</span>
                  <div style={S.modalTitle}>Website Embed Code</div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                  Bot: <b style={{ color: '#D4A843' }}>{codeModal.name}</b> &nbsp;|&nbsp; ID: <code style={{ color: '#60a5fa' }}>{codeModal.id}</code>
                </div>
              </div>
              <button onClick={() => setCodeModal(null)} style={S.modalCloseBtn}>✕</button>
            </div>

            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>
              Paste this HTML snippet into the client's website just before the closing <code>&lt;/body&gt;</code> tag:
            </p>

            <div style={S.codeBox}>
              <textarea
                readOnly
                rows={9}
                value={getEmbedSnippet(codeModal)}
                style={S.codeTextarea}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button
                style={{ ...S.btnPrimaryGold, flex: 1 }}
                onClick={() => copyEmbedCode(codeModal)}
              >
                {copied ? '✅ Copied to Clipboard!' : '📋 Copy Embed Code'}
              </button>

              <a
                href={`/bot/${codeModal.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ ...S.btnBlue, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                🚀 Test / Preview Chatbot
              </a>

              <button style={S.btnGhost} onClick={() => setCodeModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ADD CLIENT & CHATBOT
      ══════════════════════════════════════════════════════════════════════ */}
      {addClientModal && (
        <div style={S.modalOverlay} onClick={() => setAddClientModal(false)}>
          <div style={{ ...S.modal, maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>✨</span>
                <div style={S.modalTitle}>Add Client &amp; AI Chatbot</div>
              </div>
              <button onClick={() => setAddClientModal(false)} style={S.modalCloseBtn}>✕</button>
            </div>

            <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={S.formField}>
                <label style={S.label}>Client / Agency Name *</label>
                <input
                  style={S.input}
                  placeholder="e.g. Emaar Luxury Properties"
                  value={addClientForm.name}
                  onChange={e => setAddClientForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div style={S.formField}>
                <label style={S.label}>Email Address *</label>
                <input
                  style={S.input}
                  type="email"
                  placeholder="client@agency.ae"
                  value={addClientForm.email}
                  onChange={e => setAddClientForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>

              <div style={S.formField}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={S.label}>Password *</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#D4A843', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => {
                      const gen = 'GulfPass!' + Math.floor(1000 + Math.random() * 9000);
                      setAddClientForm(p => ({ ...p, password: gen }));
                    }}
                  >
                    🎲 Generate Password
                  </button>
                </div>
                <input
                  style={S.input}
                  placeholder="Client portal password"
                  value={addClientForm.password}
                  onChange={e => setAddClientForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>

              <div style={S.formField}>
                <label style={S.label}>Client Website URL *</label>
                <input
                  style={S.input}
                  placeholder="https://agency.ae"
                  value={addClientForm.website_url}
                  onChange={e => setAddClientForm(p => ({ ...p, website_url: e.target.value }))}
                  required
                />
              </div>

              <div style={S.formField}>
                <label style={S.label}>Phone / WhatsApp (Optional)</label>
                <input
                  style={S.input}
                  placeholder="+971 50 123 4567"
                  value={addClientForm.phone}
                  onChange={e => setAddClientForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div style={{ background: '#1e293b55', padding: 12, borderRadius: 10, border: '1px solid #1e293b', marginTop: 4 }}>
                <div style={{ color: '#D4A843', fontSize: 12, fontWeight: 700 }}>🌴 Automatic Setup:</div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 3 }}>
                  Creating this client will automatically generate their <b>Gulf Real Estate AI Chatbot</b> with embed code ready to paste into their website!
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  type="submit"
                  style={{ ...S.btnPrimaryGold, flex: 1 }}
                  disabled={loading.addingClient}
                >
                  {loading.addingClient ? 'Creating Client & Bot…' : '✨ Create Client & AI Chatbot'}
                </button>
                <button type="button" style={S.btnGhost} onClick={() => setAddClientModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ASSIGN / CHANGE PLAN
      ══════════════════════════════════════════════════════════════════════ */}
      {assignModal && (
        <div style={S.modalOverlay} onClick={() => setAssignModal(null)}>
          <div style={{ ...S.modal, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={S.modalTitle}>💳 Change Subscription Plan</div>
              <button onClick={() => setAssignModal(null)} style={S.modalCloseBtn}>✕</button>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
              Client: <b style={{ color: '#e2e8f0' }}>{assignModal.email}</b>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={S.formField}>
                <label style={S.label}>Plan</label>
                <select
                  style={S.input}
                  value={assignForm.plan}
                  onChange={e => setAssignForm(p => ({ ...p, plan: e.target.value }))}
                >
                  <option value="starter">Starter / Standard</option>
                  <option value="pro">Premium / Pro</option>
                </select>
              </div>

              <div style={S.formField}>
                <label style={S.label}>Billing Cycle</label>
                <select
                  style={S.input}
                  value={assignForm.cycle}
                  onChange={e => setAssignForm(p => ({ ...p, cycle: e.target.value }))}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div style={S.formField}>
                <label style={S.label}>Note (Optional)</label>
                <input
                  style={S.input}
                  placeholder="e.g. VIP client free override"
                  value={assignForm.note}
                  onChange={e => setAssignForm(p => ({ ...p, note: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  style={{ ...S.btnPrimaryGold, flex: 1 }}
                  onClick={handleAssignPlan}
                  disabled={loading.assigning}
                >
                  {loading.assigning ? 'Saving…' : 'Save Plan'}
                </button>
                <button style={S.btnGhost} onClick={() => setAssignModal(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ADD PROPERTY
      ══════════════════════════════════════════════════════════════════════ */}
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
  toast: { position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '14px 22px', borderRadius: 10, color: '#fff', fontWeight: 600, boxShadow: '0 8px 30px #000a', fontSize: 14 },
  header: { background: 'linear-gradient(135deg, #0d1b2a 0%, #132238 50%, #0d1b2a 100%)', borderBottom: '1px solid #D4A84333', padding: '0 0' },
  headerInner: { maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: { fontSize: 36, filter: 'drop-shadow(0 0 12px #D4A843)' },
  logoTitle: { fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg, #D4A843, #f5d68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoSub: { fontSize: 12, color: '#64748b', letterSpacing: 0.5 },
  headerFlags: { fontSize: 14, color: '#94a3b8', fontWeight: 600 },
  nav: { maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 8, borderBottom: '1px solid #1e293b' },
  tab: { padding: '14px 18px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: 600, borderBottom: '3px solid transparent', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s' },
  tabActive: { color: '#D4A843', borderBottomColor: '#D4A843' },
  tabBadge: { background: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  tabBadgeActive: { background: '#D4A84333', color: '#D4A843', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  main: { maxWidth: 1280, margin: '0 auto', padding: '28px 24px' },
  sectionHeading: { fontSize: 24, fontWeight: 800, color: '#f8fafc', margin: 0 },
  sectionSub: { fontSize: 13, color: '#64748b', margin: '4px 0 0' },
  clientsHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  actionBtnGroup: { display: 'flex', gap: 10, flexWrap: 'wrap' },

  // Metrics Strip
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 },
  metricCard: { background: 'linear-gradient(135deg, #0f172a, #152238)', border: '1px solid #1e293b', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 8px #0002' },
  metricLabel: { fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: 0.8 },
  metricValue: { fontSize: 32, fontWeight: 800, marginTop: 6 },

  // Search
  searchWrap: { display: 'flex', alignItems: 'center', gap: 10, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '10px 16px', maxWidth: '100%' },
  searchField: { background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', fontSize: 14, width: '100%' },
  searchClear: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14 },

  // Client Cards
  clientCard: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden', transition: 'all .2s' },
  clientRow: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', flexWrap: 'wrap', gap: 12 },
  clientAvatar: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 18, flexShrink: 0 },
  clientEmail: { fontSize: 15, fontWeight: 700, color: '#f8fafc' },
  clickDetailsText: { fontSize: 12, color: '#64748b', fontWeight: 500 },
  clientMetaSub: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', marginTop: 4, flexWrap: 'wrap' },
  clientActions: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },

  // Client Buttons
  btnLoginClient: { background: '#ffffff', color: '#3b82f6', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px #0003' },
  btnStatusToggle: { padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  btnDeleteUser: { background: '#ef444415', color: '#ef4444', border: '1px solid #ef444433', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },

  // Drawer
  expandedDrawer: { padding: '0 20px 20px', borderTop: '1px solid #1e293b', background: '#0a101f' },
  drawerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, paddingTop: 18, marginBottom: 18 },
  drawerBox: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 16 },
  boxHeading: { fontSize: 13, fontWeight: 800, color: '#e2e8f0', marginBottom: 12 },
  infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 8, color: '#94a3b8' },
  infoLabel: { fontWeight: 600, color: '#64748b' },
  infoVal: { color: '#f8fafc', fontWeight: 600 },

  // Bot Section
  botSectionWrap: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 18 },
  botSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  botCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#080e1a', border: '1px solid #1e293b', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap', gap: 12 },
  botAvatar: { width: 40, height: 40, borderRadius: '50%', background: '#D4A84322', border: '1px solid #D4A84355', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  botTitle: { fontSize: 14, fontWeight: 800, color: '#f8fafc' },
  botSubline: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', marginTop: 3, flexWrap: 'wrap' },
  industryBadge: { background: '#10b98122', color: '#34d399', padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 },
  emptyBotCard: { textAlign: 'center', padding: '24px 16px', background: '#080e1a', borderRadius: 10, border: '1px dashed #1e293b' },

  // Embed Code Button (High Priority)
  btnGetCode: { background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px #4f46e544' },

  // Other Buttons
  btnPrimaryGold: { background: 'linear-gradient(135deg, #D4A843, #b8891f)', color: '#080e1a', border: 'none', padding: '10px 18px', borderRadius: 9, cursor: 'pointer', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px #D4A84333' },
  btnSecondary: { background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '9px 15px', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnSecondaryGreen: { background: '#10b98118', border: '1px solid #10b98144', color: '#34d399', padding: '9px 15px', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  btnGoldSmall: { background: '#D4A84322', color: '#D4A843', border: '1px solid #D4A84355', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 11 },
  btnBlueSmall: { background: '#3b82f622', color: '#60a5fa', border: '1px solid #3b82f644', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 11 },
  btnGreenSmall: { background: '#10b98122', color: '#34d399', border: '1px solid #10b98144', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 11 },
  btnGhostSmall: { background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 600, fontSize: 11 },
  btnGhostSmallLink: { background: 'transparent', color: '#60a5fa', border: '1px solid #3b82f644', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 600, fontSize: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' },
  btnIconGhost: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 2 },

  // Overview / Properties Styles
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 },
  badge: { background: '#D4A84322', color: '#D4A843', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  statCard: { background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid #1e293b', borderRadius: 16, padding: '24px 20px', textAlign: 'center' },
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
  tr: { borderBottom: '1px solid #1e293b' },
  td: { padding: '11px 14px', color: '#e2e8f0', verticalAlign: 'middle' },
  countryBadge: { padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
  greenBadge: { background: '#22c55e22', color: '#22c55e', padding: '3px 10px', borderRadius: 12, fontSize: 12 },
  pagination: { display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  loader: { textAlign: 'center', color: '#64748b', padding: 40, fontSize: 15 },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#0f172a', borderRadius: 16, border: '1px dashed #1e293b' },

  // Modals
  modalOverlay: { position: 'fixed', inset: 0, background: '#000c', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' },
  modal: { background: '#0f172a', border: '1px solid #D4A84344', borderRadius: 20, padding: 28, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px #000c' },
  modalTitle: { fontSize: 20, fontWeight: 800, color: '#f8fafc', margin: 0 },
  modalCloseBtn: { background: '#1e293b', border: 'none', color: '#94a3b8', width: 32, height: 32, borderRadius: '50%', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' },
  formField: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 },
  input: { background: '#080e1a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', padding: '10px 12px', fontSize: 14, outline: 'none' },
  codeBox: { background: '#080e1a', borderRadius: 10, border: '1px solid #1e293b', overflow: 'hidden' },
  codeTextarea: { width: '100%', padding: 14, background: 'transparent', border: 'none', color: '#38bdf8', fontFamily: "'Fira Code', monospace", fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box' },

  // Standard Buttons
  btnGold: { background: 'linear-gradient(135deg, #D4A843, #b8891f)', color: '#080e1a', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  btnBlue: { background: '#1d4ed833', color: '#60a5fa', border: '1px solid #1d4ed866', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnPurple: { background: '#7c3aed22', color: '#a78bfa', border: '1px solid #7c3aed44', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnGreen: { background: '#15803d22', color: '#34d399', border: '1px solid #15803d44', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnGhost: { background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnDanger: { background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
};
