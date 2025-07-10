import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter,
  Upload,
  FolderOpen,
  File as FileIcon,
  List,
  Grid,
  Clock,
  Calendar,
  Users,
  Star,
  Download,
  MoreHorizontal,
  Image as ImageIcon,
  FileText,
  FileArchive
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface FileItem {
  id: number;
  name: string;
  type: "folder" | "image" | "document" | "archive";
  size?: string;
  modified: string;
  modifiedBy: {
    name: string;
    avatar?: string;
  };
  projectId?: number;
  projectName?: string;
  starred: boolean;
}

const files: FileItem[] = [
  {
    id: 1,
    name: "Project Specifications",
    type: "folder",
    modified: "Today at 10:23 AM",
    modifiedBy: {
      name: "Alex Turner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop"
    },
    projectId: 1,
    projectName: "Harbor View Residences",
    starred: true
  },
  {
    id: 2,
    name: "Elevation Drawings",
    type: "folder",
    modified: "Today at 9:15 AM",
    modifiedBy: {
      name: "Maya Patel",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop"
    },
    projectId: 1,
    projectName: "Harbor View Residences",
    starred: false
  },
  {
    id: 3,
    name: "Site Photos",
    type: "folder",
    modified: "Yesterday at 4:45 PM",
    modifiedBy: {
      name: "Sam Chen",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop"
    },
    projectId: 1,
    projectName: "Harbor View Residences",
    starred: false
  },
  {
    id: 4,
    name: "HVR_Front_Elevation_Final.jpg",
    type: "image",
    size: "3.2 MB",
    modified: "Today at 11:30 AM",
    modifiedBy: {
      name: "Maya Patel",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop"
    },
    projectId: 1,
    projectName: "Harbor View Residences",
    starred: true
  },
  {
    id: 5,
    name: "Project_Timeline_v2.pdf",
    type: "document",
    size: "1.7 MB",
    modified: "3 days ago",
    modifiedBy: {
      name: "Alex Turner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop"
    },
    projectId: 1,
    projectName: "Harbor View Residences",
    starred: false
  },
  {
    id: 6,
    name: "Material_Samples.zip",
    type: "archive",
    size: "24.5 MB",
    modified: "1 week ago",
    modifiedBy: {
      name: "Sam Chen",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop"
    },
    projectId: 1,
    projectName: "Harbor View Residences",
    starred: false
  },
  {
    id: 7,
    name: "Client_Feedback_Notes.pdf",
    type: "document",
    size: "428 KB",
    modified: "2 days ago",
    modifiedBy: {
      name: "Robert Johnson",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=32&h=32&fit=crop"
    },
    projectId: 1,
    projectName: "Harbor View Residences",
    starred: false
  },
];

const getFileIcon = (type: FileItem["type"]) => {
  switch (type) {
    case "folder":
      return <FolderOpen className="h-10 w-10 text-blue-500" />;
    case "image":
      return <ImageIcon className="h-10 w-10 text-purple-500" />;
    case "document":
      return <FileText className="h-10 w-10 text-primary" />;
    case "archive":
      return <FileArchive className="h-10 w-10 text-amber-500" />;
    default:
      return <FileIcon className="h-10 w-10 text-gray-500" />;
  }
};

const FilesPage: FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  
  const toggleFileSelection = (id: number) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter(fileId => fileId !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary mb-4 md:mb-0">Files</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="pl-8 w-full md:w-[250px]"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Files</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Harbor View Residences</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-transparent",
                  viewMode === "list" ? "bg-accent text-accent-foreground" : ""
                )}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-transparent",
                  viewMode === "grid" ? "bg-accent text-accent-foreground" : ""
                )}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="m-0">
            {viewMode === "list" ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedFiles.length === files.length && files.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Modified</TableHead>
                        <TableHead>Modified By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedFiles.includes(file.id)}
                              onCheckedChange={() => toggleFileSelection(file.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.type)}
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {file.type === "folder" ? "Folder" : file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                                </p>
                              </div>
                              {file.starred && (
                                <Star className="h-4 w-4 text-amber-500 ml-1" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {file.projectName && (
                              <Badge variant="outline" className="text-xs">
                                {file.projectName}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{file.size || "--"}</TableCell>
                          <TableCell>{file.modified}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={file.modifiedBy.avatar} />
                                <AvatarFallback>{file.modifiedBy.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{file.modifiedBy.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Star className="h-4 w-4 mr-2" />
                                  {file.starred ? "Remove Star" : "Star"}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Users className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="overflow-hidden hover:shadow-md transition-all">
                    <div className="relative">
                      <div className="absolute top-2 left-2">
                        <Checkbox 
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          className="h-5 w-5 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      {file.starred && (
                        <div className="absolute top-2 right-2">
                          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        </div>
                      )}
                      <div className="flex items-center justify-center h-40 bg-muted/50">
                        {getFileIcon(file.type)}
                      </div>
                    </div>
                    <CardHeader className="p-3">
                      <CardTitle className="text-base truncate">{file.name}</CardTitle>
                    </CardHeader>
                    <CardFooter className="p-3 pt-0 text-xs text-muted-foreground">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <span>{file.size || "—"}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {file.modified}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={file.modifiedBy.avatar} />
                              <AvatarFallback>{file.modifiedBy.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{file.modifiedBy.name}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                {file.starred ? "Remove Star" : "Star"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Recent Files</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Files you've recently accessed or modified will appear here for quick access.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="starred">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Starred Files</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Star important files and folders to easily find them later. Starred items will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shared">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Shared with Me</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Files and folders shared with you by your team members will appear here.
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

export default FilesPage;