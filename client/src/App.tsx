import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import JournalPage from "@/pages/journal";
import MoodPage from "@/pages/mood";
import CBTToolsPage from "@/pages/cbt-tools";
import SessionSummariesPage from "@/pages/session-summaries";
import SettingsPage from "@/pages/settings";
import SessionPage from "@/pages/session";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";

export interface SessionSettings {
  therapistPersonality: string;
  selectedVoice: string;
  selectedGoals: string[];
}

export type CurrentPage = 'home' | 'session' | 'journal' | 'mood' | 'cbt-tools' | 'session-summaries' | 'settings';

function AuthenticatedApp() {
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

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Eunoia...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <AuthenticatedApp />;
  }

  // If not authenticated, show login/signup
  const handleAuthSuccess = () => {
    // The useAuth hook will automatically refetch and update the user state
    // No need to do anything else here
  };

  if (authView === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={handleAuthSuccess}
        onSwitchToSignup={() => setAuthView('signup')}
      />
    );
  } else {
    return (
      <SignupPage 
        onSignupSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }
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
