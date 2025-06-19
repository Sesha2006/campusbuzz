import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Check, X, User, ArrowRight } from "lucide-react";

interface VerificationQueueProps {
  verifications: any[];
  title: string;
  pendingCount: number;
}

export default function VerificationQueue({ verifications, title, pendingCount }: VerificationQueueProps) {
  const { toast } = useToast();

  const verificationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return await apiRequest('PUT', `/api/verifications/${id}`, { status, notes: '' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/verifications/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Verification updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update verification",
        variant: "destructive",
      });
    }
  });

  const handleVerification = (id: number, status: 'approved' | 'rejected') => {
    verificationMutation.mutate({ id, status });
  };

  return (
    <Card className="shadow rounded-lg">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {pendingCount} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {verifications.slice(0, 3).map((verification: any) => (
            <div key={verification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-300">
                      <User className="w-5 h-5 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{verification.fullName}</p>
                    <p className="text-sm text-gray-500">{verification.email}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(verification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} ago
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleVerification(verification.id, 'approved')}
                  disabled={verificationMutation.isPending}
                  className="bg-green-100 text-green-800 hover:bg-green-200 text-xs font-medium rounded-full"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleVerification(verification.id, 'rejected')}
                  disabled={verificationMutation.isPending}
                  className="bg-red-100 text-red-800 hover:bg-red-200 text-xs font-medium rounded-full"
                >
                  <X className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {verifications.length > 3 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="ghost" className="text-brand-600 hover:text-brand-500 text-sm font-medium">
              View all pending verifications <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
