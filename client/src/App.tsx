import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import StudentVerification from "@/pages/student-verification";
import PostModeration from "@/pages/post-moderation";
import IdVerification from "@/pages/id-verification";
import ChatMonitoring from "@/pages/chat-monitoring";
import UserManagement from "@/pages/user-management";
import APILogs from "@/pages/api-logs";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/student-verification" component={StudentVerification} />
      <Route path="/post-moderation" component={PostModeration} />
      <Route path="/id-verification" component={IdVerification} />
      <Route path="/chat-monitoring" component={ChatMonitoring} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/api-logs" component={APILogs} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
