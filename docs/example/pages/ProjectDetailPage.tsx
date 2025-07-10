import { FC, useState } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import JobCard, { Task, TeamMember } from "@/components/project/JobCard";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Calendar,
  MessageSquare,
  ClipboardList,
  Clock,
  Plus,
  CalendarDays,
  Users
} from "lucide-react";
import { format } from "date-fns";

interface ProjectData {
  id: string;
  name: string;
  client: string;
  description: string;
  deadline: Date;
  startDate: Date;
  status: "Active" | "On Hold" | "Completed" | "At Risk";
  progress: number;
  budget: number;
  team: TeamMember[];
}

const project: ProjectData = {
  id: "p-1",
  name: "Harbor View Residences",
  client: "Coastal Development Corp",
  description: "A luxury residential complex featuring modern architecture with sea views, sustainable design elements, and community spaces. Located in the harbor district.",
  deadline: new Date(2025, 6, 15), // July 15, 2025
  startDate: new Date(2025, 0, 10), // January 10, 2025
  status: "Active",
  progress: 65,
  budget: 2500000,
  team: [
    {
      id: "1",
      name: "Alex Turner",
      role: "Project Manager",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
    },
    {
      id: "2",
      name: "Maya Patel",
      role: "Architect",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
    },
    {
      id: "3",
      name: "Sam Chen",
      role: "Designer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop"
    }
  ]
};

// Job cards with tasks
const initialJobCards = [
  {
    id: "job-1",
    title: "Site Analysis and Planning",
    description: "Evaluate the site and create initial planning documents",
    dueDate: new Date(2025, 1, 15), // February 15, 2025
    assignedTo: [project.team[0], project.team[1]],
    tasks: [
      { id: "task-1-1", title: "Conduct site visit", completed: true },
      { id: "task-1-2", title: "Analyze soil conditions", completed: true },
      { id: "task-1-3", title: "Review local building codes", completed: false },
      { id: "task-1-4", title: "Create preliminary site plan", completed: false }
    ]
  },
  {
    id: "job-2",
    title: "Concept Design",
    description: "Develop architectural concepts based on client requirements",
    dueDate: new Date(2025, 2, 20), // March 20, 2025
    assignedTo: [project.team[1], project.team[2]],
    tasks: [
      { id: "task-2-1", title: "Research similar architectural styles", completed: true },
      { id: "task-2-2", title: "Create initial sketches", completed: true },
      { id: "task-2-3", title: "Develop 3D concept models", completed: false },
      { id: "task-2-4", title: "Present concepts to client", completed: false }
    ]
  },
  {
    id: "job-3",
    title: "Detailed Design",
    description: "Create detailed architectural and engineering drawings",
    dueDate: new Date(2025, 4, 10), // May 10, 2025
    assignedTo: [project.team[1]],
    tasks: [
      { id: "task-3-1", title: "Create floor plans", completed: false },
      { id: "task-3-2", title: "Develop elevation drawings", completed: false },
      { id: "task-3-3", title: "Design structural components", completed: false },
      { id: "task-3-4", title: "Coordinate with engineering team", completed: false }
    ]
  }
];

// Messages in the communication tab
const messages = [
  {
    id: "msg-1",
    sender: {
      id: "client-1",
      name: "Robert Johnson",
      role: "Client",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop"
    },
    content: "I've reviewed the initial concepts and I'm impressed with the direction. However, I would like to see more options for the facade material.",
    timestamp: new Date(2025, 1, 10, 14, 30),
    attachments: []
  },
  {
    id: "msg-2",
    sender: project.team[1],
    content: "Thank you for the feedback. We'll prepare alternative facade options for our next presentation. Are there specific materials you're interested in exploring?",
    timestamp: new Date(2025, 1, 10, 15, 45),
    attachments: []
  },
  {
    id: "msg-3",
    sender: {
      id: "client-1",
      name: "Robert Johnson",
      role: "Client",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop"
    },
    content: "I'm particularly interested in sustainable materials that still provide a luxury appearance. Perhaps some combination of glass, stone, and reclaimed wood?",
    timestamp: new Date(2025, 1, 11, 9, 15),
    attachments: []
  }
];

// Time entries
const timeEntries = [
  {
    id: "time-1",
    user: project.team[1],
    date: new Date(2025, 1, 8),
    hours: 6.5,
    description: "Site analysis and initial concept sketching"
  },
  {
    id: "time-2",
    user: project.team[2],
    date: new Date(2025, 1, 9),
    hours: 8,
    description: "Research on sustainable materials and 3D modeling"
  },
  {
    id: "time-3",
    user: project.team[0],
    date: new Date(2025, 1, 10),
    hours: 4,
    description: "Client meeting preparation and project planning"
  }
];

const getStatusColor = (status: ProjectData["status"]) => {
  switch (status) {
    case "Active":
      return "bg-green-500 text-white";
    case "On Hold":
      return "bg-amber-500 text-white";
    case "Completed":
      return "bg-primary text-white";
    case "At Risk":
      return "bg-destructive text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const ProjectDetailPage: FC = () => {
  const { toast } = useToast();
  const [jobCards, setJobCards] = useState(initialJobCards);
  
  const handleTaskAdd = (jobCardId: string, taskTitle: string) => {
    setJobCards(jobCards.map(card => {
      if (card.id === jobCardId) {
        return {
          ...card,
          tasks: [
            ...card.tasks,
            {
              id: `task-${Date.now()}`,
              title: taskTitle,
              completed: false
            }
          ]
        };
      }
      return card;
    }));
    
    toast({
      title: "Task added",
      description: "New task has been added to the job card."
    });
  };
  
  const handleTaskToggle = (jobCardId: string, taskId: string) => {
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
  
  const handleDeleteJobCard = (jobCardId: string) => {
    setJobCards(jobCards.filter(card => card.id !== jobCardId));
    
    toast({
      title: "Job card deleted",
      description: "The job card and all its tasks have been removed."
    });
  };
  
  const totalTasks = jobCards.reduce((sum, card) => sum + card.tasks.length, 0);
  const completedTasks = jobCards.reduce(
    (sum, card) => sum + card.tasks.filter(task => task.completed).length, 
    0
  );
  
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-secondary">{project.name}</h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">Client: {project.client}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Export
              </Button>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Job Card
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{project.progress}%</div>
              <Progress value={project.progress} className="h-2 mt-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {completedTasks} of {totalTasks} tasks completed
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Start Date</div>
                  <div className="font-medium">{format(project.startDate, "MMM d, yyyy")}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Deadline</div>
                  <div className="font-medium">{format(project.deadline, "MMM d, yyyy")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${project.budget.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Estimated total budget
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="timeEntries" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Time Entries
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobCards.map(jobCard => (
                <JobCard
                  key={jobCard.id}
                  id={jobCard.id}
                  title={jobCard.title}
                  description={jobCard.description}
                  dueDate={jobCard.dueDate}
                  assignedTo={jobCard.assignedTo}
                  tasks={jobCard.tasks}
                  onTaskAdd={handleTaskAdd}
                  onTaskToggle={handleTaskToggle}
                  onDelete={handleDeleteJobCard}
                />
              ))}
              
              <Card className="border-dashed flex flex-col items-center justify-center py-8">
                <Button variant="ghost" className="flex flex-col h-auto py-6">
                  <Plus className="h-8 w-8 mb-2" />
                  <span>Add New Job Card</span>
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Project Team</CardTitle>
                <CardDescription>Team members assigned to this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.team.map(member => (
                    <div key={member.id} className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Assign New Team Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">
                    Calendar view implementation coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Project Communication</CardTitle>
                <CardDescription>Messages and updates from the team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {messages.map(message => (
                    <div key={message.id} className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{message.sender.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(message.timestamp, "MMM d, h:mm a")}
                          </div>
                        </div>
                        <div className="text-sm mt-1">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6">
                    <textarea
                      className="w-full border rounded-md p-2 h-24"
                      placeholder="Write a message..."
                    ></textarea>
                    <div className="flex justify-end mt-2">
                      <Button>Send Message</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeEntries">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Time Entries</CardTitle>
                  <CardDescription>Track hours spent on the project</CardDescription>
                </div>
                <Button size="sm">Add Time Entry</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.user.avatar} />
                          <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{entry.user.name}</div>
                          <div className="text-sm text-muted-foreground">{entry.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{entry.hours} hours</div>
                        <div className="text-xs text-muted-foreground">
                          {format(entry.date, "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;