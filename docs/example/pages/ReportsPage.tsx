import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  DollarSign,
  Users
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProjectTimeData {
  project: string;
  allocated: number;
  spent: number;
  remaining: number;
  progress: number;
}

interface TeamMemberData {
  name: string;
  role: string;
  hours: number;
  utilization: number;
  projects: number;
}

const projectTimeData: ProjectTimeData[] = [
  {
    project: "Harbor View Residences",
    allocated: 750,
    spent: 487,
    remaining: 263,
    progress: 65
  },
  {
    project: "Metropolitan Office Complex",
    allocated: 600,
    spent: 270,
    remaining: 330,
    progress: 45
  },
  {
    project: "Sunset Valley Community Center",
    allocated: 500,
    spent: 150,
    remaining: 350,
    progress: 30
  },
  {
    project: "Riverfront Boutique Hotel",
    allocated: 820,
    spent: 656,
    remaining: 164,
    progress: 80
  },
  {
    project: "Tech Innovation Campus",
    allocated: 950,
    spent: 950,
    remaining: 0,
    progress: 100
  }
];

const teamMemberData: TeamMemberData[] = [
  {
    name: "Alex Turner",
    role: "Senior Architect",
    hours: 162,
    utilization: 95,
    projects: 3
  },
  {
    name: "Maya Patel",
    role: "Project Architect",
    hours: 148,
    utilization: 87,
    projects: 2
  },
  {
    name: "Sam Chen",
    role: "Interior Designer",
    hours: 135,
    utilization: 79,
    projects: 4
  },
  {
    name: "Jamie Rodriguez",
    role: "Project Manager",
    hours: 170,
    utilization: 100,
    projects: 2
  },
  {
    name: "Sarah Kim",
    role: "Junior Architect",
    hours: 140,
    utilization: 82,
    projects: 3
  }
];

// Chart data visualization components
// These are simplified placeholders that visually represent where charts would be rendered
const TimeAllocationChart: FC = () => (
  <div className="flex flex-col items-center justify-center h-[250px] rounded-md border p-4 bg-background">
    <PieChart className="h-16 w-16 text-primary mb-3" strokeWidth={1.5} />
    <div className="flex justify-center gap-8 mt-4">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-primary" />
        <span className="text-xs">Design (35%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-secondary" />
        <span className="text-xs">Documentation (25%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-accent" />
        <span className="text-xs">Client Meetings (20%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-muted-foreground" />
        <span className="text-xs">Site Visits (15%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-amber-500" />
        <span className="text-xs">Administrative (5%)</span>
      </div>
    </div>
  </div>
);

const MonthlyComparisonChart: FC = () => (
  <div className="flex flex-col items-center justify-center h-[250px] rounded-md border p-4 bg-background">
    <BarChart3 className="h-16 w-16 text-primary mb-3" strokeWidth={1.5} />
    <div className="grid grid-cols-6 gap-2 w-full mt-4">
      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="h-24 w-8 bg-muted rounded-t-sm relative overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-primary" 
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          </div>
          <span className="text-xs mt-1">{month}</span>
        </div>
      ))}
    </div>
  </div>
);

const ClientRevenueChart: FC = () => (
  <div className="flex flex-col items-center justify-center h-[250px] rounded-md border p-4 bg-background">
    <DollarSign className="h-16 w-16 text-primary mb-3" strokeWidth={1.5} />
    <div className="flex flex-col gap-3 w-full max-w-md">
      {[
        { name: "Coastal Development Corp", value: 85 },
        { name: "Urban Workspaces Inc", value: 65 },
        { name: "Valley Municipality", value: 50 },
        { name: "Luxe Hospitality Group", value: 75 },
        { name: "FutureTech Industries", value: 90 }
      ].map((client, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{client.name}</span>
            <span className="font-medium">${(client.value * 1200).toLocaleString()}</span>
          </div>
          <Progress value={client.value} className="h-2" />
        </div>
      ))}
    </div>
  </div>
);

const TeamUtilizationChart: FC = () => (
  <div className="flex flex-col items-center justify-center h-[250px] rounded-md border p-4 bg-background">
    <Users className="h-16 w-16 text-primary mb-3" strokeWidth={1.5} />
    <div className="grid grid-cols-5 gap-4 w-full mt-4">
      {teamMemberData.map((member, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="h-20 w-6 bg-muted rounded-full relative overflow-hidden">
            <div 
              className={cn(
                "absolute bottom-0 left-0 right-0 rounded-full",
                member.utilization >= 90 ? "bg-green-500" : 
                member.utilization >= 70 ? "bg-primary" : "bg-amber-500"
              )}
              style={{ height: `${member.utilization}%` }}
            />
          </div>
          <span className="text-xs mt-1 text-center">{member.name.split(' ')[0]}</span>
          <span className="text-xs text-muted-foreground">{member.utilization}%</span>
        </div>
      ))}
    </div>
  </div>
);

const ReportsPage: FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary mb-4 md:mb-0">Reports</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports..."
                className="pl-8 w-full md:w-[250px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="thisMonth">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisQuarter">This Quarter</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Range
              </Button>
              <Button className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="time" className="space-y-4">
          <TabsList>
            <TabsTrigger value="time" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Time Analysis
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="utilization" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Team Utilization
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="time" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Time Allocation by Category</CardTitle>
                  <CardDescription>How project time is distributed across activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeAllocationChart />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monthly Time Comparison</CardTitle>
                  <CardDescription>Hours worked across different months</CardDescription>
                </CardHeader>
                <CardContent>
                  <MonthlyComparisonChart />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Project Time Tracking</CardTitle>
                <CardDescription>Hours allocated vs. hours spent by project</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Allocated Hours</TableHead>
                      <TableHead>Spent Hours</TableHead>
                      <TableHead>Remaining Hours</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTimeData.map((project, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{project.project}</TableCell>
                        <TableCell>{project.allocated}</TableCell>
                        <TableCell>{project.spent}</TableCell>
                        <TableCell>{project.remaining}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="h-2 w-20" />
                            <span className="text-sm">{project.progress}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Revenue</CardTitle>
                  <CardDescription>Total for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-24">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">$128,450</div>
                      <div className="flex items-center justify-center gap-1 text-sm text-green-600 mt-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        12.5% vs. last month
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Expenses</CardTitle>
                  <CardDescription>Total for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-24">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-secondary">$76,320</div>
                      <div className="flex items-center justify-center gap-1 text-sm text-red-600 mt-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        8.3% vs. last month
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Profit</CardTitle>
                  <CardDescription>Total for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-24">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">$52,130</div>
                      <div className="flex items-center justify-center gap-1 text-sm text-green-600 mt-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        18.7% vs. last month
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue by Client</CardTitle>
                <CardDescription>Client contribution to overall revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ClientRevenueChart />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="utilization" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Team Utilization</CardTitle>
                <CardDescription>Percentage of billable hours by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamUtilizationChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Team Member Productivity</CardTitle>
                <CardDescription>Hours logged and project distribution by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Hours Logged</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMemberData.map((member, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.hours}</TableCell>
                        <TableCell>{member.projects}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={member.utilization} 
                              className={cn(
                                "h-2 w-20",
                                member.utilization >= 90 ? "bg-muted text-green-500" : 
                                member.utilization >= 70 ? "bg-muted text-primary" : "bg-muted text-amber-500"
                              )}
                            />
                            <span className="text-sm">{member.utilization}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReportsPage;