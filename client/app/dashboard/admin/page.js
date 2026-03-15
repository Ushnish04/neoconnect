'use client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const cards = [
    { title: 'Analytics', desc: 'View case statistics, hotspots and trends', icon: '📊', link: '/dashboard/analytics', color: '#0a1628' },
    { title: 'Polls', desc: 'View and manage staff polls', icon: '📋', link: '/polls', color: '#1a3460' },
    { title: 'Public Hub', desc: 'View announcements and impact records', icon: '🌐', link: '/hub', color: '#112240' },
    { title: 'Submit Case', desc: 'Submit a new feedback or complaint', icon: '✏️', link: '/submit', color: '#0a1628' },
  ];

  return (
    <div className="neo-page">
      <nav className="neo-navbar">
        <span className="neo-navbar-brand">Neo<span>Connect</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/dashboard/analytics"><button className="neo-btn-secondary">Analytics</button></Link>
          <Link href="/polls"><button className="neo-btn-secondary">Polls</button></Link>
          <Link href="/hub"><button className="neo-btn-secondary">Public Hub</button></Link>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button className="neo-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a3460)',
        padding: '3rem 2rem', textAlign: 'center',
      }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Admin Portal
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Welcome back, {user?.name}</p>
      </div>

      <div className="neo-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1rem' }}>
          {cards.map((card, i) => (
            <Link key={i} href={card.link} style={{ textDecoration: 'none' }}>
              <div className="neo-card animate-in" style={{
                padding: '2rem', cursor: 'pointer',
                animationDelay: `${i * 0.1}s`, opacity: 0,
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: card.color, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: '1rem',
                }}>{card.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#0a1628', marginBottom: '0.5rem' }}>
                  {card.title}
                </h3>
                <p style={{ color: '#9896a4', fontSize: '0.875rem', lineHeight: 1.5 }}>{card.desc}</p>
                <div style={{ marginTop: '1rem', color: '#c9a84c', fontSize: '0.875rem', fontWeight: 600 }}>
                  Open →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}