import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';
import { handleSupabaseError, logError } from '../utils/errorHandling';
import { ApiError } from '../types/common';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasBetaAccess: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: ApiError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: ApiError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

import { logger } from "@/utils/logger";

export const AuthProvider = ({ children }: AuthProviderProps) => {
  logger.debug('AuthProvider rendering');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasBetaAccess, setHasBetaAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Don't use async here - call the function separately
          checkUserPermissions(session.user.id);
        } else {
          setHasBetaAccess(false);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserPermissions(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      logger.error('Error getting session', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserPermissions = async (userId: string) => {
    try {
      // Check beta access
      const { data: betaData, error: betaError } = await supabase.rpc('has_beta_access', {
        user_id: userId
      });
      setHasBetaAccess(betaData || false);

      // Check admin status
      const { data: adminData, error: adminError } = await supabase.rpc('is_admin', {
        user_id: userId
      });
      setIsAdmin(adminData || false);
      
    } catch (error) {
      logger.error('Error checking user permissions', error);
      setHasBetaAccess(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account. Your beta access request will be reviewed.",
        });
      }

      return { error };
    } catch (err) {
      const apiError = handleSupabaseError(err);
      logError(err, 'signUp');
      toast({
        title: "Sign Up Error",
        description: apiError.message,
        variant: "destructive",
      });
      return { error: apiError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (err) {
      const apiError = handleSupabaseError(err);
      logError(err, 'signIn');
      toast({
        title: "Sign In Error",
        description: apiError.message,
        variant: "destructive",
      });
      return { error: apiError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out successfully",
        });
      }
    } catch (err) {
      const apiError = handleSupabaseError(err);
      logError(err, 'signOut');
      toast({
        title: "Sign Out Error",
        description: apiError.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    hasBetaAccess,
    isAdmin,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
