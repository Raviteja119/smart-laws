import { motion } from "framer-motion";
import { Upload, Plus, Minus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const changes = [
  { type: "added", clause: "Section 12A", text: "New provision for automated decision-making transparency requirements" },
  { type: "added", clause: "Section 18(3)", text: "Mandatory data protection impact assessments for high-risk processing" },
  { type: "removed", clause: "Section 7(b)", text: "Removed blanket exemption for government agencies on consent requirements" },
  { type: "removed", clause: "Section 21", text: "Removed provision allowing indefinite data retention for research" },
  { type: "modified", clause: "Section 15", text: "Penalty for data breaches increased from ₹150 Cr to ₹250 Cr" },
  { type: "modified", clause: "Section 22(1)", text: "Cross-border data transfer now requires government notification instead of approval" },
  { type: "added", clause: "Section 30A", text: "Right to data portability introduced for citizens" },
  { type: "modified", clause: "Section 9", text: "Consent requirements strengthened with mandatory plain-language disclosure" },
];

const typeConfig = {
  added: { color: "bg-success/10 text-success border-success/20", icon: Plus, label: "Added" },
  removed: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: Minus, label: "Removed" },
  modified: { color: "bg-warning/10 text-warning border-warning/20", icon: RefreshCw, label: "Modified" },
};

export default function BillComparison() {
  const added = changes.filter((c) => c.type === "added").length;
  const removed = changes.filter((c) => c.type === "removed").length;
  const modified = changes.filter((c) => c.type === "modified").length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Bill Comparison</h1>
        <p className="page-subtitle">Compare old bill with new amendment to identify changes</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {["Old Bill", "New Amendment"].map((label) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary mb-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">Click to upload or drag & drop</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="glass-card p-6">
          <h3 className="section-title mb-2">Key Changes Introduced</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comparing Digital Personal Data Protection Bill (Original) vs Amendment 2026
          </p>
          <div className="flex gap-4 mb-6">
            <Badge className="bg-success/10 text-success border-success/20">{added} Added</Badge>
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">{removed} Removed</Badge>
            <Badge className="bg-warning/10 text-warning border-warning/20">{modified} Modified</Badge>
          </div>
          <div className="space-y-3">
            {changes.map((change, i) => {
              const config = typeConfig[change.type as keyof typeof typeConfig];
              const Icon = config.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`flex items-start gap-3 p-4 rounded-xl border ${config.color}`}>
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-medium">{change.clause}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 ${config.color}`}>{config.label}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{change.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
