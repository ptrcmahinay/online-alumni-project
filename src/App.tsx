import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ArrowRight, Briefcase, Megaphone, Users, Mail } from "lucide-react";
import heroImg from "@/assets/hero-campus.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdant Alumni — University Alumni Community" },
      { name: "description", content: "A private home for our graduates. Track careers, share opportunities, and never miss a reunion." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-2.5 text-cream">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-gold-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl">Verdant</div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">Alumni Society</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-cream/80 md:flex">
            <a href="#community" className="hover:text-cream">Community</a>
            <a href="#features" className="hover:text-cream">Features</a>
            <Link to="/dashboard" className="hover:text-cream">Member portal</Link>
          </nav>
          <Link to="/login">
            <Button variant="secondary" className="bg-cream text-emerald-deep hover:bg-cream/90">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1600} height={1000} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep via-emerald-deep/85 to-emerald-deep/40" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-40 pb-32 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Est. 1894 · 24,318 members
            </div>
            <h1 className="font-display text-5xl leading-[1.05] text-cream md:text-7xl">
              Where the<br/>
              <em className="text-gold not-italic font-display italic">conversation</em> continues.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cream/80">
              A private home for our graduates. Track each other's careers, share opportunities,
              and never miss a meetup, job fair, or class reunion.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 gap-2">
                  Enter the portal <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost" className="text-cream hover:bg-cream/10 hover:text-cream">
                  Claim your account
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:col-span-5 lg:flex lg:items-end">
            <div className="w-full rounded-xl border border-cream/15 bg-cream/5 p-6 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.18em] text-cream/60">Latest from the chapter</div>
              <div className="mt-4 space-y-4 text-cream">
                <div className="border-l-2 border-gold pl-4">
                  <div className="font-display text-xl">Bay Area Meetup</div>
                  <div className="text-sm text-cream/70">June 2 · Mission Bay, SF</div>
                </div>
                <div className="border-l-2 border-cream/30 pl-4">
                  <div className="font-display text-xl">Spring Career Fair</div>
                  <div className="text-sm text-cream/70">April 18 · Bailey Hall</div>
                </div>
                <div className="border-l-2 border-cream/30 pl-4">
                  <div className="font-display text-xl">Class of '14 Reunion</div>
                  <div className="text-sm text-cream/70">September 14 · Main Quad</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="community" className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-16 md:grid-cols-4">
          {[
            { k: "24,318", l: "Verified alumni" },
            { k: "62", l: "Countries represented" },
            { k: "1,402", l: "Companies founded" },
            { k: "89%", l: "5-year employment" },
          ].map((s) => (
            <div key={s.l} className="border-l-2 border-primary pl-5">
              <div className="font-display text-4xl text-emerald-deep md:text-5xl">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Inside the portal</div>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Four ways we<br/><em className="not-italic italic text-primary">stay close.</em></h2>
            <p className="mt-6 text-muted-foreground">
              Built around the small, recurring rituals that keep an alumni community alive.
            </p>
          </div>
          <div className="grid gap-6 lg:col-span-2 lg:grid-cols-2">
            {[
              { i: Users, t: "Directory & Profiles", d: "A living register of graduates — title, company, batch, and a way to reach out." },
              { i: Briefcase, t: "Employment tracking", d: "See where your cohort works and how careers move across decades." },
              { i: Megaphone, t: "Announcements", d: "Reunions, job fairs and school updates, surfaced before they slip by." },
              { i: Mail, t: "Email notifications", d: "Pick the cadence — daily digest, weekly summary, or only what matters most." },
            ].map((f) => (
              <div key={f.t} className="rounded-lg border border-border bg-card p-7 transition hover:border-primary/40 hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.i className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-deep text-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-20 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-4xl md:text-5xl">Your seat at the table is reserved.</h2>
            <p className="mt-3 text-cream/70">Sign in with your alumni email to enter the portal.</p>
          </div>
          <Link to="/login">
            <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 gap-2">
              Claim your account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <div>© 2026 Verdant Alumni Society</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Code of conduct</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
