import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Sidebar from "@/components/sidebar";
import VoiceInterface from "@/components/voice-interface";
import ChatInterface from "@/components/chat-interface";
import CrisisModal from "@/components/crisis-modal";
import SessionSummaryModal from "@/components/session-summary-modal";
import { detectCrisisKeywords, shouldTriggerCrisisIntervention } from "@/lib/crisis-detection";
import type { SessionSettings, CurrentPage } from "@/App";
import type { Session, Message } from "@shared/schema";

interface SessionPageProps {
  sessionId: number;
  sessionSettings: SessionSettings;
  onPageChange: (page: CurrentPage) => void;
  onSessionEnd: () => void;
}

export default function SessionPage({ sessionId, sessionSettings, onPageChange, onSessionEnd }: SessionPageProps) {
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Timer effect
  useEffect(() => {
    if (sessionEnded) return;

    const timer = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionEnded]);

  // Get session data
  const { data: session } = useQuery({
    queryKey: ["/api/sessions", sessionId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/sessions/${sessionId}`);
      return response.json();
    },
    enabled: !!sessionId,
  });

  // Get messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/sessions", sessionId, "messages"],
    queryFn: async () => {
      if (!session?.messages) return [];
      return session.messages;
    },
    enabled: !!session,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, isVoice }: { content: string; isVoice: boolean }) => {
      // Check for crisis keywords before sending
      const keywords = detectCrisisKeywords(content);
      if (keywords.length > 0) {
        setDetectedKeywords(keywords);
        if (shouldTriggerCrisisIntervention(content)) {
          setShowCrisisModal(true);
        }
      }

      const response = await apiRequest("POST", `/api/sessions/${sessionId}/messages`, {
        content,
        isVoice,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/sessions/${sessionId}/end`);
      return response.json();
    },
    onSuccess: () => {
      setSessionEnded(true);
      setShowSessionSummary(true);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error ending session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (content: string, isVoice: boolean = false) => {
    if (!content.trim()) return;
    sendMessageMutation.mutate({ content, isVoice });
  };

  const handleEndSession = () => {
    endSessionMutation.mutate();
  };

  const handleSessionSummaryClose = () => {
    setShowSessionSummary(false);
    onSessionEnd();
  };

  const handleViewAllSummaries = () => {
    setShowSessionSummary(false);
    onPageChange('session-summaries');
  };

  const handleReturnHome = () => {
    setShowSessionSummary(false);
    onSessionEnd();
  };

  const getTherapistName = () => {
    const personalities: Record<string, string> = {
      empathetic: "Dr. Emma",
      analytical: "Dr. Alex",
      supportive: "Dr. Sam", 
      mindful: "Dr. Maya"
    };
    return personalities[sessionSettings.therapistPersonality] || "Dr. Emma";
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-neutral">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessionId={sessionId}
          onPageChange={onPageChange}
          currentPage="session"
          onEndSession={handleEndSession}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-background dark:bg-background shadow-sm border-b border-border p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                <h1 className="text-xl font-bold text-primary">Session with {getTherapistName()}</h1>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">Communication Mode:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${!isVoiceMode ? 'text-primary' : 'text-muted-foreground'}`}>
                      Text
                    </span>
                    <Switch
                      checked={isVoiceMode}
                      onCheckedChange={setIsVoiceMode}
                    />
                    <span className={`text-sm ${isVoiceMode ? 'text-primary' : 'text-muted-foreground'}`}>
                      Voice
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Session Time:</span>
                  <span className="font-mono">{formatTime(sessionTimer)}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEndSession}
                  disabled={endSessionMutation.isPending}
                >
                  {endSessionMutation.isPending ? "Ending..." : "End Session"}
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 p-6">
            {isVoiceMode ? (
              <VoiceInterface
                therapistName={getTherapistName()}
                onSendMessage={handleSendMessage}
                messages={messages}
                isLoading={sendMessageMutation.isPending}
                sessionEnded={sessionEnded}
              />
            ) : (
              <ChatInterface
                therapistName={getTherapistName()}
                onSendMessage={handleSendMessage}
                messages={messages}
                isLoading={sendMessageMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>

      {/* Crisis Modal */}
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        detectedKeywords={detectedKeywords}
      />

      {/* Session Summary Modal */}
      <SessionSummaryModal
        isOpen={showSessionSummary}
        onClose={handleSessionSummaryClose}
        sessionId={sessionId}
        therapistName={getTherapistName()}
        duration={sessionTimer}
        onViewAllSummaries={handleViewAllSummaries}
        onReturnHome={handleReturnHome}
      />
    </div>
  );
}