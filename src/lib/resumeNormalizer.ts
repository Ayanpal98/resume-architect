import type { ResumeData } from "./pdfGenerator";

/**
 * Shared normalizer that coerces any parsed/imported resume payload
 * (from the AI parser, OCR, manual paste, or legacy data) into the exact
 * shape expected by the PDF generator and Builder UI.
 *
 * Defensive against:
 *  - missing/null sections
 *  - strings where arrays expected (and vice-versa)
 *  - objects where strings expected (e.g. certifications: [{name: "..."}])
 *  - alternate keys (title vs name, technologies vs tools, etc.)
 */

const toStr = (v: any): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(toStr).filter(Boolean).join(", ");
  if (typeof v === "object") {
    return (
      v.name ||
      v.title ||
      v.value ||
      v.text ||
      v.label ||
      ""
    ).toString();
  }
  return String(v);
};

const toStrArray = (v: any): string[] => {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v.map(toStr).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof v === "string") {
    return v.split(/[,\n;|]/).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof v === "object") return [toStr(v)].filter(Boolean);
  return [];
};

const newId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
};

const normalizePersonalInfo = (p: any): ResumeData["personalInfo"] => {
  const src = p && typeof p === "object" ? p : {};
  return {
    fullName: toStr(src.fullName ?? src.name ?? src.full_name).trim(),
    email: toStr(src.email).trim(),
    phone: toStr(src.phone ?? src.phoneNumber ?? src.mobile).trim(),
    location: toStr(src.location ?? src.address ?? src.city).trim(),
    linkedin: toStr(src.linkedin ?? src.linkedIn ?? src.linkedinUrl).trim(),
    portfolio: toStr(src.portfolio ?? src.website ?? src.url).trim(),
    github: toStr(src.github ?? src.githubUrl ?? src.git).trim(),
    otherLinks: Array.isArray(src.otherLinks)
      ? toStrArray(src.otherLinks).join(", ")
      : toStr(src.otherLinks ?? src.links ?? src.otherWebsites).trim(),
  };
};

const normalizeExperience = (arr: any): ResumeData["experience"] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((e: any) => {
      const src = e && typeof e === "object" ? e : {};
      const descRaw =
        src.description ?? src.responsibilities ?? src.bullets ?? src.achievements ?? "";
      const description = Array.isArray(descRaw)
        ? descRaw.map(toStr).map((s) => s.trim()).filter(Boolean).join("\n")
        : toStr(descRaw).trim();
      return {
        id: toStr(src.id) || newId(),
        title: toStr(src.title ?? src.role ?? src.position).trim(),
        company: toStr(src.company ?? src.employer ?? src.organization).trim(),
        location: toStr(src.location).trim(),
        startDate: toStr(src.startDate ?? src.start ?? src.from).trim(),
        endDate: toStr(src.endDate ?? src.end ?? src.to).trim(),
        current: Boolean(src.current ?? src.isCurrent ?? false),
        description,
      };
    })
    .filter((e) => e.title || e.company || e.description);
};

const normalizeEducation = (arr: any): ResumeData["education"] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((e: any) => {
      const src = e && typeof e === "object" ? e : {};
      return {
        id: toStr(src.id) || newId(),
        degree: toStr(src.degree ?? src.qualification).trim(),
        school: toStr(src.school ?? src.institution ?? src.university).trim(),
        location: toStr(src.location).trim(),
        graduationDate: toStr(src.graduationDate ?? src.endDate ?? src.year).trim(),
        gpa: toStr(src.gpa ?? src.grade).trim(),
      };
    })
    .filter((e) => e.degree || e.school);
};

const normalizeProjects = (arr: any): NonNullable<ResumeData["projects"]> => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((p: any) => {
      const src = p && typeof p === "object" ? p : { name: toStr(p) };
      const name = toStr(src.name ?? src.title).trim();
      const descParts = [src.description, src.outcomes, src.summary]
        .filter((x) => x != null && x !== "")
        .map(toStr)
        .map((s) => s.trim())
        .filter(Boolean);
      const description = descParts.join("\n");
      const tools = Array.isArray(src.technologies ?? src.tools ?? src.tech)
        ? toStrArray(src.technologies ?? src.tools ?? src.tech).join(", ")
        : toStr(src.tools ?? src.technologies ?? src.tech).trim();
      return {
        id: toStr(src.id) || newId(),
        name,
        description,
        tools,
      };
    })
    .filter((p) => p.name || p.description || p.tools);
};

const normalizeCertifications = (arr: any): string[] => {
  if (!Array.isArray(arr)) return toStrArray(arr);
  return arr
    .map((c: any) => {
      if (typeof c === "string") return c.trim();
      if (c && typeof c === "object") {
        const name = toStr(c.name ?? c.title ?? c.certification).trim();
        const issuer = toStr(c.issuer ?? c.organization).trim();
        return issuer && name ? `${name} — ${issuer}` : name || toStr(c).trim();
      }
      return toStr(c).trim();
    })
    .filter(Boolean);
};

export const normalizeResumeData = (raw: any): ResumeData => {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    personalInfo: normalizePersonalInfo(src.personalInfo ?? src.contact ?? {}),
    summary: toStr(src.summary ?? src.objective ?? src.profile).trim(),
    experience: normalizeExperience(src.experience ?? src.workExperience ?? src.work),
    education: normalizeEducation(src.education),
    skills: toStrArray(src.skills),
    skillCategoryMap:
      src.skillCategoryMap && typeof src.skillCategoryMap === "object"
        ? src.skillCategoryMap
        : undefined,
    projects: normalizeProjects(src.projects),
    certifications: normalizeCertifications(src.certifications ?? src.certs),
  };
};
