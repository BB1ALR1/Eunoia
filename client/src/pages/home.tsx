import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Menu, Settings, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar";
import type { SessionSettings, CurrentPage } from "@/App";

interface HomeProps {
  sessionSettings: SessionSettings;
  onPageChange: (page: CurrentPage) => void;
  onSessionStart: (sessionId: number) => void;
}

export default function Home({ sessionSettings, onPageChange, onSessionStart }: HomeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Get current user data for profile pic
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (settings: SessionSettings) => {
      const response = await apiRequest("POST", "/api/sessions", {
        therapistPersonality: settings.therapistPersonality,
        selectedVoice: settings.selectedVoice,
        selectedGoals: settings.selectedGoals,
      });
      return response.json();
    },
    onSuccess: (session) => {
      toast({
        title: "Session Started",
        description: "Your therapy session has begun successfully.",
      });
      onSessionStart(session.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Error starting session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const initializeSession = () => {
    createSessionMutation.mutate(sessionSettings);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessionId={null}
        onPageChange={onPageChange}
        currentPage="home"
      />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <h1 className="text-xl font-bold text-primary">Eunoia</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Profile Picture */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange('account')}
                className="p-1 rounded-full"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {(user as any)?.profilePic ? (
                    <img 
                      src={(user as any).profilePic} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange('settings')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Customize Session</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-12">
              {/* Animated Heart Icon */}
              <div className="relative mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-br from-red-400/30 to-pink-500/30 rounded-full animate-ping"></div>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome to Your Safe Space
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                Ready to start your session with
              </p>
              <p className="text-xl font-semibold text-gray-800 mb-6">
                {getTherapistName()}
              </p>
              
              {/* Session Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Therapist Personality:</span>
                    <span className="font-medium text-gray-800 capitalize">
                      {sessionSettings.therapistPersonality}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Selected Goals:</span>
                    <span className="font-medium text-gray-800">
                      {sessionSettings.selectedGoals.length} goal{sessionSettings.selectedGoals.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Voice Mode:</span>
                    <span className="font-medium text-gray-800">
                      {sessionSettings.selectedVoice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <Button 
                onClick={initializeSession}
                disabled={createSessionMutation.isPending}
                size="lg"
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                {createSessionMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting Session...</span>
                  </div>
                ) : (
                  "Begin Your Session"
                )}
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                Take a moment to get comfortable and prepare for your session
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}