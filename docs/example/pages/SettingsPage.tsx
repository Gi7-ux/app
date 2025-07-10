import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Save, 
  User,
  Building,
  Mail,
  Lock,
  Bell,
  Palette,
  Shield,
  HardDrive,
  Globe,
  UserCog
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

const SettingsPage: FC = () => {
  const isMobile = useIsMobile();
  const [emailNotifications, setEmailNotifications] = useState({
    projectUpdates: true,
    taskAssignments: true,
    messages: true,
    fileUploads: false,
    systemNotifications: true,
    weeklyDigest: true
  });
  
  const [inAppNotifications, setInAppNotifications] = useState({
    projectUpdates: true,
    taskAssignments: true,
    messages: true,
    fileUploads: true,
    systemNotifications: true
  });

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary mb-4 md:mb-0">Settings</h1>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <div className={`${isMobile ? 'mb-4' : ''}`}>
            <TabsList className={isMobile ? "grid grid-cols-2 gap-2" : ""}>
              <TabsTrigger value="profile" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {!isMobile && "Profile"}
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {!isMobile && "Company"}
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-1">
                <UserCog className="h-4 w-4" />
                {!isMobile && "Account"}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                {!isMobile && "Notifications"}
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                {!isMobile && "Appearance"}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                {!isMobile && "Security"}
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop" />
                      <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </div>
                  
                  <div className="grid flex-1 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="Alex" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Turner" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex gap-2">
                        <Input id="email" type="email" defaultValue="alex.turner@example.com" />
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                          Verify Email
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input id="title" defaultValue="Senior Architect" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        defaultValue="Senior architect with over 10 years of experience specializing in sustainable commercial structures and urban development projects."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-5 flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button className="flex gap-1">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Company Settings */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Manage your company details and business information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-24 w-24 rounded-md bg-muted flex items-center justify-center">
                      <Building className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <Button variant="outline" size="sm">Upload Logo</Button>
                  </div>
                  
                  <div className="grid flex-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" defaultValue="Architex Design Studio" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select defaultValue="architecture">
                          <SelectTrigger id="businessType">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="architecture">Architecture Firm</SelectItem>
                            <SelectItem value="interior">Interior Design Studio</SelectItem>
                            <SelectItem value="construction">Construction Company</SelectItem>
                            <SelectItem value="engineering">Engineering Consultancy</SelectItem>
                            <SelectItem value="urban">Urban Planning Agency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="founded">Founded Year</Label>
                        <Input id="founded" type="number" defaultValue="2010" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Textarea 
                        id="businessAddress"
                        defaultValue="123 Design District, Suite 500&#10;San Francisco, CA 94107"
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessPhone">Business Phone</Label>
                        <Input id="businessPhone" type="tel" defaultValue="+1 (555) 987-6543" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="businessEmail">Business Email</Label>
                        <Input id="businessEmail" type="email" defaultValue="contact@architex.com" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" type="url" defaultValue="https://www.architex-design.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                      <Input id="taxId" defaultValue="US 12-3456789" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-5 flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button className="flex gap-1">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Account Settings */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and authentication settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Preferences</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">Primary Email</Label>
                    <div className="flex gap-2">
                      <Input id="primaryEmail" type="email" defaultValue="alex.turner@example.com" />
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        Make Primary
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Recovery Email</h4>
                      <p className="text-sm text-muted-foreground">Used for account recovery</p>
                    </div>
                    <Button variant="outline" size="sm">Add Recovery Email</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Language & Region</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en-US">
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (United States)</SelectItem>
                          <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="america-los_angeles">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="america-los_angeles">Pacific Time (Los Angeles)</SelectItem>
                          <SelectItem value="america-denver">Mountain Time (Denver)</SelectItem>
                          <SelectItem value="america-chicago">Central Time (Chicago)</SelectItem>
                          <SelectItem value="america-new_york">Eastern Time (New York)</SelectItem>
                          <SelectItem value="europe-london">GMT (London)</SelectItem>
                          <SelectItem value="europe-berlin">CET (Berlin)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <RadioGroup defaultValue="mdy" id="dateFormat" className="flex flex-col sm:flex-row gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mdy" id="mdy" />
                        <Label htmlFor="mdy">MM/DD/YYYY</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dmy" id="dmy" />
                        <Label htmlFor="dmy">DD/MM/YYYY</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ymd" id="ymd" />
                        <Label htmlFor="ymd">YYYY/MM/DD</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-5 flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button className="flex gap-1">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Disable All</Button>
                        <Button variant="outline" size="sm">Enable All</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-project-updates">Project Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails when projects are updated
                          </p>
                        </div>
                        <Switch
                          id="email-project-updates"
                          checked={emailNotifications.projectUpdates}
                          onCheckedChange={(checked) => 
                            setEmailNotifications({...emailNotifications, projectUpdates: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-task-assignments">Task Assignments</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails when tasks are assigned to you
                          </p>
                        </div>
                        <Switch
                          id="email-task-assignments"
                          checked={emailNotifications.taskAssignments}
                          onCheckedChange={(checked) => 
                            setEmailNotifications({...emailNotifications, taskAssignments: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-messages">Messages</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails for new messages
                          </p>
                        </div>
                        <Switch
                          id="email-messages"
                          checked={emailNotifications.messages}
                          onCheckedChange={(checked) => 
                            setEmailNotifications({...emailNotifications, messages: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-file-uploads">File Uploads</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails when files are uploaded to your projects
                          </p>
                        </div>
                        <Switch
                          id="email-file-uploads"
                          checked={emailNotifications.fileUploads}
                          onCheckedChange={(checked) => 
                            setEmailNotifications({...emailNotifications, fileUploads: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-system">System Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails about important system updates
                          </p>
                        </div>
                        <Switch
                          id="email-system"
                          checked={emailNotifications.systemNotifications}
                          onCheckedChange={(checked) => 
                            setEmailNotifications({...emailNotifications, systemNotifications: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-digest">Weekly Digest</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive a weekly summary of all project activities
                          </p>
                        </div>
                        <Switch
                          id="email-digest"
                          checked={emailNotifications.weeklyDigest}
                          onCheckedChange={(checked) => 
                            setEmailNotifications({...emailNotifications, weeklyDigest: checked})
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">In-App Notifications</h3>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Disable All</Button>
                        <Button variant="outline" size="sm">Enable All</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inapp-project-updates">Project Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when projects are updated
                          </p>
                        </div>
                        <Switch
                          id="inapp-project-updates"
                          checked={inAppNotifications.projectUpdates}
                          onCheckedChange={(checked) => 
                            setInAppNotifications({...inAppNotifications, projectUpdates: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inapp-task-assignments">Task Assignments</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when tasks are assigned to you
                          </p>
                        </div>
                        <Switch
                          id="inapp-task-assignments"
                          checked={inAppNotifications.taskAssignments}
                          onCheckedChange={(checked) => 
                            setInAppNotifications({...inAppNotifications, taskAssignments: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inapp-messages">Messages</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for new messages
                          </p>
                        </div>
                        <Switch
                          id="inapp-messages"
                          checked={inAppNotifications.messages}
                          onCheckedChange={(checked) => 
                            setInAppNotifications({...inAppNotifications, messages: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inapp-file-uploads">File Uploads</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when files are uploaded to your projects
                          </p>
                        </div>
                        <Switch
                          id="inapp-file-uploads"
                          checked={inAppNotifications.fileUploads}
                          onCheckedChange={(checked) => 
                            setInAppNotifications({...inAppNotifications, fileUploads: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inapp-system">System Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about important system updates
                          </p>
                        </div>
                        <Switch
                          id="inapp-system"
                          checked={inAppNotifications.systemNotifications}
                          onCheckedChange={(checked) => 
                            setInAppNotifications({...inAppNotifications, systemNotifications: checked})
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-5 flex justify-between">
                <Button variant="outline">Reset Defaults</Button>
                <Button className="flex gap-1">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <RadioGroup defaultValue="light" className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <div className="h-24 bg-[#F5F5F5] rounded-md mb-2 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Palette className="h-6 w-6" />
                          </div>
                        </div>
                        <Label htmlFor="light" className="font-medium">Light Mode</Label>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <div className="h-24 bg-gray-800 rounded-md mb-2 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Palette className="h-6 w-6" />
                          </div>
                        </div>
                        <Label htmlFor="dark" className="font-medium">Dark Mode</Label>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <div className="h-24 bg-gradient-to-r from-[#F5F5F5] to-gray-800 rounded-md mb-2 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Globe className="h-6 w-6" />
                          </div>
                        </div>
                        <Label htmlFor="system" className="font-medium">System Preference</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Color Scheme</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                      <div className="h-10 bg-[#008080] rounded-md mb-2" />
                      <p className="text-sm font-medium">Teal (Default)</p>
                    </div>
                    <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                      <div className="h-10 bg-blue-600 rounded-md mb-2" />
                      <p className="text-sm font-medium">Blue</p>
                    </div>
                    <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                      <div className="h-10 bg-purple-600 rounded-md mb-2" />
                      <p className="text-sm font-medium">Purple</p>
                    </div>
                    <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                      <div className="h-10 bg-green-600 rounded-md mb-2" />
                      <p className="text-sm font-medium">Green</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Interface Density</h3>
                  <RadioGroup defaultValue="comfortable" className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comfortable" id="comfortable" />
                      <Label htmlFor="comfortable">Comfortable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compact" id="compact" />
                      <Label htmlFor="compact">Compact</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations">Enable animations</Label>
                      <Switch id="animations" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sidebar-collapsed">Start with sidebar collapsed</Label>
                      <Switch id="sidebar-collapsed" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-5 flex justify-between">
                <Button variant="outline">Reset to Default</Button>
                <Button className="flex gap-1">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication methods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    
                    <Button className="flex gap-1">
                      <Lock className="h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <Switch id="2fa" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline" disabled className="flex gap-1">
                    <Shield className="h-4 w-4" />
                    Set Up Two-Factor Authentication
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Session Management</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          San Francisco, USA • Chrome on macOS • Started 2 hours ago
                        </p>
                      </div>
                      <Badge>Current</Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Active Session</p>
                        <p className="text-sm text-muted-foreground">
                          San Francisco, USA • Safari on iOS • Started 1 day ago
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Logout</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Active Session</p>
                        <p className="text-sm text-muted-foreground">
                          New York, USA • Firefox on Windows • Started 3 days ago
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Logout</Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="flex gap-1">
                    <HardDrive className="h-4 w-4" />
                    Logout from All Other Sessions
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Login History</h3>
                  <p className="text-sm text-muted-foreground">
                    Recent login activity on your account.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">San Francisco, USA • Chrome on macOS</p>
                      <p className="text-sm text-muted-foreground">Today at 10:23 AM</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="font-medium">San Francisco, USA • Safari on iOS</p>
                      <p className="text-sm text-muted-foreground">Yesterday at 8:35 PM</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="font-medium">New York, USA • Firefox on Windows</p>
                      <p className="text-sm text-muted-foreground">3 days ago at 2:15 PM</p>
                    </div>
                  </div>
                  
                  <Button variant="outline">View Full Login History</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;