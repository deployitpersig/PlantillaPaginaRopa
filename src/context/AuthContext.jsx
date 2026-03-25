import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, safeQuery } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, userEmail) => {
    try {
      const { data, error } = await safeQuery(() => supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single());

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist — create it
        const { data: newProfile, error: insertError } = await safeQuery(() => supabase
          .from('profiles')
          .insert({ id: userId, email: userEmail, role: 'customer' })
          .select()
          .single());
        if (insertError) console.error('Error creating new profile:', insertError);
        setProfile(newProfile || null);
      } else if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const res = await safeQuery(() => supabase.auth.getUser());
        const user = res.data?.user;
        const error = res.error;
        
        if (error) {
          console.warn("Auth session error (posible token de BD antigua):", error.message);
          // Auto-clear corrupted/old local storage keys to prevent app bricking
          if (typeof localStorage !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                localStorage.removeItem(key);
              }
            });
          }
          await supabase.auth.signOut().catch(() => {});
          setUser(null);
          setProfile(null);
          return;
        }
        
        if (!mounted) return;

        const currentUser = user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser.id, currentUser.email);
        }
      } catch (err) {
        console.error("Auth session exception:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          // If we already have a profile for this user, don't fetch again needlessly
          await fetchProfile(currentUser.id, currentUser.email);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const res = await safeQuery(() => supabase.auth.signInWithPassword({
      email,
      password,
    }));
    if (res.error) throw res.error;
    return res.data;
  };

  const register = async (email, password) => {
    const res = await safeQuery(() => supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    }));
    if (res.error) throw res.error;
    const data = res.data;

    // Create profile
    if (data?.user) {
      await safeQuery(() => supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        role: 'customer',
      }));
    }
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
