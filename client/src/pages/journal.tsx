import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Plus, Calendar, Menu, Trash2 } from "lucide-react";
import type { JournalEntry } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import type { CurrentPage } from "@/App";

interface JournalPageProps {
  sessionId?: number;
  onBack: () => void;
  onPageChange: (page: CurrentPage) => void;
  currentPage: CurrentPage;
}

const journalPrompts = [
  "How am I feeling right now?",
  "What am I grateful for today?",
  "What challenged me today?",
  "What did I learn about myself?",
  "What would I like to focus on tomorrow?",
  "What emotions came up for me today?",
  "What is one thing I did well today?",
  "What is something I want to improve?",
  "What brought me joy today?",
  "What am I worried about?"
];

export default function JournalPage({ sessionId, onBack, onPageChange, currentPage }: JournalPageProps) {
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [newEntryContent, setNewEntryContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get journal entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/journal", sessionId],
    queryFn: async () => {
      const url = sessionId ? `/api/journal?sessionId=${sessionId}` : "/api/journal";
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: { title?: string; content: string; prompt?: string }) => {
      const response = await apiRequest("POST", "/api/journal", {
        sessionId: sessionId || null,
        title: entryData.title || null,
        content: entryData.content,
        prompt: entryData.prompt || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal", sessionId] });
      setNewEntryTitle("");
      setNewEntryContent("");
      setSelectedPrompt("");
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete journal entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await apiRequest("DELETE", `/api/journal/${entryId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal", sessionId] });
      toast({
        title: "Entry Deleted",
        description: "Your journal entry has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    setNewEntryTitle(prompt);
    setNewEntryContent(""); // Clear content so user can respond to the prompt
  };

  const handleSaveEntry = () => {
    if (!newEntryContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please write something before saving your entry.",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate({
      title: newEntryTitle || undefined,
      content: newEntryContent,
      prompt: selectedPrompt || undefined,
    });
  };

  const formatDate = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen bg-gradient-neutral">
      <div className="flex h-full">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessionId={sessionId || null}
          onPageChange={onPageChange}
          currentPage={currentPage}
        />
        
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
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
                <BookOpen className="w-6 h-6 text-primary mr-3" />
                <h1 className="text-3xl font-bold text-foreground">Journal</h1>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Prompts Sidebar - Show first on mobile */}
              <div className="w-full lg:w-80 lg:flex-shrink-0 space-y-4 order-1 lg:order-2">
                <Card className="lg:sticky lg:top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <span className="w-5 h-5 mr-2 text-primary">💡</span>
                      Writing Prompts
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Click any prompt to start writing
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 overflow-hidden">
                    {journalPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start h-auto py-3 px-4 text-sm font-normal bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 border-border dark:bg-background dark:hover:bg-primary/10 dark:border-border dark:hover:border-primary/50 transition-all duration-200 whitespace-normal"
                        onClick={() => handlePromptSelect(prompt)}
                      >
                        <div className="flex items-start space-x-3 w-full min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                          <div className="leading-relaxed text-left flex-1 min-w-0 break-words overflow-hidden">
                            {prompt}
                          </div>
                        </div>
                      </Button>
                    ))}
                    
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-dashed border-border">
                      <p className="text-xs text-muted-foreground text-center break-words">
                        💡 Tip: Prompts help you explore your thoughts and feelings when you're not sure where to start
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* New Entry Form */}
              <div className="flex-1 lg:flex-[2] order-2 lg:order-1">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      New Journal Entry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
                      <Input
                        value={newEntryTitle}
                        onChange={(e) => setNewEntryTitle(e.target.value)}
                        placeholder="Give your entry a title..."
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Thoughts</label>
                      <Textarea
                        value={newEntryContent}
                        onChange={(e) => setNewEntryContent(e.target.value)}
                        placeholder="Write about your thoughts, feelings, experiences..."
                        className="min-h-32"
                        rows={6}
                      />
                    </div>
                    
                    <Button
                      onClick={handleSaveEntry}
                      disabled={createEntryMutation.isPending || !newEntryContent.trim()}
                      className="w-full"
                    >
                      {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Previous Entries */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Previous Entries</h2>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : entries.length === 0 ? (
                    <Card className="text-center py-8">
                      <CardContent>
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No journal entries yet. Start writing your first entry above!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    entries.map((entry: JournalEntry) => (
                      <Card key={entry.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              {entry.title && (
                                <h3 className="font-semibold text-foreground mb-2">{entry.title}</h3>
                              )}
                              {entry.prompt && entry.prompt !== entry.title && (
                                <p className="text-sm text-primary mb-2 italic">Prompt: {entry.prompt}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(entry.createdAt || new Date())}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEntryMutation.mutate(entry.id)}
                                disabled={deleteEntryMutation.isPending}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}