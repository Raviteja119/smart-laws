import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocument, useDocuments } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComplianceResult {
  score: number;
  status: "compliant" | "partial" | "non-compliant";
  findings: { area: string; status: string; detail: string; severity: string }[];
  recommendations: string[];
}

const severityColors: Record<string, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-success",
};

const statusIcons: Record<string, React.ElementType> = {
  pass: CheckCircle,
  fail: XCircle,
  warning: AlertTriangle,
};

export default function ComplianceChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get("id");
  const { data: document, isLoading: docLoading } = useDocument(docId);
  const { data: documents } = useDocuments();
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [checking, setChecking] = useState(false);

  const runCheck = async () => {
    if (!document) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("compliance-check", {
        body: { documentId: document.id },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Compliance check complete");
    } catch (e: any) {
      toast.error(e.message || "Compliance check failed");
    } finally {
      setChecking(false);
    }
  };

  const scoreColor = result ? (result.score >= 80 ? "text-success" : result.score >= 50 ? "text-warning" : "text-destructive") : "";

  return (
    <div className="page-container">
      <div className="page-bg" />
      <div className="page-bg-accent" />
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Compliance Checker</h1>
            <p className="page-subtitle">Check documents against regulatory standards</p>
          </div>
          <div className="flex items-center gap-2">
            {documents && documents.filter(d => d.status === "analyzed").length > 0 && (
              <Select value={docId || ""} onValueChange={(val) => navigate(`/compliance?id=${val}`)}>
                <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select document" /></SelectTrigger>
                <SelectContent>
                  {documents.filter(d => d.status === "analyzed").map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {!document ? (
        <div className="glass-card p-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Select a document</h3>
          <p className="text-sm text-muted-foreground">Choose an analyzed document to run compliance checks.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{document.name}</h3>
              <p className="text-xs text-muted-foreground">Run AI-powered compliance analysis</p>
            </div>
            <Button onClick={runCheck} disabled={checking} className="gradient-primary text-primary-foreground">
              {checking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
              Run Compliance Check
            </Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Score */}
              <div className="glass-card p-6 text-center">
                <p className={`text-5xl font-bold ${scoreColor}`}>{result.score}%</p>
                <Badge className={`mt-2 ${result.status === "compliant" ? "bg-success/10 text-success" : result.status === "partial" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                  {result.status.replace("-", " ").toUpperCase()}
                </Badge>
              </div>

              {/* Findings */}
              <div className="glass-card p-6">
                <h3 className="section-title mb-4">Findings</h3>
                <div className="space-y-3">
                  {result.findings.map((f, i) => {
                    const Icon = statusIcons[f.status] || AlertTriangle;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${severityColors[f.severity] || "text-muted-foreground"}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{f.area}</p>
                          <p className="text-xs text-muted-foreground">{f.detail}</p>
                        </div>
                        <Badge variant="secondary" className="ml-auto shrink-0 text-xs">{f.severity}</Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="section-title mb-4">Recommendations</h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="mt-1.5 h-2 w-2 rounded-full gradient-primary shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
