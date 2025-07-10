import { FC } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconClass?: string;
}

const StatsCard: FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-medium">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <span 
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-green-500" : "text-destructive"
                )}
              >
                {isPositive ? "+" : ""}{change}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          "rounded-full p-2.5",
          iconClass || "bg-primary/10"
        )}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;