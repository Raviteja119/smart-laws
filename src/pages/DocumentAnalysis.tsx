import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  FileText, Users, AlertTriangle, Calendar, List, Eye, Loader2,
  MessageSquare, Download, Upload, History, Bookmark, BookmarkCheck,
  Tag, Plus, Sparkles, Globe, Volume2, VolumeX, BookOpen,
} from "lucide-react";
import { useDocument, useDocuments } from "@/hooks/useDocuments";
import { useDocumentVersions, useCreateVersion } from "@/hooks/useDocumentVersions";
import { useBookmarks, useAddBookmark, useDeleteBookmark } from "@/hooks/useBookmarks";
import { useTags, useDocumentTags, useCreateTag, useToggleDocumentTag } from "@/hooks/useTags";
import { exportAsPDF, exportAsCSV } from "@/lib/exportDocument";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

const TAG_COLORS = ["blue", "green", "red", "purple", "orange", "pink"];

const SUMMARY_LANGUAGES = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { value: "te", label: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { value: "ta", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
];

const SPEECH_LANG_MAP: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
};

export default function DocumentAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const docId = searchParams.get("id");
  const { data: document, isLoading } = useDocument(docId);
  const { data: documents } = useDocuments();
  const { data: versions } = useDocumentVersions(docId);
  const { data: bookmarks } = useBookmarks(docId);
  const { data: allTags } = useTags();
  const { data: docTagLinks } = useDocumentTags(docId);
  const createVersion = useCreateVersion();
  const addBookmark = useAddBookmark();
  const deleteBookmark = useDeleteBookmark();
  const createTag = useCreateTag();
  const toggleTag = useToggleDocumentTag();
  const [activeTab, setActiveTab] = useState("overview");
  const [newTagName, setNewTagName] = useState("");
  const [annotationNote, setAnnotationNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [hasSummarized, setHasSummarized] = useState(false);
  const [summaryLang, setSummaryLang] = useState("en");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const analysis = (document?.analysis as any) || {};
  const linkedTagIds = new Set((docTagLinks || []).map((l: any) => l.tag_id));

  const tabData: Record<string, { icon: React.ElementType; items: string[] }> = {
    overview: { icon: Eye, items: analysis.overview?.length ? analysis.overview : [t("overview")] },
    highlights: { icon: FileText, items: analysis.highlights || [] },
    stakeholders: { icon: Users, items: analysis.stakeholders || [] },
    penalties: { icon: AlertTriangle, items: analysis.penalties || [] },
    timeline: { icon: Calendar, items: analysis.timeline || [] },
  };

  const tabLabels: Record<string, string> = {
    overview: t("overview"), highlights: t("highlights"), stakeholders: t("stakeholders"),
    penalties: t("penalties"), timeline: t("timeline"),
  };

  const isClauseBookmarked = (clauseId: string) => bookmarks?.some((b) => b.clause_id === clauseId);

  const handleToggleBookmark = (clauseId: string) => {
    if (!docId) return;
    const existing = bookmarks?.find((b) => b.clause_id === clauseId);
    if (existing) {
      deleteBookmark.mutate({ id: existing.id, documentId: docId });
    } else {
      addBookmark.mutate({ documentId: docId, clauseId });
    }
  };

  const handleAddAnnotation = () => {
    if (!docId || !annotationNote.trim()) return;
    addBookmark.mutate({ documentId: docId, note: annotationNote });
    setAnnotationNote("");
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    createTag.mutate({ name: newTagName.trim(), color });
    setNewTagName("");
  };

  const handleVersionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && docId) createVersion.mutate({ documentId: docId, file });
  };

  // AI Summarization
  const handleSummarize = useCallback(async (targetLang?: string) => {
    if (!document) return;
    const langToUse = targetLang || summaryLang;
    setIsSummarizing(true);
    setAiSummary("");
    setHasSummarized(true);

    // Build bill-like object from document data
    const billData = {
      title: document.name,
      sector: document.sector || "General",
      state: document.state || "Central",
      financial_year: document.financial_year || "2024-25",
      status: document.status || "Uploaded",
      ministry: "Not specified",
      bill_type: "Uploaded Document",
      introduced_date: document.created_at,
      description: analysis.summary || document.name,
    };

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-bill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ bill: billData, language: langToUse }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed to summarize" }));
        throw new Error(err.error || "Failed to summarize");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setAiSummary(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      toast({
        title: "Summarization failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  }, [document, summaryLang, analysis.summary]);

  const handleLanguageChange = (newLang: string) => {
    setSummaryLang(newLang);
    if (hasSummarized && !isSummarizing) {
      handleSummarize(newLang);
    }
  };

  const handleSpeak = useCallback(() => {
    if (!aiSummary) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(aiSummary);
    utterance.lang = SPEECH_LANG_MAP[summaryLang] || "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({ title: "Audio Error", description: "Speech synthesis is not available on this device.", variant: "destructive" });
    };
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [aiSummary, summaryLang, isSpeaking]);

  const handleExportSummaryPDF = useCallback(() => {
    if (!document || !aiSummary) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(document.name, 15, 20, { maxWidth: 180 });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Status: ${document.status} | Uploaded: ${new Date(document.created_at).toLocaleDateString("en-IN")}`, 15, 35);
    doc.setDrawColor(200);
    doc.line(15, 38, 195, 38);
    doc.setFontSize(11);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(aiSummary, 175);
    let y = 45;
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 15, y);
      y += 6;
    }
    doc.save(`${document.name.slice(0, 50).replace(/[^a-zA-Z0-9]/g, "_")}_summary.pdf`);
    toast({ title: "PDF downloaded", description: "Summary exported successfully" });
  }, [document, aiSummary]);

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-bg" />
      <div className="page-bg-accent" />
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t("document_analysis")}</h1>
            <p className="page-subtitle">{document ? document.name : t("select_document")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {documents && documents.length > 0 && (
              <Select value={docId || ""} onValueChange={(val) => navigate(`/analysis?id=${val}`)}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder={t("select_document")} />
                </SelectTrigger>
                <SelectContent>
                  {documents.filter((d) => d.status === "analyzed").map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {document && document.status === "analyzed" && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm"><Tag className="h-4 w-4 mr-1" />Tags</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 space-y-3">
                    <div className="flex gap-2">
                      <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="New tag..." className="h-8 text-sm" onKeyDown={(e) => e.key === "Enter" && handleCreateTag()} />
                      <Button size="sm" variant="ghost" onClick={handleCreateTag}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {(allTags || []).map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => docId && toggleTag.mutate({ documentId: docId, tagId: tag.id, linked: linkedTagIds.has(tag.id) })}
                          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${linkedTagIds.has(tag.id) ? "bg-primary/10 text-primary" : "hover:bg-accent/50 text-foreground"}`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full bg-${tag.color}-500`} style={{ backgroundColor: `var(--${tag.color}, hsl(var(--primary)))` }} />
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => exportAsPDF(document)}>{t("export_pdf")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportAsCSV(document)}>{t("export_csv")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><History className="h-4 w-4 mr-1" />{t("document_history")}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{t("document_history")}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleVersionUpload} accept=".pdf,.doc,.docx,.txt" />
                        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={createVersion.isPending}>
                          <Upload className="h-4 w-4 mr-1" />Upload New Version
                        </Button>
                      </div>
                      {(!versions || versions.length === 0) ? (
                        <p className="text-sm text-muted-foreground">{t("no_versions")}</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {versions.map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                              <div>
                                <p className="text-sm font-medium text-foreground">{t("version")} {v.version_number}</p>
                                <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
                              </div>
                              <Badge variant="secondary">{(v.file_size / 1024).toFixed(0)} KB</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={() => navigate(`/chat?docId=${document.id}`)}>
                  <MessageSquare className="h-4 w-4 mr-1" />Ask AI
                </Button>
              </>
            )}
          </div>
        </div>

        {docTagLinks && docTagLinks.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {docTagLinks.map((link: any) => (
              <Badge key={link.id} variant="secondary" className="text-xs">
                {(link as any).document_tags?.name || "Tag"}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {!document ? (
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No document selected</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload a document first, or select one from the dropdown above.</p>
          <Button onClick={() => navigate("/upload")} className="gradient-primary text-primary-foreground">{t("upload_bill")}</Button>
        </div>
      ) : document.status === "processing" ? (
        <div className="glass-card p-12 text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing document...</h3>
          <p className="text-sm text-muted-foreground">AI is processing your document. This may take a moment.</p>
        </div>
      ) : (
        <>
          {/* AI Detailed Summary Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button
                onClick={() => handleSummarize()}
                disabled={isSummarizing}
                size="sm"
                className="gap-2"
              >
                {isSummarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {isSummarizing ? "Summarizing..." : hasSummarized ? "Re-summarize" : "Summarize Document"}
              </Button>

              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <Select value={summaryLang} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUMMARY_LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasSummarized && aiSummary && !isSummarizing && (
                <>
                  <Button
                    variant={isSpeaking ? "default" : "outline"}
                    size="sm"
                    onClick={handleSpeak}
                    className="gap-1"
                  >
                    {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    {isSpeaking ? "Stop" : "Listen"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportSummaryPDF} className="gap-1">
                    <Download className="h-3.5 w-3.5" />
                    Export PDF
                  </Button>
                </>
              )}
            </div>

            {hasSummarized && (
              <ScrollArea className="max-h-[50vh]">
                <div className="pr-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Detailed AI Summary</h3>
                    {summaryLang !== "en" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {SUMMARY_LANGUAGES.find(l => l.value === summaryLang)?.label}
                      </span>
                    )}
                  </div>
                  {aiSummary ? (
                    <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {aiSummary}
                    </div>
                  ) : isSummarizing ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating detailed summary...
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            )}

            {!hasSummarized && analysis.summary && (
              <div>
                <h3 className="section-title mb-2">{t("summary")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
                <div className="flex gap-4 mt-4">
                  {document.token_count && <Badge variant="secondary">{document.token_count.toLocaleString()} tokens</Badge>}
                  {document.compression_rate && (
                    <Badge className="bg-success/10 text-success border-success/20">{document.compression_rate}% compression</Badge>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Annotations section */}
          {bookmarks && bookmarks.filter((b) => b.note && !b.clause_id).length > 0 && (
            <div className="glass-card p-4 mb-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Bookmark className="h-4 w-4 text-primary" />Your Notes</h4>
              {bookmarks.filter((b) => b.note && !b.clause_id).map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-warning/5 border border-warning/20 rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground">{b.note}</span>
                  <button onClick={() => docId && deleteBookmark.mutate({ id: b.id, documentId: docId })} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <Input value={annotationNote} onChange={(e) => setAnnotationNote(e.target.value)} placeholder="Add a note to this document..." className="flex-1" onKeyDown={(e) => e.key === "Enter" && handleAddAnnotation()} />
            <Button size="sm" onClick={handleAddAnnotation} disabled={!annotationNote.trim()} variant="outline">
              <Plus className="h-4 w-4 mr-1" />Add Note
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-1 h-auto bg-secondary/50 p-1 rounded-xl">
              {Object.entries(tabLabels).map(([key, label]) => {
                const Icon = tabData[key].icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2 text-sm">
                    <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
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

          {(analysis.clauses || []).length > 0 && (
            <div>
              <h3 className="section-title mb-4 flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />Full Clause Breakdown
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {analysis.clauses.map((clause: any) => (
                  <AccordionItem key={clause.id} value={clause.id} className="glass-card border-0 px-4 rounded-xl overflow-hidden">
                    <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                      <div className="flex items-center gap-3 w-full">
                        <Badge variant="secondary" className="text-xs">{clause.id}</Badge>
                        <span className="flex-1 text-left">{clause.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleBookmark(clause.id); }}
                          className="ml-2 shrink-0"
                        >
                          {isClauseBookmarked(clause.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
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
