import { ResumeUploader } from "@/components/ResumeUploader";
import { ATSCheckResult } from "@/lib/atsChecker";

interface ResumeImportProps {
  onImport: (data: any, atsResult?: ATSCheckResult) => void;
}

export const ResumeImport = ({ onImport }: ResumeImportProps) => {
  const handleComplete = (data: any, atsResult: ATSCheckResult) => {
    onImport(data, atsResult);
  };

  return (
    <ResumeUploader 
      onComplete={handleComplete} 
      navigateToAnalysis={false} 
    />
  );
};
