import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Edit, 
  Send,
  Paperclip,
  PlusCircle,
  MessageCircle,
  Users,
  Clock,
  Plus
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface Conversation {
  id: number;
  title: string;
  participants: string[];
  avatars: string[];
  lastMessage: string;
  time: string;
  unread: number;
  projectId?: number;
  projectName?: string;
  pinned: boolean;
}

interface Message {
  id: number;
  sender: string;
  senderAvatar: string;
  content: string;
  time: string;
  isCurrentUser: boolean;
  attachments?: { name: string; size: string }[];
}

const conversations: Conversation[] = [
  {
    id: 1,
    title: "Harbor View Residences Team",
    participants: ["Alex Turner", "Maya Patel", "Sam Chen"],
    avatars: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop"
    ],
    lastMessage: "I've updated the elevation drawings based on your feedback.",
    time: "10:23 AM",
    unread: 3,
    projectId: 1,
    projectName: "Harbor View Residences",
    pinned: true
  },
  {
    id: 2,
    title: "Metropolitan Office Complex Discussion",
    participants: ["Jamie Rodriguez", "Sarah Kim"],
    avatars: [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=32&h=32&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop"
    ],
    lastMessage: "The client has some concerns about the timeline. Can we discuss?",
    time: "Yesterday",
    unread: 0,
    projectId: 2,
    projectName: "Metropolitan Office Complex",
    pinned: false
  },
  {
    id: 3,
    title: "Sunset Valley Community Center",
    participants: ["Alex Turner", "Robert Johnson", "Emma Davis"],
    avatars: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=32&h=32&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=32&h=32&fit=crop"
    ],
    lastMessage: "I think we need to reconsider the materials for the facade.",
    time: "Tuesday",
    unread: 0,
    projectId: 3,
    projectName: "Sunset Valley Community Center",
    pinned: false
  },
  {
    id: 4,
    title: "Coastal Development Corp",
    participants: ["Robert Johnson", "You"],
    avatars: [
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=32&h=32&fit=crop"
    ],
    lastMessage: "Thank you for the progress update on the Harbor View project.",
    time: "Monday",
    unread: 0,
    pinned: true
  },
  {
    id: 5,
    title: "Design Team Weekly Sync",
    participants: ["Sam Chen", "Emma Davis", "Maya Patel", "Sarah Kim", "You"],
    avatars: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=32&h=32&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop"
    ],
    lastMessage: "Let's prepare for the presentation next week.",
    time: "Last week",
    unread: 0,
    pinned: false
  }
];

const messages: Message[] = [
  {
    id: 1,
    sender: "Maya Patel",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop",
    content: "Hi team! I've completed the initial draft of the Harbor View Residences elevations. Please review when you have a chance.",
    time: "Monday 2:30 PM",
    isCurrentUser: false
  },
  {
    id: 2,
    sender: "Sam Chen",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop",
    content: "These look fantastic, Maya! I particularly like the south-facing facade treatment.",
    time: "Monday 3:15 PM",
    isCurrentUser: false
  },
  {
    id: 3,
    sender: "You",
    senderAvatar: "",
    content: "Great work Maya. I have a few suggestions for the roofline that I think would complement the coastal aesthetic.",
    time: "Monday 4:05 PM",
    isCurrentUser: true
  },
  {
    id: 4,
    sender: "Maya Patel",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop",
    content: "Thanks for the feedback! I've attached the updated drawings with the roofline modifications you suggested. Let me know what you think.",
    time: "Tuesday 9:45 AM",
    isCurrentUser: false,
    attachments: [
      { name: "HVR_Updated_Elevations.pdf", size: "2.4 MB" },
      { name: "Roofline_Detail_V2.dwg", size: "1.8 MB" }
    ]
  },
  {
    id: 5,
    sender: "Sam Chen",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop",
    content: "These revisions look great. I think the client will be very pleased with the direction we're going.",
    time: "Tuesday 10:30 AM",
    isCurrentUser: false
  },
  {
    id: 6,
    sender: "Maya Patel",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop",
    content: "I've updated the elevation drawings based on your feedback. The modified roofline really enhances the coastal aesthetic and provides better protection from the elements. I also adjusted the window placement on the east facade for better morning light.",
    time: "Today 10:23 AM",
    isCurrentUser: false
  },
];

const MessagesPage: FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const isMobile = useIsMobile();
  const [showConversationList, setShowConversationList] = useState(!isMobile);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Conversation List */}
        {(showConversationList || !isMobile) && (
          <div className={cn(
            "h-full border-r flex flex-col",
            isMobile ? "w-full" : "w-80"
          )}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">Messages</h2>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  className="pl-8 w-full"
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="px-3">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="projects" className="flex-1">Projects</TabsTrigger>
                <TabsTrigger value="direct" className="flex-1">Direct</TabsTrigger>
              </TabsList>
            </Tabs>

            <ScrollArea className="flex-1 p-3">
              <div className="space-y-1">
                {conversations
                  .filter(c => c.pinned)
                  .map(conversation => (
                    <div 
                      key={conversation.id}
                      className={cn(
                        "flex p-3 rounded-md cursor-pointer",
                        selectedConversation?.id === conversation.id ? "bg-accent" : "hover:bg-muted/50"
                      )}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {conversation.avatars.length === 1 ? (
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={conversation.avatars[0]} />
                            <AvatarFallback>{conversation.title[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="relative h-9 w-9">
                            <Avatar className="h-6 w-6 absolute top-0 left-0">
                              <AvatarImage src={conversation.avatars[0]} />
                              <AvatarFallback>{conversation.participants[0][0]}</AvatarFallback>
                            </Avatar>
                            <Avatar className="h-6 w-6 absolute bottom-0 right-0">
                              <AvatarImage src={conversation.avatars[1]} />
                              <AvatarFallback>{conversation.participants[1][0]}</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm truncate">{conversation.title}</p>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{conversation.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                        {conversation.projectName && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-[10px] py-0 h-4">
                              {conversation.projectName}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {conversation.unread > 0 && (
                        <div className="ml-2 flex-shrink-0">
                          <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                
                <Separator className="my-2" />
                
                {conversations
                  .filter(c => !c.pinned)
                  .map(conversation => (
                    <div 
                      key={conversation.id}
                      className={cn(
                        "flex p-3 rounded-md cursor-pointer",
                        selectedConversation?.id === conversation.id ? "bg-accent" : "hover:bg-muted/50"
                      )}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {conversation.avatars.length === 1 ? (
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={conversation.avatars[0]} />
                            <AvatarFallback>{conversation.title[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="relative h-9 w-9">
                            <Avatar className="h-6 w-6 absolute top-0 left-0">
                              <AvatarImage src={conversation.avatars[0]} />
                              <AvatarFallback>{conversation.participants[0][0]}</AvatarFallback>
                            </Avatar>
                            <Avatar className="h-6 w-6 absolute bottom-0 right-0">
                              <AvatarImage src={conversation.avatars[1]} />
                              <AvatarFallback>{conversation.participants[1][0]}</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm truncate">{conversation.title}</p>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{conversation.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                        {conversation.projectName && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-[10px] py-0 h-4">
                              {conversation.projectName}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {conversation.unread > 0 && (
                        <div className="ml-2 flex-shrink-0">
                          <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </ScrollArea>
            
            <div className="p-3 border-t">
              <Button className="w-full" variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        )}

        {/* Conversation Detail */}
        {(!showConversationList || !isMobile) && selectedConversation && (
          <div className="flex-1 flex flex-col h-full">
            {/* Conversation Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center">
                {isMobile && (
                  <Button variant="ghost" size="icon" className="mr-2" onClick={handleBackToList}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </Button>
                )}
                <div className="flex items-center">
                  {selectedConversation.avatars.length === 1 ? (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={selectedConversation.avatars[0]} />
                      <AvatarFallback>{selectedConversation.title[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="relative h-8 w-8 mr-2">
                      <Avatar className="h-5 w-5 absolute top-0 left-0">
                        <AvatarImage src={selectedConversation.avatars[0]} />
                        <AvatarFallback>{selectedConversation.participants[0][0]}</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-5 w-5 absolute bottom-0 right-0">
                        <AvatarImage src={selectedConversation.avatars[1]} />
                        <AvatarFallback>{selectedConversation.participants[1][0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-sm">{selectedConversation.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.participants.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex">
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex",
                      message.isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "flex gap-3 max-w-[80%]",
                      message.isCurrentUser ? "flex-row-reverse" : ""
                    )}>
                      {!message.isCurrentUser && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>{message.sender[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {!message.isCurrentUser && (
                            <span className="text-sm font-medium">{message.sender}</span>
                          )}
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <div className={cn(
                          "rounded-lg p-3",
                          message.isCurrentUser 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}>
                          <p className="text-sm">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, idx) => (
                                <div 
                                  key={idx} 
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded text-xs",
                                    message.isCurrentUser 
                                      ? "bg-primary-foreground/10 text-primary-foreground" 
                                      : "bg-background"
                                  )}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                  </svg>
                                  <span className="flex-1 truncate">{attachment.name}</span>
                                  <span>{attachment.size}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-3 border-t">
              <div className="relative">
                <Textarea 
                  placeholder="Type your message..." 
                  className="min-h-[80px] resize-none pr-24"
                />
                <div className="absolute right-3 bottom-3 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="h-8">
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MessagesPage;