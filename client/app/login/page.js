'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'staff') router.push('/dashboard/staff');
      else if (user.role === 'secretariat') router.push('/dashboard/secretariat');
      else if (user.role === 'case_manager') router.push('/dashboard/case-manager');
      else if (user.role === 'admin') router.push('/dashboard/admin');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success('Welcome back!');
      if (u.role === 'staff') router.push('/dashboard/staff');
      else if (u.role === 'secretariat') router.push('/dashboard/secretariat');
      else if (u.role === 'case_manager') router.push('/dashboard/case-manager');
      else if (u.role === 'admin') router.push('/dashboard/admin');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #112240 50%, #1a3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />

      <div className="animate-in" style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '16px',
        padding: '3rem',
        position: 'relative',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
            borderRadius: '14px',
            marginBottom: '1.25rem',
            fontSize: '1.5rem',
          }}>⚖</div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.75rem',
            color: '#ffffff',
            marginBottom: '0.5rem',
          }}>NeoConnect</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            Staff Feedback & Case Management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.85rem',
              background: loading ? 'rgba(201,168,76,0.5)' : 'linear-gradient(135deg, #c9a84c, #e8c97a)',
              border: 'none',
              borderRadius: '8px',
              color: '#0a1628',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}