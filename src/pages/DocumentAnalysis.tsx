import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, AlertTriangle, Calendar, List, Eye, Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { useDocument, useDocuments } from "@/hooks/useDocuments";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const defaultTabData: Record<string, { icon: React.ElementType; items: string[] }> = {
  overview: { icon: Eye, items: ["Upload a document to see its analysis here."] },
  highlights: { icon: FileText, items: [] },
  stakeholders: { icon: Users, items: [] },
  penalties: { icon: AlertTriangle, items: [] },
  timeline: { icon: Calendar, items: [] },
};

const tabLabels: Record<string, string> = {
  overview: "Overview",
  highlights: "Key Highlights",
  stakeholders: "Stakeholders",
  penalties: "Penalties",
  timeline: "Timeline",
};

export default function DocumentAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get("id");
  const { data: document, isLoading } = useDocument(docId);
  const { data: documents } = useDocuments();
  const [activeTab, setActiveTab] = useState("overview");

  const analysis = document?.analysis || {};
  const tabData: Record<string, { icon: React.ElementType; items: string[] }> = {
    overview: { icon: Eye, items: analysis.overview?.length ? analysis.overview : defaultTabData.overview.items },
    highlights: { icon: FileText, items: analysis.highlights || [] },
    stakeholders: { icon: Users, items: analysis.stakeholders || [] },
    penalties: { icon: AlertTriangle, items: analysis.penalties || [] },
    timeline: { icon: Calendar, items: analysis.timeline || [] },
  };

  const clauses = analysis.clauses || [];

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Document Analysis</h1>
            <p className="page-subtitle">
              {document ? document.name : "Select a document to view its analysis"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {documents && documents.length > 0 && (
              <Select
                value={docId || ""}
                onValueChange={(val) => navigate(`/analysis?id=${val}`)}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.filter(d => d.status === "analyzed").map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {document && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/chat?docId=${document.id}`)}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Ask AI
              </Button>
            )}
          </div>
        </div>
      </div>

      {!document ? (
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No document selected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a document first, or select one from the dropdown above.
          </p>
          <Button onClick={() => navigate("/upload")} className="gradient-primary text-primary-foreground">
            Upload Document
          </Button>
        </div>
      ) : document.status === "processing" ? (
        <div className="glass-card p-12 text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing document...</h3>
          <p className="text-sm text-muted-foreground">AI is processing your document. This may take a moment.</p>
        </div>
      ) : (
        <>
          {analysis.summary && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-4">
              <h3 className="section-title mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
              <div className="flex gap-4 mt-4">
                {document.token_count && (
                  <Badge variant="secondary">{document.token_count.toLocaleString()} tokens</Badge>
                )}
                {document.compression_rate && (
                  <Badge className="bg-success/10 text-success border-success/20">
                    {document.compression_rate}% compression
                  </Badge>
                )}
              </div>
            </motion.div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-1 h-auto bg-secondary/50 p-1 rounded-xl">
              {Object.entries(tabLabels).map(([key, label]) => {
                const Icon = tabData[key].icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2 text-sm">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <AnimatePresence mode="wait">
              {Object.entries(tabData).map(([key, data]) => (
                <TabsContent key={key} value={key}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6">
                    {data.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data available for this section.</p>
                    ) : (
                      <ul className="space-y-3">
                        {data.items.map((item, i) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
                            <span className="mt-1.5 h-2 w-2 rounded-full gradient-primary shrink-0" />
                            <span className="text-sm text-foreground leading-relaxed">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>
          </Tabs>

          {clauses.length > 0 && (
            <div>
              <h3 className="section-title mb-4 flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                Full Clause Breakdown
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {clauses.map((clause: any) => (
                  <AccordionItem key={clause.id} value={clause.id} className="glass-card border-0 px-4 rounded-xl overflow-hidden">
                    <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">{clause.id}</Badge>
                        {clause.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                      {clause.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </>
      )}
    </div>
  );
}
