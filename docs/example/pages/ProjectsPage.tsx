import { FC } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Filter,
  Calendar, 
  ListFilter
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: number;
  name: string;
  client: string;
  deadline: string;
  status: "Active" | "On Hold" | "Completed" | "At Risk";
  progress: number;
  team: string[];
}

const projects: Project[] = [
  {
    id: 1,
    name: "Harbor View Residences",
    client: "Coastal Development Corp",
    deadline: "July 15, 2025",
    status: "Active",
    progress: 65,
    team: ["Alex Turner", "Maya Patel", "Sam Chen"]
  },
  {
    id: 2,
    name: "Metropolitan Office Complex",
    client: "Urban Workspaces Inc",
    deadline: "August 22, 2025",
    status: "At Risk",
    progress: 45,
    team: ["Jamie Rodriguez", "Sarah Kim"]
  },
  {
    id: 3,
    name: "Sunset Valley Community Center",
    client: "Valley Municipality",
    deadline: "September 30, 2025",
    status: "On Hold",
    progress: 30,
    team: ["Alex Turner", "Robert Johnson", "Emma Davis"]
  },
  {
    id: 4,
    name: "Riverfront Boutique Hotel",
    client: "Luxe Hospitality Group",
    deadline: "October 12, 2025",
    status: "Active",
    progress: 80,
    team: ["Sarah Kim", "Maya Patel", "David Wilson"]
  },
  {
    id: 5,
    name: "Tech Innovation Campus",
    client: "FutureTech Industries",
    deadline: "November 5, 2025",
    status: "Completed",
    progress: 100,
    team: ["Robert Johnson", "Sam Chen", "Emma Davis"]
  },
];

const getStatusColor = (status: Project["status"]) => {
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

const ProjectsPage: FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary mb-4 md:mb-0">Projects</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8 w-full md:w-[250px]"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="flex items-center gap-1" asChild>
              <Link to="/projects/new">
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <ListFilter className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <div className="grid gap-4">
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer">
                    <CardHeader className="bg-muted/30 p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <CardTitle className="text-lg font-medium">{project.name}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Client</p>
                          <p className="font-medium">{project.client}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p className="font-medium">{project.deadline}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Team</p>
                          <p className="font-medium">{project.team.join(", ")}</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">
                    Calendar view implementation coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectsPage;