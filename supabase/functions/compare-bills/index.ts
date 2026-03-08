import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { oldText, newText, oldName, newName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!oldText || !newText) throw new Error("Both documents are required");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a legislative document comparison expert. Compare two versions of a bill/document and identify all changes. Return a JSON object with this exact structure:
{
  "summary": "A brief 2-3 sentence summary of the overall changes",
  "changes": [
    {
      "type": "added" | "removed" | "modified",
      "clause": "Section/clause reference (e.g. 'Section 12A', 'Article 5(2)')",
      "text": "Clear description of what was added/removed/modified",
      "severity": "major" | "minor"
    }
  ]
}
Identify at least 5-15 meaningful changes. Focus on substantive legal/policy changes, not formatting. Return ONLY valid JSON, no markdown.`,
          },
          {
            role: "user",
            content: `Compare these two documents:\n\n--- OLD DOCUMENT: "${oldName}" ---\n${oldText.slice(0, 15000)}\n\n--- NEW DOCUMENT: "${newName}" ---\n${newText.slice(0, 15000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI comparison failed");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "{}";

    let result;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { summary: content, changes: [] };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compare-bills error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
