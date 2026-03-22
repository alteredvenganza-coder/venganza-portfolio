import { createContext, useContext, useEffect, useState } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { setToken } from './git-gateway';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    netlifyIdentity.init();

    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser(currentUser);
      // Refresh token
      currentUser.jwt().then(token => setToken(token));
    }
    setLoading(false);

    netlifyIdentity.on('login', (u) => {
      setUser(u);
      u.jwt().then(token => setToken(token));
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
      setToken(null);
    });

    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  const login = () => netlifyIdentity.open('login');
  const logout = () => netlifyIdentity.logout();

  // Refresh token periodically (tokens expire in ~1hr)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      user.jwt(true).then(token => setToken(token));
    }, 50 * 60 * 1000); // 50 min
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
