import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen bg-cvsu-light">
      {/* Left - branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-cvsu-dark p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <img src={logo} alt="CvSU Naic" className="h-full w-full rounded-xl object-contain p-1" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">CvSU Naic</div>
            <div className="text-xs text-white/80">Alumni Portal</div>
          </div>
        </div>
        <div className="space-y-4">
          <blockquote className="border-l-4 border-white/30 pl-6 text-2xl font-light leading-relaxed text-white/90">
            "Education is the most powerful weapon
            <br />
            which you can use to change the world."
          </blockquote>
          <p className="text-sm text-white/50">— Nelson Mandela</p>
        </div>
        <div className="text-xs text-white/30">
          &copy; 2026 CvSU Naic Alumni Portal. All rights reserved.
        </div>
      </div>

      {/* Right - form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cvsu-dark">
              <img src={logo} alt="CvSU Naic" className="h-full w-full rounded-xl object-contain p-1" />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-cvsu-dark">CvSU Naic Alumni Portal</h1>
            <p className="mt-1 text-sm text-cvsu-green/60">Sign in to your account</p>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-semibold text-cvsu-dark">Welcome back</h1>
            <p className="mt-1 text-sm text-cvsu-green/60">Sign in to your alumni account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-cvsu-dark">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-cvsu-green/20 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-cvsu-dark">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-cvsu-green hover:text-cvsu-dark"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-cvsu-green/20 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cvsu-green/40 hover:text-cvsu-dark"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cvsu-dark py-5 text-white hover:bg-cvsu-green"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in
            </Button>
          </form>


          <p className="mt-6 text-center text-sm text-cvsu-green/60">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-cvsu-green hover:text-cvsu-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
