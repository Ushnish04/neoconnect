'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { casesAPI, aiAPI } from '../../../lib/api';
import { toast } from 'sonner';
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

export default function CaseManagerDashboard() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await casesAPI.getAssigned(1, 20);
      setCases(res.data.cases);
    } catch {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (caseId, status) => {
    try {
      await casesAPI.updateStatus(caseId, status);
      toast.success('Status updated');
      fetchCases();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (caseId) => {
    if (!noteText) return toast.error('Enter a note');
    try {
      await casesAPI.addNote(caseId, noteText);
      toast.success('Note added');
      setNoteText('');
      fetchCases();
    } catch {
      toast.error('Failed to add note');
    }
  };

  const handleSummarize = async (caseId) => {
    setSummaryLoading(true);
    setSummary('');
    try {
      const res = await aiAPI.summarize(caseId);
      setSummary(res.data.summary);
      setSelectedCase(caseId);
      toast.success(res.data.cached ? 'Loaded cached summary' : 'AI summary generated');
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const stats = {
    total: cases.length,
    inProgress: cases.filter(c => c.status === 'In Progress').length,
    pending: cases.filter(c => c.status === 'Pending').length,
    resolved: cases.filter(c => c.status === 'Resolved').length,
  };

  return (
    <div className="neo-page">
      <nav className="neo-navbar">
        <span className="neo-navbar-brand">Neo<span>Connect</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
            Case Manager · {user?.name}
          </span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="neo-container">
        <div className="animate-in" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#0a1628', marginBottom: '0.5rem' }}>
            My Assigned Cases
          </h1>
          <p style={{ color: '#9896a4', fontSize: '0.9rem' }}>{user?.department} · Case Manager Portal</p>
        </div>

        <div className="animate-in animate-delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem'
        }}>
          {[
            { label: 'Assigned', value: stats.total, icon: '📋' },
            { label: 'In Progress', value: stats.inProgress, icon: '⚙️' },
            { label: 'Pending', value: stats.pending, icon: '⏳' },
            { label: 'Resolved', value: stats.resolved, icon: '✅' },
          ].map((stat, i) => (
            <div key={i} className="neo-stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div className="neo-stat-value">{stat.value}</div>
              <div className="neo-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9896a4' }}>Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="neo-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif' }}>No cases assigned yet</h3>
            <p style={{ color: '#9896a4', marginTop: '0.5rem' }}>Cases assigned to you will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: activeCase ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {cases.map((c, i) => (
                <div key={c._id} className="neo-card animate-in" style={{
                  padding: '1.5rem',
                  animationDelay: `${i * 0.05}s`, opacity: 0,
                  border: activeCase?._id === c._id ? '2px solid #c9a84c' : '1px solid #e2e1e4',
                  cursor: 'pointer',
                }} onClick={() => setActiveCase(activeCase?._id === c._id ? null : c)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#c9a84c', letterSpacing: '0.05em' }}>
                        {c.trackingId}
                      </span>
                      <span className={`neo-badge ${statusConfig[c.status]}`}>{c.status}</span>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      background: severityColors[c.severity]?.bg, color: severityColors[c.severity]?.color,
                    }}>{c.severity}</span>
                  </div>
                  <p style={{ color: '#0a1628', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {c.description?.slice(0, 100)}{c.description?.length > 100 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#9896a4' }}>
                    <span>📁 {c.category}</span>
                    <span>🏢 {c.department}</span>
                    <span style={{ marginLeft: 'auto' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {activeCase && (
              <div className="neo-card animate-in" style={{ padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem' }}>
                    {activeCase.trackingId}
                  </h3>
                  <button onClick={() => setActiveCase(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9896a4', fontSize: '1.25rem',
                  }}>×</button>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#5c5a68', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {activeCase.description}
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block', fontSize: '0.75rem', fontWeight: 600,
                    color: '#5c5a68', textTransform: 'uppercase',
                    letterSpacing: '0.05em', marginBottom: '0.5rem',
                  }}>Update Status</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['In Progress', 'Pending', 'Resolved'].map(s => (
                      <button key={s} onClick={() => handleStatusUpdate(activeCase._id, s)} style={{
                        padding: '0.4rem 0.875rem', borderRadius: '20px',
                        border: '1px solid', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 600,
                        fontFamily: 'DM Sans, sans-serif',
                        background: activeCase.status === s ? '#0a1628' : 'transparent',
                        color: activeCase.status === s ? '#c9a84c' : '#9896a4',
                        borderColor: activeCase.status === s ? '#0a1628' : '#e2e1e4',
                        transition: 'all 0.15s ease',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <button onClick={() => handleSummarize(activeCase._id)}
                    disabled={summaryLoading}
                    style={{
                      width: '100%', padding: '0.6rem',
                      background: 'linear-gradient(135deg, #0a1628, #1a3460)',
                      border: '1px solid #c9a84c', borderRadius: '8px',
                      color: '#c9a84c', fontWeight: 600, fontSize: '0.875rem',
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                    }}>
                    {summaryLoading ? '⏳ Generating...' : '✨ AI Summary'}
                  </button>
                  {summary && selectedCase === activeCase._id && (
                    <div style={{
                      marginTop: '0.75rem', padding: '1rem',
                      background: 'linear-gradient(135deg, #f0f7ff, #e8f4ff)',
                      borderRadius: '8px', border: '1px solid #bfdbfe',
                      fontSize: '0.85rem', lineHeight: 1.6, color: '#1e40af',
                      whiteSpace: 'pre-line',
                    }}>{summary}</div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block', fontSize: '0.75rem', fontWeight: 600,
                    color: '#5c5a68', textTransform: 'uppercase',
                    letterSpacing: '0.05em', marginBottom: '0.5rem',
                  }}>Add Note</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a case note..."
                    style={{
                      display: 'block', width: '100%', padding: '0.75rem 1rem',
                      border: '1.5px solid #e2e1e4', borderRadius: '8px',
                      fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                      color: '#0a1628', minHeight: '80px', resize: 'vertical', outline: 'none',
                    }}
                  />
                  <button onClick={() => handleAddNote(activeCase._id)}
                    className="neo-btn-primary"
                    style={{ marginTop: '0.5rem', width: '100%', padding: '0.6rem' }}>
                    Add Note
                  </button>
                </div>

                {activeCase.notes?.length > 0 && (
                  <div>
                    <label style={{
                      display: 'block', fontSize: '0.75rem', fontWeight: 600,
                      color: '#5c5a68', textTransform: 'uppercase',
                      letterSpacing: '0.05em', marginBottom: '0.5rem',
                    }}>Case Notes</label>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {activeCase.notes.map((n, i) => (
                        <div key={i} style={{
                          padding: '0.75rem 1rem',
                          background: '#f8f7f4', borderRadius: '8px',
                          fontSize: '0.85rem', color: '#5c5a68',
                          borderLeft: '3px solid #c9a84c',
                        }}>{n.text}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}