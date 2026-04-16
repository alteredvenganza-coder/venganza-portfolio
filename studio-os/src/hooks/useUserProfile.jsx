import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { fetchUserProfile, upsertUserProfile } from '../lib/db';

const UserProfileContext = createContext(null);

export function UserProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function loadOrCreate() {
      try {
        let p = await fetchUserProfile(user.id);

        // If no profile exists, this is the first/main user -> create as admin
        if (!p) {
          p = await upsertUserProfile(user.id, {
            display_name: user.email?.split('@')[0] || 'Admin',
            role: 'admin',
          });
        }

        setProfile(p);
      } catch (err) {
        console.error('Error loading user profile:', err);
        // Fallback: treat as admin if profile load fails (backwards compatibility)
        setProfile({ id: user.id, role: 'admin', display_name: user.email?.split('@')[0] });
      } finally {
        setLoading(false);
      }
    }

    loadOrCreate();
  }, [user]);

  const isAdmin = profile?.role === 'admin';
  const isGuest = profile?.role === 'guest';

  return (
    <UserProfileContext.Provider value={{ profile, loading, isAdmin, isGuest }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
