import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-screen bg-cvsu-light">
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
          <p className="text-sm leading-relaxed text-white/60">
            Forgot your password? No worries — we&apos;ll send you a link to reset it.
            Check your inbox and follow the instructions to get back into your account.
          </p>
        </div>
        <div className="text-xs text-white/30">
          &copy; 2026 CvSU Naic Alumni Portal. All rights reserved.
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cvsu-dark">
              <img src={logo} alt="CvSU Naic" className="h-full w-full rounded-xl object-contain p-1" />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-cvsu-dark">Reset password</h1>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-semibold text-cvsu-dark">Reset password</h1>
            <p className="mt-1 text-sm text-cvsu-green/60">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 font-semibold text-cvsu-dark">Check your email</h2>
              <p className="mt-2 text-sm text-cvsu-green/60">
                We&apos;ve sent a password reset link to <strong className="text-cvsu-dark">{email}</strong>
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-cvsu-green hover:text-cvsu-dark"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          ) : (
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cvsu-dark py-5 text-white hover:bg-cvsu-green"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send reset link
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1 text-sm text-cvsu-green/60 hover:text-cvsu-dark"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
