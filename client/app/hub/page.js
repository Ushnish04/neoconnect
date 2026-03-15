'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { hubAPI } from '../../lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PublicHub() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [digests, setDigests] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('digest');

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const getDashboardLink = () => {
    if (user?.role === 'staff') return '/dashboard/staff';
    if (user?.role === 'secretariat') return '/dashboard/secretariat';
    if (user?.role === 'case_manager') return '/dashboard/case-manager';
    return '/dashboard/admin';
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [d, i, m] = await Promise.all([
          hubAPI.getAll('digest'),
          hubAPI.getAll('impact'),
          hubAPI.getAll('minutes'),
        ]);
        setDigests(d.data.content);
        setImpacts(i.data.content);
        setMinutes(m.data.content);
      } catch {
        toast.error('Failed to load hub content');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tabs = [
    { id: 'digest', label: '📰 Quarterly Digest', count: digests.length },
    { id: 'impact', label: '🎯 Impact Tracking', count: impacts.length },
    { id: 'minutes', label: '📄 Minutes Archive', count: minutes.length },
  ];

  return (
    <div className="neo-page">
      <nav className="neo-navbar">
        <Link href={getDashboardLink()} className="neo-navbar-brand">Neo<span>Connect</span></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href={getDashboardLink()}><button className="neo-btn-secondary">Dashboard</button></Link>
          <Link href="/submit"><button className="neo-btn-secondary">Submit Case</button></Link>
          <Link href="/polls"><button className="neo-btn-secondary">Polls</button></Link>
          {(user?.role === 'secretariat' || user?.role === 'admin') && (
            <Link href="/dashboard/analytics"><button className="neo-btn-secondary">Analytics</button></Link>
          )}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a3460)',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif', fontSize: '2.5rem',
          color: '#ffffff', marginBottom: '0.75rem',
        }}>Public Hub</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          Transparency in action — see how your feedback drives real change
        </p>
      </div>

      <div className="neo-container">
        <div style={{
          display: 'flex', gap: '0', marginBottom: '2rem',
          borderBottom: '2px solid #e2e1e4',
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '0.875rem 1.5rem', background: 'none',
              border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              fontSize: '0.875rem', color: activeTab === tab.id ? '#0a1628' : '#9896a4',
              borderBottom: activeTab === tab.id ? '2px solid #c9a84c' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              {tab.label}
              <span style={{
                padding: '0.1rem 0.5rem', borderRadius: '20px',
                background: activeTab === tab.id ? '#0a1628' : '#f0eff0',
                color: activeTab === tab.id ? '#c9a84c' : '#9896a4',
                fontSize: '0.7rem', fontWeight: 700,
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9896a4' }}>Loading...</div>
        ) : (
          <>
            {activeTab === 'digest' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {digests.length === 0 ? (
                  <div className="neo-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📰</div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif' }}>No digest entries yet</h3>
                    <p style={{ color: '#9896a4', marginTop: '0.5rem' }}>Quarterly summaries will appear here</p>
                  </div>
                ) : digests.map((d, i) => (
                  <div key={d._id} className="neo-card animate-in" style={{
                    padding: '2rem', animationDelay: `${i * 0.1}s`, opacity: 0,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#0a1628' }}>
                        {d.title}
                      </h3>
                      {d.quarter && (
                        <span style={{
                          padding: '0.2rem 0.75rem', borderRadius: '20px',
                          background: '#fef3c7', color: '#92400e',
                          fontSize: '0.75rem', fontWeight: 700,
                        }}>{d.quarter}</span>
                      )}
                    </div>
                    <p style={{ color: '#5c5a68', lineHeight: 1.7, fontSize: '0.9rem' }}>{d.content}</p>
                    <p style={{ color: '#9896a4', fontSize: '0.8rem', marginTop: '1rem' }}>
                      Published {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'impact' && (
              <div>
                {impacts.length === 0 ? (
                  <div className="neo-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif' }}>No impact records yet</h3>
                    <p style={{ color: '#9896a4', marginTop: '0.5rem' }}>Impact records will appear here</p>
                  </div>
                ) : (
                  <div className="neo-card" style={{ overflow: 'hidden' }}>
                    <table className="neo-table">
                      <thead>
                        <tr>
                          <th>What Was Raised</th>
                          <th>Action Taken</th>
                          <th>What Changed</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {impacts.map((row) => (
                          <tr key={row._id}>
                            <td style={{ color: '#0a1628', fontWeight: 500 }}>{row.raised}</td>
                            <td>{row.action}</td>
                            <td>
                              <span style={{
                                padding: '0.2rem 0.65rem', borderRadius: '20px',
                                background: '#d1fae5', color: '#065f46',
                                fontSize: '0.8rem', fontWeight: 600,
                              }}>{row.outcome}</span>
                            </td>
                            <td>{new Date(row.createdAt).toLocaleDateString('en-GB')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'minutes' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {minutes.length === 0 ? (
                  <div className="neo-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif' }}>No minutes uploaded yet</h3>
                    <p style={{ color: '#9896a4', marginTop: '0.5rem' }}>Meeting minutes will appear here</p>
                  </div>
                ) : minutes.map((doc, i) => (
                  <div key={doc._id} className="neo-card animate-in" style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    animationDelay: `${i * 0.05}s`, opacity: 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '40px', height: '40px',
                        background: '#fee2e2', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}>📄</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0a1628' }}>{doc.title}</p>
                        <p style={{ fontSize: '0.8rem', color: '#9896a4', marginTop: '0.2rem' }}>
                          {new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button style={{
                      padding: '0.4rem 1rem', background: 'transparent',
                      border: '1px solid #c9a84c', borderRadius: '6px',
                      color: '#c9a84c', fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}>View</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}