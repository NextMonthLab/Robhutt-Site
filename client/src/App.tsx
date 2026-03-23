import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Method from "@/pages/Method";
import Planner from "@/pages/Planner";
import ScorecardComplete from "@/pages/ScorecardComplete";
import PublicScorecardPage from "@/pages/PublicScorecardPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/method" component={Method} />
      <Route path="/planner/:plannerId" component={Planner} />
      <Route path="/scorecards/:slug" component={PublicScorecardPage} />
      <Route path="/scorecard/complete" component={ScorecardComplete} />
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
