import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Calendar, Briefcase, ExternalLink, ChevronDown, X, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGovernmentBills, GovernmentBill } from "@/hooks/useGovernmentBills";
import { Loader2 } from "lucide-react";

const SECTORS = [
  "All", "Agriculture", "Education", "Energy", "Environment", "Finance",
  "Food", "Governance", "Health", "Industry", "Law & Justice", "Mining", "Technology",
];

const INDIAN_STATES = [
  "All", "Central", "Andhra Pradesh", "Bihar", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

const FY_OPTIONS = ["All", "2025-26", "2024-25", "2023-24", "2022-23"];

const STATUS_COLORS: Record<string, string> = {
  Enacted: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Passed: "bg-blue-500/10 text-blue-600 border-blue-200",
  "Under Review": "bg-amber-500/10 text-amber-600 border-amber-200",
  Introduced: "bg-purple-500/10 text-purple-600 border-purple-200",
};

export default function BillDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [fyFilter, setFyFilter] = useState("All");
  const [selectedBill, setSelectedBill] = useState<GovernmentBill | null>(null);
  const { data: bills, isLoading } = useGovernmentBills();

  const filtered = useMemo(() => {
    if (!bills) return [];
    return bills.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || b.title.toLowerCase().includes(q) || (b.description || "").toLowerCase().includes(q);
      const matchSector = sectorFilter === "All" || b.sector === sectorFilter;
      const matchState = stateFilter === "All" || b.state === stateFilter;
      const matchFY = fyFilter === "All" || b.financial_year === fyFilter;
      return matchSearch && matchSector && matchState && matchFY;
    });
  }, [bills, searchQuery, sectorFilter, stateFilter, fyFilter]);

  // Group by financial year
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((b) => {
      if (!groups[b.financial_year]) groups[b.financial_year] = [];
      groups[b.financial_year].push(b);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="page-container">
      <div className="page-bg" />
      <div className="page-bg-accent" />
      <div className="page-header">
        <h1 className="page-title">Bill Directory</h1>
        <p className="page-subtitle">Browse Indian legislation by sector, state, and financial year</p>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <Briefcase className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="h-9 w-[170px] text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={fyFilter} onValueChange={setFyFilter}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FY_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span>{filtered.length} bill{filtered.length !== 1 ? "s" : ""} found</span>
          {(sectorFilter !== "All" || stateFilter !== "All" || fyFilter !== "All") && (
            <button
              onClick={() => { setSectorFilter("All"); setStateFilter("All"); setFyFilter("All"); }}
              className="text-primary hover:underline ml-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </motion.div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : grouped.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">No bills match your filters</div>
      ) : (
        grouped.map(([fy, bills], gi) => (
          <motion.div
            key={fy}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Financial Year {fy}</h2>
              <Badge variant="secondary" className="text-xs">{bills.length}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {bills.map((bill) => (
                <motion.div
                  key={bill.id}
                  whileHover={{ y: -2 }}
                  className="glass-card p-4 flex flex-col gap-3 cursor-pointer"
                  onClick={() => setSelectedBill(bill)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{bill.title}</h3>
                    <span className={`text-[10px] shrink-0 px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[bill.status] || "bg-muted text-muted-foreground"}`}>
                      {bill.status}
                    </span>
                  </div>

                  {bill.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{bill.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      <Briefcase className="h-2.5 w-2.5 mr-1" />{bill.sector}
                    </span>
                    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5 mr-1" />{bill.state}
                    </span>
                    {bill.ministry && (
                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground max-w-[180px] truncate">
                        {bill.ministry}
                      </span>
                    )}
                  </div>

                  {bill.introduced_date && (
                    <p className="text-[10px] text-muted-foreground">
                      Introduced: {new Date(bill.introduced_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))
      )}
      {/* Bill Detail Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedBill && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg leading-snug pr-6">{selectedBill.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[selectedBill.status] || "bg-muted text-muted-foreground"}`}>
                    {selectedBill.status}
                  </span>
                  <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                    <Briefcase className="h-3 w-3 mr-1" />{selectedBill.sector}
                  </span>
                  <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />{selectedBill.state}
                  </span>
                  <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />FY {selectedBill.financial_year}
                  </span>
                </div>

                {selectedBill.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedBill.description}</p>
                  </div>
                )}

                {selectedBill.ministry && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Ministry</h4>
                    <p className="text-sm text-muted-foreground">{selectedBill.ministry}</p>
                  </div>
                )}

                {selectedBill.bill_type && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Bill Type</h4>
                    <p className="text-sm text-muted-foreground">{selectedBill.bill_type}</p>
                  </div>
                )}

                {selectedBill.introduced_date && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Introduced Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedBill.introduced_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                )}

                {selectedBill.source_url && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={selectedBill.source_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      View Source Document
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
