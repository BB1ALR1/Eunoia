import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Target, 
  Lightbulb, 
  CheckSquare,
  FileText,
  User,
  Menu
} from "lucide-react";
import type { Session } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import type { CurrentPage } from "@/App";

interface SessionSummariesPageProps {
  onBack: () => void;
  onPageChange: (page: CurrentPage) => void;
  currentPage: CurrentPage;
  sessionId: number | null;
}

export default function SessionSummariesPage({ onBack }: SessionSummariesPageProps) {
  const { data: sessions = [], isLoading, error } = useQuery<Session[]>({
    queryKey: ["/api/sessions/summaries"],
  });

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-neutral p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">Session Summaries</h1>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-neutral p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">Session Summaries</h1>
          </div>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Failed to load session summaries. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedSessions = sessions.filter(session => session.summary);

  return (
    <div className="h-screen bg-gradient-neutral p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Session Summaries</h1>
        </div>

        {completedSessions.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Session Summaries Yet</h3>
              <p className="text-gray-500 mb-6">
                Complete a therapy session to see detailed summaries with key topics, insights, and recommendations.
              </p>
              <Button onClick={onBack} variant="outline">
                Start a New Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {completedSessions.map((session) => (
              <Card key={session.id} className="shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      Session {session.id}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Unknown date'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.duration ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : 'Unknown duration'}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {session.therapistPersonality || 'Unknown therapist'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Session Summary */}
                  {session.summary && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Session Overview
                      </h4>
                      <p className="text-muted-foreground leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {session.summary}
                      </p>
                    </div>
                  )}

                  {/* Key Topics */}
                  {session.keyTopics && Array.isArray(session.keyTopics) && session.keyTopics.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        Key Topics Discussed
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {session.keyTopics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CBT Techniques */}
                  {session.cbtTechniques && Array.isArray(session.cbtTechniques) && session.cbtTechniques.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        CBT Techniques Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {session.cbtTechniques.map((technique, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                            {technique}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Homework & Next Steps */}
                  {session.homework && Array.isArray(session.homework) && session.homework.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-orange-600" />
                        Homework & Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {session.homework.map((task, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckSquare className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Therapist Notes */}
                  {session.therapistNotes && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Therapist Notes
                      </h4>
                      <p className="text-muted-foreground bg-blue-50 p-4 rounded-lg border border-blue-200">
                        {session.therapistNotes}
                      </p>
                    </div>
                  )}

                  {/* Goals Progress */}
                  {session.selectedGoals && Array.isArray(session.selectedGoals) && session.selectedGoals.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Session Goals
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {session.selectedGoals.map((goal, index) => (
                          <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}