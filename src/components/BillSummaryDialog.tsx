import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, BookOpen, ExternalLink, Briefcase, MapPin, Calendar, Download, Globe, Volume2, VolumeX } from "lucide-react";
import { GovernmentBill } from "@/hooks/useGovernmentBills";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import jsPDF from "jspdf";

const STATUS_COLORS: Record<string, string> = {
  Enacted: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Passed: "bg-blue-500/10 text-blue-600 border-blue-200",
  "Under Review": "bg-amber-500/10 text-amber-600 border-amber-200",
  Introduced: "bg-purple-500/10 text-purple-600 border-purple-200",
};

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

interface BillSummaryDialogProps {
  bill: GovernmentBill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillSummaryDialog({ bill, open, onOpenChange }: BillSummaryDialogProps) {
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [hasSummarized, setHasSummarized] = useState(false);
  const [summaryLang, setSummaryLang] = useState("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { lang } = useLanguage();

  const handleExportPDF = useCallback(() => {
    if (!bill || !summary) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(bill.title, 15, 20, { maxWidth: 180 });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Sector: ${bill.sector} | State: ${bill.state} | FY: ${bill.financial_year} | Status: ${bill.status}`, 15, 35);
    doc.setDrawColor(200);
    doc.line(15, 38, 195, 38);
    doc.setFontSize(11);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(summary, 175);
    let y = 45;
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 15, y);
      y += 6;
    }
    doc.save(`${bill.title.slice(0, 50).replace(/[^a-zA-Z0-9]/g, "_")}_summary.pdf`);
    toast({ title: "PDF downloaded", description: "Summary exported successfully" });
  }, [bill, summary]);

  const handleSummarize = useCallback(async (targetLang?: string) => {
    if (!bill) return;
    const langToUse = targetLang || summaryLang;
    setIsSummarizing(true);
    setSummary("");
    setHasSummarized(true);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-bill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ bill, language: langToUse }),
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
              setSummary(accumulated);
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
  }, [bill, summaryLang]);

  const handleLanguageChange = (newLang: string) => {
    setSummaryLang(newLang);
    if (hasSummarized && !isSummarizing) {
      handleSummarize(newLang);
    }
  };

  const handleSpeak = useCallback(() => {
    if (!summary) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(summary);
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
  }, [summary, summaryLang, isSpeaking]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSummary("");
      setHasSummarized(false);
      setIsSummarizing(false);
      setSummaryLang("en");
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    onOpenChange(isOpen);
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg leading-snug pr-6">{bill.title}</DialogTitle>
          <DialogDescription className="sr-only">Details and summary for {bill.title}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[bill.status] || "bg-muted text-muted-foreground"}`}>
            {bill.status}
          </span>
          <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
            <Briefcase className="h-3 w-3 mr-1" />{bill.sector}
          </span>
          <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />{bill.state}
          </span>
          <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />FY {bill.financial_year}
          </span>
        </div>

        {bill.description && !hasSummarized && (
          <p className="text-sm text-muted-foreground mb-3">{bill.description}</p>
        )}

        {bill.ministry && !hasSummarized && (
          <p className="text-xs text-muted-foreground"><strong>Ministry:</strong> {bill.ministry}</p>
        )}

        {bill.introduced_date && !hasSummarized && (
          <p className="text-xs text-muted-foreground mb-3">
            <strong>Introduced:</strong> {new Date(bill.introduced_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          <Button
            onClick={() => handleSummarize()}
            disabled={isSummarizing}
            size="sm"
            className="gap-2"
          >
            {isSummarizing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {isSummarizing ? "Summarizing..." : hasSummarized ? "Re-summarize" : "Summarize Bill"}
          </Button>

          {/* Language translator dropdown */}
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

          {hasSummarized && summary && !isSummarizing && (
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
              <Button variant="outline" size="sm" onClick={() => handleExportPDF()} className="gap-1">
                <Download className="h-3.5 w-3.5" />
                Export PDF
              </Button>
            </>
          )}

          {bill.source_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={bill.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View Source
              </a>
            </Button>
          )}
        </div>

        {/* Summary content */}
        {hasSummarized && (
          <ScrollArea className="flex-1 min-h-0 max-h-[50vh]">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Detailed Summary</h3>
                {summaryLang !== "en" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {SUMMARY_LANGUAGES.find(l => l.value === summaryLang)?.label}
                  </span>
                )}
              </div>
              {summary ? (
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {summary}
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
      </DialogContent>
    </Dialog>
  );
}
