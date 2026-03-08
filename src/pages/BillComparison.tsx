import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Plus, Minus, RefreshCw, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Change {
  type: "added" | "removed" | "modified";
  clause: string;
  text: string;
  severity?: "major" | "minor";
}

interface ComparisonResult {
  summary: string;
  changes: Change[];
}

const typeConfig = {
  added: { color: "bg-success/10 text-success border-success/20", icon: Plus, label: "Added" },
  removed: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: Minus, label: "Removed" },
  modified: { color: "bg-warning/10 text-warning border-warning/20", icon: RefreshCw, label: "Modified" },
};

export default function BillComparison() {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const oldInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  const readFileText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleCompare = async () => {
    if (!oldFile || !newFile) {
      toast.error("Please upload both documents");
      return;
    }

    setComparing(true);
    setError(null);
    setResult(null);

    try {
      const [oldText, newText] = await Promise.all([readFileText(oldFile), readFileText(newFile)]);

      const { data, error: fnError } = await supabase.functions.invoke("compare-bills", {
        body: { oldText, newText, oldName: oldFile.name, newName: newFile.name },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResult(data as ComparisonResult);
      toast.success("Comparison complete!");
    } catch (e: any) {
      const msg = e.message || "Comparison failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setComparing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent, setter: (f: File) => void) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setter(file);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const added = result?.changes.filter((c) => c.type === "added").length || 0;
  const removed = result?.changes.filter((c) => c.type === "removed").length || 0;
  const modified = result?.changes.filter((c) => c.type === "modified").length || 0;

  return (
    <div className="page-container">
      <div className="page-bg" />
      <div className="page-bg-accent" />
      <div className="page-header">
        <h1 className="page-title">Bill Comparison</h1>
        <p className="page-subtitle">Upload two versions of a bill to identify changes with AI analysis</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: "Old Bill / Original", file: oldFile, setFile: setOldFile, inputRef: oldInputRef },
          { label: "New Amendment / Updated", file: newFile, setFile: setNewFile, inputRef: newInputRef },
        ].map(({ label, file, setFile, inputRef }) => (
          <div key={label}>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt,.doc"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
              className="hidden"
            />
            {file ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-2 border-primary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{label}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, setFile)}
                className="glass-card p-8 text-center border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary mb-4">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to upload or drag & drop</p>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {["PDF", "DOCX", "TXT"].map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground">{f}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleCompare}
          disabled={!oldFile || !newFile || comparing}
          className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity px-8"
          size="lg"
        >
          {comparing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing differences...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Compare Documents
            </>
          )}
        </Button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 border-destructive/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-foreground">{error}</span>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-6 space-y-6">
              {result.summary && (
                <div>
                  <h3 className="section-title mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title">Key Changes Identified</h3>
                  <div className="flex gap-3">
                    <Badge className="bg-success/10 text-success border-success/20">{added} Added</Badge>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">{removed} Removed</Badge>
                    <Badge className="bg-warning/10 text-warning border-warning/20">{modified} Modified</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.changes.map((change, i) => {
                    const config = typeConfig[change.type] || typeConfig.modified;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-start gap-3 p-4 rounded-xl border ${config.color}`}
                      >
                        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono font-medium">{change.clause}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 ${config.color}`}>{config.label}</Badge>
                            {change.severity === "major" && (
                              <Badge variant="destructive" className="text-[10px] px-1.5">Major</Badge>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{change.text}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
