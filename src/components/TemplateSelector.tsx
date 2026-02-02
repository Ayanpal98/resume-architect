import { Check } from "lucide-react";
import { templates, ResumeTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

const TemplatePreview = ({ template, isSelected, onClick }: { template: ResumeTemplate; isSelected: boolean; onClick: () => void }) => {
  const previewColors = {
    classic: "from-slate-800 to-slate-700",
    modern: "from-blue-700 to-indigo-700",
    professional: "from-gray-900 to-gray-800",
  };

  const previewAccents = {
    classic: "bg-slate-600",
    modern: "bg-blue-500",
    professional: "bg-gray-700",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group rounded-xl border-2 p-3 transition-all duration-200 w-full",
        isSelected ? "border-primary shadow-lg scale-[1.02]" : "border-border hover:border-primary/50"
      )}
    >
      {/* Preview mock */}
      <div className={cn(
        "w-full aspect-[3/4] rounded-lg bg-gradient-to-br mb-3 relative overflow-hidden",
        previewColors[template.id as keyof typeof previewColors] || previewColors.classic
      )}>
        {/* Mock resume content */}
        <div className="absolute inset-3 flex flex-col gap-1.5">
          {/* Header */}
          <div className="h-3 bg-white/40 rounded w-2/3"></div>
          <div className="h-1.5 bg-white/25 rounded w-1/2"></div>
          <div className={cn("h-0.5 my-1.5", previewAccents[template.id as keyof typeof previewAccents] || "bg-white/30")}></div>
          
          {/* Sections */}
          <div className="h-2 bg-white/30 rounded w-1/3 mt-1"></div>
          <div className="h-1.5 bg-white/15 rounded w-full"></div>
          <div className="h-1.5 bg-white/15 rounded w-5/6"></div>
          
          <div className="h-2 bg-white/30 rounded w-1/3 mt-2"></div>
          <div className="h-1.5 bg-white/15 rounded w-full"></div>
          <div className="h-1.5 bg-white/15 rounded w-4/5"></div>
          
          {/* Skills */}
          <div className="mt-auto flex gap-1 flex-wrap">
            <div className="h-2 bg-white/20 rounded-full w-8"></div>
            <div className="h-2 bg-white/20 rounded-full w-10"></div>
            <div className="h-2 bg-white/20 rounded-full w-6"></div>
          </div>
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="text-left">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{template.name}</h3>
          <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-medium">ATS</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
      </div>
    </button>
  );
};

export const TemplateSelector = ({ selectedTemplate, onSelect }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        All templates are optimized for Applicant Tracking Systems (ATS) and widely accepted by employers.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplatePreview
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onClick={() => onSelect(template.id)}
          />
        ))}
      </div>
    </div>
  );
};