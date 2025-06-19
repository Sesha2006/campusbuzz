import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Check, X, User, Clock, Mail, Building, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function StudentVerification() {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const { data: pendingVerifications, isLoading } = useQuery({
    queryKey: ['/api/verifications/pending'],
  });

  const verificationMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number, status: string, notes: string }) => {
      return await apiRequest('PUT', `/api/verifications/${id}`, { status, notes });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/verifications/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: `Student verification ${data.status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
      setSelectedRequest(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update verification status",
        variant: "destructive",
      });
    }
  });

  const handleVerification = (id: number, status: 'approved' | 'rejected') => {
    verificationMutation.mutate({ id, status, notes });
  };

  const verifications = pendingVerifications?.data || [];

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
                <h1 className="text-2xl font-semibold text-gray-900">Student Verification</h1>
                <p className="mt-1 text-sm text-gray-500">Review and approve student verification requests</p>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {verifications.length} Pending
              </Badge>
            </div>
          </div>

          {verifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">No pending student verifications at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {verifications.map((verification: any) => (
                <Card key={verification.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gray-100">
                            <User className="w-6 h-6 text-gray-600" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{verification.fullName}</h3>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(verification.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} ago
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              {verification.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="w-4 h-4 mr-2" />
                              {verification.college}
                            </div>
                          </div>

                          {/* Email Domain Validation */}
                          <div className="mt-3">
                            {verification.email.includes('.edu') || 
                             verification.email.includes('@iitm.ac.in') || 
                             verification.email.includes('@iitd.ac.in') || 
                             verification.email.includes('@mit.edu') ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Valid Educational Domain
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Domain Verification Needed
                              </Badge>
                            )}
                          </div>

                          {selectedRequest === verification.id && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Review Notes (Optional)
                              </label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this verification..."
                                className="mb-3"
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {selectedRequest === verification.id ? (
                          <>
                            <Button
                              onClick={() => handleVerification(verification.id, 'approved')}
                              disabled={verificationMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirm Approve
                            </Button>
                            <Button
                              onClick={() => handleVerification(verification.id, 'rejected')}
                              disabled={verificationMutation.isPending}
                              variant="destructive"
                              size="sm"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Confirm Reject
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRequest(null);
                                setNotes("");
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
                              onClick={() => setSelectedRequest(verification.id)}
                              className="bg-green-100 text-green-800 hover:bg-green-200"
                              size="sm"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => setSelectedRequest(verification.id)}
                              className="bg-red-100 text-red-800 hover:bg-red-200"
                              size="sm"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
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
