import { Trash2, Plus, Code, Package, Cloud, Database, Wrench, CheckCircle, Shield, BarChart, Smartphone, GitBranch, Users, Palette, Briefcase, Heart, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { GroupedSkills, SkillGroup, categorizeSkill, SKILL_CATEGORIES } from "@/lib/skillsGrouping";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SkillsGroupDisplayProps {
  groupedSkills: GroupedSkills;
  onRemoveSkill: (skill: string) => void;
  onAddSkill: (skill: string, category?: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Programming Languages": <Code className="w-4 h-4" />,
  "Frameworks & Libraries": <Package className="w-4 h-4" />,
  "Cloud & DevOps": <Cloud className="w-4 h-4" />,
  "Databases": <Database className="w-4 h-4" />,
  "Tools & Platforms": <Wrench className="w-4 h-4" />,
  "Testing & QA": <CheckCircle className="w-4 h-4" />,
  "Security & Compliance": <Shield className="w-4 h-4" />,
  "Data & Analytics": <BarChart className="w-4 h-4" />,
  "Mobile Development": <Smartphone className="w-4 h-4" />,
  "Methodologies": <GitBranch className="w-4 h-4" />,
  "Soft Skills": <Users className="w-4 h-4" />,
  "Design & UX": <Palette className="w-4 h-4" />,
  "Finance & Business": <Briefcase className="w-4 h-4" />,
  "Healthcare": <Heart className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  "Programming Languages": "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
  "Frameworks & Libraries": "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
  "Cloud & DevOps": "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20",
  "Databases": "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  "Tools & Platforms": "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20",
  "Testing & QA": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
  "Security & Compliance": "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
  "Data & Analytics": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20",
  "Mobile Development": "bg-pink-500/10 text-pink-600 border-pink-500/20 hover:bg-pink-500/20",
  "Methodologies": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20",
  "Soft Skills": "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  "Design & UX": "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20 hover:bg-fuchsia-500/20",
  "Finance & Business": "bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/20",
  "Healthcare": "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20",
};

const SkillGroupSection = ({ 
  group, 
  onRemoveSkill,
  onAddSkill 
}: { 
  group: SkillGroup; 
  onRemoveSkill: (skill: string) => void;
  onAddSkill: (skill: string, category?: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAddSkill(newSkill.trim(), group.category);
      setNewSkill("");
      setShowAddInput(false);
    }
  };

  const colorClass = categoryColors[group.category] || "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";
  const icon = categoryIcons[group.category] || <Tag className="w-4 h-4" />;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-md ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
              {icon}
            </span>
            <span className="font-medium text-foreground text-sm">{group.category}</span>
            <Badge variant="secondary" className="text-xs">
              {group.skills.length}
            </Badge>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 pt-0 border-t border-border/50">
            <div className="flex flex-wrap gap-2 mt-3">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${colorClass}`}
                >
                  {skill}
                  <button
                    onClick={() => onRemoveSkill(skill)}
                    className="w-3.5 h-3.5 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors opacity-60 hover:opacity-100"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              
              {showAddInput ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    placeholder="Add skill..."
                    className="h-7 w-32 text-xs"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleAddSkill}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddInput(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const SkillsGroupDisplay = ({ 
  groupedSkills, 
  onRemoveSkill,
  onAddSkill 
}: SkillsGroupDisplayProps) => {
  return (
    <div className="space-y-3">
      {/* Grouped Skills */}
      {groupedSkills.groups.map((group) => (
        <SkillGroupSection
          key={group.category}
          group={group}
          onRemoveSkill={onRemoveSkill}
          onAddSkill={onAddSkill}
        />
      ))}
      
      {/* Ungrouped Skills */}
      {groupedSkills.ungrouped.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-md bg-muted">
                <Tag className="w-4 h-4 text-muted-foreground" />
              </span>
              <span className="font-medium text-foreground text-sm">Other Skills</span>
              <Badge variant="secondary" className="text-xs">
                {groupedSkills.ungrouped.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedSkills.ungrouped.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-foreground"
                >
                  {skill}
                  <button
                    onClick={() => onRemoveSkill(skill)}
                    className="w-3.5 h-3.5 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors opacity-60 hover:opacity-100"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {groupedSkills.groups.length === 0 && groupedSkills.ungrouped.length === 0 && (
        <div className="text-center py-8 bg-muted/50 rounded-xl border-2 border-dashed border-border">
          <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No skills added yet. Use AI suggestions or add skills manually.
          </p>
        </div>
      )}
    </div>
  );
};
