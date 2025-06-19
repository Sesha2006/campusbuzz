import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Check, X, Eye, AlertTriangle, Flag, MessageCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function PostModeration() {
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [reason, setReason] = useState("");

  const { data: flaggedPosts, isLoading } = useQuery({
    queryKey: ['/api/posts/flagged'],
  });

  const moderationMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: number, action: string, reason: string }) => {
      return await apiRequest('PUT', `/api/posts/${id}/moderate`, { action, reason });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/flagged'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: `Post ${data.action}d successfully`,
      });
      setSelectedPost(null);
      setReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to moderate post",
        variant: "destructive",
      });
    }
  });

  const handleModeration = (id: number, action: 'approve' | 'reject') => {
    moderationMutation.mutate({ id, action, reason });
  };

  const posts = flaggedPosts?.data || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-amber-200 bg-amber-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
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
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
                <h1 className="text-2xl font-semibold text-gray-900">Post Moderation</h1>
                <p className="mt-1 text-sm text-gray-500">Review and moderate flagged forum posts</p>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {posts.length} Flagged
              </Badge>
            </div>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged posts!</h3>
                <p className="text-gray-500">All posts are currently within community guidelines.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post: any) => (
                <Card key={post.id} className={`border ${getPriorityBorder(post.priority)}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(post.priority)}>
                          {post.priority === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {post.priority === 'medium' && <Flag className="w-3 h-3 mr-1" />}
                          {post.priority === 'low' && <Eye className="w-3 h-3 mr-1" />}
                          {post.priority?.charAt(0).toUpperCase() + post.priority?.slice(1)} Priority
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(post.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} ago
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-gray-500 space-x-4">
                        <span>@user{post.userId}</span>
                        <span>{post.flaggedBy?.length || 0} reports</span>
                        {post.flagReason && (
                          <span className="text-red-600">Reason: {post.flagReason}</span>
                        )}
                      </div>
                    </div>

                    {selectedPost === post.id && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moderation Reason (Optional)
                        </label>
                        <Textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Provide a reason for this moderation action..."
                          className="mb-3"
                          rows={3}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2">
                      {selectedPost === post.id ? (
                        <>
                          <Button
                            onClick={() => handleModeration(post.id, 'approve')}
                            disabled={moderationMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirm Approve
                          </Button>
                          <Button
                            onClick={() => handleModeration(post.id, 'reject')}
                            disabled={moderationMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Confirm Remove
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedPost(null);
                              setReason("");
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => setSelectedPost(post.id)}
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => setSelectedPost(post.id)}
                            className="bg-red-100 text-red-800 hover:bg-red-200"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
