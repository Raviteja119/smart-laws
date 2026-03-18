import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Upload, MessageSquare, BookOpen, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TOUR_STEPS = [
  {
    title: "Welcome to AI Legislative Dashboard!",
    description: "This platform helps you understand Indian laws and policies using AI. Let's take a quick tour of the key features available to you.",
    icon: BookOpen,
    route: "/dashboard",
  },
  {
    title: "Upload & Analyze Bills",
    description: "Upload any parliamentary bill or policy document in PDF format. Our AI will automatically analyze it, extract key sections, identify stakeholders, penalties, and generate a comprehensive summary.",
    icon: Upload,
    route: "/upload",
  },
  {
    title: "Ask the Bill - AI Chat",
    description: "Have questions about a specific bill? Use our AI-powered chat to ask anything — from clause meanings to compliance requirements. Get instant, referenced answers.",
    icon: MessageSquare,
    route: "/chat",
  },
  {
    title: "Bill Directory",
    description: "Browse 50+ real Indian government bills organized by sector, state, and financial year. Click any bill to view details or generate a detailed AI summary.",
    icon: BookOpen,
    route: "/bill-directory",
  },
  {
    title: "Compliance & Comparison",
    description: "Check if your organization complies with specific legislation, or compare two bills side-by-side to understand changes and amendments.",
    icon: Shield,
    route: "/compliance",
  },
];

export function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem("onboarding-complete");
    if (!seen) setIsVisible(true);
  }, []);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding-complete", "true");
    setIsVisible(false);
    navigate("/dashboard");
  };

  const handleGoToFeature = () => {
    localStorage.setItem("onboarding-complete", "true");
    setIsVisible(false);
    navigate(TOUR_STEPS[step].route);
  };

  if (!isVisible) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <button onClick={handleComplete} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-foreground mb-2">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{current.description}</p>

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleGoToFeature} className="flex-1">
              Try this feature
            </Button>
            <Button size="sm" onClick={handleNext} className="flex-1 gap-1">
              {step < TOUR_STEPS.length - 1 ? (
                <>Next <ArrowRight className="h-3.5 w-3.5" /></>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-3">
            Step {step + 1} of {TOUR_STEPS.length} · Press Skip to close
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
