'use client';
import { useState, useEffect } from 'react';
import { analyticsAPI, aiAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0a1628', '#c9a84c', '#1a3460', '#e8c97a', '#112240', '#f5e6c0'];

export default function AnalyticsDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [byDept, setByDept] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => { await logout(); router.push('/login'); };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dept, status, category, hot] = await Promise.all([
          analyticsAPI.byDepartment(),
          analyticsAPI.byStatus(),
          analyticsAPI.byCategory(),
          analyticsAPI.hotspots(),
        ]);
        setByDept(dept.data.data.map(d => ({ name: d._id, count: d.count })));
        setByStatus(status.data.data.map(d => ({ name: d._id, count: d.count })));
        setByCategory(category.data.data.map(d => ({ name: d._id, count: d.count })));
        setHotspots(hot.data.hotspots);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleInsight = async () => {
    setLoadingInsight(true);
    try {
      const res = await aiAPI.insight({ byDept, byStatus, byCategory, hotspots });
      setInsight(res.data.insight);
      toast.success('AI insight generated');
    } catch {
      toast.error('Failed to generate insight');
    } finally {
      setLoadingInsight(false);
    }
  };

  const totalCases = byStatus.reduce((sum, s) => sum + s.count, 0);

  if (loading) return (
    <div className="neo-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9896a4' }}>Loading analytics...</p>
    </div>
  );

  return (
    <div className="neo-page">
      <nav className="neo-navbar">
        <Link href="/dashboard/secretariat" className="neo-navbar-brand">Neo<span>Connect</span></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/dashboard/secretariat"><button className="neo-btn-secondary">Dashboard</button></Link>
          <Link href="/polls"><button className="neo-btn-secondary">Polls</button></Link>
          <Link href="/hub"><button className="neo-btn-secondary">Public Hub</button></Link>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="neo-container">
        <div className="animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#0a1628', marginBottom: '0.5rem' }}>
              Analytics Dashboard
            </h1>
            <p style={{ color: '#9896a4', fontSize: '0.9rem' }}>Real-time case intelligence and trend analysis</p>
          </div>
          <button onClick={handleInsight} disabled={loadingInsight} style={{
            padding: '0.6rem 1.25rem',
            background: 'linear-gradient(135deg, #0a1628, #1a3460)',
            border: '1px solid #c9a84c', borderRadius: '8px',
            color: '#c9a84c', fontWeight: 600, fontSize: '0.875rem',
            fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            {loadingInsight ? '⏳ Generating...' : '✨ AI Trend Insight'}
          </button>
        </div>

        {insight && (
          <div className="animate-in neo-card" style={{
            padding: '1.5rem', marginBottom: '2rem',
            borderLeft: '4px solid #c9a84c',
            background: 'linear-gradient(135deg, #fffbeb, #fef9f0)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>✨</span>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#0a1628' }}>
                AI Trend Insight
              </h3>
            </div>
            <p style={{ color: '#5c5a68', lineHeight: 1.7, fontSize: '0.9rem' }}>{insight}</p>
          </div>
        )}

        {hotspots.length > 0 && (
          <div className="animate-in animate-delay-1 neo-card" style={{
            padding: '1.5rem', marginBottom: '2rem',
            borderLeft: '4px solid #ef4444',
            background: 'linear-gradient(135deg, #fff5f5, #fee2e2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔥</span>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#991b1b' }}>
                Hotspot Alert — Departments Requiring Attention
              </h3>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {hotspots.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', background: '#ffffff',
                  borderRadius: '8px', border: '1px solid #fecaca',
                }}>
                  <span style={{ fontWeight: 600, color: '#0a1628', fontSize: '0.9rem' }}>
                    {h._id.department} — {h._id.category}
                  </span>
                  <span style={{
                    padding: '0.2rem 0.65rem', borderRadius: '20px',
                    background: '#fee2e2', color: '#991b1b',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>{h.count} cases</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-in animate-delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Cases', value: totalCases, icon: '📋' },
            { label: 'Departments', value: byDept.length, icon: '🏢' },
            { label: 'Categories', value: byCategory.length, icon: '📁' },
            { label: 'Hotspots', value: hotspots.length, icon: '🔥' },
          ].map((stat, i) => (
            <div key={i} className="neo-stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div className="neo-stat-value">{stat.value}</div>
              <div className="neo-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="animate-in animate-delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="neo-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: '1.5rem', color: '#0a1628' }}>
              Cases by Department
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byDept} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: '0.85rem' }} />
                <Bar dataKey="count" fill="#0a1628" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="neo-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: '1.5rem', color: '#0a1628' }}>
              Cases by Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: '0.85rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="animate-in animate-delay-3">
          <div className="neo-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: '1.5rem', color: '#0a1628' }}>
              Cases by Category
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCategory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'DM Sans' }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: '0.85rem' }} />
                <Bar dataKey="count" fill="#c9a84c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}