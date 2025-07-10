import { ClipboardList, FolderOpen, UserPlus, Users } from "lucide-react";
import Layout from "@/components/Layout";
import StatsCard from "@/components/dashboard/StatsCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import QuickActions from "@/components/dashboard/QuickActions";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample activity data
const recentActivities = [
  {
    id: 1,
    type: "task" as const,
    action: "completed task",
    user: "Alex Morgan",
    time: "Just now",
    target: "Design Review"
  },
  {
    id: 2,
    type: "file" as const,
    action: "uploaded file",
    user: "Jamie Smith",
    time: "2 hours ago",
    target: "Final Renders.zip"
  },
  {
    id: 3,
    type: "message" as const,
    action: "commented on",
    user: "Taylor Reid",
    time: "3 hours ago",
    target: "Client Meeting Notes"
  },
  {
    id: 4,
    type: "project" as const,
    action: "created project",
    user: "Morgan Lee",
    time: "Yesterday",
    target: "City Center Mall"
  }
];

function HomePage() {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Dashboard Title */}
        <div>
          <h1 className="text-2xl font-bold">Welcome to Architex Axis</h1>
          <p className="text-muted-foreground">
            Streamline your architectural project management workflow
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Active Projects"
            value="12"
            change="3"
            isPositive={true}
            icon={ClipboardList}
            iconClass="bg-primary/10"
          />
          <StatsCard 
            title="Team Members"
            value="24"
            change="2"
            isPositive={true}
            icon={Users}
            iconClass="bg-accent/10"
          />
          <StatsCard 
            title="Clients"
            value="38"
            change="5"
            isPositive={true}
            icon={UserPlus}
            iconClass="bg-secondary/10"
          />
          <StatsCard 
            title="Files Uploaded"
            value="287"
            change="64"
            isPositive={true}
            icon={FolderOpen}
            iconClass="bg-amber-500/10"
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Section (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">Active Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProjectCard 
                title="Modern City Apartment"
                client="Urban Dwellings LLC"
                deadline="Aug 15, 2025"
                daysLeft={12}
                progress={75}
                members={["JD", "AM", "TR"]}
              />
              <ProjectCard 
                title="Riverside Office Complex"
                client="Waterfront Developers"
                deadline="Jul 30, 2025"
                daysLeft={5}
                progress={45}
                members={["KL", "BT", "JR"]}
              />
              <ProjectCard 
                title="Highland Park Residences"
                client="Summit Properties"
                deadline="Sep 22, 2025"
                daysLeft={28}
                progress={25}
                members={["MS", "PL", "AT"]}
              />
              <ProjectCard 
                title="Downtown Art Museum"
                client="Metropolitan Arts Council"
                deadline="Jul 18, 2025"
                daysLeft={2}
                progress={90}
                members={["EJ", "SD", "KM"]}
              />
            </div>
          </div>
          
          {/* Sidebar Content (1/3 width on large screens) */}
          <div className="space-y-6">
            <QuickActions />
            <ActivityCard activities={recentActivities} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;