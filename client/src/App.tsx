import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Events from "@/pages/events";
import Campaigns from "@/pages/campaigns";
import CampaignBuilder from "@/pages/campaign-builder";
import SearchResults from "@/pages/search";
import Analytics from "@/pages/analytics";
import StudentOnboard from "@/pages/student-onboard";
import StudentLogin from "@/pages/student-login";
import EventCreation from "@/pages/event-creation";
import StudentDashboard from "@/pages/student-dashboard";
import OrganizerDashboard from "@/pages/organizer-dashboard";
import EventDetails from "@/pages/event-details";

// Route guard for student-only routes
function StudentRoute({ component: Component }: { component: () => JSX.Element }) {
  const { role } = useAuth();
  const effectiveRole = role || (localStorage.getItem('userRole') as 'student' | 'organizer' | null);
  if (!effectiveRole) return <Redirect to="/" />;
  if (effectiveRole !== 'student') return <Redirect to="/organizer/dashboard" />;
  return <Component />;
}

// Route guard for organizer-only routes
function OrganizerRoute({ component: Component }: { component: () => JSX.Element }) {
  const { role } = useAuth();
  const effectiveRole = role || (localStorage.getItem('userRole') as 'student' | 'organizer' | null);
  if (!effectiveRole) return <Redirect to="/" />;
  if (effectiveRole !== 'organizer') return <Redirect to="/student/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Landing page - always show on root */}
      <Route path="/" component={Landing} />

      {/* Student Routes */}
      <Route path="/student/login" component={StudentLogin} />
      <Route path="/student/onboard">
        <StudentRoute component={StudentOnboard} />
      </Route>
      <Route path="/student/dashboard">
        <StudentRoute component={StudentDashboard} />
      </Route>
      <Route path="/student">
        <StudentRoute component={StudentDashboard} />
      </Route>

      {/* Organizer Routes */}
      <Route path="/organizer/dashboard">
        <OrganizerRoute component={OrganizerDashboard} />
      </Route>
      <Route path="/organizer">
        <OrganizerRoute component={OrganizerDashboard} />
      </Route>
      <Route path="/events/new">
        <OrganizerRoute component={EventCreation} />
      </Route>
      <Route path="/students">
        <OrganizerRoute component={Students} />
      </Route>
      <Route path="/analytics">
        <OrganizerRoute component={Analytics} />
      </Route>
      <Route path="/campaigns">
        <OrganizerRoute component={Campaigns} />
      </Route>
      <Route path="/campaigns/new">
        <OrganizerRoute component={CampaignBuilder} />
      </Route>
      <Route path="/events">
        <OrganizerRoute component={Events} />
      </Route>
      <Route path="/events/:id">
        <OrganizerRoute component={EventDetails} />
      </Route>
      <Route path="/search">
        <OrganizerRoute component={SearchResults} />
      </Route>
      <Route path="/dashboard">
        <OrganizerRoute component={Dashboard} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
