import { FC, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface JobCardProps {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedTo: TeamMember[];
  tasks: Task[];
  onTaskAdd?: (jobCardId: string, taskTitle: string) => void;
  onTaskToggle?: (jobCardId: string, taskId: string) => void;
  onDelete?: (jobCardId: string) => void;
}

const JobCard: FC<JobCardProps> = ({
  id,
  title,
  description,
  dueDate,
  assignedTo,
  tasks,
  onTaskAdd,
  onTaskToggle,
  onDelete
}) => {
  const [newTask, setNewTask] = useState("");
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  
  const handleAddTask = () => {
    if (newTask.trim() && onTaskAdd) {
      onTaskAdd(id, newTask);
      setNewTask("");
    }
  };
  
  return (
    <Card className="border-muted hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(dueDate, "MMM d")}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete && onDelete(id)} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Assigned To:</h4>
          <div className="flex -space-x-2">
            {assignedTo.map((member) => (
              <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {assignedTo.length > 0 && (
              <div className="bg-muted h-7 w-7 rounded-full border-2 border-background flex items-center justify-center text-xs">
                +{assignedTo.length}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{completedTasks}/{tasks.length} tasks</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Tasks:</h4>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-2"
              >
                <Checkbox 
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => onTaskToggle && onTaskToggle(id, task.id)}
                />
                <label 
                  htmlFor={task.id}
                  className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </label>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask();
                }
              }}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={handleAddTask}
              className="ml-2"
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;