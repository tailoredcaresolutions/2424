import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import AvatarDemo from "./pages/AvatarDemo";
import Health from "./pages/Health";
import Family from "./pages/Family";
import Caregiver from "./pages/Caregiver";
import Safety from "./pages/Safety";
import Settings from "./pages/Settings";
import Conversations from "./pages/Conversations";
import Memories from "./pages/Memories";
import DailyRoutine from "./pages/DailyRoutine";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/avatar-demo"} component={AvatarDemo} />
      <Route path="/health" component={Health} />
      <Route path="/family" component={Family} />
      <Route path="/caregiver" component={Caregiver} />
      <Route path="/safety" component={Safety} />
      <Route path="/settings" component={Settings} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/memories" component={Memories} />
      <Route path="/routine" component={DailyRoutine} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
