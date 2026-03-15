'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { adminAPI } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

const roleColors = {
  staff: { bg: '#dbeafe', color: '#1e40af' },
  secretariat: { bg: '#fef3c7', color: '#92400e' },
  case_manager: { bg: '#d1fae5', color: '#065f46' },
  admin: { bg: '#fee2e2', color: '#991b1b' },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminAPI.getUsers();
        setUsers(res.data.users);
      } catch { toast.error('Failed to load users'); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateRole(id, role);
      setUsers(users.map(u => u._id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    staff: users.filter(u => u.role === 'staff').length,
    managers: users.filter(u => u.role === 'case_manager').length,
    secretariat: users.filter(u => u.role === 'secretariat').length,
  };

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
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>User Management · {user?.name}</p>
      </div>

      <div className="neo-container">
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem', margin: '2rem 0'
        }}>
          {[
            { label: 'Total Users', value: stats.total, icon: '👥' },
            { label: 'Staff', value: stats.staff, icon: '👤' },
            { label: 'Case Managers', value: stats.managers, icon: '🗂️' },
            { label: 'Secretariat', value: stats.secretariat, icon: '🏛️' },
          ].map((stat, i) => (
            <div key={i} className="neo-stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div className="neo-stat-value">{stat.value}</div>
              <div className="neo-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <input
            className="neo-input"
            placeholder="Search by name, email or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9896a4' }}>
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9896a4' }}>
            No users found
          </div>
        ) : (
          <div className="neo-card" style={{ overflow: 'hidden' }}>
            <table className="neo-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: '#9896a4', fontSize: '0.875rem' }}>{u.email}</td>
                    <td>{u.department}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '20px',
                        fontSize: '0.75rem', fontWeight: 600,
                        background: roleColors[u.role]?.bg,
                        color: roleColors[u.role]?.color,
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: '#9896a4' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={u._id === user?.id}
                          style={{
                            padding: '0.25rem 0.5rem', borderRadius: '6px',
                            border: '1px solid #e2e1e4', fontSize: '0.75rem',
                            fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                            background: '#ffffff',
                          }}
                        >
                          <option value="staff">staff</option>
                          <option value="secretariat">secretariat</option>
                          <option value="case_manager">case_manager</option>
                          <option value="admin">admin</option>
                        </select>
                        {u._id !== user?.id && (
                          <button
                            onClick={() => handleDelete(u._id)}
                            style={{
                              padding: '0.25rem 0.6rem', background: '#fee2e2',
                              color: '#991b1b', border: 'none', borderRadius: '6px',
                              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                              fontFamily: 'DM Sans, sans-serif',
                            }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}