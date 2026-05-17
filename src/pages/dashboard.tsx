import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, FileText, Settings } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <SEO title="Dashboard - X Trust" description="Your X Trust dashboard" />
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Verify Property</CardTitle>
                  <CardDescription>
                    Check property compliance and licensing status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/verify/property">Start Verification</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Identity Verification</CardTitle>
                  <CardDescription>
                    Verify Swedish or Spanish identity documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/verify/identity/swedish">Swedish ID</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link href="/verify/identity/spanish">Spanish ID</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>My Cases</CardTitle>
                  <CardDescription>
                    View and manage verification cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/cases">View Cases</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your profile and settings</CardDescription>
                  </div>
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-mono text-sm">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm tabular-nums">{user?.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}