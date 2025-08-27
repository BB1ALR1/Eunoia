import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, HandHeart, Leaf, Wind, Sun, Mountain, Users, Play } from "lucide-react";
import type { SessionSettings } from "@/App";

interface OnboardingProps {
  onComplete: (settings: SessionSettings) => void;
}

const therapistPersonalities = [
  {
    id: "empathetic",
    name: "Dr. Emma",
    title: "Empathetic",
    description: "Warm, understanding, and deeply compassionate. Focuses on emotional validation and support.",
    icon: Heart,
    color: "text-pink-500"
  },
  {
    id: "analytical",
    name: "Dr. Alex",
    title: "Analytical",
    description: "Logical, structured, and solution-focused. Emphasizes CBT techniques and practical strategies.",
    icon: Brain,
    color: "text-blue-500"
  },
  {
    id: "supportive",
    name: "Dr. Sam",
    title: "Supportive",
    description: "Encouraging, patient, and strength-focused. Helps build confidence and resilience.",
    icon: HandHeart,
    color: "text-green-500"
  },
  {
    id: "mindful",
    name: "Dr. Maya",
    title: "Mindful",
    description: "Calm, present, and wisdom-oriented. Integrates mindfulness and meditation practices.",
    icon: Leaf,
    color: "text-teal-500"
  }
];

const voiceOptions = [
  { id: "sarah", name: "Sarah", description: "Warm & Gentle", gender: "female" },
  { id: "emily", name: "Emily", description: "Clear & Professional", gender: "female" },
  { id: "anna", name: "Anna", description: "Soft & Caring", gender: "female" },
  { id: "michael", name: "Michael", description: "Calm & Reassuring", gender: "male" },
  { id: "david", name: "David", description: "Confident & Steady", gender: "male" },
  { id: "james", name: "James", description: "Friendly & Approachable", gender: "male" }
];

const goalOptions = [
  {
    id: "anxiety",
    title: "Manage Anxiety",
    description: "Learn coping strategies for anxious thoughts and feelings",
    icon: Wind,
    color: "text-blue-500"
  },
  {
    id: "depression",
    title: "Improve Mood",
    description: "Work through depression and find ways to feel better",
    icon: Sun,
    color: "text-yellow-500"
  },
  {
    id: "stress",
    title: "Reduce Stress",
    description: "Find healthy ways to manage life's pressures",
    icon: Mountain,
    color: "text-green-500"
  },
  {
    id: "relationships",
    title: "Relationship Issues",
    description: "Improve communication and connection with others",
    icon: Users,
    color: "text-purple-500"
  },
  {
    id: "self-esteem",
    title: "Build Self-Esteem",
    description: "Develop a more positive relationship with yourself",
    icon: Heart,
    color: "text-pink-500"
  },
  {
    id: "general",
    title: "General Support",
    description: "Just need someone to talk to and process thoughts",
    icon: HandHeart,
    color: "text-teal-500"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPersonality, setSelectedPersonality] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (settings: SessionSettings) => {
      const response = await apiRequest("PATCH", "/api/auth/preferences", {
        therapistPersonality: settings.therapistPersonality,
        selectedVoice: settings.selectedVoice,
        selectedGoals: settings.selectedGoals,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
  };

  const handleVoiceSelect = (voice: string) => {
    setSelectedVoice(voice);
  };

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleComplete = () => {
    const settings: SessionSettings = {
      therapistPersonality: selectedPersonality,
      selectedVoice: selectedVoice,
      selectedGoals: selectedGoals
    };
    
    // Save to database and then complete
    savePreferencesMutation.mutate(settings, {
      onSuccess: () => {
        onComplete(settings);
      }
    });
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-neutral flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Welcome to Eunoia</h1>
            <p className="text-lg text-muted-foreground">Your AI-powered therapeutic companion</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
            alt="Peaceful meditation scene" 
            className="rounded-2xl mb-8 w-full h-48 object-cover shadow-lg"
          />
          <p className="text-muted-foreground mb-8">
            Let's personalize your therapeutic experience with a few quick questions.
          </p>
          <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold">
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-neutral flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Therapist Style</h2>
            <p className="text-muted-foreground">Select the personality that resonates most with you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {therapistPersonalities.map((personality) => {
              const IconComponent = personality.icon;
              return (
                <Card
                  key={personality.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPersonality === personality.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePersonalitySelect(personality.id)}
                >
                  <CardContent className="p-6 text-center">
                    <IconComponent className={`w-8 h-8 ${personality.color} mx-auto mb-3`} />
                    <h3 className="text-xl font-semibold mb-2">{personality.name} - {personality.title}</h3>
                    <p className="text-muted-foreground text-sm">{personality.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center">
            <Button
              onClick={nextStep}
              disabled={!selectedPersonality}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    const femaleVoices = voiceOptions.filter(v => v.gender === "female");
    const maleVoices = voiceOptions.filter(v => v.gender === "male");

    return (
      <div className="min-h-screen bg-gradient-neutral flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Voice</h2>
            <p className="text-muted-foreground">Select the voice that feels most comfortable for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Female Voices</h3>
              <div className="space-y-3">
                {femaleVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedVoice === voice.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleVoiceSelect(voice.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{voice.name} - {voice.description}</span>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Male Voices</h3>
              <div className="space-y-3">
                {maleVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedVoice === voice.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleVoiceSelect(voice.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{voice.name} - {voice.description}</span>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              onClick={nextStep}
              disabled={!selectedVoice}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-neutral flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">What brings you here today?</h2>
            <p className="text-muted-foreground">Select your primary goals for this session</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {goalOptions.map((goal) => {
              const IconComponent = goal.icon;
              return (
                <Card
                  key={goal.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedGoals.includes(goal.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <CardContent className="p-6 text-center">
                    <IconComponent className={`w-8 h-8 ${goal.color} mx-auto mb-3`} />
                    <h3 className="text-lg font-semibold mb-2">{goal.title}</h3>
                    <p className="text-muted-foreground text-sm">{goal.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center">
            <Button
              onClick={nextStep}
              disabled={selectedGoals.length === 0}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 5) {
    const selectedPersonalityData = therapistPersonalities.find(p => p.id === selectedPersonality);
    const selectedVoiceData = voiceOptions.find(v => v.id === selectedVoice);
    const selectedGoalData = goalOptions.filter(g => selectedGoals.includes(g.id));

    return (
      <div className="min-h-screen bg-gradient-neutral flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">You're all set!</h2>
            <p className="text-muted-foreground mb-6">Here's your personalized setup:</p>
            
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Therapist:</span>
                  <span className="font-semibold">{selectedPersonalityData?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Voice:</span>
                  <span className="font-semibold">{selectedVoiceData?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Focus:</span>
                  <span className="font-semibold">{selectedGoalData.map(g => g.title).join(', ')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button
            onClick={handleComplete}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-semibold text-lg"
          >
            Start Your Session
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
