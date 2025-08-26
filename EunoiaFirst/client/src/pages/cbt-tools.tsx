import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Brain, Wind, Lightbulb, Heart, Target, Clock, Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import type { CurrentPage } from "@/App";

interface CBTToolsPageProps {
  onBack: () => void;
  onPageChange: (page: CurrentPage) => void;
  currentPage: CurrentPage;
  sessionId: number | null;
}

export default function CBTToolsPage({ onBack, onPageChange, currentPage, sessionId }: CBTToolsPageProps) {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const startBreathingExercise = () => {
    setBreathingActive(true);
    breathingCycle();
  };

  const breathingCycle = () => {
    // Inhale for 4 seconds
    setBreathingPhase('inhale');
    setBreathingCount(4);
    
    const inhaleTimer = setInterval(() => {
      setBreathingCount(prev => {
        if (prev <= 1) {
          clearInterval(inhaleTimer);
          // Hold for 7 seconds
          setBreathingPhase('hold');
          setBreathingCount(7);
          
          const holdTimer = setInterval(() => {
            setBreathingCount(prev => {
              if (prev <= 1) {
                clearInterval(holdTimer);
                // Exhale for 8 seconds
                setBreathingPhase('exhale');
                setBreathingCount(8);
                
                const exhaleTimer = setInterval(() => {
                  setBreathingCount(prev => {
                    if (prev <= 1) {
                      clearInterval(exhaleTimer);
                      setBreathingActive(false);
                      return 0;
                    }
                    return prev - 1;
                  });
                }, 1000);
                
                return prev - 1;
              }
              return prev - 1;
            });
          }, 1000);
          
          return prev - 1;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const thoughtChallengingQuestions = [
    "Is this thought based on facts or feelings?",
    "What evidence do I have that this thought is true?",
    "What evidence do I have that this thought might not be true?",
    "What would I tell a friend who had this thought?",
    "What's the worst that could realistically happen?",
    "What's the best that could happen?",
    "What's most likely to happen?",
    "How will this matter in 5 years?",
    "What are some other ways to look at this situation?",
    "What would be a more balanced way to think about this?"
  ];

  const groundingTechniques = [
    {
      name: "5-4-3-2-1 Technique",
      description: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste"
    },
    {
      name: "Progressive Muscle Relaxation",
      description: "Tense and then relax each muscle group in your body, starting from your toes and working up to your head"
    },
    {
      name: "Box Breathing",
      description: "Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat several times"
    },
    {
      name: "Mindful Observation",
      description: "Choose an object and observe it closely for 2-3 minutes, noticing every detail"
    }
  ];

  const copingStrategies = [
    {
      category: "Anxiety",
      strategies: [
        "Deep breathing exercises",
        "Progressive muscle relaxation",
        "Grounding techniques (5-4-3-2-1)",
        "Challenge anxious thoughts",
        "Use positive self-talk",
        "Practice mindfulness meditation"
      ]
    },
    {
      category: "Depression",
      strategies: [
        "Behavioral activation (plan pleasant activities)",
        "Challenge negative thoughts",
        "Maintain a daily routine",
        "Practice gratitude",
        "Exercise regularly",
        "Connect with supportive people"
      ]
    },
    {
      category: "Stress",
      strategies: [
        "Time management and prioritization",
        "Break large tasks into smaller steps",
        "Practice saying 'no' to excessive demands",
        "Use relaxation techniques",
        "Maintain work-life balance",
        "Seek social support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-neutral">
      <div className="flex h-screen">
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
          <div className="max-w-6xl mx-auto">
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
                <Brain className="w-6 h-6 text-primary mr-3" />
                <h1 className="text-3xl font-bold text-foreground">CBT Coping Tools</h1>
              </div>
            </div>

        <Tabs defaultValue="breathing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="thoughts">Thought Challenge</TabsTrigger>
            <TabsTrigger value="grounding">Grounding</TabsTrigger>
            <TabsTrigger value="strategies">Coping Strategies</TabsTrigger>
          </TabsList>

          {/* Breathing Exercises */}
          <TabsContent value="breathing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="w-5 h-5 mr-2" />
                  Breathing Exercises
                </CardTitle>
                <p className="text-muted-foreground">
                  Practice controlled breathing to reduce anxiety and promote relaxation
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 4-7-8 Breathing */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">4-7-8 Breathing Technique</h3>
                  
                  {breathingActive ? (
                    <div className="space-y-4">
                      <div className={`
                        w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white font-bold text-2xl
                        ${breathingPhase === 'inhale' ? 'bg-blue-500 animate-pulse' : 
                          breathingPhase === 'hold' ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}
                      `}>
                        {breathingCount}
                      </div>
                      <div className="text-lg capitalize font-medium">
                        {breathingPhase === 'inhale' ? '🌬️ Breathe In' : 
                         breathingPhase === 'hold' ? '⏸️ Hold' : '💨 Breathe Out'}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                        <Wind className="w-12 h-12 text-gray-400" />
                      </div>
                      <Button onClick={startBreathingExercise} className="mx-auto">
                        Start Exercise
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-6 text-sm text-muted-foreground max-w-md mx-auto">
                    <p className="mb-2"><strong>Instructions:</strong></p>
                    <ol className="text-left space-y-1">
                      <li>1. Inhale through your nose for 4 counts</li>
                      <li>2. Hold your breath for 7 counts</li>
                      <li>3. Exhale through your mouth for 8 counts</li>
                      <li>4. This completes one cycle</li>
                    </ol>
                  </div>
                </div>

                {/* Other Breathing Techniques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Box Breathing</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Inhale 4, Hold 4, Exhale 4, Hold 4
                      </p>
                      <p className="text-xs">Great for focus and concentration</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Deep Belly Breathing</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Slow, deep breaths using your diaphragm
                      </p>
                      <p className="text-xs">Reduces stress and promotes relaxation</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thought Challenging */}
          <TabsContent value="thoughts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Thought Challenging
                </CardTitle>
                <p className="text-muted-foreground">
                  Use these questions to examine and challenge negative or unhelpful thoughts
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {thoughtChallengingQuestions.map((question, index) => (
                    <Card key={index} className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium">{question}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    How to Use
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    When you notice a negative or distressing thought, pick 2-3 of these questions and genuinely try to answer them. 
                    This helps you examine the thought objectively and often reveals that it may not be as accurate or helpful as it first seemed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grounding Techniques */}
          <TabsContent value="grounding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Grounding Techniques
                </CardTitle>
                <p className="text-muted-foreground">
                  Techniques to help you stay present and connected to the moment
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groundingTechniques.map((technique, index) => (
                    <Card key={index} className="border-teal-200 bg-teal-50">
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-3">{technique.name}</h4>
                        <p className="text-sm text-muted-foreground">{technique.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    When to Use Grounding
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• When feeling overwhelmed or panicky</li>
                    <li>• During flashbacks or dissociation</li>
                    <li>• When anxiety feels out of control</li>
                    <li>• To reconnect with the present moment</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coping Strategies */}
          <TabsContent value="strategies">
            <div className="space-y-6">
              {copingStrategies.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{category.category} Coping Strategies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.strategies.map((strategy, strategyIndex) => (
                        <div key={strategyIndex} className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <span className="text-sm">{strategy}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}