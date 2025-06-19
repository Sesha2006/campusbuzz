import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VerificationQueue from "@/components/verification-queue";
import ModerationQueue from "@/components/moderation-queue";
import { Users, Clock, MessageCircle, Server, University, Check, Eye, Code, Settings, UserCheck, FileText, IdCard } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: pendingVerifications } = useQuery({
    queryKey: ['/api/verifications/pending'],
  });

  const { data: flaggedPosts } = useQuery({
    queryKey: ['/api/posts/flagged'],
  });

  const statsData = stats?.data || {
    totalUsers: 2847,
    pendingVerifications: 43,
    activeChats: 186,
    apiRequests: 12400,
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor and manage CampusBuzz platform activities</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Users */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{statsData.totalUsers.toLocaleString()}</dd>
                  </div>
                </div>
              </CardContent>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-600">
                  <span className="text-green-600 font-medium">+12%</span> from last month
                </div>
              </div>
            </Card>

            {/* Pending Verifications */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
                    <dd className="text-lg font-medium text-gray-900">{statsData.pendingVerifications}</dd>
                  </div>
                </div>
              </CardContent>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-600">
                  <span className="text-red-600 font-medium">+8</span> in last 24h
                </div>
              </div>
            </Card>

            {/* Active Chats */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Chats</dt>
                    <dd className="text-lg font-medium text-gray-900">{statsData.activeChats}</dd>
                  </div>
                </div>
              </CardContent>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-600">
                  <span className="text-green-600 font-medium">+23%</span> from yesterday
                </div>
              </div>
            </Card>

            {/* API Requests */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Server className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">API Requests</dt>
                    <dd className="text-lg font-medium text-gray-900">{(statsData.apiRequests / 1000).toFixed(1)}k</dd>
                  </div>
                </div>
              </CardContent>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-600">
                  <span className="text-blue-600 font-medium">Normal</span> load
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activities and Pending Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Student Verification Queue */}
            <VerificationQueue 
              verifications={pendingVerifications?.data || []} 
              title="Student Verification Queue"
              pendingCount={pendingVerifications?.data?.length || 23}
            />

            {/* Post Moderation Queue */}
            <ModerationQueue 
              posts={flaggedPosts?.data || []} 
              title="Post Moderation Queue"
              flaggedCount={flaggedPosts?.data?.length || 12}
            />
          </div>

          {/* System Status and Recent Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-8">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Firebase Firestore</span>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-100">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Realtime Database</span>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-100">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Email Service</span>
                  </div>
                  <Badge variant="secondary" className="text-amber-600 bg-amber-100">Degraded</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">API Gateway</span>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-100">Operational</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent API Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Recent API Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="text-sm">
                      <span className="text-gray-900 font-medium">POST</span>
                      <span className="text-gray-500 ml-2">/api/verify-student</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>200</span>
                    <span>45ms</span>
                    <span>2m ago</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="text-sm">
                      <span className="text-gray-900 font-medium">GET</span>
                      <span className="text-gray-500 ml-2">/api/posts/flagged</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>200</span>
                    <span>23ms</span>
                    <span>3m ago</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="text-sm">
                      <span className="text-gray-900 font-medium">POST</span>
                      <span className="text-gray-500 ml-2">/api/moderate-post</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>400</span>
                    <span>12ms</span>
                    <span>5m ago</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="text-sm">
                      <span className="text-gray-900 font-medium">PUT</span>
                      <span className="text-gray-500 ml-2">/api/id-verification/approve</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>200</span>
                    <span>67ms</span>
                    <span>7m ago</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button variant="ghost" className="text-brand-600 hover:text-brand-500 text-sm font-medium">
                    View detailed logs <Code className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
