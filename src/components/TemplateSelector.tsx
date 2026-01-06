import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { templates, ResumeTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

const TemplatePreview = ({ template, isSelected, onClick }: { template: ResumeTemplate; isSelected: boolean; onClick: () => void }) => {
  const previewColors = {
    classic: "from-blue-900 to-blue-800",
    modern: "from-blue-600 to-indigo-600",
    minimal: "from-gray-800 to-gray-700",
    executive: "from-slate-900 to-slate-800",
    creative: "from-violet-600 to-purple-600",
    tech: "from-emerald-600 to-teal-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={template.isPremium}
      className={cn(
        "relative group rounded-xl border-2 p-3 transition-all duration-200",
        isSelected ? "border-primary shadow-lg scale-105" : "border-border hover:border-primary/50",
        template.isPremium && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Preview mock */}
      <div className={cn(
        "w-full aspect-[3/4] rounded-lg bg-gradient-to-br mb-3 relative overflow-hidden",
        previewColors[template.id as keyof typeof previewColors] || previewColors.classic
      )}>
        {/* Mock resume content */}
        <div className="absolute inset-2 flex flex-col gap-1">
          <div className="h-3 bg-white/30 rounded w-3/4"></div>
          <div className="h-1.5 bg-white/20 rounded w-1/2 mt-0.5"></div>
          <div className="h-px bg-white/20 my-1"></div>
          <div className="h-1.5 bg-white/15 rounded w-full"></div>
          <div className="h-1.5 bg-white/15 rounded w-5/6"></div>
          <div className="h-1.5 bg-white/15 rounded w-4/6"></div>
          <div className="mt-auto flex gap-1">
            <div className="h-2 bg-white/20 rounded w-8"></div>
            <div className="h-2 bg-white/20 rounded w-10"></div>
            <div className="h-2 bg-white/20 rounded w-6"></div>
          </div>
        </div>

        {template.isPremium && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </div>
          </div>
        )}

        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="text-left">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground text-sm">{template.name}</h3>
          {!template.isPremium && (
            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-medium">FREE</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
      </div>
    </button>
  );
};

export const TemplateSelector = ({ selectedTemplate, onSelect }: TemplateSelectorProps) => {
  const freeTemplates = templates.filter(t => !t.isPremium);
  const premiumTemplates = templates.filter(t => t.isPremium);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-foreground mb-3">Free Templates</h3>
        <div className="grid grid-cols-3 gap-3">
          {freeTemplates.map((template) => (
            <TemplatePreview
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onClick={() => onSelect(template.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          Premium Templates
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {premiumTemplates.map((template) => (
            <TemplatePreview
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onClick={() => {}}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Upgrade to Pro to unlock premium templates
        </p>
      </div>
    </div>
  );
};
