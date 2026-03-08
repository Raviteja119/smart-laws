import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { FileText, Zap, FolderOpen, Leaf, Search, Filter } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tokenData = [
  { month: "Jan", original: 120000, compressed: 35000 },
  { month: "Feb", original: 95000, compressed: 28000 },
  { month: "Mar", original: 140000, compressed: 40000 },
  { month: "Apr", original: 110000, compressed: 30000 },
  { month: "May", original: 160000, compressed: 42000 },
  { month: "Jun", original: 130000, compressed: 36000 },
];

const docsOverTime = [
  { month: "Jan", docs: 12 },
  { month: "Feb", docs: 19 },
  { month: "Mar", docs: 25 },
  { month: "Apr", docs: 31 },
  { month: "May", docs: 44 },
  { month: "Jun", docs: 58 },
];

const recentDocs = [
  { name: "Digital Personal Data Protection Bill", date: "2026-03-05", compression: 78, status: "Analyzed" },
  { name: "Finance Bill 2026", date: "2026-03-03", compression: 72, status: "Analyzed" },
  { name: "Telecommunications Act Amendment", date: "2026-03-01", compression: 81, status: "Analyzed" },
  { name: "Labour Code on Social Security", date: "2026-02-28", compression: 69, status: "Processing" },
  { name: "National Education Policy Draft", date: "2026-02-25", compression: 75, status: "Analyzed" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your legislative analysis activity</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <StatCard title="Total Bills Analyzed" value="142" change="+12 this month" icon={FileText} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Avg Token Compression" value="74%" change="+3% improvement" icon={Zap} gradient="gradient-success" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Documents Processed" value="1,847" change="+238 this month" icon={FolderOpen} gradient="gradient-warning" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Estimated Energy Saved" value="12.4 kWh" change="~₹890 saved" icon={Leaf} gradient="gradient-success" />
        </motion.div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="section-title mb-4">Token Reduction Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={tokenData}>
              <defs>
                <linearGradient id="colorOrig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(214, 20%, 92%)" }} />
              <Area type="monotone" dataKey="original" stroke="hsl(221, 83%, 53%)" fill="url(#colorOrig)" strokeWidth={2} name="Original" />
              <Area type="monotone" dataKey="compressed" stroke="hsl(142, 71%, 45%)" fill="url(#colorComp)" strokeWidth={2} name="Compressed" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="section-title mb-4">Documents Processed Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={docsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(214, 20%, 92%)" }} />
              <Bar dataKey="docs" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} name="Documents" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="section-title">Recent Documents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Document Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Compression</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentDocs.map((doc, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{doc.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{doc.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{doc.compression}%</td>
                  <td className="px-6 py-4">
                    <Badge variant={doc.status === "Analyzed" ? "default" : "secondary"} className="text-xs">
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
