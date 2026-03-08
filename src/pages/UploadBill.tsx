import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadedFile {
  name: string;
  size: string;
  tokens: number;
}

export default function UploadBill() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const simulateUpload = useCallback((fileName: string) => {
    setUploading(true);
    setProgress(0);
    setUploaded(null);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploaded({ name: fileName, size: "2.4 MB", tokens: 124500 });
          return 100;
        }
        return p + 8;
      });
    }, 120);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateUpload(file.name);
  }, [simulateUpload]);

  const handleFileSelect = useCallback(() => {
    simulateUpload("Digital_Personal_Data_Protection_Bill_2026.pdf");
  }, [simulateUpload]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Upload Bill</h1>
        <p className="page-subtitle">Upload a parliamentary bill or policy document for AI analysis</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!uploading ? handleFileSelect : undefined}
          className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
            isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"
          }`}
        >
          <motion.div animate={isDragging ? { scale: 1.1 } : { scale: 1 }} className="mx-auto mb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Upload Parliamentary Bill or Policy Document
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <div className="flex items-center justify-center gap-2">
            {["PDF", "DOCX", "TXT"].map((fmt) => (
              <span key={fmt} className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {uploading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6 mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="text-sm font-medium text-foreground">Uploading and processing...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </motion.div>
          )}

          {uploaded && !uploading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{uploaded.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {uploaded.size} · {uploaded.tokens.toLocaleString()} tokens detected
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setUploaded(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <FileText className="mr-2 h-4 w-4" />
                Analyze Document
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
