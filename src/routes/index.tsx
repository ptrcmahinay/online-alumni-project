import { Link, createFileRoute } from "@tanstack/react-router";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  ArrowRight,
  Users,
  BookOpen,
  MapPin,
  Target,
  ChevronRight,
} from "lucide-react";
import schoolBg from "@/assets/schoolbg.jpg";
import faithImg from "@/assets/faith.jpg";
import patImg from "@/assets/pat-about.png";
import sannyImg from "@/assets/sanny-about.png";
import xtImg from "@/assets/xt-about.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CvSU Naic — Online Alumni Tracking System" },
      {
        name: "description",
        content:
          "Stay connected with your alma mater. Track careers, find classmates, and never miss a reunion.",
      },
    ],
  }),
  component: Landing,
});

const developers = [
  {
    name: "Faith",
    role: "Lead Developer",
    img: faithImg,
  },
  {
    name: "Pat",
    role: "Frontend Developer",
    img: patImg,
  },
  {
    name: "Sanny",
    role: "Backend Developer",
    img: sannyImg,
  },
  {
    name: "Xt",
    role: "UI/UX Designer",
    img: xtImg,
  },
];

const features = [
  {
    icon: Users,
    title: "Alumni Directory",
    desc: "Browse and connect with fellow graduates across batches and courses.",
  },
  {
    icon: BookOpen,
    title: "Career Tracking",
    desc: "See where your batchmates are now and how careers evolve over the years.",
  },
  {
    icon: MapPin,
    title: "Reunion Alerts",
    desc: "Get notified about homecomings, meetups, and regional gatherings.",
  },
  {
    icon: Target,
    title: "Opportunity Board",
    desc: "Share and discover job openings, internships, and mentorship programs.",
  },
];

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-cvsu-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cvsu-dark text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight text-white">
              <div className="text-sm font-semibold tracking-tight">
                CvSU Naic
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-cvsu-gold/80">
                Alumni Tracking System
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#about"
              className="text-sm text-white/70 transition hover:text-white"
            >
              About
            </a>
            <a
              href="#features"
              className="text-sm text-white/70 transition hover:text-white"
            >
              Features
            </a>
            <a
              href="#developers"
              className="text-sm text-white/70 transition hover:text-white"
            >
              Developers
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white/80 hover:bg-cvsu-green/50 hover:text-white">
              <a href="/login">Log in</a>
            </Button>
            <Button asChild className="bg-cvsu-gold text-cvsu-dark hover:bg-cvsu-gold/80">
              <a href="/register">Register</a>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen items-start justify-center overflow-hidden pt-28"
        style={{ backgroundImage: `url(${schoolBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cvsu-dark/70 to-cvsu-green/90" />
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 text-center">
          <Badge
            variant="outline"
            className="mb-2 border-cvsu-gold/30 bg-cvsu-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-cvsu-gold"
          >
            Cavite State University — Naic Campus
          </Badge>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl uppercase">
            Your alumni <span className="text-cvsu-gold"> community, </span>reconnected.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            A centralized hub for CvSU Naic graduates. Track careers, share
            opportunities, stay in touch, and never miss a reunion.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 bg-cvsu-gold text-cvsu-dark hover:bg-cvsu-gold/80">
              <a href="/register">Join the network <ArrowRight className="h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-white/80 hover:bg-cvsu-green/50 hover:text-white">
              <a href="/login">Log in</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="bg-cvsu-light py-24">
        <FadeIn>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="mb-4 bg-cvsu-gold/10 text-cvsu-dark hover:bg-cvsu-gold/20">
                About the system
              </h1>
              <h2 className="font-heading text-3xl tracking-tight text-cvsu-dark md:text-4xl">
                Bridging CvSU Naic graduates across generations
              </h2>
              <p className="mt-4 text-cvsu-green/70">
                The Online Alumni Tracking System is a platform built to maintain
                the connection between Cavite State University — Naic Campus and
                its graduates. Monitor career progress, facilitate networking, and
                strengthen the alumni community.
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                { label: "Active alumni", value: "2,400+" },
                { label: "Batches tracked", value: "15+" },
                { label: "Partner companies", value: "120+" },
              ].map((s, i) => (
                <FadeIn key={s.label} delay={i * 150}>
                  <div className="rounded-xl border border-cvsu-gold/20 bg-cvsu-light p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-cvsu-gold/40 hover:shadow-md">
                    <div className="font-heading text-4xl font-bold text-cvsu-green transition duration-300 group-hover:scale-110 md:text-5xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-cvsu-dark/60">
                      {s.label}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <section id="features" className="bg-cvsu-light py-24">
        <FadeIn>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge className="mb-4 bg-cvsu-gold/10 text-cvsu-dark hover:bg-cvsu-gold/20">
                Features
              </Badge>
              <h2 className="font-heading text-3xl tracking-tight text-cvsu-dark md:text-4xl">
                Everything you need to stay connected
              </h2>
              <p className="mt-4 text-cvsu-green/70">
                Tools built specifically for the CvSU Naic alumni community.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <FadeIn key={f.title} delay={i * 100}>
                  <Card className="group border-cvsu-gold/10 bg-cvsu-light shadow-none transition duration-300 hover:-translate-y-1 hover:border-cvsu-gold/40 hover:shadow-md">
                    <CardContent className="flex flex-col items-start gap-3 p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cvsu-gold/10 text-cvsu-green transition duration-300 group-hover:scale-110 group-hover:bg-cvsu-gold/20">
                        <f.icon className="h-5 w-5 transition duration-300 group-hover:scale-110" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-cvsu-dark transition duration-300 group-hover:text-cvsu-green">
                        {f.title}
                      </h3>
                      <p className="text-sm text-cvsu-green/70">{f.desc}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <section id="developers" className="bg-cvsu-light py-24">
        <FadeIn>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge className="mb-4 bg-cvsu-gold/10 text-cvsu-dark hover:bg-cvsu-gold/20">
                The team
              </Badge>
              <h2 className="font-heading text-3xl tracking-tight text-cvsu-dark md:text-4xl">
                Meet the developers
              </h2>
              <p className="mt-4 text-cvsu-green/70">
                Built with passion by the students of CvSU Naic.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {developers.map((dev, i) => (
                <FadeIn key={dev.name} delay={i * 100}>
                  <Card className="group overflow-hidden border-cvsu-gold/10 bg-cvsu-light shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative aspect-[4/5] overflow-hidden bg-cvsu-light">
                      <img
                        src={dev.img}
                        alt={dev.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-cvsu-dark/0 transition duration-300 group-hover:bg-cvsu-dark/30" />
                    </div>
                    <CardContent className="space-y-1 p-5">
                      <h3 className="font-heading text-lg font-semibold text-cvsu-dark transition duration-300 group-hover:text-cvsu-green">
                        {dev.name}
                      </h3>
                      <p className="text-sm text-cvsu-green/70">{dev.role}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="bg-cvsu-dark py-20">
        <FadeIn>
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="font-heading text-3xl text-white md:text-4xl">
              Ready to reconnect?
            </h2>
            <p className="mt-3 text-white/50">
              Join your fellow CvSU Naic graduates today.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button asChild size="lg" className="gap-2 bg-cvsu-green text-white hover:bg-cvsu-green/80">
                <a href="/register">Create your account <ChevronRight className="h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cvsu-green text-white/80 hover:bg-cvsu-green/50 hover:text-white">
                <a href="/login">Sign in</a>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-cvsu-gold/10 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cvsu-green text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-cvsu-dark">
                CvSU Naic — Alumni Tracking System
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-cvsu-green/60">
              <span>© 2026 CvSU Naic</span>
              <a href="#" className="transition hover:text-cvsu-dark">
                Privacy
              </a>
              <a href="#" className="transition hover:text-cvsu-dark">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
