import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { 
  MessageCircle, 
  BookOpen, 
  Smile, 
  Wrench, 
  Phone, 
  X,
  ChevronRight,
  ChevronDown,
  FileText,
  Calendar,
  Clock,
  Home,
  Settings,
  User
} from "lucide-react";
import type { CurrentPage } from "@/App";
import type { Session } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number | null;
  onPageChange: (page: CurrentPage) => void;
  currentPage: CurrentPage;
  onEndSession?: () => void;
}

export default function Sidebar({ isOpen, onClose, sessionId, onPageChange, currentPage, onEndSession }: SidebarProps) {
  const [activeSection, setActiveSection] = useState(currentPage);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<CurrentPage | null>(null);

  // Update active section when current page changes
  useEffect(() => {
    setActiveSection(currentPage);
  }, [currentPage]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("No active session");
      
      const response = await apiRequest("POST", `/api/sessions/${sessionId}/end`);
      return response.json();
    },
    onSuccess: () => {
      // Stop any ongoing speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Clear session from localStorage to prevent recreation
      localStorage.removeItem('eunoia-session-id');
      
      // Invalidate sessions cache
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      
      // Only show toast if we're ending from a non-session page
      if (currentPage !== 'session') {
        toast({
          title: "Session Ended",
          description: "Your session has been ended.",
        });
      }

      // Navigate to the pending page
      if (pendingNavigation) {
        onPageChange(pendingNavigation);
        setPendingNavigation(null);
      } else {
        // Default to home if no pending navigation
        onPageChange('home');
      }
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to end session properly.",
        variant: "destructive",
      });
    }
  });

  const handleNavigation = (page: CurrentPage) => {
    // Only show confirmation if we're currently in an active session AND on the session page
    if (sessionId && currentPage === 'session') {
      setPendingNavigation(page);
      setShowConfirmDialog(true);
    } else if (sessionId && currentPage !== 'session') {
      // If there's a session but we're not on the session page, auto-end it silently
      setPendingNavigation(page);
      endSessionMutation.mutate();
    } else {
      // No active session, navigate directly
      onPageChange(page);
      onClose();
    }
  };

  const handleConfirmEndSession = () => {
    setShowConfirmDialog(false);
    // Call the onEndSession callback if available (from session page)
    if (onEndSession) {
      onEndSession();
    } else {
      endSessionMutation.mutate();
    }
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  };



  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      active: activeSection === "home" && sessionId === null, // Only active when on home without session
      action: () => handleNavigation('home')
    },
    {
      id: "session",
      label: "Talk to Eunoia",
      icon: MessageCircle,
      active: activeSection === "session", // Show active when on session page
      action: () => {
        if (sessionId) {
          // Navigate to active session
          handleNavigation('session');
        } else {
          // No session, go to home to start one
          handleNavigation('home');
        }
      }
    },
    {
      id: "journal",
      label: "Journal", 
      icon: BookOpen,
      active: activeSection === "journal",
      action: () => handleNavigation('journal')
    },
    {
      id: "mood",
      label: "Mood Check-in",
      icon: Smile,
      active: activeSection === "mood",
      action: () => handleNavigation('mood')
    },
    {
      id: "cbt",
      label: "CBT Coping Tools",
      icon: Wrench,
      active: activeSection === "cbt-tools",
      action: () => handleNavigation('cbt-tools')
    },
    {
      id: "summaries",
      label: "Session Summaries",
      icon: FileText,
      active: activeSection === "session-summaries",
      action: () => handleNavigation('session-summaries')
    },
    {
      id: "settings",
      label: "Session Settings",
      icon: Settings,
      active: activeSection === "settings",
      action: () => handleNavigation('settings')
    },
    {
      id: "account",
      label: "Account Settings",
      icon: User,
      active: activeSection === "account",
      action: () => handleNavigation('account')
    }
  ];

  const cbtTools = [
    "Breathing Exercises",
    "Thought Challenging",
    "Grounding Techniques",
    "Progressive Muscle Relaxation",
    "Cognitive Restructuring",
    "Mindfulness Meditation"
  ];

  const journalPrompts = [
    "How am I feeling right now?",
    "What am I grateful for today?",
    "What challenged me today?",
    "What did I learn about myself?",
    "What would I like to focus on tomorrow?"
  ];

  const SessionSummariesSection = () => {
    const { data: sessions = [], isLoading } = useQuery<Session[]>({
      queryKey: ["/api/sessions/summaries"],
    });

    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    const completedSessions = sessions.filter(session => session.summary);

    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Past Session Summaries</h4>
            {completedSessions.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleNavigation('session-summaries')}
                className="text-xs"
              >
                View All
              </Button>
            )}
          </div>
          {completedSessions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No session summaries yet. Complete a therapy session to see summaries here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedSessions.slice(0, 2).map((session) => (
                <Card key={session.id} className="cursor-pointer hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm">
                        Session {session.id}
                      </h5>
                      <span className="text-xs text-muted-foreground">
                        {session.duration ? `${Math.floor(session.duration / 60)}min` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      {session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Unknown date'}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {session.summary ? session.summary.substring(0, 100) + '...' : 'No summary available'}
                    </p>
                    {session.keyTopics && session.keyTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {session.keyTopics.slice(0, 2).map((topic, index) => (
                          <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {topic}
                          </span>
                        ))}
                        {session.keyTopics.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{session.keyTopics.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {completedSessions.length > 2 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleNavigation('session-summaries')}
                    className="text-xs"
                  >
                    View All {completedSessions.length} Sessions
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "session":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You're currently in an active therapy session. Use the main interface to communicate with your therapist.
            </p>
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-sm font-medium text-primary">Session Active</p>
              <p className="text-xs text-muted-foreground">
                Your conversation is being recorded for session summary purposes.
              </p>
            </div>
          </div>
        );
      
      case "journal":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Journal features are coming soon. In the meantime, you can discuss your thoughts and feelings during a therapy session.
            </p>
          </div>
        );
      
      case "mood":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mood check-in features are coming soon. In the meantime, you can discuss your feelings during a therapy session.
            </p>
          </div>
        );
      
      case "cbt":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">CBT Coping Tools</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
                {cbtTools.map((tool, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-between text-left h-auto py-3 px-4 text-foreground border-border hover:bg-accent/10 break-words"
                  >
                    <span className="text-sm leading-relaxed flex-1 text-left">{tool}</span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 ml-2" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-3">
              <h5 className="font-medium text-accent mb-2">Quick Exercise</h5>
              <p className="text-sm text-muted-foreground mb-2">
                Try the 4-7-8 breathing technique:
              </p>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Inhale for 4 counts</li>
                <li>2. Hold for 7 counts</li>
                <li>3. Exhale for 8 counts</li>
                <li>4. Repeat 3-4 times</li>
              </ol>
            </div>
          </div>
        );
      
      case "summaries":
        return <SessionSummariesSection />;
      
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed z-50 h-full bg-background shadow-lg border-r border-border
        w-80 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="p-6 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">Eunoia</h2>
                <p className="text-sm text-muted-foreground">Your AI Therapeutic Companion</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="p-4 space-y-2 flex-shrink-0">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={item.active ? "default" : "ghost"}
                  className="w-full justify-start space-x-3 h-12"
                  onClick={item.action}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
          
          {/* Content Area */}
          <div className="flex-1 px-4 pb-4 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
            {renderContent()}
          </div>
          
          {/* Crisis Support */}
          <div className="p-4 border-t border-border flex-shrink-0">
            <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-red-800 dark:text-red-200 text-sm">Crisis Support</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-medium text-red-800 dark:text-red-200">988 - Suicide & Crisis Lifeline</div>
                  <div className="font-medium text-red-800 dark:text-red-200">911 - Emergency Services</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Current Session?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an active therapy session. Are you sure you want to end it and navigate to a different page? 
              Your session progress will be saved and a summary will be generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>
              Stay in Session
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmEndSession}
              disabled={endSessionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {endSessionMutation.isPending ? "Ending Session..." : "End Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
