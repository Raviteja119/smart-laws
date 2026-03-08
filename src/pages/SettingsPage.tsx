import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Sun, Moon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "te", label: "Telugu" },
  { value: "ta", label: "Tamil" },
];

export default function SettingsPage() {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");

  const handleTheme = (value: string) => {
    setTheme(value);
    document.documentElement.classList.toggle("dark", value === "dark");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your experience</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Language Selection</h3>
              <p className="text-xs text-muted-foreground">Choose your preferred language</p>
            </div>
          </div>
          <RadioGroup value={language} onValueChange={setLanguage} className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <Label
                key={lang.value}
                htmlFor={lang.value}
                className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  language === lang.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                }`}
              >
                <RadioGroupItem value={lang.value} id={lang.value} />
                <span className="text-sm font-medium text-foreground">{lang.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
              {theme === "light" ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Theme</h3>
              <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "light", label: "Light Mode", icon: Sun },
              { value: "dark", label: "Dark Mode", icon: Moon },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleTheme(opt.value)}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                  theme === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                }`}
              >
                <opt.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
