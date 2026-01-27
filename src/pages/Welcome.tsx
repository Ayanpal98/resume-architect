import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Users, Briefcase, ArrowRight, CheckCircle2, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type UserType = "jobseeker" | "institution" | null;

const Welcome = () => {
  const [selectedType, setSelectedType] = useState<UserType>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedType === "jobseeker") {
      navigate("/builder");
    } else if (selectedType === "institution") {
      navigate("/recruiter");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-display font-bold text-foreground">ResumeATS</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8 sm:mb-12 animate-fade-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 sm:mb-4">
              Welcome to <span className="text-gradient">ResumeATS</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Tell us about yourself so we can personalize your experience
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Job Seeker Card */}
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 ${
                selectedType === "jobseeker"
                  ? "border-primary ring-2 ring-primary/20 shadow-lg"
                  : "border-border"
              }`}
              onClick={() => setSelectedType("jobseeker")}
            >
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${
                    selectedType === "jobseeker" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    <User className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground">
                        Job Seeker
                      </h3>
                      {selectedType === "jobseeker" && (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                      I want to create or improve my resume to land my dream job
                    </p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {[
                        "AI-powered resume builder",
                        "ATS compatibility analysis",
                        "Cover letter generator",
                        "Job match insights",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Institution Card */}
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 ${
                selectedType === "institution"
                  ? "border-primary ring-2 ring-primary/20 shadow-lg"
                  : "border-border"
              }`}
              onClick={() => setSelectedType("institution")}
            >
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${
                    selectedType === "institution" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground">
                        Recruiter / HR
                      </h3>
                      {selectedType === "institution" && (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                      I want to screen and evaluate candidates for job positions
                    </p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {[
                        "Bulk resume screening",
                        "AI-powered candidate ranking",
                        "Job description matching",
                        "Skills gap analysis",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              variant="hero"
              size="xl"
              disabled={!selectedType}
              onClick={handleContinue}
              className="min-w-[200px]"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
