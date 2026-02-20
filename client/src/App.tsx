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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/students" component={Students}/>
      <Route path="/events" component={Events}/>
      <Route path="/events/:id" component={EventDetails}/>
      <Route path="/analytics" component={Analytics}/>
      <Route path="/campaigns" component={Campaigns}/>
      <Route path="/campaigns/new" component={CampaignBuilder}/>
      <Route path="/search" component={SearchResults}/>
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
