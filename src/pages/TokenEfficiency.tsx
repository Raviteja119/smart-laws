import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Zap, ArrowDown, DollarSign, Leaf, Activity, TrendingDown } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";

const funnelData = [
  { name: "Original Tokens", value: 120000, fill: "hsl(221, 83%, 53%)" },
  { name: "After Chunking", value: 35000, fill: "hsl(262, 83%, 58%)" },
  { name: "After Compression", value: 8000, fill: "hsl(38, 92%, 50%)" },
  { name: "Sent to AI", value: 2500, fill: "hsl(142, 71%, 45%)" },
];

const densityData = [{ value: 87, fill: "hsl(221, 83%, 53%)" }];

export default function TokenEfficiency() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Token Efficiency Dashboard</h1>
        <p className="page-subtitle">Monitor compression performance and cost savings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Original Tokens" value="120,000" icon={Activity} />
        <StatCard title="Compressed Tokens" value="35,000" change="70.8% reduction" icon={TrendingDown} gradient="gradient-success" />
        <StatCard title="Tokens Sent to AI" value="2,500" change="97.9% reduction" icon={Zap} gradient="gradient-primary" />
        <StatCard title="Compression Rate" value="97.9%" icon={ArrowDown} gradient="gradient-warning" />
        <StatCard title="Estimated Cost Saved" value="₹2,340" change="vs. uncompressed" icon={DollarSign} gradient="gradient-success" />
        <StatCard title="Energy Saved" value="3.2 kWh" change="~2.1 kg CO₂ avoided" icon={Leaf} gradient="gradient-success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="section-title mb-6">Token Compression Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical" barSize={32}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(214, 20%, 92%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 47%)" />
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(214, 20%, 92%)" }} formatter={(v: number) => [v.toLocaleString() + " tokens", ""]} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <span>120,000</span>
            <ArrowDown className="h-3 w-3" />
            <span>35,000</span>
            <ArrowDown className="h-3 w-3" />
            <span>8,000</span>
            <ArrowDown className="h-3 w-3" />
            <span className="font-semibold text-success">2,500</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 flex flex-col items-center">
          <h3 className="section-title mb-6 self-start">Information Density Score</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={densityData} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={12} fill="hsl(221, 83%, 53%)" />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="-mt-16 text-center">
            <p className="text-5xl font-bold text-foreground">87%</p>
            <p className="text-sm text-muted-foreground mt-1">Information Density</p>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-8 max-w-xs">
            High density means maximum information preserved with minimal token usage
          </p>
        </motion.div>
      </div>
    </div>
  );
}
