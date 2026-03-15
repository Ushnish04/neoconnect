'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pollsAPI } from '../../../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function CreatePoll() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const getDashboardLink = () => {
    if (user?.role === 'secretariat') return '/dashboard/secretariat';
    return '/dashboard/admin';
  };

  const handleOptionChange = (i, val) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pollsAPI.create({ question, options: options.filter(o => o.trim()) });
      toast.success('Poll created successfully');
      router.push('/polls');
    } catch {
      toast.error('Failed to create poll');
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
          <Link href="/polls"><button className="neo-btn-secondary">All Polls</button></Link>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="neo-container" style={{ maxWidth: '640px' }}>
        <div className="animate-in" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#0a1628', marginBottom: '0.5rem' }}>
            Create a Poll
          </h1>
          <p style={{ color: '#9896a4', fontSize: '0.9rem' }}>Gather staff opinions on important topics</p>
        </div>

        <div className="neo-card animate-in animate-delay-1" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Poll Question</label>
              <input
                style={inputStyle} value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to ask staff?"
                required
                onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                onBlur={(e) => e.target.style.borderColor = '#e2e1e4'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Answer Options</label>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: '#0a1628', color: '#c9a84c',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</div>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      required
                      onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e1e4'}
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#9896a4', fontSize: '1.25rem', padding: '0 0.25rem',
                        }}>×</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setOptions([...options, ''])} style={{
                marginTop: '0.75rem', padding: '0.5rem 1rem',
                background: 'transparent', border: '1.5px dashed #e2e1e4',
                borderRadius: '8px', color: '#9896a4', fontSize: '0.875rem',
                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', width: '100%',
                transition: 'all 0.15s ease',
              }}
                onMouseEnter={(e) => { e.target.style.borderColor = '#c9a84c'; e.target.style.color = '#c9a84c'; }}
                onMouseLeave={(e) => { e.target.style.borderColor = '#e2e1e4'; e.target.style.color = '#9896a4'; }}
              >
                + Add Option
              </button>
            </div>

            <button type="submit" disabled={loading} className="neo-btn-primary"
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}>
              {loading ? 'Creating...' : 'Create Poll →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}