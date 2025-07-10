import { FC } from "react";
import { 
  Bell, 
  Search,
  UserCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Header: FC = () => {
  const { toast } = useToast();

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications."
    });
  };

  return (
    <header className="bg-card border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  toast({
                    title: "Search",
                    description: "Search functionality coming soon."
                  });
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" className="flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            <span className="hidden md:inline">Admin User</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;