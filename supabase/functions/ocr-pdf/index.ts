import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_IMAGES = 20; // Maximum number of pages to process
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image (base64)
const MIN_IMAGE_SIZE = 100; // Minimum valid base64 image

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate request body
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { images } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate images array
    if (!images || !Array.isArray(images)) {
      return new Response(
        JSON.stringify({ error: "Images array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({ error: "No images provided for OCR" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (images.length > MAX_IMAGES) {
      return new Response(
        JSON.stringify({ error: `Too many images. Maximum ${MAX_IMAGES} pages allowed.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each image
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      
      if (!img || typeof img !== 'string') {
        return new Response(
          JSON.stringify({ error: `Invalid image data at index ${i}. Must be a base64 string.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (img.length < MIN_IMAGE_SIZE) {
        return new Response(
          JSON.stringify({ error: `Image at index ${i} is too small to be valid.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (img.length > MAX_IMAGE_SIZE) {
        return new Response(
          JSON.stringify({ error: `Image at index ${i} exceeds maximum size of 10MB.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Basic validation that it looks like a data URL or base64
      if (!img.startsWith('data:image/') && !img.match(/^[A-Za-z0-9+/=]+$/)) {
        return new Response(
          JSON.stringify({ error: `Image at index ${i} is not a valid base64 image.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Processing ${images.length} page(s) for OCR`);

    const systemPrompt = `You are an expert OCR system specialized in extracting text from resume/CV document images. 

EXTRACTION GUIDELINES:
1. Extract ALL visible text from the image, preserving the document structure
2. Maintain section headers, bullet points, and formatting indicators
3. Preserve contact information, dates, company names, job titles exactly as written
4. Keep lists and bullet points as separate lines
5. Maintain paragraph breaks between sections
6. If text is unclear or partially visible, make your best interpretation
7. Do not add any commentary or explanations - only output the extracted text
8. If no text is visible, respond with "[NO TEXT DETECTED]"

Output the raw extracted text only, maintaining the original document structure as much as possible.`;

    // Process each page and combine results
    const pageTexts: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      
      console.log(`Processing page ${i + 1}/${images.length}`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: [
                { 
                  type: "text", 
                  text: `Extract all text from this resume page (page ${i + 1} of ${images.length}):` 
                },
                { 
                  type: "image_url", 
                  image_url: { 
                    url: imageData 
                  } 
                }
              ]
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error(`AI gateway error for page ${i + 1}:`, response.status, errorText);
        throw new Error(`Failed to process page ${i + 1}`);
      }

      const data = await response.json();
      const pageText = data.choices?.[0]?.message?.content || "";
      
      if (pageText && pageText !== "[NO TEXT DETECTED]") {
        pageTexts.push(pageText);
      }
    }

    const combinedText = pageTexts.join("\n\n---PAGE BREAK---\n\n");

    if (!combinedText || combinedText.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Could not extract text from the scanned document. The image quality may be too low." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Successfully extracted ${combinedText.length} characters from ${images.length} page(s)`);

    return new Response(JSON.stringify({ text: combinedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ocr-pdf function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to perform OCR" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
