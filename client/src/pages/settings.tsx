import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon, 
  Save,
  Shield,
  Bell,
  Database,
  Mail,
  Lock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Globe,
  Key
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  
  // System Settings State
  const [autoModeration, setAutoModeration] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [allowUnverifiedUsers, setAllowUnverifiedUsers] = useState(false);
  
  // Firebase Settings State
  const [firebaseProjectId, setFirebaseProjectId] = useState("");
  const [firebaseDatabaseUrl, setFirebaseDatabaseUrl] = useState("");
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState("");
  
  // Security Settings State
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  
  // Notification Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("10");
  
  // Content Moderation Settings
  const [autoFlagKeywords, setAutoFlagKeywords] = useState("inappropriate, spam, cheating, harassment");
  const [moderationDelay, setModerationDelay] = useState("5");
  const [highPriorityDomains, setHighPriorityDomains] = useState(".edu, @stanford.edu, @mit.edu");

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return await apiRequest('PUT', '/api/settings', settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/test-firebase-connection');
    },
    onSuccess: () => {
      toast({
        title: "Connection Successful",
        description: "Firebase connection is working properly",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Firebase connection test failed",
        variant: "destructive",
      });
    }
  });

  const handleSaveSettings = () => {
    const settings = {
      system: {
        autoModeration,
        emailNotifications,
        realTimeMonitoring,
        allowUnverifiedUsers
      },
      firebase: {
        projectId: firebaseProjectId,
        databaseUrl: firebaseDatabaseUrl,
        storageBucket: firebaseStorageBucket
      },
      security: {
        sessionTimeout: parseInt(sessionTimeout),
        maxLoginAttempts: parseInt(maxLoginAttempts),
        requireTwoFactor
      },
      notifications: {
        emailAlerts,
        slackWebhook,
        alertThreshold: parseInt(alertThreshold)
      },
      moderation: {
        autoFlagKeywords: autoFlagKeywords.split(',').map(k => k.trim()),
        moderationDelay: parseInt(moderationDelay),
        highPriorityDomains: highPriorityDomains.split(',').map(d => d.trim())
      }
    };

    saveSettingsMutation.mutate(settings);
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
                <p className="mt-1 text-sm text-gray-500">Configure system behavior, security, and integrations</p>
              </div>
              <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
                {saveSettingsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto Moderation</Label>
                      <p className="text-xs text-gray-500">Automatically flag suspicious content</p>
                    </div>
                    <Switch
                      checked={autoModeration}
                      onCheckedChange={setAutoModeration}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-gray-500">Send admin email alerts</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Real-time Monitoring</Label>
                      <p className="text-xs text-gray-500">Enable live chat monitoring</p>
                    </div>
                    <Switch
                      checked={realTimeMonitoring}
                      onCheckedChange={setRealTimeMonitoring}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Allow Unverified Users</Label>
                      <p className="text-xs text-gray-500">Let unverified users post content</p>
                    </div>
                    <Switch
                      checked={allowUnverifiedUsers}
                      onCheckedChange={setAllowUnverifiedUsers}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Firebase Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Firebase Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projectId">Project ID</Label>
                    <Input
                      id="projectId"
                      value={firebaseProjectId}
                      onChange={(e) => setFirebaseProjectId(e.target.value)}
                      placeholder="campusbuzz-project"
                    />
                  </div>
                  <div>
                    <Label htmlFor="databaseUrl">Database URL</Label>
                    <Input
                      id="databaseUrl"
                      value={firebaseDatabaseUrl}
                      onChange={(e) => setFirebaseDatabaseUrl(e.target.value)}
                      placeholder="https://project-id-default-rtdb.firebaseio.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="storageBucket">Storage Bucket</Label>
                  <Input
                    id="storageBucket"
                    value={firebaseStorageBucket}
                    onChange={(e) => setFirebaseStorageBucket(e.target.value)}
                    placeholder="project-id.appspot.com"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleTestConnection}
                    disabled={testConnectionMutation.isPending}
                  >
                    {testConnectionMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      min="1"
                      max="168"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={maxLoginAttempts}
                      onChange={(e) => setMaxLoginAttempts(e.target.value)}
                      min="3"
                      max="10"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-6">
                    <div>
                      <Label className="text-sm font-medium">Two-Factor Auth</Label>
                      <p className="text-xs text-gray-500">Require 2FA for admins</p>
                    </div>
                    <Switch
                      checked={requireTwoFactor}
                      onCheckedChange={setRequireTwoFactor}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Alerts</Label>
                    <p className="text-xs text-gray-500">Send critical alerts via email</p>
                  </div>
                  <Switch
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                    <Input
                      id="slackWebhook"
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="alertThreshold">Alert Threshold (per hour)</Label>
                    <Input
                      id="alertThreshold"
                      type="number"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Moderation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="autoFlagKeywords">Auto-Flag Keywords</Label>
                  <Textarea
                    id="autoFlagKeywords"
                    value={autoFlagKeywords}
                    onChange={(e) => setAutoFlagKeywords(e.target.value)}
                    placeholder="Comma-separated keywords to automatically flag"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Posts containing these keywords will be automatically flagged for review</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="moderationDelay">Moderation Delay (minutes)</Label>
                    <Input
                      id="moderationDelay"
                      type="number"
                      value={moderationDelay}
                      onChange={(e) => setModerationDelay(e.target.value)}
                      min="0"
                      max="60"
                    />
                    <p className="text-xs text-gray-500 mt-1">Delay before auto-moderation takes effect</p>
                  </div>
                  <div>
                    <Label htmlFor="highPriorityDomains">High Priority Domains</Label>
                    <Input
                      id="highPriorityDomains"
                      value={highPriorityDomains}
                      onChange={(e) => setHighPriorityDomains(e.target.value)}
                      placeholder="Comma-separated email domains"
                    />
                    <p className="text-xs text-gray-500 mt-1">Users from these domains get priority verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Keys Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Keys & Secrets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">Security Notice</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        API keys and secrets should be configured through environment variables for security. 
                        Contact your system administrator to update Firebase credentials and other sensitive configurations.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Firebase Private Key</span>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500">Configure via FIREBASE_PRIVATE_KEY environment variable</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Firebase Client Email</span>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500">Configure via FIREBASE_CLIENT_EMAIL environment variable</p>
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