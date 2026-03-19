import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bill, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!bill) throw new Error("Bill data is required");

    const langInstruction = language && language !== "en"
      ? `IMPORTANT: Write the entire summary in ${language === "hi" ? "Hindi" : language === "te" ? "Telugu" : language === "ta" ? "Tamil" : "English"} language. Use the script native to that language.`
      : "";

    const prompt = `You are an expert Indian legislative analyst. Provide a comprehensive, detailed summary of the following government bill/policy.

Write exactly 2-3 rich, detailed paragraphs. Each paragraph should be 150-200 words long.

Paragraph 1 — Background & Purpose: Explain the full context of why this bill was introduced, the problems it addresses, its historical background, which ministry or department proposed it, and the core objectives it aims to achieve.

Paragraph 2 — Key Provisions & Implementation: Detail the major provisions, mechanisms, regulatory frameworks, compliance requirements, penalties, timelines, and how the bill will be implemented on the ground. Mention specific sections or chapters if known.

Paragraph 3 — Impact & Stakeholder Analysis: Analyze who benefits, who is affected, expected economic and social impact, any controversies or criticisms, how it compares to existing laws, and the current status of the bill.

DO NOT use bullet points, numbered lists, or headings. Write in flowing, connected prose paragraphs only. Be factual, balanced, and use simple language any citizen can understand.

${langInstruction}

Bill Details:
- Title: ${bill.title}
- Sector: ${bill.sector}
- State/Level: ${bill.state || "Central"}
- Financial Year: ${bill.financial_year}
- Status: ${bill.status || "Unknown"}
- Ministry: ${bill.ministry || "Not specified"}
- Bill Type: ${bill.bill_type || "Not specified"}
- Introduced Date: ${bill.introduced_date || "Not specified"}
- Description: ${bill.description || "No description available"}

Provide the summary now.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert Indian legislative analyst who explains bills and policies in detail for common citizens. Always write in clear, detailed paragraphs — never use bullet points or short lists. Your summaries should be comprehensive and educational." },
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
