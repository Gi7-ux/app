import React, { useState } from 'react';
import { SidebarInset, SidebarProvider } from '../../../ui/sidebar.jsx';
import { Users, Activity, DollarSign, Eye } from 'lucide-react';
import { Button } from '../../../ui/button.jsx';

// Dashboard stats data
const stats = [
  {
    title: 'Total Users',
    value: '12,345',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Revenue',
    value: '$45,678',
    change: '+8.2%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Active Sessions',
    value: '2,456',
    change: '+15%',
    changeType: 'positive',
    icon: Activity,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Page Views',
    value: '34,567',
    change: '-2.4%',
    changeType: 'negative',
    icon: Eye,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

// Simple dashboard card component
const DashboardCard = ({ stat }) => {
  const IconComponent = stat.icon;
  
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {stat.change}
          </p>
        </div>
        <div className={`rounded-full p-3 ${stat.bgColor}`}>
          <IconComponent className={`h-6 w-6 ${stat.color}`} />
        </div>
      </div>
    </div>
  );
};

// Simple admin sidebar
const AdminSidebar = () => {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <Button variant="ghost" className="w-full justify-start">
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Projects
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Settings
        </Button>
      </nav>
    </div>
  );
};

// Simple dashboard header
const DashboardHeader = ({ searchQuery, onSearchChange, onRefresh, isRefreshing }) => {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        <Button>Export</Button>
      </div>
    </header>
  );
};

export default function AdminDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-lg p-4">
            <div className="mx-auto max-w-6xl space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome Admin
                </h1>
                <p className="text-muted-foreground">
                  Here&apos;s what&apos;s happening with your platform today.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <DashboardCard key={stat.title} stat={stat} index={index} />
                ))}
              </div>

              {/* Placeholder for more content */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue Chart</h3>
                    <p className="text-muted-foreground">Chart placeholder - would contain actual chart component</p>
                  </div>
                </div>
                <div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full">Add User</Button>
                      <Button className="w-full" variant="outline">Export Data</Button>
                      <Button className="w-full" variant="outline">View Reports</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}