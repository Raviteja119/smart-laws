import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, AlertTriangle, Calendar, List, Eye } from "lucide-react";

const tabData: Record<string, { icon: React.ElementType; items: string[] }> = {
  overview: {
    icon: Eye,
    items: [
      "This bill introduces comprehensive data protection regulations for digital personal data in India.",
      "Establishes a Data Protection Board of India as the regulatory body.",
      "Applies to processing of digital personal data within and outside India.",
      "Introduces consent-based framework for data processing.",
    ],
  },
  highlights: {
    icon: FileText,
    items: [
      "New tax regulation introduced for digital services",
      "MSME compliance requirements simplified",
      "Data privacy amendments strengthen citizen rights",
      "Cross-border data transfer restrictions updated",
      "Significant financial penalties for non-compliance",
    ],
  },
  stakeholders: {
    icon: Users,
    items: [
      "Citizens: Enhanced data rights and consent mechanisms",
      "IT Companies: New compliance and reporting requirements",
      "Government: Expanded oversight and regulatory powers",
      "MSMEs: Simplified compliance framework with exemptions",
      "Foreign Entities: Cross-border data transfer regulations",
    ],
  },
  penalties: {
    icon: AlertTriangle,
    items: [
      "Up to ₹250 Crore for data breaches due to negligence",
      "Up to ₹200 Crore for non-compliance with children's data norms",
      "Up to ₹150 Crore for failure to notify data breaches",
      "Up to ₹50 Crore for other violations",
    ],
  },
  timeline: {
    icon: Calendar,
    items: [
      "2026 Q1: Bill introduced in Parliament",
      "2026 Q2: Standing Committee review period",
      "2026 Q3: Expected passage and Presidential assent",
      "2027 Q1: Compliance deadline for large enterprises",
      "2027 Q3: Compliance deadline for MSMEs",
    ],
  },
};

const clauses = [
  { id: "1", title: "Chapter I – Preliminary", content: "Defines scope, applicability, and key definitions including 'data fiduciary', 'data processor', 'digital personal data', and 'data principal'. Establishes territorial applicability within and outside India." },
  { id: "2", title: "Chapter II – Obligations of Data Fiduciary", content: "Outlines mandatory obligations including purpose limitation, data minimization, storage limitation, accuracy requirements, and security safeguards." },
  { id: "3", title: "Chapter III – Rights of Data Principal", content: "Establishes right to access, right to correction and erasure, right to grievance redressal, and right to nominate." },
  { id: "4", title: "Chapter IV – Special Provisions", content: "Special provisions for processing children's data, significant data fiduciaries, and government exemptions." },
];

export default function DocumentAnalysis() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Document Analysis</h1>
        <p className="page-subtitle">Digital Personal Data Protection Bill, 2026</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto bg-secondary/50 p-1 rounded-xl">
          {Object.entries({ overview: "Overview", highlights: "Key Highlights", stakeholders: "Stakeholders", penalties: "Penalties", timeline: "Timeline" }).map(([key, label]) => {
            const Icon = tabData[key].icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2 text-sm">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <AnimatePresence mode="wait">
          {Object.entries(tabData).map(([key, data]) => (
            <TabsContent key={key} value={key}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6">
                <ul className="space-y-3">
                  {data.items.map((item, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full gradient-primary shrink-0" />
                      <span className="text-sm text-foreground leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>

      <div>
        <h3 className="section-title mb-4 flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          Full Clause Breakdown
        </h3>
        <Accordion type="single" collapsible className="space-y-2">
          {clauses.map((clause) => (
            <AccordionItem key={clause.id} value={clause.id} className="glass-card border-0 px-4 rounded-xl overflow-hidden">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">{clause.id}</Badge>
                  {clause.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                {clause.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
