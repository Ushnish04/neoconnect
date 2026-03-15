'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { casesAPI } from '../../../lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const statusConfig = {
  New: { label: 'New', class: 'badge-new' },
  Assigned: { label: 'Assigned', class: 'badge-assigned' },
  'In Progress': { label: 'In Progress', class: 'badge-inprogress' },
  Pending: { label: 'Pending', class: 'badge-pending' },
  Resolved: { label: 'Resolved', class: 'badge-resolved' },
  Escalated: { label: 'Escalated', class: 'badge-escalated' },
};

const severityColors = {
  Low: { bg: '#d1fae5', color: '#065f46' },
  Medium: { bg: '#fef3c7', color: '#92400e' },
  High: { bg: '#fee2e2', color: '#991b1b' },
};

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesAPI.getMy(1, 20);
        setCases(res.data.cases);
      } catch {
        toast.error('Failed to load cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const stats = {
    total: cases.length,
    open: cases.filter(c => !['Resolved'].includes(c.status)).length,
    resolved: cases.filter(c => c.status === 'Resolved').length,
    escalated: cases.filter(c => c.status === 'Escalated').length,
  };

  return (
    <div className="neo-page">
      <nav className="neo-navbar">
        <a className="neo-navbar-brand">Neo<span>Connect</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/submit"><button className="neo-btn-secondary">+ Submit Case</button></Link>
          <Link href="/polls"><button className="neo-btn-secondary">Polls</button></Link>
          <Link href="/hub"><button className="neo-btn-secondary">Public Hub</button></Link>
          <div style={{
            width: '1px', height: '24px',
            background: 'rgba(255,255,255,0.15)',
            margin: '0 0.5rem'
          }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="neo-container">
        <div className="animate-in" style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '2rem',
            color: '#0a1628',
            marginBottom: '0.5rem',
          }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ color: '#9896a4', fontSize: '0.9rem' }}>
            {user?.department} · Staff Portal
          </p>
        </div>

        <div className="animate-in animate-delay-1" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Total Cases', value: stats.total, icon: '📋' },
            { label: 'Open Cases', value: stats.open, icon: '🔓' },
            { label: 'Resolved', value: stats.resolved, icon: '✅' },
            { label: 'Escalated', value: stats.escalated, icon: '🚨' },
          ].map((stat, i) => (
            <div key={i} className="neo-stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div className="neo-stat-value">{stat.value}</div>
              <div className="neo-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="animate-in animate-delay-2">
          <div className="neo-section-title">My Cases</div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9896a4' }}>
              Loading your cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="neo-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>No cases yet</h3>
              <p style={{ color: '#9896a4', marginBottom: '1.5rem' }}>Submit your first case to get started</p>
              <Link href="/submit">
                <button className="neo-btn-primary">Submit a Case</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {cases.map((c, i) => (
                <div key={c._id} className="neo-card animate-in" style={{
                  padding: '1.5rem',
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: '#c9a84c',
                        letterSpacing: '0.05em',
                      }}>{c.trackingId}</span>
                      <span className={`neo-badge ${statusConfig[c.status]?.class}`}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: severityColors[c.severity]?.bg,
                        color: severityColors[c.severity]?.color,
                      }}>{c.severity}</span>
                    </div>
                  </div>
                  <p style={{
                    color: '#0a1628',
                    fontSize: '0.9rem',
                    marginBottom: '0.75rem',
                    lineHeight: 1.5,
                  }}>
                    {c.description?.slice(0, 120)}{c.description?.length > 120 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#9896a4' }}>
                    <span>📁 {c.category}</span>
                    <span>🏢 {c.department}</span>
                    <span>📍 {c.location}</span>
                    <span style={{ marginLeft: 'auto' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}