import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            🛡️ Admin Dashboard
          </h1>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ 
          background: '#f3f4f6', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Welcome, Admin!
          </h2>
          <p style={{ color: '#6b7280' }}>
            Manage the entire LMS platform, users, courses, system settings, and monitor platform analytics.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ 
            background: '#dbeafe', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '2px solid #3b82f6'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              👥 Total Users
            </h3>
            <p style={{ color: '#1e40af', fontSize: '2rem', fontWeight: 'bold' }}>1,247</p>
            <p style={{ color: '#3b82f6', fontSize: '0.875rem' }}>Platform users</p>
          </div>

          <div style={{ 
            background: '#fce7f3', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '2px solid #ec4899'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#831843', marginBottom: '0.5rem' }}>
              📚 Courses
            </h3>
            <p style={{ color: '#831843', fontSize: '2rem', fontWeight: 'bold' }}>89</p>
            <p style={{ color: '#ec4899', fontSize: '0.875rem' }}>Total courses</p>
          </div>

          <div style={{ 
            background: '#dcfce7', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '2px solid #22c55e'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#166534', marginBottom: '0.5rem' }}>
              📊 Completion
            </h3>
            <p style={{ color: '#166534', fontSize: '2rem', fontWeight: 'bold' }}>76%</p>
            <p style={{ color: '#22c55e', fontSize: '0.875rem' }}>Avg completion</p>
          </div>

          <div style={{ 
            background: '#fef3c7', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '2px solid #f59e0b'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
              🚀 Active Now
            </h3>
            <p style={{ color: '#92400e', fontSize: '2rem', fontWeight: 'bold' }}>347</p>
            <p style={{ color: '#f59e0b', fontSize: '0.875rem' }}>Users online</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#6b7280' }}>
          <p>Role: <strong>Admin</strong></p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Demo Credentials - Email: admin@demo.com | Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
