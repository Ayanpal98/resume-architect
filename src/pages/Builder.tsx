import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  GitCompare,
  Layout,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { downloadPDF, ResumeData } from "@/lib/pdfGenerator";
import { TemplateSelector } from "@/components/TemplateSelector";
import { TemplateRecommendation } from "@/components/TemplateRecommendation";
import { AISuggestionPanel } from "@/components/AISuggestionPanel";
import { ResumeImport } from "@/components/ResumeImport";
import { ATSScorePanel } from "@/components/ATSScorePanel";
import { CoverLetterGenerator } from "@/components/CoverLetterGenerator";
import { JobMatchPanel } from "@/components/JobMatchPanel";
import { ResumeComparison } from "@/components/ResumeComparison";
import { ATSScorePreview } from "@/components/ATSScorePreview";
import { checkATSCompatibility, ATSCheckResult, getScoreBgColor } from "@/lib/atsChecker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const incomingState = location.state as { resumeData?: ResumeData; atsResult?: ATSCheckResult } | null;

  const [resumeData, setResumeData] = useState<ResumeData>(incomingState?.resumeData || initialResumeData);
  const [activeSection, setActiveSection] = useState("personal");
  const [newSkill, setNewSkill] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [jobDescription, setJobDescription] = useState("");
  const [showImport, setShowImport] = useState(searchParams.get("upload") === "true");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showATSDetails, setShowATSDetails] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [originalResumeData, setOriginalResumeData] = useState<ResumeData | null>(null);

  // Handle incoming state from ATS analysis page
  useEffect(() => {
    if (incomingState?.resumeData) {
      setResumeData(incomingState.resumeData);
    }
    if (incomingState?.atsResult) {
      setShowATSDetails(true);
    }
  }, []);

  // Calculate ATS score using the comprehensive checker
  const atsResult = checkATSCompatibility(resumeData);
  const atsScore = atsResult.overallScore;
  
  // Check if resume has meaningful content to evaluate
  const hasContent = resumeData.personalInfo.fullName.trim() || 
                     resumeData.personalInfo.email.trim() || 
                     resumeData.experience.length > 0 || 
                     resumeData.education.length > 0 || 
                     resumeData.skills.length > 0 ||
                     resumeData.summary.trim();
  const isEvaluated = Boolean(hasContent);

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
    try {
      downloadPDF(resumeData, selectedTemplate);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleImport = (data: any, importAtsResult?: ATSCheckResult) => {
    // Store original data for comparison (deep clone)
    const importedData = {
      ...data,
      personalInfo: { ...data.personalInfo },
      experience: data.experience?.map((exp: any) => ({ ...exp })) || [],
      education: data.education?.map((edu: any) => ({ ...edu })) || [],
      skills: [...(data.skills || [])],
    };
    setOriginalResumeData(importedData);
    
    setResumeData((prev) => ({
      ...prev,
      ...data,
      personalInfo: { ...prev.personalInfo, ...data.personalInfo },
    }));
    setShowImport(false);
    
    if (importAtsResult) {
      setShowATSDetails(true);
    }
  };

  const handleApplySuggestion = (field: string, value: string) => {
    if (field === "summary") {
      setResumeData((prev) => ({ ...prev, summary: value }));
    } else if (field === "skills") {
      const newSkills = value.split(",").map((s) => s.trim()).filter(Boolean);
      setResumeData((prev) => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...newSkills])],
      }));
    }
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "optimize", label: "AI Optimize", icon: Sparkles },
    { id: "jobmatch", label: "Job Match", icon: Target },
    { id: "coverletter", label: "Cover Letter", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
              <span className="text-sm sm:text-lg font-display font-bold text-foreground hidden xs:inline">Resume Builder</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Dialog open={showImport} onOpenChange={setShowImport}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="px-2 sm:px-3">
                  <Upload className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg mx-auto">
                <DialogHeader>
                  <DialogTitle>Import Resume</DialogTitle>
                </DialogHeader>
                <ResumeImport onImport={handleImport} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="px-2 sm:px-3 hidden sm:flex">
                  <Layout className="w-4 h-4 sm:mr-2" />
                  <span className="hidden md:inline">Templates</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto mx-auto">
                <DialogHeader>
                  <DialogTitle>Choose Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* AI Recommendations */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Recommended for You</h3>
                    <TemplateRecommendation
                      resumeData={resumeData}
                      selectedTemplate={selectedTemplate}
                      onSelectTemplate={(id) => {
                        setSelectedTemplate(id);
                        setShowTemplates(false);
                        toast.success(`${id.charAt(0).toUpperCase() + id.slice(1)} template selected`);
                      }}
                    />
                  </div>
                  
                  {/* Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or browse all</span>
                    </div>
                  </div>
                  
                  {/* All Templates */}
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onSelect={(id) => {
                      setSelectedTemplate(id);
                      setShowTemplates(false);
                      toast.success(`${id.charAt(0).toUpperCase() + id.slice(1)} template selected`);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Comparison Dialog - only show if we have original data to compare */}
            {originalResumeData && (
              <Dialog open={showComparison} onOpenChange={setShowComparison}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2 sm:px-3 hidden md:flex">
                    <GitCompare className="w-4 h-4 sm:mr-2" />
                    <span className="hidden lg:inline">Compare</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto mx-auto">
                  <ResumeComparison
                    originalData={originalResumeData}
                    currentData={resumeData}
                    onClose={() => setShowComparison(false)}
                  />
                </DialogContent>
              </Dialog>
            )}

            <Button variant="hero" size="sm" onClick={handleDownload} className="px-2 sm:px-3">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
            {/* Sidebar - horizontal scroll on mobile */}
            <div className="lg:col-span-3 order-1">
              <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                {/* ATS Readiness */}
                <Dialog open={showATSDetails} onOpenChange={setShowATSDetails}>
                  <DialogTrigger asChild>
                    <button 
                      className="w-full bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 shadow-sm hover:border-primary/50 transition-colors text-left"
                      disabled={!isEvaluated}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        {isEvaluated ? (
                          <div 
                            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-white ${getScoreBgColor(atsScore)}`}
                          >
                            {atsScore}%
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-muted border-2 border-dashed border-muted-foreground/30">
                            <Target className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground/50" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">ATS Readiness</div>
                          <div className="text-sm text-muted-foreground">
                            {isEvaluated ? (
                              atsResult.passStatus === "excellent" ? "Excellent" : 
                              atsResult.passStatus === "good" ? "Good" : 
                              atsResult.passStatus === "fair" ? "Fair" : "Needs work"
                            ) : (
                              "Not Evaluated"
                            )}
                          </div>
                        </div>
                      </div>
                      {isEvaluated ? (
                        <>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${getScoreBgColor(atsScore)}`}
                              style={{ width: `${atsScore}%` }}
                            />
                          </div>
                          <p className="text-xs text-primary mt-3 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Click for detailed analysis
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-muted-foreground/20" style={{ width: '0%' }} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Start adding your details to see your score
                          </p>
                        </>
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto p-0">
                    <ATSScorePanel result={atsResult} onDismiss={() => setShowATSDetails(false)} />
                  </DialogContent>
                </Dialog>

                {/* Navigation - horizontal scrollable on mobile */}
                <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-2 sm:p-4 shadow-sm">
                  <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-left transition-all whitespace-nowrap flex-shrink-0 lg:flex-shrink lg:w-full ${
                          activeSection === section.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <section.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">{section.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tips - hidden on mobile */}
                <div className="bg-primary/5 rounded-xl sm:rounded-2xl border border-primary/20 p-4 sm:p-6 hidden sm:block">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="font-medium text-foreground text-sm sm:text-base">ATS Tips</span>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mt-0.5" />
                      Use standard section headers
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mt-0.5" />
                      Include relevant keywords
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mt-0.5" />
                      Avoid tables and graphics
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mt-0.5" />
                      Use simple, clean formatting
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-5 order-3 lg:order-2">
              <div className="space-y-4">
                <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 md:p-8 shadow-sm">
                  {activeSection === "personal" && (
                    <PersonalInfoForm 
                      data={resumeData.personalInfo} 
                      summary={resumeData.summary}
                      onUpdate={updatePersonalInfo}
                      onSummaryChange={(value) => setResumeData(prev => ({ ...prev, summary: value }))}
                      onApplySuggestion={handleApplySuggestion}
                      resumeData={resumeData}
                      jobDescription={jobDescription}
                    />
                  )}
                  {activeSection === "experience" && (
                    <ExperienceForm
                      experiences={resumeData.experience}
                      onAdd={addExperience}
                      onUpdate={updateExperience}
                      onRemove={removeExperience}
                      jobDescription={jobDescription}
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
                      onApplySuggestion={handleApplySuggestion}
                      resumeData={resumeData}
                      jobDescription={jobDescription}
                    />
                  )}
                  {activeSection === "optimize" && (
                    <OptimizeSection
                      jobDescription={jobDescription}
                      onJobDescriptionChange={setJobDescription}
                      resumeData={resumeData}
                      onApplySuggestion={handleApplySuggestion}
                    />
                  )}
                  {activeSection === "jobmatch" && (
                    <JobMatchPanel
                      resumeData={resumeData}
                      jobDescription={jobDescription}
                      onJobDescriptionChange={setJobDescription}
                    />
                  )}
                  {activeSection === "coverletter" && (
                    <CoverLetterGenerator
                      resumeData={resumeData}
                      jobDescription={jobDescription}
                      onJobDescriptionChange={setJobDescription}
                    />
                  )}
                </div>

                {/* ATS Score Preview with Download */}
                <ATSScorePreview 
                  result={atsResult}
                  onDownload={handleDownload}
                  hasContent={isEvaluated}
                />
              </div>
            </div>

            {/* Preview Section - hidden on mobile, shown on larger screens */}
            <div className="hidden lg:block lg:col-span-4 order-2 lg:order-3">
              <div className="sticky top-24">
                <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                  <div className="bg-muted px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground text-sm sm:text-base">Live Preview</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{selectedTemplate} Template</span>
                  </div>
                  <div className="p-4 sm:p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    <ResumePreview data={resumeData} templateId={selectedTemplate} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile/Tablet Preview Button - Fixed FAB */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="hero"
            size="lg"
            className="lg:hidden fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-xl"
          >
            <Eye className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="bg-muted px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </SheetTitle>
              <span className="text-xs text-muted-foreground capitalize">{selectedTemplate} Template</span>
            </div>
          </SheetHeader>
          <div className="p-4 overflow-y-auto h-[calc(85vh-60px)]">
            <ResumePreview data={resumeData} templateId={selectedTemplate} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface PersonalInfoFormProps {
  data: ResumeData["personalInfo"];
  summary: string;
  onUpdate: (field: string, value: string) => void;
  onSummaryChange: (value: string) => void;
  onApplySuggestion: (field: string, value: string) => void;
  resumeData: ResumeData;
  jobDescription: string;
}

const PersonalInfoForm = ({ data, summary, onUpdate, onSummaryChange, onApplySuggestion, resumeData, jobDescription }: PersonalInfoFormProps) => (
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

    <AISuggestionPanel
      type="summary"
      content={{
        experience: resumeData.experience.map(e => `${e.title} at ${e.company}`).join(", "),
        skills: resumeData.skills.join(", "),
        targetRole: "",
      }}
      onApply={(suggestion) => onApplySuggestion("summary", suggestion)}
      jobDescription={jobDescription}
    />
  </div>
);

interface ExperienceFormProps {
  experiences: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: string | boolean) => void;
  onRemove: (id: string) => void;
  jobDescription: string;
}

const ExperienceForm = ({ experiences, onAdd, onUpdate, onRemove, jobDescription }: ExperienceFormProps) => (
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
            
            <div className="mt-4">
              <AISuggestionPanel
                type="experience"
                content={{
                  title: exp.title,
                  company: exp.company,
                  description: exp.description,
                }}
                onApply={(suggestion) => onUpdate(exp.id, "description", suggestion)}
                jobDescription={jobDescription}
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
  onApplySuggestion: (field: string, value: string) => void;
  resumeData: ResumeData;
  jobDescription: string;
}

const SkillsForm = ({ skills, newSkill, onNewSkillChange, onAdd, onRemove, onApplySuggestion, resumeData, jobDescription }: SkillsFormProps) => (
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

    <AISuggestionPanel
      type="skills"
      content={{
        experience: resumeData.experience.map(e => `${e.title} at ${e.company}: ${e.description}`).join("\n"),
        currentSkills: skills.join(", "),
        targetRole: "",
      }}
      onApply={(suggestion) => onApplySuggestion("skills", suggestion)}
      jobDescription={jobDescription}
    />

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

interface OptimizeSectionProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  resumeData: ResumeData;
  onApplySuggestion: (field: string, value: string) => void;
}

const OptimizeSection = ({ jobDescription, onJobDescriptionChange, resumeData, onApplySuggestion }: OptimizeSectionProps) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">AI Optimization</h2>
      <p className="text-muted-foreground">Paste a job description to get tailored suggestions for your resume.</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        <Target className="w-4 h-4 inline mr-2" />
        Target Job Description
      </label>
      <Textarea
        placeholder="Paste the job description you're applying for..."
        rows={8}
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground mt-2">
        The AI will analyze this to suggest relevant keywords and improvements.
      </p>
    </div>

    {jobDescription && (
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">AI Suggestions</h3>
        
        <AISuggestionPanel
          type="keywords"
          content={jobDescription}
          onApply={(suggestion) => {
            const keywords = suggestion.split(",").map(k => k.trim()).filter(Boolean);
            onApplySuggestion("skills", keywords.join(", "));
          }}
          jobDescription={jobDescription}
        />

        <AISuggestionPanel
          type="summary"
          content={{
            experience: resumeData.experience.map(e => `${e.title} at ${e.company}`).join(", "),
            skills: resumeData.skills.join(", "),
            targetRole: "",
          }}
          onApply={(suggestion) => onApplySuggestion("summary", suggestion)}
          jobDescription={jobDescription}
        />
      </div>
    )}

    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">How AI Optimization Works</p>
          <p className="text-muted-foreground">
            Our AI analyzes the job description to identify key requirements and suggests improvements 
            to your resume content. This helps ensure your resume contains relevant keywords that 
            ATS systems look for.
          </p>
        </div>
      </div>
    </div>
  </div>
);

interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
}

const ResumePreview = ({ data, templateId }: ResumePreviewProps) => {
  const { personalInfo, summary, experience, education, skills } = data;
  const hasContent = personalInfo.fullName || summary || experience.length > 0 || education.length > 0 || skills.length > 0;

  const templateColors = {
    classic: { primary: "text-blue-900", accent: "text-blue-600", bg: "bg-blue-900" },
    modern: { primary: "text-blue-700", accent: "text-blue-500", bg: "bg-blue-700" },
    minimal: { primary: "text-gray-900", accent: "text-gray-600", bg: "bg-gray-900" },
    executive: { primary: "text-slate-900", accent: "text-sky-600", bg: "bg-slate-900" },
    creative: { primary: "text-violet-700", accent: "text-purple-500", bg: "bg-violet-700" },
    tech: { primary: "text-emerald-700", accent: "text-teal-500", bg: "bg-emerald-700" },
  };

  const colors = templateColors[templateId as keyof typeof templateColors] || templateColors.classic;

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
        <h1 className={`text-xl font-bold ${colors.primary}`}>{personalInfo.fullName || "Your Name"}</h1>
        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {(personalInfo.linkedin || personalInfo.portfolio) && (
          <div className={`text-xs mt-1 flex flex-wrap gap-x-3 ${colors.accent}`}>
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-1 ${colors.primary}`}>Professional Summary</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${colors.primary}`}>Experience</h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground">{exp.title || "Job Title"}</div>
                    <div className={colors.accent}>{exp.company || "Company"}</div>
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
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${colors.primary}`}>Education</h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-foreground">{edu.degree || "Degree"}</div>
                  <div className={colors.accent}>{edu.school || "School"}</div>
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
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${colors.primary}`}>Skills</h2>
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
