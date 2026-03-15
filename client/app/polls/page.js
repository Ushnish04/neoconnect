'use client';
import { useState, useEffect } from 'react';
import { pollsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PollsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState({});

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const getDashboardLink = () => {
    if (user?.role === 'staff') return '/dashboard/staff';
    if (user?.role === 'secretariat') return '/dashboard/secretariat';
    if (user?.role === 'case_manager') return '/dashboard/case-manager';
    return '/dashboard/admin';
  };

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await pollsAPI.getAll();
        setPolls(res.data.polls);
      } catch {
        toast.error('Failed to load polls');
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  const handleVote = async (pollId, optionIndex) => {
    try {
      const res = await pollsAPI.vote(pollId, optionIndex);
      setPolls(polls.map(p => p._id === pollId ? res.data.poll : p));
      setVoted({ ...voted, [pollId]: optionIndex });
      toast.success('Vote recorded!');
    } catch {
      toast.error('You may have already voted on this poll');
    }
  };

  return (
    <div className="neo-page">
      <nav className="neo-navbar">
        <Link href={getDashboardLink()} className="neo-navbar-brand">Neo<span>Connect</span></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href={getDashboardLink()}><button className="neo-btn-secondary">Dashboard</button></Link>
          <Link href="/submit"><button className="neo-btn-secondary">Submit Case</button></Link>
          <Link href="/hub"><button className="neo-btn-secondary">Public Hub</button></Link>
          {(user?.role === 'secretariat' || user?.role === 'admin') && (
            <Link href="/dashboard/analytics"><button className="neo-btn-secondary">Analytics</button></Link>
          )}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="neo-container">
        <div className="animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#0a1628', marginBottom: '0.5rem' }}>
              Staff Polls
            </h1>
            <p style={{ color: '#9896a4', fontSize: '0.9rem' }}>Your voice shapes company decisions</p>
          </div>
          {(user?.role === 'secretariat' || user?.role === 'admin') && (
            <Link href="/polls/create">
              <button className="neo-btn-primary">+ Create Poll</button>
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9896a4' }}>Loading polls...</div>
        ) : polls.length === 0 ? (
          <div className="neo-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif' }}>No polls yet</h3>
            <p style={{ color: '#9896a4', marginTop: '0.5rem' }}>Check back soon for new polls</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {polls.map((poll, i) => {
              const hasVoted = voted[poll._id] !== undefined;
              const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
              const chartData = poll.options.map(o => ({ name: o.text, votes: o.votes }));
              return (
                <div key={poll._id} className="neo-card animate-in" style={{
                  padding: '2rem', animationDelay: `${i * 0.1}s`, opacity: 0,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#0a1628', flex: 1 }}>
                      {poll.question}
                    </h3>
                    <span style={{
                      padding: '0.2rem 0.65rem', borderRadius: '20px',
                      background: poll.isActive ? '#d1fae5' : '#f3f4f6',
                      color: poll.isActive ? '#065f46' : '#6b7280',
                      fontSize: '0.75rem', fontWeight: 600, marginLeft: '1rem',
                    }}>
                      {poll.isActive ? '● Active' : 'Closed'}
                    </span>
                  </div>

                  {!hasVoted ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {poll.options.map((option, idx) => (
                        <button key={idx} onClick={() => handleVote(poll._id, idx)} style={{
                          padding: '0.875rem 1.25rem',
                          background: '#f8f7f4', border: '1.5px solid #e2e1e4',
                          borderRadius: '8px', textAlign: 'left',
                          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                          fontSize: '0.9rem', color: '#0a1628', fontWeight: 500,
                          transition: 'all 0.15s ease',
                        }}
                          onMouseEnter={(e) => { e.target.style.borderColor = '#c9a84c'; e.target.style.background = '#fffbeb'; }}
                          onMouseLeave={(e) => { e.target.style.borderColor = '#e2e1e4'; e.target.style.background = '#f8f7f4'; }}
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'DM Sans' }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, index) => (
                              <Cell key={index} fill={index === voted[poll._id] ? '#c9a84c' : '#0a1628'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9896a4', marginTop: '0.5rem' }}>
                        {totalVotes} total votes
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}