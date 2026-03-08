import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Scale, FileText, MessageSquare, GitCompare, Gauge, Zap,
  ArrowRight, CheckCircle, Shield, Users, ChevronRight, Sparkles, Star,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI-Powered Summarization",
    description: "Instantly break down complex parliamentary bills into clear, digestible summaries.",
    color: "from-primary to-primary-glow",
    bgColor: "bg-primary/10",
  },
  {
    icon: MessageSquare,
    title: "Ask the Bill",
    description: "Chat with any legislative document. Get answers with clause-level references.",
    color: "from-info to-primary",
    bgColor: "bg-info/10",
  },
  {
    icon: GitCompare,
    title: "Bill Comparison",
    description: "Compare old and new amendments side-by-side with visual diff highlighting.",
    color: "from-warning to-destructive",
    bgColor: "bg-warning/10",
  },
  {
    icon: Gauge,
    title: "Token Efficiency",
    description: "Advanced compression reduces costs by up to 97% while preserving information density.",
    color: "from-success to-info",
    bgColor: "bg-success/10",
  },
  {
    icon: Shield,
    title: "Clause-Level Analysis",
    description: "Deep-dive into penalties, stakeholders, timelines, and regulatory impact.",
    color: "from-primary-glow to-destructive",
    bgColor: "bg-primary-glow/10",
  },
  {
    icon: Users,
    title: "Built for Citizens",
    description: "Plain-language explanations in English, Hindi, Telugu, and Tamil.",
    color: "from-success to-warning",
    bgColor: "bg-success/10",
  },
];

const stats = [
  { value: "142+", label: "Bills Analyzed", icon: FileText },
  { value: "97.9%", label: "Token Compression", icon: Zap },
  { value: "1,847", label: "Documents Processed", icon: Star },
  { value: "12.4 kWh", label: "Energy Saved", icon: Sparkles },
];

const steps = [
  { step: "01", title: "Upload a Bill", description: "Drag and drop any PDF, DOCX, or TXT legislative document.", color: "gradient-primary" },
  { step: "02", title: "AI Analyzes", description: "Our engine extracts key highlights, penalties, stakeholders, and timelines.", color: "gradient-info" },
  { step: "03", title: "Explore & Ask", description: "Browse structured analysis or chat with the document directly.", color: "gradient-success" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary glow-primary">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight font-display">AI Legislative</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center gap-8 text-sm text-muted-foreground"
          >
            <a href="#features" className="hover:text-foreground transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#stats" className="hover:text-foreground transition-colors relative group">
              Impact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/dashboard">
              <Button size="sm" className="gradient-primary text-primary-foreground hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20">
                Open Dashboard
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-28 px-6">
        {/* Animated mesh background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary/5 blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              x: [0, 50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-primary-glow/5 blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              y: [0, -30, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-10 w-[300px] h-[300px] rounded-full bg-success/5 blur-3xl"
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/30"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8 cursor-default"
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="h-3.5 w-3.5" />
              </motion.div>
              AI-Powered Legislative Intelligence
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6 font-display"
          >
            Simplifying Government{" "}
            <span className="gradient-text">Policies</span>
            <br className="hidden sm:block" />
            for Every Citizen
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
            <Link to="/signup">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 transition-all px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <a href="#how-it-works">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base hover:bg-accent/80">
                  See How It Works
                </Button>
              </motion.div>
            </a>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-16 glass-card-vivid p-1.5 rounded-2xl max-w-3xl mx-auto glow-primary"
          >
            <div className="rounded-xl bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="h-3 w-3 rounded-full bg-destructive/60" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} className="h-3 w-3 rounded-full bg-warning/60" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-2 font-mono">Document Analysis — Digital Data Protection Bill</span>
              </div>
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-3 gap-3"
              >
                {[
                  { label: "Compression", value: "97.9%", color: "text-success", gradient: "gradient-success" },
                  { label: "Clauses Found", value: "48", color: "text-primary", gradient: "gradient-primary" },
                  { label: "Stakeholders", value: "5 Groups", color: "text-warning", gradient: "gradient-warning" },
                ].map((m) => (
                  <motion.div 
                    key={m.label} 
                    variants={staggerItem}
                    whileHover={{ scale: 1.03 }}
                    className="rounded-xl bg-secondary/50 p-4 text-center border border-border/30 transition-all hover:shadow-md"
                  >
                    <p className={`text-2xl font-bold font-display ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </motion.div>
                ))}
              </motion.div>
              <div className="space-y-2">
                {["New tax regulation introduced for digital services", "MSME compliance requirements simplified", "Data privacy amendments strengthen citizen rights"].map((t, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.15 }}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-6 border-y border-border/50 bg-secondary/30 gradient-mesh relative">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center group"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mb-4 mx-auto shadow-lg shadow-primary/20"
              >
                <stat.icon className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground font-display">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-display">
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
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card p-6 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Gradient border effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-xl`} />
                
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} mb-4 transition-all duration-300 group-hover:shadow-md`}
                >
                  <feature.icon className="h-5 w-5 text-primary" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2 font-display">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-display">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From upload to insight in three simple steps.
            </p>
          </motion.div>

          <div className="space-y-6 relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary via-info to-success hidden sm:block" />
            
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                className="glass-card p-6 flex items-start gap-5 relative"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.color} text-primary-foreground font-bold text-lg shadow-lg relative z-10`}
                >
                  {step.step}
                </motion.div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1 font-display">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div className="glass-card-vivid p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-[0.04]" />
            {/* Animated circles */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full border border-primary/10"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full border border-primary-glow/10"
            />
            
            <div className="relative">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary mb-6 shadow-lg shadow-primary/20">
                  <Scale className="h-7 w-7 text-primary-foreground" />
                </div>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-display">
                Ready to decode legislation?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands of citizens using AI to understand the policies that shape their lives.
              </p>
              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 transition-all h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                    Launch Dashboard
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-6 bg-secondary/20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground font-display">AI Legislative Analyzer</span>
          </div>
          <p>© 2026 AI Legislative Analyzer. Built for citizens, by citizens.</p>
        </div>
      </footer>
    </div>
  );
}
