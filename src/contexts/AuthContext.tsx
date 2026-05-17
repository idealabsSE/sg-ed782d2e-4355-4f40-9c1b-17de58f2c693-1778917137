import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, type AuthUser } from "@/auth/AuthService";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 AuthContext - Initializing");
    
    // Check active session - use getUser() for JWT validation
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        console.log("👤 AuthContext - Current user:", currentUser ? currentUser.email : "none");
        setUser(currentUser);
        
        if (currentUser) {
          const session = await authService.getCurrentSession();
          console.log("🔐 AuthContext - Session:", session ? "exists" : "none");
          setSession(session);
        }
      } catch (error) {
        console.error("❌ AuthContext - Error initializing auth:", error);
      } finally {
        setLoading(false);
        console.log("✅ AuthContext - Initialization complete");
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        console.log("🔔 AuthContext - Auth state change:", event, session ? "session exists" : "no session");
        setSession(session);
        
        if (session) {
          const user = await authService.getCurrentUser();
          console.log("👤 AuthContext - User from state change:", user ? user.email : "none");
          setUser(user);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log("🔄 AuthContext - Cleanup");
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("🔐 AuthContext - Sign in attempt:", email);
    const { user, error } = await authService.signIn(email, password);
    
    if (error) {
      console.log("❌ AuthContext - Sign in error:", error.message);
      return { error: error.message };
    }
    
    console.log("✅ AuthContext - Sign in success:", user?.email);
    setUser(user);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    console.log("📝 AuthContext - Sign up attempt:", email);
    const { user, error } = await authService.signUp(email, password);
    
    if (error) {
      console.log("❌ AuthContext - Sign up error:", error.message);
      return { error: error.message };
    }
    
    console.log("✅ AuthContext - Sign up success:", user?.email);
    setUser(user);
    return { error: null };
  };

  const signOut = async () => {
    console.log("👋 AuthContext - Sign out");
    await authService.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}