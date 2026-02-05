 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 // Simple DOCX generation using Office Open XML format
 function escapeXml(text: string): string {
   return text
     .replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&apos;');
 }
 
 function textToParagraphs(text: string): string {
   const lines = text.split('\n');
   return lines.map(line => {
     const trimmed = line.trim();
     if (!trimmed) {
       return '<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>';
     }
     
     // Check if it looks like a header (all caps, short, or starts with common header words)
     const isHeader = (
       (trimmed.toUpperCase() === trimmed && trimmed.length < 50 && trimmed.length > 2) ||
       /^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|CONTACT|PROFESSIONAL|WORK|PROJECTS|CERTIFICATIONS|ACHIEVEMENTS|AWARDS|REFERENCES|LANGUAGES|INTERESTS|PROFILE|ABOUT)/i.test(trimmed)
     );
     
     if (isHeader) {
       return `<w:p>
         <w:pPr>
           <w:pStyle w:val="Heading1"/>
           <w:spacing w:before="240" w:after="120"/>
         </w:pPr>
         <w:r>
           <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
           <w:t>${escapeXml(trimmed)}</w:t>
         </w:r>
       </w:p>`;
     }
     
     // Check if it's a bullet point
     const bulletMatch = trimmed.match(/^[•\-\*]\s*(.+)$/);
     if (bulletMatch) {
       return `<w:p>
         <w:pPr>
           <w:ind w:left="720"/>
           <w:spacing w:after="60"/>
         </w:pPr>
         <w:r>
           <w:t>• ${escapeXml(bulletMatch[1])}</w:t>
         </w:r>
       </w:p>`;
     }
     
     return `<w:p>
       <w:pPr><w:spacing w:after="120"/></w:pPr>
       <w:r><w:t>${escapeXml(trimmed)}</w:t></w:r>
     </w:p>`;
   }).join('\n');
 }
 
 async function createDocx(text: string, fileName: string): Promise<Uint8Array> {
   const { default: JSZip } = await import("https://esm.sh/jszip@3.10.1");
   
   const zip = new JSZip();
   
   // Content Types
   zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
   <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
   <Default Extension="xml" ContentType="application/xml"/>
   <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
   <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
 </Types>`);
 
   // Relationships
   zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
   <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
 </Relationships>`);
 
   // Word relationships
   zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
   <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
 </Relationships>`);
 
   // Styles
   zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
   <w:style w:type="paragraph" w:styleId="Heading1">
     <w:name w:val="Heading 1"/>
     <w:rPr>
       <w:b/>
       <w:sz w:val="28"/>
     </w:rPr>
   </w:style>
   <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
     <w:name w:val="Normal"/>
     <w:rPr>
       <w:sz w:val="22"/>
       <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
     </w:rPr>
   </w:style>
 </w:styles>`);
 
   // Main document
   const paragraphs = textToParagraphs(text);
   zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
   <w:body>
     ${paragraphs}
     <w:sectPr>
       <w:pgSz w:w="12240" w:h="15840"/>
       <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
     </w:sectPr>
   </w:body>
 </w:document>`);
 
   const content = await zip.generateAsync({ type: "uint8array" });
   return content;
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { text, fileName } = await req.json();
 
     if (!text || typeof text !== 'string') {
       return new Response(
         JSON.stringify({ error: "Text content is required" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     if (text.trim().length < 10) {
       return new Response(
         JSON.stringify({ error: "Text content is too short" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const docxContent = await createDocx(text.trim(), fileName || "resume");
     const base64Content = base64Encode(docxContent);
 
     return new Response(
       JSON.stringify({ 
         docxBase64: base64Content,
         fileName: `${(fileName || "resume").replace(/\.[^.]+$/, '')}.docx`
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("DOCX conversion error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Failed to convert to DOCX" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });