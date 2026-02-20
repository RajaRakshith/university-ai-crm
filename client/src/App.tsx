import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Events from "@/pages/events";
import Campaigns from "@/pages/campaigns";
import CampaignBuilder from "@/pages/campaign-builder";
import SearchResults from "@/pages/search";
import Analytics from "@/pages/analytics";
import EventDetails from "@/pages/event-details";

// Student pages
import StudentHome from "@/pages/student-home";
import StudentUpload from "@/pages/student-upload";
import StudentProfile from "@/pages/student-profile";
import StudentDiscover from "@/pages/student-discover";
import StudentPostingDetail from "@/pages/student-posting-detail";
import StudentCampaigns from "@/pages/student-campaigns";

// Auth pages
import Splash from "@/pages/splash";
import Login from "@/pages/auth/login";
import RegisterStudent from "@/pages/auth/register-student";
import RegisterOrganizer from "@/pages/auth/register-organizer";

// Auth utilities
import { ProtectedRoute, RoleRoute } from "@/lib/auth";

function StudentRoutes() {
  return (
    <RoleRoute role="student">
      <Switch>
        <Route path="/student" component={StudentHome} />
        <Route path="/student/upload" component={StudentUpload} />
        <Route path="/student/profile" component={StudentProfile} />
        <Route path="/student/discover" component={StudentDiscover} />
        <Route path="/student/posting/:id" component={StudentPostingDetail} />
        <Route path="/student/campaigns" component={StudentCampaigns} />
        <Route component={NotFound} />
      </Switch>
    </RoleRoute>
  );
}

function OrganizerRoutes() {
  return (
    <RoleRoute role="organizer">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/students" component={Students} />
        <Route path="/events" component={Events} />
        <Route path="/events/:id" component={EventDetails} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/campaigns/new" component={CampaignBuilder} />
        <Route path="/search" component={SearchResults} />
        <Route component={NotFound} />
      </Switch>
    </RoleRoute>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/splash" component={Splash} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register/student" component={RegisterStudent} />
      <Route path="/auth/register/organizer" component={RegisterOrganizer} />
      
      {/* Protected Student routes - exact /student and all subpaths */}
      <Route path="/student" component={StudentRoutes} />
      <Route path="/student/:rest*" component={StudentRoutes} />
      
      {/* Protected Organizer routes - explicit / first so root doesn't 404 */}
      <Route path="/" component={OrganizerRoutes} />
      <Route path="/:rest+" component={OrganizerRoutes} />
      
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
