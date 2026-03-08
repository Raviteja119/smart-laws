import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadDocument } from "@/hooks/useDocuments";

export default function UploadBill() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const uploadMutation = useUploadDocument();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const doc = await uploadMutation.mutateAsync(selectedFile);
      navigate(`/analysis?id=${doc.id}`);
    } catch (e: any) {
      // error handled by mutation
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Upload Bill</h1>
        <p className="page-subtitle">Upload a parliamentary bill or policy document for AI analysis</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.doc"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
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
          {uploadMutation.isPending && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6 mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="text-sm font-medium text-foreground">Uploading and analyzing...</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground">This may take a moment while AI analyzes your document</p>
            </motion.div>
          )}

          {uploadMutation.isError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mt-6 border-destructive/50">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium text-foreground">Upload failed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{(uploadMutation.error as Error)?.message}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => uploadMutation.reset()}>
                Try Again
              </Button>
            </motion.div>
          )}

          {selectedFile && !uploadMutation.isPending && !uploadMutation.isSuccess && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleUpload} className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
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
