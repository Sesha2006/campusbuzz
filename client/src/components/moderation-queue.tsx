import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Check, X, Eye, ArrowRight, AlertTriangle, Flag } from "lucide-react";

interface ModerationQueueProps {
  posts: any[];
  title: string;
  flaggedCount: number;
}

export default function ModerationQueue({ posts, title, flaggedCount }: ModerationQueueProps) {
  const { toast } = useToast();

  const moderationMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number, action: string }) => {
      return await apiRequest('PUT', `/api/posts/${id}/moderate`, { action, reason: '' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/flagged'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Post moderated successfully",
      });
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
    moderationMutation.mutate({ id, action });
  };

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

  return (
    <Card className="shadow rounded-lg">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {flaggedCount} Flagged
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {posts.slice(0, 2).map((post: any) => (
            <div key={post.id} className={`p-4 border rounded-lg ${getPriorityBorder(post.priority)}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <Badge className={`${getPriorityColor(post.priority)} text-xs font-medium px-2 py-1 rounded`}>
                    {post.priority === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {post.priority === 'medium' && <Flag className="w-3 h-3 mr-1" />}
                    {post.priority?.charAt(0).toUpperCase() + post.priority?.slice(1)} Priority
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} ago
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {post.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <span>@user{post.userId}</span>
                  <span className="mx-2">•</span>
                  <span>{post.flaggedBy?.length || 0} reports</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleModeration(post.id, 'approve')}
                    disabled={moderationMutation.isPending}
                    className="bg-green-100 text-green-800 hover:bg-green-200 text-xs font-medium rounded-full"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleModeration(post.id, 'reject')}
                    disabled={moderationMutation.isPending}
                    className="bg-red-100 text-red-800 hover:bg-red-200 text-xs font-medium rounded-full"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {posts.length > 2 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="ghost" className="text-brand-600 hover:text-brand-500 text-sm font-medium">
              View all flagged posts <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
