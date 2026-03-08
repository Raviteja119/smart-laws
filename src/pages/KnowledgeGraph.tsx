import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDocument, useDocuments } from "@/hooks/useDocuments";
import { Loader2, Network, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GraphNode {
  id: string;
  label: string;
  type: "clause" | "stakeholder" | "penalty" | "topic";
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

const TYPE_COLORS: Record<string, string> = {
  clause: "hsl(221, 83%, 53%)",
  stakeholder: "hsl(152, 76%, 44%)",
  penalty: "hsl(0, 84%, 60%)",
  topic: "hsl(38, 92%, 50%)",
};

const TYPE_RADIUS: Record<string, number> = {
  clause: 28,
  stakeholder: 24,
  penalty: 22,
  topic: 20,
};

export default function KnowledgeGraph() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get("id");
  const { data: document, isLoading } = useDocument(docId);
  const { data: documents } = useDocuments();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const frameRef = useRef<number>(0);
  const [, forceRender] = useState(0);

  const { nodes: initNodes, edges: initEdges } = useMemo(() => {
    const analysis = (document?.analysis as any) || {};
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const cx = 400, cy = 300;

    // Clauses
    (analysis.clauses || []).forEach((c: any, i: number) => {
      const angle = (i / Math.max((analysis.clauses || []).length, 1)) * Math.PI * 2;
      nodes.push({ id: c.id, label: c.title || c.id, type: "clause", x: cx + Math.cos(angle) * 180 + (Math.random() - 0.5) * 40, y: cy + Math.sin(angle) * 180 + (Math.random() - 0.5) * 40, vx: 0, vy: 0 });
    });

    // Stakeholders
    (analysis.stakeholders || []).forEach((s: string, i: number) => {
      const id = `stakeholder-${i}`;
      const angle = (i / Math.max((analysis.stakeholders || []).length, 1)) * Math.PI * 2 + 0.5;
      nodes.push({ id, label: s.slice(0, 30), type: "stakeholder", x: cx + Math.cos(angle) * 120 + (Math.random() - 0.5) * 60, y: cy + Math.sin(angle) * 120 + (Math.random() - 0.5) * 60, vx: 0, vy: 0 });
      if (nodes.length > 1) edges.push({ source: id, target: nodes[Math.floor(Math.random() * Math.min(i, nodes.length - 1))].id, label: "related" });
    });

    // Penalties
    (analysis.penalties || []).forEach((p: string, i: number) => {
      const id = `penalty-${i}`;
      nodes.push({ id, label: p.slice(0, 25), type: "penalty", x: cx + (Math.random() - 0.5) * 300, y: cy + (Math.random() - 0.5) * 250, vx: 0, vy: 0 });
      if (analysis.clauses?.length) {
        edges.push({ source: id, target: analysis.clauses[Math.min(i, analysis.clauses.length - 1)].id, label: "enforces" });
      }
    });

    // Topics from highlights
    (analysis.highlights || []).slice(0, 5).forEach((h: string, i: number) => {
      const id = `topic-${i}`;
      nodes.push({ id, label: h.slice(0, 20), type: "topic", x: cx + (Math.random() - 0.5) * 350, y: cy + (Math.random() - 0.5) * 280, vx: 0, vy: 0 });
      // Connect to random clause
      if (analysis.clauses?.length) {
        edges.push({ source: id, target: analysis.clauses[i % analysis.clauses.length].id });
      }
    });

    // Inter-clause connections
    for (let i = 0; i < (analysis.clauses || []).length - 1; i++) {
      edges.push({ source: analysis.clauses[i].id, target: analysis.clauses[i + 1].id });
    }

    return { nodes, edges };
  }, [document]);

  useEffect(() => {
    nodesRef.current = initNodes.map(n => ({ ...n }));
    edgesRef.current = [...initEdges];
    forceRender(x => x + 1);
  }, [initNodes, initEdges]);

  // Simple force simulation
  useEffect(() => {
    const simulate = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      if (nodes.length === 0) return;

      const cx = 400, cy = 300;

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = 800 / (dist * dist);
          nodes[i].vx -= (dx / dist) * force;
          nodes[i].vy -= (dy / dist) * force;
          nodes[j].vx += (dx / dist) * force;
          nodes[j].vy += (dy / dist) * force;
        }
      }

      // Attraction along edges
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      edges.forEach(e => {
        const s = nodeMap.get(e.source);
        const t = nodeMap.get(e.target);
        if (!s || !t) return;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (dist - 120) * 0.01;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
        t.vx -= (dx / dist) * force;
        t.vy -= (dy / dist) * force;
      });

      // Center gravity
      nodes.forEach(n => {
        n.vx += (cx - n.x) * 0.001;
        n.vy += (cy - n.y) * 0.001;
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
      });

      // Draw
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(zoom, zoom);

      // Edges
      ctx.strokeStyle = "rgba(150, 150, 170, 0.3)";
      ctx.lineWidth = 1.5;
      edges.forEach(e => {
        const s = nodeMap.get(e.source);
        const t = nodeMap.get(e.target);
        if (!s || !t) return;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      });

      // Nodes
      nodes.forEach(n => {
        const r = TYPE_RADIUS[n.type] || 20;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = TYPE_COLORS[n.type] || "#888";
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxChars = Math.floor(r / 4);
        const label = n.label.length > maxChars ? n.label.slice(0, maxChars) + "…" : n.label;
        ctx.fillText(label, n.x, n.y);
      });

      ctx.restore();
      frameRef.current = requestAnimationFrame(simulate);
    };

    frameRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [zoom, initNodes]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / zoom;
    const my = (e.clientY - rect.top) / zoom;
    const found = nodesRef.current.find(n => {
      const r = TYPE_RADIUS[n.type] || 20;
      return Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2) < r;
    });
    setHoveredNode(found || null);
  }, [zoom]);

  if (isLoading) {
    return <div className="page-container flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-bg" />
      <div className="page-bg-accent" />
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Knowledge Graph</h1>
            <p className="page-subtitle">Visual relationships between clauses, stakeholders & penalties</p>
          </div>
          <div className="flex items-center gap-2">
            {documents && documents.filter(d => d.status === "analyzed").length > 0 && (
              <Select value={docId || ""} onValueChange={(val) => navigate(`/knowledge-graph?id=${val}`)}>
                <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select document" /></SelectTrigger>
                <SelectContent>
                  {documents.filter(d => d.status === "analyzed").map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {!document ? (
        <div className="glass-card p-12 text-center">
          <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Select a document</h3>
          <p className="text-sm text-muted-foreground">Choose an analyzed document to visualize its knowledge graph.</p>
        </div>
      ) : (
        <div className="glass-card p-4 relative">
          <div className="flex items-center gap-2 mb-3">
            <Button size="sm" variant="ghost" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}><ZoomIn className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}><ZoomOut className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom(1)}><RotateCcw className="h-4 w-4" /></Button>
            <div className="flex gap-3 ml-4">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-muted-foreground capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full rounded-lg bg-background/50 border border-border/50 cursor-crosshair"
            style={{ maxHeight: "600px" }}
            onMouseMove={handleCanvasMouseMove}
          />
          {hoveredNode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-6 left-6 glass-card p-3 max-w-xs">
              <Badge style={{ backgroundColor: TYPE_COLORS[hoveredNode.type] }} className="text-white mb-1">{hoveredNode.type}</Badge>
              <p className="text-sm text-foreground font-medium">{hoveredNode.label}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
