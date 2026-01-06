import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Download, 
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
  gpa: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
};

const Builder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [activeSection, setActiveSection] = useState("personal");
  const [newSkill, setNewSkill] = useState("");

  const calculateATSScore = () => {
    let score = 0;
    const { personalInfo, summary, experience, education, skills } = resumeData;

    // Personal Info (25 points)
    if (personalInfo.fullName) score += 5;
    if (personalInfo.email) score += 5;
    if (personalInfo.phone) score += 5;
    if (personalInfo.location) score += 5;
    if (personalInfo.linkedin) score += 5;

    // Summary (15 points)
    if (summary.length > 50) score += 10;
    if (summary.length > 150) score += 5;

    // Experience (30 points)
    if (experience.length > 0) score += 10;
    if (experience.length > 1) score += 10;
    experience.forEach((exp) => {
      if (exp.description.length > 100) score += 2.5;
    });

    // Education (15 points)
    if (education.length > 0) score += 15;

    // Skills (15 points)
    if (skills.length > 0) score += 5;
    if (skills.length > 3) score += 5;
    if (skills.length > 6) score += 5;

    return Math.min(Math.round(score), 100);
  };

  const atsScore = calculateATSScore();

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      degree: "",
      school: "",
      location: "",
      graduationDate: "",
      gpa: "",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleDownload = () => {
    toast.success("Resume downloaded successfully!", {
      description: "Your ATS-optimized resume is ready.",
    });
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-display font-bold text-foreground">Resume Builder</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="hero" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* ATS Score */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
                        atsScore >= 80 ? 'bg-accent text-accent-foreground' : 
                        atsScore >= 50 ? 'bg-yellow-500 text-white' : 
                        'bg-destructive text-destructive-foreground'
                      }`}
                    >
                      {atsScore}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">ATS Score</div>
                      <div className="text-sm text-muted-foreground">
                        {atsScore >= 80 ? "Excellent" : atsScore >= 50 ? "Good" : "Needs work"}
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        atsScore >= 80 ? 'bg-accent' : 
                        atsScore >= 50 ? 'bg-yellow-500' : 
                        'bg-destructive'
                      }`}
                      style={{ width: `${atsScore}%` }}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                          activeSection === section.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <section.icon className="w-5 h-5" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tips */}
                <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">ATS Tips</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      Use standard section headers
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      Include relevant keywords
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      Avoid tables and graphics
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      Use simple, clean formatting
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-5">
              <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                {activeSection === "personal" && (
                  <PersonalInfoForm 
                    data={resumeData.personalInfo} 
                    summary={resumeData.summary}
                    onUpdate={updatePersonalInfo}
                    onSummaryChange={(value) => setResumeData(prev => ({ ...prev, summary: value }))}
                  />
                )}
                {activeSection === "experience" && (
                  <ExperienceForm
                    experiences={resumeData.experience}
                    onAdd={addExperience}
                    onUpdate={updateExperience}
                    onRemove={removeExperience}
                  />
                )}
                {activeSection === "education" && (
                  <EducationForm
                    education={resumeData.education}
                    onAdd={addEducation}
                    onUpdate={updateEducation}
                    onRemove={removeEducation}
                  />
                )}
                {activeSection === "skills" && (
                  <SkillsForm
                    skills={resumeData.skills}
                    newSkill={newSkill}
                    onNewSkillChange={setNewSkill}
                    onAdd={addSkill}
                    onRemove={removeSkill}
                  />
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                  <div className="bg-muted px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">Live Preview</span>
                    </div>
                  </div>
                  <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    <ResumePreview data={resumeData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface PersonalInfoFormProps {
  data: ResumeData["personalInfo"];
  summary: string;
  onUpdate: (field: string, value: string) => void;
  onSummaryChange: (value: string) => void;
}

const PersonalInfoForm = ({ data, summary, onUpdate, onSummaryChange }: PersonalInfoFormProps) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">Personal Information</h2>
      <p className="text-muted-foreground">Start with your contact details and professional summary.</p>
    </div>
    
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
        <Input
          placeholder="John Doe"
          value={data.fullName}
          onChange={(e) => onUpdate("fullName", e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
        <Input
          type="email"
          placeholder="john@example.com"
          value={data.email}
          onChange={(e) => onUpdate("email", e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
        <Input
          placeholder="+1 (555) 123-4567"
          value={data.phone}
          onChange={(e) => onUpdate("phone", e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Location</label>
        <Input
          placeholder="New York, NY"
          value={data.location}
          onChange={(e) => onUpdate("location", e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">LinkedIn</label>
        <Input
          placeholder="linkedin.com/in/johndoe"
          value={data.linkedin}
          onChange={(e) => onUpdate("linkedin", e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Portfolio/Website</label>
        <Input
          placeholder="johndoe.com"
          value={data.portfolio}
          onChange={(e) => onUpdate("portfolio", e.target.value)}
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-foreground mb-2">Professional Summary</label>
      <Textarea
        placeholder="Write a brief summary highlighting your experience, skills, and career goals..."
        rows={4}
        value={summary}
        onChange={(e) => onSummaryChange(e.target.value)}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Tip: Include relevant keywords from job descriptions you're targeting.
      </p>
    </div>
  </div>
);

interface ExperienceFormProps {
  experiences: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: string | boolean) => void;
  onRemove: (id: string) => void;
}

const ExperienceForm = ({ experiences, onAdd, onUpdate, onRemove }: ExperienceFormProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Work Experience</h2>
        <p className="text-muted-foreground">List your relevant work experience, starting with the most recent.</p>
      </div>
      <Button onClick={onAdd} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add
      </Button>
    </div>

    {experiences.length === 0 ? (
      <div className="text-center py-12 bg-muted/50 rounded-xl border-2 border-dashed border-border">
        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No work experience added yet</p>
        <Button onClick={onAdd} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>
    ) : (
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={exp.id} className="p-6 bg-muted/30 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Position {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => onRemove(exp.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Title *</label>
                <Input
                  placeholder="Software Engineer"
                  value={exp.title}
                  onChange={(e) => onUpdate(exp.id, "title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company *</label>
                <Input
                  placeholder="Acme Inc."
                  value={exp.company}
                  onChange={(e) => onUpdate(exp.id, "company", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => onUpdate(exp.id, "startDate", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                <Input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => onUpdate(exp.id, "endDate", e.target.value)}
                  disabled={exp.current}
                  placeholder={exp.current ? "Present" : ""}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea
                placeholder="Describe your responsibilities and achievements using action verbs..."
                rows={3}
                value={exp.description}
                onChange={(e) => onUpdate(exp.id, "description", e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

interface EducationFormProps {
  education: Education[];
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}

const EducationForm = ({ education, onAdd, onUpdate, onRemove }: EducationFormProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Education</h2>
        <p className="text-muted-foreground">Add your educational background.</p>
      </div>
      <Button onClick={onAdd} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add
      </Button>
    </div>

    {education.length === 0 ? (
      <div className="text-center py-12 bg-muted/50 rounded-xl border-2 border-dashed border-border">
        <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No education added yet</p>
        <Button onClick={onAdd} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>
    ) : (
      <div className="space-y-6">
        {education.map((edu, index) => (
          <div key={edu.id} className="p-6 bg-muted/30 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Education {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => onRemove(edu.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Degree *</label>
                <Input
                  placeholder="Bachelor of Science in Computer Science"
                  value={edu.degree}
                  onChange={(e) => onUpdate(edu.id, "degree", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">School *</label>
                <Input
                  placeholder="University of Technology"
                  value={edu.school}
                  onChange={(e) => onUpdate(edu.id, "school", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Graduation Date</label>
                <Input
                  type="month"
                  value={edu.graduationDate}
                  onChange={(e) => onUpdate(edu.id, "graduationDate", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">GPA (Optional)</label>
                <Input
                  placeholder="3.8"
                  value={edu.gpa}
                  onChange={(e) => onUpdate(edu.id, "gpa", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

interface SkillsFormProps {
  skills: string[];
  newSkill: string;
  onNewSkillChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (skill: string) => void;
}

const SkillsForm = ({ skills, newSkill, onNewSkillChange, onAdd, onRemove }: SkillsFormProps) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">Skills</h2>
      <p className="text-muted-foreground">Add skills relevant to your target positions.</p>
    </div>

    <div className="flex gap-2">
      <Input
        placeholder="Add a skill (e.g., JavaScript, Project Management)"
        value={newSkill}
        onChange={(e) => onNewSkillChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
      />
      <Button onClick={onAdd} variant="default">
        <Plus className="w-4 h-4" />
      </Button>
    </div>

    {skills.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium group"
          >
            {skill}
            <button
              onClick={() => onRemove(skill)}
              className="w-4 h-4 rounded-full bg-primary/20 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 bg-muted/50 rounded-xl border-2 border-dashed border-border">
        <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No skills added yet. Start typing above to add skills.</p>
      </div>
    )}

    <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">Skill Keywords Matter</p>
          <p className="text-muted-foreground">
            Include both technical skills (e.g., Python, AWS) and soft skills (e.g., Leadership, Communication) 
            that match the job descriptions you're targeting.
          </p>
        </div>
      </div>
    </div>
  </div>
);

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview = ({ data }: ResumePreviewProps) => {
  const { personalInfo, summary, experience, education, skills } = data;
  const hasContent = personalInfo.fullName || summary || experience.length > 0 || education.length > 0 || skills.length > 0;

  if (!hasContent) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">Start filling in your information to see the preview</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "-01");
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="text-sm space-y-4">
      {/* Header */}
      <div className="border-b border-border pb-3">
        <h1 className="text-xl font-bold text-foreground">{personalInfo.fullName || "Your Name"}</h1>
        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {(personalInfo.linkedin || personalInfo.portfolio) && (
          <div className="text-xs text-primary mt-1 flex flex-wrap gap-x-3">
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Professional Summary</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Experience</h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground">{exp.title || "Job Title"}</div>
                    <div className="text-muted-foreground">{exp.company || "Company"}</div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {exp.startDate && formatDate(exp.startDate)} - {exp.current ? "Present" : exp.endDate && formatDate(exp.endDate)}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Education</h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-foreground">{edu.degree || "Degree"}</div>
                  <div className="text-muted-foreground">{edu.school || "School"}</div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {edu.graduationDate && formatDate(edu.graduationDate)}
                  {edu.gpa && <div>GPA: {edu.gpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-muted text-foreground rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Builder;
