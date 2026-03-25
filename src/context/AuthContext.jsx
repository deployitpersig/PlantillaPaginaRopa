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

  // Direct supabase call — NO safeQuery for auth initialization
  const fetchProfile = async (userId, userEmail) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }

      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, email: userEmail, role: 'customer' })
          .select()
          .maybeSingle();
        if (insertError) console.error('Error creating profile:', insertError);
        setProfile(newProfile || null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // NO safeQuery here — auth SDK manages its own token refresh internally
        const result = await supabase.auth.getUser();
        const user = result?.data?.user ?? null;
        const error = result?.error ?? null;
        
        if (error) {
          console.warn("Auth session error:", error.message);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
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

  // NO safeQuery on auth SDK calls — they handle retries/refresh internally
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    if (error) throw error;

    // Create profile (this IS a db call, so safeQuery is fine)
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
