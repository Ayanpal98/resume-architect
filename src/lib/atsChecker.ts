export interface ATSCheckResult {
  overallScore: number;
  categories: ATSCategory[];
  recommendations: string[];
  passStatus: "excellent" | "good" | "fair" | "poor";
}

export interface ATSCategory {
  name: string;
  score: number;
  maxScore: number;
  issues: string[];
  passed: boolean;
}

interface ResumeDataForCheck {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
}

// Standard ATS keywords that should be present
const ACTION_VERBS = [
  "achieved", "implemented", "developed", "managed", "led", "created", 
  "designed", "improved", "increased", "decreased", "reduced", "built",
  "launched", "coordinated", "analyzed", "established", "delivered",
  "collaborated", "streamlined", "optimized", "executed", "mentored"
];

const QUANTIFIABLE_PATTERNS = [
  /\d+%/,
  /\$\d+/,
  /\d+\s*(years?|months?)/i,
  /\d+\s*(team|people|members|employees|clients)/i,
  /\d+\s*(projects?|initiatives?)/i,
  /increased.*\d/i,
  /decreased.*\d/i,
  /reduced.*\d/i,
  /improved.*\d/i,
  /grew.*\d/i,
];

export const checkATSCompatibility = (resumeData: ResumeDataForCheck): ATSCheckResult => {
  const categories: ATSCategory[] = [];
  const recommendations: string[] = [];

  // 1. Contact Information Check (15 points max)
  const contactCheck = checkContactInfo(resumeData.personalInfo);
  categories.push(contactCheck.category);
  recommendations.push(...contactCheck.recommendations);

  // 2. Professional Summary Check (15 points max)
  const summaryCheck = checkSummary(resumeData.summary);
  categories.push(summaryCheck.category);
  recommendations.push(...summaryCheck.recommendations);

  // 3. Work Experience Check (30 points max)
  const experienceCheck = checkExperience(resumeData.experience);
  categories.push(experienceCheck.category);
  recommendations.push(...experienceCheck.recommendations);

  // 4. Education Check (15 points max)
  const educationCheck = checkEducation(resumeData.education);
  categories.push(educationCheck.category);
  recommendations.push(...educationCheck.recommendations);

  // 5. Skills Section Check (15 points max)
  const skillsCheck = checkSkills(resumeData.skills);
  categories.push(skillsCheck.category);
  recommendations.push(...skillsCheck.recommendations);

  // 6. Formatting & ATS Compatibility (10 points max)
  const formattingCheck = checkFormatting(resumeData);
  categories.push(formattingCheck.category);
  recommendations.push(...formattingCheck.recommendations);

  // Calculate overall score
  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
  const maxPossibleScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
  const overallScore = Math.round((totalScore / maxPossibleScore) * 100);

  // Determine pass status
  let passStatus: ATSCheckResult["passStatus"];
  if (overallScore >= 85) passStatus = "excellent";
  else if (overallScore >= 70) passStatus = "good";
  else if (overallScore >= 50) passStatus = "fair";
  else passStatus = "poor";

  return {
    overallScore,
    categories,
    recommendations: recommendations.slice(0, 8), // Top 8 recommendations
    passStatus,
  };
};

function checkContactInfo(personalInfo: ResumeDataForCheck["personalInfo"]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 15;

  // Full name check (3 points)
  if (personalInfo.fullName && personalInfo.fullName.trim().length > 0) {
    score += 3;
    // Check for proper formatting
    if (!/^[A-Z]/.test(personalInfo.fullName)) {
      issues.push("Name should start with capital letter");
    }
  } else {
    issues.push("Full name is missing");
    recommendations.push("Add your full name - this is essential for ATS systems");
  }

  // Email check (3 points)
  if (personalInfo.email && personalInfo.email.trim().length > 0) {
    score += 2;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(personalInfo.email)) {
      score += 1;
    } else {
      issues.push("Email format appears invalid");
    }
    // Check for professional email
    if (/gmail|yahoo|hotmail|outlook/i.test(personalInfo.email)) {
      // Consumer email is fine, but custom domain is better
    }
  } else {
    issues.push("Email address is missing");
    recommendations.push("Add a professional email address");
  }

  // Phone check (3 points)
  if (personalInfo.phone && personalInfo.phone.trim().length > 0) {
    score += 3;
    // Basic phone validation
    const digitsOnly = personalInfo.phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      issues.push("Phone number may be incomplete");
      score -= 1;
    }
  } else {
    issues.push("Phone number is missing");
    recommendations.push("Add a phone number for recruiters to contact you");
  }

  // Location check (3 points)
  if (personalInfo.location && personalInfo.location.trim().length > 0) {
    score += 3;
  } else {
    issues.push("Location is missing");
    recommendations.push("Add your city and state/country for location-based filtering");
  }

  // LinkedIn check (3 points - bonus)
  if (personalInfo.linkedin && personalInfo.linkedin.trim().length > 0) {
    score += 3;
    if (!personalInfo.linkedin.includes("linkedin.com")) {
      issues.push("LinkedIn URL format may be incorrect");
      score -= 1;
    }
  } else {
    recommendations.push("Add your LinkedIn profile URL to improve your professional presence");
  }

  return {
    category: {
      name: "Contact Information",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.7,
    },
    recommendations,
  };
}

function checkSummary(summary: string) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 15;

  if (!summary || summary.trim().length === 0) {
    issues.push("Professional summary is missing");
    recommendations.push("Add a compelling professional summary (2-4 sentences) highlighting your key qualifications");
    return {
      category: { name: "Professional Summary", score: 0, maxScore, issues, passed: false },
      recommendations,
    };
  }

  const wordCount = summary.split(/\s+/).length;

  // Length check (5 points)
  if (wordCount >= 30 && wordCount <= 80) {
    score += 5; // Optimal length
  } else if (wordCount >= 20 && wordCount <= 100) {
    score += 3;
    if (wordCount < 30) {
      issues.push("Summary is a bit short - aim for 30-80 words");
    } else {
      issues.push("Summary is slightly long - aim for 30-80 words");
    }
  } else if (wordCount > 0) {
    score += 1;
    if (wordCount < 20) {
      issues.push("Summary is too short to effectively communicate your value");
      recommendations.push("Expand your summary to 30-80 words for optimal ATS parsing");
    } else {
      issues.push("Summary is too long - ATS may truncate it");
      recommendations.push("Shorten your summary to 30-80 words for better readability");
    }
  }

  // Keywords presence (5 points)
  const hasActionVerbs = ACTION_VERBS.some(verb => 
    summary.toLowerCase().includes(verb)
  );
  if (hasActionVerbs) {
    score += 3;
  } else {
    issues.push("Missing strong action verbs");
    recommendations.push("Include action verbs like 'developed', 'led', 'implemented' in your summary");
  }

  // Check for quantifiable achievements
  const hasQuantifiable = QUANTIFIABLE_PATTERNS.some(pattern => pattern.test(summary));
  if (hasQuantifiable) {
    score += 2;
  } else {
    recommendations.push("Add quantifiable achievements (e.g., 'increased sales by 25%') to your summary");
  }

  // Role/Title mention (3 points)
  const hasRoleMention = /engineer|developer|manager|analyst|designer|specialist|consultant|coordinator|director|lead/i.test(summary);
  if (hasRoleMention) {
    score += 3;
  } else {
    issues.push("No clear job title/role mentioned");
    recommendations.push("Mention your target job title in your summary for better ATS matching");
  }

  // Years of experience mention (2 points)
  const hasExperience = /\d+\+?\s*(years?|yrs?)/i.test(summary);
  if (hasExperience) {
    score += 2;
  }

  return {
    category: {
      name: "Professional Summary",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
    },
    recommendations,
  };
}

function checkExperience(experience: ResumeDataForCheck["experience"]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 30;

  if (!experience || experience.length === 0) {
    issues.push("No work experience listed");
    recommendations.push("Add at least 2-3 relevant work experiences with detailed descriptions");
    return {
      category: { name: "Work Experience", score: 0, maxScore, issues, passed: false },
      recommendations,
    };
  }

  // Number of experiences (6 points)
  if (experience.length >= 3) {
    score += 6;
  } else if (experience.length >= 2) {
    score += 4;
  } else {
    score += 2;
    issues.push("Only one work experience listed");
    recommendations.push("Add more work experiences to show career progression");
  }

  // Check each experience entry
  let totalDescriptionScore = 0;
  let entriesWithDates = 0;
  let entriesWithActionVerbs = 0;
  let entriesWithQuantifiables = 0;

  experience.forEach((exp, index) => {
    const entryIssues: string[] = [];

    // Title check
    if (!exp.title || exp.title.trim().length === 0) {
      entryIssues.push(`Experience ${index + 1}: Missing job title`);
    }

    // Company check
    if (!exp.company || exp.company.trim().length === 0) {
      entryIssues.push(`Experience ${index + 1}: Missing company name`);
    }

    // Date check
    if (exp.startDate && (exp.endDate || exp.current)) {
      entriesWithDates++;
    } else {
      entryIssues.push(`Experience ${index + 1}: Missing dates`);
    }

    // Description quality check
    if (exp.description && exp.description.trim().length > 0) {
      const descWords = exp.description.split(/\s+/).length;
      
      if (descWords >= 30) {
        totalDescriptionScore += 3;
      } else if (descWords >= 15) {
        totalDescriptionScore += 2;
      } else {
        totalDescriptionScore += 1;
        entryIssues.push(`Experience ${index + 1}: Description is too brief`);
      }

      // Check for action verbs
      const hasActionVerb = ACTION_VERBS.some(verb => 
        exp.description.toLowerCase().includes(verb)
      );
      if (hasActionVerb) entriesWithActionVerbs++;

      // Check for quantifiable results
      const hasQuantifiable = QUANTIFIABLE_PATTERNS.some(pattern => 
        pattern.test(exp.description)
      );
      if (hasQuantifiable) entriesWithQuantifiables++;
    } else {
      entryIssues.push(`Experience ${index + 1}: No description provided`);
    }

    issues.push(...entryIssues);
  });

  // Dates completeness (4 points)
  const dateScore = (entriesWithDates / experience.length) * 4;
  score += Math.round(dateScore);

  // Description quality (8 points)
  const avgDescScore = totalDescriptionScore / experience.length;
  score += Math.min(Math.round(avgDescScore * 2.5), 8);

  // Action verbs usage (6 points)
  const actionVerbRatio = entriesWithActionVerbs / experience.length;
  score += Math.round(actionVerbRatio * 6);
  if (actionVerbRatio < 0.5) {
    recommendations.push("Start bullet points with strong action verbs (led, developed, implemented)");
  }

  // Quantifiable achievements (6 points)
  const quantifiableRatio = entriesWithQuantifiables / experience.length;
  score += Math.round(quantifiableRatio * 6);
  if (quantifiableRatio < 0.5) {
    recommendations.push("Add quantifiable achievements (numbers, percentages, dollar amounts) to your experiences");
  }

  return {
    category: {
      name: "Work Experience",
      score: Math.min(score, maxScore),
      maxScore,
      issues: issues.slice(0, 5), // Limit issues shown
      passed: score >= maxScore * 0.6,
    },
    recommendations,
  };
}

function checkEducation(education: ResumeDataForCheck["education"]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 15;

  if (!education || education.length === 0) {
    issues.push("No education listed");
    recommendations.push("Add your educational background including degree, school, and graduation date");
    return {
      category: { name: "Education", score: 0, maxScore, issues, passed: false },
      recommendations,
    };
  }

  // Has education entries (5 points)
  score += 5;

  education.forEach((edu, index) => {
    // Degree check (3 points for first, 1 for additional)
    if (edu.degree && edu.degree.trim().length > 0) {
      score += index === 0 ? 3 : 1;
    } else {
      issues.push(`Education ${index + 1}: Missing degree/certification name`);
    }

    // School check (3 points for first)
    if (edu.school && edu.school.trim().length > 0) {
      if (index === 0) score += 3;
    } else {
      issues.push(`Education ${index + 1}: Missing school/institution name`);
    }

    // Graduation date (2 points for first)
    if (edu.graduationDate && edu.graduationDate.trim().length > 0) {
      if (index === 0) score += 2;
    } else {
      issues.push(`Education ${index + 1}: Missing graduation date`);
    }
  });

  // GPA mention (bonus, 2 points) - only if it's good
  const hasGPA = education.some(edu => edu.gpa && parseFloat(edu.gpa) >= 3.0);
  if (hasGPA) {
    score += 2;
  }

  return {
    category: {
      name: "Education",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
    },
    recommendations,
  };
}

function checkSkills(skills: string[]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 15;

  if (!skills || skills.length === 0) {
    issues.push("No skills listed");
    recommendations.push("Add 8-15 relevant skills that match your target job requirements");
    return {
      category: { name: "Skills", score: 0, maxScore, issues, passed: false },
      recommendations,
    };
  }

  // Number of skills (8 points)
  if (skills.length >= 10 && skills.length <= 20) {
    score += 8; // Optimal range
  } else if (skills.length >= 6 && skills.length <= 25) {
    score += 6;
    if (skills.length < 10) {
      issues.push("Consider adding more relevant skills (aim for 10-15)");
    }
  } else if (skills.length >= 3) {
    score += 4;
    issues.push("Too few skills listed");
    recommendations.push("Add more skills - aim for 10-15 relevant skills");
  } else {
    score += 2;
    issues.push("Skills section needs significant expansion");
    recommendations.push("Add 8-15 relevant skills including both technical and soft skills");
  }

  // Check for variety (4 points)
  // Look for mix of technical and soft skills
  const technicalKeywords = /javascript|python|java|sql|react|node|aws|docker|kubernetes|api|database|git|agile|scrum|html|css|excel|tableau|salesforce/i;
  const softSkillKeywords = /communication|leadership|teamwork|problem.solving|analytical|creative|management|collaboration|presentation|organization/i;
  
  const skillsJoined = skills.join(" ");
  const hasTechnical = technicalKeywords.test(skillsJoined);
  const hasSoftSkills = softSkillKeywords.test(skillsJoined);

  if (hasTechnical && hasSoftSkills) {
    score += 4;
  } else if (hasTechnical || hasSoftSkills) {
    score += 2;
    if (!hasTechnical) {
      recommendations.push("Add relevant technical skills for your industry");
    }
    if (!hasSoftSkills) {
      recommendations.push("Include soft skills like communication, leadership, or problem-solving");
    }
  }

  // Skill formatting (3 points)
  const avgSkillLength = skills.reduce((sum, s) => sum + s.length, 0) / skills.length;
  if (avgSkillLength <= 30) {
    score += 3; // Skills are appropriately concise
  } else {
    score += 1;
    issues.push("Some skills may be too verbose - keep them concise");
  }

  return {
    category: {
      name: "Skills",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
    },
    recommendations,
  };
}

function checkFormatting(resumeData: ResumeDataForCheck) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 10;

  // Check for special characters that may break ATS (3 points)
  const allText = JSON.stringify(resumeData);
  const problematicChars = /[│┃┄┅┆┇┈┉┊┋╌╍╎╏═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟]/;
  if (!problematicChars.test(allText)) {
    score += 3;
  } else {
    issues.push("Contains special characters that may confuse ATS");
    recommendations.push("Remove special characters, tables, and graphics from your resume");
  }

  // Check for standard section naming (3 points)
  // This is implicit since we're using a structured form
  score += 3;

  // Check for consistent formatting (2 points)
  // Check if dates are consistent format
  let hasInconsistentDates = false;
  const dateFormats: string[] = [];
  
  resumeData.experience.forEach(exp => {
    if (exp.startDate) dateFormats.push(exp.startDate);
    if (exp.endDate) dateFormats.push(exp.endDate);
  });
  
  // Simple check for date consistency
  if (dateFormats.length > 1) {
    const allNumeric = dateFormats.every(d => /^\d/.test(d));
    const allAlpha = dateFormats.every(d => /^[A-Za-z]/.test(d));
    if (allNumeric || allAlpha) {
      score += 2;
    } else {
      hasInconsistentDates = true;
      issues.push("Date formats are inconsistent");
      recommendations.push("Use consistent date formats (e.g., all 'MM/YYYY' or all 'Month Year')");
    }
  } else {
    score += 2;
  }

  // Check content density (2 points)
  const totalWords = allText.split(/\s+/).length;
  if (totalWords >= 200 && totalWords <= 800) {
    score += 2;
  } else if (totalWords < 200) {
    issues.push("Resume content is thin - add more detail");
    recommendations.push("Add more detail to your resume - aim for 300-600 words of content");
  } else {
    score += 1;
    issues.push("Resume may be too lengthy for ATS");
  }

  return {
    category: {
      name: "ATS Formatting",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
    },
    recommendations,
  };
}

export const getScoreColor = (score: number): string => {
  if (score >= 85) return "text-accent";
  if (score >= 70) return "text-yellow-500";
  if (score >= 50) return "text-orange-500";
  return "text-destructive";
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 85) return "bg-accent";
  if (score >= 70) return "bg-yellow-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-destructive";
};
