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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="stat-card flex items-start justify-between group relative overflow-hidden"
    >
      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none rounded-xl" />
      
      <div className="space-y-2 relative z-10">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground font-display">{value}</p>
        {change && (
          <motion.p 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs font-medium text-success flex items-center gap-1"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            {change}
          </motion.p>
        )}
      </div>
      <motion.div 
        whileHover={{ rotate: 10, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${gradient} shadow-lg relative z-10`}
      >
        <Icon className="h-5 w-5 text-primary-foreground" />
      </motion.div>
    </motion.div>
  );
}
