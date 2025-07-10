import { FC } from "react";
import { Plus, FileText, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const QuickAction: FC<QuickActionProps> = ({ icon: Icon, label, onClick }) => {
  return (
    <Button 
      variant="outline" 
      className="flex flex-col items-center justify-center h-24 w-full"
      onClick={onClick}
    >
      <Icon className="h-6 w-6 mb-2" />
      <span>{label}</span>
    </Button>
  );
};

const QuickActions: FC = () => {
  const { toast } = useToast();
  
  const handleActionClick = (action: string) => {
    toast({
      title: action,
      description: `${action} functionality coming soon.`,
    });
  };

  return (
    <div className="dashboard-card space-y-4">
      <div className="card-header">
        <h3 className="card-title">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <QuickAction 
          icon={Plus} 
          label="New Project" 
          onClick={() => handleActionClick("New Project")} 
        />
        <QuickAction 
          icon={FileText} 
          label="Create Document" 
          onClick={() => handleActionClick("Create Document")} 
        />
        <QuickAction 
          icon={UserPlus} 
          label="Add User" 
          onClick={() => handleActionClick("Add User")} 
        />
        <QuickAction 
          icon={Calendar} 
          label="Schedule Meeting" 
          onClick={() => handleActionClick("Schedule Meeting")} 
        />
      </div>
    </div>
  );
};

export default QuickActions;