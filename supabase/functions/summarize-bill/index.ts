import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bill } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!bill) throw new Error("Bill data is required");

    const prompt = `You are an expert Indian legislative analyst. Provide a comprehensive, detailed summary of the following government bill/policy. 

DO NOT use bullet points or numbered lists. Write in clear, flowing paragraphs that explain:
1. The full background and context of why this bill was introduced
2. The key objectives and what it aims to achieve
3. The major provisions and how they will be implemented
4. Who are the primary stakeholders and how they are affected
5. The expected impact on citizens, businesses, and governance
6. Any controversies, debates, or criticisms surrounding the bill
7. How this bill relates to existing laws or policies
8. Timeline and current status of implementation

Write at least 400-500 words. Use simple language that any citizen can understand. Be factual and balanced.

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

Provide a thorough, well-structured summary in clear paragraphs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert Indian legislative analyst who explains bills and policies in detail for common citizens. Always write in clear, detailed paragraphs - never use bullet points or short lists. Your summaries should be comprehensive and educational." },
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
