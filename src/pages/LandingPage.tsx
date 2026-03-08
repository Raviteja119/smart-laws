import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Scale, FileText, MessageSquare, GitCompare, Gauge, Zap,
  ArrowRight, CheckCircle, Shield, Users, ChevronRight, Sparkles,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI-Powered Summarization",
    description: "Instantly break down complex parliamentary bills into clear, digestible summaries.",
  },
  {
    icon: MessageSquare,
    title: "Ask the Bill",
    description: "Chat with any legislative document. Get answers with clause-level references.",
  },
  {
    icon: GitCompare,
    title: "Bill Comparison",
    description: "Compare old and new amendments side-by-side with visual diff highlighting.",
  },
  {
    icon: Gauge,
    title: "Token Efficiency",
    description: "Advanced compression reduces costs by up to 97% while preserving information density.",
  },
  {
    icon: Shield,
    title: "Clause-Level Analysis",
    description: "Deep-dive into penalties, stakeholders, timelines, and regulatory impact.",
  },
  {
    icon: Users,
    title: "Built for Citizens",
    description: "Plain-language explanations in English, Hindi, Telugu, and Tamil.",
  },
];

const stats = [
  { value: "142+", label: "Bills Analyzed" },
  { value: "97.9%", label: "Token Compression" },
  { value: "1,847", label: "Documents Processed" },
  { value: "12.4 kWh", label: "Energy Saved" },
];

const steps = [
  { step: "01", title: "Upload a Bill", description: "Drag and drop any PDF, DOCX, or TXT legislative document." },
  { step: "02", title: "AI Analyzes", description: "Our engine extracts key highlights, penalties, stakeholders, and timelines." },
  { step: "03", title: "Explore & Ask", description: "Browse structured analysis or chat with the document directly." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">AI Legislative</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Impact</a>
          </div>
          <Link to="/dashboard">
            <Button size="sm" className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Open Dashboard
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-28 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered Legislative Intelligence
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            Simplifying Government{" "}
            <span className="gradient-text">Policies</span> for Every Citizen
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Understand complex Indian parliamentary bills, policies, and legal documents
            in seconds — powered by AI summarization and intelligent token compression.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/dashboard">
              <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity px-8 h-12 text-base">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-16 glass-card p-1.5 rounded-2xl shadow-xl shadow-primary/5 max-w-3xl mx-auto"
          >
            <div className="rounded-xl bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-2 font-mono">Document Analysis — Digital Data Protection Bill</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "Compression", value: "97.9%", color: "text-success" },
                  { label: "Clauses Found", value: "48", color: "text-primary" },
                  { label: "Stakeholders", value: "5 Groups", color: "text-warning" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-secondary/50 p-4 text-center">
                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {["New tax regulation introduced for digital services", "MSME compliance requirements simplified", "Data privacy amendments strengthen citizen rights"].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 border-y border-border/50 bg-secondary/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to understand legislation
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful AI tools designed to make government policies accessible to every citizen.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From upload to insight in three simple steps.
            </p>
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6 flex items-start gap-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground font-bold text-lg">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="glass-card p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to decode legislation?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands of citizens using AI to understand the policies that shape their lives.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity h-12 px-8 text-base">
                  Launch Dashboard
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">AI Legislative Analyzer</span>
          </div>
          <p>© 2026 AI Legislative Analyzer. Built for citizens, by citizens.</p>
        </div>
      </footer>
    </div>
  );
}
