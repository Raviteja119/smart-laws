import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "ai";
  content: string;
  clause?: string;
}

const suggestedQuestions = [
  "How does this bill affect small businesses?",
  "What are the penalties mentioned?",
  "When does the law take effect?",
  "What data rights do citizens get?",
];

const aiResponses: Record<string, { answer: string; clause: string }> = {
  "How does this bill affect small businesses?": {
    answer: "The bill provides simplified compliance mechanisms for MSMEs. Small businesses with turnover below ₹20 crore will have reduced reporting obligations and an extended compliance timeline until Q3 2027. However, they must still obtain valid consent before processing personal data.",
    clause: "Chapter IV, Section 17(2)",
  },
  "What are the penalties mentioned?": {
    answer: "The bill outlines significant penalties: up to ₹250 Crore for data breaches due to negligence, ₹200 Crore for violations involving children's data, ₹150 Crore for failure to notify breaches, and ₹50 Crore for other non-compliance.",
    clause: "Chapter VI, Schedule I",
  },
  "When does the law take effect?": {
    answer: "The bill is expected to receive Presidential assent in Q3 2026. Large enterprises must comply by Q1 2027, while MSMEs have an extended deadline until Q3 2027.",
    clause: "Chapter VIII, Section 44",
  },
  default: {
    answer: "Based on my analysis of the Digital Personal Data Protection Bill 2026, this provision establishes a framework for data processing that balances individual rights with business needs. The bill creates a consent-based system with specific exemptions for government functions and research purposes.",
    clause: "General Analysis",
  },
};

export default function AskTheBill() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setTyping(true);

    const response = aiResponses[text] || aiResponses.default;
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "ai", content: response.answer, clause: response.clause }]);
    }, 1500);
  };

  return (
    <div className="page-container flex flex-col h-[calc(100vh-3.5rem)] md:h-screen !pb-0">
      <div className="page-header shrink-0">
        <h1 className="page-title">Ask the Bill</h1>
        <p className="page-subtitle">Chat with AI about the Digital Personal Data Protection Bill</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ask anything about the bill</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Get AI-powered answers with clause-level references
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
              {suggestedQuestions.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} className="glass-card p-3 text-left text-sm text-foreground hover:bg-accent/50 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "ai" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[75%] space-y-2 ${msg.role === "user" ? "order-first" : ""}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "glass-card rounded-bl-md"
                }`}>
                  {msg.content}
                </div>
                {msg.clause && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    📎 Reference: {msg.clause}
                  </p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="h-2 w-2 rounded-full bg-muted-foreground" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 pb-6 pt-2">
        <div className="glass-card flex items-center gap-2 p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask a question about the bill..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim()} className="gradient-primary text-primary-foreground shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
