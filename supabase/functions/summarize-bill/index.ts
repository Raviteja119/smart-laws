import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bill, language, documentText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!bill && !documentText) throw new Error("Bill data or document text is required");

    const langMap: Record<string, string> = { hi: "Hindi", te: "Telugu", ta: "Tamil", en: "English" };
    const targetLang = langMap[language] || "English";
    const langInstruction = language && language !== "en"
      ? `CRITICAL INSTRUCTION: Write the ENTIRE summary in ${targetLang} language using native ${targetLang} script. Every single word must be in ${targetLang}. Do NOT mix English words.`
      : "";

    let contextBlock = "";
    if (bill) {
      contextBlock = `Bill Details:
- Title: ${bill.title}
- Sector: ${bill.sector}
- State/Level: ${bill.state || "Central"}
- Financial Year: ${bill.financial_year}
- Status: ${bill.status || "Unknown"}
- Ministry: ${bill.ministry || "Not specified"}
- Bill Type: ${bill.bill_type || "Not specified"}
- Introduced Date: ${bill.introduced_date || "Not specified"}
- Description: ${bill.description || "No description available"}`;
    } else if (documentText) {
      contextBlock = `Document Content:\n${documentText.slice(0, 8000)}`;
    }

    const prompt = `You are an expert Indian legislative analyst. Provide an extremely comprehensive, highly detailed summary of the following government bill/policy document.

Your summary MUST be at least 600-800 words long, organized into 3-4 rich, detailed paragraphs. Each paragraph should be 150-250 words.

Paragraph 1 — Historical Background, Context & Purpose:
Explain in great depth why this bill/policy was introduced. What are the historical events, social conditions, economic factors, or governance gaps that led to its creation? Which ministry or department proposed it and under whose leadership? What existing laws or policies does it seek to replace, amend, or supplement? What are the core objectives, goals, and vision behind this legislation? Discuss any committee recommendations or public consultations that shaped the bill.

Paragraph 2 — Detailed Key Provisions, Mechanisms & Implementation Framework:
Provide an exhaustive breakdown of every major provision in the bill. What new regulatory bodies, committees, or authorities are being created? What are the specific compliance requirements, licensing frameworks, registration processes, and reporting obligations? Detail the penalties, fines, imprisonment terms for violations. What timelines and deadlines are set for implementation? How will the central and state governments coordinate? What budget allocations or financial mechanisms are involved? Mention specific sections, chapters, or schedules where relevant.

Paragraph 3 — Comprehensive Stakeholder & Impact Analysis:
Analyze in depth who benefits from this bill and how. Who faces new obligations or restrictions? What is the expected economic impact — GDP contribution, job creation, cost savings, or fiscal burden? What social impact will it have on marginalized communities, women, rural populations, small businesses, or specific industries? What environmental implications exist? Discuss any controversies, criticisms, or opposition from political parties, industry bodies, civil society, or legal experts. How does this compare to similar laws in other countries?

Paragraph 4 — Current Status, Future Outlook & Citizen Relevance:
What is the current legislative status? Has it been passed by both houses? Is it awaiting presidential assent? What amendments were proposed during debates? What are the next steps for implementation? How will this bill directly affect common citizens in their daily lives? What should citizens know about their rights and obligations under this law? What are the expected long-term consequences for India's governance and development?

IMPORTANT RULES:
- Write ONLY in flowing, connected prose paragraphs
- DO NOT use bullet points, numbered lists, headings, or markdown formatting
- Each paragraph must be substantial — at minimum 150 words
- Be factual, balanced, and use language any citizen can understand
- Include specific details, numbers, dates, and examples wherever possible

${langInstruction}

${contextBlock}

Provide the detailed summary now.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are an expert Indian legislative analyst who explains bills and policies in extraordinary detail for common citizens. You always write in rich, comprehensive, flowing paragraphs — never use bullet points, numbered lists, or short summaries. Your summaries are thorough, educational, and at least 600-800 words long. ${langInstruction}` },
          { role: "user", content: prompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("summarize-bill error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
