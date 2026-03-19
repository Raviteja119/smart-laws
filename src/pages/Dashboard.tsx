import { useMemo, useState } from "react";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import {
  FileText, Zap, FolderOpen, Search, Filter, Trash2, Eye,
  Loader2, Upload, TrendingUp, Clock, Shield, Network, Briefcase, Globe,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments, useDeleteDocument } from "@/hooks/useDocuments";
import { useLanguage } from "@/contexts/LanguageContext";

const statuses = ["All", "analyzed", "processing"] as const;
const SECTORS = ["All", "Agriculture", "Education", "Energy", "Environment", "Finance", "Food", "Governance", "Health", "Industry", "Law & Justice", "Mining", "Technology", "Other"];
const COLORS = ["hsl(221, 83%, 53%)", "hsl(152, 76%, 44%)", "hsl(38, 92%, 50%)", "hsl(262, 83%, 58%)"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sectorFilter, setSectorFilter] = useState<string>("All");
  const navigate = useNavigate();
  const { data: documents, isLoading } = useDocuments();
  const deleteMutation = useDeleteDocument();

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
      const matchesSector = sectorFilter === "All" || (doc as any).sector === sectorFilter;
      return matchesSearch && matchesStatus && matchesSector;
    });
  }, [documents, searchQuery, statusFilter, sectorFilter]);

  const totalDocs = documents?.length || 0;
  const analyzedDocs = documents?.filter((d) => d.status === "analyzed") || [];
  const avgCompression = analyzedDocs.length
    ? Math.round(analyzedDocs.reduce((sum, d) => sum + (Number(d.compression_rate) || 0), 0) / analyzedDocs.length)
    : 0;
  const totalTokens = analyzedDocs.reduce((sum, d) => sum + (d.token_count || 0), 0);

  // Recent activity (last 7 days)
  const recentDocs = useMemo(() => {
    const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return (documents || []).filter(d => new Date(d.created_at).getTime() > week).length;
  }, [documents]);

  const docsOverTime = useMemo(() => {
    if (!documents?.length) return [];
    const months: Record<string, number> = {};
    documents.forEach((d) => {
      const date = new Date(d.created_at);
      const key = date.toLocaleString("default", { month: "short" });
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).map(([month, docs]) => ({ month, docs }));
  }, [documents]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    if (!documents?.length) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [documents]);

  // File type distribution
  const fileTypeDistribution = useMemo(() => {
    if (!documents?.length) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => {
      const ext = d.name.split(".").pop()?.toUpperCase() || "OTHER";
      counts[ext] = (counts[ext] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [documents]);

  return (
    <div className="page-container">
      <OnboardingTour />
      <div className="page-bg" />
      <div className="page-bg-accent" />
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your legislative analysis activity</p>
          </div>
          <Button onClick={() => navigate("/upload")} className="gradient-primary text-primary-foreground">
            <Upload className="h-4 w-4 mr-2" />Upload Bill
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <StatCard title="Total Documents" value={String(totalDocs)} change={`${analyzedDocs.length} analyzed`} icon={FileText} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="This Week" value={String(recentDocs)} change="recent uploads" icon={Clock} gradient="gradient-info" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Avg Compression" value={`${avgCompression}%`} icon={Zap} gradient="gradient-success" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Total Tokens" value={totalTokens.toLocaleString()} icon={FolderOpen} gradient="gradient-warning" />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Bill Directory", icon: Briefcase, url: "/bill-directory", color: "text-primary" },
          { label: "Knowledge Graph", icon: Network, url: "/knowledge-graph", color: "text-primary" },
          { label: "Compliance Check", icon: Shield, url: "/compliance", color: "text-success" },
          { label: "Compare Bills", icon: TrendingUp, url: "/comparison", color: "text-warning" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.url)}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <action.icon className={`h-6 w-6 ${action.color}`} />
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {docsOverTime.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 lg:col-span-2">
            <h3 className="section-title mb-4">Upload Trends</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={docsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
                <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(214, 20%, 92%)" }} />
                <Bar dataKey="docs" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} name="Documents" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {statusDistribution.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="section-title mb-4">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {statusDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Document Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card overflow-hidden">
        <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="section-title">Your Documents</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-56 rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[130px] text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <Briefcase className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Document Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Compression</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  {documents?.length === 0 ? "No documents yet. Upload your first bill!" : "No documents match your search"}
                </td></tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-border/30 last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{doc.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{doc.compression_rate ? `${doc.compression_rate}%` : "—"}</td>
                    <td className="px-6 py-4"><Badge variant={doc.status === "analyzed" ? "default" : "secondary"} className="text-xs capitalize">{doc.status}</Badge></td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/analysis?id=${doc.id}`)} disabled={doc.status !== "analyzed"}>
                        <Eye className="h-3.5 w-3.5 mr-1" />View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(doc)} disabled={deleteMutation.isPending}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
