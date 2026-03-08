import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, X, Loader2, AlertCircle, Sparkles, CloudUpload } from "lucide-react";
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
    } catch {
      // handled by mutation
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="page-container">
      <div className="page-bg" />
      <div className="page-bg-accent" />
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
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`glass-card-vivid p-12 text-center cursor-pointer transition-all duration-500 border-2 border-dashed relative overflow-hidden ${
            isDragging ? "border-primary bg-primary/5 scale-[1.02] glow-primary" : "border-border/50 hover:border-primary/50"
          }`}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
          
          <motion.div 
            animate={isDragging ? { scale: 1.2, y: -5 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative z-10 mx-auto mb-6"
          >
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-xl shadow-primary/25"
            >
              <CloudUpload className="h-10 w-10 text-primary-foreground" />
            </motion.div>
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground mb-2 font-display relative z-10">
            Upload Parliamentary Bill or Policy Document
          </h3>
          <p className="text-sm text-muted-foreground mb-5 relative z-10">
            Drag and drop your file here, or click to browse
          </p>
          <div className="flex items-center justify-center gap-2 relative z-10">
            {["PDF", "DOCX", "TXT"].map((fmt, i) => (
              <motion.span 
                key={fmt}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="px-4 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary border border-primary/20"
              >
                {fmt}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {uploadMutation.isPending && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card-vivid p-6 mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
                <span className="text-sm font-medium text-foreground">AI is analyzing your document...</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground">Extracting insights, stakeholders, and key provisions</p>
            </motion.div>
          )}

          {uploadMutation.isError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mt-6 border-destructive/30">
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
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="glass-card-vivid p-6 mt-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"
                  >
                    <FileText className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button onClick={handleUpload} className="w-full h-11 gradient-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Document with AI
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
