import { FC, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronRight, CalendarDays, Users, ClipboardList, Plus } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Form schema
const formSchema = z.object({
  projectName: z.string().min(3, {
    message: "Project name must be at least 3 characters.",
  }),
  clientId: z.string({
    required_error: "Please select a client.",
  }),
  projectType: z.string({
    required_error: "Please select a project type.",
  }),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  deadline: z.date({
    required_error: "Please select a deadline.",
  }),
  budget: z.string().min(1, {
    message: "Please enter a budget amount.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

// Client data
const clients = [
  { id: "1", name: "Coastal Development Corp" },
  { id: "2", name: "Urban Workspaces Inc" },
  { id: "3", name: "Valley Municipality" },
  { id: "4", name: "Luxe Hospitality Group" },
  { id: "5", name: "FutureTech Industries" },
];

// Project types
const projectTypes = [
  { id: "residential", name: "Residential" },
  { id: "commercial", name: "Commercial" },
  { id: "institutional", name: "Institutional" },
  { id: "industrial", name: "Industrial" },
  { id: "mixed-use", name: "Mixed-Use" },
  { id: "renovation", name: "Renovation" },
];

const NewProjectPage: FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [projectId, setProjectId] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      description: "",
      budget: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real app, we would send this to an API
    console.log(values);
    
    // Generate a mock project ID
    const newProjectId = Math.random().toString(36).substring(2, 10);
    setProjectId(newProjectId);
    
    // Show success toast
    toast({
      title: "Project created successfully",
      description: `Project "${values.projectName}" has been created.`,
    });
    
    // Move to next step
    setCurrentStep(2);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-secondary">Create New Project</h1>
        </div>

        <div className="mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${currentStep >= 1 ? "bg-primary" : "bg-gray-300"}`}>
              1
            </div>
            <div className={`h-1 w-12 ${currentStep >= 2 ? "bg-primary" : "bg-gray-300"}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${currentStep >= 2 ? "bg-primary" : "bg-gray-300"}`}>
              2
            </div>
            <div className={`h-1 w-12 ${currentStep >= 3 ? "bg-primary" : "bg-gray-300"}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${currentStep >= 3 ? "bg-primary" : "bg-gray-300"}`}>
              3
            </div>
          </div>
          <div className="flex text-sm mt-2">
            <div className="flex-1">Project Details</div>
            <div className="flex-1">Team Assignment</div>
            <div className="flex-1">Job Tasks</div>
          </div>
        </div>
        
        {currentStep === 1 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Enter the basic information about your new architectural project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter project name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projectTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. 250000" 
                              {...field}
                              type="number" 
                              min="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Deadline</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the project scope, goals, and special requirements..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {currentStep === 2 && (
          <TeamAssignment 
            projectId={projectId} 
            onPrevious={() => setCurrentStep(1)} 
            onNext={() => setCurrentStep(3)} 
          />
        )}
        
        {currentStep === 3 && (
          <JobTasks 
            projectId={projectId} 
            onPrevious={() => setCurrentStep(2)} 
          />
        )}
      </div>
    </Layout>
  );
};

interface TeamAssignmentProps {
  projectId: string;
  onPrevious: () => void;
  onNext: () => void;
}

// Team members with skills
const teamMembers = [
  {
    id: "1",
    name: "Alex Turner",
    role: "Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    skills: ["Project Management", "Client Relations"],
    availability: "Full-time"
  },
  {
    id: "2",
    name: "Maya Patel",
    role: "Architect",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    skills: ["Residential Design", "Sustainable Architecture", "3D Modeling"],
    availability: "Full-time"
  },
  {
    id: "3",
    name: "Sam Chen",
    role: "Designer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    skills: ["Interior Design", "Visualization", "AutoCAD"],
    availability: "Part-time"
  },
  {
    id: "4",
    name: "Jamie Rodriguez",
    role: "Project Manager",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop",
    skills: ["Budget Management", "Timeline Planning", "Team Coordination"],
    availability: "Full-time"
  },
  {
    id: "5",
    name: "Sarah Kim",
    role: "Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    skills: ["Commercial Design", "Urban Planning", "Revit"],
    availability: "Contract"
  },
  {
    id: "7",
    name: "Emma Davis",
    role: "Designer",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop",
    skills: ["Landscape Design", "Sustainable Design", "SketchUp"],
    availability: "Part-time"
  },
];

const TeamAssignment: FC<TeamAssignmentProps> = ({ projectId, onPrevious, onNext }) => {
  const { toast } = useToast();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  
  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });
  
  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };
  
  const handleSave = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "Team assignment required",
        description: "Please assign at least one team member to the project.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Team assigned successfully",
      description: `${selectedMembers.length} team members have been assigned to the project.`
    });
    
    onNext();
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Team Assignment
        </CardTitle>
        <CardDescription>
          Assign team members to this project based on their skills and availability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Architect">Architect</SelectItem>
              <SelectItem value="Designer">Designer</SelectItem>
              <SelectItem value="Project Manager">Project Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          {filteredTeamMembers.map((member) => (
            <div 
              key={member.id}
              className={`p-4 border rounded-md flex items-center gap-4 cursor-pointer transition-colors ${
                selectedMembers.includes(member.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleMemberSelection(member.id)}
            >
              <div className="flex-shrink-0">
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{member.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-secondary text-white">{member.role}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {member.availability}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {member.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMembers.includes(member.id) 
                    ? "border-primary bg-primary text-white" 
                    : "border-muted-foreground"
                }`}>
                  {selectedMembers.includes(member.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTeamMembers.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">
            No team members match your search criteria.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleSave}>
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

interface JobTasksProps {
  projectId: string;
  onPrevious: () => void;
}

// Job card tasks interface
interface JobCard {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedTo: string[];
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

const JobTasks: FC<JobTasksProps> = ({ projectId, onPrevious }) => {
  const { toast } = useToast();
  const [jobCards, setJobCards] = useState<JobCard[]>([
    {
      id: "job-1",
      title: "Initial Design Concepts",
      description: "Create preliminary design concepts based on client requirements.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      assignedTo: ["2", "3"],
      tasks: [
        { id: "task-1-1", title: "Review client brief", completed: false },
        { id: "task-1-2", title: "Research similar projects", completed: false },
        { id: "task-1-3", title: "Sketch preliminary concepts", completed: false },
        { id: "task-1-4", title: "Create digital mockups", completed: false }
      ]
    },
    {
      id: "job-2",
      title: "Budget and Timeline Planning",
      description: "Develop detailed budget and project timeline.",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      assignedTo: ["4"],
      tasks: [
        { id: "task-2-1", title: "Estimate material costs", completed: false },
        { id: "task-2-2", title: "Calculate labor requirements", completed: false },
        { id: "task-2-3", title: "Create timeline Gantt chart", completed: false }
      ]
    }
  ]);
  
  const [activeJobCard, setActiveJobCard] = useState<JobCard | null>(null);
  const [isAddingJobCard, setIsAddingJobCard] = useState(false);
  const [newJobCard, setNewJobCard] = useState<{
    title: string;
    description: string;
    dueDate: Date | null;
    assignedTo: string[];
  }>({
    title: "",
    description: "",
    dueDate: null,
    assignedTo: []
  });
  
  const [newTask, setNewTask] = useState("");
  
  const handleAddTask = (jobCardId: string) => {
    if (!newTask.trim()) return;
    
    setJobCards(jobCards.map(card => {
      if (card.id === jobCardId) {
        return {
          ...card,
          tasks: [
            ...card.tasks,
            {
              id: `task-${Date.now()}`,
              title: newTask,
              completed: false
            }
          ]
        };
      }
      return card;
    }));
    
    setNewTask("");
  };
  
  const toggleTaskComplete = (jobCardId: string, taskId: string) => {
    setJobCards(jobCards.map(card => {
      if (card.id === jobCardId) {
        return {
          ...card,
          tasks: card.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          })
        };
      }
      return card;
    }));
  };
  
  const handleCreateJobCard = () => {
    if (!newJobCard.title || !newJobCard.description || !newJobCard.dueDate || newJobCard.assignedTo.length === 0) {
      toast({
        title: "Incomplete job card",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const newCard: JobCard = {
      id: `job-${Date.now()}`,
      title: newJobCard.title,
      description: newJobCard.description,
      dueDate: newJobCard.dueDate,
      assignedTo: newJobCard.assignedTo,
      tasks: []
    };
    
    setJobCards([...jobCards, newCard]);
    setIsAddingJobCard(false);
    setNewJobCard({
      title: "",
      description: "",
      dueDate: null,
      assignedTo: []
    });
    
    toast({
      title: "Job card created",
      description: "New job card has been created successfully."
    });
  };
  
  const handleSaveProject = () => {
    if (jobCards.length === 0) {
      toast({
        title: "No job cards",
        description: "Please create at least one job card with tasks.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Project setup complete!",
      description: "Your project has been created with team assignments and job cards."
    });
    
    // Navigate to projects page (would use React Router in actual implementation)
    window.location.href = "/projects";
  };
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardList className="mr-2 h-5 w-5" />
          Job Cards & Tasks
        </CardTitle>
        <CardDescription>
          Create job cards with specific tasks for team members to accomplish.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cards">
          <TabsList className="mb-4">
            <TabsTrigger value="cards">Job Cards</TabsTrigger>
            <TabsTrigger value="board">Task Board</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-4">
            {jobCards.map((jobCard) => (
              <Card key={jobCard.id} className="border-muted hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle>{jobCard.title}</CardTitle>
                    <Badge className="bg-primary">
                      {new Intl.DateTimeFormat("en-US", { 
                        month: "short", 
                        day: "numeric" 
                      }).format(jobCard.dueDate)}
                    </Badge>
                  </div>
                  <CardDescription>{jobCard.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Assigned To:</h4>
                    <div className="flex flex-wrap gap-2">
                      {jobCard.assignedTo.map((memberId) => {
                        const member = teamMembers.find(m => m.id === memberId);
                        return member ? (
                          <div key={memberId} className="flex items-center gap-2 p-1 px-2 bg-muted rounded-full">
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              className="h-5 w-5 rounded-full object-cover"
                            />
                            <span className="text-xs">{member.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-2">Tasks ({jobCard.tasks.filter(t => t.completed).length}/{jobCard.tasks.length}):</h4>
                  <div className="space-y-2">
                    {jobCard.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-2"
                        onClick={() => toggleTaskComplete(jobCard.id, task.id)}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center cursor-pointer ${
                          task.completed 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground"
                        }`}>
                          {task.completed && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </span>
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
                          handleAddTask(jobCard.id);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleAddTask(jobCard.id)}
                      className="ml-2"
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {isAddingJobCard ? (
              <Card>
                <CardHeader>
                  <CardTitle>New Job Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={newJobCard.title}
                      onChange={(e) => setNewJobCard({...newJobCard, title: e.target.value})}
                      placeholder="Job card title"
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={newJobCard.description}
                      onChange={(e) => setNewJobCard({...newJobCard, description: e.target.value})}
                      placeholder="Describe what needs to be done"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${!newJobCard.dueDate && "text-muted-foreground"}`}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {newJobCard.dueDate ? (
                            format(newJobCard.dueDate, "PPP")
                          ) : (
                            <span>Pick a due date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newJobCard.dueDate || undefined}
                          onSelect={(date) => date && setNewJobCard({...newJobCard, dueDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <FormLabel>Assign Team Members</FormLabel>
                    <div className="grid gap-2 mt-2">
                      {teamMembers.map((member) => (
                        <div 
                          key={member.id}
                          className="flex items-center gap-2"
                          onClick={() => {
                            if (newJobCard.assignedTo.includes(member.id)) {
                              setNewJobCard({
                                ...newJobCard, 
                                assignedTo: newJobCard.assignedTo.filter(id => id !== member.id)
                              });
                            } else {
                              setNewJobCard({
                                ...newJobCard, 
                                assignedTo: [...newJobCard.assignedTo, member.id]
                              });
                            }
                          }}
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center cursor-pointer ${
                            newJobCard.assignedTo.includes(member.id)
                              ? "bg-primary border-primary" 
                              : "border-muted-foreground"
                          }`}>
                            {newJobCard.assignedTo.includes(member.id) && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              className="h-6 w-6 rounded-full object-cover"
                            />
                            <span className="text-sm">{member.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingJobCard(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateJobCard}>
                    Create Job Card
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Button 
                variant="outline" 
                className="w-full py-8 border-dashed"
                onClick={() => setIsAddingJobCard(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Job Card
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="board">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="bg-muted/30 py-3">
                  <CardTitle className="text-sm font-medium">To Do</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {jobCards.flatMap(card => 
                    card.tasks
                      .filter(task => !task.completed)
                      .map(task => (
                        <div key={task.id} className="p-2 bg-background border rounded-md shadow-sm">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">From: {card.title}</p>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-muted/30 py-3">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex items-center justify-center h-20 border border-dashed rounded-md text-sm text-muted-foreground">
                    Drag tasks here
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-muted/30 py-3">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {jobCards.flatMap(card => 
                    card.tasks
                      .filter(task => task.completed)
                      .map(task => (
                        <div key={task.id} className="p-2 bg-background border rounded-md shadow-sm">
                          <p className="text-sm font-medium line-through text-muted-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">From: {card.title}</p>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleSaveProject}>
          Complete Project Setup
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewProjectPage;