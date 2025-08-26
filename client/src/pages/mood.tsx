import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smile, TrendingUp, Calendar, Menu } from "lucide-react";
import type { MoodEntry } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import type { CurrentPage } from "@/App";

interface MoodPageProps {
  sessionId?: number;
  onBack: () => void;
  onPageChange: (page: CurrentPage) => void;
  currentPage: CurrentPage;
}

const moodEmojis = [
  { emoji: "😊", label: "Happy", value: 8 },
  { emoji: "😐", label: "Neutral", value: 5 },
  { emoji: "😔", label: "Sad", value: 3 },
  { emoji: "😟", label: "Worried", value: 4 },
  { emoji: "😴", label: "Tired", value: 4 },
  { emoji: "😤", label: "Frustrated", value: 3 },
  { emoji: "😰", label: "Anxious", value: 2 },
  { emoji: "🤗", label: "Loved", value: 9 },
  { emoji: "😡", label: "Angry", value: 2 },
  { emoji: "😌", label: "Peaceful", value: 8 },
  { emoji: "🥳", label: "Excited", value: 9 },
  { emoji: "😭", label: "Overwhelmed", value: 1 }
];

export default function MoodPage({ sessionId, onBack, onPageChange, currentPage }: MoodPageProps) {
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; label: string; value: number } | null>(null);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get mood entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/mood", sessionId],
    queryFn: async () => {
      const url = sessionId ? `/api/mood?sessionId=${sessionId}` : "/api/mood";
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  // Create mood entry mutation
  const createMoodMutation = useMutation({
    mutationFn: async (moodData: { moodScore: number; moodEmoji?: string; notes?: string }) => {
      const response = await apiRequest("POST", "/api/mood", {
        sessionId: sessionId || null,
        moodScore: moodData.moodScore,
        moodEmoji: moodData.moodEmoji || null,
        notes: moodData.notes || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood", sessionId] });
      setSelectedMood(null);
      setMoodScore(null);
      setNotes("");
      toast({
        title: "Mood Recorded",
        description: "Your mood has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record mood. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleMoodSelect = (mood: { emoji: string; label: string; value: number }) => {
    setSelectedMood(mood);
    setMoodScore(mood.value);
  };

  const handleScoreSelect = (score: number) => {
    setMoodScore(score);
    // Clear emoji selection when manually selecting score
    setSelectedMood(null);
  };

  const handleSaveMood = () => {
    if (moodScore === null) {
      toast({
        title: "Mood Required",
        description: "Please select a mood or score before saving.",
        variant: "destructive",
      });
      return;
    }

    createMoodMutation.mutate({
      moodScore,
      moodEmoji: selectedMood?.emoji,
      notes: notes || undefined,
    });
  };

  const formatDate = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 4) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getMoodTrend = () => {
    if (entries.length < 2) return null;
    const recent = entries.slice(0, 5);
    const avg = recent.reduce((sum: number, entry: MoodEntry) => sum + entry.moodScore, 0) / recent.length;
    const older = entries.slice(5, 10);
    if (older.length === 0) return null;
    const oldAvg = older.reduce((sum: number, entry: MoodEntry) => sum + entry.moodScore, 0) / older.length;
    return avg - oldAvg;
  };

  const trend = getMoodTrend();

  return (
    <div className="min-h-screen bg-gradient-neutral">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessionId={sessionId || null}
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
                <Smile className="w-6 h-6 text-primary mr-3" />
                <h1 className="text-3xl font-bold text-foreground">Mood Check-in</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mood Entry Form */}
              <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>How are you feeling today?</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select an emoji that represents your mood or use the scale below
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Emoji Selection */}
                <div>
                  <h3 className="font-medium mb-3">Choose your mood:</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {moodEmojis.map((mood, index) => (
                      <Button
                        key={index}
                        variant={selectedMood?.emoji === mood.emoji ? "default" : "outline"}
                        className="aspect-square flex flex-col p-2 h-auto"
                        onClick={() => handleMoodSelect(mood)}
                      >
                        <span className="text-2xl mb-1">{mood.emoji}</span>
                        <span className="text-xs">{mood.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Manual Score Selection */}
                <div>
                  <h3 className="font-medium mb-3">Or rate your mood (1-10):</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Very Low</span>
                    <span className="text-sm text-muted-foreground">Very High</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {[1,2,3,4,5,6,7,8,9,10].map((score) => (
                      <Button
                        key={score}
                        variant={moodScore === score ? "default" : "outline"}
                        size="sm"
                        className="aspect-square p-0 text-sm"
                        onClick={() => handleScoreSelect(score)}
                      >
                        {score}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Additional notes (optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What's contributing to how you feel today?"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSaveMood}
                  disabled={createMoodMutation.isPending || moodScore === null}
                  className="w-full"
                >
                  {createMoodMutation.isPending ? "Saving..." : "Save Mood Check-in"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Mood History */}
          <div>
            {/* Trend Card */}
            {trend !== null && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-primary mr-2" />
                      <span className="font-medium">Recent Trend</span>
                    </div>
                    <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {trend > 0 ? '↗️ Improving' : trend < 0 ? '↘️ Declining' : '→ Stable'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center py-6">
                      <Smile className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No mood entries yet. Start by recording your mood above!</p>
                    </div>
                  ) : (
                    entries.slice(0, 10).map((entry: MoodEntry) => (
                      <div key={entry.id} className={`border rounded-lg p-3 ${getMoodColor(entry.moodScore)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {entry.moodEmoji && <span className="text-xl">{entry.moodEmoji}</span>}
                            <span className="font-medium">Score: {entry.moodScore}/10</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(entry.timestamp || new Date())}
                          </div>
                        </div>
                        {entry.notes && (
                          <p className="text-sm">{entry.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}