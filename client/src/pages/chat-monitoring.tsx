import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Eye, 
  AlertTriangle, 
  Search, 
  Filter,
  Users,
  Clock,
  Flag,
  Shield
} from "lucide-react";

export default function ChatMonitoring() {
  const { toast } = useToast();
  const [selectedChatId, setSelectedChatId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: chatData, isLoading } = useQuery({
    queryKey: ['/api/chats', selectedChatId],
    enabled: !!selectedChatId,
  });

  const monitorMutation = useMutation({
    mutationFn: async (chatId: string) => {
      return await apiRequest('GET', `/api/chats/${chatId}`);
    },
    onSuccess: (data) => {
      toast({
        title: "Chat Monitored",
        description: "Chat data retrieved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to monitor chat",
        variant: "destructive",
      });
    }
  });

  const handleMonitorChat = () => {
    if (!selectedChatId.trim()) {
      toast({
        title: "Missing Chat ID",
        description: "Please enter a chat ID to monitor",
        variant: "destructive",
      });
      return;
    }
    monitorMutation.mutate(selectedChatId);
  };

  // Mock active chats data
  const activeChats = [
    {
      id: "chat_001",
      participants: ["sarah.j@stanford.edu", "mike.c@mit.edu"],
      lastActivity: new Date(Date.now() - 5 * 60 * 1000),
      messageCount: 45,
      flagged: false,
      priority: "normal"
    },
    {
      id: "chat_002", 
      participants: ["priya@iitm.ac.in", "alex.k@berkeley.edu"],
      lastActivity: new Date(Date.now() - 15 * 60 * 1000),
      messageCount: 23,
      flagged: true,
      priority: "high"
    },
    {
      id: "chat_003",
      participants: ["emma.w@ucla.edu", "david.l@harvard.edu", "lisa.m@stanford.edu"],
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      messageCount: 67,
      flagged: false,
      priority: "normal"
    }
  ];

  const filteredChats = activeChats.filter(chat =>
    chat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Chat Monitoring</h1>
                <p className="mt-1 text-sm text-gray-500">Monitor real-time chat conversations and detect inappropriate content</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {activeChats.length} Active Chats
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Active Chat Rooms
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search chats..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        chat.flagged 
                          ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                          : 'border-gray-200 hover:bg-gray-50'
                      } ${selectedChatId === chat.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedChatId(chat.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{chat.id}</span>
                            {chat.flagged && (
                              <Badge variant="destructive" className="text-xs">
                                <Flag className="w-3 h-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {chat.participants.length} participants
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600 flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {chat.participants.slice(0, 2).join(", ")}
                              {chat.participants.length > 2 && ` +${chat.participants.length - 2} more`}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center space-x-4">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {chat.lastActivity.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span>{chat.messageCount} messages</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChatId(chat.id);
                            handleMonitorChat();
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Chat Monitor Panel */}
            <div className="space-y-6">
              {/* Monitor Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Monitor Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chat ID
                    </label>
                    <Input
                      value={selectedChatId}
                      onChange={(e) => setSelectedChatId(e.target.value)}
                      placeholder="Enter chat ID to monitor"
                    />
                  </div>
                  
                  <Button
                    onClick={handleMonitorChat}
                    disabled={monitorMutation.isPending || !selectedChatId}
                    className="w-full"
                  >
                    {monitorMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Monitoring...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Start Monitoring
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Chat Details */}
              {chatData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Chat Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Participants</h4>
                      <div className="space-y-2">
                        {chatData.data?.participants?.map((participant: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {participant.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{participant}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Messages</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {chatData.data?.messages?.map((message: any, index: number) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="font-medium text-gray-700">{message.userId}</div>
                            <div className="text-gray-600">{message.text}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(message.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Safety Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-700">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Safety Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                      <div>
                        <div className="text-sm font-medium text-red-800">Inappropriate Content</div>
                        <div className="text-xs text-red-600">chat_002 - 2 min ago</div>
                      </div>
                      <Button size="sm" variant="outline" className="text-red-700 border-red-300">
                        Review
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded">
                      <div>
                        <div className="text-sm font-medium text-amber-800">Spam Detection</div>
                        <div className="text-xs text-amber-600">chat_005 - 15 min ago</div>
                      </div>
                      <Button size="sm" variant="outline" className="text-amber-700 border-amber-300">
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}