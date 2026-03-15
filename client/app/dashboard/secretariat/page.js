'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { casesAPI, hubAPI } from '../../../lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const statusConfig = {
  New: 'badge-new',
  Assigned: 'badge-assigned',
  'In Progress': 'badge-inprogress',
  Pending: 'badge-pending',
  Resolved: 'badge-resolved',
  Escalated: 'badge-escalated',
};

const severityColors = {
  Low: { bg: '#d1fae5', color: '#065f46' },
  Medium: { bg: '#fef3c7', color: '#92400e' },
  High: { bg: '#fee2e2', color: '#991b1b' },
};

export default function SecretariatDashboard() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managerId, setManagerId] = useState('');
  const [activeTab, setActiveTab] = useState('cases');
  const [hubForm, setHubForm] = useState({
    type: 'digest', title: '', content: '', quarter: '', raised: '', action: '', outcome: ''
  });
  const [hubLoading, setHubLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesAPI.getAll(1, 50);
        setCases(res.data.cases);
      } catch {
        toast.error('Failed to load cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleAssign = async (caseId) => {
    if (!managerId) return toast.error('Enter a manager ID');
    try {
      await casesAPI.assign(caseId, managerId);
      toast.success('Case assigned successfully');
      const res = await casesAPI.getAll(1, 50);
      setCases(res.data.cases);
    } catch {
      toast.error('Failed to assign case');
    }
  };

  const handleHubSubmit = async (e) => {
    e.preventDefault();
    setHubLoading(true);
    try {
      await hubAPI.create(hubForm);
      toast.success('Hub content created successfully');
      setHubForm({ type: 'digest', title: '', content: '', quarter: '', raised: '', action: '', outcome: '' });
    } catch {
      toast.error('Failed to create hub content');
    } finally {
      setHubLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const filteredCases = filter === 'all' ? cases : cases.filter(c => c.status === filter);

  const stats = {
    total: cases.length,
    new: cases.filter(c => c.status === 'New').length,
    inProgress: cases.filter(c => c.status === 'In Progress').length,
    escalated: cases.filter(c => c.status === 'Escalated').length,
  };

  const inputStyle = {
    display: 'block', width: '100%', padding: '0.75rem 1rem',
    border: '1.5px solid #e2e1e4', borderRadius: '8px',
    fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif',
    color: '#0a1628', background: '#ffffff', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: '#5c5a68', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: '0.4rem',
  };

  return (
    <div className="neo-page">
      <nav className="neo-navbar">
        <span className="neo-navbar-brand">Neo<span>Connect</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/polls/create"><button className="neo-btn-secondary">+ Poll</button></Link>
          <Link href="/polls"><button className="neo-btn-secondary">Polls</button></Link>
          <Link href="/hub"><button className="neo-btn-secondary">Public Hub</button></Link>
          <Link href="/dashboard/analytics"><button className="neo-btn-secondary">Analytics</button></Link>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="neo-container">
        <div className="animate-in" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#0a1628', marginBottom: '0.5rem' }}>
            Secretariat Dashboard
          </h1>
          <p style={{ color: '#9896a4', fontSize: '0.9rem' }}>{user?.department} · Management Portal</p>
        </div>

        <div className="animate-in animate-delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Cases', value: stats.total, icon: '📋' },
            { label: 'New Cases', value: stats.new, icon: '🆕' },
            { label: 'In Progress', value: stats.inProgress, icon: '⚙️' },
            { label: 'Escalated', value: stats.escalated, icon: '🚨' },
          ].map((stat, i) => (
            <div key={i} className="neo-stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div className="neo-stat-value">{stat.value}</div>
              <div className="neo-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="animate-in animate-delay-2" style={{
          display: 'flex', gap: '0.5rem', marginBottom: '2rem',
          borderBottom: '2px solid #e2e1e4', paddingBottom: '0',
        }}>
          {['cases', 'hub'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.75rem 1.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              fontSize: '0.875rem', textTransform: 'capitalize',
              color: activeTab === tab ? '#0a1628' : '#9896a4',
              borderBottom: activeTab === tab ? '2px solid #c9a84c' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.15s ease',
            }}>
              {tab === 'cases' ? '📋 Case Inbox' : '📰 Add Hub Content'}
            </button>
          ))}
        </div>

        {activeTab === 'cases' && (
          <div className="animate-in">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <input
                  className="neo-input"
                  placeholder="Paste Case Manager ID here to assign cases"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'New', 'Assigned', 'In Progress', 'Escalated', 'Resolved'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '0.4rem 0.875rem', borderRadius: '20px',
                    border: '1px solid', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600,
                    fontFamily: 'DM Sans, sans-serif',
                    background: filter === f ? '#0a1628' : 'transparent',
                    color: filter === f ? '#c9a84c' : '#9896a4',
                    borderColor: filter === f ? '#0a1628' : '#e2e1e4',
                    transition: 'all 0.15s ease',
                  }}>{f === 'all' ? 'All' : f}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9896a4' }}>Loading cases...</div>
            ) : (
              <div className="neo-card" style={{ overflow: 'hidden' }}>
                <table className="neo-table">
                  <thead>
                    <tr>
                      <th>Tracking ID</th>
                      <th>Category</th>
                      <th>Department</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((c) => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 700, color: '#c9a84c', fontSize: '0.8rem' }}>{c.trackingId}</td>
                        <td>{c.category}</td>
                        <td>{c.department}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '20px',
                            fontSize: '0.75rem', fontWeight: 600,
                            background: severityColors[c.severity]?.bg,
                            color: severityColors[c.severity]?.color,
                          }}>{c.severity}</span>
                        </td>
                        <td><span className={`neo-badge ${statusConfig[c.status]}`}>{c.status}</span></td>
                        <td>{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                        <td>
                          {c.status === 'New' && (
                            <button className="neo-btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => handleAssign(c._id)}>
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hub' && (
          <div className="animate-in neo-card" style={{ padding: '2rem', maxWidth: '640px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              Add Hub Content
            </h2>
            <form onSubmit={handleHubSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Content Type</label>
                <select value={hubForm.type} onChange={(e) => setHubForm({ ...hubForm, type: e.target.value })} style={inputStyle}>
                  <option value="digest">Quarterly Digest</option>
                  <option value="impact">Impact Record</option>
                  <option value="minutes">Meeting Minutes</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Title</label>
                <input style={inputStyle} value={hubForm.title} onChange={(e) => setHubForm({ ...hubForm, title: e.target.value })} required />
              </div>
              {hubForm.type === 'digest' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Quarter (e.g. Q1 2026)</label>
                    <input style={inputStyle} value={hubForm.quarter} onChange={(e) => setHubForm({ ...hubForm, quarter: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Summary</label>
                    <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                      value={hubForm.content} onChange={(e) => setHubForm({ ...hubForm, content: e.target.value })} required />
                  </div>
                </>
              )}
              {hubForm.type === 'impact' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>What Was Raised</label>
                    <input style={inputStyle} value={hubForm.raised} onChange={(e) => setHubForm({ ...hubForm, raised: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Action Taken</label>
                    <input style={inputStyle} value={hubForm.action} onChange={(e) => setHubForm({ ...hubForm, action: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>What Changed</label>
                    <input style={inputStyle} value={hubForm.outcome} onChange={(e) => setHubForm({ ...hubForm, outcome: e.target.value })} required />
                  </div>
                </>
              )}
              {hubForm.type === 'minutes' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                    value={hubForm.content} onChange={(e) => setHubForm({ ...hubForm, content: e.target.value })} />
                </div>
              )}
              <button type="submit" className="neo-btn-primary" disabled={hubLoading}
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}>
                {hubLoading ? 'Saving...' : 'Save to Hub →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}