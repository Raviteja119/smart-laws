import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { documentId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get document record
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !doc) throw new Error("Document not found");

    // Download file content
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(doc.file_path);

    if (downloadError || !fileData) throw new Error("Failed to download file");

    const text = await fileData.text();
    const tokenCount = Math.ceil(text.length / 4); // rough estimate

    // Send to AI for analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a legislative document analyzer. Analyze the following document and return a JSON object with this exact structure:
{
  "overview": ["point1", "point2", "point3", "point4"],
  "highlights": ["highlight1", "highlight2", "highlight3", "highlight4", "highlight5"],
  "stakeholders": ["stakeholder1: impact", "stakeholder2: impact"],
  "penalties": ["penalty1", "penalty2"],
  "timeline": ["event1", "event2"],
  "clauses": [{"id": "1", "title": "Chapter title", "content": "description"}],
  "summary": "A brief 2-sentence summary of the document."
}
Return ONLY valid JSON, no markdown.`,
          },
          {
            role: "user",
            content: text.slice(0, 30000), // limit to ~30k chars
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "{}";
    
    // Try to parse the JSON from the AI response
    let analysis;
    try {
      // Remove potential markdown code fences
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = { summary: content, overview: [], highlights: [], stakeholders: [], penalties: [], timeline: [], clauses: [] };
    }

    const compressionRate = Math.min(99.9, Math.max(50, 100 - (2500 / tokenCount) * 100));

    // Update document with analysis
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        status: "analyzed",
        token_count: tokenCount,
        compression_rate: parseFloat(compressionRate.toFixed(2)),
        analysis,
      })
      .eq("id", documentId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
