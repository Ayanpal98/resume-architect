// Action Verbs Enhancer - Detects weak verbs and suggests powerful ATS-optimized replacements

export interface VerbReplacement {
  original: string;
  position: number;
  suggestions: string[];
  category: string;
}

export interface EnhancementResult {
  originalText: string;
  enhancedText: string;
  replacements: VerbReplacement[];
  score: number; // 0-100 strength score
}

// Weak verbs that should be replaced with power verbs
const WEAK_VERBS: Record<string, { category: string; replacements: string[] }> = {
  // Generic/Passive verbs
  "did": { category: "Achievement", replacements: ["Accomplished", "Achieved", "Delivered", "Executed", "Completed"] },
  "made": { category: "Creation", replacements: ["Developed", "Created", "Built", "Designed", "Engineered"] },
  "worked": { category: "Contribution", replacements: ["Collaborated", "Contributed", "Partnered", "Drove", "Spearheaded"] },
  "worked on": { category: "Contribution", replacements: ["Led", "Managed", "Directed", "Oversaw", "Championed"] },
  "helped": { category: "Support", replacements: ["Facilitated", "Enabled", "Supported", "Mentored", "Guided"] },
  "was responsible for": { category: "Leadership", replacements: ["Managed", "Directed", "Oversaw", "Led", "Owned"] },
  "responsible for": { category: "Leadership", replacements: ["Managed", "Directed", "Oversaw", "Led", "Owned"] },
  "handled": { category: "Management", replacements: ["Managed", "Coordinated", "Orchestrated", "Administered", "Executed"] },
  "got": { category: "Achievement", replacements: ["Secured", "Obtained", "Acquired", "Earned", "Captured"] },
  "used": { category: "Application", replacements: ["Leveraged", "Utilized", "Applied", "Employed", "Implemented"] },
  "went": { category: "Action", replacements: ["Attended", "Participated", "Engaged", "Contributed", "Represented"] },
  "had": { category: "Ownership", replacements: ["Maintained", "Possessed", "Held", "Managed", "Oversaw"] },
  "was part of": { category: "Contribution", replacements: ["Contributed to", "Participated in", "Collaborated on", "Supported", "Drove"] },
  "participated in": { category: "Contribution", replacements: ["Contributed to", "Collaborated on", "Engaged in", "Drove", "Led"] },
  
  // Improvement-related weak verbs
  "improved": { category: "Optimization", replacements: ["Enhanced", "Optimized", "Elevated", "Strengthened", "Boosted"] },
  "changed": { category: "Transformation", replacements: ["Transformed", "Revamped", "Restructured", "Redesigned", "Overhauled"] },
  "fixed": { category: "Problem Solving", replacements: ["Resolved", "Remediated", "Rectified", "Corrected", "Debugged"] },
  "updated": { category: "Modernization", replacements: ["Modernized", "Upgraded", "Revitalized", "Refreshed", "Enhanced"] },
  
  // Communication weak verbs
  "talked": { category: "Communication", replacements: ["Presented", "Communicated", "Articulated", "Conveyed", "Delivered"] },
  "told": { category: "Communication", replacements: ["Advised", "Informed", "Briefed", "Counseled", "Directed"] },
  "said": { category: "Communication", replacements: ["Articulated", "Expressed", "Communicated", "Conveyed", "Stated"] },
  "showed": { category: "Demonstration", replacements: ["Demonstrated", "Illustrated", "Presented", "Exhibited", "Showcased"] },
  
  // Growth weak verbs
  "grew": { category: "Growth", replacements: ["Expanded", "Scaled", "Accelerated", "Amplified", "Multiplied"] },
  "increased": { category: "Growth", replacements: ["Boosted", "Elevated", "Maximized", "Amplified", "Surged"] },
  "decreased": { category: "Efficiency", replacements: ["Reduced", "Minimized", "Streamlined", "Optimized", "Cut"] },
  
  // Thinking/Analysis weak verbs
  "thought": { category: "Analysis", replacements: ["Analyzed", "Evaluated", "Assessed", "Strategized", "Conceptualized"] },
  "looked at": { category: "Analysis", replacements: ["Analyzed", "Examined", "Evaluated", "Assessed", "Investigated"] },
  "found": { category: "Discovery", replacements: ["Discovered", "Identified", "Uncovered", "Detected", "Pinpointed"] },
  "learned": { category: "Development", replacements: ["Mastered", "Acquired", "Developed expertise in", "Gained proficiency in", "Specialized in"] },
  
  // Starting weak verbs
  "started": { category: "Initiative", replacements: ["Launched", "Initiated", "Pioneered", "Established", "Founded"] },
  "began": { category: "Initiative", replacements: ["Launched", "Initiated", "Commenced", "Pioneered", "Spearheaded"] },
  "set up": { category: "Establishment", replacements: ["Established", "Implemented", "Deployed", "Configured", "Instituted"] },
  
  // Collaboration weak verbs  
  "met with": { category: "Engagement", replacements: ["Engaged with", "Consulted with", "Partnered with", "Collaborated with", "Liaised with"] },
  "joined": { category: "Participation", replacements: ["Integrated into", "Contributed to", "Participated in", "Engaged with", "Collaborated with"] },
  
  // Management weak verbs
  "ran": { category: "Leadership", replacements: ["Directed", "Managed", "Operated", "Administered", "Oversaw"] },
  "led": { category: "Leadership", replacements: ["Spearheaded", "Directed", "Championed", "Orchestrated", "Headed"] },
  "managed": { category: "Leadership", replacements: ["Directed", "Oversaw", "Supervised", "Administered", "Orchestrated"] },
  
  // Generic action weak verbs
  "do": { category: "Execution", replacements: ["Execute", "Perform", "Accomplish", "Deliver", "Complete"] },
  "does": { category: "Execution", replacements: ["Executes", "Performs", "Accomplishes", "Delivers", "Completes"] },
  "doing": { category: "Execution", replacements: ["Executing", "Performing", "Accomplishing", "Delivering", "Completing"] },
  "try": { category: "Initiative", replacements: ["Attempt", "Endeavor", "Pursue", "Strive", "Undertake"] },
  "tried": { category: "Initiative", replacements: ["Attempted", "Endeavored", "Pursued", "Strived", "Undertook"] },
  
  // Support weak verbs
  "assisted": { category: "Support", replacements: ["Supported", "Aided", "Facilitated", "Contributed to", "Enabled"] },
  "supported": { category: "Enablement", replacements: ["Enabled", "Empowered", "Facilitated", "Bolstered", "Reinforced"] },
};

// Power verbs by category for reference and suggestions
export const POWER_VERBS_BY_CATEGORY = {
  Leadership: [
    "Spearheaded", "Directed", "Orchestrated", "Championed", "Pioneered",
    "Headed", "Captained", "Commanded", "Governed", "Presided"
  ],
  Achievement: [
    "Accomplished", "Achieved", "Attained", "Exceeded", "Surpassed",
    "Delivered", "Captured", "Secured", "Won", "Earned"
  ],
  Creation: [
    "Developed", "Designed", "Engineered", "Architected", "Constructed",
    "Built", "Created", "Formulated", "Devised", "Invented"
  ],
  Improvement: [
    "Enhanced", "Optimized", "Streamlined", "Revitalized", "Modernized",
    "Upgraded", "Refined", "Elevated", "Strengthened", "Transformed"
  ],
  Growth: [
    "Expanded", "Scaled", "Accelerated", "Amplified", "Multiplied",
    "Grew", "Boosted", "Increased", "Maximized", "Propelled"
  ],
  Efficiency: [
    "Streamlined", "Automated", "Consolidated", "Simplified", "Reduced",
    "Eliminated", "Minimized", "Cut", "Decreased", "Lowered"
  ],
  Analysis: [
    "Analyzed", "Evaluated", "Assessed", "Investigated", "Examined",
    "Diagnosed", "Audited", "Researched", "Studied", "Reviewed"
  ],
  Communication: [
    "Presented", "Articulated", "Conveyed", "Communicated", "Negotiated",
    "Persuaded", "Advocated", "Influenced", "Briefed", "Counseled"
  ],
  Technical: [
    "Engineered", "Architected", "Deployed", "Implemented", "Integrated",
    "Configured", "Debugged", "Programmed", "Automated", "Migrated"
  ],
  Financial: [
    "Generated", "Saved", "Reduced costs by", "Increased revenue by", "Budgeted",
    "Forecasted", "Allocated", "Maximized ROI", "Secured funding", "Monetized"
  ],
};

// Normalize text for matching
const normalizeText = (text: string): string => {
  return text.toLowerCase().trim();
};

// Find weak verbs in text and suggest replacements
export const analyzeActionVerbs = (text: string): EnhancementResult => {
  if (!text || text.trim().length === 0) {
    return {
      originalText: text,
      enhancedText: text,
      replacements: [],
      score: 100,
    };
  }

  const replacements: VerbReplacement[] = [];
  let enhancedText = text;
  const normalizedText = normalizeText(text);

  // Sort weak verbs by length (longest first) to match multi-word phrases first
  const sortedWeakVerbs = Object.entries(WEAK_VERBS).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [weakVerb, { category, replacements: suggestions }] of sortedWeakVerbs) {
    // Create regex to match the weak verb as a whole word
    const regex = new RegExp(`\\b${weakVerb}\\b`, "gi");
    let match;

    while ((match = regex.exec(normalizedText)) !== null) {
      // Check if this position was already replaced by a longer phrase
      const alreadyReplaced = replacements.some(
        (r) => match!.index >= r.position && match!.index < r.position + r.original.length
      );

      if (!alreadyReplaced) {
        const originalMatch = text.slice(match.index, match.index + weakVerb.length);
        
        replacements.push({
          original: originalMatch,
          position: match.index,
          suggestions,
          category,
        });

        // Apply the first suggestion to enhanced text (preserving case)
        const isCapitalized = originalMatch[0] === originalMatch[0].toUpperCase();
        let replacement = suggestions[0];
        if (isCapitalized && replacement[0] !== replacement[0].toUpperCase()) {
          replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
        } else if (!isCapitalized && replacement[0] === replacement[0].toUpperCase()) {
          replacement = replacement.charAt(0).toLowerCase() + replacement.slice(1);
        }

        enhancedText = enhancedText.replace(
          new RegExp(`\\b${originalMatch}\\b`, "i"),
          replacement
        );
      }
    }
  }

  // Calculate strength score based on weak verb density
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const weakVerbCount = replacements.length;
  const weakVerbRatio = wordCount > 0 ? weakVerbCount / wordCount : 0;
  
  // Score: 100 = no weak verbs, decreases with more weak verbs
  const score = Math.max(0, Math.round(100 - weakVerbRatio * 500));

  return {
    originalText: text,
    enhancedText,
    replacements: replacements.sort((a, b) => a.position - b.position),
    score,
  };
};

// Get verb strength rating
export const getVerbStrengthLabel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: "Excellent", color: "text-green-600" };
  if (score >= 70) return { label: "Good", color: "text-blue-600" };
  if (score >= 50) return { label: "Fair", color: "text-yellow-600" };
  return { label: "Needs Work", color: "text-red-600" };
};

// Suggest power verbs based on context
export const suggestPowerVerbs = (context: string): string[] => {
  const normalizedContext = normalizeText(context);
  const suggestions: string[] = [];

  // Analyze context to suggest relevant power verbs
  if (normalizedContext.includes("team") || normalizedContext.includes("lead") || normalizedContext.includes("manage")) {
    suggestions.push(...POWER_VERBS_BY_CATEGORY.Leadership.slice(0, 3));
  }
  if (normalizedContext.includes("develop") || normalizedContext.includes("build") || normalizedContext.includes("create")) {
    suggestions.push(...POWER_VERBS_BY_CATEGORY.Creation.slice(0, 3));
  }
  if (normalizedContext.includes("improve") || normalizedContext.includes("optimize") || normalizedContext.includes("enhance")) {
    suggestions.push(...POWER_VERBS_BY_CATEGORY.Improvement.slice(0, 3));
  }
  if (normalizedContext.includes("revenue") || normalizedContext.includes("cost") || normalizedContext.includes("budget") || normalizedContext.includes("save")) {
    suggestions.push(...POWER_VERBS_BY_CATEGORY.Financial.slice(0, 3));
  }
  if (normalizedContext.includes("code") || normalizedContext.includes("software") || normalizedContext.includes("system") || normalizedContext.includes("deploy")) {
    suggestions.push(...POWER_VERBS_BY_CATEGORY.Technical.slice(0, 3));
  }
  if (normalizedContext.includes("grow") || normalizedContext.includes("scale") || normalizedContext.includes("expand")) {
    suggestions.push(...POWER_VERBS_BY_CATEGORY.Growth.slice(0, 3));
  }
  if (normalizedContext.includes("analyz") || normalizedContext.includes("research") || normalizedContext.includes("evaluat")) {
    suggestions.push(...POWER_VERBS_BY_CATEGORY.Analysis.slice(0, 3));
  }

  // Return unique suggestions
  return [...new Set(suggestions)].slice(0, 10);
};

// Enhance multiple bullet points
export const enhanceExperienceDescription = (description: string): EnhancementResult => {
  // Split by bullet points or newlines
  const lines = description
    .split(/(?:\r?\n|•|▪|◦|➤|→|►|■|□|●|○)/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return analyzeActionVerbs(description);
  }

  const enhancedLines: string[] = [];
  const allReplacements: VerbReplacement[] = [];
  let totalScore = 0;

  lines.forEach((line, index) => {
    const result = analyzeActionVerbs(line);
    enhancedLines.push(result.enhancedText);
    
    // Adjust positions for multi-line context
    const lineOffset = index > 0 
      ? lines.slice(0, index).reduce((acc, l) => acc + l.length + 1, 0) 
      : 0;
    
    allReplacements.push(
      ...result.replacements.map(r => ({
        ...r,
        position: r.position + lineOffset,
      }))
    );
    totalScore += result.score;
  });

  const avgScore = Math.round(totalScore / lines.length);

  return {
    originalText: description,
    enhancedText: enhancedLines.join("\n• "),
    replacements: allReplacements,
    score: avgScore,
  };
};
