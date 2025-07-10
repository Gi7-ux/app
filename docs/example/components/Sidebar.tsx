import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  MessageSquare, 
  FolderOpen, 
  BarChart3, 
  Settings,
  Building2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  
  // Define menu items with their routes
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: ClipboardList, label: "Projects", path: "/projects" },
    { icon: Users, label: "Users", path: "/users" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: FolderOpen, label: "Files", path: "/files" },
    { icon: BarChart3, label: "Reports", path: "/reports" }
  ];

  return (
    <div className={cn(
      "h-screen bg-sidebar-background border-r flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center p-4 border-b">
        <Building2 className="h-6 w-6 text-primary" />
        {!collapsed && (
          <h2 className="text-xl font-bold ml-2 text-primary">Architex Axis</h2>
        )}
      </div>
      
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            
            return (
              <li key={index}>
                <Link 
                  to={item.path} 
                  className={cn(
                    "sidebar-link flex items-center gap-2 p-2 rounded-md transition-colors",
                    isActive ? "bg-sidebar-accent text-primary" : "hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-auto border-t py-4 px-2">
        <Link 
          to="/settings" 
          className={cn(
            "sidebar-link flex items-center gap-2 p-2 rounded-md transition-colors w-full",
            location.pathname === "/settings" ? "bg-sidebar-accent text-primary" : "hover:bg-sidebar-accent"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;