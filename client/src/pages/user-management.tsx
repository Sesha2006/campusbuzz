import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Mail,
  Building,
  Clock,
  Shield,
  Ban,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function UserManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const userActionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number, action: string }) => {
      return await apiRequest('PUT', `/api/users/${userId}/action`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User action completed successfully",
      });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to perform user action",
        variant: "destructive",
      });
    }
  });

  // Mock users data for demonstration
  const mockUsers = [
    {
      id: 1,
      email: "sarah.j@stanford.edu",
      username: "sarah_johnson",
      fullName: "Sarah Johnson",
      college: "Stanford University",
      verified: true,
      verificationStatus: "approved",
      idUploaded: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      postsCount: 15,
      status: "active"
    },
    {
      id: 2,
      email: "mike.c@mit.edu", 
      username: "mike_chen",
      fullName: "Michael Chen",
      college: "MIT",
      verified: true,
      verificationStatus: "approved",
      idUploaded: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
      postsCount: 8,
      status: "active"
    },
    {
      id: 3,
      email: "priya@iitm.ac.in",
      username: "priya_sharma",
      fullName: "Priya Sharma", 
      college: "IIT Madras",
      verified: false,
      verificationStatus: "pending",
      idUploaded: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
      postsCount: 3,
      status: "pending"
    },
    {
      id: 4,
      email: "alex.k@berkeley.edu",
      username: "alex_kim",
      fullName: "Alex Kim",
      college: "UC Berkeley",
      verified: false,
      verificationStatus: "rejected",
      idUploaded: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
      postsCount: 1,
      status: "suspended"
    }
  ];

  const users = usersData?.data || mockUsers;

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUserAction = (userId: number, action: string) => {
    userActionMutation.mutate({ userId, action });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVerificationBadge = (verified: boolean, status: string) => {
    if (verified) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    } else if (status === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage student accounts, verification status, and user permissions</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {users.length} Total Users
              </Badge>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users by name, email, or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Student Accounts ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gray-100">
                          {user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                          {getStatusBadge(user.status)}
                          {getVerificationBadge(user.verified, user.verificationStatus)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </span>
                          <span className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {user.college}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Last active {user.lastActive.toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>@{user.username}</span>
                          <span>{user.postsCount} posts</span>
                          <span>Joined {user.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {user.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, "suspend")}
                          disabled={userActionMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : user.status === "suspended" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, "activate")}
                          disabled={userActionMutation.isPending}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, "approve")}
                          disabled={userActionMutation.isPending}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Details Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      User Details
                    </CardTitle>
                    <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gray-100 text-lg">
                        {selectedUser.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedUser.fullName}</h3>
                      <p className="text-gray-600">@{selectedUser.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(selectedUser.status)}
                        {getVerificationBadge(selectedUser.verified, selectedUser.verificationStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">College</label>
                      <p className="text-sm text-gray-900">{selectedUser.college}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Joined</label>
                      <p className="text-sm text-gray-900">{selectedUser.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Active</label>
                      <p className="text-sm text-gray-900">{selectedUser.lastActive.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Posts Count</label>
                      <p className="text-sm text-gray-900">{selectedUser.postsCount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID Uploaded</label>
                      <p className="text-sm text-gray-900">{selectedUser.idUploaded ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setSelectedUser(null)}>
                      Close
                    </Button>
                    <Button
                      onClick={() => handleUserAction(selectedUser.id, "verify")}
                      disabled={userActionMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Force Verify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}