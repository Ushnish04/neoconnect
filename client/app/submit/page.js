'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { casesAPI, aiAPI } from '../../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function SubmitCase() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    category: '', department: user?.department || '',
    location: '', severity: '', description: '', anonymous: false,
  });

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const getDashboardLink = () => {
    if (user?.role === 'staff') return '/dashboard/staff';
    if (user?.role === 'secretariat') return '/dashboard/secretariat';
    if (user?.role === 'case_manager') return '/dashboard/case-manager';
    return '/dashboard/admin';
  };

  useEffect(() => {
    if (!form.description || form.description.length < 20) { setSuggestion(null); return; }
    const timer = setTimeout(async () => {
      setSuggesting(true);
      try {
        const res = await aiAPI.suggest(form.description);
        setSuggestion(res.data.suggestion);
      } catch { } finally { setSuggesting(false); }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('attachments', f));
      const res = await casesAPI.submit(formData);
      toast.success(`Case submitted! ID: ${res.data.case.trackingId}`);
      router.push(getDashboardLink());
    } catch {
      toast.error('Failed to submit case');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    display: 'block', width: '100%', padding: '0.75rem 1rem',
    border: '1.5px solid #e2e1e4', borderRadius: '8px',
    fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif',
    color: '#0a1628', background: '#ffffff', outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: '#5c5a68', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: '0.4rem',
  };

  return (
    <div className="neo-page">
      <nav className="neo-navbar">
        <Link href={getDashboardLink()} className="neo-navbar-brand">Neo<span>Connect</span></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href={getDashboardLink()}><button className="neo-btn-secondary">Dashboard</button></Link>
          <Link href="/polls"><button className="neo-btn-secondary">Polls</button></Link>
          <Link href="/hub"><button className="neo-btn-secondary">Public Hub</button></Link>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="neo-container" style={{ maxWidth: '760px' }}>
        <div className="animate-in" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#0a1628', marginBottom: '0.5rem' }}>
            Submit a Case
          </h1>
          <p style={{ color: '#9896a4', fontSize: '0.9rem' }}>
            All submissions are tracked with a unique ID and handled confidentially
          </p>
        </div>

        <div className="neo-card animate-in animate-delay-1" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your complaint or feedback in detail..."
                required
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                onBlur={(e) => e.target.style.borderColor = '#e2e1e4'}
              />
              {suggesting && (
                <p style={{ fontSize: '0.8rem', color: '#9896a4', marginTop: '0.5rem' }}>
                  ✨ AI is analysing your description...
                </p>
              )}
              {suggestion && (
                <div style={{
                  marginTop: '0.75rem', padding: '1rem',
                  background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  border: '1px solid #fbbf24', borderRadius: '8px',
                }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>
                    ✨ AI Suggestion
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#78350f' }}>
                    Category: <strong>{suggestion.category}</strong> · Severity: <strong>{suggestion.severity}</strong>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#92400e', margin: '0.25rem 0 0.75rem' }}>
                    {suggestion.reason}
                  </p>
                  <button type="button" onClick={() => setForm({ ...form, category: suggestion.category, severity: suggestion.severity })}
                    style={{
                      padding: '0.35rem 0.875rem', background: '#92400e',
                      color: '#ffffff', border: 'none', borderRadius: '6px',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                    }}>
                    Accept Suggestion
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e1e4'}>
                  <option value="">Select category</option>
                  <option value="Safety">Safety</option>
                  <option value="Policy">Policy</option>
                  <option value="Facilities">Facilities</option>
                  <option value="HR">HR</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Severity</label>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  required style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e1e4'}>
                  <option value="">Select severity</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Department</label>
                <input style={inputStyle} value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required placeholder="e.g. HR"
                  onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e1e4'} />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input style={inputStyle} value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required placeholder="e.g. Floor 3, Block B"
                  onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e1e4'} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Attachments (optional)</label>
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))}
                style={{ ...inputStyle, padding: '0.6rem 1rem', cursor: 'pointer' }} />
            </div>

            <div style={{
              marginBottom: '2rem', padding: '1rem',
              background: '#f8f7f4', borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <input type="checkbox" id="anonymous" checked={form.anonymous}
                onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#c9a84c' }} />
              <div>
                <label htmlFor="anonymous" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Submit Anonymously
                </label>
                <p style={{ fontSize: '0.8rem', color: '#9896a4', marginTop: '0.15rem' }}>
                  Your name will not be attached to this submission
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="neo-btn-primary"
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}>
              {loading ? 'Submitting...' : 'Submit Case →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}