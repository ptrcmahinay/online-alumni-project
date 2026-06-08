import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
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
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Join your fellow alumni</div>
                <div className="text-xs text-white/50">Connect, network, and grow together</div>
              </div>
            </div>
            <div className="text-xs leading-relaxed text-white/40">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              Your information will be used in accordance with our data protection practices.
            </div>
          </div>
        </div>
        <div className="text-xs text-white/30">
          &copy; 2026 CvSU Naic Alumni Portal. All rights reserved.
        </div>
      </div>

      {/* Right - form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cvsu-dark">
              <img src={logo} alt="CvSU Naic" className="h-full w-full rounded-xl object-contain p-1" />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-cvsu-dark">CvSU Naic Alumni Portal</h1>
            <p className="mt-1 text-sm text-cvsu-green/60">Create your alumni account</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-semibold text-cvsu-dark">Create account</h1>
            <p className="mt-1 text-sm text-cvsu-green/60">Join the CvSU Naic alumni community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-cvsu-dark">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                <Input
                  id="name"
                  placeholder="Juan Dela Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-cvsu-green/20 pl-10"
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-sm font-medium text-cvsu-dark">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-cvsu-dark">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-cvsu-green/20 pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cvsu-dark py-5 text-white hover:bg-cvsu-green"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-cvsu-green/60">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-cvsu-green hover:text-cvsu-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
