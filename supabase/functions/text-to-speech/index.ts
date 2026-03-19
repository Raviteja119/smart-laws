import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!text) throw new Error("Text is required");

    // Use AI to generate SSML-like speech text, then use browser SpeechSynthesis on client
    // Return the text optimized for speech
    const langMap: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      te: "Telugu",
      ta: "Tamil",
    };

    const targetLang = langMap[language] || "English";

    // We'll use the AI to create a speech-optimized version of the text
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a text-to-speech optimizer. Convert the given text into a version optimized for audio listening in ${targetLang}. Make it conversational, add natural pauses with commas, and ensure it flows well when read aloud. Keep the same content and meaning. Output ONLY the optimized text, nothing else.`,
          },
          { role: "user", content: text.slice(0, 5000) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("AI processing failed");
    }

    const result = await response.json();
    const speechText = result.choices?.[0]?.message?.content || text;

    return new Response(JSON.stringify({ speechText, language: language || "en" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("text-to-speech error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
