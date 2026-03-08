import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  gradient?: string;
}

export function StatCard({ title, value, change, icon: Icon, gradient = "gradient-primary" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card flex items-start justify-between"
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {change && (
          <p className="text-xs font-medium text-success">{change}</p>
        )}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${gradient}`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
    </motion.div>
  );
}
