import { FC } from "react";
import { Check, FileEdit, MessageSquare, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: number;
  type: "task" | "file" | "message" | "project";
  action: string;
  user: string;
  time: string;
  target: string;
}

interface ActivityCardProps {
  activities: ActivityItem[];
}

const ActivityCard: FC<ActivityCardProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "task":
        return Check;
      case "file":
        return Upload;
      case "message":
        return MessageSquare;
      case "project":
        return FileEdit;
      default:
        return Plus;
    }
  };

  const getActivityIconColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "task":
        return "bg-green-100 text-green-600";
      case "file":
        return "bg-amber-100 text-amber-600";
      case "message":
        return "bg-blue-100 text-blue-600";
      case "project":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="dashboard-card space-y-4">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const iconColor = getActivityIconColor(activity.type);
          
          return (
            <div key={activity.id} className="flex gap-3">
              <div className={cn("rounded-full p-2 h-9 w-9 flex items-center justify-center", iconColor)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityCard;