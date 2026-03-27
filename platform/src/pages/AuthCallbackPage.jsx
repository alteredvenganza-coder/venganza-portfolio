import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Supabase auto-parses the #access_token hash on mount and fires onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/onboarding', { replace: true });
      }
    });

    // Also check immediately — token may already be set in storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/onboarding', { replace: true });
      }
    });

    // Timeout fallback
    const t = setTimeout(() => {
      setError('Confirmation timed out. Please try signing up again.');
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, [navigate]);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        fontFamily: '-apple-system, "SF Pro Text", sans-serif',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1d1d1f', marginBottom: '12px' }}>
            Confirmation failed
          </h2>
          <p style={{ fontSize: '15px', color: '#6e6e73', marginBottom: '28px', lineHeight: '1.5' }}>
            {error}
          </p>
          <Link
            to="/signup"
            style={{
              display: 'inline-block',
              backgroundColor: '#0071e3',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
            }}
          >
            Back to Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Pro Text", sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* Spinner */}
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e5ea',
          borderTopColor: '#0071e3',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 20px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '17px', fontWeight: '500', color: '#1d1d1f', marginBottom: '6px' }}>
          Confirming your account…
        </p>
        <p style={{ fontSize: '14px', color: '#aeaeb2' }}>
          Just a moment
        </p>
      </div>
    </div>
  );
}
