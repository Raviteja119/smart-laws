import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDocuments } from "@/hooks/useDocuments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: documents } = useDocuments();
  const navigate = useNavigate();

  const results = query.trim().length >= 2
    ? (documents || []).filter((doc) => {
        const q = query.toLowerCase();
        const analysis = (doc.analysis as any) || {};
        const searchable = [
          doc.name,
          analysis.summary || "",
          ...(analysis.overview || []),
          ...(analysis.highlights || []),
          ...(analysis.stakeholders || []),
          ...(analysis.penalties || []),
          ...(analysis.timeline || []),
          ...(analysis.clauses || []).map((c: any) => `${c.title} ${c.content}`),
        ].join(" ").toLowerCase();
        return searchable.includes(q);
      })
    : [];

  const getMatchSnippet = (doc: any, q: string): string => {
    const analysis = (doc.analysis as any) || {};
    const allText = [
      analysis.summary || "",
      ...(analysis.overview || []),
      ...(analysis.highlights || []),
      ...(analysis.stakeholders || []),
      ...(analysis.clauses || []).map((c: any) => c.content),
    ];
    for (const text of allText) {
      const idx = text.toLowerCase().indexOf(q.toLowerCase());
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + q.length + 60);
        return (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
      }
    }
    return doc.name;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center h-8 w-8 rounded-md text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <Search className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all documents..."
            className="border-0 shadow-none focus-visible:ring-0 px-0"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Type at least 2 characters to search</div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No results found</div>
          ) : (
            <AnimatePresence>
              {results.map((doc) => (
                <motion.button
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => { navigate(`/analysis?id=${doc.id}`); setOpen(false); setQuery(""); }}
                  className="w-full text-left flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{getMatchSnippet(doc, query)}</p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
