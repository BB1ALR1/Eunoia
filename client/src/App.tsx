import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import JournalPage from "@/pages/journal";
import MoodPage from "@/pages/mood";
import CBTToolsPage from "@/pages/cbt-tools";
import SessionSummariesPage from "@/pages/session-summaries";
import SettingsPage from "@/pages/settings";
import SessionPage from "@/pages/session";

export interface SessionSettings {
  therapistPersonality: string;
  selectedVoice: string;
  selectedGoals: string[];
}

export type CurrentPage = 'home' | 'session' | 'journal' | 'mood' | 'cbt-tools' | 'session-summaries' | 'settings';

function Router() {
  const [sessionSettings, setSessionSettings] = useState<SessionSettings | null>(null);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [sessionId, setSessionId] = useState<number | null>(null);

  const renderCurrentPage = () => {
    if (!sessionSettings) {
      return <Onboarding onComplete={setSessionSettings} />;
    }

    switch (currentPage) {
      case 'home':
        return <Home 
          sessionSettings={sessionSettings} 
          onPageChange={setCurrentPage}
          onSessionStart={(id) => {
            setSessionId(id);
            setCurrentPage('session');
          }}
        />;
      case 'session':
        return sessionId && sessionSettings ? (
          <SessionPage 
            sessionId={sessionId}
            sessionSettings={sessionSettings}
            onPageChange={setCurrentPage}
            onSessionEnd={() => {
              setSessionId(null);
              setCurrentPage('home');
            }}
          />
        ) : (
          <Home 
            sessionSettings={sessionSettings} 
            onPageChange={setCurrentPage}
            onSessionStart={(id) => {
              setSessionId(id);
              setCurrentPage('session');
            }}
          />
        );
      case 'journal':
        return <JournalPage 
          sessionId={sessionId || undefined} 
          onBack={() => setCurrentPage('home')} 
          onPageChange={setCurrentPage}
          currentPage={currentPage}
        />;
      case 'mood':
        return <MoodPage 
          sessionId={sessionId || undefined} 
          onBack={() => setCurrentPage('home')} 
          onPageChange={setCurrentPage}
          currentPage={currentPage}
        />;
      case 'cbt-tools':
        return <CBTToolsPage 
          onBack={() => setCurrentPage('home')} 
          onPageChange={setCurrentPage}
          currentPage={currentPage}
          sessionId={sessionId}
        />;
      case 'session-summaries':
        return <SessionSummariesPage 
          onBack={() => setCurrentPage('home')} 
          onPageChange={setCurrentPage}
          currentPage={currentPage}
          sessionId={sessionId}
        />;
      case 'settings':
        return <SettingsPage 
          onBack={() => setCurrentPage('home')} 
          onPageChange={setCurrentPage}
          currentPage={currentPage}
          sessionId={sessionId}
          sessionSettings={sessionSettings}
          onUpdateSettings={setSessionSettings}
        />;
      default:
        return <Home 
          sessionSettings={sessionSettings} 
          onPageChange={setCurrentPage}
          onSessionStart={(id) => {
            setSessionId(id);
            setCurrentPage('session');
          }}
        />;
    }
  };

  return (
    <Switch>
      <Route path="/" component={renderCurrentPage} />
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
