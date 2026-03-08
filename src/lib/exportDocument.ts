import jsPDF from "jspdf";
import type { Document } from "@/hooks/useDocuments";

export function exportAsCSV(doc: Document) {
  const analysis = doc.analysis as any || {};
  const rows: string[][] = [
    ["Document Name", doc.name],
    ["Status", doc.status],
    ["Tokens", String(doc.token_count || "N/A")],
    ["Compression Rate", `${doc.compression_rate || 0}%`],
    ["Uploaded", new Date(doc.created_at).toLocaleDateString()],
    [],
    ["Summary"],
    [analysis.summary || "N/A"],
    [],
    ["Overview"],
    ...(analysis.overview || []).map((item: string) => [item]),
    [],
    ["Key Highlights"],
    ...(analysis.highlights || []).map((item: string) => [item]),
    [],
    ["Stakeholders"],
    ...(analysis.stakeholders || []).map((item: string) => [item]),
    [],
    ["Penalties"],
    ...(analysis.penalties || []).map((item: string) => [item]),
    [],
    ["Timeline"],
    ...(analysis.timeline || []).map((item: string) => [item]),
  ];

  const csvContent = rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  downloadFile(csvContent, `${doc.name}-analysis.csv`, "text/csv");
}

export function exportAsPDF(doc: Document) {
  const analysis = doc.analysis as any || {};
  const pdf = new jsPDF();
  let y = 20;

  const addTitle = (text: string) => {
    if (y > 260) { pdf.addPage(); y = 20; }
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(text, 14, y);
    y += 8;
  };

  const addText = (text: string) => {
    if (y > 270) { pdf.addPage(); y = 20; }
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(text, 180);
    pdf.text(lines, 14, y);
    y += lines.length * 5 + 3;
  };

  const addBullets = (items: string[]) => {
    items.forEach((item) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(`• ${item}`, 175);
      pdf.text(lines, 18, y);
      y += lines.length * 5 + 2;
    });
  };

  // Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Document Analysis Report", 14, y);
  y += 10;
  addText(`Document: ${doc.name}`);
  addText(`Date: ${new Date(doc.created_at).toLocaleDateString()}`);
  addText(`Tokens: ${doc.token_count?.toLocaleString() || "N/A"} | Compression: ${doc.compression_rate || 0}%`);
  y += 5;

  if (analysis.summary) {
    addTitle("Summary");
    addText(analysis.summary);
    y += 3;
  }

  const sections: [string, string[]][] = [
    ["Overview", analysis.overview || []],
    ["Key Highlights", analysis.highlights || []],
    ["Stakeholders", analysis.stakeholders || []],
    ["Penalties", analysis.penalties || []],
    ["Timeline", analysis.timeline || []],
  ];

  sections.forEach(([title, items]) => {
    if (items.length > 0) {
      addTitle(title);
      addBullets(items);
      y += 3;
    }
  });

  if (analysis.clauses?.length) {
    addTitle("Clause Breakdown");
    analysis.clauses.forEach((clause: any) => {
      addText(`[${clause.id}] ${clause.title}`);
      addText(clause.content);
      y += 2;
    });
  }

  pdf.save(`${doc.name}-analysis.pdf`);
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
