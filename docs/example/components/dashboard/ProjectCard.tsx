import { FC } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  title: string;
  client: string;
  deadline: string;
  daysLeft: number;
  progress: number;
  members: string[];
}

const ProjectCard: FC<ProjectCardProps> = ({
  title,
  client,
  deadline,
  daysLeft,
  progress,
  members
}) => {
  const { toast } = useToast();
  
  const getStatusColor = () => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 40) return "bg-amber-500";
    return "bg-blue-500";
  };
  
  const getDaysLeftColor = () => {
    if (daysLeft > 10) return "text-green-500";
    if (daysLeft > 3) return "text-amber-500";
    return "text-destructive";
  };
  
  const handleViewDetails = () => {
    toast({
      title: "Project Details",
      description: `View details for ${title} coming soon.`,
    });
  };

  return (
    <div className="dashboard-card space-y-4">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <div className="flex items-center gap-1">
          <div className={cn("status-indicator", getStatusColor())} />
          <span className="text-xs text-muted-foreground">
            {progress}% Complete
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Client: </span>
          {client}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{deadline}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={getDaysLeftColor()}>
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
            </span>
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className={cn("h-full rounded-full", getStatusColor())}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.map((initial, index) => (
              <div 
                key={index} 
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs border-2 border-background"
              >
                {initial}
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={handleViewDetails}>
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;