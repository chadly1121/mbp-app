import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Navigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';
import { handleSupabaseError, logError } from '../utils/errorHandling';
import { ApiError } from '../types/common';
import { BetaAccessPending } from '../components/BetaAccessPending';

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  console.log('AuthProvider rendering');
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
      console.error('Error getting session:', error);
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
      console.error('Error checking user permissions:', error);
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

interface ProtectedRouteProps {
  children: ReactNode;
  requireBetaAccess?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireBetaAccess = true, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  console.log('ProtectedRoute rendering', { requireBetaAccess, requireAdmin });
  const { user, loading, hasBetaAccess, isAdmin } = useAuth();

  console.log('ProtectedRoute state:', { user: !!user, loading, hasBetaAccess, isAdmin });

  if (loading) {
    console.log('ProtectedRoute: showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: no user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('ProtectedRoute: admin required but user is not admin');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (requireBetaAccess && !hasBetaAccess && !isAdmin) {
    console.log('ProtectedRoute: beta access required but user does not have access');
    return <BetaAccessPending />;
  }

  console.log('ProtectedRoute: rendering children');
  return <>{children}</>;
};