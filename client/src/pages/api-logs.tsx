import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Code, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react";

export default function APILogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/logs'],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Mock API logs data for demonstration
  const mockLogs = [
    {
      id: 1,
      method: "POST",
      endpoint: "/api/verify-student",
      status: 200,
      responseTime: 45,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      ip: "192.168.1.100",
      userId: "admin",
      requestSize: 1024,
      responseSize: 512
    },
    {
      id: 2,
      method: "GET",
      endpoint: "/api/posts/flagged",
      status: 200,
      responseTime: 23,
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      ip: "192.168.1.101",
      userId: "admin",
      requestSize: 0,
      responseSize: 2048
    },
    {
      id: 3,
      method: "POST",
      endpoint: "/api/moderate-post",
      status: 400,
      responseTime: 12,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      ip: "192.168.1.100",
      userId: "admin",
      requestSize: 256,
      responseSize: 128,
      error: "Invalid post ID"
    },
    {
      id: 4,
      method: "PUT",
      endpoint: "/api/verifications/3",
      status: 200,
      responseTime: 67,
      timestamp: new Date(Date.now() - 7 * 60 * 1000),
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      ip: "192.168.1.102",
      userId: "admin",
      requestSize: 512,
      responseSize: 1024
    },
    {
      id: 5,
      method: "GET",
      endpoint: "/api/stats",
      status: 200,
      responseTime: 15,
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      ip: "192.168.1.100",
      userId: "admin",
      requestSize: 0,
      responseSize: 256
    },
    {
      id: 6,
      method: "POST",
      endpoint: "/api/upload-id",
      status: 500,
      responseTime: 3000,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      ip: "192.168.1.103",
      userId: "admin",
      requestSize: 5242880,
      responseSize: 128,
      error: "Firebase upload failed"
    }
  ];

  const logs = logsData?.data || mockLogs;

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = 
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      (log.error && log.error.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "success" && log.status >= 200 && log.status < 300) ||
      (statusFilter === "error" && log.status >= 400) ||
      (statusFilter === "slow" && log.responseTime > 1000);
    
    const matchesMethod = methodFilter === "all" || log.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge className="bg-amber-100 text-amber-800"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    } else if (status >= 500) {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-blue-100 text-blue-800",
      POST: "bg-green-100 text-green-800",
      PUT: "bg-amber-100 text-amber-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800"
    };
    return <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{method}</Badge>;
  };

  const getResponseTimeBadge = (time: number) => {
    if (time < 100) {
      return <Badge className="bg-green-100 text-green-800"><Zap className="w-3 h-3 mr-1" />{time}ms</Badge>;
    } else if (time < 500) {
      return <Badge className="bg-amber-100 text-amber-800">{time}ms</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{time}ms</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Method,Endpoint,Status,Response Time (ms),IP,User,Request Size,Response Size,Error',
      ...filteredLogs.map((log: any) => 
        `${log.timestamp.toISOString()},${log.method},${log.endpoint},${log.status},${log.responseTime},${log.ip},${log.userId},${log.requestSize},${log.responseSize},"${log.error || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
                <h1 className="text-2xl font-semibold text-gray-900">API Logs</h1>
                <p className="mt-1 text-sm text-gray-500">Monitor API requests, performance metrics, and system health</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Monitoring
                </Badge>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportLogs}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
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
                      placeholder="Search endpoints, methods, IPs, or errors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success (2xx)</SelectItem>
                    <SelectItem value="error">Errors (4xx/5xx)</SelectItem>
                    <SelectItem value="slow">Slow Requests (&gt;1s)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Request Logs ({filteredLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        {getMethodBadge(log.method)}
                        {getStatusBadge(log.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-mono text-sm text-gray-900">{log.endpoint}</span>
                          {getResponseTimeBadge(log.responseTime)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <span>IP: {log.ip}</span>
                          <span>User: {log.userId}</span>
                          <span>↑ {formatBytes(log.requestSize)}</span>
                          <span>↓ {formatBytes(log.responseSize)}</span>
                          {log.error && (
                            <span className="text-red-600 font-medium">Error: {log.error}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Math.round((logs.filter((l: any) => l.status < 400).length / logs.length) * 100)}%
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">Avg Response</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Math.round(logs.reduce((acc: number, log: any) => acc + log.responseTime, 0) / logs.length)}ms
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">Error Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Math.round((logs.filter((l: any) => l.status >= 400).length / logs.length) * 100)}%
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">Total Requests</dt>
                    <dd className="text-lg font-medium text-gray-900">{logs.length}</dd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}