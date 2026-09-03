import { useState } from "react";
import { Seo } from "@/components/Seo";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { FileText, Shield, Sparkles, User, Building2 } from "lucide-react";

type Portal = "jobseeker" | "institution";

const PORTALS: Record<Portal, { label: string; tag: string; blurb: string; home: string; icon: typeof User }> = {
  jobseeker: {
    label: "Job Seeker",
    tag: "Career Intelligence",
    blurb: "Career intelligence workspace — readiness, job match, roadmap and resume builder.",
    home: "/career-intelligence",
    icon: User,
  },
  institution: {
    label: "Recruiter",
    tag: "Hiring Intelligence",
    blurb: "AI candidate screening, ranking and shortlist reports.",
    home: "/recruiter",
    icon: Building2,
  },
};

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

const Auth = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialPortal: Portal = params.get("portal") === "recruiter" || params.get("portal") === "institution" ? "institution" : "jobseeker";

  const [portal, setPortal] = useState<Portal>(initialPortal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const cfg = PORTALS[portal];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { user_type: portal },
        },
      });
      if (error) throw error;
      localStorage.setItem("atsfy_user_type", portal);
      toast.success(`${cfg.label} account created. You're signed in.`);
      navigate(cfg.home);
    } catch (error: any) {
      toast.error(error.message || "Sign up failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const accountType = (data.user?.user_metadata as any)?.user_type as Portal | undefined;

      if (accountType && accountType !== portal) {
        await supabase.auth.signOut();
        toast.error(
          `This email is registered as a ${PORTALS[accountType].label} account. Use the ${PORTALS[accountType].label} portal to sign in.`
        );
        setPortal(accountType);
        return;
      }

      if (!accountType) {
        // Legacy account with no portal set — bind it to the chosen portal.
        await supabase.auth.updateUser({ data: { user_type: portal } });
      }

      localStorage.setItem("atsfy_user_type", portal);
      navigate(cfg.home);
    } catch (error: any) {
      toast.error(error.message || "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    localStorage.setItem("atsfy_user_type", portal);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/welcome`,
    });
    if (error) {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const PortalIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Seo title={"Sign In — ATSFy"} description={"Sign in to ATSFy — separate portals for job seekers and recruiters."} path={"/auth"} />
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">ATSFy</h1>
          </div>
          <p className="text-muted-foreground">Choose your portal to continue</p>
        </div>

        {/* Portal switcher */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(PORTALS) as Portal[]).map((key) => {
            const p = PORTALS[key];
            const Icon = p.icon;
            const active = portal === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPortal(key)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                    : "border-border bg-card/50 hover:border-primary/40"
                }`}
              >
                <Icon className={`h-5 w-5 mb-2 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-sm font-semibold text-foreground">{p.label}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{p.tag}</div>
              </button>
            );
          })}
        </div>

        <Card>
          <Tabs defaultValue="signin">
            <CardHeader className="pb-2 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <PortalIcon className="h-3.5 w-3.5 text-primary" />
                <span>{cfg.blurb}</span>
              </div>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="signin" className="space-y-4 mt-0">
                <CardDescription>Sign in to your {cfg.label} account</CardDescription>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : `Sign in as ${cfg.label}`}
                  </Button>
                </form>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                  <GoogleIcon />
                  Continue with Google
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4 mt-0">
                <CardDescription>Create a {cfg.label} account</CardDescription>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : `Create ${cfg.label} account`}
                  </Button>
                </form>
                <p className="text-[11px] text-muted-foreground">
                  Each email belongs to one portal. Use a different email to register on the other side.
                </p>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                  <GoogleIcon />
                  Continue with Google
                </Button>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <Shield className="h-4 w-4 text-primary" />
            <span>Secure & Private</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FileText className="h-4 w-4 text-primary" />
            <span>ATS Optimized</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
