import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export default function AuthDebugPage() {
  const { user, session, loading } = useAuth();
  const [cookies, setCookies] = useState<string[]>([]);
  const [directUser, setDirectUser] = useState<any>(null);
  const [directSession, setDirectSession] = useState<any>(null);

  useEffect(() => {
    // Get cookies from document
    const allCookies = document.cookie.split(';').map(c => c.trim());
    setCookies(allCookies);

    // Get user directly from supabase client
    supabase.auth.getUser().then(({ data }) => {
      setDirectUser(data.user);
    });

    // Get session directly from supabase client
    supabase.auth.getSession().then(({ data }) => {
      setDirectSession(data.session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Authentication Debug</h1>

        <Card>
          <CardHeader>
            <CardTitle>AuthContext State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Loading:</span>
              <Badge variant={loading ? "secondary" : "default"}>
                {loading ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">User:</span>
              {user ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{user.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>No user</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Session:</span>
              {session ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Exists</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>No session</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Supabase Client State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">getUser():</span>
              {directUser ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{directUser.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>No user</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">getSession():</span>
              {directSession ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Exists (expires: {new Date(directSession.expires_at * 1000).toLocaleString()})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>No session</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            {cookies.length > 0 ? (
              <div className="space-y-1">
                {cookies.map((cookie, i) => {
                  const isSupabaseCookie = cookie.includes('supabase') || cookie.includes('sb-');
                  return (
                    <div
                      key={i}
                      className={`text-sm font-mono p-2 rounded ${
                        isSupabaseCookie ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'
                      }`}
                    >
                      {cookie.split('=')[0]}
                      {isSupabaseCookie && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Supabase
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No cookies found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. If you see "No user" or "No session" above, try logging in again</p>
            <p>2. After logging in, come back to this page (without refreshing)</p>
            <p>3. If the state changes after navigation, it indicates a session persistence issue</p>
            <p>4. Check if Supabase cookies exist (highlighted in green)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}