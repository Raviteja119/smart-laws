import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GitBranch, FileText, Calendar, ArrowRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";

export default function AmendmentTracker() {
  const { data: documents } = useDocuments();
  const navigate = useNavigate();

  const analyzedDocs = useMemo(() => {
    return (documents || [])
      .filter(d => d.status === "analyzed")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [documents]);

  // Group documents by name prefix to detect amendments
  const docGroups = useMemo(() => {
    const groups: Record<string, typeof analyzedDocs> = {};
    analyzedDocs.forEach(doc => {
      // Use first 20 chars or full name as group key
      const key = doc.name.replace(/[-_v]\d+.*$/i, "").replace(/\.\w+$/, "").trim() || doc.name;
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    });
    return Object.entries(groups).map(([name, docs]) => ({ name, docs }));
  }, [analyzedDocs]);

  return (
    <div className="page-container">
      <div className="page-bg" />
      <div className="page-bg-accent" />
      <div className="page-header">
        <div>
          <h1 className="page-title">Amendment Tracker</h1>
          <p className="page-subtitle">Track how your bills evolve over time</p>
        </div>
      </div>

      {analyzedDocs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No analyzed documents yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload and analyze documents to track amendments.</p>
          <Button onClick={() => navigate("/upload")} className="gradient-primary text-primary-foreground">Upload Bill</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {docGroups.map((group) => (
            <motion.div key={group.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {group.name}
                <Badge variant="secondary" className="ml-2">{group.docs.length} version{group.docs.length > 1 ? "s" : ""}</Badge>
              </h3>

              {/* Timeline */}
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                {group.docs.map((doc, i) => {
                  const analysis = (doc.analysis as any) || {};
                  const date = new Date(doc.created_at);
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative pb-6 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-5 top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />

                      <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          {analysis.summary && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{analysis.summary}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            {doc.token_count && <Badge variant="secondary" className="text-xs">{doc.token_count.toLocaleString()} tokens</Badge>}
                            {doc.compression_rate && <Badge className="text-xs bg-success/10 text-success border-success/20">{doc.compression_rate}%</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/analysis?id=${doc.id}`)}>
                            <Eye className="h-3.5 w-3.5 mr-1" />View
                          </Button>
                          {i < group.docs.length - 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate("/comparison")}
                              title="Compare with next version"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
