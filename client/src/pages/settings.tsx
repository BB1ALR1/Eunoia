import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, User, Volume2, Target, Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import type { CurrentPage, SessionSettings } from "@/App";

interface SettingsPageProps {
  onBack: () => void;
  onPageChange: (page: CurrentPage) => void;
  currentPage: CurrentPage;
  sessionId: number | null;
  sessionSettings: SessionSettings | null;
  onUpdateSettings: (settings: SessionSettings) => void;
}

const therapistPersonalities = [
  {
    id: "empathetic",
    name: "Dr. Emma",
    description: "Warm, understanding, and focuses on emotional support"
  },
  {
    id: "analytical",
    name: "Dr. Alex",
    description: "Logical, structured, and helps with problem-solving"
  },
  {
    id: "supportive",
    name: "Dr. Sam",
    description: "Encouraging, motivational, and strength-focused"
  },
  {
    id: "mindful",
    name: "Dr. Maya",
    description: "Calm, present-focused, and mindfulness-oriented"
  }
];

const voiceOptions = [
  { id: "alloy", name: "Alloy", description: "Natural and balanced" },
  { id: "echo", name: "Echo", description: "Warm and engaging" },
  { id: "fable", name: "Fable", description: "Calm and soothing" },
  { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
  { id: "nova", name: "Nova", description: "Bright and energetic" },
  { id: "shimmer", name: "Shimmer", description: "Gentle and friendly" }
];

const goalOptions = [
  "Reduce anxiety and stress",
  "Improve mood and emotional regulation",
  "Develop coping strategies",
  "Better sleep habits",
  "Increase self-confidence",
  "Manage depression symptoms",
  "Improve relationships",
  "Work through trauma",
  "Manage anger",
  "Build mindfulness practices",
  "Career and life transitions",
  "Grief and loss support"
];

export default function SettingsPage({ 
  onBack, 
  onPageChange, 
  currentPage, 
  sessionId, 
  sessionSettings,
  onUpdateSettings 
}: SettingsPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<SessionSettings>(
    sessionSettings || {
      therapistPersonality: "empathetic",
      selectedVoice: "alloy",
      selectedGoals: []
    }
  );

  const handlePersonalityChange = (personality: string) => {
    setTempSettings(prev => ({ ...prev, therapistPersonality: personality }));
  };

  const handleVoiceChange = (voice: string) => {
    setTempSettings(prev => ({ ...prev, selectedVoice: voice }));
  };

  const handleGoalToggle = (goal: string) => {
    setTempSettings(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goal)
        ? prev.selectedGoals.filter(g => g !== goal)
        : [...prev.selectedGoals, goal]
    }));
  };

  const handleSaveSettings = () => {
    onUpdateSettings(tempSettings);
    onBack();
  };

  const selectedPersonality = therapistPersonalities.find(p => p.id === tempSettings.therapistPersonality);
  const selectedVoice = voiceOptions.find(v => v.id === tempSettings.selectedVoice);

  return (
    <div className="h-screen bg-gradient-neutral">
      <div className="flex h-full">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessionId={sessionId}
          onPageChange={onPageChange}
          currentPage={currentPage}
        />
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                onClick={() => setIsSidebarOpen(true)}
                className="mr-4"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={onBack}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Settings className="w-6 h-6 text-primary mr-3" />
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              </div>
            </div>

            <div className="space-y-6">
              {/* Therapist Personality */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Therapist Personality
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose the therapist personality that best suits your needs
                  </p>
                </CardHeader>
                <CardContent>
                  <Select value={tempSettings.therapistPersonality} onValueChange={handlePersonalityChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {therapistPersonalities.map((personality) => (
                        <SelectItem key={personality.id} value={personality.id} className="h-auto py-3">
                          <div className="flex flex-col space-y-1 text-left">
                            <span className="font-medium text-foreground">{personality.name}</span>
                            <span className="text-sm text-muted-foreground leading-tight">{personality.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPersonality && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm"><strong>{selectedPersonality.name}:</strong> {selectedPersonality.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Voice Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="w-5 h-5 mr-2" />
                    Voice Selection
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose the voice for your therapy sessions
                  </p>
                </CardHeader>
                <CardContent>
                  <Select value={tempSettings.selectedVoice} onValueChange={handleVoiceChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id} className="h-auto py-3">
                          <div className="flex flex-col space-y-1 text-left">
                            <span className="font-medium text-foreground">{voice.name}</span>
                            <span className="text-sm text-muted-foreground leading-tight">{voice.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedVoice && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm"><strong>{selectedVoice.name}:</strong> {selectedVoice.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Therapy Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Therapy Goals
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select the areas you'd like to focus on (choose multiple)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <div
                        key={goal}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          tempSettings.selectedGoals.includes(goal)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleGoalToggle(goal)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{goal}</span>
                          {tempSettings.selectedGoals.includes(goal) && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {tempSettings.selectedGoals.length > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-2">Selected Goals:</p>
                      <div className="flex flex-wrap gap-2">
                        {tempSettings.selectedGoals.map((goal) => (
                          <Badge key={goal} variant="secondary">{goal}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}